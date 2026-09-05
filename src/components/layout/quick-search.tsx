"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { CalendarDays, ListChecks, Search, User } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { formatDate } from "@/lib/date";
import { useWeeklyReport } from "@/lib/store";
import { cn } from "@/lib/utils";

const RESULT_LIMIT = 6;

type Result = {
  id: string;
  group: "Công việc" | "Cuộc họp" | "Nhân sự";
  title: string;
  subtitle: string;
  href: string;
  icon: typeof ListChecks;
};

/** Bỏ dấu tiếng Việt để tìm kiếm không phụ thuộc dấu. */
function normalize(value: string): string {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/đ/g, "d");
}

function useSearchResults(query: string): Result[] {
  const { tasks, meetings, people, getDepartmentName } = useWeeklyReport();

  return React.useMemo(() => {
    const needle = normalize(query.trim());
    if (needle.length < 2) return [];

    const taskResults: Result[] = tasks
      .filter((task) => normalize(task.title).includes(needle))
      .slice(0, RESULT_LIMIT)
      .map((task) => ({
        id: `task-${task.id}`,
        group: "Công việc",
        title: task.title,
        subtitle: `${getDepartmentName(task.departmentId)} · hạn ${formatDate(task.dueDate)}`,
        href: `/tasks?assignee=${task.assigneeId}`,
        icon: ListChecks,
      }));

    const meetingResults: Result[] = meetings
      .filter((meeting) => normalize(meeting.agenda).includes(needle))
      .slice(0, RESULT_LIMIT)
      .map((meeting) => ({
        id: `meeting-${meeting.id}`,
        group: "Cuộc họp",
        title: meeting.agenda,
        subtitle: `${getDepartmentName(meeting.departmentId)} · ${formatDate(meeting.date)}`,
        href: "/meetings",
        icon: CalendarDays,
      }));

    const peopleResults: Result[] = people
      .filter((person) => normalize(person.name).includes(needle))
      .slice(0, RESULT_LIMIT)
      .map((person) => ({
        id: `person-${person.id}`,
        group: "Nhân sự",
        title: person.name,
        subtitle: `${getDepartmentName(person.departmentId)} · ${person.role}`,
        href: `/tasks?assignee=${person.id}`,
        icon: User,
      }));

    return [...taskResults, ...meetingResults, ...peopleResults];
  }, [query, tasks, meetings, people, getDepartmentName]);
}

function ResultList({
  results,
  query,
  onSelect,
  className,
}: {
  results: Result[];
  query: string;
  onSelect: (href: string) => void;
  className?: string;
}) {
  if (query.trim().length < 2) {
    return (
      <p className={cn("px-3 py-6 text-center text-sm text-muted-foreground", className)}>
        Nhập ít nhất 2 ký tự để tìm công việc, cuộc họp hoặc nhân sự.
      </p>
    );
  }

  if (results.length === 0) {
    return (
      <p className={cn("px-3 py-6 text-center text-sm text-muted-foreground", className)}>
        Không tìm thấy kết quả cho “{query.trim()}”.
      </p>
    );
  }

  let lastGroup: Result["group"] | null = null;

  return (
    <ul className={cn("max-h-80 overflow-y-auto p-1.5", className)}>
      {results.map((result) => {
        const Icon = result.icon;
        const showHeading = result.group !== lastGroup;
        lastGroup = result.group;

        return (
          <React.Fragment key={result.id}>
            {showHeading ? (
              <li className="px-2.5 pb-1 pt-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                {result.group}
              </li>
            ) : null}
            <li>
              <button
                type="button"
                onClick={() => onSelect(result.href)}
                className="flex w-full items-start gap-2.5 rounded-lg px-2.5 py-2 text-left transition-colors hover:bg-secondary focus-visible:outline-none focus-visible:bg-secondary"
              >
                <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-lavender-100 text-lavender-800">
                  <Icon className="h-3.5 w-3.5" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-medium">
                    {result.title}
                  </span>
                  <span className="block truncate text-xs text-muted-foreground">
                    {result.subtitle}
                  </span>
                </span>
              </button>
            </li>
          </React.Fragment>
        );
      })}
    </ul>
  );
}

/** Ô tìm kiếm nhanh trên header (bản desktop). */
export function QuickSearch() {
  const router = useRouter();
  const [query, setQuery] = React.useState("");
  const [open, setOpen] = React.useState(false);
  const containerRef = React.useRef<HTMLDivElement>(null);
  const results = useSearchResults(query);

  React.useEffect(() => {
    const handlePointerDown = (event: MouseEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handlePointerDown);
    return () => document.removeEventListener("mousedown", handlePointerDown);
  }, []);

  const select = (href: string) => {
    setOpen(false);
    setQuery("");
    router.push(href);
  };

  return (
    <div ref={containerRef} className="relative hidden md:block">
      <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
      <Input
        type="search"
        value={query}
        onChange={(event) => {
          setQuery(event.target.value);
          setOpen(true);
        }}
        onFocus={() => setOpen(true)}
        onKeyDown={(event) => {
          if (event.key === "Escape") setOpen(false);
        }}
        placeholder="Tìm công việc, cuộc họp, nhân sự…"
        aria-label="Tìm kiếm nhanh"
        className="w-56 bg-card pl-9 lg:w-72"
      />
      {open ? (
        <div className="absolute right-0 top-12 z-50 w-[22rem] rounded-xl border border-border bg-popover shadow-lift">
          <ResultList results={results} query={query} onSelect={select} />
        </div>
      ) : null}
    </div>
  );
}

/** Nút tìm kiếm trên mobile — mở hộp thoại tìm kiếm. */
export function QuickSearchMobile() {
  const router = useRouter();
  const [open, setOpen] = React.useState(false);
  const [query, setQuery] = React.useState("");
  const results = useSearchResults(query);

  React.useEffect(() => {
    if (!open) setQuery("");
  }, [open]);

  const select = (href: string) => {
    setOpen(false);
    router.push(href);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="md:hidden"
          aria-label="Tìm kiếm"
        >
          <Search className="h-5 w-5" />
        </Button>
      </DialogTrigger>
      <DialogContent className="top-24 max-w-md translate-y-0 gap-3">
        <DialogHeader>
          <DialogTitle>Tìm kiếm nhanh</DialogTitle>
          <DialogDescription>
            Tìm theo tên công việc, nội dung cuộc họp hoặc tên nhân sự.
          </DialogDescription>
        </DialogHeader>
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Nhập từ khoá…"
            aria-label="Từ khoá tìm kiếm"
            className="bg-background pl-9"
          />
        </div>
        <ResultList
          results={results}
          query={query}
          onSelect={select}
          className="rounded-xl border border-border bg-background/60 p-1.5"
        />
      </DialogContent>
    </Dialog>
  );
}
