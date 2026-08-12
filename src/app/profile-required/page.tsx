"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/providers";
import { Button, Card, Spinner } from "@/components/layout/AppShell";

export default function ProfileRequiredPage() {
  const { refreshProfile, logout, userProfile, selectedCompany, profileLoading } =
    useAuth();
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    if (selectedCompany) {
      router.replace("/home");
    }
  }, [selectedCompany, router]);

  // Auto-retry a few times before asking the user to act.
  useEffect(() => {
    if (selectedCompany || profileLoading) return;
    if (attempt >= 3) return;

    const t = window.setTimeout(() => {
      void (async () => {
        setError(null);
        try {
          const profile = await refreshProfile();
          if (!profile?.company_id) {
            setAttempt((n) => n + 1);
            setError(
              "Still loading your company profile. Please keep this tab open…",
            );
          }
        } catch (err) {
          setAttempt((n) => n + 1);
          setError(err instanceof Error ? err.message : "Failed to load profile");
        }
      })();
    }, attempt === 0 ? 400 : 1200);

    return () => window.clearTimeout(t);
  }, [attempt, selectedCompany, profileLoading, refreshProfile]);

  async function onLogout() {
    await logout();
    router.replace("/login");
  }

  if (selectedCompany || profileLoading || attempt < 3) {
    return (
      <div className="flex min-h-dvh flex-col items-center justify-center bg-[#EFF4FF] px-6">
        <Spinner label="Loading your profile…" />
        <p className="mt-2 max-w-sm text-center text-xs text-gray-500">
          This can take a moment after sign-in.
        </p>
      </div>
    );
  }

  return (
    <div className="flex min-h-dvh items-center justify-center bg-[#EFF4FF] p-6">
      <Card className="w-full max-w-lg">
        <h1 className="text-2xl font-bold text-[#081636]">
          Profile required
        </h1>
        <p className="mt-2 text-sm text-gray-600">
          We could not resolve your company profile
          {userProfile?.email ? ` for ${userProfile.email}` : ""}. Retry, or
          sign out and try another account.
        </p>

        {error && (
          <p className="mt-4 rounded-md bg-red-50 p-4 text-sm text-red-800">
            {error}
          </p>
        )}

        <div className="mt-6 flex flex-wrap gap-3">
          <Button
            onClick={() => {
              setAttempt(0);
              setError(null);
            }}
          >
            Retry
          </Button>
          <Button variant="secondary" onClick={onLogout}>
            Logout
          </Button>
        </div>
      </Card>
    </div>
  );
}
