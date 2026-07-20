import { useState, useCallback, useRef, useTransition, useMemo, useEffect } from "react";
import { toast } from "sonner";
import { useConfirm } from "@/components/common/ConfirmProvider";
import { LockedScreen, LockUnlockPropertyItem, LockUnlockPropertiesResponse } from "@/types/lockunlock.types";
import { fetchLockUnlockPropertiesByCategoryAction, bulkLockUnlockPropertiesAction, bulkLockUnlockByCategoryAction, fetchLockUnlockPropertiesPagedAction } from "@/app/[locale]/property-tax/lockunlock/action";
import { getScreenIds } from "@/lib/api/lockunlock/lockunlock.utils";
import { useLockUnlockColumns } from "./useLockUnlockColumns";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { SEARCH_ALPHANUMERIC_SANITIZE } from "@/lib/utils/validation-rules";

export interface UseLockUnlockMasterProps {
  wardIdFromUrl: string;
  screens: LockedScreen[];
  dropdownProperties: { label: string; value: string; propertyId?: number }[];
  initialProperties?: LockUnlockPropertyItem[];
  initialPagination?: PaginationState;
}

export interface PaginationState {
  pageNumber: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
}

export function useLockUnlockMaster({
  wardIdFromUrl,
  screens = [],
  dropdownProperties = [],
  initialProperties = [],
  initialPagination,
}: UseLockUnlockMasterProps) {
  const { confirm } = useConfirm();
  const t = useTranslations("lockUnlock");
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  // Form State - initialized from URL params
  const fromPropertyFromUrl = searchParams.get("fromProperty") || "";
  const toPropertyFromUrl = searchParams.get("toProperty") || "";
  const pageFromUrl = searchParams.get("page") ? Number(searchParams.get("page")) : 1;
  const pageSizeFromUrl = searchParams.get("pageSize") ? Number(searchParams.get("pageSize")) : 10;
  const searchCategoryFromUrl = searchParams.get("searchCategory") ? Number(searchParams.get("searchCategory")) : 1;
  const zoneIdFromUrl = searchParams.get("zoneId") || "";
  const propertyNosFromUrl = searchParams.get("propertyNos") ? searchParams.get("propertyNos")!.split(",") : [];

  const [formData, setFormData] = useState({
    searchCategory: searchCategoryFromUrl,
    zoneId: zoneIdFromUrl,
    wardId: wardIdFromUrl || "",
    fromProperty: fromPropertyFromUrl,
    toProperty: toPropertyFromUrl,
    propertyNos: propertyNosFromUrl,
  });

  // Selected Screen IDs
  const [selectedScreenIds, setSelectedScreenIds] = useState<number[]>([]);

  // Results State - initialize with server-fetched data if available or URL show param
  const showFromUrl = searchParams.get("show") === "true";
  const [showResults, setShowResults] = useState(showFromUrl || initialProperties.length > 0);
  const [clientProperties, setClientProperties] = useState<LockUnlockPropertyItem[] | null>(null);
  const properties = clientProperties ?? (initialProperties || []);
  const [selectedPropertyIds, setSelectedPropertyIds] = useState<number[]>([]);

  // Select-All-Across-Pages State
  const [isAllPropertiesSelected, setIsAllPropertiesSelected] = useState(false);
  const [excludedPropertyIds, setExcludedPropertyIds] = useState<number[]>([]);

  // Pagination State - initialize with server-provided pagination if available, or from URL
  const [clientPagination, setClientPagination] = useState<PaginationState | null>(null);
  const pagination = clientPagination ?? (initialPagination || {
    pageNumber: pageFromUrl,
    pageSize: pageSizeFromUrl,
    totalCount: 0,
    totalPages: 1,
  });

  // Individual Property Modal State
  const [editModal, setEditModal] = useState<{
    isOpen: boolean;
    property: LockUnlockPropertyItem | null;
    selectedScreenIds: number[];
  }>({
    isOpen: false,
    property: null,
    selectedScreenIds: [],
  });

  // Property dropdown options state - derived from server-fetched data initially, then updated on client
  const [propertyOptions, setPropertyOptions] = useState(dropdownProperties);
  const [isLoadingProperties, setIsLoadingProperties] = useState(false);

  const fetchDropdowns = useCallback(async (wardId: string) => {
    if (!wardId) {
      setPropertyOptions([]);
      return;
    }
    setIsLoadingProperties(true);
    try {
      const propertiesResponse = await fetchLockUnlockPropertiesPagedAction({
        WardId: Number(wardId),
        PageNumber: 1,
        PageSize: -1,
      });

      const seen = new Set<string>();
      const options = (propertiesResponse.items || [])
        .map((p: LockUnlockPropertyItem) => {
          const normalizedPartitionNo = String(p.partitionNo ?? "").trim();
          const hasPartition =
            normalizedPartitionNo !== "" &&
            normalizedPartitionNo !== "0" &&
            normalizedPartitionNo !== "-";
          const displayValue = hasPartition
            ? `${p.propertyNo}-${normalizedPartitionNo}`
            : p.propertyNo;
          return {
            label: displayValue,
            value: displayValue,
            propertyNo: p.propertyNo,
            partitionNo: normalizedPartitionNo,
          };
        })
        .filter((option: { label: string; value: string }) => {
          if (seen.has(option.value)) {
            return false;
          }
          seen.add(option.value);
          return true;
        });

      setPropertyOptions(options);
    } catch (error) {
      console.error("Failed to fetch properties for dropdown", error);
    } finally {
      setIsLoadingProperties(false);
    }
  }, []);



  // Ensure default searchCategory is reflected in the URL safely after mount
  useEffect(() => {
    if (!searchParams.has("searchCategory")) {
      const url = new URL(window.location.href);
      url.searchParams.set("searchCategory", "1");
      window.history.replaceState(null, "", url.toString());
    }
  }, [searchParams]);

  // Search state for property number filtering (server-side search)
  const searchFromUrl = searchParams.get("search") || "";
  const initialSanitizedSearch = searchFromUrl.replace(SEARCH_ALPHANUMERIC_SANITIZE, "");
  const [propertySearchTerm, setPropertySearchTerm] = useState(initialSanitizedSearch);
  const [isSearching, setIsSearching] = useState(false);
  const lastAppliedSearchRef = useRef(initialSanitizedSearch);
  const emptySearchTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Reset selection state
  const resetSelectionState = useCallback(() => {
    setIsAllPropertiesSelected(false);
    setSelectedPropertyIds([]);
    setExcludedPropertyIds([]);
  }, []);

  const handleSelectChange = (name: string, value: string | string[]) => {
    const params = new URLSearchParams(searchParams.toString());

    if (name === "searchCategory") {
      const numValue = Number(value);
      params.set("searchCategory", value as string);
      
      // Clear properties when changing category
      setFormData((prev) => ({ 
        ...prev, 
        searchCategory: numValue,
        zoneId: "",
        wardId: "", 
        fromProperty: "", 
        toProperty: "",
        propertyNos: []
      }));
      setShowResults(false);
      setClientProperties([]);
      resetSelectionState();
      setSelectedScreenIds([]);
      setClientPagination({ pageNumber: 1, pageSize: 10, totalCount: 0, totalPages: 1 });
      setPropertySearchTerm("");
      
      params.delete("zoneId");
      params.delete("wardId");
      params.delete("fromProperty");
      params.delete("toProperty");
      params.delete("propertyNos");
      params.delete("pageNumber");
      params.delete("pageSize");
      params.delete("search");
      params.delete("show");
      router.push(`${pathname}?${params.toString()}`);
    } else if (name === "zoneId") {
      if (value) {
        params.set("zoneId", value as string);
      } else {
        params.delete("zoneId");
      }
      setFormData((prev) => ({ ...prev, zoneId: value as string }));
      setShowResults(false);
      setClientProperties([]);
      resetSelectionState();
      params.delete("show");
      router.push(`${pathname}?${params.toString()}`);
    } else if (name === "wardId") {
      if (value) {
        params.set("wardId", value as string);
        fetchDropdowns(value as string);
      } else {
        params.delete("wardId");
        setPropertyOptions([]);
      }
      // Clear property selections/results when ward changes
      setFormData((prev) => ({ ...prev, wardId: value as string, fromProperty: "", toProperty: "" }));
      setShowResults(false);
      setClientProperties([]);
      resetSelectionState();
      setSelectedScreenIds([]);
      setClientPagination({ pageNumber: 1, pageSize: 10, totalCount: 0, totalPages: 1 });
      setPropertySearchTerm("");

      params.delete("fromProperty");
      params.delete("toProperty");
      params.delete("pageNumber");
      params.delete("pageSize");
      params.delete("search");
      params.delete("show");
      router.push(`${pathname}?${params.toString()}`);
    } else if (name === "fromProperty") {
      let newToProperty = formData.toProperty;
      if (value) {
        const fromIndex = propertyOptions.findIndex((o) => o.value === (value as string));
        const toIndex = propertyOptions.findIndex((o) => o.value === formData.toProperty);

        // If the previously selected 'toProperty' is now invalid (comes before 'fromProperty'),
        // clear it instead of auto-selecting.
        if (toIndex !== -1 && toIndex < fromIndex) {
          newToProperty = "";
        }
      }
      // Just update local state, do not push to router yet.
      setFormData((prev) => ({ ...prev, fromProperty: value as string, toProperty: newToProperty }));

      // If we are currently showing results and the user changes a filter, we should probably clear the results.
      if (showResults) {
        setShowResults(false);
        setClientProperties([]);
        params.delete("show");
        router.push(`${pathname}?${params.toString()}`);
      }
    } else if (name === "toProperty") {
      // Just update local state, do not push to router yet.
      setFormData((prev) => ({ ...prev, toProperty: value as string }));

      // If we are currently showing results and the user changes a filter, we should probably clear the results.
      if (showResults) {
        setShowResults(false);
        setClientProperties([]);
        params.delete("show");
        router.push(`${pathname}?${params.toString()}`);
      }
    } else if (name === "propertyNos") {
      setFormData((prev) => ({ ...prev, propertyNos: value as string[] }));
      if (showResults) {
        setShowResults(false);
        setClientProperties([]);
        params.delete("show");
        router.push(`${pathname}?${params.toString()}`);
      }
    }
  };

  const handleClearAll = () => {
    setFormData((prev) => ({
      ...prev,
      zoneId: "",
      wardId: "",
      fromProperty: "",
      toProperty: "",
      propertyNos: [],
    }));
    setSelectedScreenIds([]);
    setShowResults(false);
    setClientProperties([]);
    resetSelectionState();
    setClientPagination({ pageNumber: 1, pageSize: 10, totalCount: 0, totalPages: 1 });
    setPropertySearchTerm("");

    // Preserve the current searchCategory in URL
    const params = new URLSearchParams();
    params.set("searchCategory", formData.searchCategory.toString());
    router.push(`${pathname}?${params.toString()}`);

    toast.info(t("messages.clearedFilters"));
  };








  // Helper to extract property numbers and partition numbers range
  const getPropertyQueryRange = useCallback(() => {
    return {
      fromProperty: formData.fromProperty || undefined,
      toProperty: formData.toProperty || undefined,
    };
  }, [formData.fromProperty, formData.toProperty]);

  const fetchProperties = useCallback(
    (pageNum: number, pageSz: number, searchTerm: string = propertySearchTerm, resetSelection: boolean = false) => {
      if (formData.searchCategory !== 1 && !formData.wardId) {
        toast.error("Please select a Ward");
        return;
      }
      
      const isSearchActive = !!searchTerm;

      if (formData.searchCategory !== 1 && formData.searchCategory !== 2 && formData.searchCategory !== 3) {
        if (!isSearchActive && (!formData.fromProperty || !formData.toProperty)) {
          toast.error(t("messages.validationError"));
          return;
        }
      }

      const runSearch = async () => {
        setIsSearching(true);
        try {
          const { fromProperty, toProperty } = getPropertyQueryRange();

          // Normalize the search: collapse spaces around hyphens
          const normalizedSearch = searchTerm
            ? searchTerm.replace(/\s*-\s*/g, "-").trim()
            : "";

          const params: Record<string, unknown> = {
            SearchCategory: formData.searchCategory,
            PageNumber: pageNum,
            PageSize: pageSz,
          };

          if (formData.searchCategory === 1) {
            if (!formData.zoneId) throw new Error(t("messages.validationZone"));
            params.ZoneId = Number(formData.zoneId);
          } else if (formData.searchCategory === 2) {
            if (!formData.wardId) throw new Error("Please select a Ward");
            params.WardId = Number(formData.wardId);
          } else if (formData.searchCategory === 3) {
            if (!formData.wardId && (!formData.propertyNos || formData.propertyNos.length === 0)) {
              throw new Error(t("messages.validationWardAndProperty"));
            }
            if (!formData.wardId) {
              throw new Error(t("messages.validationWard"));
            }
            if (!formData.propertyNos || formData.propertyNos.length === 0) {
              throw new Error(t("messages.validationProperty"));
            }
            
            let basePropertyNo = "";
            const partitions: string[] = [];
            
            for (const propStr of formData.propertyNos) {
              const matchedOption = propertyOptions.find((o) => o.value === propStr);
              let propNo = "";
              let partition = "";
              
              if (matchedOption) {
                propNo = matchedOption.propertyNo || "";
                partition = matchedOption.partitionNo || "";
              } else {
                // Fallback if not found in options for some reason
                const parts = propStr.split("-");
                propNo = parts[0];
                partition = parts.length > 1 ? parts.slice(1).join("-") : "";
              }
              
              if (!basePropertyNo) {
                basePropertyNo = propNo;
              } else if (basePropertyNo !== propNo) {
                throw new Error(t("messages.samePropertyPartitionError", { defaultValue: "You can only select partitions of the same property." }));
              }
              
              if (partition) {
                partitions.push(partition);
              }
            }

            params.WardId = Number(formData.wardId);
            params.PropertyNo = basePropertyNo;
            if (partitions.length > 0) {
              params.PartitionNo = partitions.join(",");
            }
          } else if (formData.searchCategory === 4) {
            if (!isSearchActive && !formData.wardId && (!formData.fromProperty || !formData.toProperty)) {
              throw new Error(t("messages.validationError"));
            }
            if (!formData.wardId) {
              throw new Error(t("messages.validationWard"));
            }
            if (!isSearchActive && (!formData.fromProperty || !formData.toProperty)) {
              throw new Error(t("messages.validationFromToProperty"));
            }
            params.WardId = Number(formData.wardId);
            params.PropertyFrom = fromProperty;
            params.PropertyTo = toProperty;
          }

          if (normalizedSearch) {
            params.SearchTerm = normalizedSearch;
          }

          const response: LockUnlockPropertiesResponse = await fetchLockUnlockPropertiesByCategoryAction(
            params as Parameters<typeof fetchLockUnlockPropertiesByCategoryAction>[0]
          );

          if (response?.items?.length > 0) {
            if (resetSelection) {
              resetSelectionState();
            }
            setClientProperties(response.items);
            setClientPagination({
              pageNumber: response.pageNumber || pageNum,
              pageSize: response.pageSize || pageSz,
              totalCount: response.totalCount,
              totalPages: response.totalPages,
            });
            setShowResults(true);
          } else {
            setClientProperties([]);
            if (resetSelection) {
              resetSelectionState();
            }
            setClientPagination({ pageNumber: 1, pageSize: pageSz, totalCount: 0, totalPages: 1 });
            setShowResults(true);
            toast.info(t("messages.fetchNoResults"));
          }
        } catch (err: unknown) {
          toast.error(err instanceof Error ? err.message : t("messages.fetchFailed"));
        } finally {
          setIsSearching(false);
        }
      };
      
      runSearch();
    },
    [formData, getPropertyQueryRange, propertySearchTerm, t, resetSelectionState, propertyOptions]
  );

  // Show (initial load) and search should reset selection
  const handleShow = useCallback(() => {
    if (formData.searchCategory === 1) {
      if (!formData.zoneId) {
        toast.error(t("messages.validationZone"));
        return;
      }
    } else if (formData.searchCategory === 2) {
      if (!formData.wardId) {
        toast.error(t("messages.validationWard"));
        return;
      }
    } else if (formData.searchCategory === 3) {
      if (!formData.wardId && (!formData.propertyNos || formData.propertyNos.length === 0)) {
        toast.error(t("messages.validationWardAndProperty"));
        return;
      }
      if (!formData.wardId) {
        toast.error(t("messages.validationWard"));
        return;
      }
      if (!formData.propertyNos || formData.propertyNos.length === 0) {
        toast.error(t("messages.validationProperty"));
        return;
      }
      
      let basePropertyNo = "";
      for (const propStr of formData.propertyNos) {
        const matchedOption = propertyOptions.find((o) => o.value === propStr);
        let propNo = "";
        
        if (matchedOption) {
          propNo = matchedOption.propertyNo || "";
        } else {
          const parts = propStr.split("-");
          propNo = parts[0];
        }
        
        if (!basePropertyNo) {
          basePropertyNo = propNo;
        } else if (basePropertyNo !== propNo) {
          toast.error(t("messages.samePropertyPartitionError", { defaultValue: "You can only select partitions of the same property." }));
          return;
        }
      }
    } else if (formData.searchCategory === 4) {
      if (!formData.wardId && (!formData.fromProperty || !formData.toProperty)) {
        toast.error(t("messages.validationError"));
        return;
      }
      if (!formData.wardId) {
        toast.error(t("messages.validationWard"));
        return;
      }
      if (!formData.fromProperty || !formData.toProperty) {
        toast.error(t("messages.validationFromToProperty"));
        return;
      }
    }

    const params = new URLSearchParams(searchParams.toString());
    params.set("searchCategory", formData.searchCategory.toString());
    if (formData.zoneId) params.set("zoneId", formData.zoneId);
    if (formData.wardId) params.set("wardId", formData.wardId);
    if (formData.fromProperty) params.set("fromProperty", formData.fromProperty);
    if (formData.toProperty) params.set("toProperty", formData.toProperty);
    if (formData.searchCategory === 3 && formData.propertyNos && formData.propertyNos.length > 0) {
      params.set("propertyNos", formData.propertyNos.join(","));
    }
    params.set("pageNumber", "1");
    params.set("pageSize", pagination.pageSize.toString());
    params.set("show", "true");

    // Clear client overrides so we use the fresh server data
    setClientProperties(null);
    setClientPagination(null);

    startTransition(() => {
      router.push(`${pathname}?${params.toString()}`);
    });
  }, [formData, searchParams, pathname, router, t, pagination.pageSize, propertyOptions]);

  const handleSearchButtonClick = useCallback(() => {
    if (!propertySearchTerm || propertySearchTerm.trim() === "") {
      toast.error(t("messages.searchValidationError", { defaultValue: "Please enter a value to search." }));
      return;
    }

    lastAppliedSearchRef.current = propertySearchTerm;
    const params = new URLSearchParams(searchParams.toString());
    if (propertySearchTerm) {
      params.set("search", propertySearchTerm);
    } else {
      params.delete("search");
    }
    router.push(`${pathname}?${params.toString()}`);

    if (showResults) {
      fetchProperties(1, pagination.pageSize, propertySearchTerm, true);
    }
  }, [propertySearchTerm, searchParams, pathname, router, showResults, fetchProperties, pagination.pageSize, t]);

  // Clear search
  const handleClearSearch = useCallback(() => {
    setPropertySearchTerm("");
    lastAppliedSearchRef.current = "";

    const params = new URLSearchParams(searchParams.toString());
    params.delete("search");
    params.set("page", "1");
    router.push(`${pathname}?${params.toString()}`);

    if (showResults) {
      fetchProperties(1, pagination.pageSize, "", true);
    }
  }, [searchParams, pathname, router, showResults, fetchProperties, pagination.pageSize]);

  // Keeps the input responsive and triggers debounced search on empty bar
  const handlePropertySearch = useCallback((searchTerm: string) => {
    const sanitizedSearchTerm = searchTerm.replace(SEARCH_ALPHANUMERIC_SANITIZE, "");

    if (searchTerm !== sanitizedSearchTerm) {
      setPropertySearchTerm(searchTerm);
      setTimeout(() => setPropertySearchTerm(sanitizedSearchTerm), 0);
    } else {
      setPropertySearchTerm(sanitizedSearchTerm);
    }

    if (emptySearchTimerRef.current) {
      clearTimeout(emptySearchTimerRef.current);
      emptySearchTimerRef.current = null;
    }

    if (sanitizedSearchTerm === "") {
      emptySearchTimerRef.current = setTimeout(() => {
        handleClearSearch();
      }, 500);
    }
  }, [handleClearSearch]);

  // Page navigation preserves selection state (no reset)
  const handlePageChange = useCallback(
    (page: number) => {
      // Update URL with new page number
      const params = new URLSearchParams(searchParams.toString());
      params.set("page", page.toString());
      router.push(`${pathname}?${params.toString()}`);

      fetchProperties(page, pagination.pageSize, undefined, false);
    },
    [fetchProperties, pagination.pageSize, searchParams, pathname, router]
  );

  // Page size change resets selection
  const handlePageSizeChange = useCallback(
    (size: number) => {
      // Update URL with new page size and reset to page 1
      const params = new URLSearchParams(searchParams.toString());
      params.set("pageSize", size.toString());
      params.set("page", "1");
      router.push(`${pathname}?${params.toString()}`);

      fetchProperties(1, size, undefined, true);
    },
    [fetchProperties, searchParams, pathname, router]
  );

  const handleSelectProperty = useCallback((propertyId: number) => {
    if (isAllPropertiesSelected) {
      // In select-all mode, toggle the excludedPropertyIds
      setExcludedPropertyIds((prev) =>
        prev.includes(propertyId)
          ? prev.filter((id) => id !== propertyId)
          : [...prev, propertyId]
      );
    } else {
      // Normal mode: toggle selectedPropertyIds
      setSelectedPropertyIds((prev) =>
        prev.includes(propertyId) ? prev.filter((id) => id !== propertyId) : [...prev, propertyId]
      );
    }
  }, [isAllPropertiesSelected]);

  const handleSelectAllProperties = useCallback(() => {
    setIsAllPropertiesSelected((prev) => {
      const next = !prev;
      if (next) {
        // Enable select-all: clear normal selection and exclusion list
        setSelectedPropertyIds([]);
        setExcludedPropertyIds([]);
      } else {
        // Disable select-all: clear all selection state
        setSelectedPropertyIds([]);
        setExcludedPropertyIds([]);
      }
      return next;
    });
  }, []);

  const handleToggleLock = (row: LockUnlockPropertyItem) => {
    const willLock = !row.isLocked;

    if (willLock && selectedScreenIds.length === 0) {
      toast.error(t("messages.screenRequired"));
      return;
    }

    const title = willLock ? t("messages.lockConfirmTitle") : t("messages.unlockConfirmTitle");
    const description = willLock
      ? t("messages.lockConfirmDescription", { propertyNo: row.propertyNo })
      : t("messages.unlockConfirmDescription", { propertyNo: row.propertyNo });

    confirm({
      variant: willLock ? "warning" : "info",
      title,
      description,
      confirmText: willLock ? t("messages.lockButtonText") : t("messages.unlockButtonText"),
      onConfirm: async () => {
        startTransition(async () => {
          try {
            const screenIds = getScreenIds(willLock ? selectedScreenIds : row.lockedScreens as unknown as []);
            const response = await bulkLockUnlockPropertiesAction({
              propertyIds: [Number(row.propertyId)],
              screenIds,
              action: willLock ? "lock" : "unlock",
            });

            if (response.success) {
              toast.success(
                response.message ||
                t("messages.propertySuccess", {
                  action: willLock
                    ? t("resultsTable.status.locked").toLowerCase()
                    : t("resultsTable.status.unlocked").toLowerCase()
                })
              );
              handleShow();
            } else {
              toast.error(response.error || t("messages.operationFailed"));
            }
          } catch (err: unknown) {
            toast.error(err instanceof Error ? err.message : t("messages.unexpectedError"));
          }
        });
      },
    });
  };

  const handleManageLocks = (row: LockUnlockPropertyItem) => {
    setEditModal({
      isOpen: true,
      property: row,
      selectedScreenIds: getScreenIds(row.lockedScreens as unknown as []),
    });
  };

  const handleSaveIndividualLock = async () => {
    if (!editModal.property) return;

    const propertyId = Number(editModal.property.propertyId);
    const initialLocked = getScreenIds(editModal.property.lockedScreens as unknown as []);
    const currentLocked = getScreenIds(editModal.selectedScreenIds);

    const screensToLock = currentLocked.filter((id) => !initialLocked.includes(id));
    const screensToUnlock = initialLocked.filter((id) => !currentLocked.includes(id));

    startTransition(async () => {
      try {
        let lockSuccess = true;
        let unlockSuccess = true;

        if (screensToLock.length > 0) {
          const res = await bulkLockUnlockPropertiesAction({
            propertyIds: [propertyId],
            screenIds: screensToLock,
            action: "lock",
          });
          lockSuccess = res.success;
        }

        if (screensToUnlock.length > 0) {
          const res = await bulkLockUnlockPropertiesAction({
            propertyIds: [propertyId],
            screenIds: screensToUnlock,
            action: "unlock",
          });
          unlockSuccess = res.success;
        }

        if (lockSuccess && unlockSuccess) {
          toast.success(t("messages.saveSuccess"));
          setEditModal({ isOpen: false, property: null, selectedScreenIds: [] });
          handleShow();
        } else {
          toast.error(t("messages.savePartialFailed"));
        }
      } catch (err: unknown) {
        toast.error(err instanceof Error ? err.message : t("messages.saveFailed"));
      }
    });
  };

  const handleBulkAction = (action: "lock" | "unlock") => {
    const isScopeZoneOrWard = formData.searchCategory === 1 || formData.searchCategory === 2;
    const hasSelection = isScopeZoneOrWard || isAllPropertiesSelected || selectedPropertyIds.length > 0;
    
    if (!hasSelection) {
      toast.error(t("messages.selectPropertyRequired"));
      return;
    }
    if (selectedScreenIds.length === 0) {
      toast.error(t("messages.selectScreenRequired"));
      return;
    }

    const propertyCount = isScopeZoneOrWard
      ? pagination.totalCount
      : isAllPropertiesSelected
      ? pagination.totalCount - excludedPropertyIds.length
      : selectedPropertyIds.length;

    const title = action === "lock" ? t("messages.bulkLockTitle") : t("messages.bulkUnlockTitle");
    const description = isScopeZoneOrWard 
      ? t.rich("messages.bulkLockUnlockConfirmation", {
          action: action === "lock" ? t("messages.lockButtonText").toLowerCase() : t("messages.unlockButtonText").toLowerCase(),
          propertyCount,
          warning: (chunks) => <span className="font-bold text-red-600">{chunks}</span>,
          highlight: (chunks) => <span className="font-bold text-blue-600">{chunks}</span>
        }) as unknown as string
      : t.rich("messages.bulkConfirmDescription", {
          action: action === "lock" ? t("messages.lockButtonText").toLowerCase() : t("messages.unlockButtonText").toLowerCase(),
          screenCount: selectedScreenIds.length,
          propertyCount,
          warning: (chunks) => <span className="font-bold text-red-600">{chunks}</span>,
          highlight: (chunks) => <span className="font-bold text-blue-600">{chunks}</span>
        }) as unknown as string;

    confirm({
      variant: action === "lock" ? "warning" : "info",
      title,
      description,
      confirmText: action === "lock" ? t("messages.lockButtonText") : t("messages.unlockButtonText"),
      onConfirm: async () => {
        startTransition(async () => {
          try {
            if (isScopeZoneOrWard) {
              const scopePayload = {
                scope: formData.searchCategory === 1 ? {
                  searchCategory: 1,
                  zoneId: Number(formData.zoneId)
                } : {
                  searchCategory: 2,
                  wardId: Number(formData.wardId)
                },
                screenIds: selectedScreenIds.map(Number),
                action,
              };
              const response = await bulkLockUnlockByCategoryAction(scopePayload);
              if (response.success) {
                toast.success(response.message || t("messages.bulkSuccess"));
                handleShow();
                resetSelectionState();
              } else {
                toast.error(response.error || t("messages.bulkFailed"));
              }
              return;
            }

            let payload: Parameters<typeof bulkLockUnlockPropertiesAction>[0] = {
              screenIds: selectedScreenIds.map(Number),
              action,
            };

            if (isAllPropertiesSelected) {
              const { fromProperty, toProperty } = getPropertyQueryRange();
              
              let basePropertyNo = "";
              let partitionNoStr = "";
              
              if (formData.searchCategory === 3 && formData.propertyNos) {
                const partitions: string[] = [];
                for (const propStr of formData.propertyNos) {
                  const matchedOption = propertyOptions.find((o) => o.value === propStr);
                  let propNo = "";
                  let partition = "";
                  
                  if (matchedOption) {
                    propNo = matchedOption.propertyNo || "";
                    partition = matchedOption.partitionNo || "";
                  } else {
                    const parts = propStr.split("-");
                    propNo = parts[0];
                    partition = parts.length > 1 ? parts.slice(1).join("-") : "";
                  }
                  
                  if (!basePropertyNo) basePropertyNo = propNo;
                  if (partition) partitions.push(partition);
                }
                if (partitions.length > 0) partitionNoStr = partitions.join(",");
              }

              payload = {
                selectAll: true,
                excludedPropertyIds,
                screenIds: selectedScreenIds.map(Number),
                action,
                filters: {
                  searchCategory: formData.searchCategory,
                  zoneId: formData.zoneId ? Number(formData.zoneId) : undefined,
                  wardId: formData.wardId ? Number(formData.wardId) : undefined,
                  fromProperty,
                  toProperty,
                  propertyNo: basePropertyNo || undefined,
                  partitionNo: partitionNoStr || undefined,
                  search: lastAppliedSearchRef.current || undefined,
                },
              };
            } else {
              payload.propertyIds = selectedPropertyIds.map(Number);
            }

            const response = await bulkLockUnlockPropertiesAction(payload);

            if (response.success) {
              toast.success(response.message || t("messages.bulkSuccess"));
              handleShow();
              resetSelectionState();
            } else {
              toast.error(response.error || t("messages.bulkFailed"));
            }
          } catch (err: unknown) {
            toast.error(err instanceof Error ? err.message : t("messages.unexpectedError"));
          }
        });
      },
    });
  };

  const toPropertyOptions = useMemo(() => {
    if (!formData.fromProperty) return propertyOptions;
    const fromIndex = propertyOptions.findIndex((opt) => opt.value === formData.fromProperty);
    if (fromIndex === -1) return propertyOptions;
    return propertyOptions.slice(fromIndex);
  }, [propertyOptions, formData.fromProperty]);

  const columns = useLockUnlockColumns({
    screens,
    selectedPropertyIds,
    properties,
    isPending,
    isAllPropertiesSelected,
    excludedPropertyIds,
    searchCategory: formData.searchCategory,
    onSelectProperty: handleSelectProperty,
    onSelectAllProperties: handleSelectAllProperties,
    onToggleLock: handleToggleLock,
    onManageLocks: handleManageLocks,
  });

  return {
    formData,
    showResults,
    setFormData,
    selectedScreenIds,
    setSelectedScreenIds,
    setShowResults,
    properties,
    selectedPropertyIds,
    setSelectedPropertyIds,
    isAllPropertiesSelected,
    excludedPropertyIds,
    editModal,
    setEditModal,
    isPending,
    propertyOptions,
    toPropertyOptions,
    isLoadingProperties,
    propertySearchTerm,
    setPropertySearchTerm,
    isSearching,
    handlePropertySearch,
    handleClearSearch,
    pagination,
    handleSelectChange,
    handleClearAll,
    handleShow,
    handleSelectProperty,
    handleSelectAllProperties,
    handleToggleLock,
    handleManageLocks,
    handleSaveIndividualLock,
    handleBulkAction,
    handlePageChange,
    handlePageSizeChange,
    handleSearchButtonClick,
    columns,
  };
}