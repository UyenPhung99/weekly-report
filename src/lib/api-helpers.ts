import { Prisma } from "@prisma/client";
import { NextResponse } from "next/server";

/** Chuẩn hoá response lỗi — toàn bộ route handler dùng chung format này. */
export function apiError(status: number, message: string) {
  return NextResponse.json({ error: message }, { status });
}

export function apiOk<T>(data: T, status = 200) {
  return NextResponse.json({ data }, { status });
}

/**
 * Bọc thân route handler: bắt lỗi cú pháp JSON, lỗi ràng buộc khoá ngoại của
 * Prisma (P2003: xoá dữ liệu còn bị tham chiếu, P2025: không tìm thấy bản ghi)
 * và trả về response gọn thay vì để lộ stack trace.
 */
export async function withApiErrors(
  handler: () => Promise<NextResponse>,
): Promise<NextResponse> {
  try {
    return await handler();
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === "P2025") {
        return apiError(404, "Không tìm thấy dữ liệu.");
      }
      if (error.code === "P2003") {
        return apiError(
          409,
          "Không thể thực hiện vì còn dữ liệu khác đang tham chiếu tới bản ghi này.",
        );
      }
    }
    if (error instanceof SyntaxError) {
      return apiError(400, "Dữ liệu gửi lên không đúng định dạng JSON.");
    }

    // eslint-disable-next-line no-console
    console.error(error);
    return apiError(500, "Có lỗi xảy ra ở máy chủ.");
  }
}

export async function readJsonBody<T>(request: Request): Promise<T> {
  return (await request.json()) as T;
}

/** Kiểm tra một trường chuỗi bắt buộc, trả về chuỗi đã trim hoặc null nếu rỗng. */
export function requireString(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

/** Cho phép chuỗi rỗng (ví dụ mô tả/ghi chú) nhưng bắt buộc phải là string. */
export function optionalString(value: unknown): string | null {
  return typeof value === "string" ? value : null;
}

export function requireEnum<T extends string>(
  value: unknown,
  allowed: readonly T[],
): T | null {
  return typeof value === "string" && (allowed as readonly string[]).includes(value)
    ? (value as T)
    : null;
}

export function requireInt(value: unknown, min: number, max: number): number | null {
  if (typeof value !== "number" || !Number.isFinite(value)) return null;
  const rounded = Math.round(value);
  return rounded >= min && rounded <= max ? rounded : null;
}

/** "yyyy-MM-dd" — không parse thành Date để tránh lệch múi giờ, chỉ kiểm tra hình dạng. */
export function requireIsoDate(value: unknown): string | null {
  if (typeof value !== "string") return null;
  return /^\d{4}-\d{2}-\d{2}$/.test(value) ? value : null;
}

export function requireStringArray(value: unknown): string[] | null {
  if (!Array.isArray(value)) return null;
  if (!value.every((item) => typeof item === "string")) return null;
  return value.map((item) => item.trim()).filter(Boolean);
}
