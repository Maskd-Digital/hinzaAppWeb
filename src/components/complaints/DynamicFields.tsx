"use client";

import { useMemo } from "react";
import type { TemplateField } from "@/lib/types";
import { normalizeFieldType } from "@/lib/complaints";
import {
  FieldLabel,
  TextInput,
  TextTextarea,
} from "@/components/layout/AppShell";
import { AppSelect } from "@/components/ui/AppSelect";

export type FieldValue = string | boolean | File[] | null;

interface Props {
  fields: TemplateField[];
  values: Record<string, FieldValue>;
  onChange: (fieldName: string, value: FieldValue) => void;
}

export function DynamicFields({ fields, values, onChange }: Props) {
  const ordered = useMemo(
    () =>
      [...fields].sort(
        (a, b) => (a.field_order ?? 999) - (b.field_order ?? 999),
      ),
    [fields],
  );

  return (
    <div className="space-y-4">
      {ordered.map((field) => {
        const type = normalizeFieldType(field.field_type);
        const label = `${field.field_name}${field.is_required ? " *" : ""}`;
        const value = values[field.field_name];

        if (type === "textarea") {
          return (
            <div key={field.field_name}>
              <FieldLabel>{label}</FieldLabel>
              <TextTextarea
                rows={4}
                value={typeof value === "string" ? value : ""}
                onChange={(e) => onChange(field.field_name, e.target.value)}
              />
            </div>
          );
        }

        if (type === "number") {
          return (
            <div key={field.field_name}>
              <FieldLabel>{label}</FieldLabel>
              <TextInput
                type="number"
                value={typeof value === "string" ? value : ""}
                onChange={(e) => onChange(field.field_name, e.target.value)}
              />
            </div>
          );
        }

        if (type === "date") {
          return (
            <div key={field.field_name}>
              <FieldLabel>{label}</FieldLabel>
              <TextInput
                type="date"
                value={typeof value === "string" ? value : ""}
                onChange={(e) => onChange(field.field_name, e.target.value)}
              />
            </div>
          );
        }

        if (type === "select") {
          return (
            <div key={field.field_name}>
              <FieldLabel>{label}</FieldLabel>
              <AppSelect
                aria-label={field.field_name}
                placeholder="Select…"
                value={typeof value === "string" ? value : ""}
                onChange={(next) => onChange(field.field_name, next)}
                options={field.options.map((opt) => ({
                  value: opt,
                  label: opt,
                }))}
              />
            </div>
          );
        }

        if (type === "boolean") {
          return (
            <label
              key={field.field_name}
              className="flex items-center gap-2 text-sm text-slate-700"
            >
              <input
                type="checkbox"
                checked={Boolean(value)}
                onChange={(e) => onChange(field.field_name, e.target.checked)}
                className="h-4 w-4 rounded border-slate-300 text-[var(--brand-blue)]"
              />
              {label}
            </label>
          );
        }

        if (type === "file") {
          const files = Array.isArray(value) ? value : [];
          return (
            <div key={field.field_name}>
              <FieldLabel>{label}</FieldLabel>
              <TextInput
                type="file"
                accept="image/*"
                capture="environment"
                multiple
                onChange={(e) => {
                  const list = e.target.files
                    ? Array.from(e.target.files)
                    : [];
                  onChange(field.field_name, list);
                }}
              />
              {files.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-2">
                  {files.map((file, idx) => (
                    <div
                      key={`${file.name}-${idx}`}
                      className="overflow-hidden rounded-lg border border-slate-200"
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={URL.createObjectURL(file)}
                        alt={file.name}
                        className="h-20 w-20 object-cover"
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        }

        return (
          <div key={field.field_name}>
            <FieldLabel>{label}</FieldLabel>
            <TextInput
              type="text"
              value={typeof value === "string" ? value : ""}
              onChange={(e) => onChange(field.field_name, e.target.value)}
            />
          </div>
        );
      })}
    </div>
  );
}

export function areRequiredFieldsFilled(
  fields: TemplateField[],
  values: Record<string, FieldValue>,
): boolean {
  return fields.every((field) => {
    if (!field.is_required) return true;
    const type = normalizeFieldType(field.field_type);
    const value = values[field.field_name];
    if (type === "boolean") return value === true || value === false;
    if (type === "file") return Array.isArray(value) && value.length > 0;
    if (typeof value === "string") return value.trim().length > 0;
    return Boolean(value);
  });
}
