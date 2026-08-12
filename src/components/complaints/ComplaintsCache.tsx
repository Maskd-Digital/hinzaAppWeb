"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { api } from "@/lib/api";
import { AppConfig } from "@/lib/config";
import type { Complaint } from "@/lib/types";

interface ComplaintsCacheState {
  companyId: string | null;
  items: Complaint[];
  offset: number;
  hasMore: boolean;
  loaded: boolean;
  loading: boolean;
  loadingMore: boolean;
  error: string | null;
  ensureLoaded: (companyId: string) => Promise<void>;
  loadMore: (companyId: string) => Promise<void>;
  refresh: (companyId: string) => Promise<void>;
  clear: () => void;
  prepend: (complaint: Complaint) => void;
}

const ComplaintsCacheContext = createContext<ComplaintsCacheState | null>(null);

export function ComplaintsCacheProvider({ children }: { children: ReactNode }) {
  const [companyId, setCompanyId] = useState<string | null>(null);
  const [items, setItems] = useState<Complaint[]>([]);
  const [offset, setOffset] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchPage = useCallback(
    async (id: string, nextOffset: number, append: boolean, soft: boolean) => {
      if (append) setLoadingMore(true);
      else if (!soft) setLoading(true);
      setError(null);
      try {
        const page = await api.getComplaints(id, {
          limit: AppConfig.complaintsPageSize,
          offset: nextOffset,
        });
        const productOnly = page.filter((c) => c.product_id != null);
        setCompanyId(id);
        setItems((prev) => (append ? [...prev, ...productOnly] : productOnly));
        setOffset(nextOffset);
        setHasMore(page.length >= AppConfig.complaintsPageSize);
        setLoaded(true);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to load complaints",
        );
        if (!append) setLoaded(false);
      } finally {
        setLoading(false);
        setLoadingMore(false);
      }
    },
    [],
  );

  const ensureLoaded = useCallback(
    async (id: string) => {
      if (!id) return;
      // Already have this company's list in memory — show instantly, no reload spinner
      if (loaded && companyId === id) return;
      if (companyId !== id) {
        setItems([]);
        setOffset(0);
        setHasMore(false);
        setLoaded(false);
      }
      await fetchPage(id, 0, false, false);
    },
    [loaded, companyId, fetchPage],
  );

  const loadMore = useCallback(
    async (id: string) => {
      if (!id || loadingMore || !hasMore) return;
      await fetchPage(id, offset + AppConfig.complaintsPageSize, true, false);
    },
    [fetchPage, hasMore, loadingMore, offset],
  );

  const refresh = useCallback(
    async (id: string) => {
      if (!id) return;
      await fetchPage(id, 0, false, false);
    },
    [fetchPage],
  );

  const clear = useCallback(() => {
    setCompanyId(null);
    setItems([]);
    setOffset(0);
    setHasMore(false);
    setLoaded(false);
    setLoading(false);
    setLoadingMore(false);
    setError(null);
  }, []);

  const prepend = useCallback((complaint: Complaint) => {
    if (complaint.product_id == null) return;
    setItems((prev) => {
      if (prev.some((c) => c.id === complaint.id)) return prev;
      return [complaint, ...prev];
    });
    setLoaded(true);
  }, []);

  const value = useMemo(
    () => ({
      companyId,
      items,
      offset,
      hasMore,
      loaded,
      loading,
      loadingMore,
      error,
      ensureLoaded,
      loadMore,
      refresh,
      clear,
      prepend,
    }),
    [
      companyId,
      items,
      offset,
      hasMore,
      loaded,
      loading,
      loadingMore,
      error,
      ensureLoaded,
      loadMore,
      refresh,
      clear,
      prepend,
    ],
  );

  return (
    <ComplaintsCacheContext.Provider value={value}>
      {children}
    </ComplaintsCacheContext.Provider>
  );
}

export function useComplaintsCache(): ComplaintsCacheState {
  const ctx = useContext(ComplaintsCacheContext);
  if (!ctx) {
    throw new Error("useComplaintsCache must be used within ComplaintsCacheProvider");
  }
  return ctx;
}
