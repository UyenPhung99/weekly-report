"use client";

import * as React from "react";
import { Plus, X } from "lucide-react";

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
import { useWeeklyReport, type MeetingInput } from "@/lib/store";
import { clearDraft, readDraft, useFormDraft } from "@/lib/use-form-draft";
import type { Meeting } from "@/types";

type MeetingFormDialogProps = {
  trigger: React.ReactNode;
  /** Có giá trị = chế độ sửa. */
  meeting?: Meeting;
  /** Ngày mặc định khi tạo mới (theo tuần đang xem). */
  defaultDate?: string;
};

type FormState = {
  departmentId: string;
  hostId: string;
  date: string;
  agenda: string;
  notes: string;
  decisions: string[];
};

export function MeetingFormDialog({
  trigger,
  meeting,
  defaultDate,
}: MeetingFormDialogProps) {
  const {
    departments,
    createMeeting,
    updateMeeting,
    getPeopleByDepartment,
    getDepartmentName,
  } = useWeeklyReport();
  const { toast } = useToast();

  const [open, setOpen] = React.useState(false);
  const [errors, setErrors] = React.useState<Record<string, string>>({});

  // Khoá nháp riêng cho từng cuộc họp (hoặc "new" khi đang tạo mới), để nếu
  // lỡ tải lại trang khi chưa bấm Lưu thì mở lại đúng form này vẫn còn nội
  // dung đã gõ — xem src/lib/use-form-draft.ts.
  const draftKey = `meeting:${meeting?.id ?? "new"}`;
  const [restoredDraft, setRestoredDraft] = React.useState(false);

  const buildInitialState = React.useCallback((): FormState => {
    const departmentId = meeting?.departmentId ?? departments[0]?.id ?? "";
    const head = getPeopleByDepartment(departmentId).find(
      (person) => person.role === "Trưởng bộ phận",
    );

    return {
      departmentId,
      hostId: meeting?.hostId ?? head?.id ?? "",
      date: meeting?.date ?? defaultDate ?? toISODate(new Date()),
      agenda: meeting?.agenda ?? "",
      notes: meeting?.notes ?? "",
      decisions: meeting?.decisions.length ? [...meeting.decisions] : [""],
    };
  }, [meeting, defaultDate, departments, getPeopleByDepartment]);

  const [form, setForm] = React.useState<FormState>(buildInitialState);

  React.useEffect(() => {
    if (open) {
      const draft = readDraft<FormState>(draftKey);
      if (draft) {
        setForm(draft);
        setRestoredDraft(true);
      } else {
        setForm(buildInitialState());
        setRestoredDraft(false);
      }
      setErrors({});
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, buildInitialState, draftKey]);

  // Tự lưu nháp xuống localStorage trong lúc hộp thoại đang mở.
  useFormDraft(open ? draftKey : null, form);

  const discardDraft = () => {
    clearDraft(draftKey);
    setForm(buildInitialState());
    setRestoredDraft(false);
  };

  /** Đóng hộp thoại và coi như không cần bản nháp nữa (Huỷ / Esc / bấm ra ngoài). */
  const handleOpenChange = (next: boolean) => {
    if (!next) clearDraft(draftKey);
    setOpen(next);
  };

  const peopleInDepartment = getPeopleByDepartment(form.departmentId);

  const handleDepartmentChange = (departmentId: string) => {
    const people = getPeopleByDepartment(departmentId);
    const head = people.find((person) => person.role === "Trưởng bộ phận");
    setForm((prev) => ({
      ...prev,
      departmentId,
      hostId: people.some((person) => person.id === prev.hostId)
        ? prev.hostId
        : (head?.id ?? ""),
    }));
  };

  const setDecision = (index: number, value: string) => {
    setForm((prev) => ({
      ...prev,
      decisions: prev.decisions.map((item, i) => (i === index ? value : item)),
    }));
  };

  const addDecision = () =>
    setForm((prev) => ({ ...prev, decisions: [...prev.decisions, ""] }));

  const removeDecision = (index: number) =>
    setForm((prev) => ({
      ...prev,
      decisions:
        prev.decisions.length === 1
          ? [""]
          : prev.decisions.filter((_, i) => i !== index),
    }));

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const nextErrors: Record<string, string> = {};
    if (!form.departmentId) {
      nextErrors.departmentId = "Vui lòng chọn bộ phận.";
    }
    if (!form.hostId) {
      nextErrors.hostId = "Vui lòng chọn người chủ trì.";
    }
    if (!form.date) {
      nextErrors.date = "Vui lòng chọn ngày họp.";
    }
    if (!form.agenda.trim()) {
      nextErrors.agenda = "Vui lòng nhập nội dung agenda.";
    }

    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      return;
    }

    const payload: MeetingInput = {
      departmentId: form.departmentId,
      hostId: form.hostId,
      date: form.date,
      agenda: form.agenda.trim(),
      notes: form.notes.trim(),
      decisions: form.decisions
        .map((decision) => decision.trim())
        .filter(Boolean),
    };

    const label = `${getDepartmentName(payload.departmentId)} · ${formatDate(payload.date)}`;

    if (meeting) {
      updateMeeting(meeting.id, payload);
      toast({ title: "Đã cập nhật cuộc họp", description: label });
    } else {
      createMeeting(payload);
      toast({ title: "Đã tạo cuộc họp mới", description: label });
    }
    // Đã lưu thành công nên không cần giữ nháp nữa.
    handleOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {meeting ? "Sửa cuộc họp" : "Tạo cuộc họp mới"}
          </DialogTitle>
          <DialogDescription>
            Ghi lại nội dung, ghi chú và các quyết định của cuộc họp.
          </DialogDescription>
        </DialogHeader>

        {restoredDraft ? (
          <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl bg-lavender-100 px-3 py-2 text-xs text-lavender-800">
            <span>Đã khôi phục nội dung bạn nhập dở lần trước, chưa lưu.</span>
            <button
              type="button"
              onClick={discardDraft}
              className="font-medium underline underline-offset-2 hover:text-lavender-900"
            >
              Bỏ nháp, dùng bản gốc
            </button>
          </div>
        ) : null}

        <form onSubmit={handleSubmit} className="space-y-4">
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
              <Label>Người chủ trì</Label>
              <Select
                value={form.hostId}
                onValueChange={(value) =>
                  setForm((prev) => ({ ...prev, hostId: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Chọn người chủ trì" />
                </SelectTrigger>
                <SelectContent>
                  {peopleInDepartment.map((person) => (
                    <SelectItem key={person.id} value={person.id}>
                      {person.name} · {person.role}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.hostId ? (
                <p className="text-xs text-coral-600">{errors.hostId}</p>
              ) : null}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="meeting-date">Ngày họp</Label>
            <Input
              id="meeting-date"
              type="date"
              value={form.date}
              onChange={(event) =>
                setForm((prev) => ({ ...prev, date: event.target.value }))
              }
              className="bg-background sm:max-w-xs"
            />
            {errors.date ? (
              <p className="text-xs text-coral-600">{errors.date}</p>
            ) : null}
          </div>

          <div className="space-y-2">
            <Label htmlFor="meeting-agenda">Nội dung agenda</Label>
            <Textarea
              id="meeting-agenda"
              value={form.agenda}
              onChange={(event) =>
                setForm((prev) => ({ ...prev, agenda: event.target.value }))
              }
              placeholder="Các nội dung sẽ trao đổi trong cuộc họp…"
              className="bg-background"
            />
            {errors.agenda ? (
              <p className="text-xs text-coral-600">{errors.agenda}</p>
            ) : null}
          </div>

          <div className="space-y-2">
            <Label htmlFor="meeting-notes">Ghi chú</Label>
            <Textarea
              id="meeting-notes"
              value={form.notes}
              onChange={(event) =>
                setForm((prev) => ({ ...prev, notes: event.target.value }))
              }
              placeholder="Diễn biến, số liệu, ý kiến đáng lưu ý…"
              className="min-h-[80px] bg-background"
            />
          </div>

          <div className="space-y-2">
            <Label>Các quyết định</Label>
            <div className="space-y-2">
              {form.decisions.map((decision, index) => (
                <div key={index} className="flex items-center gap-2">
                  <Input
                    value={decision}
                    onChange={(event) => setDecision(index, event.target.value)}
                    placeholder={`Quyết định ${index + 1}`}
                    className="bg-background"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => removeDecision(index)}
                    aria-label={`Xoá quyết định ${index + 1}`}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
            <Button
              type="button"
              variant="soft"
              size="sm"
              onClick={addDecision}
            >
              <Plus />
              Thêm quyết định
            </Button>
          </div>

          <DialogFooter className="gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => handleOpenChange(false)}
            >
              Huỷ
            </Button>
            <Button type="submit">
              {meeting ? "Lưu thay đổi" : "Tạo cuộc họp"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
