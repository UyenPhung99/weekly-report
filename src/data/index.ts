/**
 * Bộ dữ liệu mẫu — KHÔNG còn được app runtime dùng trực tiếp (store đã chuyển
 * sang đọc/ghi qua `/api/*` xuống Postgres, xem `src/lib/store.tsx`).
 *
 * Nơi duy nhất còn dùng các mảng này là `prisma/seed.ts`, để database có sẵn
 * dữ liệu khi mới deploy thay vì trống trơn. Giữ file này lại như một barrel
 * export gọn cho seed script.
 */
export { departments } from "./departments";
export { meetings } from "./meetings";
export { people } from "./people";
export { tasks } from "./tasks";
