"use client";

import { useState, useMemo, useCallback, useEffect, useRef, useTransition } from "react";
import { useTranslations, useLocale } from "next-intl";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import {
  BulkUpdateFieldConfig,
  PropertyPreviewRow,
  PropertyFilterFormValues,
  WingOption,
  SelectOption,
  CommonDetailsUpdatePageProps,
} from "@/types/common-details-update/common-details-update.types";
import { PagedResponse } from "@/types/common.types";
import { useCommonDetailsUpdateActions } from "@/hooks/commonDetailsUpdate/useCommonDetailsUpdateActions";

const DEFAULT_PAGE_SIZE = 10;
const PAGE_SIZE_OPTIONS = [10, 20, 50, 100];

export const useCommonDetailsUpdate = (props: CommonDetailsUpdatePageProps) => {
  const { 
    menuItems, 
    wardsData,
    wingsData,
    initialField,
    initialWardId,
    initialFromProperty,
    initialToProperty,
    initialWing,
    initialPage,
    initialPageSize,
    initialSearchTerm,
  } = props;
  const t = useTranslations("commonDetailsUpdate");
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [_isPending, startTransition] = useTransition();

  // ── Left panel ──────────────────────────────────────────────────────────────
  // Initialize selectedCode from URL param (initialField) or first menu item
  const [selectedCode, setSelectedCode] = useState<string>(
    initialField || menuItems[0]?.updateCode || ""
  );
  const [menuSearch, setMenuSearch] = useState("");
  const [fieldConfigs, setFieldConfigs] = useState<BulkUpdateFieldConfig[]>([]);
  const [loadingConfigs, setLoadingConfigs] = useState(false);

  // ── Filter ───────────────────────────────────────────────────────────────────
  // Initialize filter values from URL params
  const [filterValues, setFilterValues] = useState<PropertyFilterFormValues>({
    wardId: initialWardId || "",
    fromPropertyNo: initialFromProperty || "",
    toPropertyNo: initialToProperty || "",
    wingId: initialWing || "",
  });
  const [filterSubmitted, setFilterSubmitted] = useState(false);
  const [_wings, setWings] = useState<WingOption[]>([]);

  // ── Dropdown Options ─────────────────────────────────────────────────────────
  // Initialize ward options from server-loaded data (no client-side loading needed)
  const wardOptions = useMemo<SelectOption[]>(() => {
    const items = wardsData?.items || [];
    return items.map((ward) => ({
      label: ward.wardNo,
      value: String(ward.id),
    }));
  }, [wardsData]);
  const [propertyOptions, setPropertyOptions] = useState<SelectOption[]>([]);
  // Initialize wing options from server-loaded data (no client-side loading needed)
  const allWingOptions = useMemo<SelectOption[]>(() => {
    const items = wingsData?.items || [];
    return items.map((wing) => ({
      label: wing.wingNo,
      value: String(wing.id),
    }));
  }, [wingsData]);
  const [loadingPropertyOptions, setLoadingPropertyOptions] = useState(false);

  // ── Properties ───────────────────────────────────────────────────────────────
  const [properties, setProperties] = useState<PropertyPreviewRow[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  // Initialize page/pageSize/searchTerm from URL params
  const [propertiesPage, setPropertiesPage] = useState(initialPage || 1);
  const [propertiesPageSize, setPropertiesPageSize] = useState(initialPageSize || DEFAULT_PAGE_SIZE);
  const [propertiesSearchTerm, setPropertiesSearchTerm] = useState(initialSearchTerm || "");
  const [loadingProperties, setLoadingProperties] = useState(false);

  // ── Selection ────────────────────────────────────────────────────────────────
  const [selectedPropertyIds, setSelectedPropertyIds] = useState<Set<number>>(
    new Set()
  );

  // ── Form ─────────────────────────────────────────────────────────────────────
  const [formValues, setFormValues] = useState<
    Record<string, string | number | boolean>
  >({});
  const [formSubmitted, setFormSubmitted] = useState(false);

  const { 
    saving, 
    loadFieldConfigs, 
    loadProperties, 
    loadWings, 
    loadPropertiesByWard,
    handleBulkUpdate 
  } = useCommonDetailsUpdateActions(t);

  // Track initial load for field configs
  const initialLoadRef = useRef(false);
  // Track if initial URL params have been processed (to avoid URL sync during initial mount)
  const isInitialMountRef = useRef(true);

  // ── URL Sync Helper ──────────────────────────────────────────────────────────
  const updateUrlParams = useCallback((updates: Record<string, string | number | undefined>) => {
    // Skip URL update during initial mount to prevent "Cannot call startTransition while rendering"
    if (isInitialMountRef.current) return;
    
    const params = new URLSearchParams(searchParams.toString());
    
    Object.entries(updates).forEach(([key, value]) => {
      if (value !== undefined && value !== "" && value !== null) {
        params.set(key, String(value));
      } else {
        params.delete(key);
      }
    });

    const queryString = params.toString();
    const newUrl = queryString ? `${pathname}?${queryString}` : pathname;
    startTransition(() => {
      router.replace(newUrl, { scroll: false });
    });
  }, [pathname, router, searchParams, startTransition]);

  // Mark initial mount as complete after first render cycle
  useEffect(() => {
    // Use a small timeout to ensure the initial render cycle completes
    const timer = setTimeout(() => {
      isInitialMountRef.current = false;
    }, 0);
    return () => clearTimeout(timer);
  }, []);

  // Load field configs for initial menu selection
  useEffect(() => {
    if (initialLoadRef.current) return;
    if (!selectedCode || !menuItems.length) return;
    
    initialLoadRef.current = true;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLoadingConfigs(true);

    // Wrap in try-catch and use timeout fallback to ensure loading state is cleared
    const loadingTimeout = setTimeout(() => {
      setLoadingConfigs(false);
    }, 10000); // 10 second timeout as fallback

    try {
      loadFieldConfigs(selectedCode, (configs) => {
        clearTimeout(loadingTimeout);
        setFieldConfigs(configs);
        const defaults: Record<string, string | number | boolean> = {};
        configs.forEach((f) => {
          if (f.defaultValue != null) {
            defaults[f.fieldName] = f.defaultValue;
          } else if (f.controlType === "checkbox") {
            defaults[f.fieldName] = false;
          } else {
            defaults[f.fieldName] = "";
          }
        });
        setFormValues(defaults);
        setLoadingConfigs(false);
      });
    } catch {
      clearTimeout(loadingTimeout);
      setLoadingConfigs(false);
    }

    return () => clearTimeout(loadingTimeout);
  }, [selectedCode, menuItems.length, loadFieldConfigs]);

  // Load property options when initialWardId is provided from URL params
  useEffect(() => {
    if (initialWardId) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setLoadingPropertyOptions(true);
      
      // Fallback timeout to clear loading state
      const loadingTimeout = setTimeout(() => {
        setLoadingPropertyOptions(false);
      }, 10000);

      try {
        loadPropertiesByWard(Number(initialWardId), (options) => {
          clearTimeout(loadingTimeout);
          setPropertyOptions(options);
          setLoadingPropertyOptions(false);
        });
      } catch {
        clearTimeout(loadingTimeout);
        setLoadingPropertyOptions(false);
      }

      return () => clearTimeout(loadingTimeout);
    }
  }, [initialWardId, loadPropertiesByWard]);

  // Track if auto-load has been done
  const autoLoadDoneRef = useRef(false);

  // Auto-load properties when all URL params exist and wings are loaded (on page refresh)
  useEffect(() => {
    // Only auto-load once, and only if all required params exist
    if (autoLoadDoneRef.current) return;
    if (!initialWardId || !initialFromProperty || !initialToProperty || !initialWing) return;
    // Wait for allWingOptions to be loaded
    if (allWingOptions.length === 0) return;
    
    autoLoadDoneRef.current = true;
    
    // Get the wing label from the selected wing option
    const selectedWingOption = allWingOptions.find(w => w.value === initialWing);
    const wingLabel = selectedWingOption?.label || "";
    
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLoadingProperties(true);
    setFilterSubmitted(true);
    
    // Use timeout fallback to ensure loading state is cleared even if callback fails
    const loadingTimeout = setTimeout(() => {
      setLoadingProperties(false);
    }, 15000); // 15 second timeout as fallback

    try {
      loadProperties(
        {
          wardId: initialWardId,
          fromPropertyNo: initialFromProperty.split('-')[0],
          toPropertyNo: initialToProperty.split('-')[0],
          wingId: wingLabel,
          updateCode: selectedCode,
          page: 1,
          pageSize: 200,
        },
        (data: PagedResponse<PropertyPreviewRow>) => {
          clearTimeout(loadingTimeout);
          setProperties(data.items);
          setTotalCount(data.totalCount);
          setLoadingProperties(false);
        }
      );
    } catch {
      clearTimeout(loadingTimeout);
      setLoadingProperties(false);
    }

    return () => clearTimeout(loadingTimeout);
  }, [initialWardId, initialFromProperty, initialToProperty, initialWing, allWingOptions, selectedCode, loadProperties]);

  // ── Derived ──────────────────────────────────────────────────────────────────
  const filteredMenuItems = useMemo(() => {
    if (!menuSearch.trim()) return menuItems;
    const q = menuSearch.toLowerCase();
    return menuItems.filter(
      (item) =>
        item.updateName.toLowerCase().includes(q) ||
        item.updateNameMarathi.includes(menuSearch)
    );
  }, [menuItems, menuSearch]);

  // Use allWingOptions for the Wing dropdown (instead of ward-specific wings)
  const wingOptions: SelectOption[] = useMemo(
    () => allWingOptions,
    [allWingOptions]
  );

  const selectedMenuItem = useMemo(
    () => menuItems.find((m) => m.updateCode === selectedCode),
    [menuItems, selectedCode]
  );

  // Filter properties by search term
  const filteredProperties = useMemo(() => {
    if (!propertiesSearchTerm.trim()) return properties;
    const q = propertiesSearchTerm.toLowerCase();
    return properties.filter(
      (p) =>
        p.propertyNo.toLowerCase().includes(q) ||
        p.partitionNo.toLowerCase().includes(q) ||
        p.wardNo.toLowerCase().includes(q)
    );
  }, [properties, propertiesSearchTerm]);

  const pagedProperties = useMemo(
    () =>
      filteredProperties.slice(
        (propertiesPage - 1) * propertiesPageSize,
        propertiesPage * propertiesPageSize
      ),
    [filteredProperties, propertiesPage, propertiesPageSize]
  );

  const allSelected =
    properties.length > 0 && selectedPropertyIds.size === properties.length;

  const isFormValid = useMemo(
    () =>
      fieldConfigs.every((f) => {
        if (!f.isRequired) return true;
        if (f.controlType === "checkbox") return true;
        const val = formValues[f.fieldName];
        return val !== undefined && val !== "" && val !== null;
      }),
    [fieldConfigs, formValues]
  );

  // ── Check if Show button should be enabled ─────────────────────────────────
  const canShowProperties = useMemo(() => {
    return Boolean(
      filterValues.wardId &&
      filterValues.fromPropertyNo &&
      filterValues.toPropertyNo &&
      filterValues.wingId
    );
  }, [filterValues]);

  // ── Handlers ─────────────────────────────────────────────────────────────────
  const handleMenuSelect = useCallback(
    async (code: string) => {
      if (code === selectedCode) return;
      setSelectedCode(code);
      setFieldConfigs([]);
      setFormValues({});
      setFormSubmitted(false);
      setLoadingConfigs(true);

      // Sync to URL
      updateUrlParams({ field: code });

      await loadFieldConfigs(code, (configs) => {
        setFieldConfigs(configs);
        const defaults: Record<string, string | number | boolean> = {};
        configs.forEach((f) => {
          if (f.defaultValue != null) {
            defaults[f.fieldName] = f.defaultValue;
          } else if (f.controlType === "checkbox") {
            defaults[f.fieldName] = false;
          } else {
            defaults[f.fieldName] = "";
          }
        });
        setFormValues(defaults);
        setLoadingConfigs(false);
      });

      setLoadingConfigs(false);
    },
    [selectedCode, loadFieldConfigs, updateUrlParams]
  );

  const handleWardChange = useCallback(
    async (wardId: string) => {
      // Reset dependent fields when ward changes
      setFilterValues((prev) => ({ 
        ...prev, 
        wardId, 
        fromPropertyNo: "",
        toPropertyNo: "",
        wingId: "" 
      }));
      setPropertyOptions([]);
      setWings([]);

      // Sync to URL
      updateUrlParams({ 
        wardId, 
        fromProperty: undefined,
        toProperty: undefined,
        wing: undefined,
      });
      
      if (wardId) {
        // Load properties for this ward (for From/To dropdowns)
        setLoadingPropertyOptions(true);
        await loadPropertiesByWard(Number(wardId), (options) => {
          setPropertyOptions(options);
          setLoadingPropertyOptions(false);
        });
        
        // Also load ward-specific wings if needed (legacy)
        await loadWings(Number(wardId), setWings);
      }
    },
    [loadWings, loadPropertiesByWard, updateUrlParams]
  );

  /**
   * Handler for when From/To Property dropdown is focused/clicked.
   * Loads properties if not already loaded.
   */
  const handlePropertyDropdownFocus = useCallback(async () => {
    if (propertyOptions.length > 0 || !filterValues.wardId) return;
    
    setLoadingPropertyOptions(true);
    await loadPropertiesByWard(Number(filterValues.wardId), (options) => {
      setPropertyOptions(options);
      setLoadingPropertyOptions(false);
    });
  }, [filterValues.wardId, propertyOptions.length, loadPropertiesByWard]);

  const handleShowProperties = useCallback(async () => {
    setFilterSubmitted(true);
    if (!canShowProperties) return;

    setLoadingProperties(true);
    setPropertiesPage(1);
    setSelectedPropertyIds(new Set());

    // Get the wing label (wingNo) from the selected wing option
    const selectedWingOption = allWingOptions.find(w => w.value === filterValues.wingId);
    const wingLabel = selectedWingOption?.label || "";

    await loadProperties(
      {
        wardId: filterValues.wardId,
        fromPropertyNo: filterValues.fromPropertyNo.split('-')[0], // Extract propertyNo from "propertyNo-partitionNo"
        toPropertyNo: filterValues.toPropertyNo.split('-')[0], // Extract propertyNo from "propertyNo-partitionNo"
        wingId: wingLabel, // Pass wing label (e.g., "A", "B") instead of ID
        updateCode: selectedCode,
        page: 1,
        pageSize: 200,
      },
      (data: PagedResponse<PropertyPreviewRow>) => {
        setProperties(data.items);
        setTotalCount(data.totalCount);
        setLoadingProperties(false);
        // Show success toast with count or info toast when no properties found
        if (data.totalCount > 0) {
          toast.success(t("messages.propertiesLoaded", { count: data.totalCount }));
        } else {
          toast.info(t("messages.noPropertiesFound"));
        }
        // Sync filter values to URL after successfully loading properties
        updateUrlParams({
          wardId: filterValues.wardId || undefined,
          fromProperty: filterValues.fromPropertyNo || undefined,
          toProperty: filterValues.toPropertyNo || undefined,
          wing: filterValues.wingId || undefined,
        });
      }
    );

    setLoadingProperties(false);
  }, [filterValues, loadProperties, selectedCode, canShowProperties, allWingOptions, t, updateUrlParams]);

  const handleBack = useCallback(() => {
    setFilterValues({ wardId: "", fromPropertyNo: "", toPropertyNo: "", wingId: "" });
    setFilterSubmitted(false);
    setProperties([]);
    setTotalCount(0);
    setSelectedPropertyIds(new Set());
    setPropertiesPage(1);
    setWings([]);
    setPropertyOptions([]);
    
    // Clear URL parameters
    startTransition(() => {
      router.replace(pathname, { scroll: false });
    });
  }, [pathname, router]);

  const handleSelectAll = useCallback(() => {
    setSelectedPropertyIds(
      allSelected ? new Set() : new Set(properties.map((p) => p.id))
    );
  }, [allSelected, properties]);

  const handlePropertySelect = useCallback((id: number, checked: boolean) => {
    setSelectedPropertyIds((prev) => {
      const next = new Set(prev);
      if (checked) next.add(id);
      else next.delete(id);
      return next;
    });
  }, []);

  const handlePropertiesPageSizeChange = useCallback((newSize: number) => {
    setPropertiesPageSize(newSize);
    setPropertiesPage(1); // Reset to first page when changing page size
    // Sync to URL
    updateUrlParams({ pageSize: newSize, page: 1 });
  }, [updateUrlParams]);

  const handlePropertiesSearch = useCallback((searchTerm: string) => {
    setPropertiesSearchTerm(searchTerm);
    setPropertiesPage(1); // Reset to first page when searching
    // Sync to URL
    updateUrlParams({ q: searchTerm || undefined, page: 1 });
  }, [updateUrlParams]);

  const handlePageChange = useCallback((page: number) => {
    setPropertiesPage(page);
    // Sync to URL
    updateUrlParams({ page });
  }, [updateUrlParams]);

  const handleFormValueChange = useCallback(
    (fieldName: string, value: string | number | boolean) => {
      setFormValues((prev) => ({ ...prev, [fieldName]: value }));
    },
    []
  );

  const handleFormClear = useCallback(() => {
    const defaults: Record<string, string | number | boolean> = {};
    fieldConfigs.forEach((f) => {
      defaults[f.fieldName] = f.controlType === "checkbox" ? false : "";
    });
    setFormValues(defaults);
    setFormSubmitted(false);
  }, [fieldConfigs]);

  const handleSubmitBulkUpdate = useCallback(async () => {
    setFormSubmitted(true);
    if (!isFormValid || !selectedMenuItem) return;
    if (selectedPropertyIds.size === 0) return;

    await handleBulkUpdate(
      selectedMenuItem.apiRoute,
      {
        updateCode: selectedCode,
        propertyIds: Array.from(selectedPropertyIds),
        updateData: formValues,
      },
      async () => {
        handleFormClear();
        setSelectedPropertyIds(new Set());
        // After successful update, refresh the properties list to show updated data
        await handleShowProperties();
      }
    );
  }, [
    isFormValid,
    selectedMenuItem,
    selectedPropertyIds,
    selectedCode,
    formValues,
    handleBulkUpdate,
    handleFormClear,
    handleShowProperties,
  ]);

  // ── Pagination Info ─────────────────────────────────────────────────────────
  const paginationInfo = useMemo(() => {
    const total = filteredProperties.length;
    if (total === 0) {
      return { start: 0, end: 0, total: 0 };
    }
    const start = (propertiesPage - 1) * propertiesPageSize + 1;
    const end = Math.min(propertiesPage * propertiesPageSize, total);
    return { start, end, total };
  }, [filteredProperties.length, propertiesPage, propertiesPageSize]);

  // ── Wrapped setFilterValues without URL sync ──────────────────────────────────
  // URL sync is only done in handleShowProperties after successfully loading properties
  const handleFilterValuesChange: React.Dispatch<React.SetStateAction<PropertyFilterFormValues>> = useCallback((action) => {
    setFilterValues(prev => {
      const newValues = typeof action === 'function' ? action(prev) : action;
      return newValues;
    });
  }, []);

  return {
    t,
    locale,
    // Menu
    filteredMenuItems,
    selectedCode,
    selectedMenuItem,
    menuSearch,
    setMenuSearch,
    handleMenuSelect,
    // Field configs
    fieldConfigs,
    loadingConfigs,
    // Filter
    filterValues,
    setFilterValues: handleFilterValuesChange,
    filterSubmitted,
    wardOptions,
    wingOptions,
    propertyOptions,
    handleWardChange,
    handlePropertyDropdownFocus,
    handleShowProperties,
    handleBack,
    loadingProperties,
    loadingWards: false, // Data is server-loaded, no client-side loading
    loadingPropertyOptions,
    loadingWingOptions: false, // Data is server-loaded, no client-side loading
    canShowProperties,
    // Properties
    properties,
    filteredProperties,
    pagedProperties,
    propertiesPage,
    setPropertiesPage: handlePageChange,
    propertiesPageSize,
    handlePropertiesPageSizeChange,
    propertiesSearchTerm,
    handlePropertiesSearch,
    pageSizeOptions: PAGE_SIZE_OPTIONS,
    totalCount,
    // Selection
    selectedPropertyIds,
    allSelected,
    handleSelectAll,
    handlePropertySelect,
    // Form
    formValues,
    formSubmitted,
    isFormValid,
    saving,
    handleFormValueChange,
    handleFormClear,
    handleSubmitBulkUpdate,
    // Pagination info
    paginationInfo,
  };
};
