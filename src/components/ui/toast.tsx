"use client";

import * as React from "react";
import { CheckCircle2, Info, TriangleAlert, X } from "lucide-react";

import { cn } from "@/lib/utils";

type ToastVariant = "success" | "info" | "danger";

type ToastOptions = {
  title: string;
  description?: string;
  variant?: ToastVariant;
};

type ToastItem = ToastOptions & {
  id: number;
  variant: ToastVariant;
  closing: boolean;
};

type ToastContextValue = {
  toast: (options: ToastOptions) => void;
};

const ToastContext = React.createContext<ToastContextValue | null>(null);

const AUTO_DISMISS_MS = 4000;
const EXIT_MS = 200;

const variantStyles: Record<
  ToastVariant,
  { wrapper: string; icon: string; Icon: typeof CheckCircle2 }
> = {
  success: {
    wrapper: "border-mint-200 bg-mint-50",
    icon: "bg-mint-200 text-mint-700",
    Icon: CheckCircle2,
  },
  info: {
    wrapper: "border-lavender-200 bg-lavender-50",
    icon: "bg-lavender-200 text-lavender-800",
    Icon: Info,
  },
  danger: {
    wrapper: "border-coral-200 bg-coral-50",
    icon: "bg-coral-200 text-coral-700",
    Icon: TriangleAlert,
  },
};

let toastId = 0;

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = React.useState<ToastItem[]>([]);
  const timers = React.useRef<Map<number, ReturnType<typeof setTimeout>[]>>(
    new Map(),
  );

  const remove = React.useCallback((id: number) => {
    setToasts((prev) => prev.filter((item) => item.id !== id));
    timers.current.delete(id);
  }, []);

  const dismiss = React.useCallback(
    (id: number) => {
      setToasts((prev) =>
        prev.map((item) => (item.id === id ? { ...item, closing: true } : item)),
      );
      const timer = setTimeout(() => remove(id), EXIT_MS);
      timers.current.set(id, [...(timers.current.get(id) ?? []), timer]);
    },
    [remove],
  );

  const toast = React.useCallback(
    ({ title, description, variant = "success" }: ToastOptions) => {
      toastId += 1;
      const id = toastId;
      setToasts((prev) => [...prev, { id, title, description, variant, closing: false }]);
      const timer = setTimeout(() => dismiss(id), AUTO_DISMISS_MS);
      timers.current.set(id, [...(timers.current.get(id) ?? []), timer]);
    },
    [dismiss],
  );

  // Dọn timer khi provider bị gỡ bỏ.
  React.useEffect(() => {
    const store = timers.current;
    return () => {
      store.forEach((list) => list.forEach(clearTimeout));
      store.clear();
    };
  }, []);

  const value = React.useMemo(() => ({ toast }), [toast]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div
        aria-live="polite"
        aria-atomic="false"
        className="pointer-events-none fixed inset-x-4 bottom-4 z-[60] flex flex-col items-center gap-2 sm:inset-x-auto sm:right-6 sm:bottom-6 sm:items-end"
      >
        {toasts.map((item) => {
          const style = variantStyles[item.variant];
          const Icon = style.Icon;
          return (
            <div
              key={item.id}
              role="status"
              className={cn(
                "pointer-events-auto flex w-full max-w-sm items-start gap-3 rounded-2xl border p-4 shadow-lift",
                style.wrapper,
                item.closing
                  ? "animate-out fade-out-0 slide-out-to-bottom-2"
                  : "animate-in fade-in-0 slide-in-from-bottom-2",
              )}
            >
              <span
                className={cn(
                  "flex h-8 w-8 shrink-0 items-center justify-center rounded-xl",
                  style.icon,
                )}
              >
                <Icon className="h-4 w-4" />
              </span>
              <div className="min-w-0 flex-1 space-y-0.5">
                <p className="text-sm font-semibold text-foreground">
                  {item.title}
                </p>
                {item.description ? (
                  <p className="text-xs leading-relaxed text-muted-foreground">
                    {item.description}
                  </p>
                ) : null}
              </div>
              <button
                type="button"
                onClick={() => dismiss(item.id)}
                aria-label="Đóng thông báo"
                className="rounded-lg p-1 text-muted-foreground transition-colors hover:bg-background/70 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast(): ToastContextValue {
  const context = React.useContext(ToastContext);
  if (!context) {
    throw new Error("useToast phải được dùng bên trong <ToastProvider>.");
  }
  return context;
}
