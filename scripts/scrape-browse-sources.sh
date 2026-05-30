#!/bin/bash
# scrape-browse-sources.sh — 用 gstack browse 采集需要 JS 渲染的源（IH + Google Trends）
#
# 产出: ../docs/daily-scout/raw/browse-YYYY-MM-DD.json
# 用法: bash scripts/scrape-browse-sources.sh

set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
OUT_DIR="$ROOT/../docs/daily-scout/raw"
DATE=$(date +%Y-%m-%d)
OUT_FILE="$OUT_DIR/browse-$DATE.json"

B=""
_REPO_ROOT=$(git -C "$ROOT" rev-parse --show-toplevel 2>/dev/null || true)
[ -n "$_REPO_ROOT" ] && [ -x "$_REPO_ROOT/.claude/skills/gstack/browse/dist/browse" ] && B="$_REPO_ROOT/.claude/skills/gstack/browse/dist/browse"
[ -z "$B" ] && B="$HOME/.claude/skills/gstack/browse/dist/browse"
if [ ! -x "$B" ]; then
  echo '{"error":"browse binary not found"}' > "$OUT_FILE"
  echo "ERROR: browse not found" >&2; exit 1
fi

export NO_PROXY='*' no_proxy='*'
mkdir -p "$OUT_DIR"

echo "  scrape-browse: collecting IH + Google Trends..."

# ---- Indie Hackers ----
$B restart 2>/dev/null || true; sleep 1
$B goto "https://www.indiehackers.com/" 2>&1 | tail -1; sleep 3

# 用 body.innerText 获取纯文本，存到临时文件，python 里解析
IH_TMP=$(mktemp)
$B js "document.body.innerText" > "$IH_TMP"

# ---- Google Trends (过去 7 天) ----
# GT innerText 格式: 标题 → 体积(如"1M+") → "arrow_upward" → 百分比(如"200%")
$B goto "https://trends.google.com/trending?geo=US&hours=168" 2>&1 | tail -1; sleep 3

# 在浏览器里用 JS 提取趋势数据
# 用 $B js 内联，单引号避免 shell 解释 &&/||
# String.fromCharCode(10) 避免 \n 转义问题
GT_TMP=$(mktemp)
$B js '(function(){var NL=String.fromCharCode(10);var lines=document.body.innerText.split(NL);var out=[];for(var j=0;j<lines.length-3;j++){var v=lines[j+1].trim();var a=lines[j+2].trim();var p=lines[j+3].trim();if(/^[0-9,.]+[KMG]?[+]?/.test(v)&&a==="arrow_upward"&&/^[0-9]+%/.test(p)){var n=lines[j].trim();if(n.length>2&&n.length<60)out.push(n+"|"+v+"|"+parseInt(p));}};return out.join(NL);})()' > "$GT_TMP"

# ---- 用 python 统一解析和输出 ----
python3 - "$IH_TMP" "$GT_TMP" "$DATE" "$OUT_FILE" << 'PYEOF'
import json, re, sys, os
from datetime import datetime, timezone

_, ih_tmp, gt_tmp, date, out_file = sys.argv

with open(ih_tmp) as f:
    ih_text = f.read()
with open(gt_tmp) as f:
    gt_text = f.read()

print(f'  DEBUG ih: {len(ih_text)} chars, gt: {len(gt_text)} chars', file=sys.stderr)

# ---- 解析 IH ----
# 主 feed 格式: 标题 → 作者 → 数字(upvotes) → 数字(comments)
# Featured 格式: 标题 → 作者 → 数字 → "upvotes" → 数字 → "comments"
ih_lines = [l.strip() for l in ih_text.split('\n') if l.strip()]
ih_posts = []
i = 0
while i < len(ih_lines) - 3:
    title = ih_lines[i]
    author = ih_lines[i+1] if i+1 < len(ih_lines) else ''
    # 检查 author 是否像用户名（短、小写字母数字下划线）
    if not re.match(r'^[a-zA-Z][a-zA-Z0-9_]{1,24}$', author):
        i += 1; continue
    # 检查第3行是否为数字
    if i+2 < len(ih_lines) and re.match(r'^\d+$', ih_lines[i+2]):
        upvotes = int(ih_lines[i+2])
        # 检查是否有 "upvotes" 标签（Featured 格式）
        if i+3 < len(ih_lines) and ih_lines[i+3] == 'upvotes' and i+4 < len(ih_lines) and re.match(r'^\d+$', ih_lines[i+4]):
            comments = int(ih_lines[i+4])
            i += 6
        elif i+3 < len(ih_lines) and re.match(r'^\d+$', ih_lines[i+3]):
            comments = int(ih_lines[i+3])
            i += 4
        else:
            i += 1; continue
        if upvotes > 0 or comments > 0:
            money = bool(re.search(r'\$\d|MRR|revenue|pricing|income|profit|pivot|shutdown|closed', title, re.I))
            ih_posts.append({'title': title, 'author': author, 'upvotes': upvotes, 'comments': comments, 'money': money})
    else:
        i += 1

# ---- 解析 GT（JS 返回的是 "name|vol|pct" 格式的多行文本）----
gt_trends = []
for line in gt_text.strip().split('\n'):
    line = line.strip()
    if '|' not in line:
        continue
    parts = line.split('|')
    if len(parts) == 3:
        name, vol, pct_str = parts
        try:
            pct = int(pct_str)
        except ValueError:
            pct = 0
        gt_trends.append({'title': name, 'volume': vol, 'spike': pct})

# ---- 生成信号 ----
signals = []
for p in ih_posts:
    title = p['title']
    signals.append({
        'source': 'IndieHackers', 'category': 'launch',
        'title': title, 'url': '',
        'metric': p['upvotes'], 'metricLabel': 'IH upvotes',
        'snippet': f"by {p['author']} · {p['comments']} comments",
        'money': p['money'],
    })
for t in gt_trends:
    title = t['title']
    spike = t['spike']
    signals.append({
        'source': 'GoogleTrends', 'category': 'trend',
        'title': title,
        'url': f'https://trends.google.com/trends/explore?q={title}&geo=US',
        'metric': spike, 'metricLabel': 'GT search spike %',
        'snippet': f"{t['volume']} searches, +{spike}% (7d)",
        'money': bool(re.search(r'\$|pricing|cost|saas|tool|api|software|subscription|ai |claude|gpt|cursor', title, re.I)),
    })

data = {
    'date': date,
    'fetchedAt': datetime.now(timezone.utc).strftime('%Y-%m-%dT%H:%M:%SZ'),
    'IndieHackers': len(ih_posts),
    'GoogleTrends': len(gt_trends),
    'signals': signals,
}
with open(out_file, 'w') as f:
    json.dump(data, f, ensure_ascii=False, indent=2)

print(f'    IH: {len(ih_posts)} posts')
print(f'    GT: {len(gt_trends)} trends')
print(f'  → {len(signals)} browse signals saved to {out_file}')
PYEOF

rm -f "$IH_TMP" "$GT_TMP" 2>/dev/null
$B stop 2>/dev/null || true
