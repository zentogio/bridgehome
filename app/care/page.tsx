"use client";

import Link from "next/link";
import { Camera, MessageSquareHeart, Video, Phone, Activity, Pill, MessagesSquare, HeartHandshake, CalendarDays } from "lucide-react";
import { LevelBadge, MockBtn, LEVEL_UI } from "@/components/ui";
import { LogoMark } from "@/components/logo";
import { useToast, MOCK_MSG } from "@/components/toast";
import { useDemo, worstLevel, timeAgo } from "@/lib/store";
import { SHIFTS } from "@/lib/data";

const BAND = {
  green: "bg-ok-soft text-ok",
  yellow: "bg-warn-soft text-warn",
  red: "bg-bad-soft text-bad",
};

export default function CareHome() {
  const s = useDemo();
  const toast = useToast();
  const today = s.events.filter((e) => new Date(e.ts).toDateString() === new Date().toDateString());
  const level = worstLevel(today.length ? today : s.events.slice(0, 1));
  const L = LEVEL_UI[level];
  const done = SHIFTS.filter((x) => s.shiftsDone[x.id]).length;
  const recent = s.events.slice(0, 8);

  const msg =
    level === "red"
      ? "มีเหตุที่ต้องทำทันที โทรหาท่านหรือติดต่อพยาบาล"
      : level === "yellow"
        ? "มีสัญญาณที่ควรติดตาม โทรคุยกับท่านวันนี้"
        : "วันนี้ทุกอย่างเป็นไปตามแผน";

  const quick = [
    { Icon: Camera, label: "ถ่ายใบจำหน่าย", href: "/care/plan" },
    { Icon: CalendarDays, label: "ปฏิทินย้อนหลัง", href: "/care/calendar" },
    { Icon: Activity, label: "สัญญาณชีพ", href: "/care/vitals" },
    { Icon: Pill, label: "ยา/นัดหมอ", href: "/care/meds" },
    { Icon: MessagesSquare, label: "คุยพยาบาล", href: "/care/chat" },
    { Icon: MessageSquareHeart, label: "สรุปเข้า LINE", href: "/care/line" },
    { Icon: HeartHandshake, label: "เช็กใจผู้ดูแล", href: "/care/self" },
    { Icon: Video, label: "โค้ชท่าพลิกตัว", note: "เดโม: โค้ชท่าพลิกตัวผ่านกล้องมือถือ (Pose estimation) ยังไม่เชื่อมกล้อง" },
  ];

  return (
    <>
      <header className="mx-auto flex max-w-2xl items-center justify-between px-5 pb-2 pt-4">
        <div className="flex items-center gap-3">
          <LogoMark size={40} />
          <div className="leading-tight">
            <p className="text-lg font-bold">สวัสดี คุณ{s.profile.caregiver}</p>
            <p className="text-sm text-muted">ทีมดูแล{s.profile.parent} และ{s.profile.patient}</p>
          </div>
        </div>
        <Link href="/start" className="hide-in-frame flex min-h-12 items-center rounded-full px-3 text-sm font-semibold text-brand">เปลี่ยนมุมมอง</Link>
      </header>

      <main className="mx-auto max-w-2xl px-5 pb-6">
        <section className={`mt-3 rounded-2xl p-5 ${BAND[level]}`} aria-label="สถานะวันนี้">
          <LevelBadge level={level} className="!bg-white/70" />
          <p className="mt-3 font-display text-2xl font-bold leading-snug text-ink">{msg}</p>
          <p className="mt-1 text-base text-ink/70">
            ทำเวรแล้ว {done}/{SHIFTS.length} งาน · สถานะ{L.word}
          </p>
          {level !== "green" && (
            <div className="mt-4 flex flex-wrap gap-3">
              <a href="tel:0000000000" className="inline-flex min-h-12 items-center gap-2 rounded-xl bg-ink px-5 font-semibold text-white">
                <Phone className="h-5 w-5" aria-hidden /> โทรหาคุณยาย
              </a>
              <MockBtn variant="ghost" note="เดโม: จะเปิดแชตกับพยาบาลคลินิกพาร์ตเนอร์">ปรึกษาพยาบาล</MockBtn>
            </div>
          )}
        </section>

        <nav aria-label="ทางลัด" className="mt-6 grid grid-cols-4 gap-x-2 gap-y-3">
          {quick.map(({ Icon, label, href, note }) => {
            const inner = (
              <>
                <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-soft text-brand">
                  <Icon className="h-7 w-7" aria-hidden />
                </span>
                <span className="text-center text-[0.8rem] font-semibold leading-tight">{label}</span>
              </>
            );
            return href ? (
              <Link key={label} href={href} className="flex min-h-24 flex-col items-center gap-1.5 rounded-xl py-1 active:bg-sheet">
                {inner}
              </Link>
            ) : (
              <button key={label} onClick={() => toast(note ?? MOCK_MSG)} className="flex min-h-24 flex-col items-center gap-1.5 rounded-xl py-1 active:bg-sheet">
                {inner}
              </button>
            );
          })}
        </nav>

        <section className="mt-8" aria-labelledby="feed-h">
          <div className="flex items-baseline justify-between">
            <h2 id="feed-h" className="text-lg font-bold">เหตุการณ์ล่าสุด</h2>
            <span className="text-sm text-muted">อัปเดตอัตโนมัติ</span>
          </div>
          <ol className="relative mt-4 space-y-5 pl-8">
            <span className="thread-line absolute bottom-2 left-[7px] top-2" aria-hidden />
            {recent.map((e) => (
              <li key={e.id} className="relative">
                <span
                  className={`absolute -left-8 top-1.5 h-4 w-4 rounded-full border-[3px] border-white ${
                    e.level === "red" ? "bg-bad" : e.level === "yellow" ? "bg-warn" : "bg-ok"
                  }`}
                  aria-hidden
                />
                <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1">
                  <p className="font-bold">{e.title}</p>
                  <LevelBadge level={e.level} />
                </div>
                <p className="mt-0.5 text-base text-muted">{e.detail}</p>
                <p className="text-sm text-muted">{timeAgo(e.ts)}</p>
              </li>
            ))}
          </ol>
        </section>
      </main>
    </>
  );
}
