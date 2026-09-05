import type {
  Department as DbDepartment,
  Meeting as DbMeeting,
  Person as DbPerson,
  Task as DbTask,
} from "@prisma/client";

import type {
  Department,
  Meeting,
  Person,
  PersonRole,
  Task,
  TaskPriority,
  TaskStatus,
} from "@/types";

/* -------------------------------------------------------------------------- */
/*  Prisma row -> kiểu dùng trong app                                          */
/*  Các trường tự do (role/priority/status/decisions) được validate ở tầng API */
/*  trước khi ghi xuống DB, nên khi đọc ra chỉ cần ép kiểu.                    */
/* -------------------------------------------------------------------------- */

export function toDepartment(row: DbDepartment): Department {
  return { id: row.id, name: row.name };
}

export function toPerson(row: DbPerson): Person {
  return {
    id: row.id,
    name: row.name,
    avatarInitials: row.avatarInitials,
    departmentId: row.departmentId,
    role: row.role as PersonRole,
  };
}

export function toMeeting(row: DbMeeting): Meeting {
  return {
    id: row.id,
    departmentId: row.departmentId,
    date: row.date,
    hostId: row.hostId,
    agenda: row.agenda,
    notes: row.notes,
    decisions: parseDecisions(row.decisions),
  };
}

export function toTask(row: DbTask): Task {
  return {
    id: row.id,
    meetingId: row.meetingId ?? undefined,
    title: row.title,
    description: row.description,
    assigneeId: row.assigneeId,
    departmentId: row.departmentId,
    dueDate: row.dueDate,
    priority: row.priority as TaskPriority,
    status: row.status as TaskStatus,
    progress: row.progress,
  };
}

/** `Meeting.decisions` lưu dạng chuỗi JSON trong DB — xem ghi chú ở schema.prisma. */
export function parseDecisions(raw: string): string[] {
  try {
    const value = JSON.parse(raw);
    return Array.isArray(value) ? value.filter((v) => typeof v === "string") : [];
  } catch {
    return [];
  }
}

export function serializeDecisions(decisions: string[]): string {
  return JSON.stringify(decisions);
}
