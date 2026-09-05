"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { navItems } from "@/lib/navigation";
import { cn } from "@/lib/utils";

type SidebarNavProps = {
  /** Gọi khi chọn một mục — dùng để đóng menu trên mobile. */
  onNavigate?: () => void;
};

export function SidebarNav({ onNavigate }: SidebarNavProps) {
  const pathname = usePathname();

  return (
    <nav className="flex flex-col gap-1" aria-label="Điều hướng chính">
      {navItems.map((item) => {
        const isActive =
          pathname === item.href || pathname.startsWith(`${item.href}/`);
        const Icon = item.icon;

        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onNavigate}
            aria-current={isActive ? "page" : undefined}
            className={cn(
              "group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-sidebar",
              isActive
                ? "bg-sidebar-active text-sidebar-active-foreground"
                : "text-sidebar-muted hover:bg-sidebar-active/60 hover:text-sidebar-foreground",
            )}
          >
            <Icon
              className={cn(
                "h-[18px] w-[18px] shrink-0 transition-colors",
                isActive
                  ? "text-lavender-700"
                  : "text-sidebar-muted group-hover:text-lavender-700",
              )}
            />
            <span className="truncate">{item.label}</span>
            {isActive ? (
              <span className="ml-auto h-1.5 w-1.5 rounded-full bg-lavender-500" />
            ) : null}
          </Link>
        );
      })}
    </nav>
  );
}
