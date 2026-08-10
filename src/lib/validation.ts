import type { ComplaintOrigin } from "./config";

export interface Step1FormState {
  facilityId: string;
  facilityName: string;
  departmentId: string;
  departmentName: string;
  managerId: string;
  managerName: string;
  productId: string;
  productName: string;
  location: string;
  deliveryNumber: string;
}

export function isStep1Valid(
  origin: string,
  state: Step1FormState,
  productIds: string[],
): boolean {
  const o = origin.toLowerCase();
  const hasProduct =
    Boolean(state.productId) && productIds.includes(state.productId);
  const hasDepartment = Boolean(state.departmentId);
  const hasFacility = Boolean(state.facilityId);

  if (o === "manufacturing" || o === "warehouse") {
    return hasFacility && hasDepartment && hasProduct;
  }
  if (o === "retail") {
    return (
      hasFacility &&
      Boolean(state.location.trim()) &&
      hasDepartment &&
      hasProduct
    );
  }
  if (o === "logistics") {
    return (
      Boolean(state.deliveryNumber.trim()) && hasDepartment && hasProduct
    );
  }
  // other / default
  return hasDepartment && hasProduct;
}

export function originLabel(origin: ComplaintOrigin | string): string {
  if (origin === "Retail") return "Retail/Sales/Outlet";
  return origin;
}

export function cn(...parts: Array<string | false | null | undefined>): string {
  return parts.filter(Boolean).join(" ");
}
