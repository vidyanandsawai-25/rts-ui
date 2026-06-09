import { useState, useTransition, useCallback, useEffect } from "react";
import { toast } from "sonner";
import { useConfirm } from "@/components/common/ConfirmProvider";
import { LockedScreen, LockUnlockPropertyItem, LockUnlockPropertiesResponse } from "@/types/lockunlock.types";
import { fetchLockUnlockPropertiesPagedAction, bulkLockUnlockPropertiesAction } from "@/app/[locale]/property-tax/lockunlock/action";
import { getScreenIds } from "@/lib/api/lockunlock/lockunlock.utils";
import { useLockUnlockColumns } from "./useLockUnlockColumns";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";

export interface UseLockUnlockMasterProps {
  wardIdFromUrl: string;
  screens: LockedScreen[];
  dropdownProperties: { label: string; value: string }[];
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
  const [propertySearchTerm, setPropertySearchTerm] = useState(searchFromUrl);
  const [isSearching, setIsSearching] = useState(false);
  const [appliedPropertySearchTerm, setAppliedPropertySearchTerm] = useState(searchFromUrl);

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

    // Update form data
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (name === "wardId") {
      if (value) {
        params.set("wardId", value);
      } else {
        params.delete("wardId");
      }
      // Clear property selections/results when ward changes
      setFormData((prev) => ({ ...prev, fromProperty: "", toProperty: "" }));
      setShowResults(false);
      setProperties([]);
      setSelectedPropertyIds([]);
      setSelectedScreenIds([]);
      setPagination({ pageNumber: 1, pageSize: 10, totalCount: 0, totalPages: 1 });
      setPropertySearchTerm("");
      setAppliedPropertySearchTerm("");
      setPropertyOptions([]);

      params.delete("fromProperty");
      params.delete("toProperty");
      params.delete("page");
      params.delete("search");
      router.push(`${pathname}?${params.toString()}`);
    } else if (name === "fromProperty") {
      if (value) {
        params.set("fromProperty", value);
      } else {
        params.delete("fromProperty");
      }
      router.push(`${pathname}?${params.toString()}`);
    } else if (name === "toProperty") {
      if (value) {
        params.set("toProperty", value);
      } else {
        params.delete("toProperty");
      }
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
    setSelectedPropertyIds([]);
    setPagination({ pageNumber: 1, pageSize: 10, totalCount: 0, totalPages: 1 });
    setPropertyOptions([]);
    setPropertySearchTerm("");
    
    // Clear URL parameters
    router.push(pathname);
    
    toast.info(t("messages.clearedFilters"));
  };

  // Keeps the input responsive without firing a request until the button is clicked.
  const handlePropertySearch = useCallback((searchTerm: string) => {
    setPropertySearchTerm(searchTerm);
    // If clearing the search, also clear URL and applied term immediately
    if (!searchTerm) {
      setAppliedPropertySearchTerm("");
      const params = new URLSearchParams(searchParams.toString());
      params.delete("search");
      router.push(`${pathname}?${params.toString()}`);
    }
  }, [searchParams, pathname, router]);

  // Clear search
  const handleClearSearch = useCallback(() => {
    setPropertySearchTerm("");
    setAppliedPropertySearchTerm("");
    // Clear search param from URL
    const params = new URLSearchParams(searchParams.toString());
    params.delete("search");
    router.push(`${pathname}?${params.toString()}`);
  }, [searchParams, pathname, router]);

  const fetchProperties = useCallback(
    (pageNum: number, pageSz: number, searchTerm: string = appliedPropertySearchTerm) => {
      if (!formData.wardId || !formData.fromProperty || !formData.toProperty) {
        toast.error(t("messages.validationError"));
        return;
      }

      startTransition(async () => {
        setIsSearching(true);
        try {
          const response: LockUnlockPropertiesResponse = await fetchLockUnlockPropertiesPagedAction({
            WardId: Number(formData.wardId),
            FromPropertyNo: formData.fromProperty.split("-")[0],
            ToPropertyNo: formData.toProperty.split("-")[0],
            PageNumber: pageNum,
            PageSize: pageSz,
            Search: searchTerm || undefined,
          });

          const items = response?.items ?? [];

          if (items.length > 0) {
            setProperties(items);
            setSelectedPropertyIds([]);
            setPagination({
              pageNumber: response.pageNumber || pageNum,
              pageSize: response.pageSize || pageSz,
              totalCount: response.totalCount ?? items.length,
              totalPages: Math.max(1, response.totalPages || 1),
            });
            setShowResults(true);
            toast.success(t("messages.fetchSuccess"));
          } else {
            setProperties([]);
            setSelectedPropertyIds([]);
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
    [appliedPropertySearchTerm, formData, t]
  );

  const handleShow = useCallback(() => {
    fetchProperties(1, pagination.pageSize);
  }, [fetchProperties, pagination.pageSize]);

  const handleSearchButtonClick = useCallback(() => {
    setAppliedPropertySearchTerm(propertySearchTerm);
    // Update URL with search term
    const params = new URLSearchParams(searchParams.toString());
    if (propertySearchTerm) {
      params.set("search", propertySearchTerm);
    } else {
      params.delete("search");
    }
    router.push(`${pathname}?${params.toString()}`);
    fetchProperties(1, pagination.pageSize, propertySearchTerm);
  }, [fetchProperties, pagination.pageSize, propertySearchTerm, searchParams, pathname, router]);

  const handlePageChange = useCallback(
    (page: number) => {
      // Update URL with new page number
      const params = new URLSearchParams(searchParams.toString());
      params.set("page", page.toString());
      router.push(`${pathname}?${params.toString()}`);

      fetchProperties(page, pagination.pageSize);
    },
    [fetchProperties, pagination.pageSize, searchParams, pathname, router]
  );

  const handlePageSizeChange = useCallback(
    (size: number) => {
      // Update URL with new page size and reset to page 1
      const params = new URLSearchParams(searchParams.toString());
      params.set("pageSize", size.toString());
      params.set("page", "1");
      router.push(`${pathname}?${params.toString()}`);

      fetchProperties(1, size);
    },
    [fetchProperties, searchParams, pathname, router]
  );

  const handleSelectProperty = (propertyId: number) => {
    setSelectedPropertyIds((prev) =>
      prev.includes(propertyId) ? prev.filter((id) => id !== propertyId) : [...prev, propertyId]
    );
  };

  const handleSelectAllProperties = () => {
    if (selectedPropertyIds.length === properties.length) {
      setSelectedPropertyIds([]);
    } else {
      setSelectedPropertyIds(properties.map((p) => p.propertyId));
    }
  };

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
    if (selectedPropertyIds.length === 0) {
      toast.error(t("messages.selectPropertyRequired"));
      return;
    }
    if (selectedScreenIds.length === 0) {
      toast.error(t("messages.selectScreenRequired"));
      return;
    }

    const title = action === "lock" ? t("messages.bulkLockTitle") : t("messages.bulkUnlockTitle");
    const description = t("messages.bulkConfirmDescription", {
      action: action === "lock" ? t("messages.lockButtonText").toLowerCase() : t("messages.unlockButtonText").toLowerCase(),
      screenCount: selectedScreenIds.length,
      propertyCount: selectedPropertyIds.length,
    });

    confirm({
      variant: action === "lock" ? "warning" : "info",
      title,
      description,
      confirmText: action === "lock" ? t("messages.lockButtonText") : t("messages.unlockButtonText"),
      onConfirm: async () => {
        startTransition(async () => {
          try {
            const response = await bulkLockUnlockPropertiesAction({
              propertyIds: selectedPropertyIds.map(Number),
              screenIds: selectedScreenIds.map(Number),
              action,
            });

            if (response.success) {
              toast.success(response.message || t("messages.bulkSuccess"));
              handleShow();
              setSelectedPropertyIds([]);
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

  const columns = useLockUnlockColumns({
    screens,
    selectedPropertyIds,
    properties,
    isPending,
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
    editModal,
    setEditModal,
    isPending,
    propertyOptions,
    isLoadingProperties,
    propertySearchTerm,
    setPropertySearchTerm,
    isSearching,
    handlePropertySearch,
    handleSearchButtonClick,
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
    columns,
  };
}
