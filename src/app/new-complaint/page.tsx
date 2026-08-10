"use client";

import { Suspense, useCallback, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/components/providers";
import { useToast } from "@/components/ui/toast";
import {
  AppShell,
  Button,
  Card,
  EmptyState,
  FieldLabel,
  Spinner,
  TextInput,
} from "@/components/layout/AppShell";
import { AppSelect } from "@/components/ui/AppSelect";
import {
  DynamicFields,
  areRequiredFieldsFilled,
  type FieldValue,
} from "@/components/complaints/DynamicFields";
import { api } from "@/lib/api";
import {
  insertComplaint,
  isFileFieldType,
  uploadComplaintImage,
} from "@/lib/complaints";
import type {
  Complaint,
  Department,
  Facility,
  Product,
  StagedPhoto,
  Template,
} from "@/lib/types";
import { isStep1Valid, type Step1FormState } from "@/lib/validation";

function NewComplaintContent() {
  const params = useSearchParams();
  const origin = params.get("origin") ?? "Manufacturing";
  const router = useRouter();
  const { selectedCompany, userProfile, setLastSubmittedComplaint } =
    useAuth();
  const { toast } = useToast();

  const [step, setStep] = useState<1 | 2>(1);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [facilities, setFacilities] = useState<Facility[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [templates, setTemplates] = useState<Template[]>([]);

  const [step1, setStep1] = useState<Step1FormState>({
    facilityId: "",
    facilityName: "",
    departmentId: "",
    departmentName: "",
    managerId: "",
    managerName: "",
    productId: "",
    productName: "",
    location: "",
    deliveryNumber: "",
  });

  const [templateId, setTemplateId] = useState("");
  const [fieldValues, setFieldValues] = useState<Record<string, FieldValue>>(
    {},
  );

  const companyId = selectedCompany?.id ?? "";
  const selectedTemplate = templates.find((t) => t.id === templateId) ?? null;
  const o = origin.toLowerCase();

  const load = useCallback(async () => {
    if (!companyId) return;
    setLoading(true);
    setError(null);
    try {
      const [fac, dept, prod, tmpl] = await Promise.all([
        api.getFacilities(companyId, origin),
        api.getDepartments(companyId),
        api.getProducts(companyId),
        api.getTemplates(companyId),
      ]);
      setFacilities(fac);
      setDepartments(dept);
      setProducts(prod);
      setTemplates(tmpl);

      const defaultDeptId = userProfile?.department_id ?? "";
      const defaultDept =
        dept.find((d) => d.id === defaultDeptId) ??
        (userProfile?.department_name
          ? dept.find((d) => d.name === userProfile.department_name)
          : undefined);

      if (defaultDept) {
        setStep1((s) => ({
          ...s,
          departmentId: defaultDept.id,
          departmentName: defaultDept.name,
          managerId:
            defaultDept.manager_id ?? userProfile?.manager_id ?? "",
          managerName:
            defaultDept.manager_name ?? userProfile?.manager_name ?? "",
        }));
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load form data");
    } finally {
      setLoading(false);
    }
  }, [companyId, origin, userProfile]);

  useEffect(() => {
    void load();
  }, [load]);

  const productIds = useMemo(() => products.map((p) => p.id), [products]);
  const step1Valid = isStep1Valid(origin, step1, productIds);
  const step2Valid =
    Boolean(templateId) &&
    selectedTemplate != null &&
    areRequiredFieldsFilled(selectedTemplate.fields, fieldValues);

  function updateFacility(id: string) {
    const f = facilities.find((x) => x.id === id);
    setStep1((s) => ({
      ...s,
      facilityId: id,
      facilityName: f?.name ?? "",
    }));
  }

  function updateDepartment(id: string) {
    const d = departments.find((x) => x.id === id);
    setStep1((s) => ({
      ...s,
      departmentId: id,
      departmentName: d?.name ?? "",
      managerId: d?.manager_id ?? userProfile?.manager_id ?? "",
      managerName: d?.manager_name ?? userProfile?.manager_name ?? "",
    }));
  }

  function updateProduct(id: string) {
    const p = products.find((x) => x.id === id);
    setStep1((s) => ({
      ...s,
      productId: id,
      productName: p?.name ?? "",
    }));
  }

  async function onSubmit() {
    if (!selectedTemplate || !userProfile || !companyId || submitting) return;
    setSubmitting(true);
    try {
      const customFields: Record<string, unknown> = {
        origin,
        department: step1.departmentName,
        department_id: step1.departmentId,
        department_name: step1.departmentName,
        reporting_manager: step1.managerName || undefined,
        department_manager: step1.managerName || undefined,
        manager_id: step1.managerId || undefined,
        manager_name: step1.managerName || undefined,
      };

      if (o === "retail" && step1.location) {
        customFields.location = step1.location;
      }
      if (o === "logistics" && step1.deliveryNumber) {
        customFields.delivery_number = step1.deliveryNumber;
      }

      let firstPublicUrl: string | undefined;

      for (const field of selectedTemplate.fields) {
        const value = fieldValues[field.field_name];
        if (isFileFieldType(field.field_type)) {
          const files = Array.isArray(value) ? value : [];
          const staged: StagedPhoto[] = [];
          for (const file of files) {
            const uploaded = await uploadComplaintImage(
              file,
              companyId,
              field.field_name,
            );
            staged.push({
              stage: field.field_name,
              path: uploaded.path,
            });
            if (!firstPublicUrl) firstPublicUrl = uploaded.publicUrl;
          }
          customFields[field.field_name] =
            staged.length === 1 ? staged[0] : staged;
        } else if (value !== null && value !== undefined && value !== "") {
          customFields[field.field_name] = value;
        }
      }

      // Strip keys that must not live in custom_fields top mirrors
      delete customFields.facility_id;
      delete customFields.facility;
      delete customFields.template_id;
      delete customFields.product_id;
      delete customFields.outlet_name;
      delete customFields.outletName;

      const title = `${step1.facilityName || origin} – ${selectedTemplate.name}`;

      const created = (await insertComplaint({
        company_id: companyId,
        title,
        submitted_by_id: userProfile.id,
        template_id: selectedTemplate.id,
        facility_id: step1.facilityId || null,
        product_id: step1.productId,
        capa_document_url: firstPublicUrl ?? null,
        custom_fields: customFields,
      })) as unknown as Complaint;

      setLastSubmittedComplaint({
        complaint: created,
        facilityName: step1.facilityName,
        templateName: selectedTemplate.name,
        productName: step1.productName,
        departmentName: step1.departmentName,
        managerName: step1.managerName,
        origin,
        customFields,
      });

      toast("Complaint submitted", "success");
      router.replace("/complaint-summary");
    } catch (err) {
      toast(err instanceof Error ? err.message : "Submit failed", "error");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <AppShell
      title="New Complaint"
      subtitle={`Origin: ${origin} · Step 0${step} of 02`}
      footer={
        !loading && !error ? (
          step === 1 ? (
            <>
              <Button
                variant="secondary"
                className="flex-1 sm:flex-none"
                onClick={() => router.back()}
              >
                Back
              </Button>
              <Button
                className="flex-[2] sm:flex-none"
                disabled={!step1Valid}
                onClick={() => setStep(2)}
              >
                Next
              </Button>
            </>
          ) : (
            <>
              <Button
                variant="secondary"
                className="flex-1 sm:flex-none"
                onClick={() => setStep(1)}
              >
                Back
              </Button>
              <Button
                className="flex-[2] sm:flex-none"
                disabled={!step2Valid || submitting}
                onClick={() => void onSubmit()}
              >
                {submitting ? "Submitting…" : "Submit"}
              </Button>
            </>
          )
        ) : undefined
      }
    >
      <div className="mb-4 flex items-center gap-2 overflow-x-auto pb-1">
        <span
          className={`shrink-0 rounded-full px-3 py-1 text-xs font-semibold ${
            step === 1
              ? "bg-[var(--brand-blue)] text-white"
              : "bg-[var(--brand-blue-soft)] text-[var(--brand-blue)]"
          }`}
        >
          01 Details
        </span>
        <span
          className={`shrink-0 rounded-full px-3 py-1 text-xs font-semibold ${
            step === 2
              ? "bg-[var(--brand-blue)] text-white"
              : "bg-slate-100 text-slate-500"
          }`}
        >
          02 Template
        </span>
      </div>

      {loading ? (
        <Spinner label="Loading form…" />
      ) : error ? (
        <Card>
          <p className="text-sm text-red-600">{error}</p>
          <Button className="mt-3 w-full sm:w-auto" onClick={() => void load()}>
            Retry
          </Button>
        </Card>
      ) : step === 1 ? (
        <Card className="mx-auto max-w-2xl space-y-4">
          <div>
            <FieldLabel>Facility</FieldLabel>
            <AppSelect
              aria-label="Facility"
              placeholder="Select facility…"
              value={step1.facilityId}
              onChange={updateFacility}
              options={facilities.map((f) => ({ value: f.id, label: f.name }))}
            />
          </div>

          {o === "retail" && (
            <div>
              <FieldLabel>Location *</FieldLabel>
              <TextInput
                value={step1.location}
                onChange={(e) =>
                  setStep1((s) => ({ ...s, location: e.target.value }))
                }
                placeholder="Store / outlet location"
              />
            </div>
          )}

          {o === "logistics" && (
            <div>
              <FieldLabel>Delivery number *</FieldLabel>
              <TextInput
                value={step1.deliveryNumber}
                onChange={(e) =>
                  setStep1((s) => ({ ...s, deliveryNumber: e.target.value }))
                }
                placeholder="Delivery / shipment number"
              />
            </div>
          )}

          <div>
            <FieldLabel>Department *</FieldLabel>
            <AppSelect
              aria-label="Department"
              placeholder="Select department…"
              value={step1.departmentId}
              onChange={updateDepartment}
              options={departments.map((d) => ({
                value: d.id,
                label: d.name,
              }))}
            />
            {step1.managerName && (
              <p className="mt-1 text-xs text-slate-500">
                Manager: {step1.managerName}
              </p>
            )}
          </div>

          <div>
            <FieldLabel>Product *</FieldLabel>
            {products.length === 0 ? (
              <EmptyState
                title="No products available"
                description="Ask your admin to add products for this company."
              />
            ) : (
              <AppSelect
                aria-label="Product"
                placeholder="Select product…"
                value={step1.productId}
                onChange={updateProduct}
                options={products.map((p) => ({
                  value: p.id,
                  label: p.name,
                }))}
              />
            )}
          </div>
        </Card>
      ) : (
        <Card className="mx-auto max-w-2xl space-y-4">
          <div>
            <FieldLabel>Complaint type *</FieldLabel>
            <AppSelect
              aria-label="Complaint type"
              placeholder="Select complaint type…"
              value={templateId}
              onChange={(id) => {
                setTemplateId(id);
                setFieldValues({});
              }}
              options={templates.map((t) => ({
                value: t.id,
                label: t.name,
              }))}
            />
          </div>

          {selectedTemplate && (
            <DynamicFields
              fields={selectedTemplate.fields}
              values={fieldValues}
              onChange={(name, value) =>
                setFieldValues((prev) => ({ ...prev, [name]: value }))
              }
            />
          )}
        </Card>
      )}
    </AppShell>
  );
}

export default function NewComplaintPage() {
  return (
    <Suspense fallback={<Spinner />}>
      <NewComplaintContent />
    </Suspense>
  );
}
