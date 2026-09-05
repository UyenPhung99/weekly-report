import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

/** Khối tiêu đề trang đang tải. */
function HeaderSkeleton({ withActions = true }: { withActions?: boolean }) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="space-y-2">
        <Skeleton className="h-7 w-44" />
        <Skeleton className="h-4 w-64 max-w-full" />
      </div>
      {withActions ? (
        <div className="flex gap-2">
          <Skeleton className="h-10 w-32 rounded-xl" />
          <Skeleton className="h-10 w-28 rounded-xl" />
        </div>
      ) : null}
    </div>
  );
}

function StatCardsSkeleton({ count = 4 }: { count?: number }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {Array.from({ length: count }).map((_, index) => (
        <Card key={index} className="bg-card/80">
          <CardHeader className="flex-row items-center justify-between space-y-0 pb-2">
            <Skeleton className="h-4 w-28" />
            <Skeleton className="h-9 w-9 rounded-xl" />
          </CardHeader>
          <CardContent className="space-y-2">
            <Skeleton className="h-8 w-16" />
            <Skeleton className="h-4 w-32" />
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

function RowsSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: rows }).map((_, index) => (
        <div
          key={index}
          className="flex items-center gap-4 rounded-2xl bg-background/70 p-4"
        >
          <Skeleton className="h-9 w-9 shrink-0 rounded-full" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-2/3" />
            <Skeleton className="h-3 w-1/3" />
          </div>
          <Skeleton className="hidden h-6 w-24 rounded-full sm:block" />
        </div>
      ))}
    </div>
  );
}

export function DashboardSkeleton() {
  return (
    <>
      <HeaderSkeleton />
      <StatCardsSkeleton />
      <div className="grid gap-4 lg:grid-cols-5">
        <Card className="lg:col-span-2">
          <CardHeader className="space-y-2">
            <Skeleton className="h-5 w-52" />
            <Skeleton className="h-4 w-40" />
          </CardHeader>
          <CardContent>
            <Skeleton className="mx-auto h-[240px] w-[240px] rounded-full" />
          </CardContent>
        </Card>
        <Card className="lg:col-span-3">
          <CardHeader className="space-y-2">
            <Skeleton className="h-5 w-56" />
            <Skeleton className="h-4 w-64 max-w-full" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-[260px] w-full rounded-2xl" />
          </CardContent>
        </Card>
      </div>
      <Card>
        <CardHeader className="space-y-2">
          <Skeleton className="h-5 w-72 max-w-full" />
          <Skeleton className="h-4 w-80 max-w-full" />
        </CardHeader>
        <CardContent>
          <RowsSkeleton rows={4} />
        </CardContent>
      </Card>
    </>
  );
}

export function MeetingsSkeleton() {
  return (
    <>
      <HeaderSkeleton withActions={false} />
      <Card>
        <CardContent className="flex flex-col gap-4 p-4 lg:flex-row lg:items-center lg:justify-between">
          <Skeleton className="h-10 w-72 max-w-full rounded-xl" />
          <Skeleton className="h-10 w-52 max-w-full rounded-xl" />
        </CardContent>
      </Card>
      <div className="grid gap-4 xl:grid-cols-2">
        {Array.from({ length: 4 }).map((_, index) => (
          <Card key={index}>
            <CardHeader className="space-y-3">
              <div className="flex items-center justify-between gap-3">
                <Skeleton className="h-6 w-32 rounded-full" />
                <Skeleton className="h-9 w-36 rounded-xl" />
              </div>
              <Skeleton className="h-4 w-40" />
            </CardHeader>
            <CardContent className="space-y-3">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-5/6" />
              <Skeleton className="h-4 w-2/3" />
            </CardContent>
          </Card>
        ))}
      </div>
    </>
  );
}

export function TasksSkeleton() {
  return (
    <>
      <HeaderSkeleton withActions={false} />
      <Card>
        <CardContent className="space-y-4 p-4">
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-5">
            {Array.from({ length: 5 }).map((_, index) => (
              <div key={index} className="space-y-1.5">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-10 w-full rounded-xl" />
              </div>
            ))}
          </div>
          <Skeleton className="h-6 w-64 max-w-full rounded-full" />
        </CardContent>
      </Card>
      <Card>
        <CardContent className="p-4">
          <RowsSkeleton rows={6} />
        </CardContent>
      </Card>
    </>
  );
}

export function RemindersSkeleton() {
  return (
    <>
      <HeaderSkeleton withActions={false} />
      <StatCardsSkeleton count={3} />
      <Skeleton className="h-11 w-80 max-w-full rounded-2xl" />
      <Card>
        <CardContent className="p-4">
          <RowsSkeleton rows={5} />
        </CardContent>
      </Card>
    </>
  );
}

export function ReportsSkeleton() {
  return (
    <>
      <HeaderSkeleton />
      <Card>
        <CardContent className="flex flex-col gap-4 p-4 lg:flex-row lg:items-center lg:justify-between">
          <Skeleton className="h-10 w-72 max-w-full rounded-xl" />
          <Skeleton className="h-10 w-64 max-w-full rounded-xl" />
        </CardContent>
      </Card>
      <Card>
        <CardContent className="space-y-6 p-6">
          <div className="space-y-2 border-b border-border pb-5">
            <Skeleton className="h-4 w-28" />
            <Skeleton className="h-8 w-56" />
            <Skeleton className="h-4 w-72 max-w-full" />
          </div>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {Array.from({ length: 6 }).map((_, index) => (
              <Skeleton key={index} className="h-[72px] w-full rounded-xl" />
            ))}
          </div>
          <RowsSkeleton rows={3} />
        </CardContent>
      </Card>
    </>
  );
}

export function SettingsSkeleton() {
  return (
    <>
      <HeaderSkeleton withActions={false} />
      <Skeleton className="h-11 w-64 max-w-full rounded-2xl" />
      <Card>
        <CardHeader className="space-y-2">
          <Skeleton className="h-5 w-48" />
          <Skeleton className="h-4 w-72 max-w-full" />
        </CardHeader>
        <CardContent>
          <RowsSkeleton rows={5} />
        </CardContent>
      </Card>
    </>
  );
}
