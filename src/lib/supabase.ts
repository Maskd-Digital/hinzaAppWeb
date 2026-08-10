import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { AppConfig } from "./config";

let client: SupabaseClient | null = null;

export function getSupabase(): SupabaseClient {
  if (client) return client;

  if (!AppConfig.supabaseUrl || !AppConfig.supabaseAnonKey) {
    throw new Error(
      "Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY",
    );
  }

  client = createClient(AppConfig.supabaseUrl, AppConfig.supabaseAnonKey, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
    },
  });

  return client;
}

export function isSupabaseConfigured(): boolean {
  return Boolean(AppConfig.supabaseUrl && AppConfig.supabaseAnonKey);
}
