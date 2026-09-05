"use client";

import { Check, ChevronDown } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useToast } from "@/components/ui/toast";
import { useWeeklyReport } from "@/lib/store";
import { getEffectiveStatus, getStatusVariant } from "@/lib/task-utils";
import { cn } from "@/lib/utils";
import type { Task, TaskStatus } from "@/types";

/** Trạng thái đặt được bằng tay — "Trễ hạn" do hệ thống tự suy ra từ hạn chót. */
const SELECTABLE_STATUSES: TaskStatus[] = [
  "Chưa bắt đầu",
  "Đang làm",
  "Hoàn thành",
];

/** Đổi trạng thái nhanh ngay trên dòng công việc. */
export function TaskStatusMenu({ task }: { task: Task }) {
  const { today, updateTask } = useWeeklyReport();
  const { toast } = useToast();
  const effectiveStatus = getEffectiveStatus(task, today);

  const handleSelect = (status: TaskStatus) => {
    if (status === task.status) return;
    updateTask(task.id, {
      status,
      progress:
        status === "Hoàn thành"
          ? 100
          : status === "Chưa bắt đầu"
            ? 0
            : task.progress,
    });
    toast({
      title: `Đã chuyển sang “${status}”`,
      description: task.title,
    });
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          className="group inline-flex items-center gap-1.5 rounded-full ring-offset-background transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          aria-label={`Đổi trạng thái: ${task.title}`}
        >
          <Badge
            variant={getStatusVariant(effectiveStatus)}
            className="cursor-pointer gap-1 pr-2"
          >
            {effectiveStatus}
            <ChevronDown className="h-3 w-3 opacity-70" />
          </Badge>
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-48">
        <DropdownMenuLabel className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          Đổi trạng thái
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        {SELECTABLE_STATUSES.map((status) => (
          <DropdownMenuItem
            key={status}
            onSelect={() => handleSelect(status)}
            className="justify-between"
          >
            {status}
            <Check
              className={cn(
                "h-4 w-4 text-lavender-700",
                task.status === status ? "opacity-100" : "opacity-0",
              )}
            />
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
