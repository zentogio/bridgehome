"use client";

import { useSyncExternalStore } from "react";

export type Level = "green" | "yellow" | "red";
export type PkgId = "free" | "family" | "care";
export type Vital = { id: string; ts: number; sys?: number; dia?: number; sugar?: number; temp?: number; note?: string };
export type Profile = { parent: string; patient: string; caregiver: string; stage: 1 | 2 | 3; callTime: string; consent: boolean; done: boolean };
export type Memory = { id: string; text: string; priv: boolean };
export type PlanStatus = "none" | "drafted" | "sent" | "approved";

export type DemoEvent = {
  id: string;
  ts: number;
  kind: "checkin" | "sos" | "screen" | "okbtn" | "shift" | "vital" | "med";
  title: string;
  detail: string;
  level: Level;
  /** 1 = น้องใยคุย, ใช้แสดงไอคอน */
  by: "nongyai" | "parent" | "caregiver" | "nurse";
};

export type DemoState = {
  events: DemoEvent[];
  shiftsDone: Record<string, boolean>;
  shiftOwner: Record<string, string>;
  planStatus: PlanStatus;
  pkg: PkgId;
  consentShare: boolean;
  vitals: Vital[];
  medsTaken: Record<string, string>;
  profile: Profile;
  memories: Memory[];
};

const HOUR = 3600_000;
const now0 = () => Date.now();

function seed(): DemoEvent[] {
  const t = now0();
  return [
    {
      id: "s1",
      ts: t - 26 * HOUR,
      kind: "checkin",
      title: "น้องใยคุยตอนเช้า",
      detail: "นอนหลับดี กินยาครบ กินข้าวได้ อารมณ์ปกติ",
      level: "green",
      by: "nongyai",
    },
    {
      id: "s2",
      ts: t - 50 * HOUR,
      kind: "checkin",
      title: "น้องใยคุยตอนเช้า",
      detail: "นอนไม่ค่อยหลับ กินข้าวได้น้อย",
      level: "yellow",
      by: "nongyai",
    },
  ];
}

const DEFAULT: DemoState = {
  events: [],
  shiftsDone: {},
  shiftOwner: {},
  planStatus: "none",
  pkg: "free",
  consentShare: true,
  vitals: [],
  medsTaken: {},
  memories: [
    { id: "m1", text: "ชอบฟังเพลงสุนทราภรณ์ตอนเช้า", priv: false },
    { id: "m2", text: "ห่วงคุณตาตอนกลางคืน กลัวพลิกตัวไม่ทัน", priv: false },
    { id: "m3", text: "ยังไม่อยากให้ลูกรู้ว่าเงินเก็บเหลือน้อย", priv: true },
  ],
  profile: { parent: "คุณยายสมใจ", patient: "คุณตาชม", caregiver: "เพ็ญ", stage: 3, callTime: "07:30", consent: false, done: false },
};

const KEY = "bridgehome-demo-v1";
let raw: string | null | undefined = undefined; // undefined = ยังไม่เคยอ่าน (ต้องสร้างข้อมูลตัวอย่างครั้งแรก)
let cached: DemoState = DEFAULT;
const listeners = new Set<() => void>();

function read(): DemoState {
  if (typeof window === "undefined") return DEFAULT;
  const r = window.localStorage.getItem(KEY);
  if (r === raw) return cached;
  raw = r;
  try {
    const p = r ? (JSON.parse(r) as Partial<DemoState>) : null;
    cached = { ...DEFAULT, ...p, events: p?.events?.length ? p.events : seed() };
  } catch {
    cached = { ...DEFAULT, events: seed() };
  }
  return cached;
}

function emit() {
  listeners.forEach((l) => l());
}

function subscribe(cb: () => void) {
  listeners.add(cb);
  const onStorage = (e: StorageEvent) => {
    if (e.key === KEY) cb();
  };
  window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(cb);
    window.removeEventListener("storage", onStorage);
  };
}

export function useDemo(): DemoState {
  return useSyncExternalStore(subscribe, read, () => DEFAULT);
}

export function update(fn: (s: DemoState) => DemoState) {
  window.localStorage.setItem(KEY, JSON.stringify(fn(read())));
  emit();
}

export function addEvent(e: Omit<DemoEvent, "id" | "ts">) {
  update((s) => ({
    ...s,
    events: [{ ...e, id: crypto.randomUUID(), ts: Date.now() }, ...s.events].slice(0, 60),
  }));
}

export function resetDemo() {
  window.localStorage.removeItem(KEY);
  emit();
}

export function worstLevel(events: DemoEvent[]): Level {
  if (events.some((e) => e.level === "red")) return "red";
  if (events.some((e) => e.level === "yellow")) return "yellow";
  return "green";
}

export function timeAgo(ts: number): string {
  const m = Math.max(0, Math.round((Date.now() - ts) / 60000));
  if (m < 1) return "เมื่อสักครู่";
  if (m < 60) return `${m} นาทีที่แล้ว`;
  const h = Math.round(m / 60);
  if (h < 24) return `${h} ชั่วโมงที่แล้ว`;
  return `${Math.round(h / 24)} วันที่แล้ว`;
}

/** วันที่วันนี้ (เฉพาะฝั่งไคลเอนต์ กัน prerender เจอค่า new Date() ที่ไม่คงที่) */
export function useToday(): string {
  return useSyncExternalStore(
    () => () => {},
    () => new Date().toDateString(),
    () => "",
  );
}
