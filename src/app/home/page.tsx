"use client";

import { useRouter } from "next/navigation";
import {
  Factory,
  Package,
  Store,
  Truck,
  MoreHorizontal,
  type LucideIcon,
} from "lucide-react";
import { useAuth } from "@/components/providers";
import { AppShell, Card } from "@/components/layout/AppShell";
import { ORIGINS, type ComplaintOrigin } from "@/lib/config";
import { originLabel } from "@/lib/validation";

const ICONS: Record<ComplaintOrigin, LucideIcon> = {
  Manufacturing: Factory,
  Warehouse: Package,
  Retail: Store,
  Logistics: Truck,
  Other: MoreHorizontal,
};

export default function HomePage() {
  const router = useRouter();
  const { userProfile, selectedCompany } = useAuth();

  function onSelectOrigin(origin: ComplaintOrigin) {
    if (origin === "Retail") {
      router.push(`/new-complaint?origin=${encodeURIComponent(origin)}`);
      return;
    }
    router.push(`/origin-type?origin=${encodeURIComponent(origin)}`);
  }

  return (
    <AppShell
      title="Complaint Origin"
      subtitle={`Welcome, ${userProfile?.full_name ?? "User"} — ${selectedCompany?.name ?? "your company"}`}
    >
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-3">
        {ORIGINS.map((origin) => {
          const Icon = ICONS[origin];
          return (
            <button
              key={origin}
              type="button"
              onClick={() => onSelectOrigin(origin)}
              className="min-h-[4.5rem] text-left active:scale-[0.99]"
            >
              <Card className="flex h-full items-center gap-4 transition hover:opacity-95 sm:block">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-[#EFF4FF] text-[#2563EB] sm:mb-4">
                  <Icon className="h-5 w-5" />
                </div>
                <div className="min-w-0">
                  <h2 className="text-base font-semibold text-[#081636] sm:text-lg">
                    {originLabel(origin)}
                  </h2>
                  <p className="mt-0.5 text-xs text-gray-500 sm:mt-1 sm:text-sm">
                    Start a new complaint from this origin
                  </p>
                </div>
              </Card>
            </button>
          );
        })}
      </div>
    </AppShell>
  );
}
