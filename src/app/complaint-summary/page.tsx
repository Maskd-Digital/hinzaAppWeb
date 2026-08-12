"use client";

import { useRouter } from "next/navigation";
import { useAuth } from "@/components/providers";
import { useToast } from "@/components/ui/toast";
import {
  AppShell,
  Button,
  Card,
  EmptyState,
} from "@/components/layout/AppShell";
import { downloadComplaintPdf } from "@/lib/pdf";
import { AppConfig } from "@/lib/config";

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <Card>
      <h2 className="mb-3 text-lg font-semibold text-[#081636]">
        {title}
      </h2>
      <div className="space-y-3 text-sm text-gray-700">{children}</div>
    </Card>
  );
}

function Row({
  label,
  value,
}: {
  label: string;
  value?: React.ReactNode;
}) {
  if (value === null || value === undefined || value === "") return null;
  return (
    <div className="grid grid-cols-1 gap-0.5 sm:grid-cols-[11rem_minmax(0,1fr)] sm:gap-3">
      <span className="font-medium capitalize text-gray-500">{label}</span>
      <div className="min-w-0 break-words text-[#081636]">{value}</div>
    </div>
  );
}

function isStagedPhoto(value: unknown): value is { stage?: string; path?: string; publicUrl?: string } {
  return Boolean(
    value &&
      typeof value === "object" &&
      !Array.isArray(value) &&
      ("path" in (value as object) || "publicUrl" in (value as object)),
  );
}

function formatFieldValue(value: unknown): React.ReactNode {
  if (value == null || value === "") return null;
  if (typeof value === "boolean") return value ? "Yes" : "No";
  if (typeof value !== "object") return String(value);

  if (Array.isArray(value)) {
    if (value.length === 0) return null;
    if (value.every(isStagedPhoto)) {
      return `${value.length} photo${value.length === 1 ? "" : "s"} attached`;
    }
    return value.map((v) => String(v)).join(", ");
  }

  if (isStagedPhoto(value)) {
    const url =
      value.publicUrl ||
      (value.path
        ? `${AppConfig.supabaseUrl.replace(/\/$/, "")}/storage/v1/object/public/complaints/${value.path}`
        : null);
    if (url) {
      return (
        <a
          href={url}
          target="_blank"
          rel="noreferrer"
          className="font-medium text-[#2563EB] underline hover:opacity-80"
        >
          View photo
        </a>
      );
    }
    return "Photo attached";
  }

  return null;
}

export default function ComplaintSummaryPage() {
  const { lastSubmittedComplaint } = useAuth();
  const router = useRouter();
  const { toast } = useToast();

  if (!lastSubmittedComplaint) {
    return (
      <AppShell title="Complaint Summary">
        <Card>
          <EmptyState
            title="No recent submission"
            description="Submit a product complaint to see the summary here."
          />
          <Button className="w-full sm:w-auto" onClick={() => router.push("/home")}>
            Go home
          </Button>
        </Card>
      </AppShell>
    );
  }

  const data = lastSubmittedComplaint;
  const fields = data.customFields ?? data.complaint.custom_fields ?? {};

  function onShare() {
    try {
      downloadComplaintPdf(data);
      toast("PDF downloaded", "success");
    } catch (err) {
      toast(err instanceof Error ? err.message : "PDF failed", "error");
    }
  }

  const detailEntries = Object.entries(fields).filter(([key]) => {
    const k = key.toLowerCase();
    return ![
      "facility_id",
      "facility",
      "template_id",
      "product_id",
      "department_id",
      "manager_id",
      "category",
      "origin",
      "department",
      "department_name",
      "reporting_manager",
      "department_manager",
      "manager_name",
    ].includes(k);
  });

  return (
    <AppShell title="Complaint Summary" subtitle={data.complaint.title}>
      <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:flex-wrap">
        <Button className="w-full sm:w-auto" onClick={onShare}>
          Share PDF
        </Button>
        <Button
          variant="secondary"
          className="w-full sm:w-auto"
          onClick={() => router.replace("/home")}
        >
          Done
        </Button>
      </div>

      <div className="mx-auto max-w-3xl space-y-3 sm:space-y-4">
        <Section title="Overview">
          <Row label="Status" value={data.complaint.status ?? "Submitted"} />
          <Row label="Created" value={data.complaint.created_at} />
          <Row label="Origin" value={data.origin} />
          <Row label="Department" value={data.departmentName} />
          <Row label="Department Manager" value={data.managerName} />
        </Section>

        <Section title="References">
          <Row label="Facility" value={data.facilityName} />
          <Row label="Product" value={data.productName} />
          <Row label="Complaint Type" value={data.templateName} />
          <Row label="Complaint ID" value={data.complaint.id} />
        </Section>

        <Section title="Key Details">
          {detailEntries.length === 0 ? (
            <p className="text-sm text-gray-500">No additional details</p>
          ) : (
            detailEntries.map(([key, value]) => (
              <Row
                key={key}
                label={key.replace(/_/g, " ")}
                value={formatFieldValue(value)}
              />
            ))
          )}
          {data.complaint.capa_document_url && (
            <Row
              label="Attachment"
              value={
                <a
                  href={data.complaint.capa_document_url}
                  target="_blank"
                  rel="noreferrer"
                  className="font-medium text-[#2563EB] underline hover:opacity-80"
                >
                  View document / image
                </a>
              }
            />
          )}
        </Section>
      </div>
    </AppShell>
  );
}
