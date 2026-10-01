"use client";

import * as React from "react";

const DRAFT_PREFIX = "weekly-report:draft:";

/**
 * Giữ bản nháp của một form trong `localStorage` (chỉ trên trình duyệt này)
 * trong lúc đang nhập, để lỡ tải lại trang / đóng tab / trình duyệt crash
 * trước khi bấm Lưu thì nội dung vẫn còn — mở lại đúng form đó sẽ thấy lại.
 *
 * Nháp CHỈ bị xoá khi form được lưu thành công, hoặc người dùng chủ động
 * đóng hộp thoại (nút Huỷ, phím Esc, bấm ra ngoài) trong khi app vẫn đang
 * chạy — những hành động đó coi như "tôi không cần bản nháp này nữa".
 *
 * Lưu ý: đây là nháp cục bộ trên MỘT trình duyệt, không đồng bộ giữa các
 * thiết bị — khác với dữ liệu đã lưu (đi qua Postgres, dùng chung mọi nơi).
 */
export function useFormDraft<T>(key: string | null, value: T): void {
  const timerRef = React.useRef<ReturnType<typeof setTimeout>>();
  const valueRef = React.useRef(value);
  valueRef.current = value;

  const flush = React.useCallback(() => {
    if (!key) return;
    try {
      localStorage.setItem(DRAFT_PREFIX + key, JSON.stringify(valueRef.current));
    } catch {
      // localStorage có thể bị chặn (duyệt web ẩn danh, bộ nhớ đầy…) — bỏ
      // qua, chỉ mất tính năng nháp, không ảnh hưởng phần còn lại của app.
    }
  }, [key]);

  React.useEffect(() => {
    if (!key) return;
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(flush, 400);
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key, value, flush]);

  // Ghi nốt bản nháp còn dang dở (debounce chưa kịp chạy) ngay trước khi
  // rời trang — đây chính là lúc "tải lại trang" làm mất dữ liệu trước đây.
  React.useEffect(() => {
    if (!key) return;
    window.addEventListener("pagehide", flush);
    return () => window.removeEventListener("pagehide", flush);
  }, [key, flush]);
}

export function readDraft<T>(key: string): T | null {
  try {
    const raw = localStorage.getItem(DRAFT_PREFIX + key);
    return raw ? (JSON.parse(raw) as T) : null;
  } catch {
    return null;
  }
}

export function clearDraft(key: string): void {
  try {
    localStorage.removeItem(DRAFT_PREFIX + key);
  } catch {
    // bỏ qua — xem ghi chú ở flush() phía trên.
  }
}
