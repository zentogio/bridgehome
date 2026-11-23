import Link from "next/link";
import { ChevronDown, ArrowLeft } from "lucide-react";
import { HScroll } from "@/components/hscroll";
import { GUIDE } from "@/lib/data";

export const metadata = { title: "คู่มือการใช้งาน" };

export default function Guide() {
  return (
    <>
      <header className="sticky top-0 z-30 border-b border-line bg-bg/95 backdrop-blur">
        <div className="mx-auto flex max-w-2xl items-center gap-2 px-4 py-3">
          <Link href="/start" aria-label="กลับหน้าแรก" className="-ml-2 flex h-12 w-12 items-center justify-center rounded-full hover:bg-brand-soft">
            <ArrowLeft className="h-6 w-6" aria-hidden />
          </Link>
          <h1 className="text-xl font-bold">คู่มือการใช้งาน</h1>
        </div>
      </header>
      <main className="mx-auto max-w-2xl px-5 py-5 pb-16">
        <p className="text-base text-muted">แตะหัวข้อเพื่อเปิดอ่าน อ่านรวดเดียวหรือเลือกเฉพาะที่ต้องการก็ได้</p>

        <HScroll className="mt-4" label="ไปยังหัวข้อ">
          {GUIDE.map((g) => (
            <a key={g.id} href={`#${g.id}`} className="shrink-0 rounded-full bg-brand-soft px-4 py-2 text-sm font-semibold text-brand-ink">
              {g.title.split(" (")[0].split(":")[0]}
            </a>
          ))}
        </HScroll>

        <div className="mt-4 divide-y divide-line border-y border-line">
          {GUIDE.map((g, i) => (
            <details key={g.id} id={g.id} open={i === 0} className="group scroll-mt-20">
              <summary className="flex min-h-16 cursor-pointer items-center justify-between gap-3 py-3 text-lg font-bold">
                <span>{g.title}</span>
                <ChevronDown className="h-6 w-6 shrink-0 text-brand transition-transform duration-200 group-open:rotate-180" aria-hidden />
              </summary>
              <ul className="space-y-2 pb-5 text-base">
                {g.body.map((b) => (
                  <li key={b} className="rounded-xl bg-sheet px-4 py-3">{b}</li>
                ))}
              </ul>
            </details>
          ))}
        </div>

        <div className="grid grid-cols-2 gap-3 pt-6">
          <Link href="/care" className="flex min-h-14 items-center justify-center rounded-xl bg-brand font-semibold text-white">ลองมุมลูกหลาน</Link>
          <Link href="/parent" className="flex min-h-14 items-center justify-center rounded-xl border border-line bg-white font-semibold">ลองมุมพ่อแม่</Link>
        </div>
      </main>
    </>
  );
}
