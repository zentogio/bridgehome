"use client";

import { createContext, useCallback, useContext, useRef, useState } from "react";
import { Info } from "lucide-react";

type Notify = (msg: string) => void;
const Ctx = createContext<Notify>(() => {});

export function useToast() {
  return useContext(Ctx);
}

export const MOCK_MSG = "ฟีเจอร์นี้ยังไม่เชื่อมระบบจริง (โหมดเดโม) แต่หน้าจอพร้อมใช้งานแล้ว";

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [msg, setMsg] = useState<string | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const notify = useCallback((m: string) => {
    setMsg(m);
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => setMsg(null), 3200);
  }, []);

  return (
    <Ctx.Provider value={notify}>
      {children}
      <div
        aria-live="polite"
        role="status"
        className="pointer-events-none fixed inset-x-0 bottom-24 z-[60] flex justify-center px-4"
      >
        {msg && (
          <div className="slide-up pointer-events-auto flex max-w-md items-start gap-3 rounded-2xl bg-ink px-4 py-3 text-white ">
            <Info className="mt-0.5 h-5 w-5 shrink-0" aria-hidden />
            <p className="text-base">{msg}</p>
          </div>
        )}
      </div>
    </Ctx.Provider>
  );
}
