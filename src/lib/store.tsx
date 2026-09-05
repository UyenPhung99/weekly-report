"use client";

import * as React from "react";
import { RotateCw, ServerCrash } from "lucide-react";

import { useToast } from "@/components/ui/toast";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { api, apiErrorMessage } from "@/lib/api-client";
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

  createMeeting: (input: MeetingInput) => void;
  updateMeeting: (id: ID, input: MeetingInput) => void;
  deleteMeeting: (id: ID) => void;

  createTask: (input: TaskInput) => void;
  updateTask: (id: ID, input: Partial<TaskInput>) => void;
  deleteTask: (id: ID) => void;

  createDepartment: (input: DepartmentInput) => void;
  updateDepartment: (id: ID, input: DepartmentInput) => void;
  deleteDepartment: (id: ID) => Promise<MutationResult>;

  createPerson: (input: PersonInput) => void;
  updatePerson: (id: ID, input: PersonInput) => void;
  deletePerson: (id: ID) => Promise<MutationResult>;

  getDepartment: (id: ID) => Department | undefined;
  getDepartmentName: (id: ID) => string;
  getPerson: (id: ID) => Person | undefined;
  getPersonName: (id: ID) => string;
  getMeeting: (id?: ID) => Meeting | undefined;
  getPeopleByDepartment: (departmentId?: ID) => Person[];
  getTasksByMeeting: (meetingId: ID) => Task[];
};

const WeeklyReportContext = React.createContext<StoreValue | null>(null);

const EMPTY_DATA: WeeklyReportData = {
  departments: [],
  people: [],
  meetings: [],
  tasks: [],
};

let tempIdCounter = 0;
/** ID tạm cho bản ghi mới trong lúc chờ máy chủ trả về ID thật. */
function tempId(prefix: string) {
  tempIdCounter += 1;
  return `${prefix}-pending-${tempIdCounter}`;
}

/**
 * Nguồn dữ liệu duy nhất của ứng dụng — đọc/ghi qua các API route đứng trước
 * Postgres (xem `src/lib/api-client.ts`). Mỗi thao tác cập nhật state cục bộ
 * ngay lập tức để giao diện phản hồi tức thì (optimistic update); nếu máy chủ
 * từ chối, store tự đồng bộ lại bằng cách tải lại toàn bộ dữ liệu và báo lỗi
 * qua toast.
 */
export function WeeklyReportProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const { toast } = useToast();
  const [data, setData] = React.useState<WeeklyReportData>(EMPTY_DATA);
  const [today] = React.useState<Date>(() => startOfToday());
  const [status, setStatus] = React.useState<"loading" | "ready" | "error">(
    "loading",
  );
  const [loadError, setLoadError] = React.useState<string | null>(null);

  const load = React.useCallback(async () => {
    setStatus((prev) => (prev === "ready" ? prev : "loading"));
    try {
      const fresh = await api.bootstrap();
      setData(fresh);
      setStatus("ready");
      setLoadError(null);
    } catch (error) {
      setStatus("error");
      setLoadError(apiErrorMessage(error));
    }
  }, []);

  React.useEffect(() => {
    void load();
  }, [load]);

  /** Đồng bộ lại toàn bộ dữ liệu sau một thao tác thất bại, không đổi màn hình loading. */
  const resync = React.useCallback(async () => {
    try {
      const fresh = await api.bootstrap();
      setData(fresh);
    } catch {
      // Giữ nguyên state cục bộ nếu không tải lại được — toast lỗi ở nơi gọi
      // đã cho người dùng biết thao tác chưa lưu thành công.
    }
  }, []);

  const value = React.useMemo<StoreValue>(() => {
    /* ------------------------------- Cuộc họp ------------------------------ */

    const createMeeting = (input: MeetingInput) => {
      const id = tempId("mt");
      setData((prev) => ({
        ...prev,
        meetings: [...prev.meetings, { ...input, id }],
      }));

      api
        .createMeeting(input)
        .then((created) => {
          setData((prev) => ({
            ...prev,
            meetings: prev.meetings.map((m) => (m.id === id ? created : m)),
          }));
        })
        .catch((error) => {
          toast({
            title: "Không tạo được cuộc họp",
            description: apiErrorMessage(error),
            variant: "danger",
          });
          void resync();
        });
    };

    const updateMeeting = (id: ID, input: MeetingInput) => {
      setData((prev) => ({
        ...prev,
        meetings: prev.meetings.map((m) =>
          m.id === id ? { ...m, ...input, id } : m,
        ),
      }));

      api
        .updateMeeting(id, input)
        .then((updated) => {
          setData((prev) => ({
            ...prev,
            meetings: prev.meetings.map((m) => (m.id === id ? updated : m)),
          }));
        })
        .catch((error) => {
          toast({
            title: "Không lưu được cuộc họp",
            description: apiErrorMessage(error),
            variant: "danger",
          });
          void resync();
        });
    };

    const deleteMeeting = (id: ID) => {
      setData((prev) => ({
        ...prev,
        meetings: prev.meetings.filter((m) => m.id !== id),
        // Công việc vẫn giữ lại, chỉ gỡ liên kết với cuộc họp đã xoá
        // (khớp với onDelete: SetNull ở schema.prisma).
        tasks: prev.tasks.map((t) =>
          t.meetingId === id ? { ...t, meetingId: undefined } : t,
        ),
      }));

      api.deleteMeeting(id).catch((error) => {
        toast({
          title: "Không xoá được cuộc họp",
          description: apiErrorMessage(error),
          variant: "danger",
        });
        void resync();
      });
    };

    /* ------------------------------ Công việc ------------------------------ */

    const createTask = (input: TaskInput) => {
      const id = tempId("tk");
      setData((prev) => ({ ...prev, tasks: [...prev.tasks, { ...input, id }] }));

      api
        .createTask(input)
        .then((created) => {
          setData((prev) => ({
            ...prev,
            tasks: prev.tasks.map((t) => (t.id === id ? created : t)),
          }));
        })
        .catch((error) => {
          toast({
            title: "Không tạo được công việc",
            description: apiErrorMessage(error),
            variant: "danger",
          });
          void resync();
        });
    };

    const updateTask = (id: ID, input: Partial<TaskInput>) => {
      setData((prev) => ({
        ...prev,
        tasks: prev.tasks.map((t) =>
          t.id === id ? { ...t, ...input, id } : t,
        ),
      }));

      api
        .updateTask(id, input)
        .then((updated) => {
          setData((prev) => ({
            ...prev,
            tasks: prev.tasks.map((t) => (t.id === id ? updated : t)),
          }));
        })
        .catch((error) => {
          toast({
            title: "Không lưu được công việc",
            description: apiErrorMessage(error),
            variant: "danger",
          });
          void resync();
        });
    };

    const deleteTask = (id: ID) => {
      setData((prev) => ({
        ...prev,
        tasks: prev.tasks.filter((t) => t.id !== id),
      }));

      api.deleteTask(id).catch((error) => {
        toast({
          title: "Không xoá được công việc",
          description: apiErrorMessage(error),
          variant: "danger",
        });
        void resync();
      });
    };

    /* ------------------------------- Bộ phận ------------------------------- */

    const createDepartment = (input: DepartmentInput) => {
      const id = tempId("dept");
      setData((prev) => ({
        ...prev,
        departments: [...prev.departments, { ...input, id }],
      }));

      api
        .createDepartment(input)
        .then((created) => {
          setData((prev) => ({
            ...prev,
            departments: prev.departments.map((d) =>
              d.id === id ? created : d,
            ),
          }));
        })
        .catch((error) => {
          toast({
            title: "Không tạo được bộ phận",
            description: apiErrorMessage(error),
            variant: "danger",
          });
          void resync();
        });
    };

    const updateDepartment = (id: ID, input: DepartmentInput) => {
      setData((prev) => ({
        ...prev,
        departments: prev.departments.map((d) =>
          d.id === id ? { ...d, ...input, id } : d,
        ),
      }));

      api
        .updateDepartment(id, input)
        .then((updated) => {
          setData((prev) => ({
            ...prev,
            departments: prev.departments.map((d) =>
              d.id === id ? updated : d,
            ),
          }));
        })
        .catch((error) => {
          toast({
            title: "Không lưu được bộ phận",
            description: apiErrorMessage(error),
            variant: "danger",
          });
          void resync();
        });
    };

    /**
     * Khác với các hàm create/update ở trên, xoá bộ phận cần máy chủ xác nhận
     * TRƯỚC khi cập nhật giao diện — vì máy chủ mới biết chắc bộ phận còn dữ
     * liệu liên quan hay không (đã kiểm tra ở client trước đó cũng chỉ là một
     * bản sao có thể lệch). Hàm trả `Promise<MutationResult>` để nơi gọi
     * (trang Cài đặt) tự quyết định thông báo.
     */
    const deleteDepartment = async (id: ID): Promise<MutationResult> => {
      try {
        await api.deleteDepartment(id);
        setData((prev) => ({
          ...prev,
          departments: prev.departments.filter((d) => d.id !== id),
        }));
        return { ok: true };
      } catch (error) {
        return { ok: false, reason: apiErrorMessage(error) };
      }
    };

    /* -------------------------------- Nhân sự ------------------------------- */

    const createPerson = (input: PersonInput) => {
      const id = tempId("p");
      setData((prev) => ({ ...prev, people: [...prev.people, { ...input, id }] }));

      api
        .createPerson(input)
        .then((created) => {
          setData((prev) => ({
            ...prev,
            people: prev.people.map((p) => (p.id === id ? created : p)),
          }));
        })
        .catch((error) => {
          toast({
            title: "Không tạo được nhân sự",
            description: apiErrorMessage(error),
            variant: "danger",
          });
          void resync();
        });
    };

    const updatePerson = (id: ID, input: PersonInput) => {
      setData((prev) => ({
        ...prev,
        people: prev.people.map((p) =>
          p.id === id ? { ...p, ...input, id } : p,
        ),
      }));

      api
        .updatePerson(id, input)
        .then((updated) => {
          setData((prev) => ({
            ...prev,
            people: prev.people.map((p) => (p.id === id ? updated : p)),
          }));
        })
        .catch((error) => {
          toast({
            title: "Không lưu được nhân sự",
            description: apiErrorMessage(error),
            variant: "danger",
          });
          void resync();
        });
    };

    const deletePerson = async (id: ID): Promise<MutationResult> => {
      try {
        await api.deletePerson(id);
        setData((prev) => ({
          ...prev,
          people: prev.people.filter((p) => p.id !== id),
        }));
        return { ok: true };
      } catch (error) {
        return { ok: false, reason: apiErrorMessage(error) };
      }
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data, today, toast]);

  if (status === "loading") {
    return <FullPageLoading />;
  }

  if (status === "error") {
    return <FullPageError message={loadError} onRetry={load} />;
  }

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

/** Hiện trong lúc tải dữ liệu ban đầu từ database — chỉ xảy ra một lần khi vào app. */
function FullPageLoading() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-6">
      <div className="w-full max-w-sm space-y-4">
        <div className="flex items-center gap-3">
          <Skeleton className="h-10 w-10 shrink-0 rounded-2xl" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-3.5 w-32" />
            <Skeleton className="h-3 w-24" />
          </div>
        </div>
        <Skeleton className="h-24 w-full rounded-2xl" />
        <Skeleton className="h-24 w-full rounded-2xl" />
      </div>
    </div>
  );
}

/** Hiện khi không kết nối được database lúc tải trang — có nút thử lại. */
function FullPageError({
  message,
  onRetry,
}: {
  message: string | null;
  onRetry: () => void;
}) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-6">
      <div className="w-full max-w-sm space-y-4 rounded-2xl border border-border bg-card p-6 text-center shadow-card">
        <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-coral-100 text-coral-700">
          <ServerCrash className="h-6 w-6" />
        </span>
        <div className="space-y-1.5">
          <p className="font-semibold">Không tải được dữ liệu</p>
          <p className="text-sm text-muted-foreground">
            {message ?? "Có lỗi xảy ra khi kết nối tới máy chủ."}
          </p>
        </div>
        <Button onClick={onRetry} className="w-full">
          <RotateCw />
          Thử lại
        </Button>
      </div>
    </div>
  );
}
