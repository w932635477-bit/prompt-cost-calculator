export interface VoiceProvider {
  name: string
  provider: string
  url: string
  pricingModel: string
  pricePerUnit: number
  unit: string
  unitLabel: string
  inputOutput: 'same' | 'separate'
  inputPrice?: number
  outputPrice?: number
  freeTier: string
  features: string[]
  voices: string
}

export const VOICE_PROVIDERS: VoiceProvider[] = [
  {
    name: 'OpenAI TTS',
    provider: 'OpenAI',
    url: 'https://openai.com/api/pricing/',
    pricingModel: 'Per character',
    pricePerUnit: 15.00,
    unit: '1M chars',
    unitLabel: 'per 1M characters',
    inputOutput: 'same',
    freeTier: 'Pay-as-you-go, no free tier',
    features: ['gpt-4o-mini TTS', 'HD quality', 'Streaming', 'Multiple voices', 'Instructions support'],
    voices: '8 voices (alloy, echo, fable, onyx, nova, shimmer, coral, verse)',
  },
  {
    name: 'ElevenLabs',
    provider: 'ElevenLabs',
    url: 'https://elevenlabs.io/pricing',
    pricingModel: 'Per character',
    pricePerUnit: 30.00,
    unit: '1M chars',
    unitLabel: 'per 1M characters',
    inputOutput: 'same',
    freeTier: '10,000 chars/month free',
    features: ['Voice cloning', 'Multi-language', 'Streaming', 'Voice design', 'Projects API'],
    voices: '100+ voices + clone your own',
  },
  {
    name: 'Deepgram Aura',
    provider: 'Deepgram',
    url: 'https://deepgram.com/pricing',
    pricingModel: 'Per character',
    pricePerUnit: 12.00,
    unit: '1M chars',
    unitLabel: 'per 1M characters',
    inputOutput: 'same',
    freeTier: '$200 free credit (new accounts)',
    features: ['Ultra-low latency', 'Streaming', 'Multiple voices', 'Pay-as-you-go'],
    voices: '12 Aura voices',
  },
  {
    name: 'Google Cloud TTS',
    provider: 'Google',
    url: 'https://cloud.google.com/text-to-speech/pricing',
    pricingModel: 'Per character',
    pricePerUnit: 16.00,
    unit: '1M chars',
    unitLabel: 'per 1M characters (Standard)',
    inputOutput: 'same',
    freeTier: '1M chars/month free (WaveNet)',
    features: ['WaveNet voices', 'Neural2', 'Journey voices', 'SSML', 'Streaming'],
    voices: '380+ voices in 50+ languages',
  },
  {
    name: 'Azure Speech',
    provider: 'Microsoft',
    url: 'https://azure.microsoft.com/en-us/pricing/details/cognitive-services/speech-services/',
    pricingModel: 'Per character',
    pricePerUnit: 16.00,
    unit: '1M chars',
    unitLabel: 'per 1M characters (Neural)',
    inputOutput: 'same',
    freeTier: '500K chars/month free (Neural)',
    features: ['Neural voices', 'Custom voices', 'SSML', 'Streaming', 'Batch synthesis'],
    voices: '400+ voices in 140+ languages',
  },
  {
    name: 'Gemini TTS',
    provider: 'Google',
    url: 'https://ai.google.dev/pricing',
    pricingModel: 'Per character',
    pricePerUnit: 0.00,
    unit: '1M chars',
    unitLabel: 'Free during preview',
    inputOutput: 'same',
    freeTier: 'Free (preview)',
    features: ['Native Gemini integration', 'gpt-4o-mini quality', 'Streaming', 'Multi-language'],
    voices: 'Multiple voices via Gemini API',
  },
]

export const FAQ_DATA = [
  { q: 'How is voice AI pricing calculated?', a: 'Most TTS (text-to-speech) providers charge per character of input text. OpenAI charges $15 per 1M characters, ElevenLabs charges $30 per 1M characters. Some providers like Deepgram also offer per-second pricing.' },
  { q: 'What is the cheapest voice AI API?', a: 'Deepgram Aura at $12 per 1M characters is the cheapest production option. Google Cloud TTS and Azure Speech offer 1M and 500K free characters per month respectively. Gemini TTS is free during preview.' },
  { q: 'How many characters is a typical conversation?', a: 'A typical customer service interaction is 500-2,000 characters per response. A 5-minute conversation generates roughly 5,000-10,000 characters total.' },
  { q: 'Should I use per-character or per-minute pricing?', a: 'Most TTS APIs use per-character pricing because it is predictable. Per-minute pricing is used by some newer providers. For budgeting, assume ~150 words per minute of speech, which is ~750-900 characters.' },
  { q: 'What about STT (speech-to-text) costs?', a: 'STT pricing is separate and typically cheaper. Deepgram charges $0.0043/min, Google charges $0.016/min, Azure charges $0.01/min. A full voice agent needs both STT (listen) and TTS (speak).' },
]
