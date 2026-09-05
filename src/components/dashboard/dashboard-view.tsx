"use client";

import * as React from "react";
import Link from "next/link";
import {
  ArrowRight,
  CalendarDays,
  CircleAlert,
  ClipboardList,
  LayoutDashboard,
  TrendingUp,
  Users,
} from "lucide-react";

import {
  DepartmentBarChart,
  type DepartmentDatum,
} from "@/components/dashboard/department-bar-chart";
import {
  StatusDonutChart,
  type StatusDatum,
} from "@/components/dashboard/status-donut-chart";
import {
  WorkloadTable,
  type WorkloadRow,
} from "@/components/dashboard/workload-table";
import { PageHeader } from "@/components/layout/page-header";
import { PlaceholderPanel } from "@/components/layout/placeholder-panel";
import { PersonCell } from "@/components/shared/person-cell";
import { PriorityBadge } from "@/components/shared/task-badges";
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
import {
  daysUntil,
  formatDate,
  formatWeekRange,
  isWithinWeek,
} from "@/lib/date";
import { useWeeklyReport } from "@/lib/store";
import {
  getEffectiveStatus,
  getUrgencyScore,
  isDueSoon,
  isOverdue,
} from "@/lib/task-utils";
import { cn } from "@/lib/utils";
import { TASK_STATUSES, type Task } from "@/types";

const ATTENTION_LIMIT = 5;

export function DashboardView() {
  const { departments, meetings, people, tasks, today, getDepartmentName } =
    useWeeklyReport();

  /* ------------------------------ Số liệu KPI ----------------------------- */

  const overdueTasks = tasks.filter((task) => isOverdue(task, today));
  const weekMeetings = meetings.filter((meeting) =>
    isWithinWeek(meeting.date, today),
  );
  const averageProgress = tasks.length
    ? Math.round(
        tasks.reduce((sum, task) => sum + task.progress, 0) / tasks.length,
      )
    : 0;

  const kpis = [
    {
      label: "Tổng số công việc",
      value: String(tasks.length),
      hint: `${tasks.filter((task) => getEffectiveStatus(task, today) !== "Hoàn thành").length} việc đang mở`,
      icon: ClipboardList,
      href: "/tasks",
    },
    {
      label: "Hoàn thành trung bình",
      value: `${averageProgress}%`,
      hint: `Trên ${tasks.length} công việc`,
      icon: TrendingUp,
      href: "/tasks",
    },
    {
      label: "Công việc trễ hạn",
      value: String(overdueTasks.length),
      hint:
        overdueTasks.length > 0 ? "Cần xử lý ngay" : "Không có việc nào trễ",
      icon: CircleAlert,
      href: "/reminders",
      alert: overdueTasks.length > 0,
    },
    {
      label: "Cuộc họp trong tuần",
      value: String(weekMeetings.length),
      hint: formatWeekRange(today),
      icon: CalendarDays,
      href: "/meetings",
    },
  ];

  /* ------------------------------ Biểu đồ tròn ---------------------------- */

  const statusData: StatusDatum[] = TASK_STATUSES.map((status) => ({
    status,
    value: tasks.filter((task) => getEffectiveStatus(task, today) === status)
      .length,
  }));

  /* ------------------------------- Biểu đồ cột ---------------------------- */

  const departmentData: DepartmentDatum[] = departments.map((department) => {
    const list = tasks.filter((task) => task.departmentId === department.id);
    const done = list.filter(
      (task) => getEffectiveStatus(task, today) === "Hoàn thành",
    ).length;
    return {
      name: department.name,
      done,
      total: list.length,
      percent: list.length ? Math.round((done / list.length) * 100) : 0,
    };
  });

  /* --------------------------- Khối lượng công việc ----------------------- */

  const workloadRows: WorkloadRow[] = people
    .map((person) => {
      const list = tasks.filter((task) => task.assigneeId === person.id);
      const open = list.filter(
        (task) => getEffectiveStatus(task, today) !== "Hoàn thành",
      );
      return {
        personId: person.id,
        departmentName: getDepartmentName(person.departmentId),
        openCount: open.length,
        totalCount: list.length,
        overdueCount: list.filter((task) => isOverdue(task, today)).length,
        averageProgress: list.length
          ? Math.round(
              list.reduce((sum, task) => sum + task.progress, 0) / list.length,
            )
          : 0,
      };
    })
    .sort(
      (a, b) =>
        b.overdueCount - a.overdueCount ||
        b.openCount - a.openCount ||
        a.averageProgress - b.averageProgress,
    );

  /* ---------------------------- Cần chú ý ngay ---------------------------- */

  const attentionTasks = tasks
    .filter((task) => isOverdue(task, today) || isDueSoon(task, today))
    .sort((a, b) => getUrgencyScore(b, today) - getUrgencyScore(a, today))
    .slice(0, ATTENTION_LIMIT);

  /* ------------------- Cuộc họp gần nhất theo từng bộ phận ---------------- */

  const latestMeetings = departments
    .map((department) => ({
      department,
      meeting: meetings
        .filter((meeting) => meeting.departmentId === department.id)
        .sort((a, b) => b.date.localeCompare(a.date))[0],
    }))
    .filter((item) => Boolean(item.meeting));

  const isEmpty = tasks.length === 0 && meetings.length === 0;

  if (isEmpty) {
    return (
      <>
        <PageHeader
          title="Dashboard"
          description="Tổng quan hoạt động và tiến độ trong tuần."
        />
        <PlaceholderPanel
          icon={<LayoutDashboard className="h-6 w-6" />}
          title="Chưa có dữ liệu để tổng hợp"
          description="Hãy tạo cuộc họp và công việc đầu tiên, số liệu sẽ tự động xuất hiện tại đây."
          action={
            <div className="flex flex-wrap justify-center gap-2">
              <Button asChild>
                <Link href="/meetings">Tạo cuộc họp</Link>
              </Button>
              <Button variant="outline" asChild>
                <Link href="/tasks">Tạo công việc</Link>
              </Button>
            </div>
          }
        />
      </>
    );
  }

  return (
    <>
      <PageHeader
        title="Dashboard"
        description="Tổng quan hoạt động và tiến độ trong tuần."
        actions={
          <>
            <Button variant="outline" asChild>
              <Link href="/meetings">Xem cuộc họp</Link>
            </Button>
            <Button asChild>
              <Link href="/tasks">Quản lý công việc</Link>
            </Button>
          </>
        }
      />

      {/* KPI */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {kpis.map((kpi) => {
          const Icon = kpi.icon;
          return (
            <Link
              key={kpi.label}
              href={kpi.href}
              className="rounded-2xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
            >
              <Card className="h-full bg-card/80 transition-shadow hover:shadow-lift">
                <CardHeader className="flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    {kpi.label}
                  </CardTitle>
                  <span
                    className={cn(
                      "flex h-9 w-9 items-center justify-center rounded-xl",
                      kpi.alert
                        ? "bg-coral-100 text-coral-700"
                        : "bg-lavender-200 text-lavender-800",
                    )}
                  >
                    <Icon className="h-4 w-4" />
                  </span>
                </CardHeader>
                <CardContent className="space-y-1">
                  <p className="text-3xl font-semibold tracking-tight">
                    {kpi.value}
                  </p>
                  <CardDescription>{kpi.hint}</CardDescription>
                </CardContent>
              </Card>
            </Link>
          );
        })}
      </div>

      {/* Biểu đồ */}
      <div className="grid gap-4 lg:grid-cols-5">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Tỷ lệ công việc theo trạng thái</CardTitle>
            <CardDescription>
              Trạng thái được tính theo hạn chót thực tế.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {tasks.length === 0 ? (
              <EmptyBlock message="Chưa có công việc nào để thống kê." />
            ) : (
              <StatusDonutChart data={statusData} />
            )}
          </CardContent>
        </Card>

        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle>Tỷ lệ hoàn thành theo bộ phận</CardTitle>
            <CardDescription>
              Phần trăm công việc đã hoàn thành trên tổng số của mỗi bộ phận.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {departmentData.length === 0 ? (
              <EmptyBlock message="Chưa có bộ phận nào trong hệ thống." />
            ) : (
              <DepartmentBarChart data={departmentData} />
            )}
          </CardContent>
        </Card>
      </div>

      {/* Khối lượng công việc theo người phụ trách */}
      <Card>
        <CardHeader className="flex-row flex-wrap items-center justify-between gap-3 space-y-0">
          <div className="space-y-1">
            <CardTitle>Khối lượng công việc theo người phụ trách</CardTitle>
            <CardDescription>
              Số việc đang giữ, tiến độ trung bình và số việc trễ hạn của từng
              người.
            </CardDescription>
          </div>
          <Button variant="soft" size="sm" asChild>
            <Link href="/settings">
              <Users />
              Quản lý nhân sự
            </Link>
          </Button>
        </CardHeader>
        <CardContent>
          {workloadRows.length === 0 ? (
            <EmptyBlock message="Chưa có nhân sự nào trong hệ thống." />
          ) : (
            <WorkloadTable rows={workloadRows} />
          )}
        </CardContent>
      </Card>

      <div className="grid gap-4 lg:grid-cols-2">
        {/* Cần chú ý ngay */}
        <Card>
          <CardHeader className="flex-row items-start justify-between gap-3 space-y-0">
            <div className="space-y-1">
              <CardTitle>Cần chú ý ngay</CardTitle>
              <CardDescription>
                {ATTENTION_LIMIT} công việc khẩn cấp nhất — đã trễ hoặc sắp đến
                hạn.
              </CardDescription>
            </div>
            <Button variant="soft" size="sm" asChild>
              <Link href="/reminders">
                Tất cả
                <ArrowRight />
              </Link>
            </Button>
          </CardHeader>
          <CardContent className="space-y-3">
            {attentionTasks.length === 0 ? (
              <EmptyBlock message="Không có công việc nào cần chú ý. Mọi thứ đang đúng tiến độ." />
            ) : (
              attentionTasks.map((task) => (
                <AttentionRow key={task.id} task={task} today={today} />
              ))
            )}
          </CardContent>
        </Card>

        {/* Cuộc họp gần nhất theo bộ phận */}
        <Card>
          <CardHeader className="flex-row items-start justify-between gap-3 space-y-0">
            <div className="space-y-1">
              <CardTitle>Cuộc họp gần nhất</CardTitle>
              <CardDescription>
                Buổi họp mới nhất của từng bộ phận.
              </CardDescription>
            </div>
            <Button variant="soft" size="sm" asChild>
              <Link href="/meetings">
                Tất cả
                <ArrowRight />
              </Link>
            </Button>
          </CardHeader>
          <CardContent className="space-y-3">
            {latestMeetings.length === 0 ? (
              <EmptyBlock message="Chưa có cuộc họp nào được ghi nhận." />
            ) : (
              latestMeetings.map(({ department, meeting }) => (
                <Link
                  key={department.id}
                  href="/meetings"
                  className="block rounded-2xl bg-background/70 p-4 transition-colors hover:bg-secondary/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge variant="default">{department.name}</Badge>
                    <Badge variant="outline">{formatDate(meeting.date)}</Badge>
                    {meeting.decisions.length > 0 ? (
                      <Badge variant="success">
                        {meeting.decisions.length} quyết định
                      </Badge>
                    ) : null}
                  </div>
                  <p className="mt-2 line-clamp-2 text-sm leading-relaxed">
                    {meeting.agenda}
                  </p>
                  <div className="mt-3">
                    <PersonCell personId={meeting.hostId} showRole />
                  </div>
                </Link>
              ))
            )}
          </CardContent>
        </Card>
      </div>
    </>
  );
}

function AttentionRow({ task, today }: { task: Task; today: Date }) {
  const { getDepartmentName } = useWeeklyReport();
  const diff = daysUntil(task.dueDate, today);
  const overdue = diff < 0;

  return (
    <Link
      href={`/tasks?assignee=${task.assigneeId}`}
      className={cn(
        "block rounded-2xl border-l-4 bg-background/70 p-4 transition-colors hover:bg-secondary/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
        overdue ? "border-l-coral-400" : "border-l-warning",
      )}
    >
      <div className="flex flex-wrap items-center gap-2">
        <Badge variant={overdue ? "danger" : "warning"}>
          {overdue
            ? `Trễ ${Math.abs(diff)} ngày`
            : diff === 0
              ? "Đến hạn hôm nay"
              : `Còn ${diff} ngày`}
        </Badge>
        <PriorityBadge priority={task.priority} />
        <Badge variant="secondary">
          {getDepartmentName(task.departmentId)}
        </Badge>
      </div>

      <p className="mt-2 font-medium leading-snug">{task.title}</p>

      <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
        <PersonCell personId={task.assigneeId} />
        <div className="flex items-center gap-3">
          <span className="text-xs font-semibold text-muted-foreground">
            {task.progress}%
          </span>
          <Progress value={task.progress} className="w-24" />
        </div>
      </div>
    </Link>
  );
}

function EmptyBlock({ message }: { message: string }) {
  return (
    <div className="flex min-h-[120px] items-center justify-center rounded-2xl border border-dashed border-border bg-background/60 px-4 py-8 text-center text-sm text-muted-foreground">
      {message}
    </div>
  );
}
