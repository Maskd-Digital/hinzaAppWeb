"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { Box, Wrench } from "lucide-react";
import {
  AppShell,
  Button,
  Card,
  Spinner,
} from "@/components/layout/AppShell";

function OriginTypeContent() {
  const router = useRouter();
  const params = useSearchParams();
  const origin = params.get("origin") ?? "Manufacturing";
  const isRetail = origin.toLowerCase() === "retail";

  return (
    <AppShell title="Complaint Type" subtitle={`Origin: ${origin}`}>
      <div className="mb-4">
        <Button
          variant="secondary"
          className="w-full sm:w-auto"
          onClick={() => router.push("/home")}
        >
          Back
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:gap-4 md:grid-cols-2">
        <button
          type="button"
          onClick={() =>
            router.push(`/new-complaint?origin=${encodeURIComponent(origin)}`)
          }
          className="text-left active:scale-[0.99]"
        >
          <Card className="flex h-full items-center gap-4 transition hover:opacity-95 sm:block">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-[#EFF4FF] text-[#2563EB] sm:mb-4">
              <Box className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-[#081636] sm:text-lg">
                Product Related
              </h2>
              <p className="mt-0.5 text-xs text-gray-500 sm:mt-1 sm:text-sm">
                Multi-step product complaint with template fields and photos
              </p>
            </div>
          </Card>
        </button>

        {!isRetail && (
          <button
            type="button"
            onClick={() =>
              router.push(`/equipment?origin=${encodeURIComponent(origin)}`)
            }
            className="text-left active:scale-[0.99]"
          >
            <Card className="flex h-full items-center gap-4 transition hover:opacity-95 sm:block">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-[#EFF4FF] text-[#2563EB] sm:mb-4">
                <Wrench className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-base font-semibold text-[#081636] sm:text-lg">
                  Equipment Related
                </h2>
                <p className="mt-0.5 text-xs text-gray-500 sm:mt-1 sm:text-sm">
                  Submit an equipment complaint for a facility
                </p>
              </div>
            </Card>
          </button>
        )}
      </div>
    </AppShell>
  );
}

export default function OriginTypePage() {
  return (
    <Suspense fallback={<Spinner />}>
      <OriginTypeContent />
    </Suspense>
  );
}
