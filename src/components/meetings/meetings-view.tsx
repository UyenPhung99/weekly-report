"use client";

import * as React from "react";
import Link from "next/link";
import {
  CalendarDays,
  CalendarPlus,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

import { MeetingCard } from "@/components/meetings/meeting-card";
import { MeetingFormDialog } from "@/components/meetings/meeting-form-dialog";
import { PageHeader } from "@/components/layout/page-header";
import { PlaceholderPanel } from "@/components/layout/placeholder-panel";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  addDays,
  formatWeekRange,
  getWeekRange,
  isWithinWeek,
  toISODate,
} from "@/lib/date";
import { useWeeklyReport } from "@/lib/store";

const ALL_DEPARTMENTS = "all";

export function MeetingsView() {
  const { departments, people, meetings, today, getTasksByMeeting } =
    useWeeklyReport();

  const [weekReference, setWeekReference] = React.useState<Date>(today);
  const [departmentId, setDepartmentId] =
    React.useState<string>(ALL_DEPARTMENTS);

  const weekMeetings = React.useMemo(
    () =>
      meetings
        .filter((meeting) => isWithinWeek(meeting.date, weekReference))
        .filter(
          (meeting) =>
            departmentId === ALL_DEPARTMENTS ||
            meeting.departmentId === departmentId,
        )
        .sort((a, b) => a.date.localeCompare(b.date)),
    [meetings, weekReference, departmentId],
  );

  const groups = React.useMemo(
    () =>
      departments
        .map((department) => ({
          department,
          items: weekMeetings.filter(
            (meeting) => meeting.departmentId === department.id,
          ),
        }))
        .filter((group) => group.items.length > 0),
    [departments, weekMeetings],
  );

  const decisionCount = weekMeetings.reduce(
    (total, meeting) => total + meeting.decisions.length,
    0,
  );
  const taskCount = weekMeetings.reduce(
    (total, meeting) => total + getTasksByMeeting(meeting.id).length,
    0,
  );

  const isCurrentWeek =
    getWeekRange(weekReference).start.getTime() ===
    getWeekRange(today).start.getTime();

  return (
    <>
      <PageHeader
        title="Cuộc họp"
        description="Lịch họp theo tuần, biên bản và các quyết định của từng bộ phận."
        actions={
          <MeetingFormDialog
            defaultDate={toISODate(getWeekRange(weekReference).start)}
            trigger={
              <Button disabled={departments.length === 0 || people.length === 0}>
                <CalendarPlus />
                Tạo cuộc họp
              </Button>
            }
          />
        }
      />

      <Card>
        <CardContent className="flex flex-col gap-4 p-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-wrap items-center gap-2">
            <Button
              variant="outline"
              size="icon"
              onClick={() => setWeekReference((prev) => addDays(prev, -7))}
              aria-label="Tuần trước"
            >
              <ChevronLeft />
            </Button>
            <div className="min-w-[190px] text-center">
              <p className="text-sm font-semibold">
                {formatWeekRange(weekReference)}
              </p>
              <p className="text-xs text-muted-foreground">
                {isCurrentWeek ? "Tuần hiện tại" : "Tuần đã chọn"}
              </p>
            </div>
            <Button
              variant="outline"
              size="icon"
              onClick={() => setWeekReference((prev) => addDays(prev, 7))}
              aria-label="Tuần sau"
            >
              <ChevronRight />
            </Button>
            <Button
              variant="soft"
              size="sm"
              onClick={() => setWeekReference(today)}
              disabled={isCurrentWeek}
            >
              Tuần này
            </Button>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2">
              <Badge variant="info">{weekMeetings.length} cuộc họp</Badge>
              <Badge variant="success">{decisionCount} quyết định</Badge>
              <Badge variant="secondary">{taskCount} công việc</Badge>
            </div>
            <Select value={departmentId} onValueChange={setDepartmentId}>
              <SelectTrigger className="w-full bg-background sm:w-52">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={ALL_DEPARTMENTS}>Tất cả bộ phận</SelectItem>
                {departments.map((department) => (
                  <SelectItem key={department.id} value={department.id}>
                    {department.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {meetings.length === 0 ? (
        departments.length === 0 || people.length === 0 ? (
          <PlaceholderPanel
            icon={<CalendarDays className="h-6 w-6" />}
            title="Cần có bộ phận và nhân sự trước"
            description="Mỗi cuộc họp thuộc một bộ phận và có người chủ trì. Hãy khai báo dữ liệu này trong Cài đặt."
            action={
              <Button variant="soft" asChild>
                <Link href="/settings">Đi tới Cài đặt</Link>
              </Button>
            }
          />
        ) : (
          <PlaceholderPanel
            icon={<CalendarDays className="h-6 w-6" />}
            title="Chưa có cuộc họp nào"
            description="Ghi lại cuộc họp đầu tiên cùng agenda, ghi chú và các quyết định để bắt đầu theo dõi."
            action={
              <MeetingFormDialog
                defaultDate={toISODate(getWeekRange(weekReference).start)}
                trigger={
                  <Button variant="soft">
                    <CalendarPlus />
                    Tạo cuộc họp
                  </Button>
                }
              />
            }
          />
        )
      ) : groups.length === 0 ? (
        <PlaceholderPanel
          icon={<CalendarDays className="h-6 w-6" />}
          title="Không có cuộc họp nào trong tuần này"
          description="Chuyển sang tuần khác, đổi bộ lọc bộ phận, hoặc tạo một cuộc họp mới cho tuần đang xem."
          action={
            <Button variant="soft" onClick={() => setWeekReference(today)}>
              Về tuần hiện tại
            </Button>
          }
        />
      ) : (
        <div className="space-y-8">
          {groups.map(({ department, items }) => (
            <section key={department.id} className="space-y-3">
              <div className="flex items-center gap-3">
                <h3 className="text-lg font-semibold tracking-tight">
                  {department.name}
                </h3>
                <Badge variant="secondary">{items.length} cuộc họp</Badge>
              </div>
              <div className="grid gap-4 xl:grid-cols-2">
                {items.map((meeting) => (
                  <MeetingCard key={meeting.id} meeting={meeting} />
                ))}
              </div>
            </section>
          ))}
        </div>
      )}
    </>
  );
}
