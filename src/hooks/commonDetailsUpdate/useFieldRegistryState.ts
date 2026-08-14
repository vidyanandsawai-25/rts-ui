/* eslint-disable react-hooks/set-state-in-effect, react-hooks/exhaustive-deps */
import { useState, useEffect, useCallback } from "react";
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

  const [statusFilter, setStatusFilter] = useState("all");
  const [searchTerm, setSearchTermState] = useState(searchParams.get("searchTerm") || "");

  const initialPageNumber = Number(searchParams.get("pageNumber") || searchParams.get("page") || "1");
  const initialPageSize = Number(searchParams.get("pageSize") || "10");

  const [pageNumber, setPageNumberState] = useState(initialPageNumber);
  const [pageSize, setPageSizeState] = useState(initialPageSize);

  const setSearchTerm = (val: string) => {
    setSearchTermState(val);
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      if (val) params.set("searchTerm", val); else params.delete("searchTerm");
      window.history.replaceState(null, "", `${pathname}?${params.toString()}`);
    }
  };

  const setPageNumber = (val: number) => {
    setPageNumberState(val);
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      params.set("pageNumber", String(val));
      window.history.replaceState(null, "", `${pathname}?${params.toString()}`);
    }
  };

  const setPageSize = (val: number) => {
    setPageSizeState(val);
    setPageNumberState(1);
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      params.set("pageSize", String(val));
      params.set("pageNumber", "1");
      window.history.replaceState(null, "", `${pathname}?${params.toString()}`);
    }
  };

  const refreshFieldsList = useCallback(async () => {
    if (!actions.getFieldRegistriesAction) return;
  
    const res = await actions.getFieldRegistriesAction(pageNumber, pageSize);
    if (res.success && res.data) {
      const data = res.data;
      if (data && "items" in data) {
        setFields(data.items || []);
        setTotalCount(data.totalCount || 0);
      }
    }
    
  }, [actions.getFieldRegistriesAction, pageNumber, pageSize]);

  useEffect(() => {
    refreshFieldsList();
  }, [refreshFieldsList]);

  useEffect(() => {
    if (Array.isArray(initialFields)) {
      setFields(initialFields);
      setTotalCount(initialFields.length);
    } else if (initialFields && "items" in initialFields) {
      setFields(initialFields.items || []);
      setTotalCount(initialFields.totalCount || 0);
    } else {
      setFields([]);
      setTotalCount(0);
    }
  }, [initialFields]);

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
    toggleFieldStatus,
    setFieldRegistryStatusAction: actions.setFieldRegistryStatusAction,
  };
};
