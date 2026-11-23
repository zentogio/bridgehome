"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

/**
 * แถวชิปที่ยาวเกินจอ: เลื่อนซ้าย-ขวาได้ด้วยนิ้ว ลากเมาส์ ล้อเมาส์ หรือปุ่มลูกศร
 * ขอบจางบอกว่ายังมีต่อ ปุ่มลูกศรโผล่เฉพาะเมื่อเลื่อนต่อได้
 */
export function HScroll({
  children,
  className = "",
  dark = false,
  label,
}: {
  children: React.ReactNode;
  className?: string;
  dark?: boolean;
  label?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [edge, setEdge] = useState({ l: false, r: false });
  const drag = useRef<{ x: number; left: number; moved: boolean } | null>(null);

  const measure = useCallback(() => {
    const el = ref.current;
    if (!el) return;
    setEdge({ l: el.scrollLeft > 4, r: el.scrollLeft + el.clientWidth < el.scrollWidth - 4 });
  }, []);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const t = setTimeout(measure, 0);
    const onWheel = (e: WheelEvent) => {
      if (el.scrollWidth <= el.clientWidth || Math.abs(e.deltaX) > Math.abs(e.deltaY)) return;
      const max = el.scrollWidth - el.clientWidth;
      if ((e.deltaY < 0 && el.scrollLeft <= 0) || (e.deltaY > 0 && el.scrollLeft >= max)) return;
      e.preventDefault();
      el.scrollLeft += e.deltaY;
    };
    el.addEventListener("wheel", onWheel, { passive: false });
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => {
      clearTimeout(t);
      el.removeEventListener("wheel", onWheel);
      ro.disconnect();
    };
  }, [measure]);

  const nudge = (dir: 1 | -1) => ref.current?.scrollBy({ left: dir * ref.current.clientWidth * 0.7, behavior: "smooth" });

  const arrow = dark ? "bg-[#141a33] text-white" : "bg-white text-ink shadow-[0_2px_10px_-2px_rgba(0,0,0,.25)]";
  const fadeL = edge.l ? "transparent, #000 36px" : "#000, #000";
  const fadeR = edge.r ? "#000 calc(100% - 36px), transparent" : "#000, #000";

  return (
    <div className={`relative ${className}`}>
      <div
        ref={ref}
        role={label ? "group" : undefined}
        aria-label={label}
        onScroll={measure}
        onPointerDown={(e) => {
          if (e.pointerType !== "mouse" || !ref.current) return;
          drag.current = { x: e.clientX, left: ref.current.scrollLeft, moved: false };
        }}
        onPointerMove={(e) => {
          const d = drag.current;
          if (!d || !ref.current) return;
          const dx = e.clientX - d.x;
          if (Math.abs(dx) > 4) d.moved = true;
          ref.current.scrollLeft = d.left - dx;
        }}
        onPointerUp={() => {
          setTimeout(() => (drag.current = null), 0);
        }}
        onPointerLeave={() => (drag.current = null)}
        onClickCapture={(e) => {
          if (drag.current?.moved) {
            e.preventDefault();
            e.stopPropagation();
          }
        }}
        className="no-scrollbar flex gap-2 overflow-x-auto scroll-smooth"
        style={{ maskImage: `linear-gradient(to right, ${fadeL}), linear-gradient(to right, ${fadeR})`, maskComposite: "intersect", WebkitMaskComposite: "source-in" } as React.CSSProperties}
      >
        {children}
      </div>
      {edge.l && (
        <button type="button" onClick={() => nudge(-1)} aria-label="เลื่อนไปทางซ้าย" className={`absolute left-0 top-1/2 z-10 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full ${arrow}`}>
          <ChevronLeft className="h-5 w-5" aria-hidden />
        </button>
      )}
      {edge.r && (
        <button type="button" onClick={() => nudge(1)} aria-label="เลื่อนไปทางขวา" className={`absolute right-0 top-1/2 z-10 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full ${arrow}`}>
          <ChevronRight className="h-5 w-5" aria-hidden />
        </button>
      )}
    </div>
  );
}
