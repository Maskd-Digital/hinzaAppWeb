"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Search, X } from "lucide-react";
import { useAuth } from "@/components/providers";
import {
  AppShell,
  Button,
  Card,
  EmptyState,
  Pill,
  Spinner,
  TextInput,
} from "@/components/layout/AppShell";
import { AppSelect } from "@/components/ui/AppSelect";
import { api } from "@/lib/api";
import { AppConfig, STATUS_FILTERS } from "@/lib/config";
import type { Complaint } from "@/lib/types";

export default function ComplaintsListPage() {
  const { selectedCompany } = useAuth();
  const [items, setItems] = useState<Complaint[]>([]);
  const [offset, setOffset] = useState(0);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(false);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<string>("All Status");
  const [selected, setSelected] = useState<Complaint | null>(null);

  const companyId = selectedCompany?.id ?? "";

  const load = useCallback(
    async (nextOffset: number, append: boolean) => {
      if (!companyId) return;
      if (append) setLoadingMore(true);
      else setLoading(true);
      setError(null);
      try {
        const page = await api.getComplaints(companyId, {
          limit: AppConfig.complaintsPageSize,
          offset: nextOffset,
        });
        const productOnly = page.filter((c) => c.product_id != null);
        setItems((prev) => (append ? [...prev, ...productOnly] : productOnly));
        setOffset(nextOffset);
        setHasMore(page.length >= AppConfig.complaintsPageSize);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load complaints");
      } finally {
        setLoading(false);
        setLoadingMore(false);
      }
    },
    [companyId],
  );

  useEffect(() => {
    void load(0, false);
  }, [load]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return items.filter((c) => {
      const matchesSearch =
        !q ||
        c.title.toLowerCase().includes(q) ||
        c.status.toLowerCase().includes(q);
      const matchesStatus =
        status === "All Status" ||
        c.status.toLowerCase().includes(status.toLowerCase());
      return matchesSearch && matchesStatus;
    });
  }, [items, search, status]);

  return (
    <AppShell
      title="Submitted Complaints"
      subtitle="Product complaints for your company"
    >
      <Card className="mb-4">
        <div className="flex flex-col gap-3 md:flex-row">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <TextInput
              className="pl-9"
              placeholder="Search by title or status…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <AppSelect
            className="md:w-48"
            aria-label="Status"
            placeholder="All Status"
            value={status === "All Status" ? "" : status}
            onChange={(next) => setStatus(next || "All Status")}
            options={STATUS_FILTERS.filter((s) => s !== "All Status").map(
              (s) => ({ value: s, label: s }),
            )}
          />
        </div>
      </Card>

      {loading ? (
        <Spinner label="Loading complaints…" />
      ) : error ? (
        <Card>
          <p className="text-sm text-red-600">{error}</p>
          <Button className="mt-3" onClick={() => void load(0, false)}>
            Retry
          </Button>
        </Card>
      ) : filtered.length === 0 ? (
        <Card>
          <EmptyState
            title="No complaints found"
            description="Try another search, or submit a product complaint."
          />
        </Card>
      ) : (
        <div className="space-y-3">
          {filtered.map((c) => (
            <button
              key={c.id}
              type="button"
              onClick={() => setSelected(c)}
              className="block w-full text-left active:scale-[0.99]"
            >
              <Card className="transition hover:shadow-md sm:hover:-translate-y-0.5">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <h3 className="text-sm font-semibold leading-snug text-slate-800 sm:text-base">
                      {c.title}
                    </h3>
                    <p className="mt-1 text-[11px] text-slate-500 sm:text-xs">
                      {new Date(c.created_at).toLocaleString()}
                    </p>
                  </div>
                  <Pill>{c.status}</Pill>
                </div>
              </Card>
            </button>
          ))}

          {hasMore && (
            <div className="flex justify-center pt-2">
              <Button
                variant="secondary"
                className="w-full sm:w-auto"
                disabled={loadingMore}
                onClick={() =>
                  void load(offset + AppConfig.complaintsPageSize, true)
                }
              >
                {loadingMore ? "Loading…" : "Load more"}
              </Button>
            </div>
          )}
        </div>
      )}

      {selected && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 sm:items-center sm:p-4"
          onClick={() => setSelected(null)}
        >
          <div
            className="flex max-h-[92dvh] w-full max-w-2xl flex-col overflow-hidden rounded-t-2xl bg-white shadow-xl sm:max-h-[90vh] sm:rounded-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="sticky top-0 z-10 flex items-start justify-between gap-3 border-b border-slate-100 bg-white px-4 py-4 sm:px-5">
              <div className="min-w-0">
                <h2 className="text-lg font-bold text-[var(--brand-blue)] sm:text-xl">
                  Complaint details
                </h2>
                <p className="mt-1 truncate text-sm text-slate-600">
                  {selected.title}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setSelected(null)}
                className="inline-flex min-h-10 min-w-10 items-center justify-center rounded-xl text-slate-500 hover:bg-slate-100"
                aria-label="Close"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="overflow-y-auto px-4 py-4 sm:px-5">
              <DetailSection title="Overview">
                <DetailRow label="Status" value={selected.status} />
                <DetailRow
                  label="Created"
                  value={new Date(selected.created_at).toLocaleString()}
                />
                <DetailRow label="Priority" value={selected.priority} />
                <DetailRow label="ID" value={selected.id} />
              </DetailSection>

              <DetailSection title="Key Details">
                <DetailRow label="Product ID" value={selected.product_id} />
                <DetailRow label="Template ID" value={selected.template_id} />
                <DetailRow label="Batch ID" value={selected.batch_id} />
              </DetailSection>

              <DetailSection title="Attachments">
                {selected.capa_document_url ? (
                  <a
                    href={selected.capa_document_url}
                    target="_blank"
                    rel="noreferrer"
                    className="text-sm font-medium text-[var(--brand-blue)] underline"
                  >
                    View document / image
                  </a>
                ) : (
                  <p className="text-sm text-slate-500">No attachments</p>
                )}
              </DetailSection>

              <DetailSection title="Additional Information">
                {selected.custom_fields &&
                Object.keys(selected.custom_fields).length > 0 ? (
                  Object.entries(selected.custom_fields).map(([key, value]) => (
                    <DetailRow
                      key={key}
                      label={key.replace(/_/g, " ")}
                      value={
                        typeof value === "object" && value !== null
                          ? JSON.stringify(value)
                          : String(value ?? "")
                      }
                    />
                  ))
                ) : (
                  <p className="text-sm text-slate-500">None</p>
                )}
              </DetailSection>
            </div>
          </div>
        </div>
      )}
    </AppShell>
  );
}

function DetailSection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="mb-4 rounded-xl border border-slate-100 p-4">
      <h3 className="mb-2 text-sm font-semibold text-slate-800">{title}</h3>
      <div className="space-y-2">{children}</div>
    </div>
  );
}

function DetailRow({
  label,
  value,
}: {
  label: string;
  value?: string | null;
}) {
  if (!value) return null;
  return (
    <div className="grid grid-cols-1 gap-0.5 text-sm sm:grid-cols-[9rem_1fr]">
      <span className="font-medium capitalize text-slate-500">{label}</span>
      <span className="break-all text-slate-800">{value}</span>
    </div>
  );
}
