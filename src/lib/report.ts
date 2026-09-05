import {
  daysUntil,
  formatDate,
  formatDateWithWeekday,
  formatWeekRange,
  getWeekRange,
  isWithinWeek,
  toISODate,
} from "@/lib/date";
import { getEffectiveStatus, isOverdue } from "@/lib/task-utils";
import type {
  Department,
  ID,
  ISODate,
  Meeting,
  Person,
  Task,
  TaskStatus,
  WeeklyReportData,
} from "@/types";

export const ALL_DEPARTMENTS = "all";

/* -------------------------------------------------------------------------- */
/*  Kiểu dữ liệu của bản báo cáo                                               */
/* -------------------------------------------------------------------------- */

export type ReportTaskRow = {
  id: ID;
  title: string;
  assigneeName: string;
  departmentName: string;
  dueDate: ISODate;
  status: TaskStatus;
  progress: number;
  /** Số ngày trễ (chỉ có với việc đã quá hạn). */
  daysLate?: number;
};

export type ReportMeetingSummary = {
  id: ID;
  date: ISODate;
  dateLabel: string;
  departmentName: string;
  hostName: string;
  agenda: string;
  notes: string;
  decisions: string[];
  tasks: Array<{ title: string; status: TaskStatus }>;
};

export type ReportPersonRow = {
  personId: ID;
  name: string;
  departmentName: string;
  total: number;
  completed: number;
  inProgress: number;
  overdue: number;
  /** % công việc đã hoàn thành trên tổng số việc trong phạm vi báo cáo. */
  completionRate: number;
};

export type WeeklyReportSummary = {
  /** "Tuần 31/08 – 06/09/2026" */
  weekLabel: string;
  rangeStart: ISODate;
  rangeEnd: ISODate;
  /** "Toàn công ty" hoặc tên bộ phận. */
  scopeLabel: string;
  generatedAtLabel: string;

  meetingCount: number;
  decisionCount: number;
  meetings: ReportMeetingSummary[];

  taskTotals: {
    total: number;
    completed: number;
    inProgress: number;
    notStarted: number;
    overdue: number;
    /** % hoàn thành trên tổng số việc có hạn trong tuần. */
    completionRate: number;
  };

  /** Việc quá hạn có hạn chót rơi trong tuần báo cáo. */
  weekOverdue: ReportTaskRow[];
  /** Việc quá hạn tồn từ các tuần trước, vẫn chưa xong. */
  carriedOverOverdue: ReportTaskRow[];

  people: ReportPersonRow[];

  isEmpty: boolean;
};

/* -------------------------------------------------------------------------- */
/*  Tổng hợp                                                                   */
/* -------------------------------------------------------------------------- */

/**
 * Phạm vi "công việc trong tuần" được xác định theo **hạn chót** rơi trong tuần
 * báo cáo. Data model hiện không lưu thời điểm hoàn thành, nên đây là mốc duy
 * nhất có thể dùng; khi bổ sung `completedAt` vào Task thì thay điều kiện ở đây.
 */
export function buildWeeklyReport(
  data: WeeklyReportData,
  options: {
    weekReference: Date;
    departmentId: string;
    today: Date;
  },
): WeeklyReportSummary {
  const { weekReference, departmentId, today } = options;
  const { start, end } = getWeekRange(weekReference);

  const departmentOf = (id: ID) =>
    data.departments.find((department: Department) => department.id === id);
  const personOf = (id: ID) =>
    data.people.find((person: Person) => person.id === id);
  const departmentName = (id: ID) => departmentOf(id)?.name ?? "Không rõ";
  const personName = (id: ID) => personOf(id)?.name ?? "Chưa phân công";

  const inScope = (itemDepartmentId: ID) =>
    departmentId === ALL_DEPARTMENTS || itemDepartmentId === departmentId;

  /* ------------------------------ Cuộc họp ------------------------------- */

  const weekMeetings = data.meetings
    .filter(
      (meeting: Meeting) =>
        isWithinWeek(meeting.date, weekReference) &&
        inScope(meeting.departmentId),
    )
    .sort((a, b) => a.date.localeCompare(b.date));

  const meetings: ReportMeetingSummary[] = weekMeetings.map((meeting) => ({
    id: meeting.id,
    date: meeting.date,
    dateLabel: formatDateWithWeekday(meeting.date),
    departmentName: departmentName(meeting.departmentId),
    hostName: personName(meeting.hostId),
    agenda: meeting.agenda,
    notes: meeting.notes,
    decisions: meeting.decisions,
    tasks: data.tasks
      .filter((task: Task) => task.meetingId === meeting.id)
      .map((task) => ({
        title: task.title,
        status: getEffectiveStatus(task, today),
      })),
  }));

  /* ----------------------------- Công việc ------------------------------- */

  const scopedTasks = data.tasks.filter((task: Task) =>
    inScope(task.departmentId),
  );
  const weekTasks = scopedTasks.filter((task) =>
    isWithinWeek(task.dueDate, weekReference),
  );

  const countByStatus = (status: TaskStatus) =>
    weekTasks.filter((task) => getEffectiveStatus(task, today) === status)
      .length;

  const completed = countByStatus("Hoàn thành");
  const taskTotals = {
    total: weekTasks.length,
    completed,
    inProgress: countByStatus("Đang làm"),
    notStarted: countByStatus("Chưa bắt đầu"),
    overdue: countByStatus("Trễ hạn"),
    completionRate: weekTasks.length
      ? Math.round((completed / weekTasks.length) * 100)
      : 0,
  };

  const toRow = (task: Task): ReportTaskRow => {
    const status = getEffectiveStatus(task, today);
    const late =
      status === "Trễ hạn"
        ? Math.abs(daysUntil(task.dueDate, today))
        : undefined;

    return {
      id: task.id,
      title: task.title,
      assigneeName: personName(task.assigneeId),
      departmentName: departmentName(task.departmentId),
      dueDate: task.dueDate,
      status,
      progress: task.progress,
      daysLate: late,
    };
  };

  const weekOverdue = weekTasks
    .filter((task) => isOverdue(task, today))
    .sort((a, b) => a.dueDate.localeCompare(b.dueDate))
    .map(toRow);

  const carriedOverOverdue = scopedTasks
    .filter(
      (task) =>
        isOverdue(task, today) && !isWithinWeek(task.dueDate, weekReference),
    )
    .sort((a, b) => a.dueDate.localeCompare(b.dueDate))
    .map(toRow);

  /* ------------------------ Theo người phụ trách ------------------------- */

  const people: ReportPersonRow[] = data.people
    .filter((person) => inScope(person.departmentId))
    .map((person) => {
      const list = weekTasks.filter((task) => task.assigneeId === person.id);
      const done = list.filter(
        (task) => getEffectiveStatus(task, today) === "Hoàn thành",
      ).length;

      return {
        personId: person.id,
        name: person.name,
        departmentName: departmentName(person.departmentId),
        total: list.length,
        completed: done,
        inProgress: list.filter(
          (task) => getEffectiveStatus(task, today) === "Đang làm",
        ).length,
        overdue: list.filter((task) => isOverdue(task, today)).length,
        completionRate: list.length
          ? Math.round((done / list.length) * 100)
          : 0,
      };
    })
    .filter((row) => row.total > 0)
    .sort((a, b) => b.completionRate - a.completionRate || b.total - a.total);

  return {
    weekLabel: formatWeekRange(weekReference),
    rangeStart: toISODate(start),
    rangeEnd: toISODate(end),
    scopeLabel:
      departmentId === ALL_DEPARTMENTS
        ? "Toàn công ty"
        : departmentName(departmentId),
    generatedAtLabel: formatDate(toISODate(today)),

    meetingCount: meetings.length,
    decisionCount: meetings.reduce(
      (sum, meeting) => sum + meeting.decisions.length,
      0,
    ),
    meetings,

    taskTotals,
    weekOverdue,
    carriedOverOverdue,
    people,

    isEmpty:
      meetings.length === 0 &&
      weekTasks.length === 0 &&
      carriedOverOverdue.length === 0,
  };
}

/* -------------------------------------------------------------------------- */
/*  Xuất bản text (dán vào email / Zalo / Slack)                               */
/* -------------------------------------------------------------------------- */

/**
 * Bản text thuần, không dùng ký tự trang trí phức tạp để dán được vào mọi nơi.
 */
export function buildReportText(summary: WeeklyReportSummary): string {
  const lines: string[] = [];
  const divider = "──────────────────────────────";

  lines.push("BÁO CÁO TUẦN");
  lines.push(`${summary.weekLabel}`);
  lines.push(`Phạm vi: ${summary.scopeLabel}`);
  lines.push(`Ngày lập: ${summary.generatedAtLabel}`);
  lines.push("");

  lines.push(divider);
  lines.push("1. TỔNG QUAN");
  lines.push(divider);
  lines.push(`- Cuộc họp trong tuần: ${summary.meetingCount}`);
  lines.push(`- Quyết định đã chốt: ${summary.decisionCount}`);
  lines.push(
    `- Công việc có hạn trong tuần: ${summary.taskTotals.total} (hoàn thành ${summary.taskTotals.completed}, đang làm ${summary.taskTotals.inProgress}, chưa bắt đầu ${summary.taskTotals.notStarted}, trễ hạn ${summary.taskTotals.overdue})`,
  );
  lines.push(`- Tỷ lệ hoàn thành: ${summary.taskTotals.completionRate}%`);
  if (summary.carriedOverOverdue.length > 0) {
    lines.push(
      `- Việc trễ hạn tồn từ tuần trước: ${summary.carriedOverOverdue.length}`,
    );
  }
  lines.push("");

  lines.push(divider);
  lines.push("2. CUỘC HỌP");
  lines.push(divider);
  if (summary.meetings.length === 0) {
    lines.push("Không có cuộc họp nào trong tuần.");
  } else {
    summary.meetings.forEach((meeting, index) => {
      lines.push(
        `${index + 1}) ${meeting.dateLabel} - ${meeting.departmentName} (chủ trì: ${meeting.hostName})`,
      );
      lines.push(`   Nội dung: ${meeting.agenda}`);
      if (meeting.notes) {
        lines.push(`   Ghi chú: ${meeting.notes}`);
      }
      if (meeting.decisions.length > 0) {
        lines.push("   Quyết định:");
        meeting.decisions.forEach((decision) => {
          lines.push(`     - ${decision}`);
        });
      }
      if (meeting.tasks.length > 0) {
        lines.push("   Công việc phát sinh:");
        meeting.tasks.forEach((task) => {
          lines.push(`     - ${task.title} [${task.status}]`);
        });
      }
      lines.push("");
    });
  }

  lines.push(divider);
  lines.push("3. CÔNG VIỆC CẦN XỬ LÝ");
  lines.push(divider);
  if (summary.weekOverdue.length === 0 && summary.carriedOverOverdue.length === 0) {
    lines.push("Không có công việc nào đang trễ hạn.");
  } else {
    [...summary.weekOverdue, ...summary.carriedOverOverdue].forEach((task) => {
      lines.push(
        `- ${task.title} | ${task.assigneeName} (${task.departmentName}) | hạn ${formatDate(task.dueDate)} | trễ ${task.daysLate} ngày | tiến độ ${task.progress}%`,
      );
    });
  }
  lines.push("");

  lines.push(divider);
  lines.push("4. HIỆU SUẤT THEO NGƯỜI PHỤ TRÁCH");
  lines.push(divider);
  if (summary.people.length === 0) {
    lines.push("Không có công việc nào được giao trong tuần.");
  } else {
    summary.people.forEach((row) => {
      const overdueNote = row.overdue > 0 ? `, trễ ${row.overdue}` : "";
      lines.push(
        `- ${row.name} (${row.departmentName}): ${row.completed}/${row.total} hoàn thành = ${row.completionRate}%${overdueNote}`,
      );
    });
  }
  lines.push("");
  lines.push(divider);
  lines.push("Báo cáo được tổng hợp tự động từ Weekly Report.");

  return lines.join("\n");
}
