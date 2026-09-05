"use client";

import * as React from "react";
import Link from "next/link";
import {
  ChevronLeft,
  ChevronRight,
  Copy,
  FileText,
  Printer,
} from "lucide-react";

import { PageHeader } from "@/components/layout/page-header";
import { PlaceholderPanel } from "@/components/layout/placeholder-panel";
import { ReportSheet } from "@/components/reports/report-sheet";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/components/ui/toast";
import { addDays, formatWeekRange, getWeekRange } from "@/lib/date";
import {
  ALL_DEPARTMENTS,
  buildReportText,
  buildWeeklyReport,
} from "@/lib/report";
import { useWeeklyReport } from "@/lib/store";

type PreviewMode = "sheet" | "text";

export function ReportsView() {
  const { departments, people, meetings, tasks, today } = useWeeklyReport();
  const { toast } = useToast();

  const [weekReference, setWeekReference] = React.useState<Date>(today);
  const [departmentId, setDepartmentId] =
    React.useState<string>(ALL_DEPARTMENTS);
  const [mode, setMode] = React.useState<PreviewMode>("sheet");

  const summary = React.useMemo(
    () =>
      buildWeeklyReport(
        { departments, people, meetings, tasks },
        { weekReference, departmentId, today },
      ),
    [departments, people, meetings, tasks, weekReference, departmentId, today],
  );

  const reportText = React.useMemo(
    () => buildReportText(summary),
    [summary],
  );

  const isCurrentWeek =
    getWeekRange(weekReference).start.getTime() ===
    getWeekRange(today).start.getTime();

  /* --------------------------------- Xuất PDF -------------------------------- */

  /**
   * Xuất PDF bằng hộp thoại in của trình duyệt ("Lưu dưới dạng PDF").
   * Cách này giữ nguyên chữ vector, dấu tiếng Việt và đúng màu pastel — mọi
   * thành phần khác của app đã được ẩn bằng biến thể `print:` của Tailwind.
   */
  const handleExportPdf = () => {
    // Luôn in bản trình bày, kể cả khi đang xem tab text.
    setMode("sheet");
    window.setTimeout(() => window.print(), 80);
  };

  /* ------------------------------ Sao chép text ------------------------------ */

  const textRef = React.useRef<HTMLPreElement>(null);

  /** Bôi đen sẵn toàn bộ bản text để người dùng chỉ cần nhấn Ctrl+C. */
  const selectReportText = () => {
    const node = textRef.current;
    if (!node) return;
    const range = document.createRange();
    range.selectNodeContents(node);
    const selection = window.getSelection();
    selection?.removeAllRanges();
    selection?.addRange(range);
  };

  const handleCopy = async () => {
    const showSuccess = () =>
      toast({
        title: "Đã sao chép báo cáo",
        description:
          "Nội dung đã sẵn trong clipboard, dán vào email/Zalo/Slack.",
      });

    try {
      await navigator.clipboard.writeText(reportText);
      showSuccess();
      return;
    } catch {
      // Clipboard API bị chặn (trang không chạy HTTPS, hoặc tab chưa được focus).
      const textarea = document.createElement("textarea");
      textarea.value = reportText;
      textarea.setAttribute("readonly", "");
      textarea.style.position = "fixed";
      textarea.style.opacity = "0";
      document.body.appendChild(textarea);
      textarea.select();
      const copied = document.execCommand("copy");
      document.body.removeChild(textarea);

      if (copied) {
        showSuccess();
        return;
      }
    }

    // Không tự sao chép được: mở tab text và bôi đen sẵn để người dùng tự copy.
    setMode("text");
    window.setTimeout(selectReportText, 80);
    toast({
      title: "Trình duyệt chặn sao chép tự động",
      description: "Nội dung đã được bôi đen sẵn — nhấn Ctrl+C để sao chép.",
      variant: "danger",
    });
  };

  return (
    <>
      <div className="print:hidden">
        <PageHeader
          title="Báo cáo tuần"
          description="Tự động tổng hợp cuộc họp, công việc và hiệu suất của tuần đã chọn."
          actions={
            <>
              <Button
                variant="outline"
                onClick={handleCopy}
                disabled={summary.isEmpty}
              >
                <Copy />
                Sao chép nội dung
              </Button>
              <Button onClick={handleExportPdf} disabled={summary.isEmpty}>
                <Printer />
                Xuất PDF
              </Button>
            </>
          }
        />
      </div>

      {/* ------------------------------ Bộ điều khiển ----------------------------- */}
      <Card className="print:hidden">
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
            <Tabs
              value={mode}
              onValueChange={(value) => setMode(value as PreviewMode)}
            >
              <TabsList className="h-10">
                <TabsTrigger value="sheet">Bản trình bày</TabsTrigger>
                <TabsTrigger value="text">Bản text</TabsTrigger>
              </TabsList>
            </Tabs>

            <Select value={departmentId} onValueChange={setDepartmentId}>
              <SelectTrigger className="w-full bg-background sm:w-52">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={ALL_DEPARTMENTS}>Toàn công ty</SelectItem>
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

      {/* -------------------------------- Xem trước ------------------------------- */}
      {summary.isEmpty ? (
        <PlaceholderPanel
          className="print:hidden"
          icon={<FileText className="h-6 w-6" />}
          title="Tuần này chưa có dữ liệu để tổng hợp"
          description="Không có cuộc họp nào và cũng không có công việc nào đến hạn trong tuần đã chọn. Hãy đổi tuần, đổi bộ phận, hoặc bổ sung dữ liệu."
          action={
            <div className="flex flex-wrap justify-center gap-2">
              {!isCurrentWeek ? (
                <Button variant="soft" onClick={() => setWeekReference(today)}>
                  Về tuần hiện tại
                </Button>
              ) : null}
              <Button variant="outline" asChild>
                <Link href="/meetings">Xem cuộc họp</Link>
              </Button>
            </div>
          }
        />
      ) : mode === "sheet" ? (
        <ReportSheet summary={summary} />
      ) : (
        <Card className="print:hidden">
          <CardContent className="p-4 sm:p-6">
            <p className="mb-3 text-sm text-muted-foreground">
              Đây chính là nội dung được sao chép — định dạng text thuần, dán
              thẳng vào email, Zalo hoặc Slack.
            </p>
            <pre
              ref={textRef}
              className="max-h-[70vh] overflow-auto whitespace-pre-wrap rounded-xl bg-background p-4 font-mono text-xs leading-relaxed text-foreground"
            >
              {reportText}
            </pre>
          </CardContent>
        </Card>
      )}
    </>
  );
}
