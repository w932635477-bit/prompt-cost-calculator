# Cron Generator (Tool #2) — Promotion Assets

## Status

- [x] Deployed: https://prompt-cost-calculator-ten.vercel.app/cron-generator/
- [x] 53/53 Playwright tests passed on production
- [x] Vercel Analytics integrated
- [x] Google verification file exists (googled153f40c40fdaec9.html)
- [x] Sitemap: 161 URLs submitted to robots.txt
- [ ] Submit sitemap to Google Search Console
- [ ] Enable Vercel Analytics in dashboard
- [ ] Reddit posts (SideProject, linux, devops, aws, webdev)
- [ ] Hacker News Show HN
- [ ] Product Hunt

## Hacker News

**Title**: Show HN: Free Cron Expression Generator with 151 Presets and 8 Languages
**URL**: https://prompt-cost-calculator-ten.vercel.app/cron-generator/

## Product Hunt

**Tagline**: Stop memorizing cron syntax. Visual builder + natural language + 151 presets.
**Topics**: Developer Tools, Open Source, Productivity
**First comment**: Why I built this — I was Googling "cron every 5 minutes" for the hundredth time and decided to just make the tool I wished existed.

## Google Search Console

1. Go to https://search.google.com/search-console
2. Property: https://prompt-cost-calculator-ten.vercel.app
3. Sitemaps → Submit: https://prompt-cost-calculator-ten.vercel.app/sitemap.xml
4. URL Inspection → Request indexing for:
   - /cron-generator/
   - /cron-generator/common-patterns/
   - /cron-generator/every-5-minutes/
   - /cron-generator/every-hour/
   - /cron-generator/every-monday/

## Vercel Analytics

1. Go to https://vercel.com/weileis-projects-3de5a59a/prompt-cost-calculator/settings/analytics
2. Click Enable

## Success Criteria (from design doc)

Week 1: Tool deployed + GSC verified + Reddit/HN/PH submitted
Week 2-4: Google indexes 50+ long-tail pages, GSC impressions > 0
Month 3: Daily organic visits > 50, 5+ keywords in top 10

## Reddit Post Script

Run: `node reddit-post.mjs <subreddit>`

Available subreddits: SideProject, linux, devops, aws, webdev
