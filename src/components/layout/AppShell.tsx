"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { ClipboardList, FilePlus2, LogOut } from "lucide-react";
import type { ReactNode } from "react";
import { useAuth } from "@/components/providers";
import { cn } from "@/lib/validation";

const NAV = [
  { href: "/home", label: "New", fullLabel: "New Complaint", icon: FilePlus2 },
  {
    href: "/complaints-list",
    label: "Submitted",
    fullLabel: "Submitted Complaints",
    icon: ClipboardList,
  },
] as const;

function isNavActive(pathname: string, href: string): boolean {
  if (pathname === href) return true;
  if (href === "/home") {
    return [
      "/origin-type",
      "/new-complaint",
      "/equipment",
      "/equipment-form",
      "/complaint-summary",
    ].some((p) => pathname.startsWith(p));
  }
  return false;
}

export function AppShell({
  title,
  subtitle,
  children,
  showNav = true,
  footer,
}: {
  title: string;
  subtitle?: string;
  children: ReactNode;
  showNav?: boolean;
  /** Optional sticky action bar (useful for submit/back on phones) */
  footer?: ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const { userProfile, selectedCompany, logout } = useAuth();

  async function handleLogout() {
    await logout();
    router.replace("/login");
  }

  return (
    <div className="flex min-h-dvh bg-[var(--bg-page)]">
      {showNav && (
        <aside className="relative z-20 sticky top-0 hidden h-dvh w-64 shrink-0 flex-col overflow-hidden bg-[var(--sidebar)] text-white md:flex">
          <div className="border-b border-white/10 px-5 py-6">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white/15 text-sm font-bold">
                {(userProfile?.full_name ?? "H").slice(0, 1).toUpperCase()}
              </div>
              <div className="min-w-0">
                <p className="text-base font-semibold leading-tight">Hinza</p>
                <p className="truncate text-xs text-white/70">
                  {selectedCompany?.name ?? "Complaints"}
                </p>
              </div>
            </div>
          </div>

          <nav className="flex flex-1 flex-col gap-1 overflow-y-auto p-3">
            {NAV.map((item) => {
              const active = isNavActive(pathname, item.href);
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium transition",
                    active
                      ? "bg-white text-[var(--brand-blue)]"
                      : "text-white/90 hover:bg-white/10",
                  )}
                >
                  <Icon className="h-4 w-4 shrink-0" />
                  <span className="truncate">{item.fullLabel}</span>
                </Link>
              );
            })}
          </nav>

          <button
            type="button"
            onClick={handleLogout}
            className="relative z-10 m-3 flex min-h-11 shrink-0 items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-medium text-white/90 transition hover:bg-white/10"
          >
            <LogOut className="h-4 w-4 shrink-0" />
            <span>Logout</span>
          </button>
        </aside>
      )}

      {/* Mobile top bar */}
      {showNav && (
        <header className="safe-top fixed inset-x-0 top-0 z-40 flex h-14 items-center justify-between border-b border-white/10 bg-[var(--sidebar)] px-4 text-white md:hidden">
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold leading-tight">Hinza</p>
            <p className="truncate text-[11px] text-white/70">
              {selectedCompany?.name}
            </p>
          </div>
          <button
            type="button"
            onClick={handleLogout}
            className="inline-flex min-h-10 min-w-10 items-center justify-center rounded-xl bg-white/10 px-3 text-xs font-semibold"
            aria-label="Logout"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </header>
      )}

      <main
        className={cn(
          "flex min-w-0 flex-1 flex-col",
          showNav && "pt-14 md:pt-0",
          showNav &&
            (footer
              ? "pb-[calc(8.75rem+env(safe-area-inset-bottom))] md:pb-0"
              : "pb-[calc(4.25rem+env(safe-area-inset-bottom))] md:pb-0"),
        )}
      >
        <div className="mx-auto w-full max-w-6xl flex-1 px-3 py-4 sm:px-4 sm:py-6 md:px-8 md:py-8">
          <header className="mb-4 sm:mb-6">
            <h1 className="text-xl font-bold leading-tight text-[var(--brand-blue)] sm:text-2xl md:text-3xl">
              {title}
            </h1>
            {subtitle && (
              <p className="mt-1 text-xs leading-relaxed text-slate-600 sm:text-sm md:text-base">
                {subtitle}
              </p>
            )}
          </header>
          {children}
        </div>

        {footer && (
          <div className="fixed inset-x-0 bottom-[calc(4.25rem+env(safe-area-inset-bottom))] z-30 border-t border-slate-200/80 bg-white/95 px-3 py-3 backdrop-blur md:static md:inset-auto md:bottom-auto md:z-auto md:mt-0 md:border-0 md:bg-transparent md:px-8 md:py-4 md:backdrop-blur-none">
            <div className="mx-auto flex w-full max-w-6xl flex-col gap-2 sm:flex-row sm:flex-wrap">
              {footer}
            </div>
          </div>
        )}
      </main>

      {/* Mobile bottom tab bar */}
      {showNav && (
        <nav className="safe-bottom fixed inset-x-0 bottom-0 z-40 border-t border-slate-200 bg-white md:hidden">
          <div className="mx-auto grid h-[4.25rem] max-w-lg grid-cols-2">
            {NAV.map((item) => {
              const active = isNavActive(pathname, item.href);
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex flex-col items-center justify-center gap-1 text-[11px] font-semibold transition",
                    active ? "text-[var(--brand-blue)]" : "text-slate-500",
                  )}
                >
                  <span
                    className={cn(
                      "flex h-8 w-12 items-center justify-center rounded-full",
                      active && "bg-[var(--brand-blue-soft)]",
                    )}
                  >
                    <Icon className="h-5 w-5" />
                  </span>
                  {item.label}
                </Link>
              );
            })}
          </div>
        </nav>
      )}
    </div>
  );
}

export function Card({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "rounded-2xl bg-white p-4 shadow-[0_4px_6px_-1px_rgb(0_0_0_/_0.08),0_2px_4px_-2px_rgb(0_0_0_/_0.06)] sm:rounded-xl sm:p-5",
        className,
      )}
    >
      {children}
    </div>
  );
}

export function Button({
  children,
  className,
  variant = "primary",
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "ghost" | "danger";
}) {
  return (
    <button
      className={cn(
        "inline-flex min-h-11 items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50",
        variant === "primary" &&
          "bg-[var(--brand-blue)] text-white hover:bg-[var(--brand-blue-dark)]",
        variant === "secondary" &&
          "border border-slate-200 bg-white text-slate-700 hover:bg-slate-50",
        variant === "ghost" && "bg-transparent text-slate-600 hover:bg-slate-100",
        variant === "danger" && "bg-red-600 text-white hover:bg-red-700",
        className,
      )}
      {...props}
    >
      {children}
    </button>
  );
}

export function FieldLabel({ children }: { children: ReactNode }) {
  return (
    <label className="mb-1.5 block text-sm font-medium text-slate-700">
      {children}
    </label>
  );
}

const controlClass =
  "w-full min-h-11 rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-base text-slate-900 outline-none ring-[var(--brand-blue)] transition placeholder:text-slate-400 focus:ring-2 sm:text-sm";

export function TextInput(
  props: React.InputHTMLAttributes<HTMLInputElement>,
) {
  return (
    <input
      {...props}
      className={cn(controlClass, props.className)}
    />
  );
}

export function TextSelect(
  props: React.SelectHTMLAttributes<HTMLSelectElement>,
) {
  return (
    <select {...props} className={cn(controlClass, props.className)} />
  );
}

export function TextTextarea(
  props: React.TextareaHTMLAttributes<HTMLTextAreaElement>,
) {
  return (
    <textarea
      {...props}
      className={cn(controlClass, "min-h-28", props.className)}
    />
  );
}

export function Spinner({ label = "Loading..." }: { label?: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-16 text-slate-500">
      <div className="h-8 w-8 animate-spin rounded-full border-2 border-slate-200 border-t-[var(--brand-blue)]" />
      <p className="text-sm">{label}</p>
    </div>
  );
}

export function EmptyState({
  title,
  description,
}: {
  title: string;
  description?: string;
}) {
  return (
    <div className="px-2 py-12 text-center">
      <p className="text-base font-semibold text-slate-700">{title}</p>
      {description && (
        <p className="mt-1 text-sm text-slate-500">{description}</p>
      )}
    </div>
  );
}

export function Pill({ children }: { children: ReactNode }) {
  return (
    <span className="inline-flex max-w-full truncate rounded-full bg-[var(--brand-blue-soft)] px-3 py-1 text-xs font-semibold text-[var(--brand-blue)]">
      {children}
    </span>
  );
}
