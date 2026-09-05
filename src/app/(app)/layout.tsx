import { AppSidebar } from "@/components/layout/app-sidebar";
import { SiteHeader } from "@/components/layout/site-header";
import { ToastProvider } from "@/components/ui/toast";
import { WeeklyReportProvider } from "@/lib/store";

/** Layout chung: sidebar trái + header trên cùng + vùng nội dung. */
export default function AppLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <WeeklyReportProvider>
      <ToastProvider>
        <div className="min-h-screen bg-background">
          <AppSidebar />

          <div className="flex min-h-screen flex-col lg:pl-64 print:pl-0">
            <SiteHeader />

            <main className="app-surface flex-1 px-4 py-6 sm:px-6 sm:py-8 lg:px-8 print:bg-none print:p-0">
              <div className="mx-auto w-full max-w-6xl animate-fade-in-up space-y-6 print:max-w-none print:animate-none print:space-y-0">
                {children}
              </div>
            </main>

            <footer className="border-t border-border/70 px-4 py-4 text-xs text-muted-foreground sm:px-6 lg:px-8 print:hidden">
              Weekly Report — công cụ tổng hợp cuộc họp, công việc và nhắc việc
              theo tuần.
            </footer>
          </div>
        </div>
      </ToastProvider>
    </WeeklyReportProvider>
  );
}
