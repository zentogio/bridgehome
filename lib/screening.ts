import type { Level } from "./store";

/** แบบประเมินโรคซึมเศร้า 9Q (กรมสุขภาพจิต) ตามขั้นตอนในรายงาน: ตัดสินด้วยกฎตายตัว ไม่ใช้ AI */
export const Q9 = [
  "เบื่อ ไม่สนใจอยากทำอะไร",
  "ไม่สบายใจ ซึมเศร้า ท้อแท้",
  "หลับยาก หลับๆ ตื่นๆ หรือหลับมากไป",
  "เหนื่อยง่าย หรือไม่ค่อยมีแรง",
  "เบื่ออาหาร หรือกินมากเกินไป",
  "รู้สึกไม่ดีกับตัวเอง คิดว่าตัวเองล้มเหลว หรือทำให้ตนเองหรือครอบครัวผิดหวัง",
  "สมาธิไม่ดีเวลาทำอะไร เช่น ดูโทรทัศน์ ฟังวิทยุ",
  "พูดหรือทำอะไรช้าจนคนอื่นสังเกตเห็น หรือกระสับกระส่ายอยู่ไม่นิ่งกว่าที่เคย",
  "คิดทำร้ายตนเอง หรือคิดว่าถ้าตายไปเสียคงจะดี",
];

export const Q9_OPTIONS = [
  { v: 0, label: "ไม่มีเลย" },
  { v: 1, label: "เป็นบางวัน" },
  { v: 2, label: "เป็นบ่อย" },
  { v: 3, label: "เป็นทุกวัน" },
];

export function score9Q(ans: number[]): { score: number; level: Level; band: string; text: string } {
  const score = ans.reduce((a, b) => a + b, 0);
  const q9 = ans[8] ?? 0;
  const band = score < 7 ? "ไม่มีหรือน้อยมาก" : score < 13 ? "น้อย" : score < 19 ? "ปานกลาง" : "รุนแรง";
  if (score >= 19 || q9 > 0) {
    return {
      score,
      level: "red",
      band,
      text: "แจ้งลูกและพยาบาลทันที พร้อมประเมินต่อ และขอให้ติดต่อสายด่วนสุขภาพจิต 1323 หรือ 1669 ถ้าฉุกเฉิน",
    };
  }
  if (score >= 7) {
    return { score, level: "yellow", band, text: "แจ้งลูกให้โทรคุย ชวนพบแพทย์หรือ รพ.สต. ใกล้บ้าน" };
  }
  return { score, level: "green", band, text: "ยังไม่พบสัญญาณที่ต้องส่งต่อ น้องใยจะถามซ้ำตามรอบ" };
}

/** เกณฑ์สัญญาณชีพตัวอย่างสำหรับเดโม (ไม่ใช่คำวินิจฉัย ต้องให้พยาบาลทีมรับรองก่อนใช้จริง) */
export function judgeVital(v: { sys?: number; dia?: number; sugar?: number; temp?: number }): { level: Level; reasons: string[] } {
  let level: Level = "green";
  const reasons: string[] = [];
  const up = (l: Level, why: string) => {
    reasons.push(why);
    if (l === "red" || (l === "yellow" && level === "green")) level = l;
  };
  if (v.sys && v.dia) {
    if (v.sys >= 180 || v.dia >= 110) up("red", `ความดัน ${v.sys}/${v.dia} สูงมาก`);
    else if (v.sys >= 140 || v.dia >= 90) up("yellow", `ความดัน ${v.sys}/${v.dia} สูงกว่าปกติ`);
    else if (v.sys < 90 || v.dia < 60) up("yellow", `ความดัน ${v.sys}/${v.dia} ต่ำกว่าปกติ`);
  }
  if (v.sugar) {
    if (v.sugar >= 250 || v.sugar < 70) up("red", `น้ำตาล ${v.sugar} ผิดปกติมาก`);
    else if (v.sugar >= 180) up("yellow", `น้ำตาล ${v.sugar} ค่อนข้างสูง`);
  }
  if (v.temp) {
    if (v.temp >= 38.5) up("red", `ไข้ ${v.temp} °C`);
    else if (v.temp >= 37.5) up("yellow", `อุณหภูมิ ${v.temp} °C เริ่มมีไข้`);
  }
  return { level, reasons };
}
