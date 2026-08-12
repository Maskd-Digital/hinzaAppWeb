"use client";

import { useEffect } from "react";
import { useAuth } from "@/components/providers";
import { useComplaintsCache } from "@/components/complaints/ComplaintsCache";

/** Clears cached submitted complaints when the user signs out. */
export function ComplaintsCacheReset() {
  const { session } = useAuth();
  const { clear } = useComplaintsCache();

  useEffect(() => {
    if (!session) clear();
  }, [session, clear]);

  return null;
}
