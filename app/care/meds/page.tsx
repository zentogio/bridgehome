"use client";

import { CalendarDays, Check, Pill } from "lucide-react";
import { MockBtn, PageHeader } from "@/components/ui";
import { addEvent, update, useDemo, useToday } from "@/lib/store";
import { APPOINTMENTS, MEDS } from "@/lib/data";

export default function Meds() {
  const s = useDemo();
  const today = useToday();
  const taken = (id: string) => s.medsTaken[id] === today;
  const done = MEDS.filter((m) => taken(m.id)).length;

  const toggle = (id: string, name: string) => {
    const was = taken(id);
    update((st) => ({ ...st, medsTaken: { ...st.medsTaken, [id]: was ? "" : today } }));
    if (!was) addEvent({ kind: "med", title: "บันทึกการกินยา", detail: `${name} กินแล้ว`, level: "green", by: "caregiver" });
  };

  return (
    <>
      <PageHeader title="ยาและนัดหมอ" sub={`ยาวันนี้ กินแล้ว ${done}/${MEDS.length}`} back="/care" />
      <main className="mx-auto max-w-2xl space-y-7 px-5 py-5">
        <section aria-labelledby="m-h">
          <h2 id="m-h" className="flex items-center gap-2 text-lg font-medium"><Pill className="h-5 w-5 text-brand" aria-hidden /> ยาวันนี้ (จากใบจำหน่าย)</h2>
          <ul className="mt-2 divide-y divide-line border-y border-line">
            {MEDS.map((m) => (
              <li key={m.id} className="flex items-center gap-4 py-4">
                <button
                  role="checkbox"
                  aria-checked={taken(m.id)}
                  aria-label={`${m.name} ${m.time} ${taken(m.id) ? "กินแล้ว" : "ยังไม่กิน"}`}
                  onClick={() => toggle(m.id, m.name)}
                  className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border-2 ${taken(m.id) ? "border-ok bg-ok text-white" : "border-line bg-white"}`}
                >
                  {taken(m.id) && <Check className="h-7 w-7" aria-hidden />}
                </button>
                <div className="flex-1">
                  <p className="text-lg font-medium">{m.name}</p>
                  <p className="text-base text-muted"><span className="tnum">{m.time}</span> · {m.note}</p>
                </div>
              </li>
            ))}
          </ul>
          <p className="mt-2 text-sm text-muted">คุณยายกดบันทึกยาเองได้ที่มุมพ่อแม่ ข้อมูลตรงกัน</p>
        </section>

        <section aria-labelledby="a-h">
          <h2 id="a-h" className="flex items-center gap-2 text-lg font-medium"><CalendarDays className="h-5 w-5 text-brand" aria-hidden /> นัดหมาย</h2>
          <ul className="mt-2 space-y-3">
            {APPOINTMENTS.map((a) => (
              <li key={a.id} className="rounded-2xl border border-line p-4">
                <p className="tnum text-base font-medium text-brand">{a.when}</p>
                <p className="text-lg font-medium">{a.what}</p>
                <p className="text-base text-muted">{a.where} · {a.who}</p>
              </li>
            ))}
          </ul>
          <MockBtn variant="soft" className="mt-3 w-full" note="เดโม: จะเพิ่มนัดและตั้งเตือนทุกคนในทีม + ส่งเข้า Google Calendar/LINE">เพิ่มนัดหมาย</MockBtn>
        </section>
      </main>
    </>
  );
}
