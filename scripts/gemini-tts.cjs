#!/usr/bin/env node
/**
 * Gemini TTS — generate voiceover MP3 via curl (respects proxy).
 *
 * Usage:
 *   node scripts/gemini-tts.cjs <input.txt> [output.mp3]
 *
 * Model: gemini-2.5-flash-preview-tts, Voice: Aoede
 */

const fs = require('fs')
const path = require('path')
const os = require('os')
const { execSync } = require('child_process')

const MODEL = 'gemini-3.1-flash-tts-preview'
const VOICE = 'Aoede'

function loadEnv() {
  const env = {
    GEMINI_API_KEY: process.env.GEMINI_API_KEY || '',
    YUNWU_API_KEY: process.env.YUNWU_API_KEY || '',
    YUNWU_BASE_URL: process.env.YUNWU_BASE_URL || 'https://yunwu.ai',
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

function synthesize(text, outputPath) {
  const env = loadEnv()
  const prompt = `Read aloud the following text in a natural, conversational Chinese tone:\n\n${text}`

  const body = JSON.stringify({
    contents: [{ parts: [{ text: prompt }] }],
    generationConfig: {
      responseModalities: ['AUDIO'],
      speechConfig: {
        voiceConfig: {
          prebuiltVoiceConfig: { voiceName: VOICE },
        },
      },
    },
  })

  console.log(`Model: ${MODEL}`)
  console.log(`Voice: ${VOICE}`)
  console.log(`Text: ${text.length} chars`)

  // Try Google direct first, fall back to yunwu.ai proxy
  const endpoints = []
  if (env.GEMINI_API_KEY) {
    endpoints.push({
      name: 'Google direct',
      url: `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent?key=${env.GEMINI_API_KEY}`,
    })
  }
  if (env.YUNWU_API_KEY) {
    endpoints.push({
      name: 'yunwu.ai proxy',
      url: `${env.YUNWU_BASE_URL}/v1beta/models/${MODEL}:generateContent?key=${env.YUNWU_API_KEY}`,
    })
  }
  if (endpoints.length === 0) {
    throw new Error('No API key found (GEMINI_API_KEY or YUNWU_API_KEY)')
  }

  const tmpJson = `/tmp/gemini-tts-response-${Date.now()}.json`
  const escapedBody = body.replace(/'/g, "'\\''")
  let response = null

  for (const ep of endpoints) {
    console.log(`Trying ${ep.name}...`)
    try {
      execSync(
        `curl -s -X POST '${ep.url}' -H 'Content-Type: application/json' -d '${escapedBody}' -o '${tmpJson}'`,
        { timeout: 120000 },
      )
      response = JSON.parse(fs.readFileSync(tmpJson, 'utf-8'))
      if (response.error) {
        console.log(`  ${ep.name}: ${response.error.code} - ${response.error.message}`)
        response = null
        continue
      }
      console.log(`  ${ep.name}: OK`)
      break
    } catch (e) {
      console.log(`  ${ep.name}: ${e.message}`)
      response = null
    }
  }

  if (fs.existsSync(tmpJson)) fs.unlinkSync(tmpJson)
  if (!response) throw new Error('All endpoints failed')

  const audioB64 = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data
  if (!audioB64) {
    throw new Error(`No audio in response: ${JSON.stringify(response).substring(0, 500)}`)
  }

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

synthesize(text, outputPath)
