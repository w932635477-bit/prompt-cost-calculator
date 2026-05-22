const TIKTOKEN_MODELS = new Set(['gpt-4o', 'gpt-4o-mini', 'o3', 'o4-mini'])

let tiktokenModule: typeof import('js-tiktoken') | null = null
let tiktokenLoadFailed = false

export async function countTokens(text: string, model: string): Promise<number> {
  if (!text.trim()) return 0

  if (TIKTOKEN_MODELS.has(model) && !tiktokenLoadFailed) {
    try {
      if (!tiktokenModule) {
        tiktokenModule = await import('js-tiktoken')
      }
      const enc = tiktokenModule.encodingForModel(model as import('js-tiktoken').TiktokenModel)
      return enc.encode(text).length
    } catch {
      tiktokenLoadFailed = true
    }
  }

  return estimateTokens(text)
}

function estimateTokens(text: string): number {
  let tokenCount = 0
  for (const char of text) {
    const code = char.codePointAt(0)!
    if (code > 0x4e00 && code < 0x9fff) {
      tokenCount += 0.6
    } else if (code > 127) {
      tokenCount += 0.5
    } else {
      tokenCount += 0.25
    }
  }
  return Math.ceil(tokenCount)
}
