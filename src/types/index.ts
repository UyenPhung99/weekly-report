/* -------------------------------------------------------------------------- */
/*  Data model                                                                 */
/*  Ngày tháng dùng chuỗi ISO dạng "yyyy-MM-dd" để dễ thay bằng API/DB thật.    */
/* -------------------------------------------------------------------------- */

export type ID = string;

/** Chuỗi ngày dạng "yyyy-MM-dd". */
export type ISODate = string;

export type PersonRole = "Trưởng bộ phận" | "Nhân viên";

export const PERSON_ROLES: PersonRole[] = ["Trưởng bộ phận", "Nhân viên"];

export type TaskPriority = "Cao" | "Trung bình" | "Thấp";

export const TASK_PRIORITIES: TaskPriority[] = ["Cao", "Trung bình", "Thấp"];

export type TaskStatus =
  | "Chưa bắt đầu"
  | "Đang làm"
  | "Hoàn thành"
  | "Trễ hạn";

export const TASK_STATUSES: TaskStatus[] = [
  "Chưa bắt đầu",
  "Đang làm",
  "Hoàn thành",
  "Trễ hạn",
];

export interface Department {
  id: ID;
  name: string;
}

export interface Person {
  id: ID;
  name: string;
  /** Chữ cái viết tắt hiển thị trong avatar, ví dụ "NA". */
  avatarInitials: string;
  departmentId: ID;
  role: PersonRole;
}

export interface Meeting {
  id: ID;
  departmentId: ID;
  date: ISODate;
  /** Người chủ trì — thường là trưởng bộ phận. */
  hostId: ID;
  agenda: string;
  notes: string;
  decisions: string[];
}

export interface Task {
  id: ID;
  /** Cuộc họp phát sinh ra công việc này (nếu có). */
  meetingId?: ID;
  title: string;
  description: string;
  assigneeId: ID;
  departmentId: ID;
  dueDate: ISODate;
  priority: TaskPriority;
  status: TaskStatus;
  /** Tiến độ 0–100. */
  progress: number;
}

/** Toàn bộ dữ liệu của ứng dụng — sau này thay bằng dữ liệu từ API. */
export interface WeeklyReportData {
  departments: Department[];
  people: Person[];
  meetings: Meeting[];
  tasks: Task[];
}
