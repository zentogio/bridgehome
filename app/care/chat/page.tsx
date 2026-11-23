"use client";

import { useEffect, useRef, useState } from "react";
import { HScroll } from "@/components/hscroll";
import { Send, ShieldAlert } from "lucide-react";
import { PageHeader } from "@/components/ui";
import { addEvent } from "@/lib/store";
import { detectRed } from "@/lib/nongyai";

type Msg = { from: "me" | "nurse"; text: string };

const REPLIES: { re: RegExp; text: string }[] = [
  { re: /(แผล|แดง|กดทับ|ก้นกบ)/, text: "ขอรูปแผลหน่อยนะคะ (ถ่ายตอนมีแสงพอ) ระหว่างนี้ให้พลิกตัวทุก 2 ชั่วโมง ไม่ให้นอนทับจุดเดิม และไม่ถูหรือนวดบริเวณที่แดงค่ะ" },
  { re: /(ไข้|ตัวร้อน)/, text: "วัดอุณหภูมิซ้ำอีกครั้งนะคะ ถ้า ≥ 38.5 °C หรือซึมลงให้ไปโรงพยาบาลเลยค่ะ ถ้ายังไม่ถึง ให้จิบน้ำบ่อยๆ แล้วแจ้งผลกลับมาใน 2 ชั่วโมงค่ะ" },
  { re: /(ยา|ลืมกิน)/, text: "ถ้าลืมยา อย่ากินซ้ำสองเท่านะคะ ให้ดูใบจำหน่ายว่ายานี้ระบุไว้อย่างไร แล้วส่งรูปซองยามาให้พยาบาลดูได้เลยค่ะ" },
  { re: /(เหนื่อย|ปวดหลัง|ไม่ไหว)/, text: "คนดูแลก็ต้องพักนะคะ ลองแบ่งเวรกับพี่น้องในตารางเวร และทำแบบเช็กใจตัวเองในแอปได้เลยค่ะ ถ้าเหนื่อยมากโทรหาพยาบาลได้ค่ะ" },
];

export default function NurseChat() {
  const [msgs, setMsgs] = useState<Msg[]>([
    { from: "nurse", text: "สวัสดีค่ะ พยาบาลสุดาจากคลินิกพาร์ตเนอร์นะคะ มีอะไรให้ช่วยดูเรื่องคุณตาชมไหมคะ" },
  ]);
  const [text, setText] = useState("");
  const end = useRef<HTMLDivElement>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    end.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [msgs]);
  useEffect(() => () => {
    if (timer.current) clearTimeout(timer.current);
  }, []);

  const send = (t: string) => {
    const v = t.trim();
    if (!v) return;
    setMsgs((m) => [...m, { from: "me", text: v }]);
    setText("");
    const red = detectRed(v);
    const reply = red
      ? "เรื่องนี้ต้องดูทันทีนะคะ โทร 1669 เลยค่ะ พยาบาลจะติดตามต่อหลังจากนั้น"
      : (REPLIES.find((r) => r.re.test(v))?.text ?? "รับทราบค่ะ ขอดูข้อมูลของคุณตาชมก่อน แล้วจะตอบกลับภายใน 15 นาทีนะคะ");
    if (red) addEvent({ kind: "sos", title: "ผู้ดูแลแจ้งเหตุด่วนกับพยาบาล", detail: `พูดถึง “${red}”`, level: "red", by: "caregiver" });
    timer.current = setTimeout(() => setMsgs((m) => [...m, { from: "nurse", text: reply }]), 900);
  };

  return (
    <div className="flex h-[calc(100dvh-5rem)] flex-col">
      <PageHeader title="คุยกับพยาบาล" sub="พยาบาลสุดา · คลินิกพาร์ตเนอร์" back="/care" />
      <p className="mx-5 mt-3 flex items-start gap-2 rounded-xl bg-thread-soft p-3 text-sm text-ink">
        <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0 text-thread-deep" aria-hidden />
        เดโม: คำตอบมาจากกฎสำเร็จรูป ยังไม่ได้เชื่อมพยาบาลจริง เรื่องฉุกเฉินโทร 1669
      </p>
      <div className="flex-1 space-y-3 overflow-y-auto px-5 py-4" role="log" aria-label="ข้อความ">
        {msgs.map((m, i) => (
          <div key={i} className={`flex ${m.from === "me" ? "justify-end" : "justify-start"}`}>
            <p className={`max-w-[85%] rounded-2xl px-4 py-3 text-base leading-relaxed ${m.from === "me" ? "rounded-br-md bg-brand text-white" : "rounded-bl-md border border-line bg-white"}`}>
              {m.text}
            </p>
          </div>
        ))}
        <div ref={end} />
      </div>
      <div className="border-t border-line bg-white px-4 pb-3 pt-3">
        <HScroll className="mb-2" label="ข้อความด่วน">
          {["แผลกดทับแดงขึ้น", "คุณตามีไข้", "ลืมกินยาเช้า", "รู้สึกเหนื่อยมาก"].map((q) => (
            <button key={q} onClick={() => send(q)} className="min-h-11 shrink-0 rounded-full bg-brand-soft px-4 text-sm font-medium text-brand-ink">{q}</button>
          ))}
        </HScroll>
        <form onSubmit={(e) => { e.preventDefault(); send(text); }} className="flex gap-2">
          <label htmlFor="nm" className="sr-only">พิมพ์ข้อความถึงพยาบาล</label>
          <input id="nm" value={text} onChange={(e) => setText(e.target.value)} placeholder="พิมพ์ข้อความ" autoComplete="off" className="min-h-14 flex-1 rounded-xl border border-line bg-sheet px-4 text-lg" />
          <button type="submit" aria-label="ส่ง" disabled={!text.trim()} className="flex min-h-14 w-14 items-center justify-center rounded-xl bg-brand text-white disabled:opacity-50"><Send className="h-6 w-6" aria-hidden /></button>
        </form>
      </div>
    </div>
  );
}
