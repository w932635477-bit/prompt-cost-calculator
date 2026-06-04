# aicalc.cloud — Free AI Developer Tools

Privacy-first, fully client-side AI engineering utilities. Zero telemetry, zero server-side processing for core features. 21 tools, 25 LLM models tracked.

**Live at [aicalc.cloud](https://aicalc.cloud)**

![aicalc.cloud homepage](docs/screenshot.png)

## Tools

| Tool | What it does |
|------|-------------|
| [LLM Cost Calculator](https://aicalc.cloud/) | Compare API costs across 25 models (OpenAI, Anthropic, Google, DeepSeek, Mistral) |
| [Token Counter](https://aicalc.cloud/token-counter/) | Count tokens using real tiktoken tokenizer — supports GPT, Claude, Gemini |
| [Prompt Cache Calculator](https://aicalc.cloud/prompt-cache-calculator/) | Calculate savings from prompt caching (up to 90% on repeated inputs) |
| [Token Cost Tracker](https://aicalc.cloud/token-tracker/) | Estimate monthly API spend for chatbot, RAG, coding, and AI agent use cases |
| [Cron Expression Generator](https://aicalc.cloud/cron-generator/) | Visual cron builder with natural language input, 8 languages, 100+ examples |
| [CSP Header Generator](https://aicalc.cloud/csp-generator/) | Build Content-Security-Policy headers with live directive editor |
| [PII Redactor](https://aicalc.cloud/pii-redactor/) | Remove emails, phones, API keys, credit cards — runs entirely in your browser |
| [Self-Hosted Alternatives](https://aicalc.cloud/alternatives/) | Find open-source replacements for 36 SaaS products with deployment guides |
| [Self-Hosted Compare](https://aicalc.cloud/compare/) | Side-by-side comparison of open-source alternatives (Jellyfin vs Plex, etc.) |
| [Deploy Difficulty Checker](https://aicalc.cloud/deploy/) | See how hard it is to self-host each tool — Docker commands included |
| [MCP Server Directory](https://aicalc.cloud/mcp-servers/) | Browse 10 Model Context Protocol servers with setup guides |
| [Chat Finder](https://aicalc.cloud/finder/chat/) | Find the best self-hosted chat platform for your needs |
| [Notes Finder](https://aicalc.cloud/finder/notes/) | Find the best self-hosted notes app for your workflow |
| [Photos Finder](https://aicalc.cloud/photos/) | Search free stock photos from Unsplash, Pexels, and Pixabay |
| [Voice Agent Pricing](https://aicalc.cloud/voice-agent-pricing/) | Compare voice AI pricing across providers |
| [AI Code Review Checklist](https://aicalc.cloud/ai-code-review/) | Interactive checklist for reviewing AI-generated code |
| [Productivity Finder](https://aicalc.cloud/finder/productivity/) | Find the best self-hosted productivity tools for your workflow |
| [LLM Pricing Dashboard](https://aicalc.cloud/llm-pricing/) | Detailed pricing breakdowns for 25 LLM models with cost comparisons |
| [Env Scanner](https://aicalc.cloud/env-scanner/) | Scan code for leaked environment variables and secrets — runs in your browser |
| [Dep Shield](https://aicalc.cloud/dep-shield/) | Check npm dependencies for known vulnerabilities using OSV database |
| [AI Agent Security Checker](https://aicalc.cloud/ai-agent-security/) | Evaluate AI agent security posture against 17 rules with scoring |

## Tech Stack

- **Vite** + **React 19** + **TypeScript** + **Tailwind CSS 4**
- Pure static site — no database, no user accounts
- Deployed on **Vercel** with 333 static pages
- Client-side tokenization via [js-tiktoken](https://github.com/openai/tiktoken)
- Cron parsing via [cron-parser](https://github.com/harrisiirak/cron-parser)

## Self-Host in 2 Minutes

```bash
git clone https://github.com/w932635477-bit/aicalc.git
cd aicalc
npm install

# Optional: add API keys for full functionality
cp .env.example .env.local
# Edit .env.local with your keys (GitHub token, Unsplash, etc.)

npm run dev
```

For production build:

```bash
npm run build
# Static files output to dist/
# Serve with any static file server
```

## Environment Variables

| Variable | Required | Purpose |
|----------|----------|---------|
| `GITHUB_TOKEN` | No | Fetch repo stars for alternatives pages (higher rate limit) |
| `UNSPLASH_ACCESS_KEY` | No | Photos Finder — Unsplash search API |
| `PEXELS_API_KEY` | No | Photos Finder — Pexels search API |
| `PIXABAY_API_KEY` | No | Photos Finder — Pixabay search API |

All tools work without API keys. Keys only enhance secondary features.

## Privacy

- PII Redactor runs 100% client-side — your data never leaves the browser
- Token counting happens locally via tiktoken WASM
- No analytics tracking, no cookies, no user accounts
- API keys (Unsplash, Pexels) are only used server-side for photo search proxying

## Pricing Data

LLM pricing is sourced from official provider pages and updated periodically. Prices may be outdated — always verify with the provider before making purchasing decisions. Last verified: see `src/data/pricing.json`.

## License

[MIT](LICENSE) — use freely, attribution appreciated.
