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
import { useToast } from "@/components/ui/toast";
import { useWeeklyReport } from "@/lib/store";
import type { Department } from "@/types";

type DepartmentFormDialogProps = {
  trigger: React.ReactNode;
  /** Có giá trị = chế độ sửa. */
  department?: Department;
};

export function DepartmentFormDialog({
  trigger,
  department,
}: DepartmentFormDialogProps) {
  const { departments, createDepartment, updateDepartment } =
    useWeeklyReport();
  const { toast } = useToast();

  const [open, setOpen] = React.useState(false);
  const [name, setName] = React.useState(department?.name ?? "");
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (open) {
      setName(department?.name ?? "");
      setError(null);
    }
  }, [open, department]);

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const trimmed = name.trim();

    if (!trimmed) {
      setError("Vui lòng nhập tên bộ phận.");
      return;
    }

    const duplicated = departments.some(
      (item) =>
        item.id !== department?.id &&
        item.name.trim().toLowerCase() === trimmed.toLowerCase(),
    );
    if (duplicated) {
      setError("Đã có bộ phận trùng tên.");
      return;
    }

    if (department) {
      updateDepartment(department.id, { name: trimmed });
      toast({ title: "Đã cập nhật bộ phận", description: trimmed });
    } else {
      createDepartment({ name: trimmed });
      toast({ title: "Đã thêm bộ phận", description: trimmed });
    }
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>
            {department ? "Sửa bộ phận" : "Thêm bộ phận"}
          </DialogTitle>
          <DialogDescription>
            Tên bộ phận hiển thị trong bộ lọc, biểu đồ và danh sách cuộc họp.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="department-name">Tên bộ phận</Label>
            <Input
              id="department-name"
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="Ví dụ: Chăm sóc khách hàng"
              className="bg-background"
            />
            {error ? <p className="text-xs text-coral-600">{error}</p> : null}
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
              {department ? "Lưu thay đổi" : "Thêm bộ phận"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
