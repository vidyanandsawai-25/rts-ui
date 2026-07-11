"use client";
/* eslint-disable @typescript-eslint/no-explicit-any */

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
import { ScopeOption } from "@/lib/api/common-details-update/common-details-update.service";
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
    initialScopeId,
    initialZoneId,
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

  // Initialize filter values from URL params
  const [filterValues, setFilterValues] = useState<PropertyFilterFormValues>({
    zoneId: initialZoneId || "",
    wardId: initialWardId || "",
    fromPropertyNo: initialFromProperty || "",
    toPropertyNo: initialToProperty || "",
    wingId: initialWing || "",
    propertyTypeId: "",
  });
  const [filterSubmitted, setFilterSubmitted] = useState(false);
  const [_wings, setWings] = useState<WingOption[]>([]);
  
  // ── Scope Options ────────────────────────────────────────────────────────────
  const [scopeOptions, setScopeOptions] = useState<ScopeOption[]>([]);
  const [selectedScopeId, setSelectedScopeId] = useState<number | null>(null);
  const [activeScopeDetails, setActiveScopeDetails] = useState<ScopeOption | null>(null);
  const [loadingScopeOptions, setLoadingScopeOptions] = useState(false);

  // ── Dropdown Options ─────────────────────────────────────────────────────────
  // Initialize ward options from server-loaded data
  const [wardOptions, setWardOptions] = useState<SelectOption[]>(() => {
    const items = wardsData?.items || [];
    return items.map((ward) => ({
      label: ward.wardNo,
      value: String(ward.id),
    }));
  });
  const [zoneOptions, setZoneOptions] = useState<SelectOption[]>([]);
  const [propertyOptions, setPropertyOptions] = useState<SelectOption[]>([]);
  const [propertyTypeOptions, setPropertyTypeOptions] = useState<SelectOption[]>([]);
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
    loadScopeOptions,
    loadScopeCategoryOptions,
    loadAllZones,
    loadAllWards,
    handleBulkUpdate 
  } = useCommonDetailsUpdateActions(t);

  // Track initial load for field configs
  const initialLoadRef = useRef(false);
  // Track if initial URL params have been processed (to avoid URL sync during initial mount)
  const isInitialMountRef = useRef(true);
  // Track if initial properties have been auto-loaded
  const initialLoadPropertiesRef = useRef(false);
  const prevSelectedCodeRef = useRef(selectedCode);

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

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLoadingScopeOptions(true);
    const fromPtis = searchParams.get("from") === "ptis";
    loadScopeOptions((options) => {
      setScopeOptions(options);
      if (options.length > 0) {
        const defaultScope = initialScopeId
          ? options.find(o => String(o.id) === initialScopeId)
          : fromPtis 
            ? options.find(o => o.id === 4 || o.name === 'PropertyRange') 
            : undefined;
            
        const newScopeId = defaultScope?.id || null;
        setSelectedScopeId(newScopeId);
        
        // Sync to URL if it was not present or different
        if (newScopeId !== null && String(newScopeId) !== initialScopeId) {
          updateUrlParams({ scopeId: newScopeId });
        }
      }
      setLoadingScopeOptions(false);
    });
  }, [loadScopeOptions, searchParams, initialScopeId, updateUrlParams]);

  // Sync initial field to URL if not present
  useEffect(() => {
    if (!initialField && menuItems.length > 0 && menuItems[0]?.updateCode) {
      const timer = setTimeout(() => {
        updateUrlParams({ field: menuItems[0].updateCode });
      }, 50);
      return () => clearTimeout(timer);
    }
  }, [initialField, menuItems, updateUrlParams]);
  // Load category details when scope changes
  useEffect(() => {
    if (selectedScopeId) {
      loadScopeCategoryOptions(selectedScopeId, (details) => {
        setActiveScopeDetails(details);
        
        // If Zone is required, load zones
        if (details.options.includes("Zone")) {
          loadAllZones((zones) => setZoneOptions(zones));
        } else if (details.options.includes("Ward")) {
          // If Ward is required but Zone is not, load all wards
          loadAllWards(undefined, (wards) => setWardOptions(wards));
        }
        
        // If Property Type is required, load them
        if (details.options.includes("Property Type")) {
          // Normally fetch property types here. For now we use placeholder.
          setPropertyTypeOptions([
            { label: "Residential", value: "1" },
            { label: "Commercial", value: "2" },
          ]);
        }
      });
    }
  }, [selectedScopeId, loadScopeCategoryOptions, loadAllZones, loadAllWards]);

  // Load field configs for initial menu selection
  useEffect(() => {
    if (initialLoadRef.current) return;
    if (!selectedCode || !menuItems.length) return;
    
    initialLoadRef.current = true;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLoadingConfigs(true);
    
    loadFieldConfigs(selectedCode, (configs) => {
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
    }).finally(() => {
      setLoadingConfigs(false);
    });
  }, [selectedCode, menuItems.length, loadFieldConfigs]);

  // Load property options when initialWardId is provided from URL params
  useEffect(() => {
    if (initialWardId && selectedCode) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setLoadingPropertyOptions(true);
      loadPropertiesByWard(Number(initialWardId), selectedCode, (options) => {
        setPropertyOptions(options);
      }).finally(() => {
        setLoadingPropertyOptions(false);
      });
    }
  }, [initialWardId, selectedCode, loadPropertiesByWard]);

  // Auto-load properties when all URL params exist (on page refresh or field change)
  useEffect(() => {
    // Only auto-load once per field selection
    const isSameCode = selectedCode === prevSelectedCodeRef.current;
    if (initialLoadPropertiesRef.current && isSameCode) return;
    
    // Wait until activeScopeDetails is loaded to know what filters are required
    if (!activeScopeDetails) return;

    // Check if the initial URL params satisfy the scope requirements
    let urlHasEnoughParams = false;
    if (initialWardId) {
      if (activeScopeDetails.options.includes("From Property")) {
        urlHasEnoughParams = Boolean(initialFromProperty && initialToProperty);
      } else if (activeScopeDetails.options.includes("Property No")) {
        urlHasEnoughParams = Boolean(initialFromProperty);
      } else {
        urlHasEnoughParams = true; // E.g. Ward/Sector only needs Ward
      }
    }

    if (urlHasEnoughParams) {
      initialLoadPropertiesRef.current = true;
      prevSelectedCodeRef.current = selectedCode;
      
      // Get the wing label from the selected wing option
      let wingLabel = "";
      if (initialWing && allWingOptions.length > 0) {
        const selectedWingOption = allWingOptions.find(w => w.value === initialWing);
        wingLabel = selectedWingOption?.label || "";
      }
      
      // Determine the parameters to send based on scope
      let fromNo = "";
      let toNo = "";
      
      if (activeScopeDetails.options.includes("From Property")) {
        fromNo = initialFromProperty || "";
        toNo = initialToProperty || "";
      } else if (activeScopeDetails.options.includes("Property No")) {
        fromNo = initialFromProperty || "";
        toNo = initialFromProperty || ""; // Same for To
      }
      
      setTimeout(() => {
        setFilterSubmitted(true);
        setLoadingProperties(true);
      }, 0);
      
      loadProperties(
        {
          zoneId: initialZoneId || undefined,
          wardId: initialWardId,
          fromPropertyNo: fromNo,
          toPropertyNo: toNo,
          wingId: wingLabel || undefined,
          updateCode: selectedCode,
          page: initialPage || propertiesPage,
          pageSize: initialPageSize || propertiesPageSize,
        },
        (data: PagedResponse<PropertyPreviewRow>) => {
          setProperties(data.items);
          setTotalCount(data.totalCount);
        }
      ).finally(() => {
        setLoadingProperties(false);
      });
    } else {
      // If we don't have enough params in the URL, mark as handled so we don't auto-load when user types manually
      initialLoadPropertiesRef.current = true;
      prevSelectedCodeRef.current = selectedCode;
    }
  }, [
    initialZoneId, initialWardId, initialFromProperty, initialToProperty, initialWing, 
    allWingOptions, selectedCode, loadProperties, activeScopeDetails,
    initialPage, initialPageSize, propertiesPage, propertiesPageSize
  ]);

  // ── Derived ──────────────────────────────────────────────────────────────────
  // Use the full property-partition options for both From and To
  const fromPropertyOptions = propertyOptions;
  const toPropertyOptions = propertyOptions;
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
    () => properties,
    [properties]
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
    if (!activeScopeDetails) return false;
    
    // Base criteria is Ward (since the API requires it)
    if (!filterValues.wardId) return false;
    
    // For Property Range, we need From and To
    if (activeScopeDetails.options.includes("From Property")) {
      return Boolean(filterValues.fromPropertyNo && filterValues.toPropertyNo);
    }
    
    // For Building Wise, we need Property No
    if (activeScopeDetails.options.includes("Property No")) {
      return Boolean(filterValues.fromPropertyNo); // Using fromPropertyNo to store the single Property No
    }
    
    return true; // Other scopes like WardSector might just need Ward
  }, [filterValues, activeScopeDetails]);

  const hasAnyFilterValue = useMemo(() => {
    return Object.values(filterValues).some(v => v !== undefined && v !== null && v !== "");
  }, [filterValues]);

  // ── Handlers ─────────────────────────────────────────────────────────────────
  const handleMenuSelect = useCallback(
    async (code: string) => {
      if (code === selectedCode) return;
      
      // Build new URL with updated field param
      const params = new URLSearchParams(searchParams.toString());
      params.set("field", code);
      
      // Navigate to the new URL - this will trigger server-side re-render with new data
      const newUrl = `${pathname}?${params.toString()}`;
      router.push(newUrl, { scroll: false });
      
      // Update local state
      setSelectedCode(code);
      setFieldConfigs([]);
      setFormValues({});
      setFormSubmitted(false);
      setLoadingConfigs(true);

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
      }).finally(() => {
        setLoadingConfigs(false);
      });
    },
    [selectedCode, loadFieldConfigs, pathname, searchParams, router]
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
      
      if (wardId && selectedCode) {
        // Only load wings if needed, do NOT load properties here
        // Properties will be loaded on dropdown focus or Show button click
        await loadWings(Number(wardId), setWings);
      }
    },
    [loadWings, selectedCode, updateUrlParams]
  );

  const handleZoneChange = useCallback((zoneId: string) => {
    setFilterValues((prev) => ({ 
      ...prev, 
      zoneId, 
      wardId: "", 
      fromPropertyNo: "",
      toPropertyNo: "",
    }));
    
    // Sync to URL
    updateUrlParams({ 
      zoneId: zoneId || undefined,
      wardId: undefined, 
      fromProperty: undefined,
      toProperty: undefined,
    });
    
    // Load wards for this zone
    if (zoneId) {
      loadAllWards(Number(zoneId), (wards) => setWardOptions(wards));
    } else {
      loadAllWards(undefined, (wards) => setWardOptions(wards));
    }
  }, [updateUrlParams, loadAllWards]);

  const handleScopeChange = useCallback((scopeId: number) => {
    setSelectedScopeId(scopeId);
    
    // Reset filters when scope changes
    setFilterValues({
      zoneId: "",
      wardId: "",
      fromPropertyNo: "",
      toPropertyNo: "",
      wingId: "",
      propertyTypeId: "",
    });
    
    updateUrlParams({ 
      scopeId,
      zoneId: undefined,
      wardId: undefined,
      fromProperty: undefined,
      toProperty: undefined,
      wing: undefined,
    });
  }, [updateUrlParams]);

  const handlePropertyDropdownFocus = useCallback(async () => {
    if (propertyOptions.length > 0 || !filterValues.wardId || !selectedCode) return;
    
    setLoadingPropertyOptions(true);
    await loadPropertiesByWard(Number(filterValues.wardId), selectedCode, (options) => {
      setPropertyOptions(options);
    }).finally(() => {
      setLoadingPropertyOptions(false);
    });
  }, [filterValues.wardId, selectedCode, propertyOptions.length, loadPropertiesByWard]);

  const handleFromPropertyChange = useCallback((val: string) => {
    setFilterValues((prev) => ({ ...prev, fromPropertyNo: val }));
    updateUrlParams({ fromProperty: val || undefined });
  }, [updateUrlParams]);

  const handleToPropertyChange = useCallback((val: string) => {
    setFilterValues((prev) => ({ ...prev, toPropertyNo: val }));
    updateUrlParams({ toProperty: val || undefined });
  }, [updateUrlParams]);

  const handleShowProperties = useCallback(async (targetPage: any = 1, targetPageSize: any = propertiesPageSize) => {
    const pageNum = typeof targetPage === "number" ? targetPage : 1;
    const sizeNum = typeof targetPageSize === "number" ? targetPageSize : propertiesPageSize;

    setFilterSubmitted(true);
    if (!canShowProperties) return;

    setLoadingProperties(true);
    setSelectedPropertyIds(new Set());

    // Get the wing label (wingNo) from the selected wing option
    let wingLabel = "";
    if (filterValues.wingId) {
      const selectedWingOption = allWingOptions.find(w => w.value === filterValues.wingId);
      wingLabel = selectedWingOption?.label || "";
    }

    // Determine the parameters to send based on scope
    let fromNo = "";
    let toNo = "";
    
    if (activeScopeDetails?.options.includes("From Property")) {
      fromNo = filterValues.fromPropertyNo;
      toNo = filterValues.toPropertyNo;
    } else if (activeScopeDetails?.options.includes("Property No")) {
      fromNo = filterValues.fromPropertyNo;
      toNo = filterValues.fromPropertyNo; // Same for To
    }

    await loadProperties(
      {
        zoneId: filterValues.zoneId || undefined,
        wardId: filterValues.wardId,
        fromPropertyNo: fromNo,
        toPropertyNo: toNo,
        wingId: wingLabel || undefined,
        propertyTypeId: filterValues.propertyTypeId || undefined,
        updateCode: selectedCode,
        page: pageNum,
        pageSize: sizeNum,
      },
      (data: PagedResponse<PropertyPreviewRow>) => {
        setProperties(data.items);
        setTotalCount(data.totalCount);
        setPropertiesPage(pageNum);
        // Show success toast with count or info toast when no properties found
        if (data.totalCount > 0) {
          if (pageNum === 1) {
            toast.success(t("messages.propertiesLoaded", { count: data.totalCount }));
          }
        } else {
          toast.info(t("messages.noPropertiesFound"));
        }
        // Sync filter values to URL after successfully loading properties
        updateUrlParams({
          wardId: filterValues.wardId || undefined,
          fromProperty: filterValues.fromPropertyNo || undefined,
          toProperty: filterValues.toPropertyNo || undefined,
          wing: filterValues.wingId || undefined,
          page: pageNum,
          pageSize: sizeNum,
        });
      }
    ).finally(() => {
      setLoadingProperties(false);
    });
  }, [filterValues, loadProperties, selectedCode, canShowProperties, allWingOptions, t, updateUrlParams, activeScopeDetails, propertiesPageSize]);

  const handleBack = useCallback(() => {
    setFilterValues({ zoneId: "", wardId: "", fromPropertyNo: "", toPropertyNo: "", wingId: "", propertyTypeId: "" });
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
    if (filterSubmitted) {
      handleShowProperties(1, newSize);
    } else {
      updateUrlParams({ pageSize: newSize, page: 1 });
    }
  }, [updateUrlParams, filterSubmitted, handleShowProperties]);

  const handlePropertiesSearch = useCallback((searchTerm: string) => {
    setPropertiesSearchTerm(searchTerm);
    setPropertiesPage(1); // Reset to first page when searching
    // Sync to URL
    updateUrlParams({ q: searchTerm || undefined, page: 1 });
  }, [updateUrlParams]);

  const handlePageChange = useCallback((page: number) => {
    setPropertiesPage(page);
    if (filterSubmitted) {
      handleShowProperties(page, propertiesPageSize);
    } else {
      updateUrlParams({ page });
    }
  }, [updateUrlParams, filterSubmitted, handleShowProperties, propertiesPageSize]);

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
    
    // Use selected property IDs if any are selected, otherwise use all loaded property IDs
    const idsToUpdate = selectedPropertyIds.size > 0 
      ? Array.from(selectedPropertyIds)
      : properties.map((p) => p.id);
    
    if (idsToUpdate.length === 0) return;

    await handleBulkUpdate(
      selectedMenuItem.apiRoute,
      {
        updateCode: selectedCode,
        propertyIds: idsToUpdate,
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
    properties,
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
    scopeOptions,
    selectedScopeId,
    handleScopeChange,
    activeScopeDetails,
    zoneOptions,
    wardOptions,
    wingOptions,
    propertyOptions,
    fromPropertyOptions,
    toPropertyOptions,
    propertyTypeOptions,
    handleZoneChange,
    handleWardChange,
    handlePropertyDropdownFocus,
    handleFromPropertyChange,
    handleToPropertyChange,
    handleShowProperties,
    handleBack,
    loadingProperties,
    loadingScopeOptions,
    loadingWards: false, // Data is server-loaded, no client-side loading
    loadingPropertyOptions,
    loadingWingOptions: false, // Data is server-loaded, no client-side loading
    canShowProperties,
    hasAnyFilterValue,
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
