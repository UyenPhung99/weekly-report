"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { Bell, LogOut, Settings, User } from "lucide-react";

import { MobileNav } from "@/components/layout/mobile-nav";
import {
  QuickSearch,
  QuickSearchMobile,
} from "@/components/layout/quick-search";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { getNavItemByPath } from "@/lib/navigation";

export function SiteHeader() {
  const pathname = usePathname();
  const current = getNavItemByPath(pathname);

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-border/70 bg-background/85 px-4 backdrop-blur supports-[backdrop-filter]:bg-background/70 sm:px-6 lg:px-8 print:hidden">
      <MobileNav />

      <h1 className="truncate text-base font-semibold tracking-tight sm:text-lg">
        {current?.title ?? "Weekly Report"}
      </h1>

      <div className="ml-auto flex items-center gap-2 sm:gap-3">
        {/* Tìm kiếm nhanh */}
        <QuickSearch />
        <QuickSearchMobile />

        <Button variant="ghost" size="icon" aria-label="Thông báo" asChild>
          <Link href="/reminders" className="relative">
            <Bell className="h-5 w-5" />
            <span className="absolute right-2.5 top-2.5 h-2 w-2 rounded-full bg-blossom-400 ring-2 ring-background" />
          </Link>
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              className="rounded-full ring-offset-background transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              aria-label="Tài khoản"
            >
              <Avatar className="h-9 w-9 border border-border">
                <AvatarFallback className="bg-lavender-200 text-lavender-800">
                  NA
                </AvatarFallback>
              </Avatar>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-semibold">Nguyễn An</p>
                <p className="text-xs text-muted-foreground">
                  an.nguyen@example.com
                </p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              <User className="h-4 w-4" />
              Hồ sơ cá nhân
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href="/settings">
                <Settings className="h-4 w-4" />
                Cài đặt
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-blossom-700 focus:text-blossom-700">
              <LogOut className="h-4 w-4" />
              Đăng xuất
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
