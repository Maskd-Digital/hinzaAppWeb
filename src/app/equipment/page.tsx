"use client";

import { Suspense, useCallback, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Building2 } from "lucide-react";
import { useAuth } from "@/components/providers";
import {
  AppShell,
  Button,
  Card,
  EmptyState,
  Spinner,
} from "@/components/layout/AppShell";
import { api } from "@/lib/api";
import type { Facility } from "@/lib/types";

function EquipmentHomeContent() {
  const params = useSearchParams();
  const origin = params.get("origin") ?? "Manufacturing";
  const router = useRouter();
  const { selectedCompany } = useAuth();
  const [facilities, setFacilities] = useState<Facility[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!selectedCompany?.id) return;
    setLoading(true);
    setError(null);
    try {
      const list = await api.getFacilities(selectedCompany.id, origin);
      setFacilities(list.filter((f) => f.is_active !== false));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load facilities");
    } finally {
      setLoading(false);
    }
  }, [selectedCompany?.id, origin]);

  useEffect(() => {
    void load();
  }, [load]);

  return (
    <AppShell
      title="Equipment Complaint"
      subtitle={`Select a facility · Origin: ${origin}`}
    >
      <div className="mb-4">
        <Button
          variant="secondary"
          className="w-full sm:w-auto"
          onClick={() => router.back()}
        >
          Back
        </Button>
      </div>

      {loading ? (
        <Spinner label="Loading facilities…" />
      ) : error ? (
        <Card>
          <p className="text-sm text-red-600">{error}</p>
          <Button className="mt-3 w-full sm:w-auto" onClick={() => void load()}>
            Retry
          </Button>
        </Card>
      ) : facilities.length === 0 ? (
        <Card>
          <EmptyState
            title="No facilities found"
            description="No facilities match this origin for your company."
          />
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          {facilities.map((f) => (
            <button
              key={f.id}
              type="button"
              className="text-left active:scale-[0.99]"
              onClick={() =>
                router.push(
                  `/equipment-form?facilityId=${encodeURIComponent(f.id)}&facilityName=${encodeURIComponent(f.name)}&origin=${encodeURIComponent(origin)}`,
                )
              }
            >
              <Card className="transition hover:shadow-md sm:hover:-translate-y-0.5">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#EFF4FF] text-[#2563EB]">
                    <Building2 className="h-4 w-4" />
                  </div>
                  <div className="min-w-0">
                    <h2 className="truncate font-semibold text-[#081636]">
                      {f.name}
                    </h2>
                    {(f.city || f.address) && (
                      <p className="truncate text-xs text-gray-500">
                        {[f.address, f.city].filter(Boolean).join(", ")}
                      </p>
                    )}
                  </div>
                </div>
              </Card>
            </button>
          ))}
        </div>
      )}
    </AppShell>
  );
}

export default function EquipmentHomePage() {
  return (
    <Suspense fallback={<Spinner />}>
      <EquipmentHomeContent />
    </Suspense>
  );
}
