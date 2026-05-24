export interface ScenePage {
  slug: string
  title: string
  h1: string
  description: string
  scene: string
  defaultPrompt: string
  defaultOutputTokens: number
  defaultCallsPerMonth: number
  keywords: string[]
}

export const SCENE_PAGES: ScenePage[] = [
  {
    slug: 'chatbot-cost',
    title: 'AI Chatbot Cost Calculator — Estimate Monthly Chatbot API Costs',
    h1: 'AI Chatbot Cost Calculator',
    description: 'Calculate the monthly cost of running an AI chatbot. Compare GPT-4o, Claude, Gemini, and more. Real-time cost projections for customer support and conversational AI.',
    scene: 'chatbot',
    defaultPrompt: 'You are a helpful customer support assistant for a SaaS product. Answer the user question clearly and concisely. If you don\'t know the answer, say so and offer to connect them with a human agent.',
    defaultOutputTokens: 500,
    defaultCallsPerMonth: 10000,
    keywords: ['ai chatbot cost', 'chatbot api pricing', 'chatbot cost calculator', 'ai chatbot monthly cost', 'how much does an ai chatbot cost'],
  },
  {
    slug: 'rag-cost',
    title: 'RAG Pipeline Cost Calculator — Estimate Retrieval-Augmented Generation Costs',
    h1: 'RAG Pipeline Cost Calculator',
    description: 'Calculate monthly costs for RAG (Retrieval-Augmented Generation) pipelines. Compare AI model costs for document Q&A, knowledge base search, and enterprise RAG systems.',
    scene: 'rag',
    defaultPrompt: 'Based on the following retrieved documents, answer the user question accurately. Cite specific sources using [Doc N] notation. If the documents don\'t contain the answer, say so.\n\n[Retrieved document 1: Company handbook section on vacation policy]\n[Retrieved document 2: HR FAQ about benefits and time off]',
    defaultOutputTokens: 800,
    defaultCallsPerMonth: 5000,
    keywords: ['rag cost calculator', 'retrieval augmented generation cost', 'rag pipeline pricing', 'rag api cost', 'knowledge base ai cost'],
  },
  {
    slug: 'ai-agent-cost',
    title: 'AI Agent Cost Calculator — Estimate Autonomous Agent API Costs',
    h1: 'AI Agent Cost Calculator',
    description: 'Calculate monthly costs for AI agents. Compare model costs for autonomous agents, tool-using agents, and multi-step reasoning systems across all major AI providers.',
    scene: 'agent',
    defaultPrompt: 'You are an autonomous AI agent with access to the following tools: web_search, code_execute, file_read, file_write. Break down the user task into steps and execute them sequentially. Use tools when needed. Report your progress after each step.',
    defaultOutputTokens: 2000,
    defaultCallsPerMonth: 1000,
    keywords: ['ai agent cost calculator', 'autonomous agent pricing', 'ai agent api cost', 'agent monthly cost', 'how much do ai agents cost'],
  },
  {
    slug: 'coding-assistant-cost',
    title: 'AI Coding Assistant Cost Calculator — Estimate Code Review API Costs',
    h1: 'AI Coding Assistant Cost Calculator',
    description: 'Calculate monthly costs for AI coding assistants. Compare model costs for code review, code generation, debugging, and refactoring across GPT-4o, Claude, Gemini, and more.',
    scene: 'coding',
    defaultPrompt: 'Review the following code and suggest improvements. Focus on: 1) Performance optimization 2) Security vulnerabilities 3) Code readability 4) Best practices. Provide specific suggestions with code examples.',
    defaultOutputTokens: 1500,
    defaultCallsPerMonth: 2000,
    keywords: ['coding assistant cost', 'ai code review pricing', 'copilot api cost', 'coding assistant api pricing', 'ai coding monthly cost'],
  },
]
