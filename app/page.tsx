"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { HScroll } from "@/components/hscroll";
import { useRouter } from "next/navigation";
import { RotateCcw, SlidersHorizontal, X, BookOpen, Smartphone, Columns3 } from "lucide-react";
import { Device, type Role } from "@/components/device/device";
import { PhoneShell, SCREEN_H, SCREEN_W } from "@/components/device/phone";
import { addEvent, resetDemo, useDemo } from "@/lib/store";
import { buildGroups, ESCALATION } from "@/components/device/scenarios";

const ROLES: { id: Role; label: string; who: string }[] = [
  { id: "care", label: "ลูกหลาน", who: "เพ็ญ · ลูกสาวที่ทำงานกรุงเทพฯ" },
  { id: "parent", label: "คุณยาย", who: "คุณยายสมใจ 79 · อยุธยา" },
  { id: "clinic", label: "พยาบาล", who: "พว.สุดา · คลินิกพาร์ตเนอร์" },
];

function useViewport() {
  return useSyncExternalStore(
    (cb) => {
      window.addEventListener("resize", cb);
      return () => window.removeEventListener("resize", cb);
    },
    () => `${window.innerWidth}x${window.innerHeight}`,
    () => "1600x1000",
  );
}

export default function Stage() {
  const router = useRouter();
  const inFrame = useSyncExternalStore(
    () => () => {},
    () => window.self !== window.top,
    () => false,
  );
  const [vw, vh] = useViewport().split("x").map(Number);
  const [layout, setLayout] = useState<"three" | "one">("three");
  const [role, setRole] = useState<Role>("care");
  const [ringing, setRinging] = useState(false);
  const [openTo, setOpenTo] = useState<{ path: string; n: number } | null>(null);
  const [resetKey, setResetKey] = useState(0);
  const [sheet, setSheet] = useState(false);
  const [group, setGroup] = useState("yai");
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);
  const s = useDemo();
  const callTime = s.profile.callTime;
  const calledDay = useRef("");

  // น้องใยโทรเองเมื่อถึงเวลาที่ตั้งไว้ (เช็กทุก 20 วินาที)
  useEffect(() => {
    const id = setInterval(() => {
      const d = new Date();
      const hm = `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
      if (hm === callTime && calledDay.current !== d.toDateString()) {
        calledDay.current = d.toDateString();
        setRinging(true);
      }
    }, 20000);
    return () => clearInterval(id);
  }, [callTime]);
  useEffect(() => () => timers.current.forEach(clearTimeout), []);

  useEffect(() => {
    if (inFrame) router.replace("/start");
  }, [inFrame, router]);
  if (inFrame) return null;

  const PANEL = 300;
  const phoneW = SCREEN_W + 24;
  const phoneH = SCREEN_H + 24;
  const mobile = vw < 760;
  const canThree = vw >= 1180;
  const three = canThree && layout === "three";
  const n = three ? 3 : 1;
  const scale = Math.min(1, (vh - 96) / phoneH, (vw - PANEL - 120 - (n - 1) * 36) / (n * phoneW));

  const call = () => {
    setRinging(true);
    if (!three) setRole("parent");
  };
  const accept = () => {
    setRinging(false);
    setOpenTo({ path: "/parent/call", n: Date.now() });
  };
  const decline = () => {
    setRinging(false);
    addEvent({ kind: "checkin", title: "คุณยายไม่รับสายน้องใย", detail: "น้องใยจะโทรซ้ำใน 5 นาที ถ้ายังเงียบจะแจ้งคุณต้นและกลุ่ม LINE", level: "yellow", by: "nongyai" });
  };

  const escalate = () => {
    setRinging(false);
    timers.current.forEach(clearTimeout);
    timers.current = ESCALATION.map((st) =>
      setTimeout(() => addEvent({ kind: st.level === "red" ? "sos" : "checkin", title: st.title, detail: st.detail, level: st.level, by: "nongyai" }), st.ms),
    );
  };
  // escalate ใช้ ref เฉพาะตอนกดปุ่ม ไม่ได้อ่านระหว่าง render
  // eslint-disable-next-line react-hooks/refs
  const GROUPS = buildGroups({ call, escalate });
  const active = GROUPS.find((g) => g.id === group) ?? GROUPS[0];
  const DOTC = { green: "bg-[#3fbf78]", yellow: "bg-[#f2b84b]", red: "bg-[#ef5a4c]" };

  const reset = () => {
    timers.current.forEach(clearTimeout);
    resetDemo();
    setRinging(false);
    setOpenTo(null);
    setResetKey((k) => k + 1);
  };

  const panel = (
    <div className="space-y-5">
      <div className="flex items-center gap-3">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/brand/logo.png" alt="" className="h-10 w-10" />
        <div className="leading-tight">
          <p className="text-base font-semibold text-white">Bridge Home × สายใย</p>
          <p className="text-sm text-white/60">เดโมสด · SPU AI Hackathon</p>
        </div>
      </div>

      {canThree && !mobile && (
        <div>
          <p className="mb-2 text-xs font-medium text-white/55">มุมมอง</p>
          <div className="grid grid-cols-2 gap-1 rounded-2xl bg-white/8 p-1">
            {([["three", "3 เครื่อง", Columns3], ["one", "ทีละเครื่อง", Smartphone]] as const).map(([k, l, I]) => (
              <button key={k} onClick={() => setLayout(k)} aria-pressed={layout === k} className={`flex min-h-11 items-center justify-center gap-1.5 rounded-xl text-sm font-medium ${layout === k ? "bg-white text-ink" : "text-white/70"}`}>
                <I className="h-4 w-4" aria-hidden /> {l}
              </button>
            ))}
          </div>
        </div>
      )}

      {!three && (
        <div>
          <p className="mb-2 text-xs font-medium text-white/55">ดูในมุมของ</p>
          <div className="grid grid-cols-3 gap-1 rounded-2xl bg-white/8 p-1">
            {ROLES.map((r) => (
              <button key={r.id} onClick={() => setRole(r.id)} aria-pressed={role === r.id} className={`min-h-11 rounded-xl text-sm font-medium ${role === r.id ? "bg-white text-ink" : "text-white/70"}`}>
                {r.label}
              </button>
            ))}
          </div>
        </div>
      )}

      <div>
        <p className="mb-2 text-xs font-medium text-white/55">เล่นสถานการณ์ · ผลขึ้นทุกเครื่องทันที</p>
        <HScroll dark className="pb-2" label="หมวดสถานการณ์">
          {GROUPS.map((g) => (
            <button key={g.id} onClick={() => setGroup(g.id)} aria-pressed={group === g.id} className={`min-h-9 shrink-0 rounded-full px-3 text-[13px] font-medium ${group === g.id ? "bg-white text-ink" : "bg-white/10 text-white/75"}`}>
              {g.label} <span className="opacity-60">{g.items.length}</span>
            </button>
          ))}
        </HScroll>
        <ul className="space-y-1.5">
          {active.items.map((it) => (
            <li key={it.t}>
              <button onClick={() => { it.run(); setSheet(false); }} className="flex w-full items-start gap-3 rounded-2xl bg-white/[0.06] px-3.5 py-3 text-left transition-colors duration-150 hover:bg-white/[0.12] active:scale-[0.99]">
                <span className={`mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full ${DOTC[it.level]}`} aria-hidden />
                <span>
                  <span className="block text-[14.5px] font-medium leading-snug text-white">{it.t}</span>
                  <span className="block text-[12.5px] leading-snug text-white/60">{it.d}</span>
                </span>
              </button>
            </li>
          ))}
        </ul>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <button onClick={reset} className="flex min-h-11 items-center justify-center gap-1.5 rounded-xl bg-white/10 text-sm font-medium text-white">
          <RotateCcw className="h-4 w-4" aria-hidden /> เริ่มใหม่
        </button>
        <a href="/guide" target="_blank" rel="noreferrer" className="flex min-h-11 items-center justify-center gap-1.5 rounded-xl bg-white/10 text-sm font-medium text-white">
          <BookOpen className="h-4 w-4" aria-hidden /> คู่มือ
        </a>
      </div>
      <p className="text-[11.5px] leading-relaxed text-white/45">
        แตะไอคอนแอปบนหน้าโฮมเพื่อเปิด · แตะแถบล่างของจอเพื่อกลับหน้าโฮม · ข้อมูลทั้ง 3 เครื่องเชื่อมกันสด
      </p>
    </div>
  );

  /* ---------- มือถือจริง: เต็มจอ ไม่มีกรอบ ---------- */
  if (mobile) {
    return (
      <main className="fixed inset-0 bg-black">
        <Device key={`${resetKey}-${role}`} role={role} bleed ringing={ringing && role === "parent"} onAccept={accept} onDecline={decline} openTo={role === "parent" ? openTo : null} />
        <button onClick={() => setSheet(true)} aria-label="แผงเดโม" className="fixed right-3 top-[max(12px,env(safe-area-inset-top))] z-50 flex h-11 w-11 items-center justify-center rounded-full bg-black/45 text-white backdrop-blur">
          <SlidersHorizontal className="h-5 w-5" aria-hidden />
        </button>
        {sheet && (
          <div className="fixed inset-0 z-[60] flex items-end bg-black/50" onClick={() => setSheet(false)}>
            <div className="slide-up max-h-[85dvh] w-full overflow-y-auto rounded-t-3xl bg-[#141a33] p-5 pb-[max(20px,env(safe-area-inset-bottom))]" onClick={(e) => e.stopPropagation()}>
              <div className="mb-3 flex justify-end">
                <button onClick={() => setSheet(false)} aria-label="ปิด" className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white"><X className="h-5 w-5" aria-hidden /></button>
              </div>
              {panel}
            </div>
          </div>
        )}
      </main>
    );
  }

  const shown = three ? ROLES : ROLES.filter((r) => r.id === role);

  return (
    <main className="flex min-h-dvh items-center justify-center gap-10 overflow-hidden bg-[radial-gradient(120%_90%_at_50%_0%,#eef1fb_0%,#dfe4f4_55%,#cfd6ee_100%)] px-8 py-6">
      <div className="flex items-start justify-center" style={{ gap: 36 * scale }}>
        {shown.map((r) => (
          <figure key={r.id} className="flex flex-col items-center">
            <div style={{ width: phoneW * scale, height: phoneH * scale }}>
              <div style={{ transform: `scale(${scale})`, transformOrigin: "top left" }}>
                <PhoneShell label={`มือถือของ${r.who}`}>
                  <Device
                    key={`${resetKey}-${r.id}`}
                    role={r.id}
                    ringing={ringing && r.id === "parent"}
                    callElsewhere={ringing && r.id === "care"}
                    onAccept={accept}
                    onDecline={decline}
                    openTo={r.id === "parent" ? openTo : null}
                  />
                </PhoneShell>
              </div>
            </div>
            <figcaption className="mt-3 text-center leading-tight">
              <span className="block text-[15px] font-semibold text-ink">มุม{r.label}</span>
              <span className="block text-[13px] text-muted">{r.who}</span>
            </figcaption>
          </figure>
        ))}
      </div>

      <aside className="no-scrollbar max-h-[calc(100dvh-48px)] w-[300px] shrink-0 self-center overflow-y-auto rounded-[28px] bg-[#141a33] p-5 shadow-[0_30px_60px_-30px_rgba(20,26,51,.7)]" aria-label="แผงควบคุมเดโม">
        {panel}
      </aside>
    </main>
  );
}
