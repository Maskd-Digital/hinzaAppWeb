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
          "flex min-h-11 w-full items-center justify-between gap-2 rounded-md border border-gray-300 bg-white px-3 py-2 text-left text-base text-[#081636] outline-none transition focus:border-blue-500 focus:ring-1 focus:ring-blue-500 disabled:opacity-50 sm:text-sm",
          className,
        )}
        style={{ boxShadow: "inset 0 2px 4px rgba(37, 99, 235, 0.25)" }}
      >
        <span className={cn("truncate", !selected && "text-gray-400")}>
          {selected?.label ?? placeholder}
        </span>
        <ChevronDown className="h-4 w-4 shrink-0 text-gray-400" />
      </button>

      {open && (
        <div className="fixed inset-0 z-[80] flex items-end justify-center sm:items-center sm:p-4">
          <button
            type="button"
            aria-label="Close"
            className="absolute inset-0 bg-gray-500/30 backdrop-blur-sm"
            onClick={() => setOpen(false)}
          />
          <div
            className="relative mx-0 flex max-h-[85dvh] w-full max-w-lg flex-col rounded-t-lg bg-white shadow-xl sm:mx-4 sm:max-h-[70vh] sm:rounded-lg"
            role="dialog"
            aria-modal="true"
          >
            <div className="flex items-center justify-between border-b border-gray-200 px-4 py-3">
              <p className="text-sm font-semibold text-[#081636]">
                {ariaLabel ?? "Select an option"}
              </p>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="inline-flex min-h-10 min-w-10 items-center justify-center rounded-md text-gray-500 hover:bg-gray-100"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {options.length > 8 && (
              <div className="border-b border-gray-200 px-4 py-3">
                <div className="relative">
                  <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                  <input
                    autoFocus
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Search…"
                    className="min-h-11 w-full rounded-md border border-gray-300 bg-white py-2 pl-9 pr-3 text-base text-[#081636] outline-none focus:border-[#0108B8] focus:ring-1 focus:ring-blue-500 sm:text-sm"
                    style={{
                      boxShadow: "inset 0 2px 4px rgba(1, 8, 184, 0.35)",
                    }}
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
                    "flex w-full items-center justify-between rounded-md px-3 py-3 text-left text-sm",
                    !value
                      ? "bg-[#EFF4FF] font-semibold text-[#0108B8]"
                      : "text-gray-600 hover:bg-gray-50",
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
                        "flex w-full items-center justify-between gap-3 rounded-md px-3 py-3 text-left text-sm",
                        active
                          ? "bg-[#EFF4FF] font-semibold text-[#0108B8]"
                          : "text-[#081636] hover:bg-gray-50",
                      )}
                    >
                      <span className="min-w-0 break-words">{opt.label}</span>
                      {active && <Check className="h-4 w-4 shrink-0" />}
                    </button>
                  </li>
                );
              })}
              {filtered.length === 0 && (
                <li className="px-3 py-6 text-center text-sm text-gray-500">
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
