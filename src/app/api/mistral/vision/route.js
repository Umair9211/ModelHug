import { MODELS } from "@/app/models/config.js";

const HF_BASE = "https://router.huggingface.co/hf-inference/models";

// ── 1. Image Generation ───────────────────────────────────
async function runImageGeneration(prompt, apiKey) {
  const { id, steps, guidanceScale } = MODELS["image-gen"];

  const res = await fetch(`${HF_BASE}/${id}`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
      Accept: "image/png",
    },
    body: JSON.stringify({
      inputs: prompt,
      parameters: {
        num_inference_steps: steps,
        guidance_scale: guidanceScale,
      },
    }),
  });

  if (!res.ok) throw new Error(await res.text());

  const buffer   = await res.arrayBuffer();
  const base64   = Buffer.from(buffer).toString("base64");
  const mimeType = res.headers.get("content-type") || "image/png";

  return { imageUrl: `data:${mimeType};base64,${base64}` };
}

// ── 2. Image Captioning ───────────────────────────────────
// Uses Llama 3.2 Vision via chat completions with base64 image
async function runCaptioning(imageBuffer, mimeType, apiKey) {
  const { id } = MODELS["captioning"];

  const base64Image = Buffer.from(imageBuffer).toString("base64");
  const dataUrl     = `data:${mimeType};base64,${base64Image}`;

  // ✅ vision chat uses router.huggingface.co/v1 — NOT hf-inference/models
  const res = await fetch("https://router.huggingface.co/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: id,
      messages: [
        {
          role: "user",
          content: [
            {
              type: "image_url",
              image_url: { url: dataUrl },
            },
            {
              type: "text",
              text: "Describe this image in detail. Be concise but thorough.",
            },
          ],
        },
      ],
      max_tokens: 256,
      stream: false,
    }),
  });

  if (!res.ok) {
    const errText = await res.text();
    console.error("[captioning] HF error:", res.status, errText);
    throw new Error(`Captioning failed (${res.status}): ${errText}`);
  }

  const data = await res.json();
  console.log("[captioning] raw response:", JSON.stringify(data));

  if (data?.error) throw new Error(`Model error: ${data.error}`);

  // OpenAI-compatible response
  const caption = data?.choices?.[0]?.message?.content ?? "";
  if (!caption) throw new Error("Empty caption returned");

  return { caption };
}
// ── 3. Object Detection ───────────────────────────────────
async function runObjectDetection(imageBuffer, mimeType, apiKey) {
  const { id } = MODELS["detection"];

  const res = await fetch(`${HF_BASE}/${id}`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": mimeType,
    },
    body: imageBuffer,
  });

  if (!res.ok) {
    const errText = await res.text();
    console.error("[detection] HF error:", res.status, errText);
    throw new Error(`Detection failed (${res.status}): ${errText}`);
  }

  const data = await res.json();
  if (data?.error) throw new Error(JSON.stringify(data));

  const objects = data
    .sort((a, b) => b.score - a.score)
    .map((item) => ({
      label: item.label,
      confidence: item.score,
      box: item.box,
    }));

  return { objects };
}

// ── Main handler ──────────────────────────────────────────
export async function POST(request) {
  try {
    const apiKey = process.env.HF_API_KEY;
    if (!apiKey) {
      return Response.json({ error: "HF_API_KEY not configured" }, { status: 500 });
    }

    const contentType = request.headers.get("content-type") || "";

    // ── JSON → image generation
    if (contentType.includes("application/json")) {
      const { prompt } = await request.json();
      if (!prompt) {
        return Response.json({ error: "prompt is required" }, { status: 400 });
      }
      const result = await runImageGeneration(prompt, apiKey);
      return Response.json(result);
    }

    // ── multipart → captioning or detection
    if (contentType.includes("multipart/form-data")) {
      const form = await request.formData();
      const task = form.get("task");
      const file = form.get("image");

      if (!file) {
        return Response.json({ error: "image field is required" }, { status: 400 });
      }
      if (!task) {
        return Response.json(
          { error: "task field required: captioning | object-detection" },
          { status: 400 }
        );
      }

      const imageBuffer = await file.arrayBuffer();
      const mimeType    = file.type || "image/jpeg";

      if (task === "captioning") {
        const result = await runCaptioning(imageBuffer, mimeType, apiKey);
        return Response.json(result);
      }

      if (task === "object-detection") {
        const result = await runObjectDetection(imageBuffer, mimeType, apiKey);
        return Response.json(result);
      }

      return Response.json(
        { error: `Unknown task "${task}"` },
        { status: 400 }
      );
    }

    return Response.json(
      { error: "Content-Type must be application/json or multipart/form-data" },
      { status: 400 }
    );

  } catch (err) {
    console.error("[vision route] error:", err.message);
    return Response.json({ error: err.message }, { status: 500 });
  }
}