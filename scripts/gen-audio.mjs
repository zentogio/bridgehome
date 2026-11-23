// สร้างไฟล์เสียงล่วงหน้าด้วย Fish Audio ใส่ public/audio/ (ใช้ตอนพรีเซนต์ ไม่ต้องรอเน็ต/ไม่เสียเครดิตซ้ำ)
// รัน: node --env-file=.env.local scripts/gen-audio.mjs
import { mkdir, writeFile } from "node:fs/promises";

const key = process.env.FISH_API_KEY;
if (!key) throw new Error("ไม่พบ FISH_API_KEY ใน .env.local");

const LINES = {
  greet:
    "สวัสดีค่ะคุณยาย น้องใยเองนะคะ น้องใยที่คุณเพ็ญให้มาคุยกับคุณยายค่ะ",
};

await mkdir("public/audio", { recursive: true });
for (const [name, text] of Object.entries(LINES)) {
  const r = await fetch("https://api.fish.audio/v1/tts", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
      model: process.env.FISH_MODEL || "s2.1-pro-free",
    },
    body: JSON.stringify({ text, reference_id: process.env.FISH_REFERENCE_ID, format: "mp3" }),
  });
  if (!r.ok) throw new Error(`${name}: HTTP ${r.status}`);
  await writeFile(`public/audio/${name}.mp3`, Buffer.from(await r.arrayBuffer()));
  console.log("สร้างแล้ว", name);
}
