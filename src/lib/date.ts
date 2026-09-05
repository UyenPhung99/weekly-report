import {
  addDays,
  differenceInCalendarDays,
  endOfWeek,
  format,
  parseISO,
  startOfDay,
  startOfWeek,
} from "date-fns";
import { vi } from "date-fns/locale";

import type { ISODate } from "@/types";

/** Tuần bắt đầu từ thứ Hai. */
const WEEK_OPTIONS = { weekStartsOn: 1 } as const;

/** Chuyển Date -> "yyyy-MM-dd". */
export function toISODate(date: Date): ISODate {
  return format(date, "yyyy-MM-dd");
}

/** Chuyển "yyyy-MM-dd" -> Date (0h giờ địa phương). */
export function fromISODate(value: ISODate): Date {
  return startOfDay(parseISO(value));
}

/** Ngày hôm nay, đã cắt về 0h. */
export function today(): Date {
  return startOfDay(new Date());
}

/** Cộng/trừ số ngày và trả về chuỗi ISO. */
export function shiftISODate(base: Date, days: number): ISODate {
  return toISODate(addDays(base, days));
}

/** "12/09/2026" */
export function formatDate(value: ISODate): string {
  return format(fromISODate(value), "dd/MM/yyyy");
}

/** "Thứ Sáu, 12/09" */
export function formatDateWithWeekday(value: ISODate): string {
  const label = format(fromISODate(value), "EEEE, dd/MM", { locale: vi });
  return label.charAt(0).toUpperCase() + label.slice(1);
}

export function getWeekRange(reference: Date): { start: Date; end: Date } {
  return {
    start: startOfWeek(reference, WEEK_OPTIONS),
    end: endOfWeek(reference, WEEK_OPTIONS),
  };
}

/** "Tuần 08/09 – 14/09/2026" */
export function formatWeekRange(reference: Date): string {
  const { start, end } = getWeekRange(reference);
  return `Tuần ${format(start, "dd/MM")} – ${format(end, "dd/MM/yyyy")}`;
}

export function isWithinWeek(value: ISODate, reference: Date): boolean {
  const { start, end } = getWeekRange(reference);
  const date = fromISODate(value);
  return date >= startOfDay(start) && date <= endOfWeek(end, WEEK_OPTIONS);
}

/**
 * Số ngày còn lại tới hạn: > 0 là còn hạn, 0 là hôm nay, < 0 là đã trễ.
 */
export function daysUntil(value: ISODate, reference: Date): number {
  return differenceInCalendarDays(fromISODate(value), startOfDay(reference));
}

/** "Còn 3 ngày" / "Đến hạn hôm nay" / "Trễ 2 ngày" */
export function formatDueLabel(value: ISODate, reference: Date): string {
  const diff = daysUntil(value, reference);
  if (diff > 0) return `Còn ${diff} ngày`;
  if (diff === 0) return "Đến hạn hôm nay";
  return `Trễ ${Math.abs(diff)} ngày`;
}

export { addDays };
