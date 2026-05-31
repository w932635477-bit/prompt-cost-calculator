// src/llm-pricing/seo/pricing-seo-data.ts
// Long-tail SEO pages for individual model pricing lookups.

export interface PricingSeoPage {
  slug: string
  modelId: string
  title: string
  h1: string
  description: string
  keywords: string[]
}

export const PRICING_SEO_PAGES: PricingSeoPage[] = [
  // OpenAI
  {
    slug: 'gpt-5-5-pricing',
    modelId: 'gpt-5.5',
    title: 'GPT-5.5 API Pricing (2026) — Cost Per 1M Tokens',
    h1: 'GPT-5.5 API Pricing',
    description: 'GPT-5.5 pricing: $5.00/1M input tokens, $30.00/1M output tokens, $2.50/1M cached tokens. Compare GPT-5.5 costs vs other LLMs.',
    keywords: ['gpt-5.5 pricing', 'gpt-5.5 cost', 'gpt-5.5 api price', 'gpt-5.5 per million tokens'],
  },
  {
    slug: 'gpt-5-4-pricing',
    modelId: 'gpt-5.4',
    title: 'GPT-5.4 API Pricing (2026) — Cost Per 1M Tokens',
    h1: 'GPT-5.4 API Pricing',
    description: 'GPT-5.4 pricing: $2.50/1M input tokens, $15.00/1M output tokens, $1.25/1M cached tokens. Full cost breakdown and comparison.',
    keywords: ['gpt-5.4 pricing', 'gpt-5.4 cost', 'gpt-5.4 api price', 'gpt-5.4 per million tokens'],
  },
  {
    slug: 'gpt-5-4-mini-pricing',
    modelId: 'gpt-5.4-mini',
    title: 'GPT-5.4 Mini API Pricing (2026) — Cost Per 1M Tokens',
    h1: 'GPT-5.4 Mini API Pricing',
    description: 'GPT-5.4 Mini pricing: $0.75/1M input, $4.50/1M output, $0.375/1M cached. The cheapest OpenAI model for production.',
    keywords: ['gpt-5.4 mini pricing', 'gpt-5.4 mini cost', 'gpt-5.4 mini api price'],
  },
  {
    slug: 'gpt-4o-pricing',
    modelId: 'gpt-4o',
    title: 'GPT-4o API Pricing (2026) — Cost Per 1M Tokens',
    h1: 'GPT-4o API Pricing',
    description: 'GPT-4o pricing: $2.50/1M input tokens, $10.00/1M output tokens, $1.25/1M cached. Compare GPT-4o costs for your workload.',
    keywords: ['gpt-4o pricing', 'gpt-4o cost', 'gpt-4o api price', 'gpt-4o per million tokens'],
  },
  {
    slug: 'gpt-4o-mini-pricing',
    modelId: 'gpt-4o-mini',
    title: 'GPT-4o Mini API Pricing (2026) — Cost Per 1M Tokens',
    h1: 'GPT-4o Mini API Pricing',
    description: 'GPT-4o Mini pricing: $0.15/1M input, $0.60/1M output, $0.075/1M cached. Budget-friendly OpenAI model for high-volume tasks.',
    keywords: ['gpt-4o mini pricing', 'gpt-4o mini cost', 'gpt-4o mini api price'],
  },
  {
    slug: 'o3-pricing',
    modelId: 'o3',
    title: 'OpenAI o3 API Pricing (2026) — Cost Per 1M Tokens',
    h1: 'OpenAI o3 API Pricing',
    description: 'OpenAI o3 pricing: $2.00/1M input, $8.00/1M output, $1.00/1M cached. Reasoning model cost breakdown.',
    keywords: ['o3 pricing', 'openai o3 cost', 'o3 api price', 'openai reasoning model pricing'],
  },
  {
    slug: 'o4-mini-pricing',
    modelId: 'o4-mini',
    title: 'OpenAI o4-mini API Pricing (2026) — Cost Per 1M Tokens',
    h1: 'OpenAI o4-mini API Pricing',
    description: 'OpenAI o4-mini pricing: $1.10/1M input, $4.40/1M output, $0.55/1M cached. Affordable reasoning model.',
    keywords: ['o4-mini pricing', 'openai o4-mini cost', 'o4-mini api price'],
  },
  // Anthropic
  {
    slug: 'claude-3-7-sonnet-pricing',
    modelId: 'claude-3-7-sonnet-20250219',
    title: 'Claude 3.7 Sonnet API Pricing (2026) — Cost Per 1M Tokens',
    h1: 'Claude 3.7 Sonnet API Pricing',
    description: 'Claude 3.7 Sonnet pricing: $3.00/1M input, $15.00/1M output, $0.30/1M cached. Anthropic flagship model cost analysis.',
    keywords: ['claude 3.7 sonnet pricing', 'claude 3.7 sonnet cost', 'anthropic claude pricing'],
  },
  {
    slug: 'claude-3-5-haiku-pricing',
    modelId: 'claude-3-5-haiku-20241022',
    title: 'Claude 3.5 Haiku API Pricing (2026) — Cost Per 1M Tokens',
    h1: 'Claude 3.5 Haiku API Pricing',
    description: 'Claude 3.5 Haiku pricing: $0.80/1M input, $4.00/1M output, $0.08/1M cached. Cheapest Claude model for production.',
    keywords: ['claude 3.5 haiku pricing', 'claude haiku cost', 'claude cheap model pricing'],
  },
  {
    slug: 'claude-3-opus-pricing',
    modelId: 'claude-3-opus-20240229',
    title: 'Claude 3 Opus API Pricing (2026) — Cost Per 1M Tokens',
    h1: 'Claude 3 Opus API Pricing',
    description: 'Claude 3 Opus pricing: $15.00/1M input, $75.00/1M output, $1.50/1M cached. Premium Anthropic model for complex tasks.',
    keywords: ['claude 3 opus pricing', 'claude opus cost', 'claude expensive model pricing'],
  },
  {
    slug: 'claude-3-haiku-pricing',
    modelId: 'claude-3-haiku-20240307',
    title: 'Claude 3 Haiku API Pricing (2026) — Cost Per 1M Tokens',
    h1: 'Claude 3 Haiku API Pricing',
    description: 'Claude 3 Haiku pricing: $0.25/1M input, $1.25/1M output, $0.025/1M cached. Ultra-cheap Claude for high-throughput workloads.',
    keywords: ['claude 3 haiku pricing', 'claude haiku cost', 'claude cheapest model'],
  },
  // Google
  {
    slug: 'gemini-2-0-flash-pricing',
    modelId: 'gemini-2.0-flash',
    title: 'Gemini 2.0 Flash API Pricing (2026) — Cost Per 1M Tokens',
    h1: 'Gemini 2.0 Flash API Pricing',
    description: 'Gemini 2.0 Flash pricing: $0.10/1M input, $0.40/1M output, $0.025/1M cached. Google cheapest production model.',
    keywords: ['gemini 2.0 flash pricing', 'gemini flash cost', 'google gemini pricing'],
  },
  {
    slug: 'gemini-2-0-flash-lite-pricing',
    modelId: 'gemini-2.0-flash-lite',
    title: 'Gemini 2.0 Flash-Lite API Pricing (2026) — Cost Per 1M Tokens',
    h1: 'Gemini 2.0 Flash-Lite API Pricing',
    description: 'Gemini 2.0 Flash-Lite pricing: $0.075/1M input, $0.30/1M output, $0.0187/1M cached. Lowest-cost Gemini model.',
    keywords: ['gemini flash lite pricing', 'gemini 2.0 flash lite cost', 'google ai pricing'],
  },
  {
    slug: 'gemini-1-5-pro-pricing',
    modelId: 'gemini-1.5-pro',
    title: 'Gemini 1.5 Pro API Pricing (2026) — Cost Per 1M Tokens',
    h1: 'Gemini 1.5 Pro API Pricing',
    description: 'Gemini 1.5 Pro pricing: $1.25/1M input, $5.00/1M output, $0.3125/1M cached. Long-context Google model cost analysis.',
    keywords: ['gemini 1.5 pro pricing', 'gemini pro cost', 'google gemini 1.5 pricing'],
  },
  {
    slug: 'gemini-1-5-flash-pricing',
    modelId: 'gemini-1.5-flash',
    title: 'Gemini 1.5 Flash API Pricing (2026) — Cost Per 1M Tokens',
    h1: 'Gemini 1.5 Flash API Pricing',
    description: 'Gemini 1.5 Flash pricing: $0.075/1M input, $0.30/1M output, $0.0187/1M cached. Budget-friendly long-context model.',
    keywords: ['gemini 1.5 flash pricing', 'gemini flash cost', 'google gemini flash pricing'],
  },
  // DeepSeek
  {
    slug: 'deepseek-v4-flash-pricing',
    modelId: 'deepseek-v4-flash',
    title: 'DeepSeek V4 Flash API Pricing (2026) — Cost Per 1M Tokens',
    h1: 'DeepSeek V4 Flash API Pricing',
    description: 'DeepSeek V4 Flash pricing: $0.14/1M input, $0.28/1M output, $0.014/1M cached. One of the cheapest LLM APIs available.',
    keywords: ['deepseek v4 flash pricing', 'deepseek pricing', 'deepseek cost per token'],
  },
  {
    slug: 'deepseek-v4-pro-pricing',
    modelId: 'deepseek-v4-pro',
    title: 'DeepSeek V4 Pro API Pricing (2026) — Cost Per 1M Tokens',
    h1: 'DeepSeek V4 Pro API Pricing',
    description: 'DeepSeek V4 Pro pricing: $0.87/1M input, $3.50/1M output, $0.0435/1M cached. Premium DeepSeek model for quality tasks.',
    keywords: ['deepseek v4 pro pricing', 'deepseek pro cost', 'deepseek api pricing'],
  },
  // Groq
  {
    slug: 'llama-4-maverick-pricing',
    modelId: 'llama-4-maverick',
    title: 'Llama 4 Maverick (Groq) API Pricing (2026) — Cost Per 1M Tokens',
    h1: 'Llama 4 Maverick on Groq API Pricing',
    description: 'Llama 4 Maverick pricing on Groq: $0.20/1M input, $0.60/1M output. Fastest inference with no cached token discount.',
    keywords: ['llama 4 maverick pricing', 'groq pricing', 'groq api cost', 'llama 4 groq pricing'],
  },
]
