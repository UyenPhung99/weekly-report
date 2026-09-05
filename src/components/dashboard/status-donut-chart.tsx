"use client";

import * as React from "react";
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";

import { statusChartColor, statusSwatchClass } from "@/lib/chart";
import { cn } from "@/lib/utils";
import type { TaskStatus } from "@/types";

export type StatusDatum = {
  status: TaskStatus;
  value: number;
};

function DonutTooltip({
  active,
  payload,
  total,
}: {
  active?: boolean;
  payload?: Array<{ payload: StatusDatum }>;
  total: number;
}) {
  if (!active || !payload?.length) return null;
  const datum = payload[0].payload;
  const percent = total ? Math.round((datum.value / total) * 100) : 0;

  return (
    <div className="rounded-xl border border-border bg-popover px-3 py-2 shadow-lift">
      <p className="text-sm font-medium text-popover-foreground">
        {datum.status}
      </p>
      <p className="text-xs text-muted-foreground">
        {datum.value} công việc · {percent}%
      </p>
    </div>
  );
}

export function StatusDonutChart({ data }: { data: StatusDatum[] }) {
  const total = data.reduce((sum, item) => sum + item.value, 0);
  const visible = data.filter((item) => item.value > 0);

  return (
    <div className="space-y-4">
      <div className="relative h-[240px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={visible}
              dataKey="value"
              nameKey="status"
              innerRadius={62}
              outerRadius={94}
              paddingAngle={visible.length > 1 ? 2 : 0}
              stroke="hsl(var(--card))"
              strokeWidth={3}
            >
              {visible.map((item) => (
                <Cell
                  key={item.status}
                  fill={statusChartColor[item.status]}
                />
              ))}
            </Pie>
            <Tooltip
              content={<DonutTooltip total={total} />}
              cursor={false}
            />
          </PieChart>
        </ResponsiveContainer>

        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-3xl font-semibold tracking-tight">{total}</span>
          <span className="text-xs text-muted-foreground">công việc</span>
        </div>
      </div>

      <ul className="grid grid-cols-2 gap-2">
        {data.map((item) => (
          <li key={item.status} className="flex items-center gap-2 text-sm">
            <span
              className={cn(
                "h-2.5 w-2.5 shrink-0 rounded-full",
                statusSwatchClass[item.status],
              )}
            />
            <span className="truncate text-muted-foreground">
              {item.status}
            </span>
            <span className="ml-auto font-semibold">{item.value}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
