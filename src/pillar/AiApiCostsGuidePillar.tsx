// Pillar Page: How to Calculate Your AI API Costs
// Tutorial-style hub linking to calculator, optimizer, and pricing pages.

import { GlobalNav } from '../components/GlobalNav'
import { RelatedTools } from '../components/RelatedTools'

const STEPS = [
  {
    num: 1,
    title: 'Count your tokens',
    desc: 'Every API call charges per token (roughly 4 characters of English). Use our Token Counter to measure your actual prompt and response lengths before estimating costs.',
    tool: { name: 'Token Counter', path: '/token-counter/' },
    tip: 'A typical chatbot exchange uses 500 input + 300 output tokens. A code generation task might use 2,000 input + 1,000 output.',
  },
  {
    num: 2,
    title: 'Pick your model',
    desc: 'Each model has different per-token pricing. Premium models (GPT-5.5, Claude Opus) cost 50-200× more than budget models (Gemini Flash, DeepSeek V4 Flash).',
    tool: { name: 'LLM Pricing Comparison', path: '/llm-pricing/' },
    tip: 'Don\'t overpay. Route 70% of queries to budget models and reserve premium for complex tasks.',
  },
  {
    num: 3,
    title: 'Calculate monthly cost',
    desc: 'Multiply per-call cost × calls per day × 30 days. Our calculator handles the math and shows results for all models at once.',
    tool: { name: 'Cost Calculator', path: '/llm-pricing/llm-cost-calculator/' },
    tip: 'Enter conservative estimates first. Monitor your first week of actual usage and refine.',
  },
  {
    num: 4,
    title: 'Enable prompt caching',
    desc: 'All major providers offer 75-98% discounts on cached input tokens. If you send the same system prompt with every request, caching alone can cut input costs by 80-90%.',
    tool: { name: 'Cache Calculator', path: '/prompt-cache-calculator/' },
    tip: 'Start here. Caching requires minimal code changes and delivers the biggest savings.',
  },
  {
    num: 5,
    title: 'Optimize token usage',
    desc: 'Reduce prompt bloat, trim few-shot examples, and add output length limits. Most prompts can be shortened 20-40% without quality loss.',
    tool: { name: 'Token Optimizer', path: '/token-optimizer/' },
    tip: 'Add "respond in under 100 words" to cut output costs, which are 3-6× the input price.',
  },
]

export default function AiApiCostsGuidePillar() {
  return (
    <div className="min-h-screen bg-[#f5f5f7] text-[#1d1d1f]">
      <GlobalNav current="/" />

      {/* Hero */}
      <section className="bg-white border-b border-[#e8e8ed]">
        <div className="px-6 lg:px-12 pt-14 pb-10">
          <nav className="text-sm text-[#86868b] mb-3">
            <a href="/" className="hover:text-[#0071e3]">Home</a>
            <span className="mx-2">/</span>
            <span className="text-[#1d1d1f]">Guides</span>
            <span className="mx-2">/</span>
            <span className="text-[#1d1d1f]">Calculate AI API Costs</span>
          </nav>
          <h1 className="text-3xl lg:text-5xl font-semibold tracking-tight">
            How to Calculate Your AI API Costs
          </h1>
          <p className="text-lg text-[#86868b] mt-3 max-w-3xl">
            A 5-step guide to estimating, comparing, and optimizing your LLM API spending.
            From first token to monthly bill — with free tools for each step.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <a
              href="/llm-pricing/llm-cost-calculator/"
              className="px-5 py-2.5 bg-[#0071e3] text-white rounded-lg text-sm font-medium hover:bg-[#0077ED] transition-colors"
            >
              Open Cost Calculator
            </a>
            <a
              href="/llm-pricing/"
              className="px-5 py-2.5 border border-[#e8e8ed] text-[#1d1d1f] rounded-lg text-sm font-medium hover:border-[#0071e3]/30 transition-colors"
            >
              Compare All Prices
            </a>
          </div>
        </div>
      </section>

      <div className="px-6 lg:px-12 py-8 space-y-8 max-w-[1400px] mx-auto">

        {/* Quick cost reference */}
        <section className="bg-white rounded-2xl border border-[#e8e8ed] p-6">
          <h2 className="text-xl font-semibold mb-4">Quick Cost Reference (June 2026)</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[#e8e8ed]">
                  <th className="text-left py-2 px-3 text-[#86868b] font-medium">Usage Level</th>
                  <th className="text-right py-2 px-3 text-[#86868b] font-medium">Budget Model</th>
                  <th className="text-right py-2 px-3 text-[#86868b] font-medium">Mid-Range</th>
                  <th className="text-right py-2 px-3 text-[#86868b] font-medium">Premium</th>
                </tr>
              </thead>
              <tbody>
                {[
                  { usage: '100 calls/day', budget: '$0.40/mo', mid: '$7/mo', premium: '$33/mo' },
                  { usage: '1,000 calls/day', budget: '$4/mo', mid: '$70/mo', premium: '$330/mo' },
                  { usage: '10,000 calls/day', budget: '$40/mo', mid: '$700/mo', premium: '$3,300/mo' },
                  { usage: '100,000 calls/day', budget: '$400/mo', mid: '$7,000/mo', premium: '$33,000/mo' },
                ].map(row => (
                  <tr key={row.usage} className="border-b border-[#e8e8ed] last:border-0">
                    <td className="py-2.5 px-3 font-medium">{row.usage}</td>
                    <td className="py-2.5 px-3 text-right font-mono text-[#10a37f]">{row.budget}</td>
                    <td className="py-2.5 px-3 text-right font-mono">{row.mid}</td>
                    <td className="py-2.5 px-3 text-right font-mono text-[#d97706]">{row.premium}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="text-xs text-[#86868b] mt-3">
            Based on 500 input + 300 output tokens per call. Budget = DeepSeek V4 Flash ($0.14/1M). Mid = Claude 3.7 Sonnet ($3/1M). Premium = GPT-5.5 ($5/1M).
          </p>
        </section>

        {/* 5 Steps */}
        <section className="space-y-6">
          <h2 className="text-2xl font-semibold">5 Steps to Calculate Your Costs</h2>
          {STEPS.map(step => (
            <div key={step.num} className="bg-white rounded-2xl border border-[#e8e8ed] p-6">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-full bg-[#0071e3] text-white flex items-center justify-center font-semibold text-lg shrink-0">
                  {step.num}
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold mb-2">{step.title}</h3>
                  <p className="text-[#86868b] leading-relaxed">{step.desc}</p>
                  <div className="mt-3 flex flex-wrap gap-3">
                    <a
                      href={step.tool.path}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#0071e3]/10 text-[#0071e3] rounded-lg text-sm font-medium hover:bg-[#0071e3]/20 transition-colors"
                    >
                      {step.tool.name} →
                    </a>
                  </div>
                  <div className="mt-3 bg-[#f5f5f7] rounded-lg p-3 text-sm text-[#86868b]">
                    <span className="font-medium text-[#1d1d1f]">Tip:</span> {step.tip}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </section>

        {/* Common scenarios */}
        <section className="bg-white rounded-2xl border border-[#e8e8ed] p-6">
          <h2 className="text-xl font-semibold mb-4">Common Cost Scenarios</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[
              { title: 'Chatbot (10K users)', desc: '500 in / 300 out, 5 msgs/user/day', budget: '~$3,000/mo (DeepSeek)', mid: '~$52,000/mo (Claude)', link: '/llm-pricing/llm-cost-calculator/' },
              { title: 'Code completion', desc: '1,500 in / 500 out, 50 completions/dev/day', budget: '~$50/dev/mo (DeepSeek)', mid: '~$1,100/dev/mo (GPT-5.5)', link: '/llm-pricing/llm-cost-calculator/' },
              { title: 'Document summarization', desc: '5,000 in / 500 out, 100 docs/day', budget: '~$2/mo (Gemini Flash)', mid: '~$25/mo (Claude 3.7)', link: '/llm-pricing/llm-cost-calculator/' },
              { title: 'Embeddings / batch processing', desc: '10,000 in / 200 out, 10K calls/day', budget: '~$60/mo (DeepSeek)', mid: '~$1,100/mo (GPT-5.4)', link: '/llm-pricing/llm-cost-calculator/' },
            ].map(s => (
              <a
                key={s.title}
                href={s.link}
                className="block p-4 rounded-xl border border-[#e8e8ed] hover:border-[#0071e3]/30 hover:bg-[#0071e3]/5 transition-colors"
              >
                <div className="font-medium text-[#1d1d1f] mb-1">{s.title}</div>
                <div className="text-xs text-[#86868b] mb-2">{s.desc}</div>
                <div className="text-sm">
                  <span className="text-[#10a37f]">{s.budget}</span>
                  <span className="text-[#86868b]"> · </span>
                  <span className="text-[#d97706]">{s.mid}</span>
                </div>
              </a>
            ))}
          </div>
        </section>

        {/* Related cost tools */}
        <section className="bg-white rounded-2xl border border-[#e8e8ed] p-6">
          <h2 className="text-xl font-semibold mb-4">All Cost Management Tools</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              { name: 'AI Cost Calculator', path: '/', desc: 'Main calculator with full cost breakdown', icon: '💰' },
              { name: 'LLM Pricing Table', path: '/llm-pricing/', desc: 'Side-by-side pricing for 25 models', icon: '📊' },
              { name: 'Token Counter', path: '/token-counter/', desc: 'Count tokens before sending requests', icon: '🔢' },
              { name: 'Token Optimizer', path: '/token-optimizer/', desc: 'Reduce token usage by 20-40%', icon: '✂️' },
              { name: 'Cache Calculator', path: '/prompt-cache-calculator/', desc: 'See how caching saves 60-90%', icon: '⚡' },
              { name: 'Voice Agent Pricing', path: '/voice-agent-pricing/', desc: 'TTS API cost comparison', icon: '🗣️' },
              { name: 'Cost Calculator Guide', path: '/llm-pricing/llm-cost-calculator/', desc: 'Monthly spending estimator', icon: '🧮' },
              { name: 'Cost Comparison', path: '/llm-pricing/llm-cost-comparison/', desc: 'Provider-by-provider analysis', icon: '⚖️' },
              { name: 'Cost Optimization', path: '/llm-pricing/llm-cost-optimization/', desc: '7 ways to cut spending by 60%', icon: '📉' },
            ].map(tool => (
              <a
                key={tool.path}
                href={tool.path}
                className="block p-4 rounded-xl border border-[#e8e8ed] hover:border-[#0071e3]/30 hover:bg-[#0071e3]/5 transition-colors"
              >
                <div className="flex items-center gap-2 mb-1">
                  <span>{tool.icon}</span>
                  <span className="font-medium text-[#0071e3]">{tool.name}</span>
                </div>
                <div className="text-sm text-[#86868b]">{tool.desc}</div>
              </a>
            ))}
          </div>
        </section>

        {/* FAQ */}
        <section className="bg-white rounded-2xl border border-[#e8e8ed] p-6">
          <h2 className="text-xl font-semibold mb-4">Frequently Asked Questions</h2>
          <div className="space-y-5">
            {[
              { q: 'How much does it cost to run an AI chatbot?', a: 'At 500 input + 300 output tokens per message with 10K users sending 5 messages/day, DeepSeek V4 Flash costs ~$3,000/month while GPT-5.5 costs ~$33,000/month. Use the calculator with your actual numbers.' },
              { q: 'What is the cheapest way to use AI APIs?', a: 'Three steps: (1) Use DeepSeek V4 Flash or Gemini 2.0 Flash for routine tasks. (2) Enable prompt caching to cut input costs 80-90%. (3) Add output length limits to reduce the most expensive token type.' },
              { q: 'How do I convert characters to tokens?', a: 'In English, roughly 4 characters = 1 token. A 1,000-word article is about 1,300 tokens. Use our Token Counter for precise counts — different models use different tokenizers.' },
              { q: 'Why is my API bill higher than expected?', a: 'Common causes: output tokens (3-6× the input price), large context windows, no prompt caching, and runaway outputs without max_tokens limits. Check our cost optimization guide for fixes.' },
              { q: 'Should I use batch API?', a: 'If your workload tolerates 24-hour delays, batch APIs from OpenAI and Anthropic offer 50% discounts. Ideal for data enrichment, bulk classification, and report generation.' },
            ].map((faq, i) => (
              <div key={i}>
                <h3 className="font-semibold text-[#1d1d1f]">{faq.q}</h3>
                <p className="text-[#86868b] mt-1.5 leading-relaxed">{faq.a}</p>
              </div>
            ))}
          </div>
        </section>

        <RelatedTools currentPath="/" />
      </div>
    </div>
  )
}
