import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { VoiceChat } from "@/components/voice-chat";

export const metadata = { title: "คุยกับน้องใย" };

export default function Talk() {
  return (
    <main className="mx-auto flex h-dvh max-w-xl flex-col overflow-hidden">
      <div className="flex items-center gap-2 border-b border-line px-3 py-2">
        <Link
          href="/parent"
          aria-label="กลับหน้าหลัก"
          className="flex h-11 w-11 items-center justify-center rounded-full hover:bg-sheet"
        >
          <ArrowLeft className="h-6 w-6" aria-hidden />
        </Link>
        <h1 className="text-xl font-semibold">คุยกับน้องใย</h1>
      </div>
      <VoiceChat />
    </main>
  );
}
