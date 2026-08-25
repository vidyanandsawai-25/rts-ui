/* eslint-disable react-hooks/exhaustive-deps */
import { useState, useCallback } from "react";
import { useSearchParams, usePathname } from "next/navigation";
import { PagedResponse } from "@/types/common.types";
import { BulkUpdateMaster, FieldRegistrySchema, CommonDetailsUpdateActions, FieldRegistryTable, SourceTableField } from "@/types/common-details-update/common-details-update.types";
import { useFieldRegistryForm } from "./useFieldRegistryForm";

export const useFieldRegistryState = (
  initialFields: PagedResponse<BulkUpdateMaster> | BulkUpdateMaster[] = [],
  initialSchemas: FieldRegistrySchema[] = [],
  initialSourceTables: FieldRegistryTable[] = [],
  initialSourceTableFields: SourceTableField[] = [],
  actions: Partial<CommonDetailsUpdateActions> = {}
) => {
  const searchParams = useSearchParams();
  const pathname = usePathname();

  const [fields, setFields] = useState<BulkUpdateMaster[]>(() => {
    if (Array.isArray(initialFields)) {
      return initialFields;
    }
    if (initialFields && "items" in initialFields) {
      return initialFields.items || [];
    }
    return [];
  });

  const [totalCount, setTotalCount] = useState<number>(() => {
    if (Array.isArray(initialFields)) {
      return initialFields.length;
    }
    if (initialFields && "totalCount" in initialFields) {
      return initialFields.totalCount || 0;
    }
    return 0;
  });

  const [statusFilter, setStatusFilterState] = useState("all");
  const [searchTerm, setSearchTermState] = useState(searchParams.get("searchTerm") || "");
  const [loading, setLoading] = useState(false);

  const initialPageNumber = Number(searchParams.get("pageNumber") || searchParams.get("page") || "1");
  const initialPageSize = Number(searchParams.get("pageSize") || "10");

  const [pageNumber, setPageNumberState] = useState(initialPageNumber);
  const [pageSize, setPageSizeState] = useState(initialPageSize);

  const setStatusFilter = (val: string) => {
    setStatusFilterState(val);
    setPageNumberState(1);
  };

  const setSearchTerm = (val: string) => {
    setSearchTermState(val);
    setPageNumberState(1);
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      if (val) params.set("searchTerm", val); else params.delete("searchTerm");
      window.history.replaceState(null, "", `${pathname}?${params.toString()}`);
    }
  };

  const refreshFieldsList = useCallback(async (targetPage?: number, targetSize?: number) => {
    if (!actions.getFieldRegistriesAction) return;

    const pNum = targetPage !== undefined ? targetPage : pageNumber;
    const pSize = targetSize !== undefined ? targetSize : pageSize;

    setLoading(true);
    try {
      const res = await actions.getFieldRegistriesAction(pNum, pSize);
      if (res.success && res.data) {
        const data = res.data;
        if (data && "items" in data) {
          setFields(data.items || []);
          setTotalCount(data.totalCount || (data.items ? data.items.length : 0));
        } else if (Array.isArray(data)) {
          setFields(data);
          setTotalCount(data.length);
        }
      }
    } finally {
      setLoading(false);
    }
  }, [actions.getFieldRegistriesAction, pageNumber, pageSize]);

  const setPageNumber = useCallback((val: number) => {
    setLoading(true);
    setPageNumberState(val);
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      params.set("pageNumber", String(val));
      window.history.replaceState(null, "", `${pathname}?${params.toString()}`);
    }
    setTimeout(() => {
      setLoading(false);
    }, 150);
  }, [pathname]);

  const setPageSize = useCallback((val: number) => {
    setLoading(true);
    setPageSizeState(val);
    setPageNumberState(1);
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      params.set("pageSize", String(val));
      params.set("pageNumber", "1");
      window.history.replaceState(null, "", `${pathname}?${params.toString()}`);
    }
    setTimeout(() => {
      setLoading(false);
    }, 150);
  }, [pathname]);

  const formState = useFieldRegistryForm(fields, refreshFieldsList, initialSchemas, initialSourceTables, initialSourceTableFields);

  const toggleFieldStatus = async (code: string, isActive: boolean) => {
    if (actions.setFieldRegistryStatusAction) {
      return await actions.setFieldRegistryStatusAction(code, isActive);
    }
    return { success: false, error: "Action not available" };
  };

  return {
    fields, setFields,
    refreshFieldsList,
    ...formState,

    statusFilter, setStatusFilter,
    searchTerm, setSearchTerm,
    pageNumber, setPageNumber,
    pageSize, setPageSize,
    totalCount,
    loading,
    toggleFieldStatus,
    setFieldRegistryStatusAction: actions.setFieldRegistryStatusAction,
  };
};
