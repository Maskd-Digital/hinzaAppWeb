"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/providers";
import { useToast } from "@/components/ui/toast";
import {
  Button,
  Card,
  FieldLabel,
  TextInput,
} from "@/components/layout/AppShell";

export default function LoginPage() {
  const { login, loading, session, selectedCompany } = useAuth();
  const { toast } = useToast();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!loading && session && selectedCompany) {
      router.replace("/home");
    }
  }, [loading, session, selectedCompany, router]);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    try {
      await login(email, password);
      toast("Signed in successfully", "success");
      // AuthGate shows a skeleton while profile finishes, then routes to /home.
      router.replace("/home");
    } catch (err) {
      toast(err instanceof Error ? err.message : "Login failed", "error");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="flex min-h-dvh flex-col lg:flex-row">
      {/* Mobile brand header */}
      <div className="safe-top bg-[var(--sidebar)] px-5 pb-8 pt-10 text-white lg:hidden">
        <div className="mx-auto max-w-md">
          <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-white/15 text-lg font-bold">
            H
          </div>
          <p className="text-2xl font-bold">Hinza</p>
          <p className="mt-1 text-sm text-white/75">Complaint Management</p>
        </div>
      </div>

      <div className="hidden w-[42%] flex-col justify-between bg-[var(--sidebar)] p-10 text-white lg:flex">
        <div>
          <p className="text-2xl font-bold">Hinza</p>
          <p className="mt-1 text-sm text-white/70">Complaint Management</p>
        </div>
        <div>
          <h2 className="text-3xl font-bold leading-tight">
            File and track complaints in one place
          </h2>
          <p className="mt-3 max-w-md text-sm text-white/75">
            Product and equipment complaint flows for your company — powered by
            the same Hinza backend as the mobile app.
          </p>
        </div>
        <p className="text-xs text-white/50">© Hinza</p>
      </div>

      <div className="flex flex-1 items-start justify-center bg-[var(--bg-page)] px-4 py-6 sm:items-center sm:p-6 lg:-mt-0">
        <Card className="w-full max-w-md -mt-4 lg:mt-0">
          <h1 className="text-xl font-bold text-[var(--brand-blue)] sm:text-2xl">
            Sign in
          </h1>
          <p className="mt-1 text-sm text-slate-600">
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
        </Card>
      </div>
    </div>
  );
}
