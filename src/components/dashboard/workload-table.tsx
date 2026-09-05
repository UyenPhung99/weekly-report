"use client";

import * as React from "react";

import { PersonCell } from "@/components/shared/person-cell";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";
import type { ID } from "@/types";

export type WorkloadRow = {
  personId: ID;
  departmentName: string;
  openCount: number;
  totalCount: number;
  overdueCount: number;
  averageProgress: number;
};

/** Ngưỡng coi là quá tải: nhiều việc đang giữ hoặc có việc trễ hạn. */
const OVERLOAD_OPEN_TASKS = 4;

export function WorkloadTable({ rows }: { rows: WorkloadRow[] }) {
  return (
    <>
      {/* Bảng — từ màn hình lớn */}
      <div className="hidden lg:block">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead className="min-w-[200px]">Người phụ trách</TableHead>
              <TableHead>Bộ phận</TableHead>
              <TableHead className="text-center">Đang giữ</TableHead>
              <TableHead className="min-w-[170px]">Tiến độ trung bình</TableHead>
              <TableHead className="text-center">Trễ hạn</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((row) => (
              <TableRow key={row.personId}>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <PersonCell personId={row.personId} />
                    {row.openCount >= OVERLOAD_OPEN_TASKS ||
                    row.overdueCount >= 2 ? (
                      <Badge variant="warning">Quá tải</Badge>
                    ) : null}
                  </div>
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  {row.departmentName}
                </TableCell>
                <TableCell className="text-center">
                  <span className="text-sm font-semibold">{row.openCount}</span>
                  <span className="text-xs text-muted-foreground">
                    /{row.totalCount}
                  </span>
                </TableCell>
                <TableCell>
                  <ProgressCell value={row.averageProgress} />
                </TableCell>
                <TableCell className="text-center">
                  {row.overdueCount > 0 ? (
                    <Badge variant="danger">{row.overdueCount}</Badge>
                  ) : (
                    <span className="text-sm text-muted-foreground">—</span>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Danh sách thẻ — tablet & mobile */}
      <div className="space-y-3 lg:hidden">
        {rows.map((row) => (
          <div
            key={row.personId}
            className="space-y-3 rounded-2xl bg-background/70 p-4"
          >
            <div className="flex flex-wrap items-center justify-between gap-2">
              <PersonCell personId={row.personId} showDepartment />
              <div className="flex items-center gap-2">
                {row.overdueCount > 0 ? (
                  <Badge variant="danger">{row.overdueCount} trễ hạn</Badge>
                ) : null}
                {row.openCount >= OVERLOAD_OPEN_TASKS ||
                row.overdueCount >= 2 ? (
                  <Badge variant="warning">Quá tải</Badge>
                ) : null}
              </div>
            </div>
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>
                Đang giữ{" "}
                <span className="font-semibold text-foreground">
                  {row.openCount}
                </span>
                /{row.totalCount} công việc
              </span>
            </div>
            <ProgressCell value={row.averageProgress} />
          </div>
        ))}
      </div>
    </>
  );
}

function ProgressCell({ value }: { value: number }) {
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between text-xs">
        <span className="text-muted-foreground">Trung bình</span>
        <span className="font-semibold">{value}%</span>
      </div>
      <Progress
        value={value}
        className={cn(value >= 80 && "[&>div]:bg-mint-400")}
      />
    </div>
  );
}
