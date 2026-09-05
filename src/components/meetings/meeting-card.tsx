"use client";

import * as React from "react";
import { CheckCircle2, ListChecks, Pencil, Plus, Trash2 } from "lucide-react";

import { PersonCell } from "@/components/shared/person-cell";
import { StatusBadge } from "@/components/shared/task-badges";
import { MeetingFormDialog } from "@/components/meetings/meeting-form-dialog";
import { TaskFormDialog } from "@/components/tasks/task-form-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/components/ui/toast";
import { formatDate, formatDateWithWeekday } from "@/lib/date";
import { useWeeklyReport } from "@/lib/store";
import { getEffectiveStatus } from "@/lib/task-utils";
import type { Meeting } from "@/types";

export function MeetingCard({ meeting }: { meeting: Meeting }) {
  const {
    today,
    getDepartmentName,
    getTasksByMeeting,
    deleteMeeting,
  } = useWeeklyReport();
  const { toast } = useToast();

  const [confirmOpen, setConfirmOpen] = React.useState(false);
  const tasks = getTasksByMeeting(meeting.id);

  return (
    <Card className="overflow-hidden">
      <CardHeader className="gap-3 pb-4">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="space-y-1.5">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="default">
                {getDepartmentName(meeting.departmentId)}
              </Badge>
              <Badge variant="outline">{formatDate(meeting.date)}</Badge>
            </div>
            <p className="text-sm font-medium text-lavender-700">
              {formatDateWithWeekday(meeting.date)}
            </p>
          </div>
          <PersonCell personId={meeting.hostId} showRole />
        </div>
      </CardHeader>

      <CardContent className="space-y-4 pb-4">
        <div className="space-y-1">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Agenda
          </p>
          <p className="text-sm leading-relaxed">{meeting.agenda}</p>
        </div>

        {meeting.notes ? (
          <div className="space-y-1">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Ghi chú
            </p>
            <p className="text-sm leading-relaxed text-muted-foreground">
              {meeting.notes}
            </p>
          </div>
        ) : null}

        {meeting.decisions.length > 0 ? (
          <div className="space-y-2">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Quyết định
            </p>
            <ul className="space-y-1.5">
              {meeting.decisions.map((decision, index) => (
                <li key={index} className="flex gap-2 text-sm leading-relaxed">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-mint-500" />
                  <span>{decision}</span>
                </li>
              ))}
            </ul>
          </div>
        ) : null}

        <Separator />

        <div className="space-y-2">
          <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            <ListChecks className="h-4 w-4" />
            Công việc phát sinh ({tasks.length})
          </p>
          {tasks.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              Chưa có công việc nào gắn với cuộc họp này.
            </p>
          ) : (
            <ul className="space-y-2">
              {tasks.map((task) => (
                <li
                  key={task.id}
                  className="flex flex-wrap items-center justify-between gap-2 rounded-xl bg-background/70 px-3 py-2"
                >
                  <span className="text-sm font-medium">{task.title}</span>
                  <StatusBadge status={getEffectiveStatus(task, today)} />
                </li>
              ))}
            </ul>
          )}
        </div>
      </CardContent>

      <CardFooter className="flex flex-wrap gap-2 border-t border-border/70 bg-background/50 py-4">
        <TaskFormDialog
          defaults={{
            meetingId: meeting.id,
            departmentId: meeting.departmentId,
          }}
          trigger={
            <Button size="sm">
              <Plus />
              Tạo công việc
            </Button>
          }
        />
        <MeetingFormDialog
          meeting={meeting}
          trigger={
            <Button size="sm" variant="outline">
              <Pencil />
              Sửa
            </Button>
          }
        />
        <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
          <DialogTrigger asChild>
            <Button size="sm" variant="ghost" className="text-coral-700">
              <Trash2 />
              Xoá
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Xoá cuộc họp?</DialogTitle>
              <DialogDescription>
                Cuộc họp ngày {formatDate(meeting.date)} sẽ bị xoá. Các công việc
                đã tạo vẫn được giữ lại nhưng không còn gắn với cuộc họp này.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter className="gap-2">
              <Button variant="outline" onClick={() => setConfirmOpen(false)}>
                Huỷ
              </Button>
              <Button
                variant="destructive"
                onClick={() => {
                  deleteMeeting(meeting.id);
                  setConfirmOpen(false);
                  toast({
                    title: "Đã xoá cuộc họp",
                    description: `${getDepartmentName(meeting.departmentId)} · ${formatDate(meeting.date)}`,
                    variant: "info",
                  });
                }}
              >
                Xoá cuộc họp
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardFooter>
    </Card>
  );
}
