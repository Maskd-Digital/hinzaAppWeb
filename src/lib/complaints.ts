import { AppConfig } from "./config";
import { getSupabase } from "./supabase";
import type { CreateComplaintInput, StagedPhoto } from "./types";

function stripNulls<T extends Record<string, unknown>>(data: T): Partial<T> {
  const out: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(data)) {
    if (value !== null && value !== undefined) {
      out[key] = value;
    }
  }
  return out as Partial<T>;
}

export async function uploadComplaintImage(
  file: File,
  companyId: string,
  prefix = "photo",
): Promise<StagedPhoto & { publicUrl: string }> {
  const supabase = getSupabase();
  const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
  const path = `${companyId}/${prefix}_${Date.now()}_${safeName}`;

  const { error } = await supabase.storage
    .from(AppConfig.storageBucket)
    .upload(path, file, {
      cacheControl: "3600",
      upsert: false,
      contentType: file.type || "image/jpeg",
    });

  if (error) {
    throw new Error(error.message || "Failed to upload image");
  }

  const { data } = supabase.storage
    .from(AppConfig.storageBucket)
    .getPublicUrl(path);

  return {
    stage: prefix,
    path,
    publicUrl: data.publicUrl,
  };
}

export async function insertComplaint(
  input: CreateComplaintInput,
): Promise<Record<string, unknown>> {
  const supabase = getSupabase();
  const payload = stripNulls({
    ...input,
    // Never send top-level description (PostgREST may reject phantom column usage)
    description: undefined,
  });

  // Explicitly omit description
  delete (payload as { description?: unknown }).description;

  const { data, error } = await supabase
    .from("complaints")
    .insert(payload)
    .select()
    .single();

  if (error) {
    throw new Error(error.message || "Failed to create complaint");
  }

  return data as Record<string, unknown>;
}

export function isFileFieldType(fieldType: string): boolean {
  const t = fieldType.toLowerCase();
  return ["file", "photo", "image", "picture", "attachment"].includes(t);
}

export function normalizeFieldType(fieldType: string): string {
  const t = fieldType.toLowerCase();
  if (["string", "text"].includes(t)) return "text";
  if (t === "textarea") return "textarea";
  if (["number", "integer", "decimal", "float", "numeric", "input_number"].includes(t)) {
    return "number";
  }
  if (t === "date") return "date";
  if (t === "select") return "select";
  if (["boolean", "bool", "checkbox"].includes(t)) return "boolean";
  if (isFileFieldType(t)) return "file";
  return "text";
}
