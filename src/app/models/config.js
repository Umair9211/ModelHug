export const TRANSLATION_LANGUAGES = [
  { code: 'fr', label: 'French' },
  { code: 'de', label: 'German' },
  { code: 'es', label: 'Spanish' },
  { code: 'ar', label: 'Arabic' },
  { code: 'zh', label: 'Chinese' },
  { code: 'ru', label: 'Russian' },
  { code: 'tr', label: 'Turkish' },
  { code: 'ur', label: 'Urdu' },
  { code: 'hi', label: 'Hindi' },
  { code: 'it', label: 'Italian' },
  { code: 'nl', label: 'Dutch' },
  { code: 'ja', label: 'Japanese' },
];

export const MODELS = {
  // ── Text & Chat ────────────────────────────────────────
  "text-generation": {
    id: "meta-llama/Llama-3.1-8B-Instruct",
    type: "chat",
    systemPrompt: "You are a helpful assistant.",
  },
  "translation": {
    type: "translation",
  },
  "emotion": {
    id: "j-hartmann/emotion-english-distilroberta-base",
    type: "classification",
  },

  // ── Vision ─────────────────────────────────────────────
  "image-gen": {
    id: "black-forest-labs/FLUX.1-schnell",
    type: "image-generation",
    steps: 4,
    guidanceScale: 0,
  },
  "captioning": {
    id: "Qwen/Qwen2.5-VL-7B-Instruct",
    type: "image-to-text",
  },
  "detection": {
    id: "facebook/detr-resnet-50",
    type: "object-detection",
  },

  // ── Audio ──────────────────────────────────────────────
 
  "whisper": {
    // Standard for Speech-to-Text
    id: "openai/whisper-large-v3-turbo", 
    type: "speech-to-text",
  },
  "tts": {
    // This model is very reliable for simple text-to-audio API calls
    id: "facebook/mms-tts-eng", 
    type: "text-to-speech",
  },
  "audio-emotion": {
    // High-performance audio classification model
    id: "ehcalabres/wav2vec2-lg-xlsr-en-speech-emotion-recognition",
    type: "audio-classification",
  },
};