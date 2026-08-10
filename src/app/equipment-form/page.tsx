"use client";

import { FormEvent, Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/components/providers";
import { useToast } from "@/components/ui/toast";
import {
  AppShell,
  Button,
  Card,
  FieldLabel,
  Spinner,
  TextInput,
  TextTextarea,
} from "@/components/layout/AppShell";
import { insertComplaint, uploadComplaintImage } from "@/lib/complaints";
import type { Complaint } from "@/lib/types";

function EquipmentFormContent() {
  const params = useSearchParams();
  const facilityId = params.get("facilityId") ?? "";
  const facilityName = params.get("facilityName") ?? "Facility";
  const origin = params.get("origin") ?? "";
  const router = useRouter();
  const { selectedCompany, userProfile, setLastSubmittedComplaint } =
    useAuth();
  const { toast } = useToast();

  const [image, setImage] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [description, setDescription] = useState("");
  const [submitting, setSubmitting] = useState(false);

  function onImageChange(file: File | null) {
    setImage(file);
    if (preview) URL.revokeObjectURL(preview);
    setPreview(file ? URL.createObjectURL(file) : null);
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (!image || !description.trim() || !selectedCompany || !userProfile) {
      toast("Image and description are required", "error");
      return;
    }
    if (submitting) return;
    setSubmitting(true);
    try {
      const uploaded = await uploadComplaintImage(
        image,
        selectedCompany.id,
        "equipment",
      );

      const customFields = {
        category: "equipment",
        facility_name: facilityName,
        description: description.trim(),
        equipment_image_url: uploaded.publicUrl,
        equipment_image_path: uploaded.path,
        origin: origin || undefined,
      };

      const created = (await insertComplaint({
        company_id: selectedCompany.id,
        title: `${facilityName} – Equipment Complaint`,
        submitted_by_id: userProfile.id,
        facility_id: facilityId || null,
        product_id: null,
        template_id: null,
        custom_fields: customFields,
      })) as unknown as Complaint;

      setLastSubmittedComplaint({
        complaint: created,
        facilityName,
        origin,
        customFields,
      });

      toast("Equipment complaint submitted", "success");
      router.back();
    } catch (err) {
      toast(err instanceof Error ? err.message : "Submit failed", "error");
    } finally {
      setSubmitting(false);
    }
  }

  const canSubmit = Boolean(image && description.trim() && !submitting);

  return (
    <AppShell
      title="Equipment Complaint"
      subtitle={facilityName}
      footer={
        <>
          <Button
            type="button"
            variant="secondary"
            className="flex-1 sm:flex-none"
            onClick={() => router.back()}
          >
            Back
          </Button>
          <Button
            type="submit"
            form="equipment-form"
            className="flex-[2] sm:flex-none"
            disabled={!canSubmit}
          >
            {submitting ? "Submitting…" : "Submit"}
          </Button>
        </>
      }
    >
      <Card className="mx-auto max-w-xl">
        <form id="equipment-form" onSubmit={onSubmit} className="space-y-4">
          <div>
            <FieldLabel>Image *</FieldLabel>
            <TextInput
              type="file"
              accept="image/*"
              capture="environment"
              onChange={(e) => onImageChange(e.target.files?.[0] ?? null)}
            />
            {preview && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={preview}
                alt="Equipment preview"
                className="mt-3 max-h-56 w-full rounded-xl border border-slate-200 object-contain"
              />
            )}
          </div>

          <div>
            <FieldLabel>Description *</FieldLabel>
            <TextTextarea
              rows={5}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe the equipment issue…"
            />
          </div>
        </form>
      </Card>
    </AppShell>
  );
}

export default function EquipmentFormPage() {
  return (
    <Suspense fallback={<Spinner />}>
      <EquipmentFormContent />
    </Suspense>
  );
}
