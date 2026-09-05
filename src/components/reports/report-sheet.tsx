import * as React from "react";

import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { formatDate } from "@/lib/date";
import type { WeeklyReportSummary } from "@/lib/report";
import { getStatusVariant } from "@/lib/task-utils";
import { cn } from "@/lib/utils";

/** Id dùng cho CSS in ấn (xem khối `@media print` trong globals.css). */
export const REPORT_SHEET_ID = "weekly-report-sheet";

/**
 * Bản xem trước của báo cáo — cũng chính là thứ được in ra PDF.
 * Chỉ nhận dữ liệu đã tổng hợp, không tự truy cập store.
 */
export function ReportSheet({ summary }: { summary: WeeklyReportSummary }) {
  const { taskTotals } = summary;

  const overview = [
    { label: "Cuộc họp", value: summary.meetingCount },
    { label: "Quyết định", value: summary.decisionCount },
    { label: "Công việc trong tuần", value: taskTotals.total },
    { label: "Hoàn thành", value: taskTotals.completed },
    { label: "Đang làm", value: taskTotals.inProgress },
    { label: "Trễ hạn", value: taskTotals.overdue },
  ];

  const allOverdue = [...summary.weekOverdue, ...summary.carriedOverOverdue];

  return (
    <article
      id={REPORT_SHEET_ID}
      className="rounded-2xl border border-border bg-background p-6 text-foreground shadow-card sm:p-8 print:rounded-none print:border-0 print:p-0 print:shadow-none"
    >
      {/* -------------------------------- Đầu báo cáo ------------------------------- */}
      <header className="border-b-2 border-lavender-300 pb-5">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-lavender-700">
          Weekly Report
        </p>
        <h2 className="mt-1 text-2xl font-semibold tracking-tight sm:text-3xl">
          Báo cáo tuần
        </h2>
        <dl className="mt-3 grid gap-x-8 gap-y-1 text-sm sm:grid-cols-2">
          <div className="flex gap-2">
            <dt className="text-muted-foreground">Kỳ báo cáo:</dt>
            <dd className="font-medium">{summary.weekLabel}</dd>
          </div>
          <div className="flex gap-2">
            <dt className="text-muted-foreground">Phạm vi:</dt>
            <dd className="font-medium">{summary.scopeLabel}</dd>
          </div>
          <div className="flex gap-2">
            <dt className="text-muted-foreground">Từ ngày:</dt>
            <dd className="font-medium">
              {formatDate(summary.rangeStart)} – {formatDate(summary.rangeEnd)}
            </dd>
          </div>
          <div className="flex gap-2">
            <dt className="text-muted-foreground">Ngày lập:</dt>
            <dd className="font-medium">{summary.generatedAtLabel}</dd>
          </div>
        </dl>
      </header>

      {/* --------------------------------- Tổng quan -------------------------------- */}
      <Section index={1} title="Tổng quan">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {overview.map((item) => (
            <div
              key={item.label}
              className="break-inside-avoid rounded-xl bg-card px-4 py-3"
            >
              <p className="text-xs text-muted-foreground">{item.label}</p>
              <p className="text-2xl font-semibold tracking-tight">
                {item.value}
              </p>
            </div>
          ))}
        </div>

        <div className="mt-4 space-y-2 rounded-xl bg-card px-4 py-3">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">
              Tỷ lệ hoàn thành công việc trong tuần
            </span>
            <span className="font-semibold">{taskTotals.completionRate}%</span>
          </div>
          <Progress value={taskTotals.completionRate} />
        </div>

        {summary.carriedOverOverdue.length > 0 ? (
          <p className="mt-3 text-sm text-coral-700">
            Còn {summary.carriedOverOverdue.length} công việc trễ hạn tồn từ các
            tuần trước chưa được xử lý.
          </p>
        ) : null}
      </Section>

      {/* --------------------------------- Cuộc họp --------------------------------- */}
      <Section index={2} title="Cuộc họp trong tuần">
        {summary.meetings.length === 0 ? (
          <EmptyLine text="Không có cuộc họp nào trong kỳ báo cáo." />
        ) : (
          <ol className="space-y-4">
            {summary.meetings.map((meeting, index) => (
              <li
                key={meeting.id}
                className="break-inside-avoid rounded-xl bg-card p-4"
              >
                <div className="flex flex-wrap items-center gap-2">
                  <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-lavender-300 text-xs font-semibold text-lavender-900">
                    {index + 1}
                  </span>
                  <span className="text-sm font-semibold">
                    {meeting.dateLabel}
                  </span>
                  <Badge variant="default">{meeting.departmentName}</Badge>
                  <span className="text-xs text-muted-foreground">
                    Chủ trì: {meeting.hostName}
                  </span>
                </div>

                <p className="mt-2.5 text-sm leading-relaxed">
                  <span className="font-medium">Nội dung: </span>
                  {meeting.agenda}
                </p>

                {meeting.notes ? (
                  <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
                    <span className="font-medium">Ghi chú: </span>
                    {meeting.notes}
                  </p>
                ) : null}

                {meeting.decisions.length > 0 ? (
                  <div className="mt-2.5">
                    <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                      Quyết định
                    </p>
                    <ul className="mt-1 space-y-1">
                      {meeting.decisions.map((decision, decisionIndex) => (
                        <li
                          key={decisionIndex}
                          className="flex gap-2 text-sm leading-relaxed"
                        >
                          <span className="mt-[7px] h-1.5 w-1.5 shrink-0 rounded-full bg-mint-400" />
                          <span>{decision}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ) : null}

                {meeting.tasks.length > 0 ? (
                  <div className="mt-2.5">
                    <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                      Công việc phát sinh
                    </p>
                    <ul className="mt-1.5 space-y-1.5">
                      {meeting.tasks.map((task, taskIndex) => (
                        <li
                          key={taskIndex}
                          className="flex flex-wrap items-center justify-between gap-2 text-sm"
                        >
                          <span>{task.title}</span>
                          <Badge variant={getStatusVariant(task.status)}>
                            {task.status}
                          </Badge>
                        </li>
                      ))}
                    </ul>
                  </div>
                ) : null}
              </li>
            ))}
          </ol>
        )}
      </Section>

      {/* ---------------------------- Công việc cần xử lý --------------------------- */}
      <Section index={3} title="Công việc cần xử lý">
        {allOverdue.length === 0 ? (
          <EmptyLine text="Không có công việc nào đang trễ hạn." />
        ) : (
          <div className="overflow-x-auto rounded-xl bg-card">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-border">
                  <ReportTh>Công việc</ReportTh>
                  <ReportTh>Người phụ trách</ReportTh>
                  <ReportTh>Hạn chót</ReportTh>
                  <ReportTh className="text-center">Trễ</ReportTh>
                  <ReportTh className="text-center">Tiến độ</ReportTh>
                </tr>
              </thead>
              <tbody>
                {allOverdue.map((task) => (
                  <tr
                    key={task.id}
                    className="break-inside-avoid border-b border-border/60 last:border-0"
                  >
                    <ReportTd className="font-medium">{task.title}</ReportTd>
                    <ReportTd>
                      <span className="block">{task.assigneeName}</span>
                      <span className="text-xs text-muted-foreground">
                        {task.departmentName}
                      </span>
                    </ReportTd>
                    <ReportTd>{formatDate(task.dueDate)}</ReportTd>
                    <ReportTd className="text-center">
                      <Badge variant="danger">{task.daysLate} ngày</Badge>
                    </ReportTd>
                    <ReportTd className="text-center font-semibold">
                      {task.progress}%
                    </ReportTd>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Section>

      {/* --------------------------- Theo người phụ trách --------------------------- */}
      <Section index={4} title="Hiệu suất theo người phụ trách">
        {summary.people.length === 0 ? (
          <EmptyLine text="Không có công việc nào được giao trong kỳ báo cáo." />
        ) : (
          <div className="overflow-x-auto rounded-xl bg-card">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-border">
                  <ReportTh>Người phụ trách</ReportTh>
                  <ReportTh>Bộ phận</ReportTh>
                  <ReportTh className="text-center">Tổng</ReportTh>
                  <ReportTh className="text-center">Hoàn thành</ReportTh>
                  <ReportTh className="text-center">Trễ</ReportTh>
                  <ReportTh className="min-w-[140px]">% hoàn thành</ReportTh>
                </tr>
              </thead>
              <tbody>
                {summary.people.map((row) => (
                  <tr
                    key={row.personId}
                    className="break-inside-avoid border-b border-border/60 last:border-0"
                  >
                    <ReportTd className="font-medium">{row.name}</ReportTd>
                    <ReportTd className="text-muted-foreground">
                      {row.departmentName}
                    </ReportTd>
                    <ReportTd className="text-center">{row.total}</ReportTd>
                    <ReportTd className="text-center">{row.completed}</ReportTd>
                    <ReportTd className="text-center">
                      {row.overdue > 0 ? (
                        <Badge variant="danger">{row.overdue}</Badge>
                      ) : (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </ReportTd>
                    <ReportTd>
                      <div className="flex items-center gap-2">
                        <Progress
                          value={row.completionRate}
                          className="h-2 flex-1"
                        />
                        <span className="w-10 text-right font-semibold">
                          {row.completionRate}%
                        </span>
                      </div>
                    </ReportTd>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Section>

      <footer className="mt-8 border-t border-border pt-4 text-xs text-muted-foreground">
        Báo cáo được tổng hợp tự động từ Weekly Report · {summary.weekLabel} ·{" "}
        {summary.scopeLabel}
      </footer>
    </article>
  );
}

function Section({
  index,
  title,
  children,
}: {
  index: number;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="mt-6">
      <h3 className="mb-3 flex items-center gap-2 text-base font-semibold tracking-tight">
        <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-lavender-200 text-xs font-semibold text-lavender-800">
          {index}
        </span>
        {title}
      </h3>
      {children}
    </section>
  );
}

function ReportTh({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <th
      className={cn(
        "px-4 py-2.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground",
        className,
      )}
    >
      {children}
    </th>
  );
}

function ReportTd({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return <td className={cn("px-4 py-3 align-top", className)}>{children}</td>;
}

function EmptyLine({ text }: { text: string }) {
  return (
    <p className="rounded-xl bg-card px-4 py-3 text-sm text-muted-foreground">
      {text}
    </p>
  );
}
