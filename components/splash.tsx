"use client";

import { useEffect, useState, useSyncExternalStore } from "react";

const KEY = "bh-splash-seen";

/**
 * ภาพเคลื่อนไหวเข้าแอป 6 วินาที (CSS/SVG ล้วน คมทุกจอ ไฟล์เบา)
 * 0–2.4s เชือกทองสองเส้นพันสวนกัน · 2.4–3.4s บ้านเด้ง · 3.9–5.0s พื้นน้ำเงินแผ่กลืน · 4.6s โลโก้ · 5.1s ชื่อแอป
 * ใช้ได้ทั้งเต็มจอ (Splash) และในกรอบมือถือ (SplashArt + onDone)
 */
export function SplashArt({ onDone, quick = false }: { onDone: () => void; quick?: boolean }) {
  const [leaving, setLeaving] = useState(false);
  useEffect(() => {
    const t1 = setTimeout(() => setLeaving(true), quick ? 900 : 5600);
    const t2 = setTimeout(onDone, quick ? 1300 : 6050);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, [onDone, quick]);

  if (quick) {
    return (
      <div className={`absolute inset-0 flex flex-col items-center justify-center gap-5 bg-brand text-white ${leaving ? "sp-leave" : ""}`}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/brand/logo.png" alt="" className="w-[46%] max-w-[200px]" />
      </div>
    );
  }

  return (
    <div className={`sp-root absolute inset-0 overflow-hidden ${leaving ? "sp-leave" : ""}`} onClick={onDone}>
      <svg viewBox="0 0 300 600" preserveAspectRatio="xMidYMid slice" className="absolute inset-0 h-full w-full" aria-hidden>
        <g fill="none" stroke="oklch(0.79 0.165 68)" strokeWidth="9" strokeLinecap="round">
          <path className="sp-thread" d="M105 -20 C 105 120, 195 170, 150 270 C 120 340, 190 380, 150 430" />
          <path className="sp-thread sp-thread-b" d="M195 -20 C 195 120, 105 170, 150 270 C 180 340, 110 380, 150 430" />
        </g>
        <circle className="sp-knot" cx="150" cy="432" r="12" fill="oklch(0.79 0.165 68)" />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/brand/logo-mark.png" alt="" className="sp-house w-[58%] max-w-[280px]" />
      </div>
      <div className="sp-wipe absolute inset-0 bg-brand" />
      <div className="absolute inset-0 flex flex-col items-center justify-center gap-6 px-8 text-center text-white">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/brand/logo.png" alt="Bridge Home" className="sp-logo w-[48%] max-w-[220px]" />
        <div className="sp-text">
          <p className="text-3xl font-semibold">Bridge Home</p>
          <p className="text-lg text-white/80">× สายใย</p>
        </div>
      </div>
      <p className="sp-text absolute inset-x-0 bottom-10 text-center text-sm text-white/70">แตะเพื่อข้าม</p>
    </div>
  );
}

/** เต็มจอ ครั้งเดียวต่อรอบเปิด (ใช้ตอนเปิดเว็บตรงบนมือถือ ไม่แสดงเมื่ออยู่ในกรอบเดโม) */
export function Splash() {
  const skip = useSyncExternalStore(
    () => () => {},
    () => sessionStorage.getItem(KEY) === "1" || window.self !== window.top,
    () => false,
  );
  const [gone, setGone] = useState(false);
  if (skip || gone) return null;
  return (
    <div className="fixed inset-0 z-[100]" role="dialog" aria-label="กำลังเข้าสู่ Bridge Home">
      <SplashArt
        onDone={() => {
          sessionStorage.setItem(KEY, "1");
          setGone(true);
        }}
      />
    </div>
  );
}
