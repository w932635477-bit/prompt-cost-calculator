// src/llm-pricing/seo/cost-seo-data.ts
// Long-tail SEO pages for LLM cost topics (not model-specific).

export interface CostSeoPage {
  slug: string
  pageType: 'calculator' | 'comparison' | 'optimization'
  title: string
  h1: string
  description: string
  keywords: string[]
}

export const COST_SEO_PAGES: CostSeoPage[] = [
  {
    slug: 'llm-cost-calculator',
    pageType: 'calculator',
    title: 'LLM Cost Calculator (2026) — Estimate Monthly API Costs for GPT, Claude & Gemini',
    h1: 'LLM Cost Calculator',
    description: 'Free LLM cost calculator. Estimate monthly API spending for GPT-4o, Claude 3.7, Gemini 2.0, and 15+ models. Input tokens, output tokens, calls per day, cache hit rate.',
    keywords: ['llm cost calculator', 'ai cost calculator', 'llm api cost estimator', 'gpt cost calculator', 'claude cost calculator', 'monthly llm cost'],
  },
  {
    slug: 'llm-cost-comparison',
    pageType: 'comparison',
    title: 'LLM Cost Comparison (2026) — GPT vs Claude vs Gemini vs DeepSeek Pricing',
    h1: 'LLM Cost Comparison',
    description: 'Compare LLM API costs across 5 providers and 19 models. Side-by-side pricing for GPT-5.5, Claude 3.7 Sonnet, Gemini 2.0 Flash, DeepSeek V4, and more.',
    keywords: ['llm cost comparison', 'gpt vs claude pricing', 'gpt vs gemini cost', 'llm pricing comparison', 'cheapest llm api', 'best value llm'],
  },
  {
    slug: 'llm-cost-optimization',
    pageType: 'optimization',
    title: 'LLM Cost Optimization (2026) — 7 Strategies to Cut AI API Spending by 60%',
    h1: 'LLM Cost Optimization',
    description: 'Reduce your LLM API costs by up to 60%. Strategies: prompt caching, model routing, token reduction, batch processing, and provider negotiation. With real numbers.',
    keywords: ['llm cost optimization', 'reduce ai costs', 'llm cost reduction', 'prompt caching savings', 'ai api savings', 'cheaper llm usage'],
  },
]
