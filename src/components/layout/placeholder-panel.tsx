import * as React from "react";

import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

type PlaceholderPanelProps = {
  icon: React.ReactNode;
  title: string;
  description: string;
  action?: React.ReactNode;
  className?: string;
};

/** Khung nội dung tạm thời cho các trang chưa có dữ liệu thật. */
export function PlaceholderPanel({
  icon,
  title,
  description,
  action,
  className,
}: PlaceholderPanelProps) {
  return (
    <Card className={cn("border-dashed bg-card/70", className)}>
      <CardContent className="flex flex-col items-center justify-center gap-3 px-6 py-16 text-center">
        <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-lavender-200 text-lavender-800">
          {icon}
        </span>
        <div className="space-y-1">
          <p className="text-base font-semibold">{title}</p>
          <p className="mx-auto max-w-md text-sm text-muted-foreground">
            {description}
          </p>
        </div>
        {action}
      </CardContent>
    </Card>
  );
}
