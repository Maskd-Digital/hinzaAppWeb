"use client";

import Link from "next/link";
import Image from "next/image";
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
    <div className="flex min-h-dvh bg-[#EFF4FF]">
      {showNav && (
        <aside className="relative z-20 sticky top-0 hidden h-dvh w-64 shrink-0 flex-col overflow-hidden bg-[#0108B8] text-white md:flex">
          <div className="border-b border-white/10 px-5 py-6">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-white/15">
                <Image
                  src="/hinza-logo.png"
                  alt="Hinza"
                  width={36}
                  height={36}
                  className="h-9 w-9 object-contain"
                />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-semibold leading-tight text-white">
                  Hinza
                </p>
                <p className="truncate text-xs text-white/80">
                  {selectedCompany?.name ?? "Complaints"}
                </p>
              </div>
            </div>
          </div>

          <nav className="flex flex-1 flex-col gap-[6px] overflow-y-auto p-3">
            {NAV.map((item) => {
              const active = isNavActive(pathname, item.href);
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 px-3 py-3 text-sm font-medium transition",
                    active
                      ? "-ml-4 rounded-r-lg bg-[#EFF4FF] pl-7 text-[#0108B8] shadow-[inset_0_2px_4px_rgba(1,8,184,0.35)]"
                      : "rounded-md text-white hover:bg-white/10",
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
            className="relative z-10 m-0 flex min-h-11 shrink-0 items-center gap-3 border-t border-white/10 px-5 py-3 text-left text-sm font-medium text-white transition hover:bg-white/10"
          >
            <LogOut className="h-4 w-4 shrink-0" />
            <span>Logout</span>
          </button>
        </aside>
      )}

      {showNav && (
        <header className="safe-top fixed inset-x-0 top-0 z-40 flex h-14 items-center justify-between border-b border-white/10 bg-[#0108B8] px-4 text-white md:hidden">
          <div className="flex min-w-0 items-center gap-2">
            <Image
              src="/hinza-logo.png"
              alt="Hinza"
              width={28}
              height={28}
              className="h-7 w-7 object-contain"
            />
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold leading-tight">
                Hinza
              </p>
              <p className="truncate text-[11px] text-white/80">
                {selectedCompany?.name}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleLogout}
            className="inline-flex min-h-10 min-w-10 items-center justify-center rounded-md bg-white/10 px-3 text-xs font-semibold"
            aria-label="Logout"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </header>
      )}

      <main
        className={cn(
          "flex min-w-0 flex-1 flex-col overflow-y-auto",
          showNav && "pt-14 md:pt-0",
          showNav &&
            (footer
              ? "pb-[calc(8.75rem+env(safe-area-inset-bottom))] md:pb-0"
              : "pb-[calc(4.25rem+env(safe-area-inset-bottom))] md:pb-0"),
        )}
      >
        <div className="mx-auto w-full max-w-6xl flex-1 px-3 py-4 sm:px-5 sm:py-6 md:p-6">
          <header className="mb-4 sm:mb-6">
            <h1 className="text-xl font-bold leading-tight text-[#081636] sm:text-2xl">
              {title}
            </h1>
            {subtitle && (
              <p className="mt-1 text-xs leading-relaxed text-gray-600 sm:text-sm">
                {subtitle}
              </p>
            )}
          </header>
          {children}
        </div>

        {footer && (
          <div className="fixed inset-x-0 bottom-[calc(4.25rem+env(safe-area-inset-bottom))] z-30 border-t border-gray-200 bg-white/95 px-3 py-3 backdrop-blur md:static md:inset-auto md:bottom-auto md:z-auto md:mt-0 md:border-0 md:bg-transparent md:px-6 md:py-4 md:backdrop-blur-none">
            <div className="mx-auto flex w-full max-w-6xl flex-col gap-2 sm:flex-row sm:flex-wrap">
              {footer}
            </div>
          </div>
        )}
      </main>

      {showNav && (
        <nav className="safe-bottom fixed inset-x-0 bottom-0 z-40 border-t border-gray-200 bg-white md:hidden">
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
                    active ? "text-[#0108B8]" : "text-gray-500",
                  )}
                >
                  <span
                    className={cn(
                      "flex h-8 w-12 items-center justify-center rounded-full",
                      active && "bg-[#EFF4FF]",
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
        "rounded-lg border border-gray-200 bg-white p-4 sm:p-5",
        className,
      )}
      style={{
        boxShadow:
          "0 4px 6px -1px rgba(37, 99, 235, 0.25), 0 2px 4px -2px rgba(37, 99, 235, 0.25)",
      }}
    >
      {children}
    </div>
  );
}

export function Button({
  children,
  className,
  variant = "primary",
  style,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "ghost" | "danger";
}) {
  return (
    <button
      className={cn(
        "inline-flex min-h-11 items-center justify-center gap-2 rounded-md px-4 py-2 text-sm font-medium transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50",
        variant === "primary" && "text-white",
        variant === "secondary" &&
          "border border-gray-300 bg-white text-[#081636] hover:bg-gray-50 hover:opacity-100",
        variant === "ghost" &&
          "bg-transparent text-gray-600 hover:bg-gray-100 hover:opacity-100",
        variant === "danger" && "bg-red-600 text-white",
        className,
      )}
      style={{
        ...(variant === "primary"
          ? {
              backgroundColor: "#0108B8",
              boxShadow: "0 4px 6px rgba(37, 99, 235, 0.25)",
            }
          : {}),
        ...style,
      }}
      {...props}
    >
      {children}
    </button>
  );
}

export function FieldLabel({ children }: { children: ReactNode }) {
  return (
    <label className="mb-1.5 block text-sm font-medium text-[#081636]">
      {children}
    </label>
  );
}

const controlClass =
  "w-full min-h-11 rounded-md border border-gray-300 bg-white px-3 py-2 text-base text-[#081636] outline-none transition placeholder:text-gray-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 sm:text-sm";

export function TextInput(
  props: React.InputHTMLAttributes<HTMLInputElement>,
) {
  return (
    <input
      {...props}
      className={cn(controlClass, props.className)}
      style={{
        boxShadow: "inset 0 2px 4px rgba(37, 99, 235, 0.25)",
        ...props.style,
      }}
    />
  );
}

export function TextSelect(
  props: React.SelectHTMLAttributes<HTMLSelectElement>,
) {
  return (
    <select
      {...props}
      className={cn(controlClass, props.className)}
      style={{
        boxShadow: "inset 0 2px 4px rgba(37, 99, 235, 0.25)",
        ...props.style,
      }}
    />
  );
}

export function TextTextarea(
  props: React.TextareaHTMLAttributes<HTMLTextAreaElement>,
) {
  return (
    <textarea
      {...props}
      className={cn(controlClass, "min-h-28", props.className)}
      style={{
        boxShadow: "inset 0 2px 4px rgba(37, 99, 235, 0.25)",
        ...props.style,
      }}
    />
  );
}

export function Spinner({ label = "Loading..." }: { label?: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-16 text-gray-500">
      <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
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
      <p className="text-base font-semibold text-[#081636]">{title}</p>
      {description && (
        <p className="mt-1 text-sm text-gray-500">{description}</p>
      )}
    </div>
  );
}

export function Pill({ children }: { children: ReactNode }) {
  return (
    <span className="inline-flex max-w-full truncate rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-700">
      {children}
    </span>
  );
}
