"use client";

import { FormEvent, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/providers";
import { useToast } from "@/components/ui/toast";
import {
  Button,
  FieldLabel,
  TextInput,
} from "@/components/layout/AppShell";

export default function LoginPage() {
  const { login } = useAuth();
  const { toast } = useToast();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    try {
      await login(email, password, {
        onAuthenticated: () => {
          toast("Signed in successfully", "success");
        },
      });
      // Only land on home from the auth screens — never yank if user already moved.
      const path =
        typeof window !== "undefined" ? window.location.pathname : "/login";
      if (
        path === "/login" ||
        path === "/" ||
        path === "/splash" ||
        path === "/profile-required"
      ) {
        router.replace("/home");
      }
    } catch (err) {
      toast(err instanceof Error ? err.message : "Login failed", "error");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="flex min-h-dvh flex-col bg-[#EFF4FF] lg:flex-row">
      <div className="safe-top bg-[#0108B8] px-5 pb-8 pt-10 lg:hidden">
        <div className="mx-auto flex max-w-md flex-col items-start">
          <div
            className="rounded-md border border-gray-300 bg-white px-3 py-2"
            style={{ boxShadow: "inset 0 2px 4px rgba(37, 99, 235, 0.25)" }}
          >
            <Image
              src="/hinza-logo.png"
              alt="Hinza by Mask'd"
              width={200}
              height={56}
              className="h-12 w-auto object-contain"
              priority
            />
          </div>
          <p className="mt-4 text-sm text-white/80">Complaint Management</p>
        </div>
      </div>

      <div className="hidden w-[42%] flex-col justify-between bg-[#0108B8] p-10 text-white lg:flex">
        <div>
          <div
            className="inline-block rounded-md border border-gray-300 bg-white px-4 py-3"
            style={{ boxShadow: "inset 0 2px 4px rgba(37, 99, 235, 0.25)" }}
          >
            <Image
              src="/hinza-logo.png"
              alt="Hinza by Mask'd"
              width={240}
              height={68}
              className="h-14 w-auto object-contain"
              priority
            />
          </div>
          <p className="mt-4 text-sm text-white/80">Complaint Management</p>
        </div>
        <div>
          <h2 className="text-3xl font-bold leading-tight text-white">
            File and track complaints in one place
          </h2>
          <p className="mt-3 max-w-md text-sm text-white/80">
            Product and equipment complaint flows for your company — powered by
            the same Hinza backend as the mobile app.
          </p>
        </div>
        <p className="text-xs text-white/50">
          © Hinza · By{" "}
          <a
            href="https://www.maskd.digital/"
            target="_blank"
            rel="noopener noreferrer"
            className="underline decoration-white/40 underline-offset-2 transition hover:text-white hover:decoration-white"
          >
            Mask&apos;d
          </a>
        </p>
      </div>

      <div className="flex flex-1 items-start justify-center px-4 py-6 sm:items-center sm:p-6">
        <div
          className="w-full max-w-md -mt-4 rounded-lg border border-gray-200 bg-white p-5 sm:p-6 lg:mt-0"
          style={{ boxShadow: "0 4px 6px rgba(37, 99, 235, 0.35)" }}
        >
          <h1 className="text-xl font-bold text-[#081636] sm:text-2xl">
            Sign in
          </h1>
          <p className="mt-1 text-sm text-gray-600">
            Use your company email and password
          </p>

          <form onSubmit={onSubmit} className="mt-6 space-y-4">
            <div>
              <FieldLabel>Email</FieldLabel>
              <TextInput
                type="email"
                inputMode="email"
                autoComplete="email"
                autoCapitalize="none"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@company.com"
              />
            </div>
            <div>
              <FieldLabel>Password</FieldLabel>
              <TextInput
                type="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
              />
            </div>
            <Button
              type="submit"
              className="w-full"
              disabled={submitting || !email || !password}
            >
              {submitting ? "Signing in…" : "Sign in"}
            </Button>
          </form>

          <p className="mt-6 text-center text-xs text-gray-500">
            By{" "}
            <a
              href="https://www.maskd.digital/"
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium text-[#2563EB] underline underline-offset-2 hover:opacity-80"
            >
              Mask&apos;d
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
