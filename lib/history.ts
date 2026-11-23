import type { Level } from "./store";

/** ประวัติย้อนหลังจำลอง 35 วัน เล่าเรื่องตามรายงาน (ยายนอนไม่หลับหลายคืน → 2Q บวก → ลูกโทร แบ่งเวร → ดีขึ้น) */
export type DayLog = { level: Level; mood: number; bp: string; turns: string; items: { t: string; level: Level }[] };

const STORY: Record<number, Omit<DayLog, "bp" | "turns"> & { turns?: string }> = {
  1: { level: "green", mood: 4, items: [{ t: "คุณเพ็ญแบ่งเวรพลิกตัวกลางคืนให้ต้น", level: "green" }, { t: "น้องใย: คุณยายนอนได้ดีขึ้น", level: "green" }] },
  2: { level: "yellow", mood: 2, items: [{ t: "น้องใย: คุณยายตอบ 2Q ว่า “มี”", level: "yellow" }, { t: "คุณเพ็ญโทรหาคุณยาย 25 นาที", level: "green" }] },
  3: { level: "yellow", mood: 2, items: [{ t: "น้องใย: นอนไม่หลับคืนที่ 4 ไม่อยากกินข้าว", level: "yellow" }] },
  4: { level: "green", mood: 3, items: [{ t: "น้องใย: นอนหลับๆ ตื่นๆ", level: "green" }] },
  5: { level: "green", mood: 3, items: [{ t: "น้องใย: คุณยายบอกว่าเหนื่อยตอนพลิกตัวกลางคืน", level: "green" }] },
  8: { level: "yellow", mood: 3, turns: "10/12", items: [{ t: "พลิกตัวขาด 2 รอบ (ป้าแดงติดธุระ)", level: "yellow" }] },
  12: { level: "red", mood: 3, items: [{ t: "คุณตามีไข้ 38.6 °C", level: "red" }, { t: "พยาบาลโทรภายใน 15 นาที แนะนำเช็ดตัว + ไปตรวจ", level: "green" }] },
  11: { level: "yellow", mood: 3, items: [{ t: "ไข้ลดเหลือ 37.6 °C", level: "yellow" }] },
  18: { level: "green", mood: 4, items: [{ t: "พยาบาลอนุมัติแผนดูแลจากใบจำหน่าย", level: "green" }] },
  19: { level: "green", mood: 4, items: [{ t: "ถ่ายใบจำหน่าย AI ร่างแผนใน 4 นาที", level: "green" }] },
  20: { level: "yellow", mood: 3, items: [{ t: "คุณตากลับจากโรงพยาบาล เริ่มใช้ Care+", level: "yellow" }] },
};

export function historyFor(daysAgo: number): DayLog | null {
  if (daysAgo < 1 || daysAgo > 35) return null;
  const s = STORY[daysAgo];
  const sys = 126 + ((daysAgo * 7) % 11);
  const dia = 78 + ((daysAgo * 5) % 8);
  if (s) return { ...s, bp: `${sys}/${dia}`, turns: s.turns ?? (daysAgo > 20 ? "-" : "12/12") };
  if (daysAgo > 20) {
    return { level: "green", mood: 4, bp: `${sys}/${dia}`, turns: "-", items: [{ t: "คุณยายกด “สบายดี”", level: "green" }] };
  }
  return {
    level: "green",
    mood: 3 + (daysAgo % 2),
    bp: `${sys}/${dia}`,
    turns: "12/12",
    items: [{ t: "น้องใย: นอน ยา อาหาร ปกติ", level: "green" }, { t: "พลิกตัวครบ 12 รอบ", level: "green" }],
  };
}
