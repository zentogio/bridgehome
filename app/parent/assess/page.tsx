"use client";

import Link from "next/link";
import { useState } from "react";
import { ArrowLeft, CheckCircle2, PhoneCall } from "lucide-react";
import { Q9, Q9_OPTIONS, score9Q } from "@/lib/screening";
import { addEvent } from "@/lib/store";
import { Btn, LevelBadge } from "@/components/ui";

export default function Assess() {
  const [i, setI] = useState(0);
  const [ans, setAns] = useState<number[]>([]);
  const result = ans.length === Q9.length ? score9Q(ans) : null;

  const pick = (v: number) => {
    const next = [...ans, v];
    setAns(next);
    if (next.length === Q9.length) {
      const r = score9Q(next);
      addEvent({
        kind: "screen",
        title: "แบบประเมิน 9Q",
        detail: `คะแนน ${r.score} (${r.band})${next[8] > 0 ? " · ข้อ 9 มากกว่า 0" : ""} → ${r.text}`,
        level: r.level,
        by: "parent",
      });
    } else setI(i + 1);
  };

  const back = () => {
    if (ans.length === 0 || result) return;
    setAns(ans.slice(0, -1));
    setI(i - 1);
  };

  return (
    <main className="mx-auto flex min-h-dvh max-w-xl flex-col px-5 pb-8 pt-3">
      <Link href="/parent" className="-ml-3 flex min-h-12 w-fit items-center gap-1 rounded-full px-3 text-base font-medium text-muted">
        <ArrowLeft className="h-5 w-5" aria-hidden /> กลับ
      </Link>

      {!result ? (
        <>
          <p className="mt-3 text-base text-muted">ในช่วง 2 สัปดาห์ที่ผ่านมา มีอาการเหล่านี้บ่อยแค่ไหนคะ</p>
          <div className="mt-2 h-2 overflow-hidden rounded-full bg-brand-soft" role="progressbar" aria-valuenow={i + 1} aria-valuemin={1} aria-valuemax={Q9.length} aria-label="ความคืบหน้า">
            <div className="h-full rounded-full bg-thread transition-[width] duration-200" style={{ width: `${((i + 1) / Q9.length) * 100}%` }} />
          </div>
          <p className="mt-1 text-sm text-muted">ข้อ {i + 1} จาก {Q9.length}</p>

          <h1 className="mt-6 text-[1.6rem] font-medium leading-snug">{Q9[i]}</h1>

          <div className="mt-6 grid gap-3">
            {Q9_OPTIONS.map((o) => (
              <button
                key={o.v}
                onClick={() => pick(o.v)}
                className="flex min-h-[4.5rem] items-center rounded-2xl border-2 border-line bg-white px-5 text-left text-xl font-medium transition-colors duration-150 active:bg-brand-soft"
              >
                {o.label}
              </button>
            ))}
          </div>
          {ans.length > 0 && (
            <Btn variant="ghost" className="mt-4" onClick={back}>ย้อนกลับข้อก่อนหน้า</Btn>
          )}
          <p className="mt-6 text-sm text-muted">เป็นการคัดกรองและส่งต่อ ไม่ใช่การวินิจฉัย</p>
        </>
      ) : (
        <section className="mt-6" aria-live="polite">
          <CheckCircle2 className="h-12 w-12 text-brand" aria-hidden />
          <h1 className="mt-2 text-[1.6rem] font-medium">ขอบคุณที่ตอบค่ะ</h1>
          <p className="mt-1 text-lg text-muted">คะแนนรวม {result.score} จาก 27 · ระดับ{result.band}</p>
          <div className="mt-3"><LevelBadge level={result.level} /></div>
          <p className="mt-4 rounded-2xl bg-sheet p-4 text-lg">{result.text}</p>
          {result.level === "red" && (
            <div className="mt-4 grid gap-3">
              <a href="tel:1323" className="flex min-h-16 items-center justify-center gap-2 rounded-2xl bg-bad text-xl font-medium text-white">
                <PhoneCall className="h-6 w-6" aria-hidden /> โทร 1323 สายด่วนสุขภาพจิต
              </a>
              <a href="tel:1669" className="flex min-h-14 items-center justify-center gap-2 rounded-2xl border-2 border-bad text-lg font-medium text-bad">
                โทร 1669 ฉุกเฉิน
              </a>
            </div>
          )}
          <p className="mt-4 text-base text-muted">แจ้งคุณเพ็ญให้ทราบแล้วค่ะ</p>
          <Link href="/parent" className="mt-6 flex min-h-14 items-center justify-center rounded-xl bg-brand text-lg font-medium text-white">กลับหน้าหลัก</Link>
        </section>
      )}
    </main>
  );
}
