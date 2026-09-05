import {
  Bell,
  CalendarDays,
  FileText,
  LayoutDashboard,
  ListChecks,
  Settings,
  type LucideIcon,
} from "lucide-react";

export type NavItem = {
  /** Đường dẫn route */
  href: string;
  /** Nhãn hiển thị trên sidebar */
  label: string;
  /** Tiêu đề hiển thị trên header của trang */
  title: string;
  /** Mô tả ngắn dưới tiêu đề trang */
  description: string;
  icon: LucideIcon;
};

export const navItems: NavItem[] = [
  {
    href: "/dashboard",
    label: "Dashboard",
    title: "Dashboard",
    description: "Tổng quan hoạt động và tiến độ trong tuần.",
    icon: LayoutDashboard,
  },
  {
    href: "/meetings",
    label: "Cuộc họp",
    title: "Cuộc họp",
    description: "Lịch họp, biên bản và người tham dự.",
    icon: CalendarDays,
  },
  {
    href: "/tasks",
    label: "Công việc",
    title: "Công việc",
    description: "Danh sách công việc, trạng thái và người phụ trách.",
    icon: ListChecks,
  },
  {
    href: "/reminders",
    label: "Nhắc việc",
    title: "Nhắc việc",
    description: "Các mốc thời gian và lời nhắc quan trọng.",
    icon: Bell,
  },
  {
    href: "/reports",
    label: "Báo cáo tuần",
    title: "Báo cáo tuần",
    description: "Tổng hợp tự động cuộc họp và công việc theo tuần.",
    icon: FileText,
  },
  {
    href: "/settings",
    label: "Cài đặt",
    title: "Cài đặt",
    description: "Tuỳ chỉnh tài khoản, nhóm và thông báo.",
    icon: Settings,
  },
];

/** Tìm mục điều hướng khớp với pathname hiện tại. */
export function getNavItemByPath(pathname: string): NavItem | undefined {
  return navItems.find(
    (item) => pathname === item.href || pathname.startsWith(`${item.href}/`),
  );
}
