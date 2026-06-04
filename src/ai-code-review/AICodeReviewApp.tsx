import { useState, useMemo, useCallback } from 'react'
import { GlobalNav } from '../components/GlobalNav'
import { RelatedTools } from '../components/RelatedTools'

type Severity = 'critical' | 'warning' | 'info'

interface CheckItem {
  id: string
  label: string
  severity: Severity
  hint: string
}

interface Category {
  name: string
  icon: React.ReactNode
  items: CheckItem[]
}

const CATEGORIES: Category[] = [
  {
    name: 'Correctness',
    icon: <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
    items: [
      { id: 'c1', label: 'Does the code actually do what the prompt/request asked for?', severity: 'critical', hint: 'AI often solves an adjacent problem instead of the exact request.' },
      { id: 'c2', label: 'Does it handle empty inputs, nulls, and zero values?', severity: 'critical', hint: 'AI skips boundary conditions more often than humans.' },
      { id: 'c3', label: 'Are edge cases covered (max length, special chars, concurrent access)?', severity: 'warning', hint: 'Check paths that humans would instinctively guard.' },
      { id: 'c4', label: 'Does the diff contain only changes related to the task?', severity: 'warning', hint: 'AI sometimes refactors adjacent code unprompted.' },
    ],
  },
  {
    name: 'Security',
    icon: <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>,
    items: [
      { id: 's1', label: 'No SQL injection, XSS, or command injection vectors?', severity: 'critical', hint: 'AI concatenates strings into queries far more often than it should.' },
      { id: 's2', label: 'No hardcoded secrets, API keys, or credentials?', severity: 'critical', hint: 'AI sometimes embeds example keys from its training data.' },
      { id: 's3', label: 'Auth and permission checks present where needed?', severity: 'critical', hint: 'AI tends to skip auth middleware in new endpoints.' },
      { id: 's4', label: 'User input validated and sanitized before use?', severity: 'warning', hint: 'Trust nothing from the client, even if AI added "basic validation".' },
    ],
  },
  {
    name: 'Performance',
    icon: <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>,
    items: [
      { id: 'p1', label: 'No N+1 queries or unnecessary loops?', severity: 'warning', hint: 'AI writes sequential loops where a batched operation would work.' },
      { id: 'p2', label: 'No unnecessary re-renders, re-fetches, or recomputes?', severity: 'warning', hint: 'Watch for useEffect missing deps or redundant state updates.' },
      { id: 'p3', label: 'Large data handled efficiently (pagination, streaming, lazy load)?', severity: 'warning', hint: 'AI defaults to loading everything into memory.' },
    ],
  },
  {
    name: 'Error Handling',
    icon: <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>,
    items: [
      { id: 'e1', label: 'Are errors caught and handled, not silently swallowed?', severity: 'critical', hint: 'AI loves wrapping code in try/catch with empty catch blocks.' },
      { id: 'e2', label: 'Do error messages help debugging (not just "something went wrong")?', severity: 'warning', hint: 'Generic error messages hide the real problem.' },
      { id: 'e3', label: 'Are external API failures handled (timeout, rate limit, 5xx)?', severity: 'warning', hint: 'AI assumes external services always respond correctly.' },
    ],
  },
  {
    name: 'Testing',
    icon: <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" /></svg>,
    items: [
      { id: 't1', label: 'Are there tests for the new behavior?', severity: 'critical', hint: 'AI rarely writes tests unless explicitly asked.' },
      { id: 't2', label: 'Do tests cover failure paths, not just the happy path?', severity: 'warning', hint: 'AI tests what works, not what breaks.' },
      { id: 't3', label: 'Are mocks testing behavior, not implementation details?', severity: 'warning', hint: 'AI mocks internal function calls instead of testing outputs.' },
      { id: 't4', label: 'No flaky test patterns (timers, order-dependent, shared state)?', severity: 'info', hint: 'AI sometimes generates tests that pass in isolation but fail in CI.' },
    ],
  },
  {
    name: 'Dependencies',
    icon: <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" /></svg>,
    items: [
      { id: 'd1', label: 'No unnecessary new dependencies introduced?', severity: 'warning', hint: 'AI adds packages for problems solvable in 5 lines of code.' },
      { id: 'd2', label: 'New dependencies are well-maintained and not abandoned?', severity: 'warning', hint: 'Check npm/GitHub — AI sometimes picks popular-but-dead packages.' },
      { id: 'd3', label: 'No duplicate functionality with existing dependencies?', severity: 'info', hint: 'AI might import lodash when you already have a utility function.' },
    ],
  },
  {
    name: 'Architecture',
    icon: <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>,
    items: [
      { id: 'a1', label: 'Does the change fit existing patterns and conventions?', severity: 'warning', hint: 'AI generates code in its own style, ignoring your project conventions.' },
      { id: 'a2', label: 'No over-engineering or premature abstraction?', severity: 'warning', hint: 'AI creates interfaces, factories, and strategy patterns for single-use code.' },
      { id: 'a3', label: 'Naming is clear and consistent with the codebase?', severity: 'info', hint: 'AI picks generic names (data, result, item) over domain-specific ones.' },
      { id: 'a4', label: 'Dead code, unused imports, and commented-out blocks removed?', severity: 'info', hint: 'AI leaves behind commented alternatives and unused imports from exploration.' },
    ],
  },
]

const SEVERITY_LABELS: Record<Severity, { label: string; color: string; bg: string }> = {
  critical: { label: 'Must pass', color: 'text-[#ff3b30]', bg: 'bg-[#ff3b30]/10' },
  warning: { label: 'Should pass', color: 'text-[#ff9f0a]', bg: 'bg-[#ff9f0a]/10' },
  info: { label: 'Nice to have', color: 'text-[#0071E3]', bg: 'bg-[#0071E3]/10' },
}

export default function AICodeReviewApp() {
  const [checked, setChecked] = useState<Set<string>>(new Set())
  const [copied, setCopied] = useState(false)

  const toggle = useCallback((id: string) => {
    setChecked(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }, [])

  const resetAll = () => {
    setChecked(new Set())
  }

  const checkAll = () => {
    const allIds = CATEGORIES.flatMap(c => c.items.map(i => i.id))
    setChecked(new Set(allIds))
  }

  const stats = useMemo(() => {
    let checkedCritical = 0, totalCritical = 0
    let checkedWarning = 0, totalWarning = 0
    let checkedInfo = 0, totalInfo = 0

    for (const cat of CATEGORIES) {
      for (const item of cat.items) {
        const isChecked = checked.has(item.id)
        if (item.severity === 'critical') { totalCritical++; if (isChecked) checkedCritical++ }
        else if (item.severity === 'warning') { totalWarning++; if (isChecked) checkedWarning++ }
        else { totalInfo++; if (isChecked) checkedInfo++ }
      }
    }

    return {
      checkedCritical, totalCritical,
      checkedWarning, totalWarning,
      checkedInfo, totalInfo,
      total: totalCritical + totalWarning + totalInfo,
      checked: checkedCritical + checkedWarning + checkedInfo,
    }
  }, [checked])

  const score = stats.total > 0 ? Math.round((stats.checked / stats.total) * 100) : 0

  const copyReport = async () => {
    const lines = ['AI Code Review Checklist Report', '=' .repeat(35), '']
    lines.push(`Score: ${score}% (${stats.checked}/${stats.total} checks passed)`)
    lines.push(`Critical: ${stats.checkedCritical}/${stats.totalCritical} | Warning: ${stats.checkedWarning}/${stats.totalWarning} | Info: ${stats.checkedInfo}/${stats.totalInfo}`)
    lines.push('')

    const verdict = stats.checkedCritical === stats.totalCritical
      ? 'PASS — All critical checks passed.'
      : `FAIL — ${stats.totalCritical - stats.checkedCritical} critical check(s) missing.`
    lines.push(`Verdict: ${verdict}`)
    lines.push('')

    for (const cat of CATEGORIES) {
      lines.push(`## ${cat.name}`)
      for (const item of cat.items) {
        const mark = checked.has(item.id) ? 'x' : ' '
        lines.push(`  [${mark}] ${item.label}`)
      }
      lines.push('')
    }

    lines.push('Generated by aicalc.cloud/ai-code-review/')

    try {
      await navigator.clipboard.writeText(lines.join('\n'))
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    } catch {}
  }

  const verdictColor = stats.checkedCritical === stats.totalCritical
    ? 'text-[#30d158]'
    : 'text-[#ff3b30]'

  return (
    <div className="min-h-screen bg-[#f5f5f7] text-[#1d1d1f]">
      <GlobalNav current="/ai-code-review/" />

      {/* Hero */}
      <header className="max-w-[1080px] mx-auto px-4 pt-12 pb-4 text-center">
        <h1 className="text-4xl sm:text-5xl font-semibold tracking-tight mb-3">
          AI Code Review Checklist
        </h1>
        <p className="text-lg text-[#86868b] max-w-2xl mx-auto">
          25-point interactive checklist for reviewing AI-generated pull requests.
          Check each item as you verify it, then copy the report into your PR.
        </p>

        {/* Score bar */}
        <div role="status" aria-live="polite" className="mt-6 inline-flex items-center gap-4 bg-white px-5 py-3 rounded-2xl shadow-sm">
          <div className="text-3xl font-bold tabular-nums">{score}%</div>
          <div className="w-px h-8 bg-[#e8e8ed]" />
          <div className="text-left text-xs space-y-0.5">
            <div>
              <span className={stats.checkedCritical === stats.totalCritical ? 'text-[#30d158]' : 'text-[#ff3b30]'}>{stats.checkedCritical}/{stats.totalCritical}</span>
              <span className="text-[#86868b]"> critical</span>
            </div>
            <div>
              <span className="text-[#1d1d1f]">{stats.checkedWarning}/{stats.totalWarning}</span>
              <span className="text-[#86868b]"> warning</span>
            </div>
            <div>
              <span className="text-[#1d1d1f]">{stats.checkedInfo}/{stats.totalInfo}</span>
              <span className="text-[#86868b]"> info</span>
            </div>
          </div>
          <div className="w-px h-8 bg-[#e8e8ed]" />
          <div className={`text-sm font-medium ${verdictColor}`}>
            {stats.checkedCritical === stats.totalCritical ? 'All critical pass' : 'Critical missing'}
          </div>
        </div>
      </header>

      <main className="max-w-[1080px] mx-auto px-4 pb-16">
        {/* Actions */}
        <div className="flex items-center justify-center gap-3 mb-6">
          <button
            type="button"
            onClick={checkAll}
            className="text-xs px-4 py-2 bg-[#0071E3] text-white rounded-lg hover:bg-[#0077ED] transition-colors font-medium"
          >
            Check All
          </button>
          <button
            type="button"
            onClick={resetAll}
            className="text-xs px-4 py-2 bg-white text-[#1d1d1f] rounded-lg hover:bg-gray-100 transition-colors font-medium border border-[#d2d2d7]"
          >
            Reset
          </button>
          <button
            type="button"
            onClick={copyReport}
            className="text-xs px-4 py-2 bg-[#0071E3] text-white rounded-lg hover:bg-[#0077ED] transition-colors font-medium"
          >
            {copied ? '✓ Copied Report' : 'Copy Report'}
          </button>
        </div>

        {/* Checklist categories */}
        {CATEGORIES.map(cat => (
          <CategorySection
            key={cat.name}
            category={cat}
            checked={checked}
            onToggle={toggle}
          />
        ))}

        {/* Verdict card */}
        <section className="mt-4 bg-white rounded-2xl p-5 shadow-sm" data-testid="verdict-card">
          <h2 className="text-base font-semibold mb-3">Verdict</h2>
          <div className="grid sm:grid-cols-3 gap-4 text-sm">
            <VerdictBlock
              label="Critical"
              checked={stats.checkedCritical}
              total={stats.totalCritical}
              pass={stats.checkedCritical === stats.totalCritical}
            />
            <VerdictBlock
              label="Warning"
              checked={stats.checkedWarning}
              total={stats.totalWarning}
              pass={stats.checkedWarning === stats.totalWarning}
            />
            <VerdictBlock
              label="Info"
              checked={stats.checkedInfo}
              total={stats.totalInfo}
              pass={stats.checkedInfo === stats.totalInfo}
            />
          </div>
          <p className="text-xs text-[#86868b] mt-3">
            A passing review requires all critical items checked. Warning items depend on your team's
            risk tolerance. Copy the report above to paste into your PR comment.
          </p>
        </section>

        {/* Why this checklist */}
        <section className="mt-4 bg-white rounded-2xl p-5 shadow-sm">
          <h2 className="text-base font-semibold mb-3">Why AI code needs a different checklist</h2>
          <div className="text-sm text-[#424245] leading-relaxed space-y-3">
            <p>
              The "Using AI to write better code more slowly" discussion on Hacker News (417 comments)
              and the DEV Community thread "Every Developer Is Lying About Something" (143 comments)
              surfaced a pattern: <strong>AI-generated code fails in different ways than human code</strong>.
            </p>
            <p>
              Humans forget edge cases because they're lazy. AI skips them because it's
              predicting the next token, not reasoning about runtime behavior. Humans leave debug
              logs. AI leaves entire alternative implementations commented out. Humans write
              too few tests. AI writes tests that pass but don't test the right thing.
            </p>
            <p>
              This checklist targets the failure modes specific to AI-generated diffs: hallucinated
              APIs, unnecessary dependencies, skipped auth checks, happy-path-only tests, and code
              that looks correct but breaks on real data.
            </p>
          </div>
        </section>

        {/* Cross-link */}
        <section className="mt-4 bg-white rounded-2xl p-5 shadow-sm" data-testid="cross-links">
          <h2 className="text-base font-semibold mb-3">More AI developer tools</h2>
          <div className="grid sm:grid-cols-3 gap-3">
            <a
              href="/pii-redactor/"
              className="block p-4 rounded-xl border border-[#e8e8ed] hover:border-[#0071E3] hover:bg-[#0071E3]/5 transition-colors"
            >
              <div className="font-medium mb-0.5 text-sm">PII Redactor →</div>
              <div className="text-xs text-[#86868b]">Strip secrets from prompts before sending to LLMs</div>
            </a>
            <a
              href="/prompt-cache-calculator/"
              className="block p-4 rounded-xl border border-[#e8e8ed] hover:border-[#0071E3] hover:bg-[#0071E3]/5 transition-colors"
            >
              <div className="font-medium mb-0.5 text-sm">Cache Calculator →</div>
              <div className="text-xs text-[#86868b]">Compare prompt caching cost across vendors</div>
            </a>
            <a
              href="/mcp-servers/"
              className="block p-4 rounded-xl border border-[#e8e8ed] hover:border-[#0071E3] hover:bg-[#0071E3]/5 transition-colors"
            >
              <div className="font-medium mb-0.5 text-sm">MCP Server Directory →</div>
              <div className="text-xs text-[#86868b]">Curated MCP servers for Claude / Cursor</div>
            </a>
          </div>
        </section>

        {/* FAQ */}
        <section className="mt-4 bg-white rounded-2xl p-5 shadow-sm">
          <h2 className="text-base font-semibold mb-4">FAQ</h2>
          <Faq q="Why does AI-generated code need different review than human-written code?">
            AI assistants tend to skip edge cases, hallucinate API usage, add unnecessary
            dependencies, and produce code that looks correct but contains subtle logic errors. The
            code often works for the happy path but fails silently on boundary conditions. A
            structured checklist catches these patterns consistently.
          </Faq>
          <Faq q="How many items should I check before approving a PR?">
            Critical items (red) should all pass. Warning items (yellow) depend on your team's risk
            tolerance. A passing score is typically 80%+ with all critical items checked. The "Copy
            Report" button generates a summary you can paste directly into the PR comment.
          </Faq>
          <Faq q="Should I use this for every AI-assisted PR?">
            Yes, especially for PRs where AI wrote more than 30% of the diff. Small AI suggestions
            (a rename, a bug fix) need fewer checks. Large AI-generated features deserve the full
            checklist. When in doubt, run through the critical items at minimum.
          </Faq>
          <Faq q="What's the verdict based on?">
            All critical items must pass for a "PASS" verdict. This reflects the reality that
            AI-generated code has a higher base rate of security and correctness issues. If a
            critical item can't be verified, the PR needs more work before merge.
          </Faq>
          <Faq q="Is this based on research?">
            The checklist is based on analysis of common AI coding failure patterns documented in
            Hacker News discussions (417+ comments on "Using AI to write better code more slowly"),
            DEV Community reports on developer honesty, and production incident patterns from teams
            using Copilot, Cursor, and Claude for code generation.
          </Faq>
        </section>
      </main>

      <footer className="border-t border-[#e8e8ed] py-8 mt-8">
        <div className="max-w-[1080px] mx-auto px-4 text-center text-xs text-[#86868b]">
          <p>Free, browser-only, no tracking. Based on real AI coding failure patterns.</p>
        </div>
      </footer>
      <RelatedTools currentPath="/ai-code-review/" />
    </div>
  )
}

function CategorySection({
  category,
  checked,
  onToggle,
}: {
  category: Category
  checked: Set<string>
  onToggle: (id: string) => void
}) {
  const catChecked = category.items.filter(i => checked.has(i.id)).length
  const catTotal = category.items.length

  return (
    <section className="mt-4 bg-white rounded-2xl p-5 shadow-sm">
      <div className="flex items-center gap-3 mb-3">
        <span className="text-[#0071E3]">{category.icon}</span>
        <h2 className="text-base font-semibold">{category.name}</h2>
        <span className="text-xs text-[#86868b]">{catChecked}/{catTotal}</span>
      </div>

      <ul className="space-y-1 list-none p-0 m-0" role="list">
        {category.items.map(item => {
          const isChecked = checked.has(item.id)
          const sev = SEVERITY_LABELS[item.severity]
          return (
            <li
              key={item.id}
              className="flex items-start gap-3 p-3 rounded-xl hover:bg-[#f5f5f7] transition-colors"
            >
              <button
                type="button"
                role="checkbox"
                aria-checked={isChecked}
                aria-label={item.label}
                onClick={() => onToggle(item.id)}
                className={`mt-0.5 w-[22px] h-[22px] rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all ${
                  isChecked
                    ? 'bg-[#0071E3] border-[#0071E3] scale-100'
                    : 'border-[#d2d2d7] hover:border-[#0071E3]'
                }`}
                data-testid={`check-${item.id}`}
              >
                {isChecked && (
                  <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                )}
              </button>
              <div className="flex-1 min-w-0">
                <div className="text-sm leading-snug">{item.label}</div>
                <div className="text-xs text-[#86868b] mt-1 leading-relaxed">{item.hint}</div>
              </div>
              <span className={`text-[11px] px-2 py-0.5 rounded-full font-medium whitespace-nowrap ${sev.bg} ${sev.color}`}>
                {sev.label}
              </span>
            </li>
          )
        })}
      </ul>
    </section>
  )
}

function VerdictBlock({ label, checked, total, pass }: {
  label: string
  checked: number
  total: number
  pass: boolean
}) {
  return (
    <div className={`p-3 rounded-xl ${pass ? 'bg-[#30d158]/10' : 'bg-[#f5f5f7]'}`}>
      <div className={`text-lg font-bold tabular-nums ${pass ? 'text-[#30d158]' : 'text-[#1d1d1f]'}`}>
        {checked}/{total}
      </div>
      <div className="text-xs text-[#86868b]">{label}</div>
      <div className={`text-xs font-medium mt-0.5 ${pass ? 'text-[#30d158]' : 'text-[#ff9f0a]'}`}>
        {pass ? 'All pass' : `${total - checked} remaining`}
      </div>
    </div>
  )
}

function Faq({ q, children }: { q: string; children: React.ReactNode }) {
  return (
    <details className="border-b border-[#e8e8ed] last:border-0 py-3">
      <summary className="font-medium cursor-pointer text-[#1d1d1f] hover:text-[#0071E3] transition-colors text-sm">
        {q}
      </summary>
      <p className="mt-2 text-sm text-[#424245] leading-relaxed">{children}</p>
    </details>
  )
}
