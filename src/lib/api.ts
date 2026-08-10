import { AppConfig } from "./config";
import { getSupabase } from "./supabase";
import type {
  Complaint,
  Department,
  Facility,
  Product,
  Template,
  TemplateField,
  UserProfile,
  Company,
} from "./types";

export class ApiError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

async function getAccessToken(): Promise<string> {
  const supabase = getSupabase();
  const { data } = await supabase.auth.getSession();
  let session = data.session;

  if (!session?.access_token) {
    const refreshed = await supabase.auth.refreshSession();
    session = refreshed.data.session;
  } else {
    const expiresAt = session.expires_at ?? 0;
    const now = Math.floor(Date.now() / 1000);
    if (expiresAt - now < 60) {
      const refreshed = await supabase.auth.refreshSession();
      session = refreshed.data.session ?? session;
    }
  }

  if (!session?.access_token) {
    throw new ApiError("Not authenticated", 401);
  }

  return session.access_token;
}

async function apiGet<T>(
  path: string,
  params?: Record<string, string | number | undefined | null>,
): Promise<T> {
  const token = await getAccessToken();
  const url = buildApiUrl(path, params);

  let res: Response;
  try {
    res = await fetch(url, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/json",
      },
      cache: "no-store",
    });
  } catch {
    throw new ApiError(
      "Failed to reach the Hinza API. Check your network, or ensure NEXT_PUBLIC_API_BASE_URL points at the /hinza-api proxy.",
      0,
    );
  }

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new ApiError(text || `Request failed (${res.status})`, res.status);
  }

  return (await res.json()) as T;
}

function buildApiUrl(
  path: string,
  params?: Record<string, string | number | undefined | null>,
): string {
  const base = AppConfig.apiBaseUrl.replace(/\/$/, "");
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;

  let url: URL;
  if (base.startsWith("http://") || base.startsWith("https://")) {
    url = new URL(`${base}${normalizedPath}`);
  } else {
    const origin =
      typeof window !== "undefined"
        ? window.location.origin
        : "http://localhost:3000";
    url = new URL(`${origin}${base}${normalizedPath}`);
  }

  if (params) {
    for (const [key, value] of Object.entries(params)) {
      if (value !== undefined && value !== null && value !== "") {
        url.searchParams.set(key, String(value));
      }
    }
  }

  return url.toString();
}

function asArray<T>(data: unknown): T[] {
  if (Array.isArray(data)) return data as T[];
  if (data && typeof data === "object") {
    const obj = data as Record<string, unknown>;
    for (const key of ["data", "items", "results", "companies", "products", "facilities", "departments", "templates", "complaints"]) {
      if (Array.isArray(obj[key])) return obj[key] as T[];
    }
  }
  return [];
}

function parseTemplateFields(raw: unknown): TemplateField[] {
  if (!Array.isArray(raw)) return [];
  return raw.map((field) => {
    const f = field as Record<string, unknown>;
    const options = Array.isArray(f.options)
      ? f.options.map(String)
      : [];
    return {
      id: (f.id as string) ?? null,
      field_name: String(f.field_name ?? f.fieldName ?? ""),
      field_type: String(f.field_type ?? f.fieldType ?? "text"),
      is_required: Boolean(f.is_required ?? f.isRequired ?? false),
      field_order:
        typeof f.field_order === "number"
          ? f.field_order
          : typeof f.fieldOrder === "number"
            ? f.fieldOrder
            : null,
      options,
    };
  });
}

function parseUserProfile(raw: unknown): UserProfile | null {
  if (!raw || typeof raw !== "object") return null;
  const root = raw as Record<string, unknown>;
  const user =
    root.user && typeof root.user === "object"
      ? (root.user as Record<string, unknown>)
      : root;

  const companyRaw =
    (user.company as Record<string, unknown> | undefined) ??
    (root.company as Record<string, unknown> | undefined);

  const company: Company | undefined = companyRaw
    ? {
        id: String(companyRaw.id ?? user.company_id ?? ""),
        name: String(companyRaw.name ?? "Company"),
        created_at: companyRaw.created_at as string | undefined,
      }
    : user.company_id
      ? {
          id: String(user.company_id),
          name: String(user.company_name ?? "Company"),
        }
      : undefined;

  const dept =
    (user.department as Record<string, unknown> | undefined) ??
    (root.department as Record<string, unknown> | undefined);

  const manager =
    (user.manager as Record<string, unknown> | undefined) ??
    (dept?.manager as Record<string, unknown> | undefined);

  const id = String(user.id ?? "");
  const companyId = String(
    user.company_id ?? company?.id ?? root.company_id ?? "",
  );

  if (!id || !companyId) return null;

  return {
    id,
    company_id: companyId,
    full_name: String(user.full_name ?? user.name ?? user.email ?? "User"),
    email: String(user.email ?? ""),
    is_active: user.is_active !== false,
    company,
    department_id:
      (user.department_id as string | null | undefined) ??
      (dept?.id as string | undefined) ??
      null,
    department_name:
      (user.department_name as string | null | undefined) ??
      (dept?.name as string | undefined) ??
      null,
    manager_id:
      (user.manager_id as string | null | undefined) ??
      (manager?.id as string | undefined) ??
      null,
    manager_name:
      (user.manager_name as string | null | undefined) ??
      (manager?.full_name as string | undefined) ??
      (manager?.name as string | undefined) ??
      null,
  };
}

function parseDepartment(raw: Record<string, unknown>): Department {
  const manager = raw.manager as Record<string, unknown> | undefined;
  return {
    id: String(raw.id),
    name: String(raw.name ?? ""),
    company_id: String(raw.company_id ?? ""),
    manager_id:
      (raw.manager_id as string | null | undefined) ??
      (manager?.id as string | undefined) ??
      null,
    manager_name:
      (raw.manager_name as string | null | undefined) ??
      (manager?.full_name as string | undefined) ??
      (manager?.name as string | undefined) ??
      null,
  };
}

export const api = {
  async verifyUser(): Promise<UserProfile | null> {
    const data = await apiGet<unknown>("/api/auth/verify-user");
    return parseUserProfile(data);
  },

  async getProducts(companyId: string): Promise<Product[]> {
    const data = await apiGet<unknown>("/api/products", {
      company_id: companyId,
    });
    return asArray<Product>(data);
  },

  async getFacilities(
    companyId: string,
    facilityType?: string,
  ): Promise<Facility[]> {
    const data = await apiGet<unknown>("/api/facilities", {
      company_id: companyId,
      facility_type: facilityType,
    });
    return asArray<Facility>(data);
  },

  async getDepartments(companyId: string): Promise<Department[]> {
    const data = await apiGet<unknown>("/api/departments", {
      company_id: companyId,
    });
    return asArray<Record<string, unknown>>(data).map(parseDepartment);
  },

  async getTemplates(companyId: string): Promise<Template[]> {
    const data = await apiGet<unknown>("/api/templates", {
      company_id: companyId,
    });
    return asArray<Record<string, unknown>>(data).map((t) => ({
      id: String(t.id),
      name: String(t.name ?? ""),
      description: (t.description as string | null) ?? null,
      source_template_id: String(
        t.source_template_id ?? t.sourceTemplateId ?? t.id,
      ),
      fields: parseTemplateFields(t.fields),
    }));
  },

  async getComplaints(
    companyId: string,
    opts?: { limit?: number; offset?: number; assignedToId?: string },
  ): Promise<Complaint[]> {
    const data = await apiGet<unknown>("/api/complaints", {
      company_id: companyId,
      limit: opts?.limit ?? AppConfig.complaintsPageSize,
      offset: opts?.offset ?? 0,
      assigned_to_id: opts?.assignedToId,
    });
    return asArray<Complaint>(data);
  },
};
