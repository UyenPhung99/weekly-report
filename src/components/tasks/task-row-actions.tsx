"use client";

import * as React from "react";
import { Pencil, Trash2 } from "lucide-react";

import { TaskFormDialog } from "@/components/tasks/task-form-dialog";
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
import { useToast } from "@/components/ui/toast";
import { useWeeklyReport } from "@/lib/store";
import type { Task } from "@/types";

export function TaskRowActions({ task }: { task: Task }) {
  const { deleteTask } = useWeeklyReport();
  const { toast } = useToast();
  const [confirmOpen, setConfirmOpen] = React.useState(false);

  return (
    <div className="flex items-center justify-end gap-1">
      <TaskFormDialog
        task={task}
        trigger={
          <Button
            variant="ghost"
            size="icon"
            className="h-9 w-9"
            aria-label={`Sửa công việc: ${task.title}`}
          >
            <Pencil className="h-4 w-4" />
          </Button>
        }
      />
      <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <DialogTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="h-9 w-9 text-coral-700 hover:bg-coral-100"
            aria-label={`Xoá công việc: ${task.title}`}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Xoá công việc?</DialogTitle>
            <DialogDescription>
              Công việc “{task.title}” sẽ bị xoá khỏi danh sách.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setConfirmOpen(false)}>
              Huỷ
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                deleteTask(task.id);
                setConfirmOpen(false);
                toast({
                  title: "Đã xoá công việc",
                  description: task.title,
                  variant: "info",
                });
              }}
            >
              Xoá công việc
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
