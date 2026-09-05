"use client";

import * as React from "react";

import { getInitialData } from "@/data";
import { today as startOfToday } from "@/lib/date";
import type {
  Department,
  ID,
  Meeting,
  Person,
  Task,
  WeeklyReportData,
} from "@/types";

export type MeetingInput = Omit<Meeting, "id">;
export type TaskInput = Omit<Task, "id">;
export type DepartmentInput = Omit<Department, "id">;
export type PersonInput = Omit<Person, "id">;

/** Kết quả của thao tác có thể bị từ chối (ví dụ xoá khi còn dữ liệu liên quan). */
export type MutationResult = { ok: boolean; reason?: string };

type StoreValue = WeeklyReportData & {
  /** Ngày hiện tại (0h) — dùng chung để tính trễ hạn / sắp đến hạn. */
  today: Date;

  createMeeting: (input: MeetingInput) => Meeting;
  updateMeeting: (id: ID, input: MeetingInput) => void;
  deleteMeeting: (id: ID) => void;

  createTask: (input: TaskInput) => Task;
  updateTask: (id: ID, input: Partial<TaskInput>) => void;
  deleteTask: (id: ID) => void;

  createDepartment: (input: DepartmentInput) => Department;
  updateDepartment: (id: ID, input: DepartmentInput) => void;
  deleteDepartment: (id: ID) => MutationResult;

  createPerson: (input: PersonInput) => Person;
  updatePerson: (id: ID, input: PersonInput) => void;
  deletePerson: (id: ID) => MutationResult;

  getDepartment: (id: ID) => Department | undefined;
  getDepartmentName: (id: ID) => string;
  getPerson: (id: ID) => Person | undefined;
  getPersonName: (id: ID) => string;
  getMeeting: (id?: ID) => Meeting | undefined;
  getPeopleByDepartment: (departmentId?: ID) => Person[];
  getTasksByMeeting: (meetingId: ID) => Task[];
};

const WeeklyReportContext = React.createContext<StoreValue | null>(null);

let idCounter = 0;
function nextId(prefix: string) {
  idCounter += 1;
  return `${prefix}-new-${idCounter}`;
}

/**
 * Nguồn dữ liệu duy nhất của ứng dụng.
 * Hiện đang chạy trên mock data trong bộ nhớ; khi có backend thật chỉ cần
 * thay phần khởi tạo và các hàm create/update/delete bằng lời gọi API.
 */
export function WeeklyReportProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [data, setData] = React.useState<WeeklyReportData>(() =>
    getInitialData(),
  );
  const [today] = React.useState<Date>(() => startOfToday());

  const value = React.useMemo<StoreValue>(() => {
    /* ------------------------------- Cuộc họp ------------------------------ */

    const createMeeting = (input: MeetingInput) => {
      const meeting: Meeting = { ...input, id: nextId("mt") };
      setData((prev) => ({ ...prev, meetings: [...prev.meetings, meeting] }));
      return meeting;
    };

    const updateMeeting = (id: ID, input: MeetingInput) => {
      setData((prev) => ({
        ...prev,
        meetings: prev.meetings.map((meeting) =>
          meeting.id === id ? { ...meeting, ...input, id } : meeting,
        ),
      }));
    };

    const deleteMeeting = (id: ID) => {
      setData((prev) => ({
        ...prev,
        meetings: prev.meetings.filter((meeting) => meeting.id !== id),
        // Công việc vẫn giữ lại, chỉ gỡ liên kết với cuộc họp đã xoá.
        tasks: prev.tasks.map((task) =>
          task.meetingId === id ? { ...task, meetingId: undefined } : task,
        ),
      }));
    };

    /* ------------------------------ Công việc ------------------------------ */

    const createTask = (input: TaskInput) => {
      const task: Task = { ...input, id: nextId("tk") };
      setData((prev) => ({ ...prev, tasks: [...prev.tasks, task] }));
      return task;
    };

    const updateTask = (id: ID, input: Partial<TaskInput>) => {
      setData((prev) => ({
        ...prev,
        tasks: prev.tasks.map((task) =>
          task.id === id ? { ...task, ...input, id } : task,
        ),
      }));
    };

    const deleteTask = (id: ID) => {
      setData((prev) => ({
        ...prev,
        tasks: prev.tasks.filter((task) => task.id !== id),
      }));
    };

    /* ------------------------------- Bộ phận ------------------------------- */

    const createDepartment = (input: DepartmentInput) => {
      const department: Department = { ...input, id: nextId("dept") };
      setData((prev) => ({
        ...prev,
        departments: [...prev.departments, department],
      }));
      return department;
    };

    const updateDepartment = (id: ID, input: DepartmentInput) => {
      setData((prev) => ({
        ...prev,
        departments: prev.departments.map((department) =>
          department.id === id ? { ...department, ...input, id } : department,
        ),
      }));
    };

    const deleteDepartment = (id: ID): MutationResult => {
      const peopleCount = data.people.filter(
        (person) => person.departmentId === id,
      ).length;
      const meetingCount = data.meetings.filter(
        (meeting) => meeting.departmentId === id,
      ).length;
      const taskCount = data.tasks.filter(
        (task) => task.departmentId === id,
      ).length;

      if (peopleCount || meetingCount || taskCount) {
        const parts = [
          peopleCount ? `${peopleCount} nhân sự` : null,
          meetingCount ? `${meetingCount} cuộc họp` : null,
          taskCount ? `${taskCount} công việc` : null,
        ].filter(Boolean);
        return {
          ok: false,
          reason: `Bộ phận này còn ${parts.join(", ")}. Hãy chuyển hoặc xoá dữ liệu liên quan trước.`,
        };
      }

      setData((prev) => ({
        ...prev,
        departments: prev.departments.filter(
          (department) => department.id !== id,
        ),
      }));
      return { ok: true };
    };

    /* -------------------------------- Nhân sự ------------------------------- */

    const createPerson = (input: PersonInput) => {
      const person: Person = { ...input, id: nextId("p") };
      setData((prev) => ({ ...prev, people: [...prev.people, person] }));
      return person;
    };

    const updatePerson = (id: ID, input: PersonInput) => {
      setData((prev) => ({
        ...prev,
        people: prev.people.map((person) =>
          person.id === id ? { ...person, ...input, id } : person,
        ),
      }));
    };

    const deletePerson = (id: ID): MutationResult => {
      const taskCount = data.tasks.filter(
        (task) => task.assigneeId === id,
      ).length;
      const meetingCount = data.meetings.filter(
        (meeting) => meeting.hostId === id,
      ).length;

      if (taskCount || meetingCount) {
        const parts = [
          taskCount ? `${taskCount} công việc đang phụ trách` : null,
          meetingCount ? `${meetingCount} cuộc họp đang chủ trì` : null,
        ].filter(Boolean);
        return {
          ok: false,
          reason: `Người này còn ${parts.join(" và ")}. Hãy chuyển giao trước khi xoá.`,
        };
      }

      setData((prev) => ({
        ...prev,
        people: prev.people.filter((person) => person.id !== id),
      }));
      return { ok: true };
    };

    /* ------------------------------- Truy vấn ------------------------------ */

    const getDepartment = (id: ID) =>
      data.departments.find((department) => department.id === id);

    const getPerson = (id: ID) => data.people.find((person) => person.id === id);

    return {
      ...data,
      today,
      createMeeting,
      updateMeeting,
      deleteMeeting,
      createTask,
      updateTask,
      deleteTask,
      createDepartment,
      updateDepartment,
      deleteDepartment,
      createPerson,
      updatePerson,
      deletePerson,
      getDepartment,
      getDepartmentName: (id) => getDepartment(id)?.name ?? "Không rõ",
      getPerson,
      getPersonName: (id) => getPerson(id)?.name ?? "Chưa phân công",
      getMeeting: (id) =>
        id ? data.meetings.find((meeting) => meeting.id === id) : undefined,
      getPeopleByDepartment: (departmentId) =>
        departmentId
          ? data.people.filter((person) => person.departmentId === departmentId)
          : data.people,
      getTasksByMeeting: (meetingId) =>
        data.tasks.filter((task) => task.meetingId === meetingId),
    };
  }, [data, today]);

  return (
    <WeeklyReportContext.Provider value={value}>
      {children}
    </WeeklyReportContext.Provider>
  );
}

export function useWeeklyReport(): StoreValue {
  const context = React.useContext(WeeklyReportContext);
  if (!context) {
    throw new Error(
      "useWeeklyReport phải được dùng bên trong <WeeklyReportProvider>.",
    );
  }
  return context;
}
