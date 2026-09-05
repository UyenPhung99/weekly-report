"use client";

import * as React from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { CalendarClock, ListChecks, Plus, RotateCcw } from "lucide-react";

import { PageHeader } from "@/components/layout/page-header";
import { PlaceholderPanel } from "@/components/layout/placeholder-panel";
import { PersonCell } from "@/components/shared/person-cell";
import { PriorityBadge } from "@/components/shared/task-badges";
import { TaskFormDialog } from "@/components/tasks/task-form-dialog";
import { TaskRowActions } from "@/components/tasks/task-row-actions";
import { TaskStatusMenu } from "@/components/tasks/task-status-menu";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatDate, formatDueLabel } from "@/lib/date";
import { useWeeklyReport } from "@/lib/store";
import {
  getEffectiveStatus,
  getProgressBarClass,
  isOverdue,
} from "@/lib/task-utils";
import { cn } from "@/lib/utils";
import { TASK_STATUSES, type Task } from "@/types";

const ALL = "all";

type Filters = {
  departmentId: string;
  assigneeId: string;
  status: string;
  dueFrom: string;
  dueTo: string;
};

const EMPTY_FILTERS: Filters = {
  departmentId: ALL,
  assigneeId: ALL,
  status: ALL,
  dueFrom: "",
  dueTo: "",
};

export function TasksView() {
  const {
    departments,
    people,
    tasks,
    today,
    getDepartmentName,
    getMeeting,
    getPeopleByDepartment,
  } = useWeeklyReport();

  // Cho phép nhảy từ Dashboard sang với bộ lọc dựng sẵn,
  // ví dụ /tasks?assignee=p-02 hoặc /tasks?status=Trễ hạn
  const searchParams = useSearchParams();
  const [filters, setFilters] = React.useState<Filters>(() => ({
    ...EMPTY_FILTERS,
    departmentId: searchParams.get("department") ?? ALL,
    assigneeId: searchParams.get("assignee") ?? ALL,
    status: searchParams.get("status") ?? ALL,
  }));

  const assigneeOptions =
    filters.departmentId === ALL
      ? getPeopleByDepartment()
      : getPeopleByDepartment(filters.departmentId);

  const setFilter = <K extends keyof Filters>(key: K, value: Filters[K]) =>
    setFilters((prev) => {
      const next = { ...prev, [key]: value };
      // Đổi bộ phận thì bỏ chọn người phụ trách không còn thuộc bộ phận đó.
      if (key === "departmentId" && prev.assigneeId !== ALL) {
        const stillValid = getPeopleByDepartment(
          value === ALL ? undefined : (value as string),
        ).some((person) => person.id === prev.assigneeId);
        if (!stillValid) next.assigneeId = ALL;
      }
      return next;
    });

  const filteredTasks = React.useMemo(() => {
    return tasks
      .filter((task) => {
        if (
          filters.departmentId !== ALL &&
          task.departmentId !== filters.departmentId
        ) {
          return false;
        }
        if (filters.assigneeId !== ALL && task.assigneeId !== filters.assigneeId) {
          return false;
        }
        if (
          filters.status !== ALL &&
          getEffectiveStatus(task, today) !== filters.status
        ) {
          return false;
        }
        if (filters.dueFrom && task.dueDate < filters.dueFrom) return false;
        if (filters.dueTo && task.dueDate > filters.dueTo) return false;
        return true;
      })
      .sort((a, b) => a.dueDate.localeCompare(b.dueDate));
  }, [tasks, filters, today]);

  const counts = React.useMemo(() => {
    const summary = {
      total: filteredTasks.length,
      doing: 0,
      done: 0,
      overdue: 0,
    };
    for (const task of filteredTasks) {
      const status = getEffectiveStatus(task, today);
      if (status === "Đang làm") summary.doing += 1;
      if (status === "Hoàn thành") summary.done += 1;
      if (status === "Trễ hạn") summary.overdue += 1;
    }
    return summary;
  }, [filteredTasks, today]);

  const hasActiveFilters =
    JSON.stringify(filters) !== JSON.stringify(EMPTY_FILTERS);

  const renderDueDate = (task: Task) => {
    const overdue = isOverdue(task, today);
    return (
      <div className="space-y-0.5">
        <p className="text-sm font-medium">{formatDate(task.dueDate)}</p>
        <p
          className={cn(
            "text-xs",
            overdue ? "font-medium text-coral-600" : "text-muted-foreground",
          )}
        >
          {task.status === "Hoàn thành"
            ? "Đã hoàn thành"
            : formatDueLabel(task.dueDate, today)}
        </p>
      </div>
    );
  };

  const renderProgress = (task: Task) => {
    const status = getEffectiveStatus(task, today);
    return (
      <div className="w-full min-w-[110px] space-y-1.5">
        <div className="flex items-center justify-between text-xs">
          <span className="text-muted-foreground">Tiến độ</span>
          <span className="font-semibold">{task.progress}%</span>
        </div>
        <Progress value={task.progress} className={getProgressBarClass(status)} />
      </div>
    );
  };

  return (
    <>
      <PageHeader
        title="Công việc"
        description="Toàn bộ đầu việc của các bộ phận, kèm trạng thái và tiến độ."
        actions={
          <TaskFormDialog
            trigger={
              <Button disabled={departments.length === 0 || people.length === 0}>
                <Plus />
                Thêm công việc
              </Button>
            }
          />
        }
      />

      <Card>
        <CardContent className="space-y-4 p-4">
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-5">
            <div className="space-y-1.5">
              <Label>Bộ phận</Label>
              <Select
                value={filters.departmentId}
                onValueChange={(value) => setFilter("departmentId", value)}
              >
                <SelectTrigger className="bg-background">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={ALL}>Tất cả bộ phận</SelectItem>
                  {departments.map((department) => (
                    <SelectItem key={department.id} value={department.id}>
                      {department.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label>Người phụ trách</Label>
              <Select
                value={filters.assigneeId}
                onValueChange={(value) => setFilter("assigneeId", value)}
              >
                <SelectTrigger className="bg-background">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={ALL}>Tất cả nhân sự</SelectItem>
                  {assigneeOptions.map((person) => (
                    <SelectItem key={person.id} value={person.id}>
                      {person.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label>Trạng thái</Label>
              <Select
                value={filters.status}
                onValueChange={(value) => setFilter("status", value)}
              >
                <SelectTrigger className="bg-background">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={ALL}>Tất cả trạng thái</SelectItem>
                  {TASK_STATUSES.map((status) => (
                    <SelectItem key={status} value={status}>
                      {status}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="filter-due-from">Hạn chót từ</Label>
              <Input
                id="filter-due-from"
                type="date"
                value={filters.dueFrom}
                onChange={(event) => setFilter("dueFrom", event.target.value)}
                className="bg-background"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="filter-due-to">Hạn chót đến</Label>
              <Input
                id="filter-due-to"
                type="date"
                value={filters.dueTo}
                onChange={(event) => setFilter("dueTo", event.target.value)}
                className="bg-background"
              />
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="secondary">{counts.total} công việc</Badge>
              <Badge variant="info">{counts.doing} đang làm</Badge>
              <Badge variant="success">{counts.done} hoàn thành</Badge>
              <Badge variant="danger">{counts.overdue} trễ hạn</Badge>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setFilters(EMPTY_FILTERS)}
              disabled={!hasActiveFilters}
            >
              <RotateCcw />
              Xoá bộ lọc
            </Button>
          </div>
        </CardContent>
      </Card>

      {tasks.length === 0 ? (
        departments.length === 0 || people.length === 0 ? (
          <PlaceholderPanel
            icon={<ListChecks className="h-6 w-6" />}
            title="Cần có bộ phận và nhân sự trước"
            description="Công việc phải được giao cho một người thuộc một bộ phận. Hãy khai báo dữ liệu này trong Cài đặt."
            action={
              <Button variant="soft" asChild>
                <Link href="/settings">Đi tới Cài đặt</Link>
              </Button>
            }
          />
        ) : (
          <PlaceholderPanel
            icon={<ListChecks className="h-6 w-6" />}
            title="Chưa có công việc nào"
            description="Tạo công việc đầu tiên và giao cho người phụ trách, hoặc tạo nhanh từ một cuộc họp."
            action={
              <TaskFormDialog
                trigger={
                  <Button variant="soft">
                    <Plus />
                    Thêm công việc
                  </Button>
                }
              />
            }
          />
        )
      ) : filteredTasks.length === 0 ? (
        <PlaceholderPanel
          icon={<ListChecks className="h-6 w-6" />}
          title="Không có công việc nào khớp bộ lọc"
          description="Thử nới rộng khoảng thời gian hoặc bỏ bớt điều kiện lọc để xem thêm công việc."
          action={
            <Button variant="soft" onClick={() => setFilters(EMPTY_FILTERS)}>
              Xoá bộ lọc
            </Button>
          }
        />
      ) : (
        <>
          {/* Bảng — từ màn hình lớn */}
          <Card className="hidden lg:block">
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead className="min-w-[260px]">Công việc</TableHead>
                  <TableHead className="min-w-[180px]">Người phụ trách</TableHead>
                  <TableHead>Hạn chót</TableHead>
                  <TableHead>Ưu tiên</TableHead>
                  <TableHead>Trạng thái</TableHead>
                  <TableHead className="min-w-[150px]">Tiến độ</TableHead>
                  <TableHead className="text-right">Thao tác</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTasks.map((task) => {
                  const meeting = getMeeting(task.meetingId);
                  return (
                    <TableRow key={task.id}>
                      <TableCell className="align-top">
                        <div className="space-y-1">
                          <p className="font-medium leading-snug">
                            {task.title}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {getDepartmentName(task.departmentId)}
                            {meeting
                              ? ` · Từ họp ${formatDate(meeting.date)}`
                              : ""}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell className="align-top">
                        <PersonCell personId={task.assigneeId} />
                      </TableCell>
                      <TableCell className="align-top">
                        {renderDueDate(task)}
                      </TableCell>
                      <TableCell className="align-top">
                        <PriorityBadge priority={task.priority} />
                      </TableCell>
                      <TableCell className="align-top">
                        <TaskStatusMenu task={task} />
                      </TableCell>
                      <TableCell className="align-top">
                        {renderProgress(task)}
                      </TableCell>
                      <TableCell className="align-top text-right">
                        <TaskRowActions task={task} />
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </Card>

          {/* Danh sách thẻ — tablet & mobile */}
          <div className="grid gap-4 md:grid-cols-2 lg:hidden">
            {filteredTasks.map((task) => {
              const meeting = getMeeting(task.meetingId);
              return (
                <Card key={task.id}>
                  <CardContent className="space-y-4 p-5">
                    <div className="flex items-start justify-between gap-3">
                      <div className="space-y-1">
                        <p className="font-medium leading-snug">{task.title}</p>
                        <p className="text-xs text-muted-foreground">
                          {getDepartmentName(task.departmentId)}
                          {meeting ? ` · Từ họp ${formatDate(meeting.date)}` : ""}
                        </p>
                      </div>
                      <TaskRowActions task={task} />
                    </div>

                    <PersonCell personId={task.assigneeId} />

                    <div className="flex flex-wrap items-center gap-2">
                      <TaskStatusMenu task={task} />
                      <PriorityBadge priority={task.priority} />
                      <Badge variant="outline" className="gap-1">
                        <CalendarClock className="h-3 w-3" />
                        {formatDate(task.dueDate)}
                      </Badge>
                    </div>

                    <p
                      className={cn(
                        "text-xs",
                        isOverdue(task, today)
                          ? "font-medium text-coral-600"
                          : "text-muted-foreground",
                      )}
                    >
                      {task.status === "Hoàn thành"
                        ? "Đã hoàn thành"
                        : formatDueLabel(task.dueDate, today)}
                    </p>

                    {renderProgress(task)}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </>
      )}
    </>
  );
}
