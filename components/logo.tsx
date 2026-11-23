"use client";

import { useState } from "react";

/** โลโก้จริง: public/brand/logo.png (บ้านขาวบนพื้นน้ำเงิน มุมโปร่งใส) ถ้าไฟล์หายจะใช้เครื่องหมายสำรอง */
export function LogoMark({ size = 40 }: { size?: number; tone?: "color" | "light" }) {
  const [failed, setFailed] = useState(false);
  if (!failed) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img src="/brand/logo.png" alt="" width={size} height={size} onError={() => setFailed(true)} className="object-contain" />
    );
  }
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" aria-hidden>
      <rect width="64" height="64" rx="12" fill="#2a3c8e" />
      <path d="M17 31 L32 18 L47 31 M21 28.5 V42 H43 V28.5" fill="none" stroke="#fff" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M10 47 C22 58 42 58 54 47" fill="none" stroke="#f4a93b" strokeWidth="4" strokeLinecap="round" />
    </svg>
  );
}

export function Wordmark({ light = false }: { light?: boolean }) {
  return (
    <span className="leading-tight">
      <span className={`block text-lg font-semibold ${light ? "text-white" : "text-ink"}`}>Bridge Home</span>
      <span className={`block text-sm ${light ? "text-white/75" : "text-muted"}`}>× สายใย</span>
    </span>
  );
}
