import { BottomNav } from "@/components/bottom-nav";

export default function CareLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="pb-28">
      {children}
      <BottomNav />
    </div>
  );
}
