// น้องใยคุยแบบธรรมชาติด้วย LLM: Typhoon (โมเดลภาษาไทยของ SCB 10X) เป็นหลัก สำรองด้วย Gemini / Groq ตามคีย์ที่มี
// - LLM แต่งประโยคตอบรับ + ชวนคุยต่อ + ถามคำถามถัดไปให้เป็นธรรมชาติ
// - สีเขียว/เหลือง/แดง และคีย์เวิร์ดอันตราย ตัดสินด้วยกฎตายตัวฝั่งไคลเอนต์เสมอ LLM ไม่มีสิทธิ์ลดระดับ
// - 2Q ต้องถามตามถ้อยคำมาตรฐานของกรมสุขภาพจิต จึงสั่งให้ LLM ใช้ประโยคเดิมแบบคำต่อคำ

type Turn = { role: "ny" | "me"; text: string };

const SYSTEM = `คุณคือ "น้องใย" หลานสาวผู้ช่วยเสียงของแอปสายใย กำลังโทรคุยกับคุณยายวัย 79 ตอนเช้า
นิสัย: อบอุ่น สุภาพ ใจเย็น ฟังจริง พูดภาษาไทยแบบพูด ลงท้าย "ค่ะ/นะคะ" เรียกผู้ใช้ว่า "คุณยาย"
หน้าที่ในแต่ละเทิร์น:
1) ตอบรับสิ่งที่คุณยายเพิ่งพูดอย่างเฉพาะเจาะจง (สะท้อนคำของคุณยาย ไม่ใช่คำกลางๆ) ถ้าคุณยายเล่าเรื่องอื่น ให้คุยด้วยสั้นๆ อย่างใส่ใจ
2) แล้วถามคำถามถัดไปตามหัวข้อที่ระบบกำหนดให้ เรียบเรียงใหม่ให้ลื่นไหลได้ ยกเว้นคำถามที่ระบบบอกว่า "ต้องใช้ถ้อยคำเดิม" ให้ใช้ตามนั้นทุกคำ
3) ถ้าไม่มีคำถามถัดไป ให้กล่าวลาอย่างอบอุ่นและบอกว่าจะเล่าให้คุณเพ็ญฟัง
ข้อห้าม: ห้ามวินิจฉัยโรค ห้ามแนะนำยาหรือขนาดยา ห้ามถามเรื่องเงิน รหัส หรือข้อมูลบัญชี ห้ามสัญญาว่าจะหายเหงา/หายป่วย
ความยาว: รวมไม่เกิน 2 ประโยค ไม่เกิน 45 คำ เพราะจะถูกอ่านออกเสียงให้ผู้สูงอายุฟัง
ภาษา: ใช้ภาษาไทยล้วนเท่านั้น ห้ามมีตัวอักษรจีน ญี่ปุ่น เกาหลี หรือคำภาษาอังกฤษ
ตอบเป็น JSON เท่านั้น: {"reply": "ข้อความที่จะพูด", "good": true|false|null}
good = คำตอบของคุณยายในหัวข้อปัจจุบันเป็นเรื่องปกติดี (true) หรือน่าห่วง (false) ถ้าไม่แน่ใจให้ null`;

const FREE_SYSTEM = `คุณคือ "น้องใย" หลานสาวผู้ช่วยเสียงของแอปสายใย ตอนนี้ถามเรื่องสุขภาพครบแล้ว และคุณยายวัย 79 อยากคุยเล่นต่อ
คุยแบบสารทุกข์สุขดิบเหมือนหลานคุยกับยาย: ฟังให้มาก ตอบรับอย่างอบอุ่นและเจาะจงกับสิ่งที่คุณยายเล่า แล้วชวนเล่าต่อด้วยคำถามง่ายๆ ข้อเดียว
หัวข้อที่เหมาะ: ลูกหลาน ความหลัง อาหาร ต้นไม้ อากาศ ละคร เพลงเก่า งานบุญ ไม่ถามเรื่องสุขภาพซ้ำ
พูดไทยแบบพูด ลงท้าย ค่ะ/นะคะ เรียกว่าคุณยาย ไม่เกิน 2 ประโยค ไม่เกิน 40 คำ ใช้ภาษาไทยล้วน
ข้อห้าม: ห้ามวินิจฉัยโรค ห้ามแนะนำยา ห้ามถามเรื่องเงิน รหัส บัญชี ห้ามพูดเรื่องการเมืองหรือศาสนาแบบชี้นำ
ถ้าคุณยายบอกว่าพอแล้ว จะไปพัก หรือบอกลา ให้กล่าวลาอย่างอบอุ่นแล้วตั้ง end เป็น true
ตอบเป็น JSON เท่านั้น: {"reply": "ข้อความที่จะพูด", "end": true|false}`;

function buildUser(b: { history: Turn[]; topic: string; answer: string; next: string | null; verbatim: boolean }) {
  const hist = b.history
    .slice(-8)
    .map((t) => `${t.role === "ny" ? "น้องใย" : "คุณยาย"}: ${t.text}`)
    .join("\n");
  return `บทสนทนาที่ผ่านมา:\n${hist}\n\nหัวข้อที่เพิ่งถาม: ${b.topic}\nคุณยายเพิ่งตอบ: "${b.answer}"\n${
    b.next ? `คำถามถัดไป${b.verbatim ? " (ต้องใช้ถ้อยคำเดิมทุกคำ)" : ""}: ${b.next}` : "ไม่มีคำถามถัดไป ให้กล่าวลา"
  }`;
}

async function viaGemini(key: string, user: string, sys: string) {
  const model = process.env.GEMINI_MODEL || "gemini-2.5-flash";
  const r = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`, {
    method: "POST",
    headers: { "Content-Type": "application/json", "x-goog-api-key": key },
    body: JSON.stringify({
      systemInstruction: { parts: [{ text: sys }] },
      contents: [{ role: "user", parts: [{ text: user }] }],
      generationConfig: { temperature: 0.8, maxOutputTokens: 300, responseMimeType: "application/json", thinkingConfig: { thinkingBudget: 0 } },
    }),
    signal: AbortSignal.timeout(8000),
  });
  if (!r.ok) throw new Error(`gemini ${r.status}`);
  const j = (await r.json()) as { candidates?: { content?: { parts?: { text?: string }[] } }[] };
  return j.candidates?.[0]?.content?.parts?.[0]?.text ?? "";
}

async function viaTyphoon(key: string, user: string, sys: string) {
  const r = await fetch("https://api.opentyphoon.ai/v1/chat/completions", {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${key}` },
    body: JSON.stringify({
      model: process.env.TYPHOON_MODEL || "typhoon-v2.5-30b-a3b-instruct",
      temperature: 0.7,
      max_tokens: 300,
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: sys },
        { role: "user", content: user },
      ],
    }),
    // ฟรีบางช่วงช้ามาก (วัดได้ 7–17 วินาที) จึงรอไม่เกิน 4.5 วินาที แล้วใช้ตัวสำรองต่อ ไม่ให้คุณยายรอสายเงียบ
    signal: AbortSignal.timeout(Number(process.env.TYPHOON_TIMEOUT_MS) || 4500),
  });
  if (!r.ok) throw new Error(`typhoon ${r.status}`);
  const j = (await r.json()) as { choices?: { message?: { content?: string } }[] };
  return j.choices?.[0]?.message?.content ?? "";
}

async function viaGroq(key: string, user: string, sys: string) {
  const r = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${key}` },
    body: JSON.stringify({
      model: process.env.GROQ_MODEL || "llama-3.3-70b-versatile",
      temperature: 0.8,
      max_tokens: 300,
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: sys },
        { role: "user", content: user },
      ],
    }),
    signal: AbortSignal.timeout(8000),
  });
  if (!r.ok) throw new Error(`groq ${r.status}`);
  const j = (await r.json()) as { choices?: { message?: { content?: string } }[] };
  return j.choices?.[0]?.message?.content ?? "";
}

export async function POST(req: Request) {
  const typhoon = process.env.TYPHOON_API_KEY;
  const gemini = process.env.GEMINI_API_KEY;
  const groq = process.env.GROQ_API_KEY;
  if (!typhoon && !gemini && !groq) return Response.json({ reply: null, good: null, reason: "no_key" });

  let body: { history: Turn[]; topic: string; answer: string; next: string | null; verbatim: boolean; free: boolean };
  try {
    const b = (await req.json()) as Partial<typeof body>;
    body = {
      history: Array.isArray(b.history) ? b.history.slice(-8).map((t) => ({ role: t.role === "me" ? "me" : "ny", text: String(t.text).slice(0, 300) })) : [],
      topic: String(b.topic ?? "").slice(0, 200),
      answer: String(b.answer ?? "").slice(0, 300),
      next: b.next ? String(b.next).slice(0, 300) : null,
      verbatim: !!b.verbatim,
      free: (b as { mode?: unknown }).mode === "free",
    };
  } catch {
    return Response.json({ reply: null, good: null });
  }
  if (!body.answer) return Response.json({ reply: null, good: null });

  const sys = body.free ? FREE_SYSTEM : SYSTEM;
  const user = body.free
    ? [
        "บทสนทนาที่ผ่านมา:",
        ...body.history.map((t) => `${t.role === "ny" ? "น้องใย" : "คุณยาย"}: ${t.text}`),
        "",
        `คุณยายเพิ่งพูด: "${body.answer}"`,
      ].join("\n")
    : buildUser(body);
  const tries: (() => Promise<string>)[] = [];
  if (typhoon) tries.push(() => viaTyphoon(typhoon, user, sys));
  if (gemini) tries.push(() => viaGemini(gemini, user, sys));
  if (groq) tries.push(() => viaGroq(groq, user, sys));

  for (const t of tries) {
    try {
      const raw = await t();
      const p = JSON.parse(raw.replace(/^```(json)?|```$/g, "").trim()) as { reply?: unknown; good?: unknown; end?: unknown };
      // กันโมเดลหลุดอักษรจีน/ญี่ปุ่น/เกาหลี (เช่น "呢") ซึ่งเสียงพูดภาษาไทยจะอ่านเพี้ยน
      const reply =
        typeof p.reply === "string"
          ? p.reply.replace(/[　-鿿가-힯＀-￯]/g, "").replace(/\s{2,}/g, " ").trim()
          : "";
      if (!reply || reply.length > 400) continue;
      // ถ้าต้องใช้ถ้อยคำเดิม (2Q) แต่ LLM ไม่ได้ใส่มา ให้ต่อท้ายเอง
      const safe = body.verbatim && body.next && !reply.includes(body.next.slice(0, 20)) ? `${reply} ${body.next}` : reply;
      return Response.json({ reply: safe, good: typeof p.good === "boolean" ? p.good : null, end: p.end === true });
    } catch {
      /* ลองผู้ให้บริการถัดไป */
    }
  }
  return Response.json({ reply: null, good: null, reason: "upstream" });
}
