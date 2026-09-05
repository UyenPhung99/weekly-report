import { Badge } from "@/components/ui/badge";
import { getPriorityVariant, getStatusVariant } from "@/lib/task-utils";
import type { TaskPriority, TaskStatus } from "@/types";

export function StatusBadge({ status }: { status: TaskStatus }) {
  return <Badge variant={getStatusVariant(status)}>{status}</Badge>;
}

export function PriorityBadge({ priority }: { priority: TaskPriority }) {
  return <Badge variant={getPriorityVariant(priority)}>{priority}</Badge>;
}
