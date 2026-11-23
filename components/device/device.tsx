"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  Camera,
  CalendarDays,
  CloudSun,
  Images,
  MessageCircle,
  Phone,
  PhoneOff,
  Settings,
  Siren,
  Mic,
  AlertTriangle,
  CheckCircle2,
  Stethoscope,
} from "lucide-react";
import { Island, StatusBar, type IslandMsg } from "./phone";
import { SplashArt } from "@/components/splash";
import { LineApp, LineIcon } from "./line-app";
import { useDemo, useToday, worstLevel, type DemoEvent } from "@/lib/store";
import { SHIFTS } from "@/lib/data";

export type Role = "care" | "parent" | "clinic";

const ROLE = {
  care: { owner: "เพ็ญ (ลูกสาว)", app: "Bridge Home", route: "/care" },
  parent: { owner: "คุณยายสมใจ", app: "สายใย", route: "/parent" },
  clinic: { owner: "พว.สุดา (คลินิก)", app: "BH คลินิก", route: "/clinic" },
} as const;

const WALL: Record<Role, string> = {
  care: "radial-gradient(120% 75% at 15% 0%, #5b6fd6 0%, #2a3c8e 48%, #121a40 100%)",
  parent: "linear-gradient(180deg, #f7c77d 0%, #ee9a6c 30%, #a97fb0 62%, #2a3c8e 100%)",
  clinic: "radial-gradient(120% 75% at 85% 0%, #4c9a95 0%, #22546f 50%, #0f1c3a 100%)",
};

const LEVEL_COLOR = { green: "#2f9a5e", yellow: "#d9961f", red: "#d9443a" };
const LEVEL_WORD = { green: "ปกติ", yellow: "ควรดู", red: "ด่วน" };

function relevant(role: Role, e: DemoEvent) {
  if (role === "care") return e.by !== "caregiver" || e.level !== "green";
  if (role === "clinic") return e.level !== "green" && e.by !== "nurse";
  return e.by === "nurse";
}

function islandFor(e: DemoEvent): IslandMsg {
  const Icon = e.level === "red" ? Siren : e.level === "yellow" ? AlertTriangle : e.by === "nongyai" ? Mic : CheckCircle2;
  return { title: e.title, sub: e.detail, color: LEVEL_COLOR[e.level], icon: <Icon className="h-5 w-5 text-white" aria-hidden /> };
}

type Mode = "home" | "launch" | "app";

export function Device({
  role,
  bleed = false,
  ringing = false,
  callElsewhere = false,
  onAccept,
  onDecline,
  openTo,
}: {
  role: Role;
  bleed?: boolean;
  ringing?: boolean;
  /** อีกเครื่องกำลังมีสายเรียกเข้า (แสดง live activity ที่ island) */
  callElsewhere?: boolean;
  onAccept?: () => void;
  onDecline?: () => void;
  /** สั่งเปิดแอปไปหน้าที่กำหนด (เช่น รับสายแล้วไปหน้าคุยกับน้องใย) */
  openTo?: { path: string; n: number } | null;
}) {
  const s = useDemo();
  const cfg = ROLE[role];
  const [mode, setMode] = useState<Mode>("home");
  const [mounted, setMounted] = useState(false);
  const [rect, setRect] = useState<{ x: number; y: number; w: number; h: number } | null>(null);
  const [grown, setGrown] = useState(false);
  const [quick, setQuick] = useState(false);
  const [island, setIsland] = useState<IslandMsg>(null);
  const [hint, setHint] = useState<string | null>(null);
  const [src, setSrc] = useState<string>(ROLE[role].route);
  const [darkTop, setDarkTop] = useState(false);
  const [lineOpen, setLineOpen] = useState(false);
  const [lineSeen, setLineSeen] = useState<string | null>(null);
  const screenRef = useRef<HTMLDivElement>(null);
  const frameRef = useRef<HTMLIFrameElement>(null);
  const lastId = useRef<string | null>(null);
  const launchedOnce = useRef(false);

  // แจ้งเตือนข้ามเครื่องผ่าน Dynamic Island
  useEffect(() => {
    const top = s.events[0];
    if (!top) return;
    if (lastId.current === null) {
      lastId.current = top.id;
      return;
    }
    if (top.id === lastId.current) return;
    lastId.current = top.id;
    if (!relevant(role, top)) return;
    const show = setTimeout(() => setIsland(islandFor(top)), 0);
    const hide = setTimeout(() => setIsland(null), 4200);
    return () => {
      clearTimeout(show);
      clearTimeout(hide);
    };
  }, [s.events, role]);

  const launch = (el: HTMLElement | null) => {
    const sc = screenRef.current;
    if (!sc) return;
    const sr = sc.getBoundingClientRect();
    const k = sr.width / sc.offsetWidth || 1;
    if (el) {
      const r = el.getBoundingClientRect();
      setRect({ x: (r.left - sr.left) / k, y: (r.top - sr.top) / k, w: r.width / k, h: r.height / k });
    } else {
      setRect({ x: sc.offsetWidth / 2 - 30, y: sc.offsetHeight / 2 - 30, w: 60, h: 60 });
    }
    setQuick(launchedOnce.current);
    launchedOnce.current = true;
    setGrown(false);
    setMounted(true);
    setMode("launch");
    requestAnimationFrame(() => requestAnimationFrame(() => setGrown(true)));
  };

  const finishLaunch = useCallback(() => setMode("app"), []);

  // สั่งเปิดหน้าเฉพาะจากภายนอก
  useEffect(() => {
    if (!openTo) return;
    const t = setTimeout(() => {
      launchedOnce.current = true;
      setMounted(true);
      setMode("app");
      // เปลี่ยน src ให้ไม่ซ้ำ เพื่อให้ iframe ไปหน้าที่สั่งทั้งตอนยังไม่เคยเปิดและเปิดอยู่แล้ว
      setSrc(`${openTo.path}?t=${openTo.n}`);
    }, 0);
    return () => clearTimeout(t);
  }, [openTo]);

  // หน้าในแอปที่พื้นเข้ม (กำลังคุยสาย) → แถบสถานะด้านบนเป็นสีเข้มตาม
  useEffect(() => {
    if (!mounted) return;
    const id = setInterval(() => {
      try {
        setDarkTop(!!frameRef.current?.contentWindow?.location.pathname.startsWith("/parent/call"));
      } catch {
        /* ข้ามถ้าอ่านไม่ได้ */
      }
    }, 400);
    return () => clearInterval(id);
  }, [mounted]);

  const goHome = () => {
    setLineOpen(false);
    setMode("home");
  };
  const openLine = () => {
    setLineSeen(s.events[0]?.id ?? null);
    setLineOpen(true);
  };

  const tapOther = (name: string) => {
    setHint(`${name} เป็นภาพจำลอง ในเดโมนี้เปิดได้เฉพาะแอป ${cfg.app}`);
    setTimeout(() => setHint(null), 2200);
  };

  const todayKey = useToday();
  const today = s.events.filter((e) => new Date(e.ts).toDateString() === todayKey);
  const level = worstLevel(today.length ? today : s.events.slice(0, 1));
  const done = SHIFTS.filter((x) => s.shiftsDone[x.id]).length;
  const alerts = s.events.slice(0, 6).filter((e) => e.level !== "green").length;

  const big = role === "parent";
  const appIcon = (
    <button
      onClick={(e) => launch(e.currentTarget.querySelector("img"))}
      className="flex flex-col items-center gap-1.5 active:scale-95"
      aria-label={`เปิดแอป ${cfg.app}`}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/brand/logo.png" alt="" className={`${big ? "h-[78px] w-[78px] rounded-[20px]" : "h-[62px] w-[62px] rounded-[15px]"} shadow-[0_6px_16px_-6px_rgba(0,0,0,.5)]`} />
      <span className={`${big ? "text-[15px]" : "text-[12px]"} font-medium text-white drop-shadow`}>{cfg.app}</span>
    </button>
  );

  const other = (label: string, bg: string, Icon: typeof Phone, fg = "#fff") => (
    <button onClick={() => tapOther(label)} className="flex flex-col items-center gap-1.5 active:scale-95" aria-label={`${label} (ภาพจำลอง)`}>
      <span className={`flex items-center justify-center ${big ? "h-[78px] w-[78px] rounded-[20px]" : "h-[62px] w-[62px] rounded-[15px]"}`} style={{ background: bg }}>
        <Icon className={big ? "h-10 w-10" : "h-8 w-8"} style={{ color: fg }} aria-hidden />
      </span>
      <span className={`${big ? "text-[15px]" : "text-[12px]"} font-medium text-white drop-shadow`}>{label}</span>
    </button>
  );

  const lightBar = (mode !== "app" || ringing || darkTop) && !(lineOpen && !ringing);
  // ข้อความใหม่ในกลุ่ม LINE ตั้งแต่เปิดครั้งล่าสุด (ไม่นับที่ตัวเองทำ)
  const own = role === "parent" ? "parent" : "caregiver";
  const seenAt = lineSeen ? s.events.findIndex((e) => e.id === lineSeen) : 2;
  const lineUnread = Math.min(9, s.events.slice(0, seenAt < 0 ? s.events.length : seenAt).filter((e) => e.by !== own).length);

  return (
    <div ref={screenRef} className={`relative h-full w-full overflow-hidden ${bleed ? "" : "rounded-[52px]"}`} style={{ background: WALL[role] }}>
      {!bleed && <StatusBar light={lightBar} />}
      {!bleed && (
        <Island
          msg={
            island ??
            (callElsewhere
              ? { title: "น้องใยกำลังโทรหาคุณยาย", sub: "เช็กอินตอนเช้า · รอคุณยายรับสาย", color: "#2f9a5e", icon: <Phone className="h-5 w-5 text-white" aria-hidden /> }
              : null)
          }
          onClick={() => setIsland(null)}
        />
      )}

      {/* ---------- Home screen ---------- */}
      <div
        className={`absolute inset-0 flex flex-col transition-[transform,opacity] duration-300 ${mode === "app" ? "scale-[0.92] opacity-0" : "scale-100 opacity-100"}`}
        aria-hidden={mode === "app"}
      >
        <svg className="pointer-events-none absolute inset-x-0 top-[38%] h-[200px] w-full opacity-70" viewBox="0 0 400 200" preserveAspectRatio="none" aria-hidden>
          <path d="M-20 150 C 90 40, 300 40, 420 130" fill="none" stroke="oklch(0.82 0.15 72)" strokeWidth="2.5" strokeLinecap="round" />
          <path d="M-20 170 C 110 80, 290 70, 420 160" fill="none" stroke="oklch(0.82 0.15 72)" strokeWidth="1.2" strokeLinecap="round" opacity=".6" />
        </svg>

        <div className={`relative px-6 ${bleed ? "pt-[max(24px,env(safe-area-inset-top))]" : "pt-[62px]"}`}>
          {role === "parent" ? (
            <div className="text-center text-white">
              <ThaiDate />
              <BigClock />
              <div className="mx-auto mt-3 w-fit rounded-2xl bg-black/20 px-4 py-2 text-[15px] backdrop-blur-md">
                น้องใยจะโทรมาคุยตอน {s.profile.callTime} น. ค่ะ
              </div>
            </div>
          ) : (
            <div className="rounded-[26px] bg-white/15 p-4 text-white backdrop-blur-xl">
              <div className="flex items-center gap-2 text-[12px] font-medium uppercase tracking-wide text-white/80">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/brand/logo.png" alt="" className="h-5 w-5 rounded-md" />
                {role === "care" ? "Bridge Home · วันนี้" : "BH คลินิก · เคสวันนี้"}
              </div>
              {role === "care" ? (
                <>
                  <p className="mt-2 flex items-center gap-2 text-[22px] font-semibold">
                    <span className="h-3 w-3 rounded-full" style={{ background: LEVEL_COLOR[level] }} />
                    บ้านคุณยาย: {LEVEL_WORD[level]}
                  </p>
                  <p className="mt-1 line-clamp-2 text-[13.5px] text-white/85">{s.events[0]?.detail ?? "ยังไม่มีข่าว"}</p>
                  <p className="mt-2 text-[12.5px] text-white/70">เวรวันนี้ {done}/{SHIFTS.length} · น้องใยโทร {s.profile.callTime}</p>
                </>
              ) : (
                <>
                  <p className="mt-2 text-[22px] font-semibold">ต้องดู {alerts + 2} เคส</p>
                  <p className="mt-1 text-[13.5px] text-white/85">แดงก่อน เหลืองตาม · {s.planStatus === "sent" ? "มีแผนรออนุมัติ 1" : "ไม่มีแผนรออนุมัติ"}</p>
                </>
              )}
            </div>
          )}
        </div>

        <div className={`relative mt-7 grid px-6 ${big ? "grid-cols-3 gap-y-6" : "grid-cols-4 gap-y-5"}`}>
          {appIcon}
          {role === "clinic" ? (
            other("ข้อความ", "linear-gradient(#5bd17a,#2fb454)", MessageCircle)
          ) : (
            <button onClick={openLine} className="relative flex flex-col items-center gap-1.5 active:scale-95" aria-label={`เปิด LINE${lineUnread ? ` มีข้อความใหม่ ${lineUnread}` : ""}`}>
              <span className="shadow-[0_6px_16px_-6px_rgba(0,0,0,.5)]" style={{ borderRadius: big ? 20 : 15 }}>
                <LineIcon size={big ? 78 : 62} radius={big ? 20 : 15} />
              </span>
              {lineUnread > 0 && (
                <span className="absolute -right-1.5 -top-1.5 flex h-6 min-w-6 items-center justify-center rounded-full bg-[#ff3b30] px-1.5 text-[13px] font-semibold text-white">{lineUnread}</span>
              )}
              <span className={`${big ? "text-[15px]" : "text-[12px]"} font-medium text-white drop-shadow`}>LINE</span>
            </button>
          )}
          {other("ปฏิทิน", "#fff", CalendarDays, "#e5483a")}
          {!big && other("รูปภาพ", "#fff", Images, "#f2a93b")}
          {other("กล้อง", "linear-gradient(#9aa0ab,#5c616c)", Camera)}
          {!big && other("อากาศ", "linear-gradient(#5aa7f0,#2f6fd0)", CloudSun)}
          {other("ตั้งค่า", "linear-gradient(#a6abb5,#6b707b)", Settings)}
          {role === "clinic" && other("เวชระเบียน", "linear-gradient(#4c9a95,#22546f)", Stethoscope)}
        </div>

        <div className="flex-1" />
        <div className="relative flex justify-center gap-1.5 pb-3" aria-hidden>
          <span className="h-[7px] w-[7px] rounded-full bg-white" />
          <span className="h-[7px] w-[7px] rounded-full bg-white/40" />
        </div>
        <div className={`relative mx-3 mb-5 grid grid-cols-4 gap-2 rounded-[32px] bg-white/20 px-3 py-3 backdrop-blur-xl ${big ? "hidden" : ""}`}>
          <div className="flex justify-center">{other("โทรศัพท์", "linear-gradient(#5bd17a,#2fb454)", Phone)}</div>
          <div className="flex justify-center">{other("ข้อความ", "linear-gradient(#5bd17a,#2fb454)", MessageCircle)}</div>
          <div className="flex justify-center">{other("กล้อง", "linear-gradient(#9aa0ab,#5c616c)", Camera)}</div>
          <div className="flex justify-center">{other("ตั้งค่า", "linear-gradient(#a6abb5,#6b707b)", Settings)}</div>
        </div>
        {big && <div className="h-10" />}

        {hint && (
          <p role="status" className="slide-up absolute inset-x-6 bottom-32 rounded-2xl bg-black/70 px-4 py-3 text-center text-[13.5px] text-white backdrop-blur">
            {hint}
          </p>
        )}
      </div>

      {/* ---------- App (iframe เก็บสถานะไว้ตลอด) ---------- */}
      {mounted && (
        <div
          className={`absolute inset-0 ${darkTop ? "bg-[#2a3c8e]" : "bg-white"} transition-[transform,opacity,background-color] duration-300 ${mode === "app" ? "scale-100 opacity-100" : "pointer-events-none scale-[1.04] opacity-0"}`}
          style={{ paddingTop: bleed ? 0 : 50 }}
        >
          <iframe ref={frameRef} src={src} allow="microphone; autoplay; clipboard-write" title={`แอป ${cfg.app} ของ${cfg.owner}`} className="h-full w-full border-0" />
        </div>
      )}

      {/* ---------- เปิดแอป: ไอคอนขยายเต็มจอ → splash ---------- */}
      {mode === "launch" && rect && (
        <div
          className="absolute z-20 overflow-hidden bg-brand"
          style={
            grown
              ? { left: 0, top: 0, width: "100%", height: "100%", borderRadius: bleed ? 0 : 52, transition: "all .42s cubic-bezier(.2,.8,.2,1)" }
              : { left: rect.x, top: rect.y, width: rect.w, height: rect.h, borderRadius: 15 }
          }
        >
          {grown && <SplashArt quick={quick} onDone={finishLaunch} />}
        </div>
      )}

      {/* ---------- LINE (กลุ่มครอบครัว + บอท Bridge Home) ---------- */}
      <div
        className={`absolute inset-0 z-[25] overflow-hidden transition-[transform,opacity] duration-300 ${lineOpen ? "translate-y-0 opacity-100" : "pointer-events-none translate-y-6 opacity-0"}`}
        aria-hidden={!lineOpen}
      >
        {lineOpen && <LineApp me={role === "parent" ? "yai" : "pen"} topInset={bleed ? 0 : 50} onClose={() => { setLineSeen(s.events[0]?.id ?? null); setLineOpen(false); }} />}
      </div>

      {/* ---------- สายเรียกเข้าจากน้องใย ---------- */}
      {ringing && (
        <div className="absolute inset-0 z-30 flex flex-col items-center bg-[linear-gradient(#2a3c8e,#121a40)] px-8 pb-16 pt-28 text-center text-white">
          <div className="relative flex h-32 w-32 items-center justify-center">
            <span className="absolute inset-0 animate-ping rounded-full bg-white/20" />
            <span className="relative flex h-32 w-32 items-center justify-center rounded-full bg-white">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/brand/logo-mark.png" alt="" className="w-20" />
            </span>
          </div>
          <p className="mt-6 text-[34px] font-semibold">น้องใย</p>
          <p className="text-[16px] text-white/75">สายใย · คุณเพ็ญให้มาคุยกับคุณยายค่ะ</p>
          <div className="flex-1" />
          <div className="flex w-full justify-between px-4">
            <div className="flex flex-col items-center gap-2">
              <button onClick={onDecline} aria-label="ไม่รับสาย" className="flex h-[78px] w-[78px] items-center justify-center rounded-full bg-[#e5483a]">
                <PhoneOff className="h-8 w-8" aria-hidden />
              </button>
              <span className="text-[15px]">ไม่รับ</span>
            </div>
            <div className="flex flex-col items-center gap-2">
              <button onClick={onAccept} aria-label="รับสาย" className="flex h-[78px] w-[78px] items-center justify-center rounded-full bg-[#34c759]">
                <Phone className="h-8 w-8" aria-hidden />
              </button>
              <span className="text-[15px]">รับสาย</span>
            </div>
          </div>
        </div>
      )}

      {/* ---------- Home indicator: แตะเพื่อกลับหน้าโฮม ---------- */}
      {!bleed && (
        <button
          onClick={goHome}
          aria-label="กลับหน้าโฮม"
          className="absolute bottom-0 left-1/2 z-40 flex h-6 w-44 -translate-x-1/2 items-center justify-center"
        >
          <span className={`h-[5px] w-[136px] rounded-full ${((mode === "app" && !darkTop) || lineOpen) && !ringing ? "bg-ink/85" : "bg-white/90"}`} />
        </button>
      )}
      {bleed && mode === "app" && (
        <button onClick={goHome} className="absolute bottom-[calc(env(safe-area-inset-bottom)+70px)] right-3 z-40 rounded-full bg-ink/80 px-3 py-2 text-xs font-medium text-white">
          หน้าโฮม
        </button>
      )}
    </div>
  );
}

function ThaiDate() {
  const [t, setT] = useState("");
  useEffect(() => {
    const id = setTimeout(() => setT(new Date().toLocaleDateString("th-TH", { weekday: "long", day: "numeric", month: "long" })), 0);
    return () => clearTimeout(id);
  }, []);
  return <p className="h-6 text-[17px] font-medium opacity-90">{t}</p>;
}

function BigClock() {
  const [t, setT] = useState("");
  useEffect(() => {
    const tick = () => {
      const d = new Date();
      setT(`${d.getHours()}:${String(d.getMinutes()).padStart(2, "0")}`);
    };
    tick();
    const id = setInterval(tick, 15000);
    return () => clearInterval(id);
  }, []);
  return <p className="tnum text-[84px] font-semibold leading-none tracking-tight">{t}</p>;
}
