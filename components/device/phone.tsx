"use client";

import { useEffect, useState } from "react";

export const SCREEN_W = 393;
export const SCREEN_H = 852;

export type IslandMsg = { title: string; sub: string; color: string; icon: React.ReactNode } | null;

function useClock() {
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
  return t;
}

export function StatusBar({ light }: { light: boolean }) {
  const time = useClock();
  return (
    <div
      className={`pointer-events-none absolute inset-x-0 top-0 z-30 flex h-[50px] items-start justify-between px-8 pt-[17px] text-[15px] font-semibold transition-colors duration-300 ${
        light ? "text-white" : "text-ink"
      }`}
    >
      <span className="tnum w-14 pl-2">{time}</span>
      <span className="flex items-center gap-1.5" aria-hidden>
        <svg width="17" height="11" viewBox="0 0 18 11" fill="currentColor"><rect x="0" y="7" width="3" height="4" rx="1" /><rect x="5" y="5" width="3" height="6" rx="1" /><rect x="10" y="2.5" width="3" height="8.5" rx="1" /><rect x="15" y="0" width="3" height="11" rx="1" /></svg>
        <svg width="15" height="11" viewBox="0 0 16 11" fill="currentColor"><path d="M8 2.2c2.3 0 4.4.9 6 2.4l1.2-1.3A10.3 10.3 0 0 0 8 .4 10.3 10.3 0 0 0 .8 3.3L2 4.6a8.5 8.5 0 0 1 6-2.4Zm0 3.4c1.4 0 2.6.5 3.6 1.4l1.2-1.3A7 7 0 0 0 8 3.8 7 7 0 0 0 3.2 5.7L4.4 7c1-.9 2.2-1.4 3.6-1.4Zm0 3.3c-.6 0-1.1.2-1.4.6L8 11l1.4-1.5c-.3-.4-.8-.6-1.4-.6Z" /></svg>
        <svg width="25" height="12" viewBox="0 0 26 12" fill="currentColor"><rect x=".5" y=".5" width="22" height="11" rx="3.2" fill="none" stroke="currentColor" opacity=".4" /><rect x="2" y="2" width="16" height="8" rx="2" /><path d="M24 4v4c.8-.3 1.3-1.1 1.3-2S24.8 4.3 24 4Z" opacity=".5" /></svg>
      </span>
    </div>
  );
}

/** Dynamic Island: ขยายเป็นการแจ้งเตือนสด แล้วหดกลับเอง */
export function Island({ msg, onClick }: { msg: IslandMsg; onClick?: () => void }) {
  const open = !!msg;
  return (
    <button
      type="button"
      onClick={onClick}
      tabIndex={open ? 0 : -1}
      aria-live="polite"
      aria-label={open ? `${msg.title} ${msg.sub}` : "Dynamic Island"}
      className="absolute left-1/2 top-[11px] z-40 flex -translate-x-1/2 items-center gap-3 overflow-hidden bg-black px-3 text-left text-white"
      style={{
        width: open ? 360 : 124,
        height: open ? 72 : 36,
        borderRadius: open ? 36 : 20,
        transition: "width .5s cubic-bezier(.3,1.25,.5,1), height .5s cubic-bezier(.3,1.25,.5,1), border-radius .5s",
      }}
    >
      <span
        className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full"
        style={{ background: msg?.color ?? "transparent", opacity: open ? 1 : 0, transition: "opacity .2s", transitionDelay: open ? ".22s" : "0s" }}
      >
        {msg?.icon}
      </span>
      <span className="min-w-0 flex-1 leading-snug" style={{ opacity: open ? 1 : 0, transition: "opacity .2s", transitionDelay: open ? ".22s" : "0s" }}>
        <b className="block truncate text-[14px] font-medium">{msg?.title}</b>
        <span className="line-clamp-2 text-[12.5px] text-white/75">{msg?.sub}</span>
      </span>
    </button>
  );
}

/** กรอบ iPhone (ไทเทเนียมสีครามเข้ม ให้เข้ากับแบรนด์) */
export function PhoneShell({ children, label }: { children: React.ReactNode; label: string }) {
  return (
    <div
      className="relative rounded-[64px] bg-[#0b0c10] p-[12px]"
      style={{
        width: SCREEN_W + 24,
        height: SCREEN_H + 24,
        boxShadow:
          "0 0 0 2px #4a5070, 0 0 0 4px #2b2f45, 0 50px 90px -40px rgba(20,30,80,.55), inset 0 0 0 1px #2a2c36",
      }}
      aria-label={label}
    >
      <span className="absolute -left-[6px] top-[150px] h-[34px] w-[4px] rounded bg-[#3a3f5c]" />
      <span className="absolute -left-[6px] top-[210px] h-[62px] w-[4px] rounded bg-[#3a3f5c]" />
      <span className="absolute -left-[6px] top-[284px] h-[62px] w-[4px] rounded bg-[#3a3f5c]" />
      <span className="absolute -right-[6px] top-[236px] h-[100px] w-[4px] rounded bg-[#3a3f5c]" />
      <div className="relative overflow-hidden rounded-[52px] bg-black" style={{ width: SCREEN_W, height: SCREEN_H }}>
        {children}
      </div>
    </div>
  );
}
