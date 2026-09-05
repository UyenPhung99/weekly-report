import Link from "next/link";
import { CalendarCheck2 } from "lucide-react";

import { cn } from "@/lib/utils";

/** Logo + tên ứng dụng, dùng chung cho sidebar desktop và menu mobile. */
export function Brand({ className }: { className?: string }) {
  return (
    <Link
      href="/dashboard"
      className={cn(
        "group flex items-center gap-3 rounded-2xl px-1 py-1 transition-opacity hover:opacity-90",
        className,
      )}
    >
      <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-soft">
        <CalendarCheck2 className="h-5 w-5" />
      </span>
      <span className="flex flex-col leading-tight">
        <span className="text-[15px] font-semibold tracking-tight text-foreground">
          Weekly Report
        </span>
        <span className="text-xs text-muted-foreground">Báo cáo tuần</span>
      </span>
    </Link>
  );
}
