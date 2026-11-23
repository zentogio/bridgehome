"use client";

import Link from "next/link";
import { useState } from "react";
import { MessageCircleHeart, ThumbsUp, PhoneCall, ArrowLeft, CheckCircle2, Pill, ALargeSmall, ClipboardList, ChevronRight, Check } from "lucide-react";
import { addEvent, update, useDemo, useToday } from "@/lib/store";
import { MEDS } from "@/lib/data";
import { Btn } from "@/components/ui";
import { useToast } from "@/components/toast";
import { ImageSlot } from "@/components/image-slot";

export default function ParentHome() {
  const s = useDemo();
  const today = useToday();
  const toast = useToast();
  const [big, setBig] = useState(false);
  const [confirmSos, setConfirmSos] = useState(false);
  const [sosSent, setSosSent] = useState(false);

  const okToday = s.events.some(
    (e) => e.kind === "okbtn" && new Date(e.ts).toDateString() === today,
  );

  const sendOk = () => {
    if (okToday) return;
    addEvent({ kind: "okbtn", title: "คุณยายกด “สบายดี”", detail: "วันนี้ท่านบอกว่าสบายดี", level: "green", by: "parent" });
    toast("ส่งข่าวให้คุณเพ็ญแล้วค่ะ");
  };

  const sendSos = () => {
    addEvent({ kind: "sos", title: "คุณยายขอความช่วยเหลือ", detail: "กดปุ่มขอความช่วยเหลือ → แจ้งลูกและพยาบาล", level: "red", by: "parent" });
    setConfirmSos(false);
    setSosSent(true);
  };

  return (
    <main className={`mx-auto flex min-h-dvh max-w-xl flex-col px-5 pb-10 pt-3 ${big ? "text-[1.15em]" : ""}`}>
      <div className="flex items-center justify-between">
        <Link href="/start" aria-label="กลับหน้าแรก" className="hide-in-frame -ml-3 flex min-h-12 items-center gap-1 rounded-full px-3 text-base font-semibold text-muted">
          <ArrowLeft className="h-5 w-5" aria-hidden /> เปลี่ยนมุมมอง
        </Link>
        <button
          onClick={() => setBig(!big)}
          aria-pressed={big}
          className={`flex min-h-12 items-center gap-2 rounded-full border px-4 text-base font-semibold ${big ? "border-brand bg-brand text-white" : "border-line bg-white"}`}
        >
          <ALargeSmall className="h-6 w-6" aria-hidden /> ตัวใหญ่ขึ้น
        </button>
      </div>

      <div className="mt-4 flex items-center gap-4">
        <div className="w-20 shrink-0">
          <ImageSlot id="nongyai" label="น้องใย" ratio="1 / 1" round />
        </div>
        <div>
          <h1 className="font-display text-[1.45rem] font-bold leading-snug">สวัสดีตอนเช้าค่ะ {s.profile.parent}</h1>
          <p className="text-lg text-muted">วันนี้อยากทำอะไรคะ</p>
        </div>
      </div>

      <div className="mt-6 space-y-3">
        <Link
          href="/parent/talk"
          className="flex min-h-32 items-center gap-5 rounded-3xl bg-brand p-6 text-white active:scale-[0.99]"
        >
          <MessageCircleHeart className="h-14 w-14 shrink-0 text-thread" aria-hidden />
          <span>
            <span className="block text-3xl font-bold">คุยกับน้องใย</span>
            <span className="block text-lg text-white/80">แตะแล้วพูดได้เลย</span>
          </span>
        </Link>

        <button
          onClick={sendOk}
          disabled={okToday}
          className={`flex min-h-32 w-full items-center gap-5 rounded-3xl border-2 p-6 text-left active:scale-[0.99] ${
            okToday ? "border-ok bg-ok-soft text-ok" : "border-ok text-ok"
          }`}
        >
          {okToday ? <CheckCircle2 className="h-14 w-14 shrink-0" aria-hidden /> : <ThumbsUp className="h-14 w-14 shrink-0" aria-hidden />}
          <span>
            <span className="block text-3xl font-bold">{okToday ? "ส่งแล้วค่ะ" : "สบายดี"}</span>
            <span className="block text-lg">{okToday ? "คุณเพ็ญรู้แล้วว่าวันนี้ท่านสบายดี" : "กดบอกลูกว่าวันนี้สบายดี"}</span>
          </span>
        </button>

        <button
          onClick={() => setConfirmSos(true)}
          className="flex min-h-32 w-full items-center gap-5 rounded-3xl border-2 border-bad p-6 text-left text-bad active:scale-[0.99]"
        >
          <PhoneCall className="h-14 w-14 shrink-0" aria-hidden />
          <span>
            <span className="block text-3xl font-bold">ขอความช่วยเหลือ</span>
            <span className="block text-lg">แจ้งลูกและพยาบาลทันที</span>
          </span>
        </button>
      </div>

      {sosSent && (
        <div role="alert" className="mt-4 rounded-2xl bg-bad-soft p-5 text-bad">
          <p className="text-2xl font-bold">แจ้งคุณเพ็ญและพยาบาลแล้วค่ะ</p>
          <p className="mt-1 text-lg">ถ้าหายใจไม่ออก เจ็บหน้าอก หรือหมดสติ ให้โทร <b>1669</b> ทันที</p>
          <a href="tel:1669" className="mt-3 flex min-h-16 items-center justify-center gap-2 rounded-2xl bg-bad text-2xl font-bold text-white">
            <PhoneCall className="h-7 w-7" aria-hidden /> โทร 1669
          </a>
        </div>
      )}

      <section className="mt-8">
        <h2 className="flex items-center gap-2 text-xl font-medium">
          <Pill className="h-6 w-6 text-brand" aria-hidden /> วันนี้ต้องกินยา
        </h2>
        <ul className="mt-3 divide-y divide-line rounded-2xl border border-line text-xl">
          {MEDS.map((m) => {
            const t = s.medsTaken[m.id] === today;
            return (
              <li key={m.id} className="flex items-center gap-3 px-4 py-3">
                <button
                  role="checkbox"
                  aria-checked={t}
                  aria-label={`${m.name} ${m.time} ${t ? "กินแล้ว" : "ยังไม่กิน"}`}
                  onClick={() => {
                    update((st) => ({ ...st, medsTaken: { ...st.medsTaken, [m.id]: t ? "" : today } }));
                    if (!t) addEvent({ kind: "med", title: "คุณยายบันทึกการกินยา", detail: `${m.name} กินแล้ว`, level: "green", by: "parent" });
                  }}
                  className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-xl border-2 ${t ? "border-ok bg-ok text-white" : "border-line bg-white"}`}
                >
                  {t && <Check className="h-8 w-8" aria-hidden />}
                </button>
                <span className="flex-1">{m.name}</span>
                <span className="tnum font-medium">{m.time}</span>
              </li>
            );
          })}
        </ul>
      </section>

      <Link href="/parent/assess" className="mt-4 flex min-h-20 items-center gap-4 rounded-2xl border border-line px-5 active:bg-brand-soft">
        <ClipboardList className="h-8 w-8 shrink-0 text-brand" aria-hidden />
        <span className="flex-1"><span className="block text-xl font-medium">แบบประเมินสุขภาพใจ</span><span className="block text-base text-muted">9 ข้อ ใช้เวลาประมาณ 2 นาที</span></span>
        <ChevronRight className="h-6 w-6 text-muted" aria-hidden />
      </Link>

      <section className="mt-8" aria-labelledby="mem-h">
        <h2 id="mem-h" className="text-xl font-medium">เรื่องที่น้องใยจำไว้</h2>
        <p className="mt-1 text-base text-muted">ลบได้ทุกเรื่อง เรื่องที่ตั้งว่า “ไม่บอกลูก” จะไม่ถูกส่งไปไหน</p>
        <ul className="mt-3 divide-y divide-line border-y border-line">
          {s.memories.map((m) => (
            <li key={m.id} className="py-4">
              <p className="text-lg">{m.text}</p>
              <div className="mt-2 flex gap-2">
                <button
                  onClick={() => update((st) => ({ ...st, memories: st.memories.map((x) => (x.id === m.id ? { ...x, priv: !x.priv } : x)) }))}
                  aria-pressed={m.priv}
                  className={`min-h-11 rounded-full px-4 text-base font-medium ${m.priv ? "bg-ink text-white" : "bg-brand-soft text-brand-ink"}`}
                >
                  {m.priv ? "ไม่บอกลูก" : "ลูกเห็นได้"}
                </button>
                <button
                  onClick={() => update((st) => ({ ...st, memories: st.memories.filter((x) => x.id !== m.id) }))}
                  className="min-h-11 rounded-full border border-line px-4 text-base font-medium text-muted"
                >
                  ลบเรื่องนี้
                </button>
              </div>
            </li>
          ))}
          {s.memories.length === 0 && <li className="py-4 text-base text-muted">ลบหมดแล้ว น้องใยจะไม่จำเรื่องเหล่านี้อีก</li>}
        </ul>
        <p className="mt-4 text-center text-sm text-muted">น้องใยไม่เคยถามเรื่องเงินหรือรหัส ถ้ามีใครถาม ให้วางสายได้เลยค่ะ</p>
      </section>

      {confirmSos && (
        <div className="fixed inset-0 z-50 flex items-end bg-ink/60 p-4 sm:items-center sm:justify-center" role="dialog" aria-modal="true" aria-labelledby="sos-t">
          <div className="slide-up w-full max-w-md rounded-3xl bg-white p-6">
            <h2 id="sos-t" className="text-2xl font-bold">ต้องการความช่วยเหลือใช่ไหมคะ</h2>
            <p className="mt-2 text-lg text-muted">ระบบจะแจ้งคุณเพ็ญและพยาบาลทันที</p>
            <div className="mt-5 grid gap-3">
              <Btn variant="danger" onClick={sendSos} className="!min-h-16 text-xl">ใช่ ขอความช่วยเหลือ</Btn>
              <Btn variant="ghost" onClick={() => setConfirmSos(false)} className="!min-h-16 text-xl">ไม่ใช่ ยกเลิก</Btn>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
