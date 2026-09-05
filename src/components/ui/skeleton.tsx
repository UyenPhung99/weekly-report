import { cn } from "@/lib/utils";

/** Khối giữ chỗ khi đang tải dữ liệu. */
function Skeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("animate-pulse rounded-xl bg-secondary/70", className)}
      {...props}
    />
  );
}

export { Skeleton };
