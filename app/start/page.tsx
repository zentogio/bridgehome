import Link from "next/link";
import { ArrowRight, BookOpen, Tag, Users, HeartHandshake, Stethoscope } from "lucide-react";
import { LogoMark, Wordmark } from "@/components/logo";
import { ImageSlot } from "@/components/image-slot";
import { Splash } from "@/components/splash";

const ROLES = [
  { href: "/care", title: "ฉันเป็นลูกหลาน", desc: "ดูแผน ตารางเวร และข่าวจากน้องใย", Icon: Users, primary: true },
  { href: "/parent", title: "ฉันเป็นพ่อแม่", desc: "ปุ่มใหญ่ 3 ปุ่ม คุยกับน้องใยด้วยเสียง", Icon: HeartHandshake },
  { href: "/clinic", title: "ฉันเป็นพยาบาลคลินิก", desc: "ดูเฉพาะเคสเหลือง/แดง อนุมัติแผน", Icon: Stethoscope },
];

const STEPS = [
  "มุมพ่อแม่ → กด “คุยกับน้องใย” ตอบคำถาม 2Q",
  "มุมลูกหลาน → เห็นแจ้งเตือนสีเหลืองทันที",
  "แผนดูแล → ถ่ายใบจำหน่าย → AI ร่างแผน → ส่งพยาบาล",
  "มุมพยาบาล → อนุมัติ → กลับมาดูที่แอปครอบครัว",
];

export default function Start() {
  return (
    <>
      <Splash />
      <main className="mx-auto max-w-2xl px-5 pb-14 pt-5">
        <header className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <LogoMark size={44} />
            <Wordmark />
          </div>
          <Link href="/guide" className="flex min-h-12 items-center gap-1.5 rounded-full px-3 text-base font-semibold text-brand">
            <BookOpen className="h-5 w-5" aria-hidden /> คู่มือ
          </Link>
        </header>

        <section className="mt-8">
          <h1 className="font-display text-[2rem] font-bold leading-[1.35] text-ink">
            ลูกอยู่ไกล
            <br />
            แต่รู้ทุกเช้าว่า<span className="text-brand">แม่สบายดีจริงไหม</span>
          </h1>
          <p className="mt-4 text-lg text-muted">
            ทีมดูแลพ่อแม่ในกลุ่ม LINE ครอบครัว มีแผนจากพยาบาล และน้องใยโทรคุยทุกเช้า
          </p>
        </section>

        <ImageSlot id="hero" label="hero · ลูกดูมือถือ / แม่คุยกับน้องใย" ratio="4 / 3" className="mt-6" alt="ครอบครัวไทยสองบ้านเชื่อมกันด้วยเส้นใย" />

        <section className="mt-8" aria-labelledby="role-h">
          <h2 id="role-h" className="text-lg font-bold">เลือกมุมมองของคุณ</h2>
          <ul className="mt-3 divide-y divide-line overflow-hidden rounded-2xl border border-line">
            {ROLES.map(({ href, title, desc, Icon, primary }) => (
              <li key={href}>
                <Link
                  href={href}
                  className={`flex min-h-24 items-center gap-4 px-5 py-4 transition-colors duration-150 active:bg-brand-soft ${
                    primary ? "bg-brand text-white" : "bg-white hover:bg-sheet"
                  }`}
                >
                  <Icon className={`h-8 w-8 shrink-0 ${primary ? "text-thread" : "text-brand"}`} aria-hidden />
                  <span className="flex-1">
                    <span className="block text-xl font-bold">{title}</span>
                    <span className={`block text-base ${primary ? "text-white/80" : "text-muted"}`}>{desc}</span>
                  </span>
                  <ArrowRight className="h-6 w-6 shrink-0" aria-hidden />
                </Link>
              </li>
            ))}
          </ul>
        </section>

        <Link
          href="/packages"
          className="mt-4 flex min-h-14 items-center justify-between rounded-2xl bg-thread-soft px-5 text-base font-semibold text-ink"
        >
          <span className="flex items-center gap-2"><Tag className="h-5 w-5 text-thread-deep" aria-hidden /> ดูแพ็กเกจ เริ่มฟรี</span>
          <ArrowRight className="h-5 w-5" aria-hidden />
        </Link>

        <Link href="/onboarding" className="mt-3 flex min-h-14 items-center justify-between rounded-2xl border border-line px-5 text-base font-medium">
          <span>ตั้งค่าครอบครัวใหม่ (เริ่มต้นใช้งาน)</span>
          <ArrowRight className="h-5 w-5" aria-hidden />
        </Link>

        <section className="mt-10" aria-labelledby="demo-h">
          <h2 id="demo-h" className="text-lg font-bold">เดโม 3 นาทีสำหรับกรรมการ</h2>
          <ol className="relative mt-4 space-y-5 pl-10">
            <span className="thread-line absolute bottom-3 left-[15px] top-3" aria-hidden />
            {STEPS.map((s, i) => (
              <li key={s} className="relative text-base">
                <span className="absolute -left-10 flex h-8 w-8 items-center justify-center rounded-full bg-brand text-sm font-bold text-white" aria-hidden>
                  {i + 1}
                </span>
                {s}
              </li>
            ))}
          </ol>
        </section>

        <p className="mt-10 text-sm text-muted">
          เปิดบนมือถือได้ทันที เพิ่มไว้หน้าจอโฮมได้ (ดูในคู่มือ) · ข้อมูลเดโมเก็บในเครื่องนี้เท่านั้น
        </p>
      </main>
    </>
  );
}
