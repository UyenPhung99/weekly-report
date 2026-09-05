import { daysUntil } from "@/lib/date";
import type { Task, TaskPriority, TaskStatus } from "@/types";

export type BadgeVariant =
  | "default"
  | "secondary"
  | "outline"
  | "success"
  | "warning"
  | "info"
  | "accent"
  | "danger"
  | "destructive";

/**
 * Trạng thái thực tế để hiển thị: công việc chưa hoàn thành mà quá hạn
 * sẽ tự động thành "Trễ hạn".
 */
export function getEffectiveStatus(task: Task, reference: Date): TaskStatus {
  if (task.status === "Hoàn thành") return "Hoàn thành";
  if (daysUntil(task.dueDate, reference) < 0) return "Trễ hạn";
  // Trạng thái "Trễ hạn" đã lưu nhưng hạn chót được dời sang tương lai.
  if (task.status === "Trễ hạn") {
    return task.progress > 0 ? "Đang làm" : "Chưa bắt đầu";
  }
  return task.status;
}

export function isOverdue(task: Task, reference: Date): boolean {
  return getEffectiveStatus(task, reference) === "Trễ hạn";
}

/** Sắp đến hạn: còn từ 0 đến `withinDays` ngày và chưa hoàn thành. */
export function isDueSoon(
  task: Task,
  reference: Date,
  withinDays = 3,
): boolean {
  if (task.status === "Hoàn thành") return false;
  const diff = daysUntil(task.dueDate, reference);
  return diff >= 0 && diff <= withinDays;
}

export function getStatusVariant(status: TaskStatus): BadgeVariant {
  switch (status) {
    case "Hoàn thành":
      return "success";
    case "Đang làm":
      return "info";
    case "Trễ hạn":
      return "danger";
    default:
      return "secondary";
  }
}

export function getPriorityVariant(priority: TaskPriority): BadgeVariant {
  switch (priority) {
    case "Cao":
      return "accent";
    case "Trung bình":
      return "info";
    default:
      return "secondary";
  }
}

/**
 * Điểm khẩn cấp — số càng lớn càng gấp. Dùng để sắp xếp trang Nhắc việc.
 * Trễ hạn luôn đứng trước, trễ càng lâu càng lên đầu; sau đó tới việc
 * sắp đến hạn, còn ít ngày hơn thì lên trước. Cùng mức thì ưu tiên cao lên trước.
 */
export function getUrgencyScore(task: Task, reference: Date): number {
  const diff = daysUntil(task.dueDate, reference);
  const priorityBonus =
    task.priority === "Cao" ? 0.5 : task.priority === "Trung bình" ? 0.25 : 0;
  const base = diff < 0 ? 1000 + Math.abs(diff) : 100 - diff;
  return base + priorityBonus;
}

/** Màu thanh tiến độ theo trạng thái. */
export function getProgressBarClass(status: TaskStatus): string {
  switch (status) {
    case "Hoàn thành":
      return "[&>div]:bg-mint-400";
    case "Trễ hạn":
      return "[&>div]:bg-coral-400";
    default:
      return "[&>div]:bg-primary";
  }
}
