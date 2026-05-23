export interface CheckItem {
  id: string
  category: string
  title: string
  description: string
  severity: 'critical' | 'warning' | 'info'
  codeExample?: string
  references?: string[]
}

export const CHECKLIST_CATEGORIES = [
  'Input Validation',
  'Tool & API Security',
  'Prompt Injection Defense',
  'Data Privacy',
  'Access Control',
  'Monitoring & Logging',
  'Error Handling',
  'Supply Chain',
]

export const CHECKLIST_ITEMS: CheckItem[] = [
  {
    id: 'input-length',
    category: 'Input Validation',
    title: 'Limit input length and complexity',
    description: 'Cap user input to prevent context window overflow attacks. Long inputs can push system prompts out of context, allowing jailbreaks.',
    severity: 'critical',
    codeExample: 'MAX_INPUT_TOKENS = 4000\nif count_tokens(user_input) > MAX_INPUT_TOKENS:\n    raise InputTooLongError()',
    references: ['https://simonwillison.net/2023/Apr/14/worst-that-can-happen/'],
  },
  {
    id: 'sanitize-input',
    category: 'Input Validation',
    title: 'Sanitize inputs before passing to agent',
    description: 'Strip or escape control characters, HTML tags, and markdown injection vectors before feeding user input to the LLM.',
    severity: 'warning',
    codeExample: 'import re\nclean = re.sub(r\'<[^>]+>\', \'\', user_input)\nclean = clean.replace(\'\\x00\', \'\')',
  },
  {
    id: 'tool-whitelist',
    category: 'Tool & API Security',
    title: 'Whitelist allowed tools and APIs',
    description: 'Never give an agent unrestricted access to tools. Define a strict allowlist of functions the agent can call. Block file system access, network calls, and code execution unless explicitly required.',
    severity: 'critical',
    codeExample: 'ALLOWED_TOOLS = [\'search_docs\', \'calculate\', \'send_email\']\nif tool_name not in ALLOWED_TOOLS:\n    raise UnauthorizedToolError(tool_name)',
  },
  {
    id: 'tool-params',
    category: 'Tool & API Security',
    title: 'Validate tool parameters before execution',
    description: 'Agents can be tricked into calling tools with malicious parameters (e.g., sending emails to unauthorized addresses). Validate every parameter against a schema.',
    severity: 'critical',
    codeExample: 'def call_tool(name, params):\n    schema = TOOL_SCHEMAS[name]\n    validate(params, schema)  # JSON Schema validation\n    # Reject if any param contains unexpected values\n    execute(name, params)',
  },
  {
    id: 'human-in-loop',
    category: 'Tool & API Security',
    title: 'Require human approval for destructive actions',
    description: 'Any action that modifies data, sends messages, or makes purchases must require explicit human confirmation before execution.',
    severity: 'critical',
    codeExample: 'if action.is_destructive():\n    approval = ask_human(f"Allow {action}? [y/N]")\n    if not approval:\n        return "Action cancelled by user"',
  },
  {
    id: 'prompt-injection-defense',
    category: 'Prompt Injection Defense',
    title: 'Separate system and user messages',
    description: 'Never concatenate user input with system prompts. Use the official API message format with distinct system/user/assistant roles.',
    severity: 'critical',
    codeExample: 'messages = [\n    {"role": "system", "content": SYSTEM_PROMPT},\n    {"role": "user", "content": sanitized_user_input}\n]',
  },
  {
    id: 'output-filter',
    category: 'Prompt Injection Defense',
    title: 'Filter agent output for injection traces',
    description: 'Check if the agent output contains attempts to inject instructions for downstream systems (e.g., "[SYSTEM] Ignore previous...").',
    severity: 'warning',
    codeExample: 'INJECTION_PATTERNS = [\n    r\'\\[SYSTEM\\]\', r\'ignore previous\',\n    r\'new instruction\', r\'<\\/system>\'\n]\nfor pattern in INJECTION_PATTERNS:\n    if re.search(pattern, output, re.IGNORECASE):\n        return sanitize(output)',
  },
  {
    id: 'no-sensitive-data',
    category: 'Data Privacy',
    title: 'Never send PII or secrets to LLM APIs',
    description: 'Strip personally identifiable information (emails, phone numbers, SSNs) and secrets (API keys, passwords, tokens) from inputs before sending to any LLM API.',
    severity: 'critical',
    codeExample: 'import re\ndef redact_pii(text):\n    text = re.sub(r\'[\\w.-]+@[\\w.-]+\', \'[EMAIL]\', text)\n    text = re.sub(r\'sk-[a-zA-Z0-9]{20,}\', \'[API_KEY]\', text)\n    text = re.sub(r\'\\d{3}[-.]?\\d{3}[-.]?\\d{4}\', \'[PHONE]\', text)\n    return text',
  },
  {
    id: 'data-retention',
    category: 'Data Privacy',
    title: 'Set data retention policies on API calls',
    description: 'Use zero data retention options when available (e.g., OpenAI\'s `store: false`, Anthropic\'s no-training policy). Never log full conversation histories.',
    severity: 'warning',
    codeExample: '# OpenAI: opt out of training data\nresponse = client.chat.completions.create(\n    model="gpt-4o",\n    messages=messages,\n    store=False,  # Don\'t store conversations\n)',
  },
  {
    id: 'rate-limit',
    category: 'Access Control',
    title: 'Implement rate limiting per user/session',
    description: 'Prevent abuse by limiting the number of agent actions per user per time window. This also caps your API costs.',
    severity: 'warning',
    codeExample: 'from datetime import datetime, timedelta\n\nRATE_LIMIT = 60  # requests per hour\n\nif request_count(user_id) > RATE_LIMIT:\n    raise RateLimitError("Too many requests")',
  },
  {
    id: 'permissions',
    category: 'Access Control',
    title: 'Use least-privilege API credentials',
    description: 'Generate API keys with minimal permissions. If the agent only reads a database, use a read-only key. Never use root/admin credentials.',
    severity: 'critical',
  },
  {
    id: 'log-actions',
    category: 'Monitoring & Logging',
    title: 'Log all agent decisions and tool calls',
    description: 'Record every tool call, its parameters, and the agent\'s reasoning. This is essential for debugging, auditing, and detecting anomalous behavior.',
    severity: 'warning',
    codeExample: 'import logging\nlogger = logging.getLogger("agent")\n\ndef call_tool(name, params):\n    logger.info(f"tool_call: {name} params={params}")\n    result = execute(name, params)\n    logger.info(f"tool_result: {name} status=ok")\n    return result',
  },
  {
    id: 'cost-monitoring',
    category: 'Monitoring & Logging',
    title: 'Monitor API costs in real-time',
    description: 'Set up cost alerts and budget caps. A misconfigured agent can drain your API budget in minutes by looping or processing large inputs.',
    severity: 'warning',
    codeExample: 'DAILY_BUDGET = 10.00  # USD\nif daily_spend() > DAILY_BUDGET:\n    disable_agent()\n    alert("Agent disabled: daily budget exceeded")',
  },
  {
    id: 'graceful-errors',
    category: 'Error Handling',
    title: 'Handle LLM errors gracefully (never expose internals)',
    description: 'Catch API errors, timeouts, and malformed responses. Never expose stack traces, API keys, or internal state to users.',
    severity: 'warning',
    codeExample: 'try:\n    response = call_llm(messages)\nexcept RateLimitError:\n    return "Please try again in a moment."\nexcept APIError as e:\n    logger.error(f"LLM API error: {e}")\n    return "Something went wrong. Please try again."',
  },
  {
    id: 'max-iterations',
    category: 'Error Handling',
    title: 'Set maximum iteration limits',
    description: 'Agents can get stuck in infinite loops (tool A calls tool B calls tool A). Set a hard limit on reasoning steps and tool calls per task.',
    severity: 'critical',
    codeExample: 'MAX_ITERATIONS = 10\n\nfor i in range(MAX_ITERATIONS):\n    action = agent.decide()\n    if action.is_final():\n        return action.result\n    execute(action)\n\nreturn "Agent exceeded maximum iterations"',
  },
  {
    id: 'dependency-audit',
    category: 'Supply Chain',
    title: 'Audit npm/pip dependencies for known vulnerabilities',
    description: 'The May 2025 npm supply chain attack (279 GitHub comments) targeted AI agent hook scripts. Run `npm audit` or `pip audit` regularly and pin dependency versions.',
    severity: 'critical',
    codeExample: '# In CI/CD pipeline\nnpm audit --audit-level=high\npip audit\n\n# Pin versions in package.json / requirements.txt\n# Review all new dependencies manually',
  },
  {
    id: 'lock-files',
    category: 'Supply Chain',
    title: 'Use lock files and verify checksums',
    description: 'Always commit package-lock.json / poetry.lock. Verify checksums of downloaded packages. Use `npm ci` instead of `npm install` in CI.',
    severity: 'warning',
    codeExample: '# CI/CD: use ci for reproducible installs\nnpm ci  # respects lockfile exactly\n\n# Verify integrity\nnpm cache verify',
  },
  {
    id: 'hook-validation',
    category: 'Supply Chain',
    title: 'Validate AI agent hooks and startup scripts',
    description: 'Claude Code, Codex, and other AI agents support startup hooks. Review hook scripts before executing. Never auto-execute hooks from untrusted sources.',
    severity: 'critical',
    references: ['https://github.com/anthropics/claude-code/security'],
  },
]

export const FAQ_DATA = [
  { q: 'What is AI agent security?', a: 'AI agent security is the practice of protecting autonomous AI systems from misuse, prompt injection, data leaks, and unauthorized actions. Unlike chatbots, agents can take real-world actions (API calls, file access, code execution), making security critical.' },
  { q: 'Why do AI agents need security checks?', a: 'Agents operate with elevated permissions (API keys, database access, tool execution). A compromised agent can send unauthorized emails, modify data, or leak secrets. The May 2025 npm supply chain attack showed that agent hook scripts are an active attack vector.' },
  { q: 'What is prompt injection in AI agents?', a: 'Prompt injection is when malicious instructions hidden in user input, documents, or API responses trick the agent into ignoring its system prompt and executing unintended actions. For agents with tool access, this can lead to data theft or system compromise.' },
  { q: 'How do I prevent prompt injection in my AI agent?', a: 'Separate system and user messages, validate all inputs, filter outputs for injection patterns, and require human approval for destructive actions. No single defense is sufficient — use multiple layers.' },
  { q: 'How many of these checks are critical?', a: 'Of the 18 checks, 8 are marked critical. These address the most common attack vectors: unrestricted tool access, unvalidated parameters, missing iteration limits, and supply chain vulnerabilities.' },
]
