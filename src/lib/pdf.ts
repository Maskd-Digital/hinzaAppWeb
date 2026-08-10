import { jsPDF } from "jspdf";
import type { LastSubmittedComplaint } from "./types";

export function downloadComplaintPdf(data: LastSubmittedComplaint): void {
  const doc = new jsPDF();
  const margin = 16;
  let y = 20;

  const line = (text: string, size = 11, style: "normal" | "bold" = "normal") => {
    doc.setFont("helvetica", style);
    doc.setFontSize(size);
    const lines = doc.splitTextToSize(text, 180);
    doc.text(lines, margin, y);
    y += lines.length * (size * 0.45) + 4;
    if (y > 280) {
      doc.addPage();
      y = 20;
    }
  };

  line("Complaint Summary", 18, "bold");
  line(data.complaint.title || "Untitled complaint", 13, "bold");
  y += 4;

  line("Overview", 14, "bold");
  line(`Status: ${data.complaint.status ?? "—"}`);
  line(`Created: ${data.complaint.created_at ?? "—"}`);
  if (data.origin) line(`Origin: ${data.origin}`);
  if (data.departmentName) line(`Department: ${data.departmentName}`);
  if (data.managerName) line(`Department Manager: ${data.managerName}`);

  y += 4;
  line("References", 14, "bold");
  if (data.facilityName) line(`Facility: ${data.facilityName}`);
  if (data.productName) line(`Product: ${data.productName}`);
  if (data.templateName) line(`Complaint Type: ${data.templateName}`);
  line(`Complaint ID: ${data.complaint.id}`);

  y += 4;
  line("Key Details", 14, "bold");
  const fields = data.customFields ?? data.complaint.custom_fields ?? {};
  const entries = Object.entries(fields).filter(([key]) => {
    const k = key.toLowerCase();
    return ![
      "facility_id",
      "facility",
      "template_id",
      "product_id",
      "category",
    ].includes(k);
  });

  if (entries.length === 0) {
    line("No additional details");
  } else {
    for (const [key, value] of entries) {
      const display =
        typeof value === "object" && value !== null
          ? JSON.stringify(value)
          : String(value ?? "—");
      line(`${prettyKey(key)}: ${display}`);
    }
  }

  doc.save(`complaint-${data.complaint.id.slice(0, 8)}.pdf`);
}

function prettyKey(key: string): string {
  return key
    .replace(/_/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}
