import type { WeeklyReportData } from "@/types";

import { departments } from "./departments";
import { meetings } from "./meetings";
import { people } from "./people";
import { tasks } from "./tasks";

export { departments, meetings, people, tasks };

/**
 * Dữ liệu khởi tạo cho store.
 * Khi có backend thật, thay hàm này bằng lời gọi API (ví dụ `fetch("/api/bootstrap")`).
 */
export function getInitialData(): WeeklyReportData {
  return { departments, people, meetings, tasks };
}
