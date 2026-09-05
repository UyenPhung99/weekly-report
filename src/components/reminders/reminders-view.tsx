"use client";

import * as React from "react";
import { AlarmClock, BellRing, CalendarClock, CircleAlert } from "lucide-react";

import { PageHeader } from "@/components/layout/page-header";
import { PlaceholderPanel } from "@/components/layout/placeholder-panel";
import { PersonCell } from "@/components/shared/person-cell";
import { PriorityBadge } from "@/components/shared/task-badges";
import { TaskFormDialog } from "@/components/tasks/task-form-dialog";
import { TaskStatusMenu } from "@/components/tasks/task-status-menu";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { daysUntil, formatDate } from "@/lib/date";
import { useWeeklyReport } from "@/lib/store";
import {
  getEffectiveStatus,
  getProgressBarClass,
  getUrgencyScore,
  isDueSoon,
  isOverdue,
} from "@/lib/task-utils";
import { cn } from "@/lib/utils";
import type { Task } from "@/types";

/** Số ngày được coi là "sắp đến hạn". */
const DUE_SOON_WINDOW = 3;

export function RemindersView() {
  const { tasks, today, getDepartmentName } = useWeeklyReport();

  const { overdue, dueSoon, all } = React.useMemo(() => {
    const overdueTasks = tasks.filter((task) => isOverdue(task, today));
    const dueSoonTasks = tasks.filter((task) =>
      isDueSoon(task, today, DUE_SOON_WINDOW),
    );
    const sort = (list: Task[]) =>
      [...list].sort(
        (a, b) => getUrgencyScore(b, today) - getUrgencyScore(a, today),
      );

    return {
      overdue: sort(overdueTasks),
      dueSoon: sort(dueSoonTasks),
      all: sort([...overdueTasks, ...dueSoonTasks]),
    };
  }, [tasks, today]);

  const dueTodayCount = dueSoon.filter(
    (task) => daysUntil(task.dueDate, today) === 0,
  ).length;

  const summary = [
    {
      label: "Đã trễ hạn",
      value: overdue.length,
      description: "Cần xử lý ngay",
      icon: CircleAlert,
      tone: "bg-coral-100 text-coral-700",
    },
    {
      label: "Đến hạn hôm nay",
      value: dueTodayCount,
      description: "Hạn chót là hôm nay",
      icon: AlarmClock,
      tone: "bg-warning text-warning-foreground",
    },
    {
      label: "Sắp đến hạn",
      value: dueSoon.length,
      description: `Trong ${DUE_SOON_WINDOW} ngày tới`,
      icon: CalendarClock,
      tone: "bg-lavender-200 text-lavender-800",
    },
  ];

  return (
    <>
      <PageHeader
        title="Nhắc việc"
        description={`Công việc đã trễ hạn và sắp đến hạn trong ${DUE_SOON_WINDOW} ngày tới, xếp theo mức độ khẩn cấp.`}
      />

      <div className="grid gap-4 sm:grid-cols-3">
        {summary.map((item) => {
          const Icon = item.icon;
          return (
            <Card key={item.label}>
              <CardHeader className="flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {item.label}
                </CardTitle>
                <span
                  className={cn(
                    "flex h-9 w-9 items-center justify-center rounded-xl",
                    item.tone,
                  )}
                >
                  <Icon className="h-4 w-4" />
                </span>
              </CardHeader>
              <CardContent className="space-y-1">
                <p className="text-3xl font-semibold tracking-tight">
                  {item.value}
                </p>
                <CardDescription>{item.description}</CardDescription>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Tabs defaultValue="all">
        <TabsList>
          <TabsTrigger value="all">Tất cả ({all.length})</TabsTrigger>
          <TabsTrigger value="overdue">Trễ hạn ({overdue.length})</TabsTrigger>
          <TabsTrigger value="soon">
            Sắp đến hạn ({dueSoon.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="all">
          <ReminderList tasks={all} getDepartmentName={getDepartmentName} />
        </TabsContent>
        <TabsContent value="overdue">
          <ReminderList tasks={overdue} getDepartmentName={getDepartmentName} />
        </TabsContent>
        <TabsContent value="soon">
          <ReminderList tasks={dueSoon} getDepartmentName={getDepartmentName} />
        </TabsContent>
      </Tabs>
    </>
  );
}

function ReminderList({
  tasks,
  getDepartmentName,
}: {
  tasks: Task[];
  getDepartmentName: (id: string) => string;
}) {
  const { today } = useWeeklyReport();

  if (tasks.length === 0) {
    return (
      <PlaceholderPanel
        icon={<BellRing className="h-6 w-6" />}
        title="Không có việc nào cần nhắc"
        description="Mọi công việc trong nhóm này đều còn hạn hoặc đã hoàn thành."
      />
    );
  }

  return (
    <div className="space-y-3">
      {tasks.map((task) => {
        const diff = daysUntil(task.dueDate, today);
        const overdue = diff < 0;
        const status = getEffectiveStatus(task, today);

        return (
          <Card
            key={task.id}
            className={cn(
              "border-l-4",
              overdue ? "border-l-coral-400" : "border-l-warning",
            )}
          >
            <CardContent className="flex flex-col gap-4 p-5 lg:flex-row lg:items-center lg:justify-between">
              <div className="min-w-0 flex-1 space-y-2">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant={overdue ? "danger" : "warning"}>
                    {overdue
                      ? `Trễ ${Math.abs(diff)} ngày`
                      : diff === 0
                        ? "Đến hạn hôm nay"
                        : `Còn ${diff} ngày`}
                  </Badge>
                  <PriorityBadge priority={task.priority} />
                  <Badge variant="outline">
                    Hạn: {formatDate(task.dueDate)}
                  </Badge>
                </div>

                <p className="font-medium leading-snug">{task.title}</p>

                <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
                  <PersonCell personId={task.assigneeId} />
                  <Badge variant="secondary">
                    {getDepartmentName(task.departmentId)}
                  </Badge>
                </div>
              </div>

              <div className="flex w-full shrink-0 flex-col gap-3 lg:w-64">
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">Tiến độ</span>
                    <span className="font-semibold">{task.progress}%</span>
                  </div>
                  <Progress
                    value={task.progress}
                    className={getProgressBarClass(status)}
                  />
                </div>
                <div className="flex items-center gap-2">
                  <TaskStatusMenu task={task} />
                  <TaskFormDialog
                    task={task}
                    trigger={
                      <Button variant="outline" size="sm">
                        Cập nhật
                      </Button>
                    }
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
