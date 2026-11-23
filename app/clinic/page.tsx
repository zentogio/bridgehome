"use client";

import { useMemo, useState } from "react";
import { HScroll } from "@/components/hscroll";
import {
  Search, X, ClipboardCheck, CheckCheck, ChevronRight, ArrowLeft, Phone, MessageSquare, House, FileText,
  Users, CalendarClock, BookOpenCheck, Wallet, MapPin, ShieldCheck, Clock,
} from "lucide-react";
import { Btn, LevelBadge, MockBtn } from "@/components/ui";
import { LogoMark } from "@/components/logo";
import { addEvent, update, useDemo, worstLevel, timeAgo, type Level } from "@/lib/store";
import { CASES, LIBRARY, VISITS, type ClinicCase } from "@/lib/clinic";
import { PLAN_ITEMS } from "@/lib/data";

const ORDER: Record<Level, number> = { red: 0, yellow: 1, green: 2 };
const DOT: Record<Level, string> = { red: "bg-bad", yellow: "bg-[#e5a530]", green: "bg-ok" };
type Tab = "cases" | "visits" | "library" | "money";
type Filter = "all" | Level | "plan";

export default function Clinic() {
  const s = useDemo();
  const [tab, setTab] = useState<Tab>("cases");
  const [q, setQ] = useState("");
  const [searching, setSearching] = useState(false);
  const [filter, setFilter] = useState<Filter>("all");
  const [open, setOpen] = useState<string | null>(null);

  const live: ClinicCase = useMemo(
    () => ({
      id: "live",
      family: `บ้านคุณ${s.profile.caregiver} (เดโมสด)`,
      patient: s.profile.patient,
      age: 83,
      pkg: "Care+",
      stage: "ติดเตียง · มีคุณยายดูแล",
      level: worstLevel(s.events.slice(0, 3)),
      note: s.events[0]?.detail ?? "ยังไม่มีข้อมูล",
      updated: s.events[0] ? timeAgo(s.events[0].ts) : "-",
      district: "พระนครศรีอยุธยา",
      history: s.events.slice(0, 6).map((e) => `${e.title}: ${e.detail}`),
    }),
    [s.events, s.profile],
  );

  const all = [live, ...CASES].sort((a, b) => ORDER[a.level] - ORDER[b.level]);
  const count = { red: all.filter((c) => c.level === "red").length, yellow: all.filter((c) => c.level === "yellow").length, green: all.filter((c) => c.level === "green").length };
  const planWaiting = s.planStatus === "sent";
  const needle = q.trim();
  const shown = all.filter((c) => {
    if (filter === "plan") return c.id === "live" && planWaiting;
    if (filter !== "all" && c.level !== filter) return false;
    if (!needle) return true;
    return [c.family, c.patient, c.note, c.district, c.pkg, c.stage].some((x) => x.includes(needle));
  });

  const sel = all.find((c) => c.id === open);

  /* ---------- รายละเอียดเคส ---------- */
  if (sel) {
    return (
      <div className="min-h-dvh pb-28">
        <header className="sticky top-0 z-30 flex items-center gap-2 border-b border-line bg-white/95 px-3 py-2 backdrop-blur">
          <button onClick={() => setOpen(null)} aria-label="กลับรายการเคส" className="flex h-12 w-12 items-center justify-center rounded-full hover:bg-sheet"><ArrowLeft className="h-6 w-6" aria-hidden /></button>
          <div className="min-w-0 leading-tight">
            <p className="truncate text-lg font-semibold">{sel.family}</p>
            <p className="truncate text-sm text-muted">{sel.patient} {sel.age} ปี · {sel.pkg}</p>
          </div>
        </header>
        <main className="space-y-5 px-5 py-5">
          <section className={`rounded-2xl p-4 ${sel.level === "red" ? "bg-bad-soft" : sel.level === "yellow" ? "bg-warn-soft" : "bg-ok-soft"}`}>
            <LevelBadge level={sel.level} className="!bg-white/70" />
            <p className="mt-2 text-lg font-medium leading-snug">{sel.note}</p>
            <p className="mt-1 flex items-center gap-3 text-sm text-ink/70">
              <span className="flex items-center gap-1"><Clock className="h-4 w-4" aria-hidden />{sel.updated}</span>
              <span className="flex items-center gap-1"><MapPin className="h-4 w-4" aria-hidden />{sel.district}</span>
            </p>
          </section>

          <div className="grid grid-cols-2 gap-2">
            <MockBtn variant="primary" note="เดโม: จะโทรหาผู้ดูแลหลักของครอบครัวนี้">
              <Phone className="h-5 w-5" aria-hidden /> โทรครอบครัว
            </MockBtn>
            <MockBtn variant="soft" note="เดโม: จะเปิดแชตในกลุ่ม LINE ของครอบครัว">
              <MessageSquare className="h-5 w-5" aria-hidden /> แชต
            </MockBtn>
            <MockBtn variant="ghost" note="เดโม: จะนัดเยี่ยมบ้าน และคิดค่าบริการเพิ่มตามแพ็กเกจ">
              <House className="h-5 w-5" aria-hidden /> นัดเยี่ยมบ้าน
            </MockBtn>
            <MockBtn variant="ghost" note="เดโม: บันทึกการประเมิน 8Q และส่งต่อ รพ.สต. ใกล้บ้าน">
              <FileText className="h-5 w-5" aria-hidden /> ส่งต่อ รพ.สต.
            </MockBtn>
          </div>

          {sel.id === "live" && (
            <Btn
              variant="ghost"
              className="w-full"
              onClick={() => addEvent({ kind: "checkin", title: "พยาบาลโทรติดตามแล้ว", detail: "พว.สุดา คุยกับคุณเพ็ญ แนะนำแบ่งเวรกลางคืนและนัดโทรซ้ำพรุ่งนี้", level: "green", by: "nurse" })}
            >
              <CheckCheck className="h-5 w-5" aria-hidden /> บันทึกว่าติดตามแล้ว (ครอบครัวเห็นทันที)
            </Btn>
          )}

          <section>
            <h2 className="text-lg font-semibold">ไทม์ไลน์ล่าสุด</h2>
            <ol className="relative mt-3 space-y-4 pl-7">
              <span className="thread-line absolute bottom-2 left-[6px] top-2" aria-hidden />
              {sel.history.map((h, i) => (
                <li key={i} className="relative text-base">
                  <span className="absolute -left-7 top-2 h-3.5 w-3.5 rounded-full border-[3px] border-white bg-brand" aria-hidden />
                  {h}
                </li>
              ))}
            </ol>
          </section>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-dvh pb-28">
      {/* ---------- หัว + ค้นหา ---------- */}
      <header className="sticky top-0 z-30 border-b border-line bg-white/95 backdrop-blur">
        <div className="flex items-center gap-3 px-5 py-3">
          <LogoMark size={36} />
          <div className="min-w-0 flex-1 leading-tight">
            <p className="truncate text-lg font-semibold">คลินิกการพยาบาลบ้านกรุง</p>
            <p className="truncate text-sm text-muted">พว.สุดา · คลินิกพาร์ตเนอร์</p>
          </div>
          <button
            onClick={() => { setSearching(!searching); if (searching) setQ(""); setTab("cases"); }}
            aria-label={searching ? "ปิดการค้นหา" : "ค้นหาเคส"}
            aria-expanded={searching}
            className="flex h-12 w-12 items-center justify-center rounded-full bg-brand-soft text-brand"
          >
            {searching ? <X className="h-5 w-5" aria-hidden /> : <Search className="h-5 w-5" aria-hidden />}
          </button>
        </div>
        {searching && (
          <div className="px-5 pb-3">
            <label htmlFor="cq" className="sr-only">ค้นหาเคส</label>
            <div className="flex items-center gap-2 rounded-xl border border-line bg-sheet px-3 focus-within:border-brand">
              <Search className="h-5 w-5 shrink-0 text-muted" aria-hidden />
              <input id="cq" autoFocus value={q} onChange={(e) => setQ(e.target.value)} placeholder="ชื่อครอบครัว ผู้ป่วย อาการ หรืออำเภอ" className="min-h-12 w-full bg-transparent text-base outline-none" />
            </div>
          </div>
        )}
      </header>

      {tab === "cases" && (
        <main className="space-y-5 px-5 py-4">
          {/* สรุปตัวเลข: แตะเพื่อกรอง */}
          <div className="grid grid-cols-3 gap-2">
            {(["red", "yellow", "green"] as const).map((l) => (
              <button
                key={l}
                onClick={() => setFilter(filter === l ? "all" : l)}
                aria-pressed={filter === l}
                className={`rounded-2xl border-2 p-3 text-left transition-colors duration-150 ${filter === l ? "border-brand" : "border-transparent"} ${l === "red" ? "bg-bad-soft text-bad" : l === "yellow" ? "bg-warn-soft text-warn" : "bg-ok-soft text-ok"}`}
              >
                <span className="tnum block text-2xl font-semibold">{count[l]}</span>
                <span className="text-sm font-medium">{l === "red" ? "ด่วน" : l === "yellow" ? "ควรดู" : "ปกติ"}</span>
              </button>
            ))}
          </div>

          <HScroll label="ตัวกรองเคส">
            {([["all", "ทั้งหมด"], ["plan", `แผนรออนุมัติ${planWaiting ? " (1)" : ""}`], ["red", "ด่วน"], ["yellow", "ควรดู"], ["green", "ปกติ"]] as const).map(([k, l]) => (
              <button key={k} onClick={() => setFilter(k)} aria-pressed={filter === k} className={`min-h-10 shrink-0 rounded-full px-4 text-sm font-medium ${filter === k ? "bg-ink text-white" : "bg-sheet text-ink"}`}>
                {l}
              </button>
            ))}
          </HScroll>

          {planWaiting && filter !== "red" && filter !== "green" && (
            <section className="rounded-2xl border-2 border-brand/30 bg-brand-soft p-4">
              <h2 className="flex items-center gap-2 text-base font-semibold"><ClipboardCheck className="h-5 w-5 text-brand" aria-hidden /> แผนรออนุมัติ: {s.profile.patient}</h2>
              <p className="text-sm text-muted">AI ร่างจากใบจำหน่าย เลือกจากคลังที่รับรองแล้ว</p>
              <ol className="mt-2 list-decimal space-y-0.5 pl-5 text-sm">
                {PLAN_ITEMS.map((p) => <li key={p.title}>{p.title}</li>)}
              </ol>
              <div className="mt-3 grid grid-cols-2 gap-2">
                <Btn onClick={() => { update((st) => ({ ...st, planStatus: "approved" })); addEvent({ kind: "checkin", title: "พยาบาลอนุมัติแผนแล้ว", detail: `พว.สุดา อนุมัติแผนดูแล${s.profile.patient} ${PLAN_ITEMS.length} ข้อ`, level: "green", by: "nurse" }); }}>
                  <CheckCheck className="h-5 w-5" aria-hidden /> อนุมัติ
                </Btn>
                <MockBtn variant="ghost" note="เดโม: ส่งคำขอให้ครอบครัวแก้แผน พร้อมเหตุผล">ขอให้แก้</MockBtn>
              </div>
            </section>
          )}

          <section aria-label="รายการเคส">
            {shown.length === 0 ? (
              <p className="rounded-2xl bg-sheet p-5 text-base text-muted">ไม่พบเคสที่ตรงกับ “{needle || "ตัวกรองนี้"}”</p>
            ) : (
              <ul className="divide-y divide-line border-y border-line">
                {shown.map((c) => (
                  <li key={c.id}>
                    <button onClick={() => setOpen(c.id)} className="flex w-full items-start gap-3 py-4 text-left active:bg-sheet">
                      <span className={`mt-2 h-3 w-3 shrink-0 rounded-full ${DOT[c.level]}`} aria-hidden />
                      <span className="min-w-0 flex-1">
                        <span className="flex items-center justify-between gap-2">
                          <span className="truncate text-base font-semibold">{c.family}</span>
                          <span className="shrink-0 text-xs text-muted">{c.updated}</span>
                        </span>
                        <span className="block text-sm text-muted">{c.patient} {c.age} · {c.pkg} · {c.district}</span>
                        <span className="mt-1 line-clamp-2 block text-[15px]">{c.note}</span>
                      </span>
                      <ChevronRight className="mt-2 h-5 w-5 shrink-0 text-muted" aria-hidden />
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </section>
          <p className="text-sm text-muted">AI คัดให้ดูเฉพาะเหลือง/แดงก่อน พยาบาล 1 คนจึงดูแลได้ราว 40–60 ครอบครัว (ตัวเลขเป้าหมาย)</p>
        </main>
      )}

      {tab === "visits" && (
        <main className="space-y-4 px-5 py-4">
          <h1 className="text-xl font-semibold">ตารางเยี่ยมและโทรติดตาม</h1>
          <ul className="space-y-3">
            {VISITS.map((v) => (
              <li key={v.when + v.who} className="flex gap-3 rounded-2xl border border-line p-4">
                <span className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${v.type === "โทร" ? "bg-brand-soft text-brand" : "bg-thread-soft text-thread-deep"}`}>
                  {v.type === "โทร" ? <Phone className="h-5 w-5" aria-hidden /> : <House className="h-5 w-5" aria-hidden />}
                </span>
                <div>
                  <p className="tnum text-sm font-medium text-brand">{v.when}</p>
                  <p className="text-base font-semibold">{v.what}</p>
                  <p className="text-sm text-muted">{v.who}</p>
                </div>
              </li>
            ))}
          </ul>
          <MockBtn variant="soft" className="w-full" note="เดโม: เพิ่มนัดเยี่ยมบ้านหรือโทรติดตาม">เพิ่มนัด</MockBtn>
          <p className="text-sm text-muted">Care+ รวมโทรติดตาม 2 ครั้ง/เดือน เยี่ยมบ้านคิดค่าบริการเพิ่ม</p>
        </main>
      )}

      {tab === "library" && (
        <main className="space-y-4 px-5 py-4">
          <h1 className="text-xl font-semibold">คลังเนื้อหาที่รับรอง</h1>
          <p className="text-base text-muted">AI เลือกทำแผนได้จากคลังนี้เท่านั้น ทุกหัวข้อมีผู้ตรวจและวันทบทวน</p>
          <ul className="divide-y divide-line border-y border-line">
            {LIBRARY.map((l) => (
              <li key={l.t} className="flex items-center gap-3 py-4">
                <ShieldCheck className={`h-6 w-6 shrink-0 ${l.ok ? "text-ok" : "text-warn"}`} aria-hidden />
                <div className="flex-1">
                  <p className="text-base font-semibold">{l.t}</p>
                  <p className="text-sm text-muted">{l.by} · ทบทวน {l.at}</p>
                </div>
                {!l.ok && <span className="rounded-lg bg-warn-soft px-2 py-1 text-xs font-semibold text-warn">รอตรวจ</span>}
              </li>
            ))}
          </ul>
        </main>
      )}

      {tab === "money" && (
        <main className="space-y-4 px-5 py-4">
          <h1 className="text-xl font-semibold">รายได้คลินิกเดือนนี้</h1>
          <section className="rounded-2xl bg-brand p-5 text-white">
            <p className="text-sm text-white/75">ส่วนแบ่ง Care+ (ตัวเลขสมมติฐาน)</p>
            <p className="tnum mt-1 text-4xl font-semibold">6,300 <span className="text-base font-normal text-white/75">บาท</span></p>
            <p className="mt-1 text-sm text-white/75">18 ครอบครัว × 350 บาท</p>
          </section>
          <ul className="divide-y divide-line border-y border-line text-base">
            <li className="flex justify-between py-3"><span>เยี่ยมบ้าน 4 ครั้ง</span><span className="tnum font-semibold">2,000</span></li>
            <li className="flex justify-between py-3"><span>โปรแกรม 30 วัน 2 ครอบครัว</span><span className="tnum font-semibold">1,200</span></li>
            <li className="flex justify-between py-3 font-semibold"><span>รวม</span><span className="tnum">9,500</span></li>
          </ul>
          <p className="text-sm text-muted">คลินิกได้ลูกค้าดูแลที่บ้านต่อเนื่องโดยไม่ต้องทำการตลาด (รายงานส่วนที่ 7)</p>
        </main>
      )}

      {/* ---------- แถบล่างของคลินิก ---------- */}
      <nav aria-label="เมนูคลินิก" className="safe-bottom fixed inset-x-0 bottom-0 z-40 border-t border-line bg-white">
        <ul className="grid grid-cols-4">
          {([["cases", "เคส", Users], ["visits", "นัดหมาย", CalendarClock], ["library", "คลัง", BookOpenCheck], ["money", "รายได้", Wallet]] as const).map(([k, l, I]) => (
            <li key={k}>
              <button onClick={() => setTab(k)} aria-current={tab === k ? "page" : undefined} className={`relative flex min-h-16 w-full flex-col items-center justify-center gap-0.5 pt-2 text-[0.8rem] font-semibold ${tab === k ? "text-brand" : "text-muted"}`}>
                {tab === k && <span className="absolute inset-x-6 top-0 h-[3px] rounded-b-full bg-thread" aria-hidden />}
                <I className="h-6 w-6" aria-hidden />
                {l}
                {k === "cases" && count.red > 0 && <span className="tnum absolute right-[26%] top-1.5 rounded-full bg-bad px-1.5 text-[10px] text-white">{count.red}</span>}
              </button>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  );
}
