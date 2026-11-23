"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, CalendarClock, HeartPulse, ClipboardList, Menu } from "lucide-react";

const ITEMS = [
  { href: "/care", label: "หน้าหลัก", Icon: Home },
  { href: "/care/schedule", label: "ตารางเวร", Icon: CalendarClock },
  { href: "/care/health", label: "น้องใย", Icon: HeartPulse },
  { href: "/care/plan", label: "แผนดูแล", Icon: ClipboardList },
  { href: "/care/more", label: "เพิ่มเติม", Icon: Menu },
];

export function BottomNav() {
  const path = usePathname();
  return (
    <nav aria-label="เมนูหลัก" className="safe-bottom fixed inset-x-0 bottom-0 z-40 border-t border-line bg-white">
      <ul className="mx-auto grid max-w-2xl grid-cols-5">
        {ITEMS.map(({ href, label, Icon }) => {
          const active = href === "/care" ? path === "/care" : path.startsWith(href);
          return (
            <li key={href}>
              <Link
                href={href}
                aria-current={active ? "page" : undefined}
                className={`relative flex min-h-16 flex-col items-center justify-center gap-0.5 px-1 pt-2 text-[0.8rem] font-semibold ${
                  active ? "text-brand" : "text-muted"
                }`}
              >
                {active && <span className="absolute inset-x-6 top-0 h-[3px] rounded-b-full bg-thread" aria-hidden />}
                <Icon className="h-6 w-6" strokeWidth={active ? 2.4 : 1.9} aria-hidden />
                {label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
