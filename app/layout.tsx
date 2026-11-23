import type { Metadata, Viewport } from "next";
import { Mitr } from "next/font/google";
import "./globals.css";
import { ToastProvider } from "@/components/toast";

// ฟอนต์เดียวทั้งแอป: Mitr (ตามที่ทีมเลือก) โหลดผ่าน next/font เทียบเท่าลิงก์ Google Fonts แต่เร็วกว่าและไม่ติดข้อจำกัดเครือข่าย
const ui = Mitr({
  variable: "--font-ui",
  subsets: ["thai", "latin"],
  weight: ["200", "300", "400", "500", "600", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Bridge Home × สายใย",
  description: "เปลี่ยนครอบครัวให้เป็นทีมดูแลพ่อแม่ ที่มีแผนจากพยาบาลและน้องใย AI คอยดูทุกวัน",
  applicationName: "Bridge Home",
  appleWebApp: { capable: true, title: "Bridge Home", statusBarStyle: "default" },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#2b3a8f",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="th" className={ui.variable} suppressHydrationWarning>
      <head>
        {/* อยู่ในกรอบมือถือเดโม → ซ่อนลิงก์สลับมุมมอง และเผื่อที่ให้แถบ home indicator */}
        <script dangerouslySetInnerHTML={{ __html: "if(self!==top)document.documentElement.classList.add('in-frame')" }} />
      </head>
      <body className="min-h-dvh">
        <ToastProvider>{children}</ToastProvider>
      </body>
    </html>
  );
}
