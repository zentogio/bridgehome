"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { ArrowLeft, Check } from "lucide-react";
import Link from "next/link";
import { Btn } from "@/components/ui";
import { update, useDemo, type PkgId } from "@/lib/store";
import { PACKAGES } from "@/lib/data";

const STAGES = [
  { v: 1 as const, t: "ยังแข็งแรง", d: "อยู่เองได้ อยากให้ลูกอุ่นใจ", rec: "free" as PkgId },
  { v: 2 as const, t: "เริ่มป่วยหรืออยู่ลำพัง", d: "มียา มีนัดหมอ ต้องคอยดู", rec: "family" as PkgId },
  { v: 3 as const, t: "ติดเตียง / พึ่งพิง", d: "เพิ่งกลับจากโรงพยาบาล ต้องมีแผนดูแล", rec: "care" as PkgId },
];

function Field({ id, label, value, set }: { id: string; label: string; value: string; set: (v: string) => void }) {
  return (
    <label htmlFor={id} className="block">
      <span className="text-base font-medium">{label}</span>
      <input id={id} value={value} onChange={(e) => set(e.target.value)} className="mt-1 min-h-14 w-full rounded-xl border border-line bg-white px-4 text-lg focus:border-brand focus:outline-none" />
    </label>
  );
}

export default function Onboarding() {
  const s = useDemo();
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [parent, setParent] = useState(s.profile.parent);
  const [patient, setPatient] = useState(s.profile.patient);
  const [cg, setCg] = useState(s.profile.caregiver);
  const [stage, setStage] = useState<1 | 2 | 3>(3);
  const [pkg, setPkg] = useState<PkgId>("care");
  const [consent, setConsent] = useState(false);
  const [time, setTime] = useState("07:30");

  const finish = () => {
    update((st) => ({ ...st, pkg, profile: { parent, patient, caregiver: cg, stage, callTime: time, consent, done: true } }));
    router.push("/care");
  };

  const steps = ["ครอบครัว", "ระดับการดูแล", "ความยินยอม"];

  return (
    <main className="mx-auto flex min-h-dvh max-w-xl flex-col px-5 pb-8 pt-3">
      <Link href="/start" className="-ml-3 flex min-h-12 w-fit items-center gap-1 rounded-full px-3 text-base font-medium text-muted"><ArrowLeft className="h-5 w-5" aria-hidden /> ยกเลิก</Link>
      <ol className="mt-2 flex gap-2" aria-label="ขั้นตอน">
        {steps.map((t, i) => (
          <li key={t} className={`flex-1 rounded-lg py-2 text-center text-sm font-medium ${i <= step ? "bg-brand text-white" : "bg-brand-soft text-muted"}`} aria-current={i === step ? "step" : undefined}>{i + 1}. {t}</li>
        ))}
      </ol>

      <div className="mt-6 flex-1 space-y-4">
        {step === 0 && (
          <>
            <h1 className="text-[1.6rem] font-medium leading-snug">เริ่มตั้งค่าทีมดูแลของครอบครัว</h1>
            <Field id="cg" label="ชื่อของคุณ (ลูกหลาน/ผู้ดูแล)" value={cg} set={setCg} />
            <Field id="parent" label="ชื่อพ่อ/แม่ที่น้องใยจะโทรหา" value={parent} set={setParent} />
            <Field id="patient" label="ชื่อผู้ป่วยติดเตียง (ถ้ามี)" value={patient} set={setPatient} />
          </>
        )}
        {step === 1 && (
          <>
            <h1 className="text-[1.6rem] font-medium leading-snug">ตอนนี้ท่านอยู่ในระดับไหน</h1>
            <p className="text-base text-muted">แผน เวร และแพ็กเกจที่แนะนำจะปรับตามระดับ เปลี่ยนได้ภายหลัง</p>
            <div className="grid gap-3">
              {STAGES.map((o) => (
                <button key={o.v} onClick={() => { setStage(o.v); setPkg(o.rec); }} aria-pressed={stage === o.v} className={`flex min-h-20 items-center gap-3 rounded-2xl border-2 px-5 text-left ${stage === o.v ? "border-brand bg-brand-soft" : "border-line bg-white"}`}>
                  <span className="flex-1"><span className="block text-lg font-medium">{o.t}</span><span className="block text-base text-muted">{o.d}</span></span>
                  {stage === o.v && <Check className="h-6 w-6 text-brand" aria-hidden />}
                </button>
              ))}
            </div>
            <p className="rounded-xl bg-thread-soft p-4 text-base">แนะนำ: <b>{PACKAGES.find((p) => p.id === pkg)?.name}</b> · {PACKAGES.find((p) => p.id === pkg)?.price} {PACKAGES.find((p) => p.id === pkg)?.per}</p>
          </>
        )}
        {step === 2 && (
          <>
            <h1 className="text-[1.6rem] font-medium leading-snug">ขอความยินยอมจากคุณ{parent.replace(/^คุณ/, "")}</h1>
            <p className="text-base text-muted">ผู้สูงอายุเป็นผู้ให้ความยินยอมเอง และเลือกได้ว่าเรื่องไหนไม่บอกลูก</p>
            <label htmlFor="t" className="block">
              <span className="text-base font-medium">เวลาที่ให้น้องใยโทรทุกเช้า</span>
              <input id="t" type="time" value={time} onChange={(e) => setTime(e.target.value)} className="mt-1 min-h-14 w-full rounded-xl border border-line bg-white px-4 text-lg" />
            </label>
            <label className="flex items-start gap-3 rounded-2xl border border-line p-4">
              <input type="checkbox" checked={consent} onChange={(e) => setConsent(e.target.checked)} className="mt-1 h-7 w-7 shrink-0 accent-brand" />
              <span className="text-base">{parent} รับทราบและยินยอมให้ระบบเก็บเสียงสนทนาและผลสุขภาพ เพื่อส่งสรุปให้ทีมดูแลในครอบครัว ไม่ขายข้อมูล และลบได้เมื่อขอ</span>
            </label>
          </>
        )}
      </div>

      <div className="mt-6 grid grid-cols-2 gap-3">
        <Btn variant="ghost" disabled={step === 0} onClick={() => setStep(step - 1)}>ย้อนกลับ</Btn>
        {step < 2 ? (
          <Btn disabled={step === 0 && (!cg.trim() || !parent.trim())} onClick={() => setStep(step + 1)}>ต่อไป</Btn>
        ) : (
          <Btn disabled={!consent} onClick={finish}>เริ่มใช้งาน</Btn>
        )}
      </div>
    </main>
  );
}
