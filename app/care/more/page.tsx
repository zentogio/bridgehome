"use client";

import Link from "next/link";
import { BookOpen, Tag, Stethoscope, ShieldCheck, RotateCcw, ChevronRight, Languages, Link2, UserPlus } from "lucide-react";
import { Card, MockBtn, PageHeader } from "@/components/ui";
import { resetDemo, update, useDemo } from "@/lib/store";
import { useToast } from "@/components/toast";
import { PACKAGES } from "@/lib/data";

export default function More() {
  const s = useDemo();
  const toast = useToast();
  const pkg = PACKAGES.find((p) => p.id === s.pkg)!;

  const rows = [
    { href: "/onboarding", Icon: UserPlus, t: "ตั้งค่าครอบครัว", d: "ชื่อ ระดับการดูแล เวลาน้องใยโทร" },
    { href: "/packages", Icon: Tag, t: "แพ็กเกจและราคา", d: `ตอนนี้ใช้: ${pkg.name}` },
    { href: "/guide", Icon: BookOpen, t: "คู่มือการใช้งาน", d: "ทุกฟีเจอร์ ทุกมุมมอง" },
    { href: "/clinic", Icon: Stethoscope, t: "มุมพยาบาลคลินิก", d: "ดูเคสเหลือง/แดง อนุมัติแผน" },
    { href: "/parent", Icon: Languages, t: "เปิดมุมพ่อแม่", d: "ปุ่มใหญ่ ตัวใหญ่" },
  ];

  return (
    <>
      <PageHeader title="เพิ่มเติม" />
      <main className="mx-auto max-w-2xl space-y-5 px-4 py-5">
        <ul className="space-y-3">
          {rows.map(({ href, Icon, t, d }) => (
            <li key={href}>
              <Link href={href} className="flex min-h-20 items-center gap-4 rounded-2xl border border-line bg-white p-4">
                <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-soft text-brand">
                  <Icon className="h-6 w-6" aria-hidden />
                </span>
                <span className="flex-1">
                  <span className="block text-lg font-bold">{t}</span>
                  <span className="block text-base text-muted">{d}</span>
                </span>
                <ChevronRight className="h-6 w-6 text-muted" aria-hidden />
              </Link>
            </li>
          ))}
        </ul>

        <Card>
          <h2 className="flex items-center gap-2 text-lg font-bold">
            <ShieldCheck className="h-6 w-6 text-brand" aria-hidden /> ความเป็นส่วนตัว (PDPA)
          </h2>
          <label className="mt-3 flex min-h-12 items-center justify-between gap-3 text-base">
            <span>แชร์สรุปการคุยของคุณยายให้ทีมดูแล</span>
            <input
              type="checkbox"
              checked={s.consentShare}
              onChange={(e) => update((st) => ({ ...st, consentShare: e.target.checked }))}
              className="h-7 w-7 accent-brand"
            />
          </label>
          <p className="mt-1 text-sm text-muted">ผู้สูงอายุเป็นผู้ให้ความยินยอมและเลือกได้ว่าเรื่องไหนไม่บอกลูก</p>
        </Card>

        <Card>
          <h2 className="flex items-center gap-2 text-lg font-bold"><Link2 className="h-6 w-6 text-brand" aria-hidden /> เชื่อมต่อ</h2>
          <div className="mt-3 grid gap-3">
            <MockBtn variant="ghost" note="เดโม: จะเชื่อมกับกลุ่ม LINE ครอบครัวผ่าน LINE Official Account">เชื่อมกลุ่ม LINE ครอบครัว</MockBtn>
            <MockBtn variant="ghost" note="เดโม: จะเชื่อมคลินิกการพยาบาลพาร์ตเนอร์จริง">เลือกคลินิกพยาบาลประจำ</MockBtn>
            <MockBtn variant="ghost" note="เดโม: จะลิงก์กับเบอร์โทร/แอปของคุณยาย">ผูกอุปกรณ์ของคุณยาย</MockBtn>
          </div>
        </Card>

        <button
          onClick={() => {
            resetDemo();
            toast("รีเซ็ตเดโมแล้ว ข้อมูลกลับเป็นค่าเริ่มต้น");
          }}
          className="flex min-h-14 w-full items-center justify-center gap-2 rounded-2xl border border-line bg-white text-base font-semibold text-muted"
        >
          <RotateCcw className="h-5 w-5" aria-hidden /> รีเซ็ตเดโม
        </button>
      </main>
    </>
  );
}
