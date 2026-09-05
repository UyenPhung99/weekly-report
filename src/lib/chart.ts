import type { TaskStatus } from "@/types";

/**
 * Màu dùng cho recharts. Tất cả đều trỏ về CSS variable khai báo trong
 * `globals.css`, nên biểu đồ tự đổi màu theo chủ đề sáng/tối và không có
 * mã màu nào bị hard-code trong component.
 */
export const chartColors = {
  notStarted: "hsl(var(--chart-not-started))",
  inProgress: "hsl(var(--chart-in-progress))",
  done: "hsl(var(--chart-done))",
  overdue: "hsl(var(--chart-overdue))",
  accent: "hsl(var(--chart-accent))",
  grid: "hsl(var(--chart-grid))",
  axis: "hsl(var(--muted-foreground))",
} as const;

/** Màu tương ứng với từng trạng thái công việc. */
export const statusChartColor: Record<TaskStatus, string> = {
  "Chưa bắt đầu": chartColors.notStarted,
  "Đang làm": chartColors.inProgress,
  "Hoàn thành": chartColors.done,
  "Trễ hạn": chartColors.overdue,
};

/** Lớp nền tương ứng, dùng cho chú giải (legend) ngoài SVG. */
export const statusSwatchClass: Record<TaskStatus, string> = {
  "Chưa bắt đầu": "bg-chart-not-started",
  "Đang làm": "bg-chart-in-progress",
  "Hoàn thành": "bg-chart-done",
  "Trễ hạn": "bg-chart-overdue",
};
