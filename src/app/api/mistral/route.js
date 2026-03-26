// app/api/chat/route.js

export async function POST(request) {
  try {
    const { prompt } = await request.json();

    if (!prompt) {
      return Response.json({ error: "prompt is required" }, { status: 400 });
    }

    const HF_API_KEY = process.env.HF_API_KEY;

    const res = await fetch("https://router.huggingface.co/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${HF_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "meta-llama/Llama-3.1-8B-Instruct", 
        messages: [
          { role: "system", content: "You are a helpful assistant." },
          { role: "user",   content: prompt }
        ],
        max_tokens: 256,
        temperature: 0.7,
        stream: false,
      }),
    });

    if (!res.ok) {
      const errText = await res.text();
      return Response.json({ error: errText }, { status: res.status });
    }

    const data = await res.json();

    // ✅ OpenAI-compatible response shape
    const text = data?.choices?.[0]?.message?.content ?? "";

    return Response.json({ text });

  } catch (err) {
    return Response.json({ error: err.message }, { status: 500 });
  }
}