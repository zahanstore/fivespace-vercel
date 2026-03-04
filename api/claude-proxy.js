export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, GET, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") return res.status(200).end();

  if (req.method === "GET") {
    const apiKey = process.env.GROQ_API_KEY;
    return res.status(200).json({
      status: "proxy alive ⚡ Groq",
      keySet: !!apiKey,
      keyPreview: apiKey ? apiKey.slice(0, 8) + "..." : "NOT SET"
    });
  }

  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) return res.status(500).json({ error: "GROQ_API_KEY not set in Vercel environment variables" });

  try {
    const { prompt } = req.body;
    if (!prompt) return res.status(400).json({ error: "No prompt provided" });

    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "llama3-8b-8192",
        max_tokens: 2000,
        messages: [{ role: "user", content: prompt }],
      }),
    });

    const raw = await response.text();
    let data;
    try { data = JSON.parse(raw); } catch(e) {
      return res.status(500).json({ error: "Groq returned non-JSON", raw: raw.slice(0, 300) });
    }

    if (!response.ok || data.error) {
      return res.status(500).json({
        error: "Groq API error",
        httpStatus: response.status,
        detail: data.error?.message || JSON.stringify(data).slice(0, 300)
      });
    }

    const text = data.choices?.[0]?.message?.content || "";
    return res.status(200).json({ text });

  } catch (err) {
    return res.status(500).json({ error: "Proxy failed", detail: err.message });
  }
}
