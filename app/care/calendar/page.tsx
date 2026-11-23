"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight, Activity, BedDouble, Smile } from "lucide-react";
import { LevelBadge, PageHeader } from "@/components/ui";
import { useDemo, useToday, type Level } from "@/lib/store";
import { historyFor } from "@/lib/history";

const WD = ["อา", "จ", "อ", "พ", "พฤ", "ศ", "ส"];
const DOT: Record<Level, string> = { green: "bg-ok", yellow: "bg-[#e5a530]", red: "bg-bad" };
const DAY = 86400000;

export default function CalendarPage() {
  const s = useDemo();
  const todayKey = useToday();
  const today = todayKey ? new Date(todayKey) : null;
  const [offset, setOffset] = useState(0); // เดือนที่แสดง เทียบกับเดือนนี้
  const [picked, setPicked] = useState<number | null>(null); // daysAgo

  if (!today) return <PageHeader title="ปฏิทินย้อนหลัง" back="/care" />;

  const month = new Date(today.getFullYear(), today.getMonth() + offset, 1);
  const days = new Date(month.getFullYear(), month.getMonth() + 1, 0).getDate();
  const lead = month.getDay();
  const daysAgoOf = (d: number) => Math.round((today.getTime() - new Date(month.getFullYear(), month.getMonth(), d).getTime()) / DAY);

  const dayData = (ago: number) => {
    const date = new Date(today.getTime() - ago * DAY).toDateString();
    const live = s.events.filter((e) => new Date(e.ts).toDateString() === date);
    const h = historyFor(ago);
    const items = [...live.map((e) => ({ t: `${e.title}: ${e.detail}`, level: e.level })), ...(h?.items ?? [])];
    if (!items.length) return null;
    const level: Level = items.some((i) => i.level === "red") ? "red" : items.some((i) => i.level === "yellow") ? "yellow" : "green";
    return { level, items, h };
  };

  const sel = picked !== null ? dayData(picked) : null;
  const selDate = picked !== null ? new Date(today.getTime() - picked * DAY) : null;

  return (
    <>
      <PageHeader title="ปฏิทินย้อนหลัง" sub="แตะวันที่เพื่อดูสรุปของวันนั้น" back="/care" />
      <main className="mx-auto max-w-2xl space-y-5 px-5 py-4">
        <div className="flex items-center justify-between">
          <button onClick={() => setOffset(offset - 1)} aria-label="เดือนก่อน" className="flex h-12 w-12 items-center justify-center rounded-full hover:bg-sheet"><ChevronLeft className="h-6 w-6" aria-hidden /></button>
          <p className="text-lg font-semibold">{month.toLocaleDateString("th-TH", { month: "long", year: "numeric" })}</p>
          <button onClick={() => setOffset(Math.min(0, offset + 1))} disabled={offset >= 0} aria-label="เดือนถัดไป" className="flex h-12 w-12 items-center justify-center rounded-full hover:bg-sheet disabled:opacity-30"><ChevronRight className="h-6 w-6" aria-hidden /></button>
        </div>

        <div>
          <div className="grid grid-cols-7 text-center text-sm font-medium text-muted">
            {WD.map((w) => <span key={w} className="py-1">{w}</span>)}
          </div>
          <div className="grid grid-cols-7 gap-1">
            {Array.from({ length: lead }).map((_, i) => <span key={`b${i}`} />)}
            {Array.from({ length: days }).map((_, i) => {
              const d = i + 1;
              const ago = daysAgoOf(d);
              const data = ago >= 0 ? dayData(ago) : null;
              const isToday = ago === 0;
              const on = picked === ago;
              return (
                <button
                  key={d}
                  disabled={ago < 0 || !data}
                  onClick={() => setPicked(ago)}
                  aria-pressed={on}
                  aria-label={`วันที่ ${d}${data ? ` สถานะ${data.level === "red" ? "แดง" : data.level === "yellow" ? "เหลือง" : "เขียว"}` : " ไม่มีข้อมูล"}`}
                  className={`flex aspect-square flex-col items-center justify-center gap-1 rounded-xl text-base transition-colors duration-150 disabled:text-muted/50 ${on ? "bg-brand text-white" : isToday ? "bg-brand-soft font-semibold text-brand" : "hover:bg-sheet"}`}
                >
                  <span className="tnum leading-none">{d}</span>
                  <span className={`h-1.5 w-1.5 rounded-full ${data ? DOT[data.level] : "bg-transparent"} ${on ? "ring-2 ring-white" : ""}`} aria-hidden />
                </button>
              );
            })}
          </div>
          <p className="mt-2 flex items-center justify-center gap-4 text-sm text-muted">
            <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-ok" />ปกติ</span>
            <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-[#e5a530]" />ควรดู</span>
            <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-bad" />ด่วน</span>
          </p>
        </div>

        {sel && selDate ? (
          <section className="space-y-3" aria-live="polite">
            <div className="flex items-center justify-between gap-2">
              <h2 className="text-lg font-semibold">{selDate.toLocaleDateString("th-TH", { weekday: "long", day: "numeric", month: "long" })}</h2>
              <LevelBadge level={sel.level} />
            </div>
            {sel.h && (
              <div className="grid grid-cols-3 gap-2 text-center">
                <div className="rounded-2xl bg-sheet p-3"><Smile className="mx-auto h-5 w-5 text-brand" aria-hidden /><p className="tnum mt-1 text-lg font-semibold">{sel.h.mood}/5</p><p className="text-xs text-muted">อารมณ์</p></div>
                <div className="rounded-2xl bg-sheet p-3"><Activity className="mx-auto h-5 w-5 text-brand" aria-hidden /><p className="tnum mt-1 text-lg font-semibold">{sel.h.bp}</p><p className="text-xs text-muted">ความดัน</p></div>
                <div className="rounded-2xl bg-sheet p-3"><BedDouble className="mx-auto h-5 w-5 text-brand" aria-hidden /><p className="tnum mt-1 text-lg font-semibold">{sel.h.turns}</p><p className="text-xs text-muted">พลิกตัว</p></div>
              </div>
            )}
            <ul className="divide-y divide-line border-y border-line">
              {sel.items.map((it, i) => (
                <li key={i} className="flex items-start gap-3 py-3 text-base">
                  <span className={`mt-2 h-2.5 w-2.5 shrink-0 rounded-full ${DOT[it.level]}`} aria-hidden />
                  {it.t}
                </li>
              ))}
            </ul>
          </section>
        ) : (
          <p className="rounded-2xl bg-sheet p-5 text-base text-muted">แตะวันที่มีจุดสี เพื่อดูว่าวันนั้นน้องใยคุยอะไร ยา ความดัน และเวรเป็นอย่างไร ลองแตะวันที่มีจุดเหลืองหรือแดง</p>
        )}
      </main>
    </>
  );
}
