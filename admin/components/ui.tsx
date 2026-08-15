"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ButtonHTMLAttributes,
  type InputHTMLAttributes,
  type ReactNode,
  type SelectHTMLAttributes,
  type TextareaHTMLAttributes,
} from "react";
import { Check, ChevronDown, ChevronLeft, ChevronRight, Loader2, X } from "lucide-react";
import { cn } from "@/lib/cn";

/* ----------------------------- Button ----------------------------- */

export function Button({
  variant = "default",
  size = "md",
  className,
  loading,
  children,
  disabled,
  ...rest
}: ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "default" | "primary" | "ghost" | "danger" | "outline";
  size?: "sm" | "md" | "lg";
  loading?: boolean;
}) {
  return (
    <button
      disabled={disabled || loading}
      className={cn(
        "inline-flex items-center justify-center gap-2 font-medium transition-colors duration-200 disabled:cursor-not-allowed disabled:opacity-50",
        size === "sm" && "h-8 px-3 text-xs",
        size === "md" && "h-10 px-4 text-sm",
        size === "lg" && "h-12 px-6 text-sm",
        variant === "primary" && "bg-acid text-ink hover:bg-paper",
        variant === "default" && "border border-line bg-ink-2 text-paper hover:border-paper/30 hover:bg-ink-3",
        variant === "outline" && "border border-paper/25 text-paper hover:border-acid hover:text-acid",
        variant === "ghost" && "text-smoke hover:bg-ink-2 hover:text-paper",
        variant === "danger" && "border border-red-500/40 bg-red-500/10 text-red-400 hover:bg-red-500/20",
        className
      )}
      {...rest}
    >
      {loading && <Loader2 className="h-4 w-4 animate-spin" />}
      {children}
    </button>
  );
}

/* ------------------------------ Inputs ----------------------------- */

const fieldBase =
  "w-full border border-line bg-ink-2 px-3 py-2 text-sm text-paper placeholder:text-stone transition-colors duration-200 focus:border-acid focus:outline-none";

export function Input({ className, ...rest }: InputHTMLAttributes<HTMLInputElement>) {
  return <input className={cn(fieldBase, className)} {...rest} />;
}

export function Textarea({ className, ...rest }: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea className={cn(fieldBase, "resize-y", className)} {...rest} />;
}

export function Select({ className, children, ...rest }: SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <div className="relative">
      <select className={cn(fieldBase, "appearance-none pr-9", className)} {...rest}>
        {children}
      </select>
      <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-stone" />
    </div>
  );
}

export function Checkbox({ checked, onChange, label, className }: { checked: boolean; onChange: (v: boolean) => void; label?: ReactNode; className?: string }) {
  return (
    <label className={cn("flex cursor-pointer items-center gap-2.5 text-sm text-paper/85", className)}>
      <button
        type="button"
        role="checkbox"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={cn(
          "flex h-4.5 w-4.5 flex-none items-center justify-center border transition-colors duration-150",
          checked ? "border-acid bg-acid text-ink" : "border-line bg-ink-2 text-transparent hover:border-paper/30"
        )}
      >
        <Check className="h-3 w-3" strokeWidth={3} />
      </button>
      {label}
    </label>
  );
}

export function Field({
  label,
  hint,
  children,
  className,
}: {
  label: string;
  hint?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      <label className="meta-label text-stone">{label}</label>
      {children}
      {hint && <p className="text-xs text-stone">{hint}</p>}
    </div>
  );
}

/* ------------------------------ Card ------------------------------- */

export function Card({ children, className, title, actions }: { children: ReactNode; className?: string; title?: string; actions?: ReactNode }) {
  return (
    <section className={cn("border border-line bg-ink-2/60", className)}>
      {(title || actions) && (
        <header className="flex items-center justify-between gap-4 border-b border-line px-5 py-3.5">
          {title && <h2 className="meta-label text-smoke">{title}</h2>}
          {actions}
        </header>
      )}
      <div className="p-5">{children}</div>
    </section>
  );
}

/* ------------------------------ Badge ------------------------------ */

const badgeTones: Record<string, string> = {
  PUBLISHED: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
  DRAFT: "bg-amber-500/15 text-amber-400 border-amber-500/30",
  ARCHIVED: "bg-stone-500/15 text-stone-400 border-stone-500/30",
  NEW: "bg-acid/15 text-acid border-acid/30",
  CONTACTED: "bg-sky-500/15 text-sky-400 border-sky-500/30",
  IN_PROGRESS: "bg-violet-500/15 text-violet-400 border-violet-500/30",
  CONVERTED: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
  CLOSED: "bg-stone-500/15 text-stone-400 border-stone-500/30",
  SPAM: "bg-red-500/15 text-red-400 border-red-500/30",
  SUBSCRIBED: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
  UNSUBSCRIBED: "bg-stone-500/15 text-stone-400 border-stone-500/30",
  true: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
  false: "bg-stone-500/15 text-stone-400 border-stone-500/30",
};

export function Badge({ value, className }: { value: string | boolean | undefined | null; className?: string }) {
  const key = String(value);
  return (
    <span
      className={cn(
        "inline-flex items-center border px-2 py-0.5 font-mono text-[10px] uppercase tracking-wider",
        badgeTones[key] ?? "border-line bg-ink-3 text-smoke",
        className
      )}
    >
      {key}
    </span>
  );
}

/* ----------------------------- Spinner ----------------------------- */

export function Spinner({ label = "Loading" }: { label?: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-20">
      <Loader2 className="h-6 w-6 animate-spin text-acid" />
      <p className="meta-label text-stone">{label}</p>
    </div>
  );
}

export function EmptyState({ title, body, action }: { title: string; body?: string; action?: ReactNode }) {
  return (
    <div className="flex flex-col items-center justify-center border border-dashed border-line py-20 text-center">
      <p className="meta-label text-smoke">{title}</p>
      {body && <p className="mt-2 max-w-sm text-sm text-stone">{body}</p>}
      {action && <div className="mt-6">{action}</div>}
    </div>
  );
}

/* ---------------------------- Pagination --------------------------- */

export function Pagination({
  page,
  pages,
  total,
  onChange,
}: {
  page: number;
  pages: number;
  total: number;
  onChange: (page: number) => void;
}) {
  if (pages <= 1) return null;
  return (
    <div className="flex items-center justify-between border-t border-line px-5 py-3">
      <p className="meta-label text-stone">{total} records</p>
      <div className="flex items-center gap-2">
        <Button size="sm" variant="ghost" onClick={() => onChange(page - 1)} disabled={page <= 1} aria-label="Previous page">
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <span className="font-mono text-xs text-smoke">
          {page} / {pages}
        </span>
        <Button size="sm" variant="ghost" onClick={() => onChange(page + 1)} disabled={page >= pages} aria-label="Next page">
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}

/* ----------------------------- Dialog ------------------------------ */

export function Dialog({
  open,
  onClose,
  title,
  children,
  wide = false,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  wide?: boolean;
}) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-ink/80 p-4 backdrop-blur-sm md:p-8" role="dialog" aria-modal="true" aria-label={title}>
      <div className={cn("w-full border border-line bg-ink-2 shadow-2xl", wide ? "max-w-4xl" : "max-w-xl")}>
        <header className="flex items-center justify-between border-b border-line px-5 py-4">
          <h2 className="meta-label text-paper">{title}</h2>
          <button onClick={onClose} aria-label="Close dialog" className="flex h-8 w-8 items-center justify-center text-stone transition-colors hover:text-paper">
            <X className="h-4 w-4" />
          </button>
        </header>
        <div className="max-h-[calc(100vh-10rem)] overflow-y-auto p-5">{children}</div>
      </div>
    </div>
  );
}

/* ------------------------------ Toasts ----------------------------- */

type Toast = { id: number; message: string; tone: "success" | "error" };
const ToastContext = createContext<{ toast: (message: string, tone?: Toast["tone"]) => void }>({ toast: () => {} });

export function useToast() {
  return useContext(ToastContext);
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const toast = useCallback((message: string, tone: Toast["tone"] = "success") => {
    const id = Date.now() + Math.random();
    setToasts((t) => [...t, { id, message, tone }]);
    window.setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 3600);
  }, []);

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      <div className="pointer-events-none fixed bottom-5 right-5 z-[90] flex flex-col gap-2">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={cn(
              "pointer-events-auto flex max-w-sm items-center gap-3 border bg-ink-2 px-4 py-3 text-sm shadow-xl",
              t.tone === "success" ? "border-acid/40" : "border-red-500/40"
            )}
          >
            <span className={cn("h-1.5 w-1.5 flex-none rounded-full", t.tone === "success" ? "bg-acid" : "bg-red-500")} />
            <span className="text-paper/90">{t.message}</span>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

/* ------------------------------ Tabs ------------------------------- */

export function Tabs({
  tabs,
  active,
  onChange,
}: {
  tabs: Array<{ key: string; label: string }>;
  active: string;
  onChange: (key: string) => void;
}) {
  return (
    <div className="flex flex-wrap gap-1 border-b border-line" role="tablist">
      {tabs.map((t) => (
        <button
          key={t.key}
          role="tab"
          aria-selected={active === t.key}
          onClick={() => onChange(t.key)}
          className={cn(
            "-mb-px border-b-2 px-4 py-2.5 text-sm transition-colors",
            active === t.key ? "border-acid text-paper" : "border-transparent text-stone hover:text-paper"
          )}
        >
          {t.label}
        </button>
      ))}
    </div>
  );
}

/* ---------------------------- Confirm ------------------------------ */

export function useConfirm() {
  const { toast } = useToast();
  return {
    confirm: async (message: string): Promise<boolean> => {
      // Simple native confirm — kept for reliability across the dashboard.
      return window.confirm(message);
    },
    toast,
  };
}
