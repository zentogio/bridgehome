// พร็อกซีเสียง Fish Audio: คีย์อยู่ฝั่งเซิร์ฟเวอร์เท่านั้น ไม่หลุดไปที่เบราว์เซอร์
const hits: number[] = [];
const LIMIT_PER_MIN = 30; // กันคีย์ฟรีโดนใช้หมดตอนพรีเซนต์

export async function POST(req: Request) {
  const key = process.env.FISH_API_KEY;
  if (!key) {
    return Response.json({ error: "no_key" }, { status: 503 });
  }

  const now = Date.now();
  while (hits.length && now - hits[0] > 60_000) hits.shift();
  if (hits.length >= LIMIT_PER_MIN) {
    return Response.json({ error: "rate_limited" }, { status: 429 });
  }
  hits.push(now);

  let text = "";
  try {
    const body = (await req.json()) as { text?: unknown };
    text = typeof body.text === "string" ? body.text.trim().slice(0, 300) : "";
  } catch {
    return Response.json({ error: "bad_request" }, { status: 400 });
  }
  if (!text) return Response.json({ error: "empty" }, { status: 400 });

  const upstream = await fetch("https://api.fish.audio/v1/tts", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
      model: process.env.FISH_MODEL || "s2.1-pro-free",
    },
    body: JSON.stringify({
      text,
      reference_id: process.env.FISH_REFERENCE_ID,
      format: "mp3",
    }),
  });

  if (!upstream.ok || !upstream.body) {
    return Response.json({ error: "upstream", status: upstream.status }, { status: 502 });
  }

  return new Response(upstream.body, {
    headers: { "Content-Type": "audio/mpeg", "Cache-Control": "private, max-age=3600" },
  });
}
