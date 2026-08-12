"use client";

import { useEffect, type ReactNode } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/components/providers";
import { Button, Card, Spinner } from "@/components/layout/AppShell";
import { WifiOff } from "lucide-react";

const PUBLIC = new Set(["/", "/login", "/splash"]);

function ProfileSkeleton({ label = "Loading your profile…" }: { label?: string }) {
  return (
    <div className="flex min-h-dvh flex-col bg-[#EFF4FF]">
      <div className="h-14 bg-[#0108B8] md:hidden" />
      <div className="mx-auto w-full max-w-6xl flex-1 px-4 py-6 md:p-6">
        <div className="mb-6 space-y-3">
          <div className="h-8 w-48 animate-pulse rounded-md bg-blue-100" />
          <div className="h-4 w-72 max-w-full animate-pulse rounded-md bg-blue-100" />
        </div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div
              key={i}
              className="h-24 animate-pulse rounded-lg border border-gray-200 bg-white sm:h-36"
              style={{
                boxShadow:
                  "0 4px 6px -1px rgba(37, 99, 235, 0.15), 0 2px 4px -2px rgba(37, 99, 235, 0.15)",
              }}
            />
          ))}
        </div>
        <div className="mt-10 flex flex-col items-center gap-3 text-gray-500">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
          <p className="text-sm">{label}</p>
        </div>
      </div>
    </div>
  );
}

export function AuthGate({ children }: { children: ReactNode }) {
  const {
    loading,
    profileLoading,
    session,
    selectedCompany,
    online,
    configError,
  } = useAuth();
  const pathname = usePathname();
  const router = useRouter();

  const isPublic = PUBLIC.has(pathname);
  const resolvingProfile = Boolean(
    session && profileLoading && !selectedCompany,
  );
  const needsProfile =
    Boolean(session) && !selectedCompany && !profileLoading;
  const authenticated = Boolean(session && selectedCompany);

  useEffect(() => {
    if (loading || profileLoading) return;

    if (!session && !isPublic && pathname !== "/login") {
      router.replace("/login");
      return;
    }

    if (needsProfile && pathname !== "/profile-required" && !isPublic) {
      router.replace("/profile-required");
      return;
    }

    if (needsProfile && isPublic) {
      router.replace("/profile-required");
      return;
    }

    // Only bounce auth screens → home. Never yank the user off /complaints-list etc.
    if (authenticated && isPublic) {
      router.replace("/home");
    }
  }, [
    loading,
    profileLoading,
    session,
    selectedCompany,
    needsProfile,
    authenticated,
    isPublic,
    pathname,
    router,
  ]);

  if (configError) {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-[#EFF4FF] p-6">
        <Card className="max-w-lg">
          <h1 className="text-xl font-bold text-[#081636]">
            Configuration required
          </h1>
          <p className="mt-2 text-sm text-gray-600">{configError}</p>
          <p className="mt-3 text-sm text-gray-500">
            Copy <code className="rounded bg-gray-100 px-1">.env.example</code>{" "}
            to <code className="rounded bg-gray-100 px-1">.env.local</code> and
            add your Supabase anon credentials.
          </p>
        </Card>
      </div>
    );
  }

  if (!online) {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-[#EFF4FF] p-6">
        <Card className="max-w-md text-center">
          <WifiOff className="mx-auto h-10 w-10 text-[#2563EB]" />
          <h1 className="mt-3 text-xl font-bold text-[#081636]">You are offline</h1>
          <p className="mt-2 text-sm text-gray-600">
            An internet connection is required to use Hinza Complaints.
          </p>
          <Button className="mt-4" onClick={() => window.location.reload()}>
            Retry
          </Button>
        </Card>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-[#EFF4FF]">
        <Spinner label="Starting Hinza…" />
      </div>
    );
  }

  if (resolvingProfile) {
    return <ProfileSkeleton />;
  }

  // Prevent sign-in flash: never paint /login (or splash) once we already have a company.
  if (authenticated && isPublic) {
    return <ProfileSkeleton label="Opening Hinza…" />;
  }

  return <>{children}</>;
}
