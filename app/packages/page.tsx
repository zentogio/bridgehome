"use client";

import { useState } from "react";
import { Check, Minus, QrCode, X } from "lucide-react";
import { Btn, MockBtn, PageHeader } from "@/components/ui";
import { update, useDemo, type PkgId } from "@/lib/store";
import { PACKAGES, type Pkg } from "@/lib/data";
import { useToast } from "@/components/toast";

function Features({ p, dark = false }: { p: Pkg; dark?: boolean }) {
  return (
    <ul className="mt-4 space-y-2.5">
      {p.features.map((f) => (
        <li key={f.text} className={`flex gap-2.5 text-base ${f.on ? "" : dark ? "text-white/50" : "text-muted"}`}>
          {f.on ? (
            <Check className={`mt-1 h-5 w-5 shrink-0 ${dark ? "text-thread" : "text-ok"}`} aria-label="มี" />
          ) : (
            <Minus className="mt-1 h-5 w-5 shrink-0" aria-label="ไม่มี" />
          )}
          {f.text}
        </li>
      ))}
    </ul>
  );
}

export default function Packages() {
  const s = useDemo();
  const toast = useToast();
  const [pick, setPick] = useState<PkgId | null>(null);
  const picked = PACKAGES.find((p) => p.id === pick);
  const [free, family, care] = [PACKAGES[0], PACKAGES[1], PACKAGES[2]];

  const confirm = () => {
    if (!pick) return;
    update((st) => ({ ...st, pkg: pick }));
    setPick(null);
    toast("เปลี่ยนแพ็กเกจเป็นเดโมแล้ว (ยังไม่ตัดเงินจริง)");
  };

  return (
    <>
      <PageHeader title="แพ็กเกจและราคา" sub="ราคารวม VAT · ยกเลิกได้ทุกเมื่อ" back="/start" />
      <main className="mx-auto max-w-2xl space-y-5 px-5 py-5">
        <p className="text-base text-muted">
          จ้างคนดูแลตกเดือนละ ~15,000–25,000 บาท Bridge Home ไม่ขายแรงงาน ใช้ร่วมกับคนดูแลที่จ้างอยู่ได้
        </p>

        {/* Care+ : ตัวหลัก ใหญ่สุด */}
        <section className="rounded-3xl bg-brand p-6 text-white" aria-labelledby="p-care">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h2 id="p-care" className="font-display text-3xl font-bold">{care.name}</h2>
              <p className="text-base text-white/80">{care.tagline}</p>
            </div>
            <span className="rounded-lg bg-thread px-2.5 py-1 text-sm font-bold text-ink">{care.badge}</span>
          </div>
          <p className="mt-4 flex items-baseline gap-2">
            <span className="tnum text-5xl font-bold">{care.price}</span>
            <span className="text-base text-white/80">{care.per}</span>
          </p>
          <p className="mt-1 text-sm text-white/80">เหมาะกับ: {care.who}</p>
          <Features p={care} dark />
          <button
            disabled={s.pkg === "care"}
            onClick={() => setPick("care")}
            className="mt-6 flex min-h-14 w-full items-center justify-center rounded-xl bg-thread text-lg font-bold text-ink transition-opacity duration-150 active:scale-[0.98] disabled:opacity-60"
          >
            {s.pkg === "care" ? "แพ็กเกจปัจจุบัน" : "เลือก Care+"}
          </button>
        </section>

        {/* Family : รอง */}
        <section className="rounded-2xl border-2 border-line p-5" aria-labelledby="p-family">
          <div className="flex items-baseline justify-between gap-3">
            <h2 id="p-family" className="text-2xl font-bold">{family.name}</h2>
            <p className="flex items-baseline gap-1.5">
              <span className="tnum text-3xl font-bold text-brand">{family.price}</span>
              <span className="text-sm text-muted">{family.per}</span>
            </p>
          </div>
          <p className="text-base text-muted">{family.tagline} · {family.who}</p>
          <Features p={family} />
          <Btn variant="ghost" className="mt-5 w-full" disabled={s.pkg === "family"} onClick={() => setPick("family")}>
            {s.pkg === "family" ? "แพ็กเกจปัจจุบัน" : "เลือก Family"}
          </Btn>
        </section>

        {/* Free : แถวเล็ก */}
        <section className="flex items-center justify-between gap-4 rounded-2xl bg-sheet p-5" aria-labelledby="p-free">
          <div>
            <h2 id="p-free" className="text-xl font-bold">{free.name} · 0 บาท</h2>
            <p className="text-base text-muted">ปุ่มสบายดี ตารางโทรหา และลองน้องใย 14 วัน</p>
          </div>
          <Btn variant="ghost" disabled={s.pkg === "free"} onClick={() => setPick("free")}>
            {s.pkg === "free" ? "ใช้อยู่" : "เลือก"}
          </Btn>
        </section>

        <section className="divide-y divide-line rounded-2xl border border-line">
          <div className="flex items-center justify-between gap-3 p-5">
            <div>
              <h2 className="text-lg font-bold">โปรแกรม 30 วันช่วงวิกฤต</h2>
              <p className="text-sm text-muted">หลังจำหน่ายหรือหลังล้ม พยาบาลดูใกล้ชิด</p>
              <p className="tnum mt-1 text-xl font-bold text-brand">1,490 <span className="text-sm font-normal text-muted">บาท ครั้งเดียว</span></p>
            </div>
            <MockBtn variant="soft" note="เดโม: จะเปิดขั้นตอนซื้อโปรแกรม 30 วัน">สั่งซื้อ</MockBtn>
          </div>
          <div className="flex items-center justify-between gap-3 p-5">
            <div>
              <h2 className="text-lg font-bold">เวลาคุยเพิ่ม</h2>
              <p className="tnum text-sm text-muted">99 บาท / 100 นาที สำหรับพ่อแม่ที่อยากคุยนานขึ้น</p>
            </div>
            <MockBtn variant="soft" note="เดโม: จะเปิดซื้อเวลาคุยเพิ่ม">ซื้อ</MockBtn>
          </div>
        </section>

        <p className="text-sm text-muted">ราคาและตัวเลขเป็นสมมติฐานของทีม ต้องพิสูจน์ในการสัมภาษณ์และพิลอต การชำระเงินในหน้านี้เป็นหน้าจอจำลอง</p>
      </main>

      {picked && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-ink/60 sm:items-center sm:p-4" role="dialog" aria-modal="true" aria-labelledby="pay-t">
          <div className="slide-up max-h-[90dvh] w-full max-w-md overflow-y-auto rounded-t-3xl bg-white p-6 sm:rounded-3xl">
            <div className="flex items-start justify-between gap-2">
              <h2 id="pay-t" className="text-xl font-bold">ยืนยันเลือก {picked.name}</h2>
              <button onClick={() => setPick(null)} aria-label="ปิด" className="-mr-2 flex h-12 w-12 items-center justify-center rounded-full hover:bg-sheet">
                <X className="h-6 w-6" aria-hidden />
              </button>
            </div>
            <p className="text-base">{picked.price} {picked.per}</p>
            <div className="my-4 flex flex-col items-center gap-2 rounded-2xl border border-dashed border-line p-5 text-muted">
              <QrCode className="h-24 w-24" aria-hidden />
              <p className="text-sm">QR พร้อมเพย์ (จำลอง)</p>
            </div>
            <Btn className="w-full" onClick={confirm}>ยืนยัน (เดโม ไม่ตัดเงินจริง)</Btn>
            <Btn variant="ghost" className="mt-2 w-full" onClick={() => setPick(null)}>ยกเลิก</Btn>
          </div>
        </div>
      )}
    </>
  );
}
