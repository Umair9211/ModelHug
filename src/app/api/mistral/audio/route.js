import { MODELS } from '@/app/models/config.js';

const HF_BASE = "https://router.huggingface.co/hf-inference/models";

// ── 1. Speech to Text (Whisper) ───────────────────────────
async function runSTT(modelId, audioBlob, apiKey) {
  const res = await fetch(`${HF_BASE}/${modelId}`, {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}` },
    body: audioBlob, // Send raw binary data
  });

  if (!res.ok) throw new Error(await res.text());
  const data = await res.json();
  return { text: data.text || "Transcription failed" };
}

// ── 2. Text to Speech (TTS) ───────────────────────────────
async function runTTS(modelId, text, apiKey) {
  const res = await fetch(`${HF_BASE}/${modelId}`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ inputs: text }),
  });

  if (!res.ok) throw new Error(await res.text());
  
  // TTS returns a binary audio file (usually FLAC or WAV)
  const arrayBuffer = await res.arrayBuffer();
  const base64Audio = Buffer.from(arrayBuffer).toString('base64');
  
  return { 
    text: "Audio generated successfully.",
    audioUrl: `data:audio/wav;base64,${base64Audio}` 
  };
}

// ── 3. Audio Emotion Classification ───────────────────────
async function runAudioClassification(modelId, audioBlob, apiKey) {
  const res = await fetch(`${HF_BASE}/${modelId}`, {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}` },
    body: audioBlob,
  });

  if (!res.ok) throw new Error(await res.text());
  const data = await res.json();

  const results = Array.isArray(data) ? data : [data];
  const sorted = [...results].sort((a, b) => b.score - a.score);
  const top = sorted[0];

  return {
    text: `Detected Tone: ${top.label} (${(top.score * 100).toFixed(1)}% confidence)`,
    details: sorted
  };
}

// ── Main Handler ──────────────────────────────────────────
export async function POST(request) {
  try {
    const formData = await request.formData();
    const task = formData.get("task");
    const prompt = formData.get("prompt"); // For TTS
    const file = formData.get("file");     // For STT/Emotion

    if (!task) return Response.json({ error: "Task is required" }, { status: 400 });

    const model = MODELS[task];
    const apiKey = process.env.HF_API_KEY;

    if (!apiKey) return Response.json({ error: "HF_API_KEY missing" }, { status: 500 });
    if (!model) return Response.json({ error: `Model for ${task} not found` }, { status: 400 });

    let result;

    switch (task) {
      case "tts":
        if (!prompt) throw new Error("Text prompt is required for TTS");
        result = await runTTS(model.id, prompt, apiKey);
        break;

      case "whisper":
        if (!file) throw new Error("Audio file is required for Speech-to-Text");
        result = await runSTT(model.id, await file.arrayBuffer(), apiKey);
        break;

      case "audio-emotion":
        if (!file) throw new Error("Audio file is required for Emotion Detection");
        result = await runAudioClassification(model.id, await file.arrayBuffer(), apiKey);
        break;

      default:
        return Response.json({ error: "Unsupported audio task" }, { status: 400 });
    }

    return Response.json(result);

  } catch (err) {
    console.error("Audio API Error:", err);
    return Response.json({ error: err.message }, { status: 500 });
  }
}