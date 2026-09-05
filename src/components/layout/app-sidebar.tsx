import { Sparkles } from "lucide-react";

import { Brand } from "@/components/layout/brand";
import { SidebarNav } from "@/components/layout/sidebar-nav";

/** Sidebar cố định bên trái — chỉ hiển thị từ breakpoint lg trở lên. */
export function AppSidebar() {
  return (
    <aside className="fixed inset-y-0 left-0 z-40 hidden w-64 flex-col border-r border-sidebar-border bg-sidebar lg:flex print:hidden">
      <div className="flex h-16 items-center px-5">
        <Brand />
      </div>

      <div className="flex-1 overflow-y-auto px-3 py-4">
        <p className="px-3 pb-2 text-[11px] font-semibold uppercase tracking-wider text-sidebar-muted">
          Menu
        </p>
        <SidebarNav />
      </div>

      <div className="p-3">
        <div className="rounded-2xl bg-gradient-to-br from-lavender-100 to-blossom-100 p-4">
          <div className="flex items-center gap-2 text-sm font-semibold text-lavender-800">
            <Sparkles className="h-4 w-4" />
            Mẹo nhỏ
          </div>
          <p className="mt-1.5 text-xs leading-relaxed text-lavender-700">
            Tổng hợp công việc và cuộc họp mỗi thứ Sáu để báo cáo tuần luôn đầy
            đủ.
          </p>
        </div>
      </div>
    </aside>
  );
}
