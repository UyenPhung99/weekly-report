"use client";

import * as React from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { chartColors } from "@/lib/chart";

export type DepartmentDatum = {
  name: string;
  percent: number;
  done: number;
  total: number;
};

function BarTooltip({
  active,
  payload,
}: {
  active?: boolean;
  payload?: Array<{ payload: DepartmentDatum }>;
}) {
  if (!active || !payload?.length) return null;
  const datum = payload[0].payload;

  return (
    <div className="rounded-xl border border-border bg-popover px-3 py-2 shadow-lift">
      <p className="text-sm font-medium text-popover-foreground">
        {datum.name}
      </p>
      <p className="text-xs text-muted-foreground">
        Hoàn thành {datum.done}/{datum.total} công việc · {datum.percent}%
      </p>
    </div>
  );
}

export function DepartmentBarChart({ data }: { data: DepartmentDatum[] }) {
  return (
    <div className="h-[260px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={data}
          margin={{ top: 8, right: 8, bottom: 0, left: -18 }}
          barCategoryGap="30%"
        >
          <CartesianGrid
            vertical={false}
            stroke={chartColors.grid}
            strokeDasharray="4 4"
          />
          <XAxis
            dataKey="name"
            tickLine={false}
            axisLine={false}
            tick={{ fill: chartColors.axis, fontSize: 12 }}
            interval={0}
          />
          <YAxis
            domain={[0, 100]}
            ticks={[0, 25, 50, 75, 100]}
            tickFormatter={(value: number) => `${value}%`}
            tickLine={false}
            axisLine={false}
            tick={{ fill: chartColors.axis, fontSize: 12 }}
            width={52}
          />
          <Tooltip
            content={<BarTooltip />}
            cursor={{ fill: "hsl(var(--secondary) / 0.5)" }}
          />
          <Bar
            dataKey="percent"
            fill={chartColors.inProgress}
            radius={[10, 10, 6, 6]}
            maxBarSize={56}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
