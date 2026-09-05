import type {
  Department,
  ID,
  Meeting,
  Person,
  Task,
  WeeklyReportData,
} from "@/types";

/** Lỗi trả về từ API — giữ nguyên message tiếng Việt và mã trạng thái HTTP. */
export class ApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

async function request<T>(url: string, init?: RequestInit): Promise<T> {
  const response = await fetch(url, {
    ...init,
    headers: { "Content-Type": "application/json", ...init?.headers },
  });

  const body = await response.json().catch(() => null);

  if (!response.ok) {
    const message =
      body && typeof body.error === "string"
        ? body.error
        : "Có lỗi xảy ra, vui lòng thử lại.";
    throw new ApiError(message, response.status);
  }

  return body.data as T;
}

const post = <T>(url: string, payload: unknown) =>
  request<T>(url, { method: "POST", body: JSON.stringify(payload) });

const patch = <T>(url: string, payload: unknown) =>
  request<T>(url, { method: "PATCH", body: JSON.stringify(payload) });

const del = <T>(url: string) => request<T>(url, { method: "DELETE" });

/**
 * Client gọi các API route đứng trước Postgres — đây là điểm duy nhất trong
 * app biết tới hình dạng của các endpoint REST; `lib/store.tsx` chỉ gọi các
 * hàm ở đây, không tự ráp URL.
 */
export const api = {
  bootstrap: () => request<WeeklyReportData>("/api/bootstrap"),

  createDepartment: (input: { name: string }) =>
    post<Department>("/api/departments", input),
  updateDepartment: (id: ID, input: { name: string }) =>
    patch<Department>(`/api/departments/${id}`, input),
  deleteDepartment: (id: ID) => del<{ id: ID }>(`/api/departments/${id}`),

  createPerson: (input: Omit<Person, "id">) =>
    post<Person>("/api/people", input),
  updatePerson: (id: ID, input: Omit<Person, "id">) =>
    patch<Person>(`/api/people/${id}`, input),
  deletePerson: (id: ID) => del<{ id: ID }>(`/api/people/${id}`),

  createMeeting: (input: Omit<Meeting, "id">) =>
    post<Meeting>("/api/meetings", input),
  updateMeeting: (id: ID, input: Omit<Meeting, "id">) =>
    patch<Meeting>(`/api/meetings/${id}`, input),
  deleteMeeting: (id: ID) => del<{ id: ID }>(`/api/meetings/${id}`),

  createTask: (input: Omit<Task, "id">) => post<Task>("/api/tasks", input),
  updateTask: (id: ID, input: Partial<Omit<Task, "id">>) =>
    patch<Task>(`/api/tasks/${id}`, input),
  deleteTask: (id: ID) => del<{ id: ID }>(`/api/tasks/${id}`),
};

/** Rút message tiếng Việt từ ApiError, hoặc thông báo chung cho lỗi khác (mất mạng...). */
export function apiErrorMessage(error: unknown): string {
  if (error instanceof ApiError) return error.message;
  return "Không kết nối được tới máy chủ. Vui lòng kiểm tra mạng và thử lại.";
}
