"use client";

import { useState } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { BulkUpdateMaster } from "@/types/common-details-update/common-details-update.types";
import { useFieldRegistryForm } from "./useFieldRegistryForm";

export const useFieldRegistryState = (initialFields: BulkUpdateMaster[] = []) => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();

  const [fields, setFields] = useState<BulkUpdateMaster[]>(initialFields);

  const [categoryFilter, setCategoryFilterState] = useState(searchParams.get("category") || "all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [searchTerm, setSearchTermState] = useState(searchParams.get("searchTerm") || "");

  const [pageNumber, setPageNumber] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const setCategoryFilter = (val: string) => {
    setCategoryFilterState(val);
    const params = new URLSearchParams(searchParams.toString());
    if (val && val !== "all") params.set("category", val); else params.delete("category");
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  };

  const setSearchTerm = (val: string) => {
    setSearchTermState(val);
    const params = new URLSearchParams(searchParams.toString());
    if (val) params.set("searchTerm", val); else params.delete("searchTerm");
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  };

  // Note: we fetch fresh fields but for this hook we keep it simple or import getMenuItemsAction if needed.
  // We can pass refreshFieldsList to useFieldRegistryForm.
  const refreshFieldsList = async () => {
    // import here dynamically or pass from somewhere if needed, but since it's just state we can skip dynamic import and rely on the hook passing
    const { getMenuItemsAction } = await import("@/app/[locale]/property-tax/common-details-update/actions");
    const freshMenuItems = await getMenuItemsAction();
    setFields(freshMenuItems);
  };

  const formState = useFieldRegistryForm(fields, refreshFieldsList);

  return {
    fields, setFields,
    ...formState,
    categoryFilter, setCategoryFilter,
    statusFilter, setStatusFilter,
    searchTerm, setSearchTerm,
    pageNumber, setPageNumber,
    pageSize, setPageSize,
  };
};
