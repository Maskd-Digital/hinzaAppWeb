"use client";

import { useEffect } from "react";
import Image from "next/image";
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
    <div className="safe-top safe-bottom flex min-h-dvh flex-col items-center justify-center bg-[#0108B8] px-6">
      <div
        className="rounded-md border border-gray-300 bg-white px-5 py-4"
        style={{ boxShadow: "inset 0 2px 4px rgba(37, 99, 235, 0.25)" }}
      >
        <Image
          src="/hinza-logo.png"
          alt="Hinza by Mask'd"
          width={260}
          height={72}
          className="h-16 w-auto object-contain"
          priority
        />
      </div>
      <p className="mt-5 text-sm text-white/80">Complaint Management</p>
      <p className="mt-2 text-xs text-white/60">
        By{" "}
        <a
          href="https://www.maskd.digital/"
          target="_blank"
          rel="noopener noreferrer"
          className="underline decoration-white/40 underline-offset-2 hover:text-white hover:decoration-white"
        >
          Mask&apos;d
        </a>
      </p>
      <div className="mt-10 h-8 w-8 animate-spin rounded-full border-4 border-white/40 border-t-white" />
    </div>
  );
}
