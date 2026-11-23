"use client";

import { useState } from "react";
import { Droplet, Thermometer, HeartPulse } from "lucide-react";
import { Btn, LevelBadge, PageHeader } from "@/components/ui";
import { addEvent, update, useDemo, timeAgo } from "@/lib/store";
import { judgeVital } from "@/lib/screening";
import { useToast } from "@/components/toast";

function Field({ id, label, unit, value, set, step }: { id: string; label: string; unit: string; value: string; set: (v: string) => void; step?: string }) {
  return (
    <label htmlFor={id} className="block">
      <span className="text-base font-medium">{label}</span>
      <span className="mt-1 flex items-center gap-2 rounded-xl border border-line bg-white px-4 focus-within:border-brand">
        <input
          id={id}
          inputMode="decimal"
          step={step}
          value={value}
          onChange={(e) => set(e.target.value.replace(/[^0-9.]/g, ""))}
          className="min-h-14 w-full bg-transparent text-xl outline-none"
          placeholder="—"
        />
        <span className="shrink-0 text-base text-muted">{unit}</span>
      </span>
    </label>
  );
}

export default function Vitals() {
  const s = useDemo();
  const toast = useToast();
  const [sys, setSys] = useState("");
  const [dia, setDia] = useState("");
  const [sugar, setSugar] = useState("");
  const [temp, setTemp] = useState("");

  const n = (x: string) => (x ? Number(x) : undefined);
  const has = sys || dia || sugar || temp;
  const bpPair = (sys && !dia) || (!sys && dia);

  const save = () => {
    const v = { sys: n(sys), dia: n(dia), sugar: n(sugar), temp: n(temp) };
    const r = judgeVital(v);
    update((st) => ({ ...st, vitals: [{ id: crypto.randomUUID(), ts: Date.now(), ...v }, ...st.vitals].slice(0, 30) }));
    addEvent({
      kind: "vital",
      title: "บันทึกสัญญาณชีพ",
      detail: r.reasons.length ? r.reasons.join(" · ") : "ค่าอยู่ในเกณฑ์ปกติ",
      level: r.level,
      by: "caregiver",
    });
    setSys(""); setDia(""); setSugar(""); setTemp("");
    toast(r.level === "green" ? "บันทึกแล้ว ค่าปกติ" : r.level === "yellow" ? "บันทึกแล้ว มีค่าที่ควรติดตาม" : "บันทึกแล้ว ค่าผิดปกติมาก ควรปรึกษาพยาบาลทันที");
  };

  return (
    <>
      <PageHeader title="สัญญาณชีพ" sub="ความดัน น้ำตาล อุณหภูมิ" back="/care" />
      <main className="mx-auto max-w-2xl space-y-6 px-5 py-5">
        <section className="space-y-4" aria-labelledby="v-h">
          <h2 id="v-h" className="flex items-center gap-2 text-lg font-medium"><HeartPulse className="h-5 w-5 text-brand" aria-hidden /> บันทึกค่าใหม่</h2>
          <div className="grid grid-cols-2 gap-3">
            <Field id="sys" label="ความดันตัวบน" unit="mmHg" value={sys} set={setSys} />
            <Field id="dia" label="ความดันตัวล่าง" unit="mmHg" value={dia} set={setDia} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Field id="sugar" label="น้ำตาลในเลือด" unit="mg/dL" value={sugar} set={setSugar} />
            <Field id="temp" label="อุณหภูมิ" unit="°C" value={temp} set={setTemp} step="0.1" />
          </div>
          {bpPair && <p className="text-sm text-warn">ใส่ความดันให้ครบทั้งตัวบนและตัวล่าง</p>}
          <Btn className="w-full" disabled={!has || !!bpPair} onClick={save}>บันทึก</Btn>
          <p className="text-sm text-muted">เกณฑ์สีเป็นตัวอย่างสำหรับเดโม ไม่ใช่คำวินิจฉัย ทีมพยาบาลต้องรับรองก่อนใช้จริง สีแดงตัดสินด้วยกฎตายตัวเสมอ</p>
        </section>

        <section aria-labelledby="h-h">
          <h2 id="h-h" className="text-lg font-medium">ประวัติล่าสุด</h2>
          {s.vitals.length === 0 ? (
            <p className="mt-2 rounded-2xl bg-sheet p-5 text-base text-muted">ยังไม่มีข้อมูล ลองใส่ความดัน 150/95 หรือไข้ 38.6 เพื่อดูการแจ้งเตือน</p>
          ) : (
            <ul className="mt-2 divide-y divide-line border-y border-line">
              {s.vitals.slice(0, 8).map((v) => {
                const r = judgeVital(v);
                return (
                  <li key={v.id} className="flex flex-wrap items-center justify-between gap-2 py-3">
                    <div className="text-base">
                      <p className="tnum flex flex-wrap gap-x-4 gap-y-1 font-medium">
                        {v.sys && v.dia && <span className="flex items-center gap-1"><HeartPulse className="h-4 w-4 text-brand" aria-hidden />{v.sys}/{v.dia}</span>}
                        {v.sugar && <span className="flex items-center gap-1"><Droplet className="h-4 w-4 text-brand" aria-hidden />{v.sugar}</span>}
                        {v.temp && <span className="flex items-center gap-1"><Thermometer className="h-4 w-4 text-brand" aria-hidden />{v.temp}°</span>}
                      </p>
                      <p className="text-sm text-muted">{timeAgo(v.ts)}</p>
                    </div>
                    <LevelBadge level={r.level} />
                  </li>
                );
              })}
            </ul>
          )}
        </section>
      </main>
    </>
  );
}
