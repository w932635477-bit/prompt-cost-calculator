#!/usr/bin/env node
/**
 * Gemini TTS — generate voiceover MP3 via Gemini official API, fallback to Yunwu proxy.
 *
 * Usage:
 *   node scripts/gemini-tts.cjs <input.txt> [output.mp3]
 *
 * Model: gemini-3.1-flash-tts-preview, Voice: Aoede
 * Strategy: Try Gemini official free tier first, fallback to Yunwu AI proxy on quota error
 */

const fs = require('fs')
const path = require('path')
const os = require('os')
const { execSync } = require('child_process')

const MODEL = 'gemini-3.1-flash-tts-preview'
const VOICE = 'Aoede'
const MAX_RETRIES = 3
const BASE_DELAY_MS = 10000

// Route Node.js fetch through system proxy (Clash Verge)
const proxyUrl = process.env.https_proxy || process.env.HTTPS_PROXY || process.env.http_proxy || process.env.HTTP_PROXY
if (proxyUrl) {
  const { ProxyAgent, setGlobalDispatcher } = require('undici')
  setGlobalDispatcher(new ProxyAgent(proxyUrl))
  console.log(`Proxy: ${proxyUrl}`)
}

function loadEnv() {
  const env = {}
  const envFile = path.join(os.homedir(), 'FireSing', 'docs', 'content', '.env')
  if (fs.existsSync(envFile)) {
    const content = fs.readFileSync(envFile, 'utf-8')
    for (const line of content.split('\n')) {
      const m = line.match(/^export\s+(\w+)="([^"]*)"/)
      if (m) env[m[1]] = m[2]
    }
  }
  return env
}

const OFFICIAL_URL = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent`

function buildRequestBody(text) {
  return {
    contents: [{ parts: [{ text: `Read aloud the following text in a natural, conversational Chinese tone:\n\n${text}` }] }],
    generationConfig: {
      responseModalities: ['AUDIO'],
      speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: VOICE } } },
    },
  }
}

async function callApi(url, apiKey, body) {
  const resp = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'x-goog-api-key': apiKey },
    body: JSON.stringify(body),
  })
  const data = await resp.json()
  if (!resp.ok || data.error) {
    const errMsg = data.error?.message || `HTTP ${resp.status}`
    const err = new Error(errMsg)
    err.status = resp.status
    throw err
  }
  return data
}

function isQuotaError(err) {
  const msg = (err.message || '').toLowerCase()
  const status = err.status || 0
  return status === 429 || msg.includes('quota') || msg.includes('rate limit') || msg.includes('resource exhausted')
}

function createWav(pcmData, sampleRate, channels, bitsPerSample) {
  const byteRate = sampleRate * channels * (bitsPerSample / 8)
  const blockAlign = channels * (bitsPerSample / 8)
  const dataSize = pcmData.length
  const header = Buffer.alloc(44)
  header.write('RIFF', 0)
  header.writeUInt32LE(36 + dataSize, 4)
  header.write('WAVE', 8)
  header.write('fmt ', 12)
  header.writeUInt32LE(16, 16)
  header.writeUInt16LE(1, 20)
  header.writeUInt16LE(channels, 22)
  header.writeUInt32LE(sampleRate, 24)
  header.writeUInt32LE(byteRate, 28)
  header.writeUInt16LE(blockAlign, 32)
  header.writeUInt16LE(bitsPerSample, 34)
  header.write('data', 36)
  header.writeUInt32LE(dataSize, 40)
  return Buffer.concat([header, pcmData])
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

function isRetryableError(err) {
  const msg = (err.message || '').toLowerCase()
  const status = err.status || 0
  return status === 429 || status === 500 || status === 503 ||
    msg.includes('quota') || msg.includes('rate') || msg.includes('internal error')
}

function extractRetryDelay(err) {
  const msg = err.message || ''
  const match = msg.match(/retry in ([\d.]+)s/i)
  if (match) return Math.ceil(parseFloat(match[1]) * 1000) + 1000
  return null
}

async function synthesize(text, outputPath) {
  const env = loadEnv()
  const body = buildRequestBody(text)

  console.log(`Model: ${MODEL}`)
  console.log(`Voice: ${VOICE}`)
  console.log(`Text: ${text.length} chars`)

  // Source 1: Gemini official free tier
  const geminiKey = env.GEMINI_API_KEY
  if (geminiKey) {
    console.log('Trying Gemini official API...')
    try {
      const data = await callApi(OFFICIAL_URL, geminiKey, body)
      await saveAudio(data, outputPath)
      console.log('Success via Gemini official API')
      return
    } catch (err) {
      if (isQuotaError(err)) {
        console.log(`Gemini quota exhausted (${err.message.substring(0, 100)}), falling back to Yunwu...`)
      } else {
        console.log(`Gemini API error (${err.message.substring(0, 100)}), falling back to Yunwu...`)
      }
    }
  } else {
    console.log('No GEMINI_API_KEY found, using Yunwu proxy directly')
  }

  // Source 2: Yunwu AI proxy
  const yunwuKey = env.YUNWU_API_KEY
  const yunwuBase = (env.YUNWU_BASE_URL || 'https://yunwu.ai').replace(/\/$/, '')
  if (!yunwuKey) throw new Error('Neither GEMINI_API_KEY nor YUNWU_API_KEY found in .env')

  const yunwuUrl = `${yunwuBase}/v1beta/models/${MODEL}:generateContent`
  console.log(`API: ${yunwuBase} (Yunwu)`)

  let lastError = null
  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      console.log(`Attempt ${attempt}/${MAX_RETRIES}: Calling Yunwu API...`)
      const data = await callApi(yunwuUrl, yunwuKey, body)
      await saveAudio(data, outputPath)
      console.log('Success via Yunwu proxy')
      return
    } catch (err) {
      lastError = err
      if (!isRetryableError(err) || attempt === MAX_RETRIES) break

      const delay = extractRetryDelay(err) || (BASE_DELAY_MS * attempt)
      console.log(`Retryable error (attempt ${attempt}). Retrying in ${Math.round(delay / 1000)}s...`)
      console.log(`  Error: ${err.message.substring(0, 200)}`)
      await sleep(delay)
    }
  }

  throw lastError
}

async function saveAudio(data, outputPath) {
  const audioB64 = data.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data
  if (!audioB64) {
    throw new Error(`No audio in response: ${JSON.stringify(data).substring(0, 500)}`)
  }

  console.log('API returned audio data')
  const pcmBuffer = Buffer.from(audioB64, 'base64')
  const wavPath = outputPath.replace(/\.mp3$/, '.wav')
  const wavBuffer = createWav(pcmBuffer, 24000, 1, 16)
  fs.writeFileSync(wavPath, wavBuffer)
  console.log(`WAV: ${wavPath} (${(pcmBuffer.length / 1024).toFixed(0)} KB)`)

  try {
    execSync(`ffmpeg -y -i "${wavPath}" -ar 44100 -ac 1 -b:a 192k "${outputPath}"`, {
      stdio: 'pipe', timeout: 30000,
    })
    fs.unlinkSync(wavPath)
    console.log(`MP3: ${outputPath} (${(fs.statSync(outputPath).size / 1024).toFixed(0)} KB)`)
  } catch {
    console.log(`ffmpeg unavailable, WAV kept: ${wavPath}`)
  }
}

const args = process.argv.slice(2)
if (args.length < 1) {
  console.log('Usage: node scripts/gemini-tts.cjs <input.txt> [output.mp3]')
  process.exit(1)
}

const inputPath = path.resolve(args[0])
const outputPath = args[1] ? path.resolve(args[1]) : inputPath.replace(/\.\w+$/, '.mp3')

const text = fs.readFileSync(inputPath, 'utf-8').trim()
if (!text) { console.error('Empty input'); process.exit(1) }

synthesize(text, outputPath).catch(e => { console.error(e); process.exit(1) })
