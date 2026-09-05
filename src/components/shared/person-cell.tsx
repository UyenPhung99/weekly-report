"use client";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useWeeklyReport } from "@/lib/store";
import { cn } from "@/lib/utils";
import type { ID } from "@/types";

type PersonCellProps = {
  personId: ID;
  /** Hiển thị tên bộ phận dưới tên người. */
  showDepartment?: boolean;
  /** Hiển thị vai trò thay cho bộ phận. */
  showRole?: boolean;
  className?: string;
};

/** Avatar + tên người phụ trách, dùng lại ở bảng công việc và danh sách họp. */
export function PersonCell({
  personId,
  showDepartment = false,
  showRole = false,
  className,
}: PersonCellProps) {
  const { getPerson, getDepartmentName } = useWeeklyReport();
  const person = getPerson(personId);

  if (!person) {
    return (
      <span className={cn("text-sm text-muted-foreground", className)}>
        Chưa phân công
      </span>
    );
  }

  const subtitle = showRole
    ? person.role
    : showDepartment
      ? getDepartmentName(person.departmentId)
      : null;

  return (
    <div className={cn("flex items-center gap-2.5", className)}>
      <Avatar className="h-8 w-8 border border-border">
        <AvatarFallback className="bg-lavender-200 text-xs text-lavender-800">
          {person.avatarInitials}
        </AvatarFallback>
      </Avatar>
      <div className="min-w-0">
        <p className="truncate text-sm font-medium leading-tight">
          {person.name}
        </p>
        {subtitle ? (
          <p className="truncate text-xs text-muted-foreground">{subtitle}</p>
        ) : null}
      </div>
    </div>
  );
}
