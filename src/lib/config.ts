export const AppConfig = {
  // Same-origin proxy path (see next.config.ts rewrites). Avoids CORS when
  // calling hinza.vercel.app from the browser.
  apiBaseUrl: process.env.NEXT_PUBLIC_API_BASE_URL ?? "/hinza-api",
  supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL ?? "",
  supabaseAnonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "",
  storageBucket: "complaints",
  complaintsPageSize: 8,
} as const;

export const ORIGINS = [
  "Manufacturing",
  "Warehouse",
  "Retail",
  "Logistics",
  "Other",
] as const;

export type ComplaintOrigin = (typeof ORIGINS)[number];

export const STATUS_FILTERS = [
  "All Status",
  "Pending",
  "In Progress",
  "Resolved",
  "Closed",
] as const;
