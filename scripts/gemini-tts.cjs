#!/usr/bin/env node
/**
 * Gemini TTS — generate voiceover MP3 via @google/genai SDK (respects proxy).
 *
 * Usage:
 *   node scripts/gemini-tts.cjs <input.txt> [output.mp3]
 *
 * Model: gemini-3.1-flash-tts-preview, Voice: Aoede
 */

const fs = require('fs')
const path = require('path')
const os = require('os')
const { execSync } = require('child_process')
const { GoogleGenAI } = require('@google/genai')

// Route Node.js fetch through system proxy (Clash Verge)
const proxyUrl = process.env.https_proxy || process.env.HTTPS_PROXY || process.env.http_proxy || process.env.HTTP_PROXY
if (proxyUrl) {
  const { ProxyAgent, setGlobalDispatcher } = require('undici')
  setGlobalDispatcher(new ProxyAgent(proxyUrl))
  console.log(`Proxy: ${proxyUrl}`)
}

const MODEL = 'gemini-3.1-flash-tts-preview'
const VOICE = 'Aoede'

function loadEnv() {
  const env = {
    GEMINI_API_KEY: process.env.GEMINI_API_KEY || '',
  }
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

async function synthesize(text, outputPath) {
  const env = loadEnv()
  if (!env.GEMINI_API_KEY) throw new Error('GEMINI_API_KEY not found')

  console.log(`Model: ${MODEL}`)
  console.log(`Voice: ${VOICE}`)
  console.log(`Text: ${text.length} chars`)

  const ai = new GoogleGenAI({ apiKey: env.GEMINI_API_KEY })

  const prompt = `Read aloud the following text in a natural, conversational Chinese tone:\n\n${text}`

  console.log('Calling Gemini API via SDK...')
  const response = await ai.models.generateContent({
    model: MODEL,
    contents: prompt,
    config: {
      responseModalities: ['AUDIO'],
      speechConfig: {
        voiceConfig: {
          prebuiltVoiceConfig: { voiceName: VOICE },
        },
      },
    },
  })

  const audioB64 = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data
  if (!audioB64) {
    throw new Error(`No audio in response: ${JSON.stringify(response).substring(0, 500)}`)
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
