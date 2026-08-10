"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { api } from "@/lib/api";
import { getSupabase, isSupabaseConfigured } from "@/lib/supabase";
import type { Company, LastSubmittedComplaint, UserProfile } from "@/lib/types";
import type { Session, AuthChangeEvent } from "@supabase/supabase-js";

interface AuthState {
  loading: boolean;
  /** True while a session exists and we are still resolving company profile */
  profileLoading: boolean;
  session: Session | null;
  userProfile: UserProfile | null;
  selectedCompany: Company | null;
  lastSubmittedComplaint: LastSubmittedComplaint | null;
  online: boolean;
  configError: string | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshProfile: () => Promise<UserProfile | null>;
  setLastSubmittedComplaint: (value: LastSubmittedComplaint | null) => void;
}

const AuthContext = createContext<AuthState | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [loading, setLoading] = useState(true);
  const [profileLoading, setProfileLoading] = useState(false);
  const [session, setSession] = useState<Session | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);
  const [lastSubmittedComplaint, setLastSubmittedComplaint] =
    useState<LastSubmittedComplaint | null>(null);
  const [online, setOnline] = useState(true);
  const [configError, setConfigError] = useState<string | null>(null);
  const profileRequestId = useRef(0);
  const hasCompanyRef = useRef(false);

  const applyProfile = useCallback((profile: UserProfile | null) => {
    setUserProfile(profile);
    if (profile?.company) {
      hasCompanyRef.current = true;
      setSelectedCompany(profile.company);
    } else if (profile?.company_id) {
      hasCompanyRef.current = true;
      setSelectedCompany({
        id: profile.company_id,
        name: "Company",
      });
    } else {
      hasCompanyRef.current = false;
      setSelectedCompany(null);
    }
  }, []);

  const loadProfile = useCallback(
    async (opts?: { force?: boolean }) => {
      const requestId = ++profileRequestId.current;
      // Keep the app visible if we already have a company (e.g. tab focus / token refresh).
      const showLoading = opts?.force || !hasCompanyRef.current;
      if (showLoading) setProfileLoading(true);

      try {
        const profile = await api.verifyUser();
        if (requestId !== profileRequestId.current) return null;
        applyProfile(profile);
        return profile;
      } catch {
        if (requestId !== profileRequestId.current) return null;
        // Don't wipe an existing in-memory profile on a transient tab-focus failure.
        if (!hasCompanyRef.current) applyProfile(null);
        return null;
      } finally {
        if (requestId === profileRequestId.current && showLoading) {
          setProfileLoading(false);
        }
      }
    },
    [applyProfile],
  );

  const refreshProfile = useCallback(async () => {
    return loadProfile({ force: true });
  }, [loadProfile]);

  useEffect(() => {
    setOnline(navigator.onLine);
    const onOnline = () => setOnline(true);
    const onOffline = () => setOnline(false);
    window.addEventListener("online", onOnline);
    window.addEventListener("offline", onOffline);
    return () => {
      window.removeEventListener("online", onOnline);
      window.removeEventListener("offline", onOffline);
    };
  }, []);

  useEffect(() => {
    let mounted = true;
    let unsubscribe: (() => void) | undefined;

    async function init() {
      if (!isSupabaseConfigured()) {
        setConfigError(
          "Supabase is not configured. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY.",
        );
        setLoading(false);
        return;
      }

      try {
        const supabase = getSupabase();
        const { data } = await supabase.auth.getSession();
        if (!mounted) return;
        setSession(data.session);

        if (data.session) {
          await loadProfile({ force: true });
        }

        const { data: sub } = supabase.auth.onAuthStateChange(
          async (event: AuthChangeEvent, nextSession: Session | null) => {
            setSession(nextSession);
            if (!nextSession) {
              profileRequestId.current += 1;
              hasCompanyRef.current = false;
              applyProfile(null);
              setProfileLoading(false);
              return;
            }

            // Tab focus often refreshes the JWT (TOKEN_REFRESHED) — do not re-fetch profile.
            // Only resolve profile when we actually need one.
            if (
              (event === "SIGNED_IN" || event === "INITIAL_SESSION") &&
              !hasCompanyRef.current
            ) {
              await loadProfile();
            }
          },
        );

        unsubscribe = () => sub.subscription.unsubscribe();
      } catch (err) {
        if (mounted) {
          setConfigError(
            err instanceof Error ? err.message : "Failed to initialize auth",
          );
        }
      } finally {
        if (mounted) setLoading(false);
      }
    }

    void init();
    return () => {
      mounted = false;
      unsubscribe?.();
    };
  }, [applyProfile, loadProfile]);

  const login = useCallback(
    async (email: string, password: string) => {
      const supabase = getSupabase();
      hasCompanyRef.current = false;
      setProfileLoading(true);
      const { error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });
      if (error) {
        setProfileLoading(false);
        throw new Error(error.message);
      }

      const { data } = await supabase.auth.getSession();
      setSession(data.session);
      await loadProfile({ force: true });
    },
    [loadProfile],
  );

  const logout = useCallback(async () => {
    profileRequestId.current += 1;
    hasCompanyRef.current = false;
    applyProfile(null);
    setLastSubmittedComplaint(null);
    setProfileLoading(false);
    const supabase = getSupabase();
    await supabase.auth.signOut();
    setSession(null);
  }, [applyProfile]);

  const value = useMemo<AuthState>(
    () => ({
      loading,
      profileLoading,
      session,
      userProfile,
      selectedCompany,
      lastSubmittedComplaint,
      online,
      configError,
      login,
      logout,
      refreshProfile,
      setLastSubmittedComplaint,
    }),
    [
      loading,
      profileLoading,
      session,
      userProfile,
      selectedCompany,
      lastSubmittedComplaint,
      online,
      configError,
      login,
      logout,
      refreshProfile,
    ],
  );

  return (
    <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
  );
}

export function useAuth(): AuthState {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
