export interface Company {
  id: string;
  name: string;
  created_at?: string;
}

export interface UserProfile {
  id: string;
  company_id: string;
  full_name: string;
  email: string;
  is_active?: boolean;
  company?: Company;
  department_id?: string | null;
  department_name?: string | null;
  manager_id?: string | null;
  manager_name?: string | null;
}

export interface Product {
  id: string;
  company_id: string;
  parent_id?: string | null;
  name: string;
  level?: number | null;
  description?: string | null;
  created_at?: string;
  updated_at?: string | null;
}

export interface Facility {
  id: string;
  company_id: string;
  name: string;
  address?: string | null;
  city?: string | null;
  state?: string | null;
  country?: string | null;
  is_active?: boolean;
  created_at?: string;
  updated_at?: string | null;
}

export interface Department {
  id: string;
  name: string;
  company_id: string;
  manager_id?: string | null;
  manager_name?: string | null;
}

export interface TemplateField {
  id?: string | null;
  field_name: string;
  field_type: string;
  is_required: boolean;
  field_order?: number | null;
  options: string[];
}

export interface Template {
  id: string;
  name: string;
  description?: string | null;
  source_template_id?: string;
  fields: TemplateField[];
}

export interface Complaint {
  id: string;
  company_id: string;
  title: string;
  description?: string | null;
  status: string;
  priority?: string | null;
  created_at: string;
  updated_at?: string | null;
  assigned_to_id?: string | null;
  product_id?: string | null;
  equipment_id?: string | null;
  template_id?: string | null;
  parent_id?: string | null;
  level?: number | null;
  submitted_by_id?: string | null;
  complaint_type_id?: string | null;
  batch_id?: string | null;
  deadline?: string | null;
  submitted_for_verification_at?: string | null;
  capa_document_url?: string | null;
  sla_document_url?: string | null;
  capa_verified_at?: string | null;
  sla_verified_at?: string | null;
  verified_by?: string | null;
  custom_fields?: Record<string, unknown> | null;
  facility_id?: string | null;
}

export interface CreateComplaintInput {
  company_id: string;
  title: string;
  description?: string | null;
  submitted_by_id?: string | null;
  template_id?: string | null;
  complaint_type_id?: string | null;
  facility_id?: string | null;
  product_id?: string | null;
  priority?: string | null;
  batch_id?: string | null;
  assigned_to_id?: string | null;
  parent_id?: string | null;
  level?: number | null;
  deadline?: string | null;
  submitted_for_verification_at?: string | null;
  capa_document_url?: string | null;
  sla_document_url?: string | null;
  capa_verified_at?: string | null;
  sla_verified_at?: string | null;
  verified_by?: string | null;
  custom_fields?: Record<string, unknown> | null;
}

export interface StagedPhoto {
  stage: string;
  path: string;
  publicUrl?: string;
}

export interface LastSubmittedComplaint {
  complaint: Complaint;
  facilityName?: string;
  templateName?: string;
  productName?: string;
  departmentName?: string;
  managerName?: string;
  origin?: string;
  customFields?: Record<string, unknown>;
}
