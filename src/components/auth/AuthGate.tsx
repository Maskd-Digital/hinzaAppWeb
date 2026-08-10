"use client";

import { useEffect, type ReactNode } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/components/providers";
import { Button, Card, Spinner } from "@/components/layout/AppShell";
import { WifiOff } from "lucide-react";

const PUBLIC = new Set(["/", "/login", "/splash"]);

function ProfileSkeleton() {
  return (
    <div className="flex min-h-dvh flex-col bg-[var(--bg-page)]">
      <div className="h-14 bg-[var(--sidebar)] md:hidden" />
      <div className="mx-auto w-full max-w-6xl flex-1 px-4 py-6 md:px-8 md:py-8">
        <div className="mb-6 space-y-3">
          <div className="h-8 w-48 animate-pulse rounded-lg bg-slate-200" />
          <div className="h-4 w-72 max-w-full animate-pulse rounded-lg bg-slate-200" />
        </div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div
              key={i}
              className="h-24 animate-pulse rounded-2xl bg-white shadow-sm sm:h-36"
            />
          ))}
        </div>
        <div className="mt-10 flex flex-col items-center gap-3 text-slate-500">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-slate-200 border-t-[var(--brand-blue)]" />
          <p className="text-sm">Loading your profile…</p>
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

  const resolvingProfile = Boolean(session && profileLoading);
  const needsProfile =
    Boolean(session) && !selectedCompany && !profileLoading;

  useEffect(() => {
    if (loading || profileLoading) return;

    const isPublic = PUBLIC.has(pathname);

    if (!session && !isPublic && pathname !== "/login") {
      router.replace("/login");
      return;
    }

    if (needsProfile && pathname !== "/profile-required" && !isPublic) {
      router.replace("/profile-required");
      return;
    }

    if (
      needsProfile &&
      (pathname === "/login" || pathname === "/" || pathname === "/splash")
    ) {
      router.replace("/profile-required");
      return;
    }

    if (
      session &&
      selectedCompany &&
      (pathname === "/login" ||
        pathname === "/profile-required" ||
        pathname === "/" ||
        pathname === "/splash")
    ) {
      router.replace("/home");
    }
  }, [
    loading,
    profileLoading,
    session,
    selectedCompany,
    needsProfile,
    pathname,
    router,
  ]);

  if (configError) {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-[var(--bg-page)] p-6">
        <Card className="max-w-lg">
          <h1 className="text-xl font-bold text-[var(--brand-blue)]">
            Configuration required
          </h1>
          <p className="mt-2 text-sm text-slate-600">{configError}</p>
          <p className="mt-3 text-sm text-slate-500">
            Copy <code className="rounded bg-slate-100 px-1">.env.example</code>{" "}
            to <code className="rounded bg-slate-100 px-1">.env.local</code> and
            add your Supabase anon credentials.
          </p>
        </Card>
      </div>
    );
  }

  if (!online) {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-[var(--bg-page)] p-6">
        <Card className="max-w-md text-center">
          <WifiOff className="mx-auto h-10 w-10 text-[var(--brand-blue)]" />
          <h1 className="mt-3 text-xl font-bold text-slate-800">You are offline</h1>
          <p className="mt-2 text-sm text-slate-600">
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
      <div className="flex min-h-dvh items-center justify-center bg-[var(--bg-page)]">
        <Spinner label="Starting Hinza…" />
      </div>
    );
  }

  // Session exists but company profile still loading — never flash Profile required.
  if (resolvingProfile) {
    return <ProfileSkeleton />;
  }

  return <>{children}</>;
}

