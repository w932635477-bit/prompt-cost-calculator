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
    title: 'LLM API Cost Calculator (2026) — Estimate GPT, Claude & Gemini Spending',
    h1: 'LLM Cost Calculator',
    description: 'Free LLM API cost calculator for 2026. Estimate monthly spending across 20+ models including GPT-5.5, Claude Opus 4.8, Gemini 2.0 Flash, and DeepSeek V4. Input your token volume, calls per day, and cache hit rate to get an instant monthly cost breakdown. Compare costs across models side by side.',
    keywords: ['llm cost calculator', 'ai api cost calculator', 'chatgpt api calculator', 'openai cost calculator', 'llm api cost estimator', 'gpt cost calculator', 'claude cost calculator', 'monthly llm cost', 'llm pricing calculator', 'token cost estimator', 'ai cost per month', 'llm api pricing calculator'],
  },
  {
    slug: 'llm-cost-comparison',
    pageType: 'comparison',
    title: 'LLM Cost Comparison — GPT vs Claude vs Gemini vs DeepSeek',
    h1: 'LLM Cost Comparison',
    description: 'Compare LLM API costs across 5 providers and 19 models. Side-by-side pricing for GPT-5.5, Claude 3.7 Sonnet, Gemini 2.0 Flash, DeepSeek V4, and more.',
    keywords: ['llm cost comparison', 'gpt vs claude pricing', 'gpt vs gemini cost', 'llm pricing comparison', 'cheapest llm api', 'best value llm'],
  },
  {
    slug: 'llm-cost-optimization',
    pageType: 'optimization',
    title: 'LLM Cost Optimization — 7 Ways to Cut AI API Spending 60%',
    h1: 'LLM Cost Optimization',
    description: 'Reduce your LLM API costs by up to 60%. Strategies: prompt caching, model routing, token reduction, batch processing, and provider negotiation. With real numbers.',
    keywords: ['llm cost optimization', 'reduce ai costs', 'llm cost reduction', 'prompt caching savings', 'ai api savings', 'cheaper llm usage'],
  },
]
