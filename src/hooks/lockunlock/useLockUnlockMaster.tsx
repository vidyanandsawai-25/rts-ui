import { useState, useTransition, useCallback, useEffect, useMemo, useRef } from "react";
import { toast } from "sonner";
import { useConfirm } from "@/components/common/ConfirmProvider";
import { LockedScreen, LockUnlockPropertyItem, LockUnlockPropertiesResponse } from "@/types/lockunlock.types";
import { WardItem } from "@/types/wardMaster.types";
import { fetchLockUnlockPropertiesPagedAction, bulkLockUnlockPropertiesAction } from "@/app/[locale]/property-tax/lockunlock/action";
import { getScreenIds } from "@/lib/api/lockunlock/lockunlock.utils";
import { useLockUnlockColumns } from "./useLockUnlockColumns";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { SEARCH_ALPHANUMERIC_SANITIZE } from "@/lib/utils/validation-rules";
import { useDebounce } from "@/hooks/useDebounce";

export interface UseLockUnlockMasterProps {
  wardIdFromUrl: string;
  screens: LockedScreen[];
  dropdownProperties: { label: string; value: string; propertyId?: number }[];
  initialProperties?: LockUnlockPropertyItem[];
  initialPagination?: PaginationState;
  wards?: WardItem[];
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
  wards = [],
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
  const [formData, setFormData] = useState({
    wardId: wardIdFromUrl || "",
    fromProperty: fromPropertyFromUrl,
    toProperty: toPropertyFromUrl,
  });

  // Selected Screen IDs
  const [selectedScreenIds, setSelectedScreenIds] = useState<number[]>([]);

  // Results State - initialize with server-fetched data if available
  const [showResults, setShowResults] = useState(initialProperties.length > 0);
  const [properties, setProperties] = useState<LockUnlockPropertyItem[]>(initialProperties);
  const [selectedPropertyIds, setSelectedPropertyIds] = useState<number[]>([]);

  // Select-All-Across-Pages State
  const [isAllPropertiesSelected, setIsAllPropertiesSelected] = useState(false);
  const [excludedPropertyIds, setExcludedPropertyIds] = useState<number[]>([]);

  // Pagination State - initialize with server-provided pagination if available, or from URL
  const [pagination, setPagination] = useState<PaginationState>(
    initialPagination || {
      pageNumber: pageFromUrl,
      pageSize: pageSizeFromUrl,
      totalCount: 0,
      totalPages: 1,
    }
  );

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

  // Property dropdown options state - starts with server-fetched data
  const [propertyOptions, setPropertyOptions] = useState<{ label: string; value: string }[]>(dropdownProperties);
  const [isLoadingProperties, setIsLoadingProperties] = useState(false);

  // Search state for property number filtering (server-side search)
  const searchFromUrl = searchParams.get("search") || "";
  const initialSanitizedSearch = searchFromUrl.replace(SEARCH_ALPHANUMERIC_SANITIZE, "");
  const [propertySearchTerm, setPropertySearchTerm] = useState(initialSanitizedSearch);
  const [isSearching, setIsSearching] = useState(false);
  const lastAppliedSearchRef = useRef(initialSanitizedSearch);

  // Reset selection state
  const resetSelectionState = useCallback(() => {
    setIsAllPropertiesSelected(false);
    setSelectedPropertyIds([]);
    setExcludedPropertyIds([]);
  }, []);

  // Fetch property dropdown options when wardId changes
  useEffect(() => {
    if (!wardIdFromUrl) {
      return;
    }

    const fetchDropdownProperties = async () => {
      setIsLoadingProperties(true);

      try {
        const propertiesResponse = await fetchLockUnlockPropertiesPagedAction({
          WardId: Number(wardIdFromUrl),
          PageNumber: 1,
          PageSize: -1,
        });

        if (propertiesResponse && propertiesResponse.items) {
          const seen = new Set<string>();
          const options: { label: string; value: string }[] = [];

          (propertiesResponse.items || []).forEach((p: LockUnlockPropertyItem) => {
            const propNoOnly = String(p.propertyNo ?? "").trim();
            if (propNoOnly && !seen.has(propNoOnly)) {
              seen.add(propNoOnly);
              options.push({
                label: propNoOnly,
                value: propNoOnly,
              });
            }

            const normalizedPartitionNo = String(p.partitionNo ?? "").trim();
            const hasPartition =
              normalizedPartitionNo !== "" &&
              normalizedPartitionNo !== "0" &&
              normalizedPartitionNo !== "-";

            if (hasPartition) {
              const displayValue = `${propNoOnly}-${normalizedPartitionNo}`;
              if (!seen.has(displayValue)) {
                seen.add(displayValue);
                options.push({
                  label: displayValue,
                  value: displayValue,
                });
              }
            }
          });

          setPropertyOptions(options);
        } else {
          setPropertyOptions([]);
        }
      } catch (err: unknown) {
        console.error("Failed to fetch dropdown properties:", err);
        toast.error(t("messages.fetchFailed"));
        setPropertyOptions([]);
      } finally {
        setIsLoadingProperties(false);
      }
    };

    fetchDropdownProperties();
  }, [wardIdFromUrl, t]);

  const handleSelectChange = (name: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());

    if (name === "wardId") {
      if (value) {
        params.set("wardId", value);
      } else {
        params.delete("wardId");
      }
      // Clear property selections/results when ward changes
      setFormData((prev) => ({ ...prev, wardId: value, fromProperty: "", toProperty: "" }));
      setShowResults(false);
      setProperties([]);
      resetSelectionState();
      setSelectedScreenIds([]);
      setPagination({ pageNumber: 1, pageSize: 10, totalCount: 0, totalPages: 1 });
      setPropertySearchTerm("");
      setPropertyOptions([]);

      params.delete("fromProperty");
      params.delete("toProperty");
      params.delete("page");
      params.delete("search");
      router.push(`${pathname}?${params.toString()}`);
    } else if (name === "fromProperty") {
      let newToProperty = formData.toProperty;
      if (value) {
        params.set("fromProperty", value);
        const fromIndex = propertyOptions.findIndex((o) => o.value === value);
        const toIndex = propertyOptions.findIndex((o) => o.value === formData.toProperty);

        // If the previously selected 'toProperty' is now invalid (comes before 'fromProperty'),
        // clear it instead of auto-selecting.
        if (toIndex !== -1 && toIndex < fromIndex) {
          newToProperty = "";
          params.delete("toProperty");
        }
      } else {
        params.delete("fromProperty");
      }
      setFormData((prev) => ({ ...prev, fromProperty: value, toProperty: newToProperty }));
      router.push(`${pathname}?${params.toString()}`);
    } else if (name === "toProperty") {
      if (value) {
        params.set("toProperty", value);
      } else {
        params.delete("toProperty");
      }
      setFormData((prev) => ({ ...prev, toProperty: value }));
      router.push(`${pathname}?${params.toString()}`);
    }
  };

  const handleClearAll = () => {
    setFormData({
      wardId: "",
      fromProperty: "",
      toProperty: "",
    });
    setSelectedScreenIds([]);
    setShowResults(false);
    setProperties([]);
    resetSelectionState();
    setPagination({ pageNumber: 1, pageSize: 10, totalCount: 0, totalPages: 1 });
    setPropertyOptions([]);
    setPropertySearchTerm("");

    // Clear URL parameters
    router.push(pathname);

    toast.info(t("messages.clearedFilters"));
  };

  // Keeps the input responsive and triggers debounced search.
  const handlePropertySearch = useCallback((searchTerm: string) => {
    const sanitizedSearchTerm = searchTerm.replace(SEARCH_ALPHANUMERIC_SANITIZE, "");

    if (searchTerm !== sanitizedSearchTerm) {
      // Force React to acknowledge the state change by setting the invalid value,
      // then immediately queuing a state update to the sanitized value to fix the DOM.
      setPropertySearchTerm(searchTerm);
      setTimeout(() => setPropertySearchTerm(sanitizedSearchTerm), 0);
    } else {
      setPropertySearchTerm(sanitizedSearchTerm);
    }
  }, []);



  // Clear search
  const handleClearSearch = useCallback(() => {
    setPropertySearchTerm("");
  }, []);

  const debouncedSearchTerm = useDebounce(propertySearchTerm, 500);

  // Helper to extract property numbers and partition numbers range
  const getPropertyQueryRange = useCallback(() => {
    let fromPropertyNoOnly = formData.fromProperty;
    let toPropertyNoOnly = formData.toProperty;
    const partitionNoStr: string | undefined = undefined;

    if (formData.fromProperty && formData.toProperty) {
      fromPropertyNoOnly = formData.fromProperty.split("-")[0];
      toPropertyNoOnly = formData.toProperty.split("-")[0];
      
      // We purposefully do not generate a massive comma-separated string 
      // of partition numbers for the range, as it causes HTTP 414 URI Too Long.
      // The backend will simply filter by the FromPropertyNo and ToPropertyNo boundaries.
    }

    return {
      fromProperty: fromPropertyNoOnly || undefined,
      toProperty: toPropertyNoOnly || undefined,
      partitionNo: partitionNoStr,
    };
  }, [formData.fromProperty, formData.toProperty]);

  const fetchProperties = useCallback(
    (pageNum: number, pageSz: number, searchTerm: string = debouncedSearchTerm, resetSelection: boolean = false) => {
      if (!formData.wardId) {
        toast.error("Please select a Ward");
        return;
      }

      const isSearchActive = !!searchTerm;
      if (!isSearchActive && (!formData.fromProperty || !formData.toProperty)) {
        toast.error(t("messages.validationError"));
        return;
      }

      startTransition(async () => {
        setIsSearching(true);
        try {
          const { fromProperty, toProperty, partitionNo } = getPropertyQueryRange();

          // Normalize the search: collapse spaces around hyphens
          const normalizedSearch = searchTerm
            ? searchTerm.replace(/\s*-\s*/g, "-").trim()
            : "";

          const params: Record<string, unknown> = {
            WardId: Number(formData.wardId),
            FromPropertyNo: fromProperty,
            ToPropertyNo: toProperty,
            PageNumber: pageNum,
            PageSize: pageSz,
          };

          if (partitionNo) {
            params.PartitionNo = partitionNo;
          }

          let searchedPropertyNo = "";

          if (normalizedSearch) {
            params.SearchTerm = normalizedSearch; // Pass it as SearchTerm in case backend uses it for general search

            // Find selected ward label to identify and strip it if present
            const selectedWard = (wards || []).find((w) => String(w.id) === formData.wardId);
            const selectedWardNo = selectedWard?.wardNo ? selectedWard.wardNo.trim() : "";

            const parts = normalizedSearch.split("-").map((p) => p.trim());
            const cleanParts = [...parts];
            
            if (
              selectedWardNo &&
              cleanParts[0] &&
              cleanParts[0].toLowerCase() === selectedWardNo.toLowerCase()
            ) {
              cleanParts.shift();
            }

            if (cleanParts.length >= 2) {
              const propPart = cleanParts[0];
              const partPart = cleanParts[1];
              if (propPart) params.Search = propPart;
              if (partPart) {
                params.SearchPartitionNo = partPart;
              }
              searchedPropertyNo = propPart;
            } else if (cleanParts.length === 1 && cleanParts[0]) {
              const term = cleanParts[0];
              // If it contains letters, it might be a partition query OR a general search term
              if (/[a-zA-Z]/.test(term)) {
                params.SearchPartitionNo = term;
              } else {
                params.Search = term;
                searchedPropertyNo = term;
              }
            }
          }

          const response: LockUnlockPropertiesResponse = await fetchLockUnlockPropertiesPagedAction(
            params as Parameters<typeof fetchLockUnlockPropertiesPagedAction>[0]
          );

          if (response?.items?.length > 0) {
            let filteredItems = [...response.items];

            if (normalizedSearch) {
              const searchLower = normalizedSearch.toLowerCase();
              const searchLowerNoHyphen = searchLower.replace(/-/g, "");

              filteredItems = filteredItems.filter((item) => {
                const ward = (item.wardNo || "").toLowerCase();
                const prop = (item.propertyNo || "").toLowerCase();
                const part = (item.partitionNo || "").toLowerCase();

                const comb1 = `${ward}-${prop}-${part}`;
                const comb2 = `${prop}-${part}`;
                const comb3 = `${ward}-${prop}`;

                return (
                  ward.includes(searchLower) ||
                  prop.includes(searchLower) ||
                  part.includes(searchLower) ||
                  comb1.includes(searchLower) ||
                  comb2.includes(searchLower) ||
                  comb3.includes(searchLower) ||
                  comb1.replace(/-/g, "").includes(searchLowerNoHyphen) ||
                  comb2.replace(/-/g, "").includes(searchLowerNoHyphen)
                );
              });
            }

            if (searchedPropertyNo) {
              const searchLower = searchedPropertyNo.toLowerCase();
              filteredItems.sort((a, b) => {
                const aProp = (a.propertyNo || "").toLowerCase();
                const bProp = (b.propertyNo || "").toLowerCase();

                const aExact = aProp === searchLower;
                const bExact = bProp === searchLower;

                if (aExact && !bExact) return -1;
                if (!aExact && bExact) return 1;
                return 0;
              });
            }

            if (filteredItems.length > 0) {
              setProperties(filteredItems);
              if (resetSelection) {
                resetSelectionState();
              }
              setPagination({
                pageNumber: response.pageNumber || pageNum,
                pageSize: response.pageSize || pageSz,
                totalCount: response.totalCount,
                totalPages: response.totalPages,
              });
              setShowResults(true);
            } else {
              setProperties([]);
              if (resetSelection) {
                resetSelectionState();
              }
              setPagination({ pageNumber: 1, pageSize: pageSz, totalCount: 0, totalPages: 1 });
              setShowResults(true);
              toast.info(t("messages.fetchNoResults"));
            }
          } else {
            setProperties([]);
            if (resetSelection) {
              resetSelectionState();
            }
            setPagination({ pageNumber: 1, pageSize: pageSz, totalCount: 0, totalPages: 1 });
            setShowResults(true);
            toast.info(t("messages.fetchNoResults"));
          }
        } catch (err: unknown) {
          toast.error(err instanceof Error ? err.message : t("messages.fetchFailed"));
        } finally {
          setIsSearching(false);
        }
      });
    },
    [debouncedSearchTerm, formData.wardId, formData.fromProperty, formData.toProperty, getPropertyQueryRange, t, resetSelectionState, wards]
  );

  // Show (initial load) and search should reset selection
  const handleShow = useCallback(() => {
    fetchProperties(1, pagination.pageSize, undefined, true);
  }, [fetchProperties, pagination.pageSize]);

  // Handle manual search button click
  const handleSearchButtonClick = useCallback(() => {
    fetchProperties(1, pagination.pageSize, propertySearchTerm, true);
  }, [fetchProperties, pagination.pageSize, propertySearchTerm]);



  // Sync debounced search term to URL and fetch properties
  useEffect(() => {
    if (debouncedSearchTerm !== lastAppliedSearchRef.current) {
      lastAppliedSearchRef.current = debouncedSearchTerm;
      const params = new URLSearchParams(searchParams.toString());
      if (debouncedSearchTerm) {
        params.set("search", debouncedSearchTerm);
      } else {
        params.delete("search");
      }
      router.push(`${pathname}?${params.toString()}`);

      if (showResults) {
        fetchProperties(1, pagination.pageSize, debouncedSearchTerm, true);
      }
    }
  }, [debouncedSearchTerm, fetchProperties, pagination.pageSize, searchParams, pathname, router, showResults]);

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
    const hasSelection = isAllPropertiesSelected || selectedPropertyIds.length > 0;
    if (!hasSelection) {
      toast.error(t("messages.selectPropertyRequired"));
      return;
    }
    if (selectedScreenIds.length === 0) {
      toast.error(t("messages.selectScreenRequired"));
      return;
    }

    const propertyCount = isAllPropertiesSelected
      ? pagination.totalCount - excludedPropertyIds.length
      : selectedPropertyIds.length;

    const title = action === "lock" ? t("messages.bulkLockTitle") : t("messages.bulkUnlockTitle");
    const description = t("messages.bulkConfirmDescription", {
      action: action === "lock" ? t("messages.lockButtonText").toLowerCase() : t("messages.unlockButtonText").toLowerCase(),
      screenCount: selectedScreenIds.length,
      propertyCount,
    });

    confirm({
      variant: action === "lock" ? "warning" : "info",
      title,
      description,
      confirmText: action === "lock" ? t("messages.lockButtonText") : t("messages.unlockButtonText"),
      onConfirm: async () => {
        startTransition(async () => {
          try {
            let payload: Parameters<typeof bulkLockUnlockPropertiesAction>[0] = {
              screenIds: selectedScreenIds.map(Number),
              action,
            };

            if (isAllPropertiesSelected) {
              const { fromProperty, toProperty, partitionNo } = getPropertyQueryRange();
              payload = {
                selectAll: true,
                excludedPropertyIds,
                screenIds: selectedScreenIds.map(Number),
                action,
                filters: {
                  wardId: Number(formData.wardId),
                  fromProperty,
                  toProperty,
                  partitionNo,
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
    onSelectProperty: handleSelectProperty,
    onSelectAllProperties: handleSelectAllProperties,
    onToggleLock: handleToggleLock,
    onManageLocks: handleManageLocks,
  });

  return {
    formData,
    setFormData,
    selectedScreenIds,
    setSelectedScreenIds,
    showResults,
    setShowResults,
    properties,
    setProperties,
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