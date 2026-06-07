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
    title: 'LLM API Price Comparison (2026) — GPT-5.5 vs Claude 3.7 vs Gemini 2.0 vs DeepSeek V4 | Side-by-Side Costs',
    h1: 'LLM Cost Comparison',
    description: 'Compare LLM API pricing side by side across 19 models in 2026. GPT-5.5 costs $5/1M input, Claude 3.7 Sonnet is $3/1M, Gemini 2.0 Flash is $0.10/1M, and DeepSeek V4 Flash is the cheapest at $0.14/1M. See full output pricing, context window limits, cached input discounts, and provider comparison table.',
    keywords: ['llm price comparison', 'llm api pricing comparison', 'gpt vs claude vs gemini pricing', 'llm cost comparison 2026', 'cheapest llm api', 'best value llm 2026', 'compare llm pricing', 'gpt vs deepseek pricing', 'claude vs gemini cost', 'openai vs anthropic pricing', 'llm api cost comparison', 'side by side llm pricing'],
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
