"use client";

import { useEffect, useState } from "react";
import { ImageIcon } from "lucide-react";

/**
 * ที่ว่างสำหรับรูป: ใส่ไฟล์ที่ /public/images/<id>.jpg แล้วรูปจะขึ้นแทนอัตโนมัติ
 * (รายการรูปทั้งหมด + prompt อยู่ในไฟล์ IMAGE_PROMPTS.md)
 */
export function ImageSlot({
  id,
  label,
  ratio = "4 / 3",
  className = "",
  round = false,
  alt = "",
}: {
  id: string;
  label: string;
  ratio?: string;
  className?: string;
  round?: boolean;
  alt?: string;
}) {
  const [ok, setOk] = useState(false);
  const src = `/images/${id}.jpg`;
  useEffect(() => {
    const i = new Image();
    i.onload = () => setOk(true);
    i.src = src;
  }, [src]);

  const shape = round ? "rounded-full" : "rounded-2xl";
  if (ok) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={src} alt={alt} style={{ aspectRatio: ratio }} className={`w-full object-cover ${shape} ${className}`} />;
  }
  return (
    <div
      role="img"
      aria-label={`ที่ว่างรูป: ${label}`}
      style={{ aspectRatio: ratio }}
      className={`flex w-full flex-col items-center justify-center gap-1 border border-dashed border-line bg-sheet text-center text-muted ${shape} ${className}`}
    >
      <ImageIcon className="h-6 w-6" aria-hidden />
      {!round && <span className="px-3 text-sm">ที่ว่างรูป · {label}</span>}
    </div>
  );
}
