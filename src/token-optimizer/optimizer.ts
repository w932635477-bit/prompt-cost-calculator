// Token Optimizer — compression analysis for AI prompts
// Pure client-side: no network, no storage

import { countTokens } from '../lib/tokenizer'
import type { ModelPricing } from '../lib/types'
import pricingData from '../data/pricing.json'

const models = pricingData.models as ModelPricing[]

// ---- Pattern Detection ----

interface Redundancy {
  type: 'verbose_phrase' | 'filler_word' | 'duplicate_line' | 'long_system_prompt'
    | 'unnecessary_context' | 'overly_polite' | 'redundant_instruction'
    | 'empty_line' | 'trailing_whitespace'
  label: string
  matches: string[]
  estimatedTokenWaste: number
}

export interface CompressionResult {
  originalTokens: Record<string, number>  // modelId → token count
  compressedTokens: Record<string, number>
  savings: Record<string, { tokens: number; costPer1k: number }>
  redundancies: Redundancy[]
  compressedText: string
  totalSavingsPercent: number
}

// Verbose phrases that can be shortened
const VERBOSE_PATTERNS: [RegExp, string, string][] = [
  [/\bin order to\b/gi, 'in order to', 'to'],
  [/\bdue to the fact that\b/gi, 'due to the fact that', 'because'],
  [/\bat this point in time\b/gi, 'at this point in time', 'now'],
  [/\bin the event that\b/gi, 'in the event that', 'if'],
  [/\bwith regard to\b/gi, 'with regard to', 'about'],
  [/\bin terms of\b/gi, 'in terms of', 'for'],
  [/\bthe majority of\b/gi, 'the majority of', 'most'],
  [/\ba large number of\b/gi, 'a large number of', 'many'],
  [/\bhas the ability to\b/gi, 'has the ability to', 'can'],
  [/\bis able to\b/gi, 'is able to', 'can'],
  [/\bhas the capability to\b/gi, 'has the capability to', 'can'],
  [/\bit is important to note that\b/gi, 'it is important to note that', 'note:'],
  [/\bit should be noted that\b/gi, 'it should be noted that', 'note:'],
  [/\bit is worth mentioning that\b/gi, 'it is worth mentioning that', ''],
  [/\bplease note that\b/gi, 'please note that', 'note:'],
  [/\bplease be advised that\b/gi, 'please be advised that', ''],
  [/\bI would like to\b/gi, 'I would like to', 'I want to'],
  [/\bI would appreciate it if\b/gi, 'I would appreciate it if', 'please'],
  [/\bif you could please\b/gi, 'if you could please', 'please'],
  [/\bwould you be able to\b/gi, 'would you be able to', 'can you'],
  [/\bdo you think you could\b/gi, 'do you think you could', 'can you'],
  [/\bI was wondering if\b/gi, 'I was wondering if', ''],
  // System prompt patterns — match full phrases only, with capture groups for safe replacement
  [/\bYou are a (?:very )?(?:highly )?(?:helpful|useful|intelligent|skilled|expert|knowledgeable|capable|powerful) (?:AI |artificial intelligence )?(?:assistant|model|agent|system)\.?\s*/gi,
    '', '[system prompt fluff]'],
  [/\bYou are an (?:AI|artificial intelligence) assistant (?:designed |created |trained )?(?:to |for )?/gi,
    '', '[AI identity boilerplate]'],
]

// Filler words/phrases that add little value
const FILLER_PATTERNS: [RegExp, string][] = [
  [/\b(actually|basically|essentially|literally|really|very|quite|rather|somewhat|just|simply|obviously|clearly|definitely|certainly|absolutely|indeed)\b/gi, 'filler'],
  [/\b(I think|I believe|in my opinion|from my perspective|as far as I know|to the best of my knowledge)\b/gi, 'hedging'],
  [/\b(needless to say|it goes without saying|as everyone knows|as you may know|as you might expect)\b/gi, 'obvious'],
]

// ---- Core Functions ----

function countVerboseMatches(text: string): Redundancy[] {
  const results: Redundancy[] = []

  for (const [pattern, phrase, replacement] of VERBOSE_PATTERNS) {
    const matches = text.match(pattern)
    if (matches && matches.length > 0) {
      const uniqueMatches = [...new Set(matches)]
      results.push({
        type: 'verbose_phrase',
        label: `"${phrase}" → "${replacement}"`,
        matches: uniqueMatches,
        estimatedTokenWaste: uniqueMatches.reduce((sum, m) =>
          sum + Math.ceil(m.length / 4), 0),
      })
    }
  }

  return results
}

function countFillerWords(text: string): Redundancy[] {
  const results: Redundancy[] = []

  for (const [pattern, category] of FILLER_PATTERNS) {
    const matches = text.match(pattern)
    if (matches && matches.length > 0) {
      const uniqueMatches = [...new Set(matches)]
      results.push({
        type: 'filler_word',
        label: `${category} words (${uniqueMatches.length} occurrences)`,
        matches: uniqueMatches,
        estimatedTokenWaste: matches.length * 1, // ~1 token per filler
      })
    }
  }

  return results
}

function findDuplicateLines(text: string): Redundancy[] {
  const lines = text.split('\n')
  const seen = new Map<string, number[]>()
  const results: Redundancy[] = []

  for (let i = 0; i < lines.length; i++) {
    const trimmed = lines[i].trim()
    if (trimmed.length < 10) continue // skip short lines

    const existing = seen.get(trimmed)
    if (existing) {
      existing.push(i + 1) // 1-based line numbers
    } else {
      seen.set(trimmed, [i + 1])
    }
  }

  for (const [line, lineNums] of seen) {
    if (lineNums.length > 1) {
      results.push({
        type: 'duplicate_line',
        label: `Line repeated ${lineNums.length} times: "${line.slice(0, 60)}${line.length > 60 ? '...' : ''}"`,
        matches: [line],
        estimatedTokenWaste: Math.ceil(line.length / 4) * (lineNums.length - 1),
      })
    }
  }

  return results
}

function findEmptyLines(text: string): Redundancy | null {
  const emptyCount = (text.match(/\n{3,}/g) || []).reduce((sum, m) => sum + m.length - 1, 0)
  if (emptyCount === 0) return null

  return {
    type: 'empty_line',
    label: `${emptyCount} unnecessary blank lines`,
    matches: [],
    estimatedTokenWaste: emptyCount, // newlines are ~1 token each
  }
}

function findOverlyPolite(text: string): Redundancy | null {
  const politePatterns = [
    /\b(please|kindly|if you don't mind|I would be grateful|thank you (so much|very much|in advance)|I appreciate (your help|it)|thanks (a lot|a bunch|a ton))\b/gi,
    /\b(would you (please |kindly )?|could you (please |kindly )?|may I (please |kindly )?)\b/gi,
  ]

  let totalMatches = 0
  const allMatches: string[] = []

  for (const pattern of politePatterns) {
    const matches = text.match(pattern)
    if (matches) {
      totalMatches += matches.length
      allMatches.push(...matches)
    }
  }

  if (totalMatches > 3) {
    return {
      type: 'overly_polite',
      label: `${totalMatches} politeness tokens — AI doesn't need please/thank you`,
      matches: [...new Set(allMatches)].slice(0, 10),
      estimatedTokenWaste: totalMatches * 1,
    }
  }

  return null
}

function findLongSystemPrompt(text: string): Redundancy | null {
  // Detect system prompts longer than ~200 words
  const systemPromptMatch = text.match(/^(You are[^\n]*)(?=\n\n(?:User|Human|Q:|Prompt:))/is)
  if (!systemPromptMatch) return null

  const systemPrompt = systemPromptMatch[1]
  const wordCount = systemPrompt.split(/\s+/).length

  if (wordCount > 50) {
    return {
      type: 'long_system_prompt',
      label: `System prompt is ${wordCount} words — consider shortening to <30 words`,
      matches: [systemPrompt.slice(0, 120) + '...'],
      estimatedTokenWaste: Math.ceil((wordCount - 30) * 1.3),
    }
  }

  return null
}

// ---- Compression ----

function compressText(text: string): string {
  let result = text

  // Apply verbose phrase replacements (simple string swaps)
  for (const [pattern, , replacement] of VERBOSE_PATTERNS) {
    if (replacement === '[system prompt fluff]' || replacement === '[AI identity boilerplate]' || replacement === '[instruction padding]') {
      // Replace system prompt fluff with minimal version, only first occurrence
      result = result.replace(pattern, 'You are a helpful assistant. ')
    } else {
      result = result.replace(pattern, replacement)
    }
  }

  // Collapse multiple consecutive spaces
  result = result.replace(/ {2,}/g, ' ')

  // Collapse multiple blank lines
  result = result.replace(/\n{3,}/g, '\n\n')

  // Remove trailing whitespace per line
  result = result.replace(/[ \t]+$/gm, '')

  // Deduplicate identical non-empty lines, keeping first occurrence
  const lines = result.split('\n')
  const seenLines = new Set<string>()
  const deduped: string[] = []
  for (const line of lines) {
    const trimmed = line.trim()
    if (trimmed.length >= 10 && seenLines.has(trimmed)) continue
    if (trimmed.length >= 10) seenLines.add(trimmed)
    deduped.push(line)
  }
  result = deduped.join('\n')

  return result.trim()
}

// ---- Main API ----

export async function analyzePrompt(text: string): Promise<CompressionResult> {
  const redundancies: Redundancy[] = []

  // Phase 1: detect all redundancy types
  redundancies.push(...countVerboseMatches(text))
  redundancies.push(...countFillerWords(text))
  redundancies.push(...findDuplicateLines(text))

  const emptyLines = findEmptyLines(text)
  if (emptyLines) redundancies.push(emptyLines)

  const polite = findOverlyPolite(text)
  if (polite) redundancies.push(polite)

  const longSys = findLongSystemPrompt(text)
  if (longSys) redundancies.push(longSys)

  // Phase 2: compress
  const compressedText = compressText(text)

  // Phase 3: count tokens for original and compressed across key models
  const keyModels = models.filter(m =>
    ['gpt-4o', 'claude-3-7-sonnet-20250219', 'gemini-2.0-flash', 'deepseek-v4-flash'].includes(m.id)
  )

  const originalTokens: Record<string, number> = {}
  const compressedTokens: Record<string, number> = {}
  const savings: Record<string, { tokens: number; costPer1k: number }> = {}

  for (const model of keyModels) {
    const orig = await countTokens(text, model.id)
    const comp = await countTokens(compressedText, model.id)
    originalTokens[model.id] = orig
    compressedTokens[model.id] = comp

    const tokensSaved = orig - comp
    const costPer1kCalls = (tokensSaved / 1000) * model.inputPricePer1M * 1000
    savings[model.id] = {
      tokens: tokensSaved,
      costPer1k: costPer1kCalls,
    }
  }

  // Use GPT-4o for percentage baseline (most common)
  const gpt4Orig = originalTokens['claude-3-7-sonnet-20250219'] || Object.values(originalTokens)[0] || 1
  const gpt4Comp = compressedTokens['claude-3-7-sonnet-20250219'] || Object.values(compressedTokens)[0] || 0
  const totalSavingsPercent = gpt4Orig > 0 ? Math.round(((gpt4Orig - gpt4Comp) / gpt4Orig) * 100) : 0

  return {
    originalTokens,
    compressedTokens,
    savings,
    redundancies,
    compressedText,
    totalSavingsPercent,
  }
}

// Platform-specific presets for common prompt patterns
export const PLATFORM_PRESETS = [
  {
    id: 'claude-code',
    name: 'Claude Code',
    description: 'Optimize CLAUDE.md and system prompts',
    samplePrompt: `You are a highly skilled and knowledgeable AI coding assistant. You have extensive experience with TypeScript, React, and Node.js development. You are designed to help developers write better code, debug issues, and understand complex software systems.

Please respond to the user's questions with detailed, well-structured answers. In order to provide the best possible assistance, you should carefully analyze the code and think through the problem step by step.

I would appreciate it if you could help me refactor this function to be more efficient. Do you think you could suggest some improvements?

\`\`\`typescript
function processUsers(users: User[]): ProcessedUser[] {
  // In order to handle the data efficiently, we first create a new array
  const result: ProcessedUser[] = []
  // Due to the fact that we need to validate each user, we iterate
  for (let i = 0; i < users.length; i++) {
    const user = users[i]
    // At this point in time, we check if the user is active
    if (user.isActive === true) {
      // In the event that the user is active, we process them
      result.push({
        id: user.id,
        name: user.name,
        email: user.email,
      })
    }
  }
  return result
}
\`\`\``,
  },
  {
    id: 'cursor-rules',
    name: 'Cursor Rules',
    description: 'Optimize .cursorrules files',
    samplePrompt: `You are an expert AI programming assistant. You are highly intelligent and extremely capable. Your purpose is to help the developer write clean, efficient, and maintainable code.

Please note that you should always follow the project's coding standards and best practices. It is important to note that you should prefer functional programming patterns over imperative ones.

I was wondering if you could review this React component and suggest improvements. I would really appreciate your help with this.

Actually, I think the component is basically fine but I would like to get your opinion on the state management approach.`,
  },
  {
    id: 'github-copilot',
    name: 'GitHub Copilot',
    description: 'Optimize Copilot instructions',
    samplePrompt: `You are a helpful AI assistant that specializes in writing clean, well-documented code. You have the ability to understand complex requirements and translate them into working implementations. You are able to work with multiple programming languages and frameworks.

I would like to ask you to help me create a REST API endpoint. In order to do this properly, please make sure you handle all edge cases and error scenarios.

Needless to say, the code should be well-tested and production-ready. As everyone knows, production code needs proper error handling and logging.`,
  },
  {
    id: 'custom',
    name: 'Custom Prompt',
    description: 'Paste any prompt to analyze',
    samplePrompt: '',
  },
]

export function getPlatformSavingsEstimate(text: string): {
  originalEstimate: number
  compressedEstimate: number
  percentSaved: number
} {
  const originalEstimate = Math.ceil(text.length / 4)
  const compressed = compressText(text)
  const compressedEstimate = Math.ceil(compressed.length / 4)
  const percentSaved = originalEstimate > 0
    ? Math.round(((originalEstimate - compressedEstimate) / originalEstimate) * 100)
    : 0

  return { originalEstimate, compressedEstimate, percentSaved }
}
