"use client";

import { useRouter } from "next/navigation";
import { VoiceChat } from "@/components/voice-chat";

/** หน้าจอหลังรับสายน้องใย: เริ่มคุยทันที ไม่ต้องกดอะไรเพิ่ม */
export default function CallPage() {
  const router = useRouter();
  return (
    <main className="flex h-dvh flex-col bg-[#121a40]">
      <VoiceChat call autoStart onHangup={() => router.push("/parent")} />
    </main>
  );
}
