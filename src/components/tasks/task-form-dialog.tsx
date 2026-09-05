"use client";

import * as React from "react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/toast";
import { formatDate, toISODate } from "@/lib/date";
import { useWeeklyReport, type TaskInput } from "@/lib/store";
import {
  TASK_PRIORITIES,
  type Task,
  type TaskPriority,
  type TaskStatus,
} from "@/types";

const NO_MEETING = "none";

/** Trạng thái người dùng được phép chọn — "Trễ hạn" do hệ thống tự suy ra. */
const SELECTABLE_STATUSES: TaskStatus[] = [
  "Chưa bắt đầu",
  "Đang làm",
  "Hoàn thành",
];

type TaskFormDialogProps = {
  trigger: React.ReactNode;
  /** Có giá trị = chế độ sửa. */
  task?: Task;
  /** Giá trị mặc định khi tạo mới (ví dụ tạo nhanh từ một cuộc họp). */
  defaults?: Partial<TaskInput>;
};

type FormState = {
  title: string;
  description: string;
  departmentId: string;
  assigneeId: string;
  meetingId: string;
  dueDate: string;
  priority: TaskPriority;
  status: TaskStatus;
  progress: number;
};

export function TaskFormDialog({
  trigger,
  task,
  defaults,
}: TaskFormDialogProps) {
  const {
    departments,
    meetings,
    createTask,
    updateTask,
    getPeopleByDepartment,
  } = useWeeklyReport();
  const { toast } = useToast();

  const [open, setOpen] = React.useState(false);
  const [errors, setErrors] = React.useState<Record<string, string>>({});

  const buildInitialState = React.useCallback((): FormState => {
    const source = task ?? defaults;
    const departmentId =
      source?.departmentId ?? defaults?.departmentId ?? departments[0]?.id ?? "";

    return {
      title: source?.title ?? "",
      description: source?.description ?? "",
      departmentId,
      assigneeId: source?.assigneeId ?? "",
      meetingId: source?.meetingId ?? NO_MEETING,
      dueDate: source?.dueDate ?? toISODate(new Date()),
      priority: source?.priority ?? "Trung bình",
      status: source?.status ?? "Chưa bắt đầu",
      progress: source?.progress ?? 0,
    };
  }, [task, defaults, departments]);

  const [form, setForm] = React.useState<FormState>(buildInitialState);

  // Nạp lại dữ liệu mỗi lần mở hộp thoại.
  React.useEffect(() => {
    if (open) {
      setForm(buildInitialState());
      setErrors({});
    }
  }, [open, buildInitialState]);

  const peopleInDepartment = getPeopleByDepartment(form.departmentId);
  const meetingsInDepartment = meetings.filter(
    (meeting) => meeting.departmentId === form.departmentId,
  );

  const set = <K extends keyof FormState>(key: K, value: FormState[K]) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const handleDepartmentChange = (departmentId: string) => {
    setForm((prev) => {
      const stillValid = getPeopleByDepartment(departmentId).some(
        (person) => person.id === prev.assigneeId,
      );
      return {
        ...prev,
        departmentId,
        assigneeId: stillValid ? prev.assigneeId : "",
        meetingId: NO_MEETING,
      };
    });
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const nextErrors: Record<string, string> = {};
    if (!form.title.trim()) {
      nextErrors.title = "Vui lòng nhập tiêu đề công việc.";
    }
    if (!form.departmentId) {
      nextErrors.departmentId = "Vui lòng chọn bộ phận.";
    }
    if (!form.assigneeId) {
      nextErrors.assigneeId = "Vui lòng chọn người phụ trách.";
    }
    if (!form.dueDate) {
      nextErrors.dueDate = "Vui lòng chọn hạn chót.";
    }

    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      return;
    }

    const payload: TaskInput = {
      title: form.title.trim(),
      description: form.description.trim(),
      departmentId: form.departmentId,
      assigneeId: form.assigneeId,
      meetingId: form.meetingId === NO_MEETING ? undefined : form.meetingId,
      dueDate: form.dueDate,
      priority: form.priority,
      status: form.status,
      progress: form.status === "Hoàn thành" ? 100 : form.progress,
    };

    if (task) {
      updateTask(task.id, payload);
      toast({
        title: "Đã cập nhật công việc",
        description: payload.title,
      });
    } else {
      createTask(payload);
      toast({
        title: "Đã tạo công việc mới",
        description: `${payload.title} · hạn ${formatDate(payload.dueDate)}`,
      });
    }
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {task ? "Sửa công việc" : "Tạo công việc mới"}
          </DialogTitle>
          <DialogDescription>
            {task
              ? "Cập nhật thông tin, tiến độ và trạng thái của công việc."
              : "Điền thông tin công việc và giao cho người phụ trách."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="task-title">Tiêu đề</Label>
            <Input
              id="task-title"
              value={form.title}
              onChange={(event) => set("title", event.target.value)}
              placeholder="Ví dụ: Gửi báo giá cho khách hàng A"
              className="bg-background"
            />
            {errors.title ? (
              <p className="text-xs text-coral-600">{errors.title}</p>
            ) : null}
          </div>

          <div className="space-y-2">
            <Label htmlFor="task-description">Mô tả</Label>
            <Textarea
              id="task-description"
              value={form.description}
              onChange={(event) => set("description", event.target.value)}
              placeholder="Mô tả chi tiết đầu việc, kết quả mong đợi…"
              className="bg-background"
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Bộ phận</Label>
              <Select
                value={form.departmentId}
                onValueChange={handleDepartmentChange}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Chọn bộ phận" />
                </SelectTrigger>
                <SelectContent>
                  {departments.map((department) => (
                    <SelectItem key={department.id} value={department.id}>
                      {department.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.departmentId ? (
                <p className="text-xs text-coral-600">{errors.departmentId}</p>
              ) : null}
            </div>

            <div className="space-y-2">
              <Label>Người phụ trách</Label>
              <Select
                value={form.assigneeId}
                onValueChange={(value) => set("assigneeId", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Chọn người phụ trách" />
                </SelectTrigger>
                <SelectContent>
                  {peopleInDepartment.map((person) => (
                    <SelectItem key={person.id} value={person.id}>
                      {person.name} · {person.role}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.assigneeId ? (
                <p className="text-xs text-coral-600">{errors.assigneeId}</p>
              ) : null}
            </div>

            <div className="space-y-2">
              <Label htmlFor="task-due">Hạn chót</Label>
              <Input
                id="task-due"
                type="date"
                value={form.dueDate}
                onChange={(event) => set("dueDate", event.target.value)}
                className="bg-background"
              />
              {errors.dueDate ? (
                <p className="text-xs text-coral-600">{errors.dueDate}</p>
              ) : null}
            </div>

            <div className="space-y-2">
              <Label>Độ ưu tiên</Label>
              <Select
                value={form.priority}
                onValueChange={(value) => set("priority", value as TaskPriority)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {TASK_PRIORITIES.map((priority) => (
                    <SelectItem key={priority} value={priority}>
                      {priority}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Trạng thái</Label>
              <Select
                value={form.status === "Trễ hạn" ? "Đang làm" : form.status}
                onValueChange={(value) => set("status", value as TaskStatus)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {SELECTABLE_STATUSES.map((status) => (
                    <SelectItem key={status} value={status}>
                      {status}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                Quá hạn mà chưa hoàn thành sẽ tự chuyển thành “Trễ hạn”.
              </p>
            </div>

            <div className="space-y-2">
              <Label>Cuộc họp liên quan</Label>
              <Select
                value={form.meetingId}
                onValueChange={(value) => set("meetingId", value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={NO_MEETING}>Không gắn cuộc họp</SelectItem>
                  {meetingsInDepartment.map((meeting) => (
                    <SelectItem key={meeting.id} value={meeting.id}>
                      {formatDate(meeting.date)} · {meeting.agenda.slice(0, 40)}
                      {meeting.agenda.length > 40 ? "…" : ""}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="task-progress">Tiến độ</Label>
              <span className="text-sm font-semibold text-lavender-700">
                {form.status === "Hoàn thành" ? 100 : form.progress}%
              </span>
            </div>
            <input
              id="task-progress"
              type="range"
              min={0}
              max={100}
              step={5}
              value={form.status === "Hoàn thành" ? 100 : form.progress}
              disabled={form.status === "Hoàn thành"}
              onChange={(event) => set("progress", Number(event.target.value))}
              className="h-2.5 w-full cursor-pointer appearance-none rounded-full bg-secondary accent-lavender-500 disabled:cursor-not-allowed disabled:opacity-60"
            />
          </div>

          <DialogFooter className="gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
            >
              Huỷ
            </Button>
            <Button type="submit">
              {task ? "Lưu thay đổi" : "Tạo công việc"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
