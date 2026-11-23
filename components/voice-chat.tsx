"use client";

import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from "react";
import { Mic, Send, Volume2, VolumeX, RotateCcw, Square, MessageSquareText, PhoneOff, Phone } from "lucide-react";
import { Btn } from "./ui";
import { addEvent } from "@/lib/store";
import {
  FREE_CHIPS, FREE_FALLBACK, FREE_LIMIT, GOODBYE, GOODBYE_LIMIT, GREETING, OFFER_CHIPS, OFFER_Q, QUESTIONS, QUICK, TOPIC,
  ackFor, closing, declinesOffer, detectRed, judge, leadFor, nextStep, wantsToStop, type Answers, type Step,
} from "@/lib/nongyai";

type Turn = { role: "ny" | "me"; text: string };
/** checkin = ถามเรื่องสุขภาพตามสคริปต์ · offer = ถามว่าจะคุยต่อไหม · free = คุยเล่นสารทุกข์สุขดิบ · ended = จบแล้ว */
type Phase = "idle" | "checkin" | "offer" | "free" | "ended";

// ไฟล์เสียงที่สร้างไว้ล่วงหน้า (public/audio/<key>.mp3) ถ้ามีจะใช้ก่อน ไม่เสียเครดิต/ไม่ช้า
const PRESET: Record<string, string> = { greet: GREETING };

type SR = {
  lang: string;
  interimResults: boolean;
  continuous: boolean;
  start: () => void;
  stop: () => void;
  abort?: () => void;
  onresult: ((e: { results: { 0: { transcript: string } }[] }) => void) | null;
  onerror: (() => void) | null;
  onend: (() => void) | null;
};

function getSR(): (new () => SR) | null {
  if (typeof window === "undefined") return null;
  const w = window as unknown as { SpeechRecognition?: new () => SR; webkitSpeechRecognition?: new () => SR };
  return w.SpeechRecognition ?? w.webkitSpeechRecognition ?? null;
}

const isQ2 = (s: Step | "idle") => s === "q2a" || s === "q2b";

export function VoiceChat({
  large = true,
  call = false,
  autoStart = false,
  onHangup,
}: {
  large?: boolean;
  /** หน้าจอแบบกำลังคุยโทรศัพท์ (ใช้ตอนรับสายน้องใย) */
  call?: boolean;
  autoStart?: boolean;
  onHangup?: () => void;
}) {
  const [turns, setTurns] = useState<Turn[]>([]);
  const [phase, setPhase] = useState<Phase>("idle");
  const [step, setStep] = useState<Step | "idle">("idle");
  const [answers, setAnswers] = useState<Answers>({});
  const [freeTurns, setFreeTurns] = useState(0);
  const [listening, setListening] = useState(false);
  const [speaking, setSpeaking] = useState(false);
  const [thinking, setThinking] = useState(false);
  const [soundOn, setSoundOn] = useState(true);
  const [text, setText] = useState("");
  const [view, setView] = useState<"call" | "chat">(call ? "call" : "chat");
  const [secs, setSecs] = useState(0);
  const srOk = useSyncExternalStore(
    () => () => {},
    () => !!getSR(),
    () => false,
  );
  const [level, setLevel] = useState<"green" | "yellow" | "red" | null>(null);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const recRef = useRef<SR | null>(null);
  const endRef = useRef<HTMLDivElement>(null);
  const soundRef = useRef(true);
  /** วางสายหรือออกจากหน้าแล้ว: ห้ามมีเสียงใดๆ อีก แม้งานที่ค้างอยู่จะทำเสร็จทีหลัง */
  const closedRef = useRef(false);
  const answerRef = useRef<(t: string) => void>(() => {});

  useEffect(() => {
    soundRef.current = soundOn;
  }, [soundOn]);

  const silenceAll = useCallback(() => {
    const a = audioRef.current;
    if (a) {
      a.pause();
      a.removeAttribute("src");
      a.load();
    }
    audioRef.current = null;
    if (typeof window !== "undefined") window.speechSynthesis?.cancel();
    try {
      recRef.current?.abort?.();
      recRef.current?.stop();
    } catch {
      /* ไมค์ปิดไปแล้ว */
    }
    recRef.current = null;
    setSpeaking(false);
    setListening(false);
  }, []);

  useEffect(() => {
    closedRef.current = false;
    return () => {
      closedRef.current = true;
      silenceAll();
    };
  }, [silenceAll]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [turns, thinking]);

  // นาฬิกาจับเวลาสาย (หยุดเมื่อคุยจบ)
  useEffect(() => {
    if (!call || phase === "ended") return;
    const id = setInterval(() => setSecs((x) => x + 1), 1000);
    return () => clearInterval(id);
  }, [call, phase]);

  const stopSpeaking = useCallback(() => {
    audioRef.current?.pause();
    window.speechSynthesis?.cancel();
    setSpeaking(false);
  }, []);

  /** เสียง: ไฟล์สำเร็จรูป → Fish ผ่าน /api/tts → เสียงอ่านของเบราว์เซอร์ */
  const speak = useCallback(
    async (line: string, key?: string) => {
      if (!soundRef.current || closedRef.current) return;
      stopSpeaking();
      setSpeaking(true);
      const play = (src: string) =>
        new Promise<boolean>((resolve) => {
          if (closedRef.current) return resolve(true);
          const a = new Audio(src);
          audioRef.current = a;
          a.onended = () => resolve(true);
          a.onerror = () => resolve(false);
          a.onpause = () => resolve(true);
          a.play().catch(() => resolve(false));
        });

      try {
        if (key && PRESET[key] && (await play(`/audio/${key}.mp3`))) return setSpeaking(false);
        if (closedRef.current) return;
        const r = await fetch("/api/tts", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ text: line }) });
        if (closedRef.current) return;
        if (r.ok) {
          const url = URL.createObjectURL(await r.blob());
          if (closedRef.current) return URL.revokeObjectURL(url);
          const ok = await play(url);
          URL.revokeObjectURL(url);
          if (ok) return setSpeaking(false);
        }
      } catch {
        /* ตกไปใช้เสียงเบราว์เซอร์ */
      }

      if (!closedRef.current && "speechSynthesis" in window) {
        await new Promise<void>((resolve) => {
          const u = new SpeechSynthesisUtterance(line);
          u.lang = "th-TH";
          u.rate = 0.9;
          u.onend = () => resolve();
          u.onerror = () => resolve();
          window.speechSynthesis.speak(u);
        });
      }
      setSpeaking(false);
    },
    [stopSpeaking],
  );

  const say = useCallback(
    (line: string, key?: string) => {
      if (closedRef.current) return Promise.resolve();
      setTurns((t) => [...t, { role: "ny", text: line }]);
      return speak(line, key);
    },
    [speak],
  );

  const listen = useCallback(() => {
    if (closedRef.current) return;
    const SRc = getSR();
    if (!SRc) return;
    try {
      const rec = new SRc();
      rec.lang = "th-TH";
      rec.interimResults = false;
      rec.continuous = false;
      rec.onresult = (e) => {
        const t = e.results[0]?.[0]?.transcript;
        if (t && !closedRef.current) answerRef.current(t);
      };
      rec.onerror = () => setListening(false);
      rec.onend = () => setListening(false);
      recRef.current = rec;
      setListening(true);
      rec.start();
    } catch {
      setListening(false);
    }
  }, []);

  // ในโหมดโทร: น้องใยพูดจบแล้วเปิดไมค์ฟังให้อัตโนมัติ เหมือนคุยโทรศัพท์จริง
  const afterSpeak = useCallback(() => {
    if (!closedRef.current && call && view === "call" && srOk) listen();
  }, [call, view, srOk, listen]);

  const start = useCallback(async () => {
    closedRef.current = false;
    setTurns([]);
    setAnswers({});
    setLevel(null);
    setFreeTurns(0);
    setSecs(0);
    setPhase("checkin");
    setStep("idle");
    await say(GREETING, "greet");
    // ปุ่มตอบโผล่หลังน้องใยถามคำถามแรกแล้วเท่านั้น กันตอบก่อนถาม
    setStep("sleep");
    await say(QUESTIONS.sleep);
    afterSpeak();
  }, [say, afterSpeak]);

  useEffect(() => {
    if (!autoStart) return;
    const t = setTimeout(() => void start(), 400);
    return () => clearTimeout(t);
    // เริ่มครั้งเดียวตอนเปิดหน้า
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const logCheckin = (a: Answers) => {
    const c = closing(a);
    setStep("done");
    setLevel(c.level);
    addEvent({
      kind: c.level === "red" ? "sos" : "checkin",
      title: c.level === "red" ? "น้องใยพบสัญญาณสีแดง" : "น้องใยคุยตอนเช้า",
      detail: c.summary,
      level: c.level,
      by: "nongyai",
    });
    return c;
  };

  const endConversation = async (line: string, n = freeTurns) => {
    setPhase("ended");
    if (n > 0) {
      // ความเป็นส่วนตัว: ส่งให้ลูกแค่ว่าคุยเล่นกันกี่ช่วง ไม่ส่งเนื้อหา
      addEvent({ kind: "checkin", title: "คุณยายคุยเล่นกับน้องใย", detail: `คุยสารทุกข์สุขดิบ ${n} ช่วง อารมณ์ดี (เนื้อหาเป็นความลับของคุณยาย)`, level: "green", by: "nongyai" });
    }
    await say(line);
  };

  const askLLM = async (payload: Record<string, unknown>) => {
    setThinking(true);
    try {
      const r = await fetch("/api/chat", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
      return (await r.json()) as { reply: string | null; good: boolean | null; end?: boolean };
    } catch {
      return { reply: null, good: null, end: false };
    } finally {
      setThinking(false);
    }
  };

  const handleAnswer = async (raw: string) => {
    const ans = raw.trim();
    if (!ans || closedRef.current || phase === "idle" || phase === "ended") return;
    if (phase === "checkin" && (step === "idle" || step === "done")) return; // ยังไม่ได้ถาม
    setText("");
    const history = [...turns, { role: "me" as const, text: ans }];
    setTurns(history);
    stopSpeaking();
    recRef.current?.stop();

    // กฎสีแดงตายตัว ใช้ทุกช่วงของบทสนทนา รวมตอนคุยเล่น
    const red = detectRed(ans);
    if (red) {
      const a: Answers = { ...answers, red };
      setAnswers(a);
      const c = logCheckin(a);
      setPhase("ended");
      await say(c.text);
      return;
    }

    /* ---- ถามว่าจะคุยต่อไหม ---- */
    if (phase === "offer") {
      if (declinesOffer(ans)) return endConversation(GOODBYE);
      setPhase("free");
      const isJustYes = /^(คุยต่อ|ได้|ค่ะ|จ้ะ|จ้า|เอา|ได้สิ|ได้เลย|คุยต่ออีกหน่อย)/.test(ans) && ans.length < 16;
      if (isJustYes) {
        await say("ดีใจจังเลยค่ะ งั้นเล่าให้น้องใยฟังหน่อยสิคะ ช่วงนี้มีเรื่องอะไรสนุกๆ บ้างคะ");
        afterSpeak();
        return;
      }
      // คุณยายเริ่มเล่าเลย → ส่งต่อเป็นการคุยเล่นเทิร์นแรก
    }

    /* ---- คุยเล่นสารทุกข์สุขดิบ ---- */
    if (phase === "free" || phase === "offer") {
      if (wantsToStop(ans)) return endConversation(GOODBYE);
      const n = freeTurns + 1;
      setFreeTurns(n);
      const j = await askLLM({ mode: "free", history, answer: ans });
      if (closedRef.current) return;
      if (n >= FREE_LIMIT) {
        if (j.reply && !j.end) await say(j.reply);
        return endConversation(GOODBYE_LIMIT, n);
      }
      if (j.end) {
        setPhase("ended");
        await say(j.reply ?? GOODBYE);
        if (n > 0) addEvent({ kind: "checkin", title: "คุณยายคุยเล่นกับน้องใย", detail: `คุยสารทุกข์สุขดิบ ${n} ช่วง อารมณ์ดี (เนื้อหาเป็นความลับของคุณยาย)`, level: "green", by: "nongyai" });
        return;
      }
      await say(j.reply ?? FREE_FALLBACK[n % FREE_FALLBACK.length]);
      afterSpeak();
      return;
    }

    /* ---- เช็กอินสุขภาพตามสคริปต์ ---- */
    if (step === "idle" || step === "done") return;
    const a: Answers = { ...answers };
    const nx = nextStep(step);
    const nextQ = nx === "done" ? OFFER_Q : QUESTIONS[nx as keyof typeof QUESTIONS];
    const j = await askLLM({ history, topic: TOPIC[step] ?? "", answer: ans, next: nextQ, verbatim: nx === "q2a" || nx === "q2b" });
    if (closedRef.current) return;

    const ruleGood = judge(step, ans);
    // AI ยกระดับความห่วงได้ (good=false) แต่ลดระดับไม่ได้ · 2Q ใช้กฎตายตัวเท่านั้น
    const good = isQ2(step) ? ruleGood : ruleGood && j.good !== false;
    if (step === "q2a") a.q2a = good;
    else if (step === "q2b") a.q2b = good;
    else a[step as "sleep" | "meds" | "food" | "mood"] = good;
    setAnswers(a);

    if (nx === "done") {
      const c = logCheckin(a);
      setPhase("offer");
      await say(j.reply ? `${j.reply.includes("คุยเล่น") || j.reply.includes("คุยต่อ") ? j.reply : `${j.reply} ${OFFER_Q}`}` : `${ackFor(step, good)} ${leadFor(c.level)} ${OFFER_Q}`);
      afterSpeak();
      return;
    }
    setStep(nx);
    await say(j.reply ?? `${ackFor(step, good)} ${nextQ}`);
    afterSpeak();
  };
  useEffect(() => {
    answerRef.current = (t: string) => void handleAnswer(t);
  });

  const toggleMic = () => {
    if (listening) {
      recRef.current?.stop();
      return;
    }
    stopSpeaking();
    listen();
  };

  const hangup = () => {
    // วางสาย = เงียบทันที และไม่มีเสียงใดๆ ตามมาอีก
    closedRef.current = true;
    silenceAll();
    if (phase === "checkin") {
      addEvent({ kind: "checkin", title: "คุณยายวางสายก่อนคุยจบ", detail: "น้องใยจะโทรถามต่อตอนบ่าย", level: "green", by: "nongyai" });
    } else if (phase === "free" && freeTurns > 0) {
      addEvent({ kind: "checkin", title: "คุณยายคุยเล่นกับน้องใย", detail: `คุยสารทุกข์สุขดิบ ${freeTurns} ช่วง (เนื้อหาเป็นความลับของคุณยาย)`, level: "green", by: "nongyai" });
    }
    setPhase("ended");
    onHangup?.();
  };

  const talking = phase === "checkin" || phase === "offer" || phase === "free";
  const bubble = large ? "text-lg" : "text-base";
  const quick = phase === "offer" ? OFFER_CHIPS : phase === "free" ? FREE_CHIPS : phase === "checkin" && step !== "idle" && step !== "done" ? QUICK[step as keyof typeof QUICK] : [];
  const lastNy = [...turns].reverse().find((t) => t.role === "ny");
  const lastMe = [...turns].reverse().find((t) => t.role === "me");
  const mm = `${String(Math.floor(secs / 60)).padStart(2, "0")}:${String(secs % 60).padStart(2, "0")}`;
  const statusLine = phase === "ended" ? "คุยจบแล้ว" : listening ? "กำลังฟังคุณยาย…" : thinking ? "น้องใยกำลังคิด…" : phase === "free" ? `คุยเล่น · ${mm}` : mm;
  const hint = phase === "offer" ? "อยากคุยต่อไหมคะ เลือกได้เลย" : phase === "free" ? "เล่าอะไรก็ได้ หรือแตะหัวข้อ" : srOk ? "พูดตอบได้เลย หรือแตะคำตอบ" : "แตะคำตอบได้เลยค่ะ";

  /* ---------- หน้าจอกำลังคุยสาย ---------- */
  if (view === "call") {
    return (
      <div className="flex min-h-0 flex-1 flex-col items-center bg-[linear-gradient(#2a3c8e,#121a40_75%)] px-6 pb-[max(20px,env(safe-area-inset-bottom))] pt-8 text-center text-white">
        <p className="text-[26px] font-semibold">น้องใย</p>
        <p className="tnum text-[15px] text-white/70">{statusLine}</p>

        <div className="relative my-6 flex h-28 w-28 shrink-0 items-center justify-center">
          {(speaking || listening) && (
            <>
              <span className={`absolute inset-0 animate-ping rounded-full ${listening ? "bg-[#ef5a4c]/30" : "bg-white/25"}`} />
              <span className={`absolute -inset-3 rounded-full border-2 ${listening ? "border-[#ef5a4c]/50" : "border-white/30"}`} />
            </>
          )}
          <span className="relative flex h-28 w-28 items-center justify-center rounded-full bg-white">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/brand/logo-mark.png" alt="" className="w-[72px]" />
          </span>
        </div>

        <p className="min-h-[4.5em] max-w-sm text-[22px] leading-relaxed" aria-live="polite">
          {lastNy?.text ?? "กำลังต่อสาย…"}
        </p>
        {lastMe && talking && <p className="mt-2 text-[15px] text-white/65">คุณยายพูดว่า “{lastMe.text}”</p>}
        {level && (
          <p className="mt-3 rounded-full bg-white/15 px-4 py-1.5 text-sm">
            ส่งสรุปสุขภาพให้คุณเพ็ญแล้ว · {level === "green" ? "ปกติ" : level === "yellow" ? "ควรติดตาม" : "ต้องดูด่วน"}
          </p>
        )}

        <div className="flex w-full flex-1 flex-col justify-end gap-2 py-4">
          {talking && !thinking && quick.length > 0 && (
            <>
              <p className="text-sm text-white/60">{hint}</p>
              <div className="grid grid-cols-2 gap-2">
                {quick.map((q) => (
                  <button key={q} onClick={() => void handleAnswer(q)} className="min-h-14 rounded-2xl border border-white/25 bg-white/12 px-3 text-lg font-medium active:bg-white/25 last:odd:col-span-2">
                    {q}
                  </button>
                ))}
              </div>
            </>
          )}
          {phase === "ended" && (
            <button onClick={() => void start()} className="mx-auto flex min-h-12 items-center gap-2 rounded-full bg-white/15 px-5 text-base">
              <RotateCcw className="h-5 w-5" aria-hidden /> โทรหาน้องใยอีกครั้ง
            </button>
          )}
        </div>

        <div className="flex w-full items-start justify-around">
          <div className="flex flex-col items-center gap-1.5">
            <button onClick={() => { if (soundOn) stopSpeaking(); setSoundOn(!soundOn); }} aria-pressed={soundOn} aria-label={soundOn ? "ปิดลำโพง" : "เปิดลำโพง"} className={`flex h-16 w-16 items-center justify-center rounded-full ${soundOn ? "bg-white/25" : "bg-white/8"}`}>
              {soundOn ? <Volume2 className="h-7 w-7" aria-hidden /> : <VolumeX className="h-7 w-7" aria-hidden />}
            </button>
            <span className="text-[13px] text-white/80">ลำโพง</span>
          </div>
          {srOk && (
            <div className="flex flex-col items-center gap-1.5">
              <button onClick={toggleMic} disabled={!talking} aria-pressed={listening} aria-label={listening ? "หยุดฟัง" : "พูด"} className={`flex h-16 w-16 items-center justify-center rounded-full disabled:opacity-40 ${listening ? "pulse-ring bg-[#ef5a4c]" : "bg-white/25"}`}>
                {listening ? <Square className="h-6 w-6" aria-hidden /> : <Mic className="h-7 w-7" aria-hidden />}
              </button>
              <span className="text-[13px] text-white/80">{listening ? "กำลังฟัง" : "พูด"}</span>
            </div>
          )}
          <div className="flex flex-col items-center gap-1.5">
            <button onClick={() => setView("chat")} aria-label="ดูเป็นแชต" className="flex h-16 w-16 items-center justify-center rounded-full bg-white/25">
              <MessageSquareText className="h-7 w-7" aria-hidden />
            </button>
            <span className="text-[13px] text-white/80">แชต</span>
          </div>
          <div className="flex flex-col items-center gap-1.5">
            <button onClick={hangup} aria-label="วางสาย" className="flex h-16 w-16 items-center justify-center rounded-full bg-[#e5483a]">
              <PhoneOff className="h-7 w-7" aria-hidden />
            </button>
            <span className="text-[13px] text-white/80">วางสาย</span>
          </div>
        </div>
      </div>
    );
  }

  /* ---------- หน้าแชต ---------- */
  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="flex items-center justify-between gap-2 px-4 py-2">
        <p className="text-sm font-medium text-muted" aria-live="polite">
          {listening ? "กำลังฟังอยู่ค่ะ… พูดได้เลย" : thinking ? "น้องใยกำลังคิด…" : speaking ? "น้องใยกำลังพูด…" : phase === "free" ? "คุยเล่นกับน้องใย" : ""}
        </p>
        <div className="flex gap-2">
          {call && (
            <button onClick={() => setView("call")} className="flex min-h-10 items-center gap-1.5 rounded-full bg-brand px-3 text-sm font-medium text-white">
              <Phone className="h-4 w-4" aria-hidden /> กลับไปคุยสาย
            </button>
          )}
          <button
            onClick={() => {
              if (soundOn) stopSpeaking();
              setSoundOn(!soundOn);
            }}
            aria-pressed={soundOn}
            aria-label={soundOn ? "ปิดเสียงน้องใย" : "เปิดเสียงน้องใย"}
            className="flex min-h-10 items-center gap-1.5 rounded-full border border-line bg-white px-3 text-sm font-medium"
          >
            {soundOn ? <Volume2 className="h-4 w-4" aria-hidden /> : <VolumeX className="h-4 w-4" aria-hidden />}
            {soundOn ? "เสียงเปิด" : "เสียงปิด"}
          </button>
        </div>
      </div>

      <div className="no-scrollbar flex-1 space-y-2.5 overflow-y-auto px-4 pb-3" role="log" aria-label="บทสนทนากับน้องใย">
        {phase === "idle" && (
          <div className="flex h-full flex-col items-center justify-center gap-4 py-10 text-center">
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-brand-soft"><Mic className="h-9 w-9 text-brand" aria-hidden /></div>
            <p className="max-w-xs text-lg font-medium">กดปุ่มด้านล่าง น้องใยจะทักทายและถามไถ่ค่ะ</p>
          </div>
        )}
        {turns.map((t, i) => (
          <div key={i} className={`flex ${t.role === "me" ? "justify-end" : "justify-start"}`}>
            <p className={`max-w-[85%] rounded-2xl px-4 py-2.5 ${bubble} leading-relaxed ${t.role === "me" ? "rounded-br-md bg-brand text-white" : "rounded-bl-md border border-line bg-white"}`}>
              {t.role === "ny" && <span className="block text-xs font-semibold text-brand">น้องใย</span>}
              {t.text}
            </p>
          </div>
        ))}
        {thinking && <p className="text-base text-muted">น้องใยกำลังพิมพ์…</p>}
        {level && (
          <p className={`rounded-2xl px-4 py-3 text-base font-semibold ${level === "green" ? "bg-ok-soft text-ok" : level === "yellow" ? "bg-warn-soft text-warn" : "bg-bad-soft text-bad"}`}>
            ส่งผลให้คุณเพ็ญแล้ว (สถานะ: {level === "green" ? "เขียว ปกติ" : level === "yellow" ? "เหลือง ควรติดตาม" : "แดง ต้องทำทันที"})
          </p>
        )}
        <div ref={endRef} />
      </div>

      <div className="safe-bottom border-t border-line bg-white px-3 pt-2.5">
        {phase === "idle" && (
          <Btn onClick={() => void start()} className="w-full !min-h-14 text-lg">
            <Mic className="h-5 w-5" aria-hidden /> เริ่มคุยกับน้องใย
          </Btn>
        )}
        {phase === "ended" && (
          <Btn onClick={() => void start()} variant="soft" className="w-full !min-h-14 text-lg">
            <RotateCcw className="h-5 w-5" aria-hidden /> คุยอีกครั้ง
          </Btn>
        )}
        {talking && (
          <div className="space-y-2 pb-1">
            {quick.length > 0 && (
              <div className="grid grid-cols-2 gap-2" role="group" aria-label="แตะเพื่อตอบ">
                {quick.map((q) => (
                  <button key={q} onClick={() => void handleAnswer(q)} disabled={thinking} className="min-h-12 rounded-xl border border-line bg-white px-3 text-base font-medium transition-colors duration-150 hover:bg-sheet active:bg-brand-soft disabled:opacity-50 last:odd:col-span-2">
                    {q}
                  </button>
                ))}
              </div>
            )}
            {srOk && (
              <button onClick={toggleMic} aria-pressed={listening} aria-label={listening ? "หยุดฟัง" : "กดเพื่อพูด"} className={`flex min-h-14 w-full items-center justify-center gap-2 rounded-xl text-lg font-semibold text-white ${listening ? "pulse-ring bg-bad" : "bg-brand"}`}>
                {listening ? <Square className="h-5 w-5" aria-hidden /> : <Mic className="h-6 w-6" aria-hidden />}
                {listening ? "กำลังฟัง… แตะเพื่อหยุด" : "แตะเพื่อพูด"}
              </button>
            )}
            <form onSubmit={(e) => { e.preventDefault(); void handleAnswer(text); }} className="flex gap-2">
              <label htmlFor="ans" className="sr-only">พิมพ์ตอบน้องใย</label>
              <input id="ans" value={text} onChange={(e) => setText(e.target.value)} placeholder={phase === "free" ? "เล่าอะไรก็ได้ให้น้องใยฟัง" : "หรือพิมพ์ตอบตรงนี้"} className="min-h-12 min-w-0 flex-1 rounded-xl border border-line bg-sheet px-3 text-base" autoComplete="off" />
              <Btn type="submit" aria-label="ส่งคำตอบ" className="!min-h-12 !rounded-xl !px-4" disabled={!text.trim()}>
                <Send className="h-5 w-5" aria-hidden />
              </Btn>
            </form>
            {!srOk && <p className="text-sm text-muted">เครื่องนี้ใช้ไมค์ในเบราว์เซอร์ไม่ได้ ใช้พิมพ์ตอบแทนได้ค่ะ (ลองเปิดด้วย Chrome)</p>}
          </div>
        )}
      </div>
    </div>
  );
}
