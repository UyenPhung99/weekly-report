import type { Department } from "@/types";

/** Mock — thay bằng `GET /departments` khi có API thật. */
export const departments: Department[] = [
  { id: "dept-sales", name: "Kinh doanh" },
  { id: "dept-marketing", name: "Marketing" },
  { id: "dept-tech", name: "Kỹ thuật" },
  { id: "dept-hr", name: "Nhân sự" },
];
