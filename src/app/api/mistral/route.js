// app/api/chat/route.js

import { TRANSLATION_LANGUAGES, MODELS } from '@/app/models/config.js';

const HF_BASE = "https://router.huggingface.co/hf-inference/models";

// ── 1. Chat ───────────────────────────────────────────────
async function runChat(modelId, systemPrompt, messages, apiKey) {
  const conversation = [
    { role: "system", content: systemPrompt },
    ...(Array.isArray(messages)
      ? messages.map((msg) => ({
          role: msg.role,
          content: msg.content ?? msg.text ?? "",
        }))
      : [{ role: "user", content: messages || "" }]),
  ];

  const res = await fetch("https://router.huggingface.co/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: modelId,
      messages: conversation,
      max_tokens: 512,
      temperature: 0.7,
      stream: false,
    }),
  });

  if (!res.ok) throw new Error(await res.text());
  const data = await res.json();
  return { text: data?.choices?.[0]?.message?.content ?? "" };
}

// ── 2. Translation ────────────────────────────────────────
async function runTranslation(targetLang, prompt, apiKey) {
  // validate the language code is supported
  const supported = TRANSLATION_LANGUAGES.find((l) => l.code === targetLang);
  if (!supported) {
    throw new Error(
      `Unsupported target language "${targetLang}". Supported: ${TRANSLATION_LANGUAGES.map((l) => l.code).join(", ")}`
    );
  }

  // dynamically build the model id from the language code
  const modelId = `Helsinki-NLP/opus-mt-en-${targetLang}`;

  const res = await fetch(`${HF_BASE}/${modelId}`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ inputs: prompt }),
  });

  if (!res.ok) throw new Error(await res.text());
  const data = await res.json();

  if (data?.error) {
    throw new Error(
      JSON.stringify({ message: data.error, estimated_time: data.estimated_time })
    );
  }

  return {
    text: data?.[0]?.translation_text ?? "",
    from: "English",
    to: supported.label,
  };
}

// ── 3. Emotion classification ─────────────────────────────
async function runClassification(modelId, prompt, apiKey) {
  const res = await fetch(`${HF_BASE}/${modelId}`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ inputs: prompt }),
  });

  if (!res.ok) throw new Error(await res.text());
  const data = await res.json();

  if (data?.error) {
    throw new Error(
      JSON.stringify({ message: data.error, estimated_time: data.estimated_time })
    );
  }

  const results = Array.isArray(data?.[0]) ? data[0] : data;
  const sorted  = [...results].sort((a, b) => b.score - a.score);
  const top     = sorted[0];

  return {
    text: `Detected emotion: ${top.label} (${(top.score * 100).toFixed(1)}% confidence)`,
    breakdown: sorted.map((r) => ({
      label: r.label,
      score: parseFloat((r.score * 100).toFixed(1)),
    })),
  };
}

// ── Main handler ──────────────────────────────────────────
export async function POST(request) {
  try {
    const reqBody = await request.json();
    const { prompt, task, targetLang, messages } = reqBody;

    if (!prompt && !messages) {
      return Response.json({ error: "prompt or messages are required" }, { status: 400 });
    }
    if (!task) {
      return Response.json(
        { error: "task is required — one of: text-generation | translation | emotion" },
        { status: 400 }
      );
    }

    const model = MODELS[task];
    if (!model) {
      return Response.json(
        { error: `Unknown task "${task}". Valid: ${Object.keys(MODELS).join(", ")}` },
        { status: 400 }
      );
    }

    // translation requires targetLang
    if (task === "translation" && !targetLang) {
      return Response.json(
        {
          error: "targetLang is required for translation",
          supported: TRANSLATION_LANGUAGES,
        },
        { status: 400 }
      );
    }

    const apiKey = process.env.HF_API_KEY;
    if (!apiKey) {
      return Response.json({ error: "HF_API_KEY not configured" }, { status: 500 });
    }

    let result;
    switch (model.type) {
      case "chat":
        // prefer full chat history for context; fallback to user prompt
        result = await runChat(model.id, model.systemPrompt, reqBody.messages || prompt, apiKey);
        break;
      case "translation":
        result = await runTranslation(targetLang, prompt, apiKey);
        break;
      case "classification":
        result = await runClassification(model.id, prompt, apiKey);
        break;
    }

    return Response.json(result);

  } catch (err) {
    return Response.json({ error: err.message }, { status: 500 });
  }
}