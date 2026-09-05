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
import { useToast } from "@/components/ui/toast";
import { useWeeklyReport } from "@/lib/store";
import { getInitials } from "@/lib/utils";
import { PERSON_ROLES, type Person, type PersonRole } from "@/types";

type PersonFormDialogProps = {
  trigger: React.ReactNode;
  /** Có giá trị = chế độ sửa. */
  person?: Person;
};

type FormState = {
  name: string;
  avatarInitials: string;
  departmentId: string;
  role: PersonRole;
};

export function PersonFormDialog({ trigger, person }: PersonFormDialogProps) {
  const { departments, createPerson, updatePerson } = useWeeklyReport();
  const { toast } = useToast();

  const [open, setOpen] = React.useState(false);
  const [errors, setErrors] = React.useState<Record<string, string>>({});

  const buildInitialState = React.useCallback(
    (): FormState => ({
      name: person?.name ?? "",
      avatarInitials: person?.avatarInitials ?? "",
      departmentId: person?.departmentId ?? departments[0]?.id ?? "",
      role: person?.role ?? "Nhân viên",
    }),
    [person, departments],
  );

  const [form, setForm] = React.useState<FormState>(buildInitialState);

  React.useEffect(() => {
    if (open) {
      setForm(buildInitialState());
      setErrors({});
    }
  }, [open, buildInitialState]);

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const nextErrors: Record<string, string> = {};
    if (!form.name.trim()) {
      nextErrors.name = "Vui lòng nhập họ tên.";
    }
    if (!form.departmentId) {
      nextErrors.departmentId = "Vui lòng chọn bộ phận.";
    }

    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      return;
    }

    const name = form.name.trim();
    const payload = {
      name,
      avatarInitials:
        form.avatarInitials.trim().slice(0, 3).toUpperCase() ||
        getInitials(name),
      departmentId: form.departmentId,
      role: form.role,
    };

    if (person) {
      updatePerson(person.id, payload);
      toast({ title: "Đã cập nhật nhân sự", description: name });
    } else {
      createPerson(payload);
      toast({ title: "Đã thêm nhân sự", description: name });
    }
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>{person ? "Sửa nhân sự" : "Thêm nhân sự"}</DialogTitle>
          <DialogDescription>
            Nhân sự sẽ xuất hiện trong danh sách người phụ trách và người chủ
            trì cuộc họp.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="person-name">Họ và tên</Label>
            <Input
              id="person-name"
              value={form.name}
              onChange={(event) =>
                setForm((prev) => ({ ...prev, name: event.target.value }))
              }
              placeholder="Ví dụ: Nguyễn Thu Trang"
              className="bg-background"
            />
            {errors.name ? (
              <p className="text-xs text-coral-600">{errors.name}</p>
            ) : null}
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Bộ phận</Label>
              <Select
                value={form.departmentId}
                onValueChange={(value) =>
                  setForm((prev) => ({ ...prev, departmentId: value }))
                }
              >
                <SelectTrigger className="bg-background">
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
              <Label>Vai trò</Label>
              <Select
                value={form.role}
                onValueChange={(value) =>
                  setForm((prev) => ({ ...prev, role: value as PersonRole }))
                }
              >
                <SelectTrigger className="bg-background">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {PERSON_ROLES.map((role) => (
                    <SelectItem key={role} value={role}>
                      {role}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="person-initials">Chữ viết tắt avatar</Label>
            <Input
              id="person-initials"
              value={form.avatarInitials}
              onChange={(event) =>
                setForm((prev) => ({
                  ...prev,
                  avatarInitials: event.target.value,
                }))
              }
              placeholder={form.name ? getInitials(form.name) : "VD: NT"}
              maxLength={3}
              className="bg-background sm:max-w-[140px]"
            />
            <p className="text-xs text-muted-foreground">
              Để trống sẽ tự sinh từ họ tên.
            </p>
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
              {person ? "Lưu thay đổi" : "Thêm nhân sự"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
