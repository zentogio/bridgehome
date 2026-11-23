"use client";

import { Card, LevelBadge, MockBtn, PageHeader, Section } from "@/components/ui";
import { useDemo, timeAgo } from "@/lib/store";
import { FAMILY } from "@/lib/data";
import { Mic, Phone } from "lucide-react";
import Link from "next/link";

const DAYS = ["จ.", "อ.", "พ.", "พฤ.", "ศ.", "ส.", "อา."];
const MOOD = [4, 4, 3, 2, 3, 4, 4]; // ข้อมูลตัวอย่าง 1-5

export default function Health() {
  const s = useDemo();
  const calls = s.events.filter((e) => e.by === "nongyai").slice(0, 6);

  return (
    <>
      <PageHeader title="ข่าวจากน้องใย" sub={`${FAMILY.parentName} · โทรทุกเช้า`} />
      <main className="mx-auto max-w-2xl space-y-6 px-4 py-5">
        <Card>
          <h2 className="text-lg font-bold">อารมณ์ 7 วันล่าสุด</h2>
          <p className="text-sm text-muted">ข้อมูลตัวอย่าง · ยิ่งสูงยิ่งอารมณ์ดี</p>
          <div className="mt-4 flex h-36 items-end justify-between gap-2" role="img" aria-label={`กราฟอารมณ์ ${MOOD.map((m, i) => `${DAYS[i]} ${m}`).join(" ")} จาก 5`}>
            {MOOD.map((m, i) => (
              <div key={i} className="flex flex-1 flex-col items-center gap-1">
                <span className="text-sm font-bold">{m}</span>
                <div
                  className={`w-full rounded-t-xl ${m <= 2 ? "bg-warn" : m === 3 ? "bg-thread" : "bg-brand"}`}
                  style={{ height: `${m * 20}%` }}
                />
                <span className="text-sm text-muted">{DAYS[i]}</span>
              </div>
            ))}
          </div>
        </Card>

        <Card>
          <h2 className="text-lg font-bold">ผลคัดกรองซึมเศร้า</h2>
          <ul className="mt-3 space-y-3 text-base">
            <li className="flex items-center justify-between gap-2 rounded-2xl bg-sheet p-3">
              <span>2Q (สัปดาห์ละครั้ง)</span>
              <span className="font-semibold">รอบล่าสุดตอบ “ไม่มี”</span>
            </li>
            <li className="flex items-center justify-between gap-2 rounded-2xl bg-sheet p-3">
              <span>9Q</span>
              <span className="font-semibold text-muted">ยังไม่ต้องประเมิน</span>
            </li>
          </ul>
          <p className="mt-3 text-sm text-muted">
            คัดกรองและส่งต่อตามแบบของกรมสุขภาพจิต ไม่ใช่การวินิจฉัย · สายด่วน 1323
          </p>
        </Card>

        <Section title="บทสรุปการคุย" right={<Link href="/parent/talk" className="text-base font-semibold text-brand">ลองคุยเอง →</Link>}>
          <ul className="space-y-3">
            {calls.length === 0 && <li className="text-muted">ยังไม่มีบทสนทนา</li>}
            {calls.map((e) => (
              <li key={e.id} className="rounded-2xl border border-line bg-white p-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="flex items-center gap-2 font-bold"><Mic className="h-4 w-4 text-brand" aria-hidden /> {e.title}</p>
                  <LevelBadge level={e.level} />
                </div>
                <p className="mt-1 text-base">{e.detail}</p>
                <p className="mt-1 text-sm text-muted">{timeAgo(e.ts)}</p>
              </li>
            ))}
          </ul>
        </Section>

        <div className="grid gap-3 sm:grid-cols-2">
          <a href="tel:0000000000" className="inline-flex min-h-12 items-center justify-center gap-2 rounded-2xl bg-brand font-semibold text-white">
            <Phone className="h-5 w-5" aria-hidden /> โทรหาคุณยาย
          </a>
          <MockBtn variant="ghost" note="เดโม: ตั้งเวลาและความถี่ที่น้องใยโทร (ปัจจุบันตั้งไว้ 07:30 ทุกวัน)">ตั้งเวลาน้องใยโทร</MockBtn>
        </div>
      </main>
    </>
  );
}
