"use client";

import { useState } from "react";
import { HeartHandshake } from "lucide-react";
import { Btn, LevelBadge, PageHeader } from "@/components/ui";
import { addEvent } from "@/lib/store";

const Q = [
  "ช่วง 2 สัปดาห์ที่ผ่านมา รู้สึกหดหู่ เศร้า หรือท้อแท้บ้างไหม",
  "ช่วง 2 สัปดาห์ที่ผ่านมา รู้สึกเบื่อ ทำอะไรก็ไม่เพลินบ้างไหม",
];
const EXTRA = ["หลังและไหล่ปวดจากการพลิกตัว/ยกตัวผู้ป่วยไหม", "ได้นอนหลับเพียงพอไหม", "มีคนช่วยแบ่งเวรเพียงพอไหม"];

export default function SelfCheck() {
  const [a, setA] = useState<(boolean | null)[]>([null, null]);
  const [done, setDone] = useState(false);
  const pos = a.some((x) => x === true);

  const finish = () => {
    setDone(true);
    addEvent({
      kind: "screen",
      title: "ผู้ดูแลเช็กใจตัวเอง (2Q)",
      detail: pos ? "ตอบ “มี” ในข้อคัดกรอง แนะนำพักและแบ่งเวร" : "ไม่พบสัญญาณ ยังไหวอยู่",
      level: pos ? "yellow" : "green",
      by: "caregiver",
    });
  };

  return (
    <>
      <PageHeader title="เช็กใจผู้ดูแล" sub="2Q ทุก 2 สัปดาห์ · คนดูแลก็ต้องได้รับการดูแล" back="/care" />
      <main className="mx-auto max-w-2xl space-y-6 px-5 py-5">
        {!done ? (
          <>
            {Q.map((q, i) => (
              <fieldset key={q} className="space-y-3">
                <legend className="text-lg font-medium">{i + 1}. {q}</legend>
                <div className="grid grid-cols-2 gap-3">
                  {[{ l: "ไม่มี", v: false }, { l: "มี", v: true }].map((o) => (
                    <button
                      key={o.l}
                      onClick={() => setA((s) => s.map((x, j) => (j === i ? o.v : x)))}
                      aria-pressed={a[i] === o.v}
                      className={`min-h-14 rounded-xl border-2 text-lg font-medium ${a[i] === o.v ? "border-brand bg-brand text-white" : "border-line bg-white"}`}
                    >
                      {o.l}
                    </button>
                  ))}
                </div>
              </fieldset>
            ))}
            <Btn className="w-full" disabled={a.some((x) => x === null)} onClick={finish}>ดูผล</Btn>
            <p className="text-sm text-muted">เป็นการคัดกรองและส่งต่อ ไม่ใช่การวินิจฉัย</p>
          </>
        ) : (
          <section aria-live="polite" className="space-y-4">
            <HeartHandshake className="h-12 w-12 text-brand" aria-hidden />
            <LevelBadge level={pos ? "yellow" : "green"} />
            <p className="text-xl font-medium">{pos ? "ขอบคุณที่บอกนะคะ คุณเหนื่อยมามากแล้ว" : "ยังไหวอยู่ ดีมากค่ะ"}</p>
            {pos && (
              <ul className="space-y-2 text-base">
                <li className="rounded-xl bg-sheet p-4">แบ่งเวรให้พี่น้องหรือผู้ช่วยในหน้า “ตารางเวร”</li>
                <li className="rounded-xl bg-sheet p-4">คุยกับพยาบาลในหน้า “คุยกับพยาบาล”</li>
                <li className="rounded-xl bg-sheet p-4">ถ้าหดหู่มาก โทรสายด่วนสุขภาพจิต <b>1323</b></li>
              </ul>
            )}
            <p className="text-base text-muted">ข้อที่ควรสังเกตเพิ่มเติม: {EXTRA.join(" · ")}</p>
            <Btn variant="ghost" className="w-full" onClick={() => { setA([null, null]); setDone(false); }}>ทำใหม่</Btn>
          </section>
        )}
      </main>
    </>
  );
}
