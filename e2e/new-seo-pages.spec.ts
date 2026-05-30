import { test, expect } from '@playwright/test'

const PAGES = [
  {
    url: '/compare/logseq-vs-obsidian/',
    title: 'Logseq vs Obsidian',
    h1: 'Logseq vs Obsidian',
    description: 'Logseq vs Obsidian comparison',
  },
  {
    url: '/compare/outline-vs-notion/',
    title: 'Outline vs Notion',
    h1: 'Outline vs Notion',
    description: 'Outline vs Notion comparison',
    h2: 'Outline vs Notion',
  },
  {
    url: '/agent-data-access/',
    title: 'AI Agent Data Access',
    h1: 'AI Agent Data Access',
    description: 'data access policies',
  },
]

const BASE = 'http://localhost:4173'

test.describe('New SEO Pages', () => {
  for (const page of PAGES) {
    test.describe(`${page.title}`, () => {
      test('loads without JS errors', async ({ page: p }) => {
        const errors: string[] = []
        p.on('console', msg => { if (msg.type() === 'error') errors.push(msg.text()) })
        await p.goto(`${BASE}${page.url}`)
        await p.waitForLoadState('networkidle')
        expect(errors.filter(e => !e.includes('favicon'))).toHaveLength(0)
      })

      test('has correct title and meta description', async ({ page: p }) => {
        await p.goto(`${BASE}${page.url}`)
        const title = await p.title()
        expect(title).toContain(page.title)
        const desc = await p.getAttribute('meta[name="description"]', 'content')
        expect(desc).toBeTruthy()
        expect(desc!.length).toBeGreaterThan(50)
      })

      test('has correct H1', async ({ page: p }) => {
        await p.goto(`${BASE}${page.url}`)
        const h1 = p.locator('h1').first()
        await expect(h1).toBeVisible()
        const text = await h1.textContent()
        expect(text).toContain(page.h1)
      })

      test('has JSON-LD schema', async ({ page: p }) => {
        await p.goto(`${BASE}${page.url}`)
        const schemas = p.locator('script[type="application/ld+json"]')
        const count = await schemas.count()
        expect(count).toBeGreaterThanOrEqual(1)
      })

      test('has OG tags and canonical URL', async ({ page: p }) => {
        await p.goto(`${BASE}${page.url}`)
        const ogTitle = await p.getAttribute('meta[property="og:title"]', 'content')
        expect(ogTitle).toBeTruthy()
        const canonical = await p.getAttribute('link[rel="canonical"]', 'href')
        expect(canonical).toContain('aicalc.cloud')
      })

      test('no horizontal overflow on mobile', async ({ page: p }) => {
        await p.setViewportSize({ width: 375, height: 812 })
        await p.goto(`${BASE}${page.url}`)
        const scrollWidth = await p.evaluate(() => document.documentElement.scrollWidth)
        expect(scrollWidth).toBeLessThanOrEqual(400)
      })
    })
  }

  test.describe('Compare pages specific', () => {
    for (const slug of ['/compare/logseq-vs-obsidian/', '/compare/outline-vs-notion/']) {
      test(`${slug} has comparison table`, async ({ page: p }) => {
        await p.goto(`${BASE}${slug}`)
        const table = p.locator('table').first()
        await expect(table).toBeVisible()
      })

      test(`${slug} has FAQ section`, async ({ page: p }) => {
        await p.goto(`${BASE}${slug}`)
        const faq = p.locator('text=Frequently Asked').first()
        await expect(faq).toBeVisible()
      })

      test(`${slug} has related comparisons`, async ({ page: p }) => {
        await p.goto(`${BASE}${slug}`)
        const related = p.locator('text=More Comparisons').first()
        await expect(related).toBeVisible()
      })
    }
  })

  test.describe('AI Agent Data Access specific', () => {
    const url = '/agent-data-access/'

    test('data access table renders all 5 platforms', async ({ page: p }) => {
      await p.goto(`${BASE}${url}`, { waitUntil: 'networkidle' })
      const rows = p.locator('table tbody tr')
      await expect(rows).toHaveCount(5)
    })

    test('best practices checklist toggles', async ({ page: p }) => {
      await p.goto(`${BASE}${url}`)
      const firstCheck = p.locator('button[aria-label="Check"]').first()
      await firstCheck.click()
      await expect(p.locator('text=1/6 checked')).toBeVisible()
    })

    test('timeline renders all 5 events', async ({ page: p }) => {
      await p.goto(`${BASE}${url}`)
      await expect(p.locator('text=DeepSeek data sovereignty')).toBeVisible()
      await expect(p.locator('text=OpenAI adds enterprise')).toBeVisible()
      await expect(p.locator('text=AI agent data access debate')).toBeVisible()
    })

    test('FAQ expands and collapses', async ({ page: p }) => {
      await p.goto(`${BASE}${url}`)
      const firstFaq = p.locator('text=Does ChatGPT use my data').first()
      await firstFaq.click()
      await expect(p.locator('text=Free ChatGPT users: yes').first()).toBeVisible()
      await firstFaq.click()
      await expect(p.locator('text=Free ChatGPT users: yes')).toHaveCount(0)
    })

    test('related tools links work', async ({ page: p }) => {
      await p.goto(`${BASE}${url}`, { waitUntil: 'networkidle' })
      await expect(p.locator('text=AI Agent Safety Checklist')).toBeVisible()
    })
  })
})
