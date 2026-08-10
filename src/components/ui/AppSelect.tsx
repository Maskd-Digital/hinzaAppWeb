"use client";

import { useEffect, useId, useMemo, useRef, useState } from "react";
import { Check, ChevronDown, Search, X } from "lucide-react";
import { cn } from "@/lib/validation";

export interface SelectOption {
  value: string;
  label: string;
}

interface Props {
  value: string;
  onChange: (value: string) => void;
  options: SelectOption[];
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  /** Accessible label for the control */
  "aria-label"?: string;
}

export function AppSelect({
  value,
  onChange,
  options,
  placeholder = "Select…",
  disabled,
  className,
  "aria-label": ariaLabel,
}: Props) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const listId = useId();
  const triggerRef = useRef<HTMLButtonElement>(null);

  const selected = options.find((o) => o.value === value);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return options;
    return options.filter((o) => o.label.toLowerCase().includes(q));
  }, [options, query]);

  useEffect(() => {
    if (!open) {
      setQuery("");
      return;
    }
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [open]);

  function choose(next: string) {
    onChange(next);
    setOpen(false);
    triggerRef.current?.focus();
  }

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        disabled={disabled}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={listId}
        aria-label={ariaLabel}
        onClick={() => setOpen(true)}
        className={cn(
          "flex min-h-11 w-full items-center justify-between gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-left text-base text-slate-900 outline-none ring-[var(--brand-blue)] transition focus:ring-2 disabled:opacity-50 sm:text-sm",
          className,
        )}
      >
        <span
          className={cn(
            "truncate",
            !selected && "text-slate-400",
          )}
        >
          {selected?.label ?? placeholder}
        </span>
        <ChevronDown className="h-4 w-4 shrink-0 text-slate-400" />
      </button>

      {open && (
        <div className="fixed inset-0 z-[80] flex items-end justify-center sm:items-center sm:p-4">
          <button
            type="button"
            aria-label="Close"
            className="absolute inset-0 bg-black/40"
            onClick={() => setOpen(false)}
          />
          <div
            className="relative flex max-h-[85dvh] w-full max-w-lg flex-col rounded-t-2xl bg-white shadow-xl sm:max-h-[70vh] sm:rounded-2xl"
            role="dialog"
            aria-modal="true"
          >
            <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
              <p className="text-sm font-semibold text-slate-800">
                {ariaLabel ?? "Select an option"}
              </p>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="inline-flex min-h-10 min-w-10 items-center justify-center rounded-xl text-slate-500 hover:bg-slate-100"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {options.length > 8 && (
              <div className="border-b border-slate-100 px-4 py-3">
                <div className="relative">
                  <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <input
                    autoFocus
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Search…"
                    className="min-h-11 w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-9 pr-3 text-base outline-none ring-[var(--brand-blue)] focus:ring-2 sm:text-sm"
                  />
                </div>
              </div>
            )}

            <ul
              id={listId}
              role="listbox"
              className="overflow-y-auto overscroll-contain p-2"
            >
              <li>
                <button
                  type="button"
                  role="option"
                  aria-selected={!value}
                  onClick={() => choose("")}
                  className={cn(
                    "flex w-full items-center justify-between rounded-xl px-3 py-3 text-left text-sm",
                    !value
                      ? "bg-[var(--brand-blue-soft)] font-semibold text-[var(--brand-blue)]"
                      : "text-slate-600 hover:bg-slate-50",
                  )}
                >
                  {placeholder}
                </button>
              </li>
              {filtered.map((opt) => {
                const active = opt.value === value;
                return (
                  <li key={opt.value}>
                    <button
                      type="button"
                      role="option"
                      aria-selected={active}
                      onClick={() => choose(opt.value)}
                      className={cn(
                        "flex w-full items-center justify-between gap-3 rounded-xl px-3 py-3 text-left text-sm",
                        active
                          ? "bg-[var(--brand-blue-soft)] font-semibold text-[var(--brand-blue)]"
                          : "text-slate-800 hover:bg-slate-50",
                      )}
                    >
                      <span className="min-w-0 break-words">{opt.label}</span>
                      {active && <Check className="h-4 w-4 shrink-0" />}
                    </button>
                  </li>
                );
              })}
              {filtered.length === 0 && (
                <li className="px-3 py-6 text-center text-sm text-slate-500">
                  No matches
                </li>
              )}
            </ul>
          </div>
        </div>
      )}
    </>
  );
}
