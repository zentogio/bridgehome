"use client";

import { Copy, Send } from "lucide-react";
import { Btn, MockBtn, PageHeader } from "@/components/ui";
import { useDemo, useToday, worstLevel } from "@/lib/store";
import { SHIFTS } from "@/lib/data";
import { useToast } from "@/components/toast";

const EMOJI_FREE = { green: "เขียว ปกติ", yellow: "เหลือง ควรติดตาม", red: "แดง ต้องทำทันที" };

export default function LineSummary() {
  const s = useDemo();
  const today = useToday();
  const toast = useToast();
  const p = s.profile;
  const todayEv = s.events.filter((e) => new Date(e.ts).toDateString() === today);
  const level = worstLevel(todayEv.length ? todayEv : s.events.slice(0, 1));
  const done = SHIFTS.filter((x) => s.shiftsDone[x.id]).length;
  const v = s.vitals[0];
  const latest = s.events.filter((e) => e.by === "nongyai" || e.by === "parent").slice(0, 2);
  const medsDone = Object.keys(s.medsTaken).filter((k) => s.medsTaken[k] === today).length;

  const lines = [
    `สรุปประจำวัน · ${p.parent}`,
    `สถานะ: ${EMOJI_FREE[level]}`,
    ...latest.map((e) => `• ${e.title}: ${e.detail}`),
    v ? `• สัญญาณชีพล่าสุด: ${[v.sys && v.dia ? `ความดัน ${v.sys}/${v.dia}` : "", v.sugar ? `น้ำตาล ${v.sugar}` : "", v.temp ? `ไข้ ${v.temp}°` : ""].filter(Boolean).join(" ")}` : null,
    `• ยาวันนี้: กินแล้ว ${medsDone}/3 รายการ`,
    `• เวรวันนี้: ทำแล้ว ${done}/${SHIFTS.length} งาน`,
    level !== "green" ? "→ แนะนำให้โทรหาท่านวันนี้" : "→ ทุกอย่างเป็นไปตามแผน",
  ].filter(Boolean) as string[];
  const text = lines.join("\n");

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      toast("คัดลอกข้อความแล้ว วางในกลุ่ม LINE ได้เลย");
    } catch {
      toast("เบราว์เซอร์ไม่อนุญาตให้คัดลอก ลองกดค้างที่ข้อความ");
    }
  };

  return (
    <>
      <PageHeader title="สรุปเข้ากลุ่ม LINE" sub="ลูกอ่านจบใน 10 วินาที" back="/care" />
      <main className="mx-auto max-w-2xl space-y-5 px-5 py-5">
        <p className="text-base text-muted">ตัวอย่างข้อความที่ระบบจะส่งเข้ากลุ่ม LINE ครอบครัวทุกเย็น สร้างจากข้อมูลจริงในแอป ณ ตอนนี้</p>

        <div className="rounded-2xl bg-[#e9efe4] p-4">
          <div className="flex items-start gap-2">
            <span className="mt-1 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-brand text-sm font-medium text-white" aria-hidden>ใย</span>
            <div className="min-w-0">
              <p className="text-sm text-muted">Bridge Home × สายใย</p>
              <pre className="mt-1 whitespace-pre-wrap rounded-2xl rounded-tl-md bg-white p-4 font-[inherit] text-base leading-relaxed">{text}</pre>
            </div>
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <Btn onClick={copy}><Copy className="h-5 w-5" aria-hidden /> คัดลอกข้อความ</Btn>
          <MockBtn variant="soft" note="เดโม: จะส่งเข้ากลุ่ม LINE ครอบครัวผ่าน LINE Official Account (ต้องเชื่อมกลุ่มก่อน)">
            <Send className="h-5 w-5" aria-hidden /> ส่งเข้ากลุ่ม LINE
          </MockBtn>
        </div>
      </main>
    </>
  );
}
