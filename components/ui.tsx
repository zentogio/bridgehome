"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, CheckCircle2, AlertTriangle, Siren } from "lucide-react";
import type { Level } from "@/lib/store";
import { MOCK_MSG, useToast } from "./toast";

export const LEVEL_UI: Record<Level, { label: string; cls: string; Icon: typeof CheckCircle2; word: string }> = {
  green: { label: "ปกติ", cls: "bg-ok-soft text-ok", Icon: CheckCircle2, word: "เขียว" },
  yellow: { label: "ควรติดตาม", cls: "bg-warn-soft text-warn", Icon: AlertTriangle, word: "เหลือง" },
  red: { label: "ต้องทำทันที", cls: "bg-bad-soft text-bad", Icon: Siren, word: "แดง" },
};

/** สีไม่ใช้อย่างเดียว: มีไอคอน + ข้อความกำกับเสมอ */
export function LevelBadge({ level, className = "" }: { level: Level; className?: string }) {
  const u = LEVEL_UI[level];
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-sm font-semibold ${u.cls} ${className}`}>
      <u.Icon className="h-4 w-4" aria-hidden />
      {u.word} · {u.label}
    </span>
  );
}

export function Card({
  children,
  className = "",
  as: Tag = "section",
}: {
  children: React.ReactNode;
  className?: string;
  as?: "section" | "div" | "article";
}) {
  return <Tag className={`rounded-2xl border border-line bg-card p-5 ${className}`}>{children}</Tag>;
}

export function PageHeader({
  title,
  sub,
  back,
  right,
}: {
  title: string;
  sub?: string;
  back?: string;
  right?: React.ReactNode;
}) {
  const router = useRouter();
  return (
    <header className="sticky top-0 z-30 border-b border-line bg-bg/95 backdrop-blur">
      <div className="mx-auto flex max-w-2xl items-center gap-2 px-4 py-3">
        {back && (
          <Link
            href={back}
            onClick={(e) => {
              if (window.history.length > 1) {
                e.preventDefault();
                router.back();
              }
            }}
            aria-label="ย้อนกลับ"
            className="-ml-2 flex h-12 w-12 items-center justify-center rounded-full text-ink hover:bg-brand-soft"
          >
            <ArrowLeft className="h-6 w-6" aria-hidden />
          </Link>
        )}
        <div className="min-w-0 flex-1">
          <h1 className="truncate text-xl font-bold leading-tight">{title}</h1>
          {sub && <p className="truncate text-sm text-muted">{sub}</p>}
        </div>
        {right}
      </div>
    </header>
  );
}

const BTN = {
  primary: "bg-brand text-white hover:bg-brand-dark",
  soft: "bg-brand-soft text-brand-ink hover:bg-sheet",
  ghost: "border border-line bg-white text-ink hover:bg-sheet",
  danger: "bg-bad text-white hover:brightness-90",
};

export function Btn({
  children,
  variant = "primary",
  className = "",
  ...rest
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: keyof typeof BTN }) {
  return (
    <button
      {...rest}
      className={`inline-flex min-h-12 items-center justify-center gap-2 rounded-xl px-5 py-3 text-base font-semibold transition-colors duration-150 active:scale-[0.98] disabled:opacity-50 ${BTN[variant]} ${className}`}
    >
      {children}
    </button>
  );
}

export function LinkBtn({
  href,
  children,
  variant = "primary",
  className = "",
}: {
  href: string;
  children: React.ReactNode;
  variant?: keyof typeof BTN;
  className?: string;
}) {
  return (
    <Link
      href={href}
      className={`inline-flex min-h-12 items-center justify-center gap-2 rounded-xl px-5 py-3 text-base font-semibold transition-colors duration-150 active:scale-[0.98] ${BTN[variant]} ${className}`}
    >
      {children}
    </Link>
  );
}

/** ปุ่มที่กดได้จริง แต่ระบบหลังบ้านยังไม่เชื่อม: แจ้งผู้ใช้ชัดเจน ไม่เงียบ */
export function MockBtn({
  children,
  variant = "ghost",
  className = "",
  note,
}: {
  children: React.ReactNode;
  variant?: keyof typeof BTN;
  className?: string;
  note?: string;
}) {
  const toast = useToast();
  return (
    <Btn variant={variant} className={className} onClick={() => toast(note ?? MOCK_MSG)}>
      {children}
      <span className="rounded-md bg-thread-soft px-1.5 text-xs font-bold text-thread-deep">เดโม</span>
    </Btn>
  );
}

export function Section({ title, children, right }: { title: string; children: React.ReactNode; right?: React.ReactNode }) {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-2">
        <h2 className="text-lg font-bold">{title}</h2>
        {right}
      </div>
      {children}
    </div>
  );
}
