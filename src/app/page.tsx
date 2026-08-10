"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function SplashPage() {
  const router = useRouter();

  useEffect(() => {
    const t = window.setTimeout(() => {
      router.replace("/login");
    }, 1800);
    return () => window.clearTimeout(t);
  }, [router]);

  return (
    <div className="safe-top safe-bottom flex min-h-dvh flex-col items-center justify-center bg-[var(--sidebar)] px-6 text-white">
      <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-2xl bg-white/15 text-3xl font-bold">
        H
      </div>
      <h1 className="text-3xl font-bold tracking-tight">Hinza</h1>
      <p className="mt-2 text-sm text-white/70">Complaint Management</p>
      <div className="mt-10 h-8 w-8 animate-spin rounded-full border-2 border-white/30 border-t-white" />
    </div>
  );
}
