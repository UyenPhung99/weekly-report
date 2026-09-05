import type { Metadata } from "next";
import { Suspense } from "react";

import { TasksSkeleton } from "@/components/shared/page-skeletons";
import { TasksView } from "@/components/tasks/tasks-view";

export const metadata: Metadata = { title: "Công việc" };

export default function TasksPage() {
  // TasksView đọc query param (?assignee=, ?status=…) nên cần Suspense boundary.
  return (
    <Suspense fallback={<TasksSkeleton />}>
      <TasksView />
    </Suspense>
  );
}
