"use client";

import { Check, Hand, Share2 } from "lucide-react";
import { MockBtn, PageHeader } from "@/components/ui";
import { addEvent, update, useDemo } from "@/lib/store";
import { SHIFTS, TEAM } from "@/lib/data";

export default function Schedule() {
  const s = useDemo();
  const done = SHIFTS.filter((x) => s.shiftsDone[x.id]).length;

  const toggle = (id: string, task: string) => {
    const was = !!s.shiftsDone[id];
    update((st) => ({ ...st, shiftsDone: { ...st.shiftsDone, [id]: !was } }));
    if (!was) addEvent({ kind: "shift", title: "ทำเวรแล้ว", detail: task, level: "green", by: "caregiver" });
  };

  const take = (id: string, who: string) => update((st) => ({ ...st, shiftOwner: { ...st.shiftOwner, [id]: who } }));

  return (
    <>
      <PageHeader title="ตารางเวรวันนี้" sub={`ทำแล้ว ${done} จาก ${SHIFTS.length} งาน`} />
      <main className="mx-auto max-w-2xl px-5 py-5">
        <div
          className="h-2 overflow-hidden rounded-full bg-brand-soft"
          role="progressbar"
          aria-valuenow={done}
          aria-valuemin={0}
          aria-valuemax={SHIFTS.length}
          aria-label="ความคืบหน้าเวรวันนี้"
        >
          <div className="h-full rounded-full bg-thread transition-[width] duration-300" style={{ width: `${(done / SHIFTS.length) * 100}%` }} />
        </div>

        <ul className="mt-4 divide-y divide-line">
          {SHIFTS.map((x) => {
            const ok = !!s.shiftsDone[x.id];
            const who = s.shiftOwner[x.id] ?? x.who;
            return (
              <li key={x.id} className="flex items-start gap-4 py-4">
                <button
                  onClick={() => toggle(x.id, x.task)}
                  role="checkbox"
                  aria-checked={ok}
                  aria-label={`${x.time} ${x.task} ${ok ? "ทำแล้ว" : "ยังไม่ทำ"}`}
                  className={`mt-0.5 flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border-2 transition-colors duration-150 ${
                    ok ? "border-ok bg-ok text-white" : "border-line bg-white"
                  }`}
                >
                  {ok && <Check className="h-7 w-7" aria-hidden />}
                </button>
                <div className="min-w-0 flex-1">
                  <p className="text-lg font-semibold">
                    <span className="tnum text-brand">{x.time}</span>{" "}
                    <span className={ok ? "text-muted line-through" : ""}>{x.task}</span>
                  </p>
                  <label className="mt-1 flex items-center gap-2 text-base text-muted">
                    <span className="shrink-0">ผู้รับผิดชอบ</span>
                    <select
                      value={who}
                      onChange={(e) => take(x.id, e.target.value)}
                      className="min-h-11 min-w-0 flex-1 rounded-xl border border-line bg-white px-2 text-base text-ink"
                    >
                      {[x.who, ...TEAM.filter((t) => t !== x.who)].map((t) => (
                        <option key={t}>{t}</option>
                      ))}
                    </select>
                  </label>
                </div>
              </li>
            );
          })}
        </ul>

        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <MockBtn variant="soft" className="w-full" note="เดโม: จะส่งลิงก์เชิญพี่น้องผ่าน LINE เพื่อแบ่งเวรและหารค่าบริการ">
            <Share2 className="h-5 w-5" aria-hidden /> ชวนพี่น้องเข้าทีม
          </MockBtn>
          <MockBtn variant="ghost" className="w-full" note="เดโม: จะแจ้งเตือนผู้รับผิดชอบก่อนถึงเวลา 15 นาที">
            <Hand className="h-5 w-5" aria-hidden /> ตั้งเตือนเวร
          </MockBtn>
        </div>
      </main>
    </>
  );
}
