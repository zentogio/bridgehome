"use client";

import { useEffect, useRef, useState } from "react";
import { Camera, FileImage, Loader2, Send, ShieldCheck, Clock3, RotateCcw } from "lucide-react";
import { Btn, Card, MockBtn, PageHeader, Section } from "@/components/ui";
import { update, useDemo } from "@/lib/store";
import { PLAN_ITEMS } from "@/lib/data";

export default function Plan() {
  const s = useDemo();
  const [reading, setReading] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => () => {
    if (timer.current) clearTimeout(timer.current);
  }, []);

  const startReading = () => {
    setReading(true);
    timer.current = setTimeout(() => {
      setReading(false);
      update((st) => ({ ...st, planStatus: "drafted" }));
    }, 2600);
  };

  const onFile = (f?: File) => {
    if (!f) return;
    setPreview(URL.createObjectURL(f));
    startReading();
  };

  const status = s.planStatus;

  return (
    <>
      <PageHeader title="แผนดูแลจากใบจำหน่าย" sub="ถ่ายรูป → AI ร่าง → พยาบาลอนุมัติ" />
      <main className="mx-auto max-w-2xl space-y-6 px-4 py-5">
        <ol className="grid grid-cols-4 gap-1 text-center text-xs font-semibold" aria-label="ขั้นตอน">
          {["ถ่ายรูป", "AI ร่างแผน", "พยาบาลตรวจ", "ใช้งาน"].map((t, i) => {
            const at = status === "none" ? 0 : status === "drafted" ? 1 : status === "sent" ? 2 : 3;
            const on = i <= at;
            return (
              <li key={t} className={`rounded-xl px-1 py-2 ${on ? "bg-brand text-white" : "bg-brand-soft text-muted"}`}>
                {i + 1}. {t}
              </li>
            );
          })}
        </ol>

        {status === "none" && !reading && (
          <Card>
            <h2 className="text-xl font-bold">ถ่ายรูปใบจำหน่าย/ซองยา</h2>
            <p className="mt-1 text-base text-muted">AI จะอ่านคำสั่งแพทย์และร่างแผนให้ภายใน 5 นาที ไม่ต้องกรอกเอง</p>
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              capture="environment"
              className="sr-only"
              id="discharge"
              onChange={(e) => onFile(e.target.files?.[0])}
            />
            <div className="mt-4 grid gap-3">
              <label
                htmlFor="discharge"
                className="flex min-h-16 cursor-pointer items-center justify-center gap-3 rounded-2xl bg-brand text-xl font-bold text-white"
              >
                <Camera className="h-7 w-7" aria-hidden /> เปิดกล้องถ่ายรูป
              </label>
              <Btn variant="soft" onClick={startReading}>
                <FileImage className="h-5 w-5" aria-hidden /> ใช้ใบจำหน่ายตัวอย่าง
              </Btn>
            </div>
          </Card>
        )}

        {reading && (
          <Card className="text-center">
            {preview && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={preview} alt="ใบจำหน่ายที่ถ่าย" className="mx-auto mb-4 max-h-56 rounded-2xl object-contain" />
            )}
            <Loader2 className="mx-auto h-10 w-10 animate-spin text-brand" aria-hidden />
            <p className="mt-3 text-xl font-bold" role="status">AI กำลังอ่านใบจำหน่าย…</p>
            <p className="text-base text-muted">เลือกหัวข้อจากคลังที่พยาบาลรับรองแล้ว</p>
          </Card>
        )}

        {status !== "none" && (
          <>
            <Section title="แผนที่ AI ร่างให้ (เลือกจากคลังพยาบาลรับรอง)">
              <ul className="space-y-3">
                {PLAN_ITEMS.map((p, i) => (
                  <li key={p.title} className="rounded-2xl border border-line bg-white p-4">
                    <p className="text-lg font-bold">{i + 1}. {p.title}</p>
                    <p className="mt-1 text-base text-muted">{p.why}</p>
                    <p className="mt-2 inline-block rounded-lg bg-brand-soft px-2 py-0.5 text-sm font-semibold text-brand-dark">
                      ที่มา: {p.src}
                    </p>
                  </li>
                ))}
              </ul>
            </Section>

            {status === "drafted" && (
              <Btn className="w-full" onClick={() => update((st) => ({ ...st, planStatus: "sent" }))}>
                <Send className="h-5 w-5" aria-hidden /> ส่งให้พยาบาลคลินิกตรวจ
              </Btn>
            )}
            {status === "sent" && (
              <Card className="border-warn/40 bg-warn-soft">
                <p className="flex items-center gap-2 text-lg font-bold text-warn">
                  <Clock3 className="h-6 w-6" aria-hidden /> รอพยาบาลอนุมัติ
                </p>
                <p className="mt-1 text-base">พยาบาลตรวจแผนใช้เวลาราว 10–15 นาที (ไปที่มุมพยาบาลเพื่อลองกดอนุมัติได้)</p>
                <a href="/clinic" className="mt-3 inline-flex min-h-12 items-center rounded-2xl bg-ink px-5 font-semibold text-white">ไปมุมพยาบาล</a>
              </Card>
            )}
            {status === "approved" && (
              <Card className="border-ok/30 bg-ok-soft">
                <p className="flex items-center gap-2 text-lg font-bold text-ok">
                  <ShieldCheck className="h-6 w-6" aria-hidden /> พยาบาลอนุมัติแล้ว
                </p>
                <p className="mt-1 text-base">แผนนี้ถูกเพิ่มในตารางเวรและการเตือนของทีมแล้ว</p>
                <div className="mt-3 flex flex-wrap gap-3">
                  <a href="/care/schedule" className="inline-flex min-h-12 items-center rounded-2xl bg-brand px-5 font-semibold text-white">ดูตารางเวร</a>
                  <MockBtn note="เดโม: จะส่งแผนเป็นไฟล์ PDF/รูปเข้ากลุ่ม LINE">แชร์เข้า LINE</MockBtn>
                </div>
              </Card>
            )}

            <Btn
              variant="ghost"
              className="w-full"
              onClick={() => {
                setPreview(null);
                update((st) => ({ ...st, planStatus: "none" }));
              }}
            >
              <RotateCcw className="h-5 w-5" aria-hidden /> เริ่มใหม่
            </Btn>
          </>
        )}
      </main>
    </>
  );
}
