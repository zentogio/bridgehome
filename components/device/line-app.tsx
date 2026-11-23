"use client";

import { useEffect, useRef, useState } from "react";
import { ChevronLeft, Search, Phone, Menu, Plus, Camera, Image as ImageIcon, Smile, Send, ScanLine, Settings2, UserPlus } from "lucide-react";
import { useDemo, worstLevel, type DemoEvent, type Level } from "@/lib/store";
import { SHIFTS } from "@/lib/data";

/**
 * แอป LINE จำลอง (หน้าจอคร่าวๆ เพื่อเล่าว่า Bridge Home ทำงานในกลุ่ม LINE ครอบครัว)
 * ข้อความของบอท Bridge Home มาจากเหตุการณ์จริงในเดโม จึงขึ้นทันทีเมื่อเล่นสถานการณ์
 */

export const LINE_GREEN = "#06C755";

export function LineIcon({ size = 62, radius = 15 }: { size?: number; radius?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" aria-hidden style={{ borderRadius: radius }}>
      <rect width="64" height="64" rx="14" fill={LINE_GREEN} />
      <path d="M32 13c-12.7 0-23 8.2-23 18.4 0 9.1 8.2 16.8 19.2 18.2.8.2 1.8.5 2 1.2.2.6.1 1.6.1 2.2l-.3 2c-.1.6-.5 2.3 2 1.3s13.5-8 18.5-13.6c3.4-3.7 5-7.5 5-11.3C55.5 21.2 44.7 13 32 13Z" fill="#fff" />
      <text x="32" y="36.5" textAnchor="middle" fontFamily="Arial, sans-serif" fontWeight="900" fontSize="12.5" fill={LINE_GREEN}>LINE</text>
    </svg>
  );
}

type Who = "bot" | "ton" | "daeng" | "pen" | "yai" | "nurse";
const PEOPLE: Record<Who, { name: string; color: string; initial: string }> = {
  bot: { name: "Bridge Home", color: "#2a3c8e", initial: "B" },
  ton: { name: "ต้น", color: "#3F8A6B", initial: "ต" },
  daeng: { name: "ป้าแดง", color: "#C98A2B", initial: "ด" },
  pen: { name: "เพ็ญ", color: "#3A6FD8", initial: "พ" },
  yai: { name: "ยายสมใจ", color: "#B5657A", initial: "ย" },
  nurse: { name: "พว.สุดา", color: "#6A5ACD", initial: "ส" },
};

const LEVEL_BAR: Record<Level, string> = { green: "#2f9a5e", yellow: "#e5a530", red: "#d9443a" };
const LEVEL_WORD: Record<Level, string> = { green: "ปกติ", yellow: "ควรดู", red: "ด่วน" };

type Msg =
  | { kind: "text"; who: Who; text: string; time: string }
  | { kind: "card"; level: Level; title: string; detail: string; time: string; cta?: string };

const SEED: Msg[] = [
  { kind: "text", who: "ton", text: "วันนี้ผมเข้าเวรเย็นนะครับ", time: "06:40" },
  { kind: "card", level: "green", title: "สรุปกะดึก", detail: "พลิกตัวคุณตาครบ 4 รอบ ผิวปกติ ไม่มีไข้", time: "06:55" },
  { kind: "text", who: "daeng", text: "ป้าแดงจะแวะเอาข้าวต้มไปให้แม่ตอนสายนะ", time: "07:05" },
];

const hhmm = (ts: number) => {
  const d = new Date(ts);
  return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
};

/** เวลาปัจจุบัน (เรียกเฉพาะใน event handler) */
function now() {
  return hhmm(Date.now());
}

function toMsg(e: DemoEvent): Msg {
  const time = hhmm(e.ts);
  if (e.by === "nurse") return { kind: "text", who: "nurse", text: `${e.title} · ${e.detail}`, time };
  if (e.by === "caregiver" && e.level === "green") return { kind: "text", who: "pen", text: `${e.title}: ${e.detail}`, time };
  return { kind: "card", level: e.level, title: e.title, detail: e.detail, time, cta: e.level === "red" ? "โทรหาคุณยาย" : e.level === "yellow" ? "ดูรายละเอียด" : undefined };
}

function Avatar({ who, size = 34 }: { who: Who; size?: number }) {
  if (who === "bot") {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src="/brand/logo.png" alt="" width={size} height={size} className="shrink-0 rounded-full bg-white" />;
  }
  const p = PEOPLE[who];
  return (
    <span className="flex shrink-0 items-center justify-center rounded-full text-[13px] font-semibold text-white" style={{ width: size, height: size, background: p.color }} aria-hidden>
      {p.initial}
    </span>
  );
}

const BotBadge = () => (
  <span className="ml-1 rounded-[4px] px-1 py-px align-middle text-[9px] font-bold leading-none text-white" style={{ background: LINE_GREEN }}>
    BOT
  </span>
);

export function LineApp({ me, onClose, topInset }: { me: "pen" | "yai"; onClose: () => void; topInset: number }) {
  const s = useDemo();
  const [view, setView] = useState<"list" | "group">("list");
  const [draft, setDraft] = useState("");
  const [mine, setMine] = useState<Msg[]>([]);
  const endRef = useRef<HTMLDivElement>(null);

  const events = [...s.events].reverse();
  const live = events.map(toMsg);
  const all = [...SEED, ...live, ...mine];
  const last = all[all.length - 1];
  const lastText = last ? (last.kind === "card" ? `Bridge Home: ${last.title}` : `${PEOPLE[last.who].name}: ${last.text}`) : "";
  const unread = Math.min(9, s.events.slice(0, 6).filter((e) => e.by !== (me === "pen" ? "caregiver" : "parent")).length);

  useEffect(() => {
    if (view === "group") endRef.current?.scrollIntoView({ block: "end" });
  }, [view, all.length]);

  const send = (raw: string) => {
    const text = raw.trim();
    if (!text) return;
    setDraft("");
    const add: Msg[] = [{ kind: "text", who: me, text, time: now() }];
    // คำสั่งบอท: พิมพ์ "สรุป" ให้บอทส่งสรุปวันนี้
    if (/สรุป|วันนี้เป็นไง|สถานะ/.test(text)) {
      const today = s.events.filter((e) => new Date(e.ts).toDateString() === new Date().toDateString());
      const level = worstLevel(today.length ? today : s.events.slice(0, 1));
      const done = SHIFTS.filter((x) => s.shiftsDone[x.id]).length;
      setMine((m) => [...m, ...add]);
      setTimeout(
        () =>
          setMine((m) => [
            ...m,
            {
              kind: "card",
              level,
              title: `สรุปวันนี้ · ${LEVEL_WORD[level]}`,
              detail: `${s.events[0]?.title ?? "ยังไม่มีข่าว"} · เวร ${done}/${SHIFTS.length} · น้องใยโทร ${s.profile.callTime}`,
              time: now(),
              cta: "เปิด Bridge Home",
            },
          ]),
        700,
      );
      return;
    }
    setMine((m) => [...m, ...add]);
    if (me === "pen") setTimeout(() => setMine((m) => [...m, { kind: "text", who: "ton", text: "รับทราบครับพี่", time: now() }]), 1200);
  };

  /* ---------- รายการแชท ---------- */
  if (view === "list") {
    const rows = [
      { id: "group", name: "ครอบครัวคุณยายสมใจ (5)", preview: lastText, time: last?.time ?? "", badge: unread, group: true },
      { id: "oa", name: "Bridge Home", preview: "สวัสดีค่ะ พิมพ์ “สรุป” ในกลุ่มเพื่อดูสถานะบ้านคุณยาย", time: "เมื่อวาน", badge: 0, oa: true },
      { id: "nurse", name: "พว.สุดา (คลินิกบ้านกรุง)", preview: "พรุ่งนี้พยาบาลโทรติดตามช่วงบ่ายนะคะ", time: "เมื่อวาน", badge: 0 },
      { id: "ton", name: "ต้น", preview: "พี่ เดี๋ยวผมรับเวรเย็นแทนเอง", time: "จ.", badge: 0 },
      { id: "daeng", name: "ป้าแดง", preview: "ส่งรูปแล้ว", time: "อา.", badge: 0 },
    ];
    return (
      <div className="flex h-full flex-col bg-white text-[#111]" style={{ paddingTop: topInset }}>
        <div className="flex items-center justify-between px-4 pb-2 pt-2">
          <button onClick={onClose} className="flex items-center gap-0.5 text-[22px] font-bold" aria-label="ปิด LINE">
            แชท <ChevronLeft className="h-4 w-4 -rotate-90" aria-hidden />
          </button>
          <div className="flex items-center gap-4 text-[#111]">
            <Settings2 className="h-5 w-5" aria-hidden />
            <UserPlus className="h-5 w-5" aria-hidden />
            <Plus className="h-5 w-5" aria-hidden />
          </div>
        </div>
        <div className="mx-4 mb-2 flex items-center gap-2 rounded-lg bg-[#f1f2f4] px-3 py-2 text-[13px] text-[#8b8f97]">
          <Search className="h-4 w-4" aria-hidden /> ค้นหา <span className="flex-1" /> <ScanLine className="h-4 w-4" aria-hidden />
        </div>
        <ul className="flex-1 overflow-y-auto">
          {rows.map((r) => (
            <li key={r.id}>
              <button
                onClick={() => (r.id === "group" ? setView("group") : undefined)}
                className={`flex w-full items-center gap-3 px-4 py-2.5 text-left ${r.id === "group" ? "active:bg-[#f1f2f4]" : "opacity-60"}`}
                aria-label={r.id === "group" ? `เปิดแชท ${r.name}` : `${r.name} (ภาพจำลอง)`}
              >
                {r.group ? (
                  <span className="relative h-12 w-12 shrink-0">
                    <span className="absolute left-0 top-0"><Avatar who="pen" size={28} /></span>
                    <span className="absolute bottom-0 right-0 rounded-full ring-2 ring-white"><Avatar who="yai" size={28} /></span>
                  </span>
                ) : r.oa ? (
                  <Avatar who="bot" size={48} />
                ) : (
                  <Avatar who={r.id === "nurse" ? "nurse" : r.id === "ton" ? "ton" : "daeng"} size={48} />
                )}
                <span className="min-w-0 flex-1">
                  <span className="flex items-center text-[15px] font-semibold">
                    <span className="truncate">{r.name}</span>
                    {r.oa && <BotBadge />}
                  </span>
                  <span className="block truncate text-[13px] text-[#8b8f97]">{r.preview}</span>
                </span>
                <span className="flex shrink-0 flex-col items-end gap-1">
                  <span className="text-[11px] text-[#8b8f97]">{r.time}</span>
                  {r.badge > 0 && <span className="min-w-5 rounded-full px-1.5 text-center text-[11px] font-bold leading-5 text-white" style={{ background: LINE_GREEN }}>{r.badge}</span>}
                </span>
              </button>
            </li>
          ))}
        </ul>
        <nav className="grid grid-cols-5 border-t border-[#eee] pb-6 pt-2 text-center text-[10px] text-[#8b8f97]" aria-hidden>
          {["หน้าหลัก", "แชท", "VOOM", "ข่าว", "วอลเล็ท"].map((t) => (
            <span key={t} className={t === "แชท" ? "font-bold text-[#111]" : ""}>{t}</span>
          ))}
        </nav>
      </div>
    );
  }

  /* ---------- ห้องแชทกลุ่ม ---------- */
  return (
    <div className="flex h-full flex-col bg-[#8cabd9]" style={{ paddingTop: topInset }}>
      <div className="flex items-center gap-1 px-2 pb-2 pt-1 text-[#111]">
        <button onClick={() => setView("list")} aria-label="กลับรายการแชท" className="flex h-10 w-10 items-center justify-center">
          <ChevronLeft className="h-6 w-6" aria-hidden />
        </button>
        <p className="min-w-0 flex-1 truncate text-[16px] font-bold">ครอบครัวคุณยายสมใจ (5)</p>
        <Search className="mx-2 h-5 w-5" aria-hidden />
        <Phone className="mx-2 h-5 w-5" aria-hidden />
        <Menu className="mx-2 h-5 w-5" aria-hidden />
      </div>

      <div className="no-scrollbar flex-1 space-y-3 overflow-y-auto px-3 pb-3" role="log" aria-label="ข้อความในกลุ่ม">
        <p className="mx-auto w-fit rounded-full bg-black/15 px-3 py-0.5 text-[11px] text-white">วันนี้</p>
        {all.map((m, i) => {
          if (m.kind === "card") {
            return (
              <div key={i} className="flex items-start gap-2">
                <Avatar who="bot" />
                <div className="min-w-0 max-w-[78%]">
                  <p className="mb-0.5 text-[11px] text-[#1f2f55]">Bridge Home <BotBadge /></p>
                  <div className="flex items-end gap-1.5">
                    <div className="overflow-hidden rounded-2xl bg-white shadow-sm">
                      <div className="flex items-center gap-1.5 px-3 py-1.5 text-[12px] font-bold text-white" style={{ background: LEVEL_BAR[m.level] }}>
                        บ้านคุณยายสมใจ · {LEVEL_WORD[m.level]}
                      </div>
                      <div className="px-3 py-2">
                        <p className="text-[14px] font-semibold leading-snug text-[#111]">{m.title}</p>
                        <p className="mt-0.5 text-[13px] leading-snug text-[#444]">{m.detail}</p>
                      </div>
                      {m.cta && <div className="border-t border-[#eee] py-2 text-center text-[13px] font-semibold" style={{ color: "#2a3c8e" }}>{m.cta}</div>}
                    </div>
                    <span className="shrink-0 text-[10px] text-[#1f2f55]/70">{m.time}</span>
                  </div>
                </div>
              </div>
            );
          }
          const isMe = m.who === me;
          if (isMe) {
            return (
              <div key={i} className="flex items-end justify-end gap-1.5">
                <span className="text-[10px] text-[#1f2f55]/70">อ่านแล้ว<br />{m.time}</span>
                <p className="max-w-[72%] rounded-2xl rounded-tr-sm px-3 py-2 text-[14px] leading-snug text-[#111]" style={{ background: "#85e249" }}>{m.text}</p>
              </div>
            );
          }
          return (
            <div key={i} className="flex items-start gap-2">
              <Avatar who={m.who} />
              <div className="min-w-0 max-w-[75%]">
                <p className="mb-0.5 text-[11px] text-[#1f2f55]">{PEOPLE[m.who].name}</p>
                <div className="flex items-end gap-1.5">
                  <p className="rounded-2xl rounded-tl-sm bg-white px-3 py-2 text-[14px] leading-snug text-[#111]">{m.text}</p>
                  <span className="shrink-0 text-[10px] text-[#1f2f55]/70">{m.time}</span>
                </div>
              </div>
            </div>
          );
        })}
        <div ref={endRef} />
      </div>

      <div className="bg-white pb-6">
        <div className="no-scrollbar flex gap-2 overflow-x-auto px-3 pt-2">
          {["สรุปวันนี้", "ใครเข้าเวรเย็น", "เดี๋ยวโทรหาแม่เอง"].map((q) => (
            <button key={q} onClick={() => send(q)} className="shrink-0 rounded-full border border-[#dcdfe4] px-3 py-1 text-[12px] text-[#333]">{q}</button>
          ))}
        </div>
        <form onSubmit={(e) => { e.preventDefault(); send(draft); }} className="flex items-center gap-2 px-3 pt-2 text-[#8b8f97]">
          <Plus className="h-5 w-5 shrink-0" aria-hidden />
          <Camera className="h-5 w-5 shrink-0" aria-hidden />
          <ImageIcon className="h-5 w-5 shrink-0" aria-hidden />
          <label htmlFor={`line-${me}`} className="sr-only">พิมพ์ข้อความในกลุ่ม</label>
          <span className="flex min-w-0 flex-1 items-center rounded-full bg-[#f1f2f4] px-3">
            <input id={`line-${me}`} value={draft} onChange={(e) => setDraft(e.target.value)} placeholder="Aa" className="h-9 min-w-0 flex-1 bg-transparent text-[14px] text-[#111] outline-none" autoComplete="off" />
            <Smile className="h-4 w-4 shrink-0" aria-hidden />
          </span>
          <button type="submit" aria-label="ส่ง" className="shrink-0" style={{ color: draft.trim() ? LINE_GREEN : "#b9bdc4" }}>
            <Send className="h-5 w-5" aria-hidden />
          </button>
        </form>
      </div>
    </div>
  );
}
