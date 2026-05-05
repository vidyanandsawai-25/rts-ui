
"use client";

// Ensure finance year dropdown always shows options and binds correctly
// (must be after 'use client' and before imports)
// This useEffect should be inside the component, not at the top level
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Plus, X, Building2, Grid2X2, MapPin, Calendar, Users, CheckCircle, CalendarDays, TrendingUp, ClipboardCopy } from "lucide-react";
import { toast } from "sonner";
import { useTranslations, useLocale } from "next-intl";
import { SaveButton, DeleteLabelButton, DownloadButton, UploadButton } from "@/components/common/ActionButtons";
import { StatusBadge } from "@/components/common/StatusBadge";
import {SearchSelect} from "@/components/common/SearchSelect";
import { MatrixGrid } from "@/components/common/MatrixGrid";
import { MatrixGridPagination } from "@/components/common/MatrixGrid";
import { IBackendRateMaster, RateMasterFormProps } from "@/types/RVRateMaster";
import { useConfirm } from "@/components/common/ConfirmProvider";
import { getRateMasterByFilters } from "@/app/[locale]/property-tax/rate-master/rvratemaster/action";
import { sanitizePositiveDecimal, POSITIVE_DECIMAL_INVALID_KEYS } from "@/lib/utils/validation";
import { MatrixCellInput } from "@/components/common/MatrixCellInput";
import { useRateMasterFilters } from "@/hooks/useRateMasterFilters";
import { useRateMasterOperations } from "@/hooks/useRateMasterOperations";
import { useRateMasterFormState } from "@/hooks/useRateMasterFormState";
import { useRateMasterImportExport } from "@/hooks/useRateMasterImportExport";

const RateMasterForm: React.FC<RateMasterFormProps> = ({
  id,
  zoneOptions,
  useGroupOptions,
  assessmentYears,
  assessmentYearRanges, 
  zoneDescriptions,
  allZones,
  rateCategories,
  editData,
  bulkEditData,
  backendRates,
  filterValues,
  showCopyRateSection,
  showMultipliersSection,
  hideMatrixSection,
  // sourceUseGroup: initialSourceUseGroup, // unused
  // fetchedRates, // unused
  // year: _initialYear, // unused
  onClose,
  mode: propMode,
  paginatedZonesData,
  initialExistingRatesCheck,
}) => {
  const mode: "edit" | "delete" | "add" = propMode || "edit";
  const t = useTranslations("ptis_RVRateMaster");
  const tCommon = useTranslations("common");
  const locale = useLocale();
  const router = useRouter();
  const { confirm } = useConfirm();

  // Use custom hooks for filters and operations
  const {
    selectedZone,
    selectedUseGroup,
    assessmentYear,
    setSelectedZone,
    setSelectedUseGroup,
    setAssessmentYear,
    fetchedBackendRates,
    rateFrequency,
    setRateFrequency,
    multipliers,
    setMultipliers,
    handleDropdownChange,
  } = useRateMasterFilters({
    mode,
    backendRates: backendRates || undefined,
    filterValues,
    useGroupOptions,
  });

  const {
    handleBulkCreate,
    handleBulkUpdate,
    handleDelete,
  } = useRateMasterOperations({
    mode,
    id: id || undefined,
    selectedZone,
    selectedUseGroup,
    assessmentYear,
    rateFrequency,
    multipliers,
    rateCategories,
    useGroupOptions,
  });

  // Use custom hook for form state management
  const {
    showMatrix,
    setShowMatrix,
    matrixData,
    setMatrixData,
    matrixPageNumber,
    matrixPageSize,
    matrixTotalPages,
    matrixTotalCount,
    paginatedZoneDescriptions,
    allZoneEdits,
    setAllZoneEdits,
    existingRateFound,
    setExistingRateFound,
    isCheckingRates,
    setIsCheckingRates,
    allFiltersSelected,
    errors,
    // setErrors, // unused
    zoneRemarksMap,
    filledRatesCount,
    // totalPossibleRates, // unused
    completionPercentage,
    matrixStorageKey,
    handleMatrixPaginationChange,
    buildCompleteMatrixForSubmission,
  } = useRateMasterFormState({
    mode,
    id,
    editData,
    bulkEditData,
    backendRates,
    fetchedBackendRates,
    filterValues,
    selectedZone,
    selectedUseGroup,
    assessmentYear,
    setSelectedZone,
    setSelectedUseGroup,
    setAssessmentYear,
    rateFrequency,
    setRateFrequency,
    zoneDescriptions,
    allZones,
    rateCategories,
    assessmentYears,
    zoneOptions,
    useGroupOptions,
    showCopyRateSection,
    showMultipliersSection,
    paginatedZonesData,
    initialExistingRatesCheck,
  });

  // Use custom hook for import/export/copy logic
  const {
    sourceUseGroup,
    setSourceUseGroup,
    sourceRateSection,
    setSourceRateSection,
    sourceRateSectionOptions,
    copySectionsExpanded,
    setCopySectionsExpanded,
    copyRatesActiveTab,
    setCopyRatesActiveTab,
    showMultipliersInline,
    setShowMultipliersInline,
    tempMultipliers,
    setTempMultipliers,
    fileInputRef,
    handleCopyRates,
    handleCopyRatesFromRateSection,
    handleDownloadTemplate,
    handleUploadExcel,
  } = useRateMasterImportExport({
    selectedZone,
    selectedUseGroup,
    assessmentYear,
    allZones,
    zoneDescriptions,
    rateCategories,
    zoneOptions,
    useGroupOptions,
    assessmentYears,
    assessmentYearRanges,
    matrixData,
    setMatrixData,
    allZoneEdits,
    setAllZoneEdits,
    setShowMatrix,
    showMatrix,
    showCopyRateSection,
    t,
    multipliers,
    setMultipliers,
  });

  // Check for existing rates when all filters are selected (client-side validation)
  useEffect(() => {
    const isEditMode = !!id || !!editData || !!bulkEditData;
    
    if (isEditMode) {
      setExistingRateFound(false);
      return;
    }

    if (!allFiltersSelected) {
      setExistingRateFound(false);
      return;
    }

    const checkExistingRates = async () => {
      setIsCheckingRates(true);
      try {
        const existingRates = await getRateMasterByFilters(
          selectedZone,
          selectedUseGroup,
          assessmentYear
        );
        const ratesExist = existingRates && existingRates.length > 0;
        setExistingRateFound(ratesExist);
        
        if (ratesExist) {
          toast.error(t('messages.validationRatesAlreadyExist'));
        }
      } catch (error) {
        console.error('Failed to check existing rates:', error);
        setExistingRateFound(false);
      } finally {
        setIsCheckingRates(false);
      }
    };

    checkExistingRates();
    // eslint-disable-next-line react-hooks/exhaustive-deps -- setExistingRateFound and setIsCheckingRates are stable setState functions
  }, [selectedZone, selectedUseGroup, assessmentYear, id, editData, bulkEditData, t, allFiltersSelected]);

  // Update URL params when dropdown values change
  useEffect(() => {
    if (typeof window !== 'undefined' && selectedZone && selectedUseGroup && assessmentYear) {
      const params = new URLSearchParams(window.location.search);
      params.set('zone', selectedZone);
      params.set('useGroup', selectedUseGroup);
      params.set('assessmentYear', assessmentYear);
      
      if (copySectionsExpanded) {
        params.set('showCopyRates', 'true');
      } else {
        params.delete('showCopyRates');
      }
      
      if (showMultipliersInline) {
        params.set('showMultipliers', 'true');
      } else {
        params.delete('showMultipliers');
      }
      
      const currentPath = window.location.pathname;
      const newUrl = `${currentPath}?${params.toString()}`;
      window.history.replaceState({}, '', newUrl);
    }
  }, [selectedZone, selectedUseGroup, assessmentYear, copySectionsExpanded, showMultipliersInline]);

  const handleClose = () => {
    if (onClose) {
      onClose();
    } else {
      router.replace(`/${locale}/property-tax/rate-master/rvratemaster`);
    }
  };

  const handleAddRates = async () => {
    // Build complete matrix for submission (includes all pages)
    const completeMatrixData = await buildCompleteMatrixForSubmission();
    
    //Validate that all rates are filled (100% completion)
    const totalCells = completeMatrixData.length * rateCategories.length;
    const filledCells = completeMatrixData.reduce((count, row) => {
      return count + rateCategories.filter(cat => {
        const key = cat.constructionCode || cat.constructionId;
        const value = row[key] as number;
        return value && value > 0;
      }).length;
    }, 0);
    
    const completionPercentage = totalCells > 0 ? Math.round((filledCells / totalCells) * 100) : 0;
    
    if (completionPercentage < 100) {
      toast.error(t('messages.validationIncompleteMatrix', { percentage: completionPercentage }));
      return;
    }
    
    // Use hook's bulk create handler
    const result = await handleBulkCreate(completeMatrixData);
    
    // Close drawer and navigate on success
    if (result?.success) {
      handleClose();
    }
  };

  const handleUpdateRates = async () => {
    // Build complete matrix for submission (includes all pages)
    const completeMatrixData = await buildCompleteMatrixForSubmission();
    
    // Use hook's bulk update handler
    const result = await handleBulkUpdate(completeMatrixData);
    
    // Close drawer and navigate on success
    if (result?.success) {
      handleClose();
    }
  };

  const handleDeleteRates = async () => {
    // Always fetch latest backendRates for the selected zone, use group, and assessment year
    let latestBackendRates: IBackendRateMaster[] = [];

    try {
      latestBackendRates = await getRateMasterByFilters(
        selectedZone,
        selectedUseGroup,
        assessmentYear,     
      );
    } catch (err) {
      console.error('Failed to fetch backend rates for delete:', err);
      toast.error(t('messages.fetchRatesForDeleteFailed'));
      return;
    }

    if (!latestBackendRates || latestBackendRates.length === 0) {
      toast.error(t('messages.noRatesToDelete'));
      return;
    }

    // Helper to safely get value for both camelCase and PascalCase keys
    function getRateValue(rate: IBackendRateMaster, key: string): number | undefined {
      // Try camelCase
      if (Object.prototype.hasOwnProperty.call(rate, key)) {
        return rate[key as keyof IBackendRateMaster] as number | undefined;
      }
      // Try PascalCase
      const pascalKey = key.charAt(0).toUpperCase() + key.slice(1);
      if (Object.prototype.hasOwnProperty.call(rate, pascalKey)) {
        return rate[pascalKey as keyof IBackendRateMaster] as number | undefined;
      }
      return undefined;
    }

    // Calculate configured (non-zero) rates count across all fetched backend rates
    const configuredRatesCount = latestBackendRates.reduce((count, rate) => {
      return (
        count +
        rateCategories.filter(cat => {
          const key = cat.constructionCode || cat.constructionId;
          const value = getRateValue(rate, key);
          return Number(value) && Number(value) > 0;
        }).length
      );
    }, 0);

    // Find zone name
    let zoneName = selectedZone;
    if (zoneOptions && Array.isArray(zoneOptions)) {
      const found = zoneOptions.find(z => z.value === selectedZone);
      if (found && found.label) zoneName = found.label;
    } else if (zoneDescriptions && Array.isArray(zoneDescriptions)) {
      const found = zoneDescriptions.find(z => String(z.zoneNo) === String(selectedZone));
      if (found && found.description) zoneName = found.description;
    }

    // Find use group label
    const useGroupLabel = useGroupOptions.find(
      (opt) => opt.value === selectedUseGroup
    )?.label || selectedUseGroup;

    // Find assessment year label
    const assessmentYearLabel = assessmentYearRanges?.find(
      (ay) => String(ay.value) === String(assessmentYear)
    )?.label || assessmentYears?.find(
      (ay) => String(ay.value) === String(assessmentYear)
    )?.label || assessmentYear;

    confirm({
      variant: "delete",
      title: t('dialogs.deleteRatesTitle'),
      description: t('dialogs.deleteRatesDescription', {
        count: configuredRatesCount,
        zoneName: zoneName,
        useGroup: useGroupLabel,
        assessmentYear: assessmentYearLabel,
      }),
      confirmText: t('dialogs.confirmDelete'),
      cancelText: t('dialogs.cancel'),
      onConfirm: async () => {
        // Use hook's delete handler
        const result = await handleDelete(latestBackendRates);
        
        // Close drawer and navigate on success
        if (result?.success) {
          handleClose();
        }
      },
    });
  };

  // Normalize rateCategories to always be array of objects with constructionId, constructionCode, and description
  const normalizedCategories = Array.isArray(rateCategories) && rateCategories.length > 0
    ? rateCategories.map((cat) => ({
        constructionId: cat.constructionId ?? '',
        constructionCode: cat.constructionCode,
        description: cat.description ?? '',
      }))
    : [];

  // Use a single color for all construction types
const singleColorClass = "text-blue-900";
const singleColorClassHeader = "text-blue-700";

  const categoryColorMap: Record<string, string> = {};

  normalizedCategories.forEach((cat) => {
    if (cat && cat.constructionId) {
      const key = (cat.constructionCode || cat.constructionId).trim().toUpperCase();
      categoryColorMap[key] = singleColorClass;
    }
  });

  // If used in drawer mode (onClose is provided), don't show the header and close button
  const isDrawerMode = !!onClose;

return (
  <div className={isDrawerMode ? "space-y-3" : "max-w-7xl mx-auto p-2 md:p-3"}>
    {!isDrawerMode && (
      <div className="mb-3 bg-[#f5f8fd] rounded-t-xl border-b-4 border-blue-500">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-start gap-3">
            <div className="h-8 w-8 rounded-lg bg-[#d1d9e4] text-white flex items-center justify-center">
              <Building2 size={24} />
            </div>
            <div>
              <h1 className="text-xl font-bold text-blue-700">
                {id ? t('messages.editRateDetails') : t('messages.generateNewRateDetails')}
              </h1>
              <p className="text-xs text-gray-600 mt-0.5">
                {id ? t('messages.updateRateDetails') : t('messages.fillRateDetails')}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleClose}
              className="h-8 w-8 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 flex items-center justify-center transition-colors text-base"
              aria-label="Close"
              title="Close"
            >
              <X size={18} />
            </button>
          </div>
        </div>
      </div>
    )}

    {/* Content */}
    <div className="space-y-3">
      {/* Rate Frequency + Quick Import Section */}
      <div className="flex flex-col md:flex-row items-center justify-between bg-[#f8faff] border border-blue-200 rounded-xl px-2 md:px-3 py-2 gap-2 md:gap-0 shadow-md">
        <div className="flex items-center gap-2 w-full md:w-auto">
          <div className="flex items-center gap-2">
            <Calendar size={18} className="text-blue-600" />
            <span className="text-sm font-medium text-blue-600">{t('sections.rateFrequency')}</span>
          </div>
          <div className="flex items-center gap-1 bg-white p-0.5 rounded-lg border border-gray-200 ml-2">
            <button
              type="button"
              onClick={() => setRateFrequency("Monthly")}

              className={`px-2 py-1 rounded-md text-xs font-semibold transition-all duration-200 flex items-center gap-1 ${
                rateFrequency === "Monthly"
                  ? "bg-blue-600 text-white shadow-sm"
                  : "bg-transparent text-gray-600 hover:bg-gray-100"
              }`}
            >
              <CalendarDays size={18} />
              {t('options.monthly')}
            </button>
            <button
              type="button"
              onClick={() => setRateFrequency("Yearly")}
              className={`px-2 py-1 rounded-md text-xs font-semibold transition-all duration-200 flex items-center gap-1 ${
                rateFrequency === "Yearly"
                  ? "bg-blue-600 text-white shadow-sm"
                  : "bg-transparent text-gray-600 hover:bg-gray-100"
              }`}
            >
              <Calendar size={18} />
              {t('options.yearly')}
            </button>
          </div>
        </div>
        {/* Quick Import Section - Only for Add Mode */}
        {mode === "add" && (
          <div className="flex items-center gap-1 w-full md:w-auto justify-end">
            <span className="text-sm font-medium text-blue-600">{t('sections.quickImport')}</span>
            <DownloadButton
              type="button"
              onClick={handleDownloadTemplate}
              disabled={
                existingRateFound ||
                !selectedZone || selectedZone === 'ALL' ||
                !selectedUseGroup || selectedUseGroup === 'ALL' ||
                !assessmentYear || assessmentYear === 'ALL'
              }
              title="Download Excel Template"
              label={t('buttons.downloadTemplate')}
            />
            <UploadButton
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={
                existingRateFound ||
                !selectedZone || selectedZone === 'ALL' ||
                !selectedUseGroup || selectedUseGroup === 'ALL' ||
                !assessmentYear || assessmentYear === 'ALL'
              }
              title="Upload Excel File"
              label={t('buttons.uploadExcel')}
            />
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv,.xlsx,.xls"
              onChange={handleUploadExcel}
              className="hidden"
            />
          </div>
        )}

      </div>

      {/* Rate Entry Box */}
      <div className="bg-[#f8faff] rounded-xl border border-blue-200 shadow-md p-1">
        {/* Heading removed as requested */}

        {/* Filters + + Button inline */}
        <div className="flex flex-col md:flex-row md:flex-wrap gap-2 md:gap-2 items-stretch md:items-end mb-2">
          {/* Rate Section */}
          <div className="w-full md:flex-1 md:min-w-37.5 md:max-w-50">
            <label htmlFor="zone-select" className="text-sm font-medium text-black mb-1 flex items-center gap-1">
              <MapPin size={18} className="text-black" />
              {t('filters.rateSection')} <span className="text-red-500">*</span>
            </label>
            <SearchSelect
              id="zone-select"
              name="zone"
              label=""
              options={zoneOptions}
              placeholder="Select Rate Section"
              value={selectedZone}
              onChange={(_name, value) => handleDropdownChange('zone', value)}
              className={`text-black ${errors.zone ? 'border-red-500' : ''}`}
            />

            {errors.zone && <div className="text-red-500 text-xs mt-1">{errors.zone}</div>}
          </div>



          {/* Use Group */}
          <div className="w-full md:flex-1 md:min-w-37.5 md:max-w-50">
            <label htmlFor="useGroup-select" className="text-sm font-medium text-black mb-1 flex items-center gap-1">
              <Users size={18} className="text-black" />
              {t('filters.typeOfUseGroup')} <span className="text-red-500">*</span>
            </label>
            <SearchSelect
              id="useGroup-select"
              name="useGroup"
              label=""
              options={useGroupOptions}
              placeholder="Select Use Group"
              value={selectedUseGroup}
              onChange={(_name, value) => handleDropdownChange('useGroup', value)}
              className={`text-black ${errors.useGroup ? 'border-red-500' : ''}`}
            />

            {errors.useGroup && <div className="text-red-500 text-xs mt-1">{errors.useGroup}</div>}
          </div>

          {/* Assessment Year - Conditional rendering based on edit/add mode */}
          {(id || editData || bulkEditData) ? (
            // Edit Mode: Show only the assessment year dropdown (bound to backend value)
            <div className="flex flex-col md:flex-row w-full md:flex-1 md:min-w-45 gap-1 items-stretch md:items-end">
              <div className="flex w-full items-end gap-2">
                <div className="w-full md:flex-1 md:min-w-45 md:max-w-50">
                  <label htmlFor="assessment-year-select" className="text-sm font-medium text-black mb-1 flex items-center gap-1">
                    <Calendar size={18} className="text-black" />
                    {t('filters.assessmentYearRange')}
                  </label>
                  <SearchSelect
                    id="assessment-year-select"
                    name="assessmentYear"
                    label=""
                    options={assessmentYears}
                    placeholder="-- Select --"
                    value={assessmentYear}
                    onChange={(_name, value) => handleDropdownChange('assessmentYear', value)}
                    className={`text-black ${errors.assessmentYear ? 'border-red-500' : ''}`}
                  />

                  {errors.assessmentYear && (
                    <div className="text-red-500 text-xs mt-1">
                      {errors.assessmentYear}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ) : (
            // Add Mode: Show assessment year range dropdown
            <div className="flex flex-col md:flex-row w-full md:flex-1 md:min-w-87.5 gap-2 items-stretch md:items-end">
              <div className="w-full md:min-w-45 flex items-end gap-2">
                <div className="w-full md:flex-1 md:min-w-37.5 md:max-w-50">
                  <label htmlFor="assessment-year-range-select" className="text-sm font-medium text-black mb-2 flex items-center gap-1.5">
                    <Calendar size={18} className="text-black" />
                    {t('filters.assessmentYearRange')} <span className="text-red-500">*</span>
                  </label>
                  <SearchSelect
                    id="assessment-year-range-select"
                    name="assessmentYearRange"
                    label=""
                    options={assessmentYearRanges?.map((range) => ({
                      label: range.label,
                      value: range.value,
                    })) ?? []}
                    placeholder="Select Year Range"
                    value={assessmentYear}
                    onChange={(_name, value) => handleDropdownChange('assessmentYear', value)}
                    className={`text-black ${errors.assessmentYear ? 'border-red-500' : ''}`}
                  />

                  {errors.assessmentYear && (
                    <div className="text-red-500 text-xs mt-1">
                      {errors.assessmentYear}
                    </div>
                  )}
                </div>
                {/* Multiplier Button */}
                <button
                  type="button"
                  title={existingRateFound ? t('messages.validationRatesAlreadyExist') : "Use Group Multipliers"}
                  disabled={!allFiltersSelected || existingRateFound || isCheckingRates}
                  className={`w-9 h-9 bg-blue-400 border-blue-400 text-white transition-all duration-200 rounded-full flex items-center justify-center text-base ${(!allFiltersSelected || existingRateFound || isCheckingRates) ? 'opacity-50 cursor-not-allowed' : 'hover:bg-blue-600 hover:scale-105 active:scale-95'}`}
                  onClick={() => {
                    // Toggle multipliers and update URL
                    const params = new URLSearchParams(window.location.search);
                    if (!showMultipliersInline) {
                      params.set('showMultipliers', 'true');
                    } else {
                      params.delete('showMultipliers');
                    }
                    const currentPath = window.location.pathname;
                    const newUrl = `${currentPath}?${params.toString()}`;
                    window.history.pushState({}, '', newUrl);
                    setShowMultipliersInline(!showMultipliersInline);
                  }}
                >
                  <TrendingUp size={18} />
                </button>
                <button
                  type="button"
                  title={existingRateFound ? t('messages.validationRatesAlreadyExist') : "Generate Rate Matrix"}
                  disabled={!allFiltersSelected || existingRateFound || isCheckingRates}
                  className={`w-9 h-9 rounded-full inline-flex items-center justify-center border-2 border-blue-500 bg-blue-500 text-white text-base transition-all duration-200 ${(!allFiltersSelected || existingRateFound || isCheckingRates) ? 'opacity-50 cursor-not-allowed' : 'hover:bg-blue-600 hover:border-blue-600 hover:scale-105 active:scale-95'}`}
                  onClick={async () => {
                    // Validate all required fields
                    if (!selectedZone) {
                      toast.error(t('messages.selectRateSection'));
                      return;
                    }
                    if (!selectedUseGroup) {
                      toast.error(t('messages.selectUseGroup'));
                      return;
                    }
                    if (!assessmentYear) {
                      toast.error(t('messages.validationSelectAssessmentYear'));
                      return;
                    }
                   

                    const isEditMode = !!id || !!editData || !!bulkEditData;

                    // In add mode, check if rates already exist using server-provided prop (no client-side API call)
                    if (!isEditMode && existingRateFound) {
                      // Rates already exist - show error
                      toast.error(t('messages.validationRatesAlreadyExist'));
                      return;
                    }

                    // If validation passed, proceed with showing matrix
                    const params = new URLSearchParams({
                      zone: selectedZone,
                      useGroup: selectedUseGroup,
                    });
                    if (assessmentYear) {
                      params.append("assessmentYear", assessmentYear);

                    }
                    // Keep URL at /add with query params - don't navigate to non-existent /matrix route
                    const newUrl = `/${locale}/property-tax/rate-master/rvratemaster/add?${params.toString()}`;
                    window.history.pushState({}, '', newUrl);
                    
                    // Always reset matrix to zeros and clear sessionStorage when generating new rates (add mode)
                    if (!isEditMode && assessmentYear) {
                      // Use paginated zones instead of all zones
                      const activeZones = paginatedZoneDescriptions.length > 0 ? paginatedZoneDescriptions : zoneDescriptions;
                      
                      const emptyMatrix = activeZones.map((z, idx) => ({
                        id: idx + 1,
                        zone: z.zoneNo,
                        ...rateCategories.reduce((acc, cat) => ({ ...acc, [cat.constructionId]: 0 }), {} as Record<string, number>),
                      }));
                      setMatrixData(emptyMatrix);
                      if (typeof window !== 'undefined') {
                        sessionStorage.removeItem(matrixStorageKey);
                      }
                    }
                    
                    // Show the matrix
                    setShowMatrix(true);
                  }}
                >
                  <Plus className="h-5 w-5" />
                </button>
                
                {/* Copy Rates Toggle Button - only in add mode */}
                {mode === "add" && (
                  <button
                    type="button"
                    title={existingRateFound ? t('messages.validationRatesAlreadyExist') : "Copy Rates"}
                    disabled={!allFiltersSelected || existingRateFound || isCheckingRates}
                    className={`w-9 h-9 rounded-full inline-flex items-center justify-center border-2 border-blue-500 bg-white text-blue-500 text-base transition-all duration-200 ml-2 ${(!allFiltersSelected || existingRateFound || isCheckingRates) ? 'opacity-50 cursor-not-allowed' : 'hover:bg-blue-50 hover:scale-105 active:scale-95'}`}
                    onClick={() => {
                      const params = new URLSearchParams(window.location.search);
                      params.set('zone', selectedZone);
                      params.set('useGroup', selectedUseGroup);
                      params.set('assessmentYear', assessmentYear);
                      params.set('showCopyRates', 'true');
                      
                      const currentPath = window.location.pathname;
                      const newUrl = `${currentPath}?${params.toString()}`;
                      window.history.pushState({}, '', newUrl);
                      setCopySectionsExpanded(true);
                    }}
                  >
                    <ClipboardCopy size={18} />
                  </button>
                )}
              </div>

            </div>
          )}

              {/* Multiplier Button and + Button for Add Mode only - REMOVED DUPLICATE ICONS */}
            </div>

            {/* Copy Rates Section with Tabs and Multipliers - only in add mode */}
            {mode === "add" && (copySectionsExpanded || showMultipliersInline) && (
              <div className="mt-3">
                <div className="flex flex-row gap-3 items-stretch">
                {/* Left: Copy Rates Section OR Multipliers Section */}
                {copySectionsExpanded && (
                <div className="flex-1 max-w-2xl">
                <div className="rounded-xl border border-blue-200 bg-white shadow-md relative h-50px flex flex-col">
                  {/* Close Button */}
                  <button
                    type="button"
                    onClick={() => {
                      const params = new URLSearchParams(window.location.search);
                      params.delete('showCopyRates');
                      
                      const currentPath = window.location.pathname;
                      const newUrl = params.toString() ? `${currentPath}?${params.toString()}` : currentPath;
                      window.history.pushState({}, '', newUrl);
                      setCopySectionsExpanded(false);
                      // Keep multipliers open if it was open
                    }}
                    className="absolute top-2 right-2 z-10 text-gray-400 hover:text-gray-600 transition-colors bg-white rounded-full p-1 shadow-sm"
                  >
                    <X size={18} />
                  </button>

                  {/* Tabs and Content - Horizontal Layout */}
                  <div className="flex h-full">
                    {/* Tabs - Left Side */}
                    <div className="w-32 border-r border-gray-200 bg-gray-50 p-1.5 space-y-1">
                      <button
                        type="button"
                        onClick={() => setCopyRatesActiveTab("useGroup")}
                        className={`w-full flex items-center gap-2 px-2 py-2 rounded-md text-left transition-all ${
                          copyRatesActiveTab === "useGroup"
                            ? "bg-blue-600 text-white shadow-md"
                            : "bg-white text-gray-700 hover:bg-gray-100 border border-gray-200"
                        }`}
                      >
                        <Users size={18} />
                        <span className="text-xs font-medium">{t('sections.useGroupTab')}</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setCopyRatesActiveTab("rateSection")}
                        className={`w-full flex items-center gap-2 px-2 py-2 rounded-md text-left transition-all ${
                          copyRatesActiveTab === "rateSection"
                            ? "bg-blue-600 text-white shadow-md"
                            : "bg-white text-gray-700 hover:bg-gray-100 border border-gray-200"
                        }`}
                      >
                        <MapPin size={18} />
                        <span className="text-xs font-medium">{t('sections.rateSectionTab')}</span>
                      </button>
                    </div>

                    {/* Content - Right Side */}
                    <div className="flex-1 p-3">
                      {copyRatesActiveTab === "useGroup" && (
                        <div className="space-y-3">
                          <div className="flex items-center gap-2 mb-2">
                            <div className="h-8 w-8 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center">
                              <Users size={16} />
                            </div>
                            <div>
                              <h4 className="text-sm font-semibold text-gray-800">{t('sections.copyRatesUseGroupTitle')}</h4>
                              {/* <p className="text-xs text-gray-500">{t('sections.copyRatesUseGroupSubtitle')}</p> */}
                            </div>
                          </div>

                          <div className="flex items-end gap-2">
                            <div className="flex-1">
                              <label htmlFor="source-use-group-select" className="text-xs font-medium text-gray-700 mb-1 block">{t('sections.selectSourceUseGroup')}</label>
                              <SearchSelect
                                id="source-use-group-select"
                                name="sourceUseGroup"
                                label=""
                                options={useGroupOptions.filter(
                                  (opt) => !selectedUseGroup || opt.value !== selectedUseGroup
                                )}
                                placeholder={t('placeholders.selectUseGroup')}
                                value={sourceUseGroup}
                                onChange={(_name, value) => setSourceUseGroup(value)}
                                className="text-black"
                              />

                            </div>

                            <button
                              type="button"
                              onClick={() => {
                                if (!sourceUseGroup) {
                                  toast.error(t('messages.selectUseGroupCopy'));
                                  return;
                                }
                                if (!selectedZone) {
                                  toast.error(t('messages.selectRateSection'));
                                  return;
                                }
                                if (!selectedUseGroup) {
                                  toast.error(t('messages.selectUseGroup'));
                                  return;
                                }
                                handleCopyRates();
                              }}
                              disabled={!sourceUseGroup}
                              className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white text-xs font-semibold rounded-lg transition-all flex items-center justify-center gap-1.5 hover:scale-105 active:scale-95 disabled:hover:scale-100 whitespace-nowrap"
                            >
                              <CheckCircle size={14} />
                              {t('buttons.copyRatesNow')}
                            </button>
                          </div>
                        </div>
                      )}

                      {copyRatesActiveTab === "rateSection" && (
                        <div className="space-y-3">
                          <div className="flex items-center gap-2 mb-2">
                            <div className="h-8 w-8 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center">
                              <MapPin size={16} />
                            </div>
                            <div>
                              <h4 className="text-sm font-semibold text-gray-800">{t('sections.copyRatesRateSectionTitle')}</h4>
                              <p className="text-xs text-gray-500">{t('sections.copyRatesRateSectionSubtitle')}</p>
                            </div>
                          </div>

                          <div className="flex items-end gap-2">
                            <div className="flex-1">
                              <label htmlFor="source-rate-section-select" className="text-xs font-medium text-gray-700 mb-1 block">{t('sections.selectSourceRateSection')}</label>
                              <SearchSelect
                                id="source-rate-section-select"
                                name="sourceRateSection"
                                label=""
                                options={sourceRateSectionOptions}
                                placeholder={t('placeholders.selectRateSection')}
                                value={sourceRateSection}
                                onChange={(_name, value) => setSourceRateSection(value)}
                                className="text-black"
                              />

                            </div>

                            <button
                              type="button"
                              onClick={handleCopyRatesFromRateSection}
                              disabled={!sourceRateSection}
                              className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white text-xs font-semibold rounded-lg transition-all flex items-center justify-center gap-1.5 hover:scale-105 active:scale-95 disabled:hover:scale-100 whitespace-nowrap"
                            >
                              <CheckCircle size={14} />
                              {t('buttons.copyRatesNow')}
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                </div>
                )}

                {/* Multipliers Section - Shows on left when no copy rates, or on right when copy rates open */}
                {showMultipliersInline && (
                  copySectionsExpanded ? (
                  /* Multipliers on right when copy rates is open */
                  <div className="flex-1 self-stretch">
                    <div className="rounded-xl border border-blue-200 bg-white shadow-md h-full max-h-full flex flex-col overflow-hidden">
                      {/* Header */}
                      <div className="p-2 border-b border-gray-200 shrink-0">
                        <div className="flex items-center gap-2">
                          <div className="h-8 w-8 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center">
                            <TrendingUp size={16} />
                          </div>
                          <div className="flex-1">
                            <h4 className="text-sm font-semibold text-gray-800">{t('sections.multipliersTitle')}</h4>
                            {/* <p className="text-xs text-gray-500">{t('sections.multipliersSubtitle')}</p> */}
                          </div>
                          <button
                            type="button"
                            onClick={() => {
                              const params = new URLSearchParams(window.location.search);
                              params.delete('showMultipliers');
                              const currentPath = window.location.pathname;
                              const newUrl = params.toString() ? `${currentPath}?${params.toString()}` : currentPath;
                              window.history.pushState({}, '', newUrl);
                              setShowMultipliersInline(false);
                            }}
                            className="text-gray-400 hover:text-gray-600 transition-colors"
                          >
                            <X size={16} />
                          </button>
                        </div>
                      </div>

                      {/* Multipliers List - Scrollable */}
                      <div className="flex-1 overflow-x-auto overflow-y-hidden min-h-0">
                        <div className="p-2 flex flex-row gap-4 items-end min-w-full">
                        {useGroupOptions.map((option) => (
                          <div key={option.value} className="flex flex-col items-center gap-1 flex-1 min-w-20">
                            <label htmlFor={`multiplier-${option.value}`} className="text-xs font-medium text-gray-700 whitespace-nowrap text-center">{option.label}</label>
                            <MatrixCellInput
                              value={
                                Number(tempMultipliers[option.value] ?? 1.0)
                              }
                              rowId={"multiplier"}
                              columnId={option.value}
                              metaLabel={option.label}
                              //className="w-full h-7 text-xs font-medium px-2 text-center border border-blue-200 text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                              className= "w-full px-2 text-center font-medium h-7 text-xs rounded-md border border-blue-200 text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                              onCellChange={(
                                _row: string,
                                col: string,
                                val: string | number
                              ) => {
                                // setMultiplierInputs removed (cleanup)
                                // Update tempMultipliers immediately so the button state updates in real-time
                                const numValue = Number(val);
                                if (!isNaN(numValue) && numValue >= 0) {
                                  setTempMultipliers(prev => ({ ...prev, [col]: numValue }));
                                }
                              }}
                              // Focus/blur logic handled by MatrixCellInput's internal handlers
                            />
                          </div>
                        ))}
                        
                        {/* Apply Button - Inline */}
                        <button
                          disabled={Object.values(tempMultipliers).every(value => value === 1.0)}
                          onClick={() => {
                            setMultipliers({ ...tempMultipliers });
                            
                            const changedMultipliers = Object.entries(tempMultipliers)
                              .filter(([_, value]) => value > 0 && value !== 1.0)
                              .map(([key, _]) => {
                                const option = useGroupOptions.find(opt => opt.value === key);
                                return option?.label || key;
                              });

                            if (changedMultipliers.length > 0) {
                              toast.success(t('messages.multiplierAdded', { groups: changedMultipliers.join(', ') }));
                              const params = new URLSearchParams(window.location.search);
                              params.delete('showMultipliers');
                              const currentPath = window.location.pathname;
                              const newUrl = params.toString() ? `${currentPath}?${params.toString()}` : currentPath;
                              window.history.pushState({}, '', newUrl);
                              setShowMultipliersInline(false);
                            } else {
                              toast.info(t('messages.noMultipliersChanged'));
                            }
                          }}
                          className="px-5 h-7 rounded-lg text-xs font-semibold transition-all flex items-center justify-center gap-1.5 whitespace-nowrap shrink-0 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 bg-blue-600 hover:bg-blue-700 text-white hover:scale-105 active:scale-95"
                        >
                          <CheckCircle size={14} />
                          {t('buttons.applyMultipliers')}
                        </button>
                        </div>
                      </div>
                    </div>
                  </div>
                  ) : (
                  /* Multipliers on left when no copy rates */
                  <div className="flex-1 max-w-2xl">
                    <div className="rounded-xl border border-blue-200 bg-white shadow-md h-full max-h-full flex flex-col overflow-hidden">
                      {/* Header */}
                      <div className="p-2 border-b border-gray-200 shrink-0">
                        <div className="flex items-center gap-2">
                          <div className="h-8 w-8 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center">
                            <TrendingUp size={16} />
                          </div>
                          <div className="flex-1">
                            <h4 className="text-sm font-semibold text-gray-800">{t('sections.multipliersTitle')}</h4>
                            {/* <p className="text-xs text-gray-500">{t('sections.multipliersSubtitle')}</p> */}
                          </div>
                          <button
                            type="button"
                            onClick={() => {
                              const params = new URLSearchParams(window.location.search);
                              params.delete('showMultipliers');
                              const currentPath = window.location.pathname;
                              const newUrl = params.toString() ? `${currentPath}?${params.toString()}` : currentPath;
                              window.history.pushState({}, '', newUrl);
                              setShowMultipliersInline(false);
                            }}
                            className="text-gray-400 hover:text-gray-600 transition-colors"
                          >
                            <X size={16} />
                          </button>
                        </div>
                      </div>
                     
                       {/* Multipliers List - Scrollable */}
                      <div className="flex-1 overflow-x-auto overflow-y-hidden min-h-0">
                        <div className="p-2 flex flex-row gap-4 items-end min-w-full">
                        {useGroupOptions.map((option) => (
                          <div key={option.value} className="flex flex-col items-center gap-1 flex-1 min-w-20">
                            <label htmlFor={`multiplier-${option.value}`} className="text-xs font-medium text-gray-700 whitespace-nowrap text-center">{option.label}</label>
                            <MatrixCellInput
                              value={
                                Number(tempMultipliers[option.value] ?? 1.0)
                              }
                              rowId={"multiplier"}
                              columnId={option.value}
                              metaLabel={option.label}
                              //className="w-full h-7 text-xs font-medium px-2 text-center border border-blue-200 text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                              className= "w-full px-2 text-center font-medium h-7 text-xs rounded-xs border border-blue-200 text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                              onCellChange={(
                                _row: string,
                                col: string,
                                val: string | number
                              ) => {
                                // setMultiplierInputs removed (cleanup)
                                // Update tempMultipliers immediately so the button state updates in real-time
                                const numValue = Number(val);
                                if (!isNaN(numValue) && numValue >= 0) {
                                  setTempMultipliers(prev => ({ ...prev, [col]: numValue }));
                                }
                              }}
                              // Focus/blur logic handled by MatrixCellInput's internal handlers
                            />
                          </div>
                        ))}
                        
                        {/* Apply Button - Inline */}
                        <button
                          disabled={Object.values(tempMultipliers).every(value => value === 1.0)}
                          onClick={() => {
                            setMultipliers({ ...tempMultipliers });
                            
                            const changedMultipliers = Object.entries(tempMultipliers)
                              .filter(([_, value]) => value > 0 && value !== 1.0)
                              .map(([key, _]) => {
                                const option = useGroupOptions.find(opt => opt.value === key);
                                return option?.label || key;
                              });

                            if (changedMultipliers.length > 0) {
                              toast.success(t('messages.multiplierAdded', { groups: changedMultipliers.join(', ') }));
                              const params = new URLSearchParams(window.location.search);
                              params.delete('showMultipliers');
                              const currentPath = window.location.pathname;
                              const newUrl = params.toString() ? `${currentPath}?${params.toString()}` : currentPath;
                              window.history.pushState({}, '', newUrl);
                              setShowMultipliersInline(false);
                            } else {
                              toast.info(t('messages.noMultipliersChanged'));
                            }
                          }}
                          className="px-5 h-7 rounded-lg text-xs font-semibold transition-all flex items-center justify-center gap-1.5 whitespace-nowrap shrink-0 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 bg-blue-600 hover:bg-blue-700 text-white hover:scale-105 active:scale-95"
                        >
                          <CheckCircle size={14} />
                          {t('buttons.applyMultipliers')}
                        </button>
                        </div>
                      </div>
                    </div>
                  </div>
                  )
                )}
                </div>
              </div>
            )}

          {/* Rate Matrix */}
          {showMatrix && !hideMatrixSection && (

            <div className="mt-2 bg-white rounded-xl border border-blue-200 shadow-lg overflow-hidden">
              {/* Header Section with badges and Add Rates button */}
              <div className="bg-white border-b border-[#e0e7ef] px-6 py-3 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="h-8 w-8 rounded bg-[#e3eafc] text-blue-600 flex items-center justify-center">
                    <Grid2X2 className="w-4 h-4" />
                  </div>
                  <span className="text-base font-semibold text-gray-700">{t('sections.rateEntryMatrix')}</span>
                  <span className="ml-2 px-2 py-0.5 bg-[#e3eafc] text-blue-700 text-xs font-semibold rounded">{t('messages.active')}</span>
                  {/* Status Badges inline */}
                  {selectedZone && (
                    <StatusBadge
                      variant="info"
                      icon={<MapPin className="w-4 h-4" />}
                      label={zoneOptions.find(z => z.value === selectedZone)?.label || selectedZone}
                    />
                  )}
                  {assessmentYear && (
                    <StatusBadge
                      variant="info"
                      icon={<Calendar className="w-4 h-4" />}
                      label={
                        assessmentYearRanges?.find(ay => String(ay.value) === String(assessmentYear))?.label ||
                        assessmentYears?.find(ay => String(ay.value) === String(assessmentYear))?.label ||
                        String(assessmentYear)
                      }
                    />
                  )}
                  {selectedUseGroup && (
                    <StatusBadge
                      variant="info"
                      icon={<Users className="w-4 h-4" />}
                      label={useGroupOptions.find(u => u.value === selectedUseGroup)?.label || selectedUseGroup}
                    />
                  )}
                  <StatusBadge
                    variant="info"
                    icon={<CheckCircle className="w-4 h-4" />}
                    label={t('messages.ratesConfigured', { count: filledRatesCount })}
                  />
                </div>
                {/* Add/Update Rates button at right side */}
                <div>
                  {mode !== "delete" && (
                    <SaveButton
                      label={id ? t('buttons.updateRates') : t('buttons.addRates')}
                      onClick={id ? handleUpdateRates : handleAddRates}
                      size="md"
                      className="px-4 py-2"
                    />
                  )}
                  {mode === "delete" && (
                    <DeleteLabelButton
                      label={t('buttons.deleteRates')}
                      onClick={handleDeleteRates}
                      size="md"
                      className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white"
                    />
                  )}
                </div>
              </div>

              {/* Table Section */}
              {/* Normalize rateCategories to always be objects with constructionId and description */}
              <div className="bg-white p-0">
                <div className="overflow-x-auto">        
                 <MatrixGrid
  columns={rateCategories
    .filter(cat =>
      ![
        "zoneno",
        "zonedescription",
        "zone_no",
        "zone description",
        "zone_description"
      ].includes(cat.constructionId?.toLowerCase?.())
    )
    .map((cat) => {
      const code = (cat.constructionCode || cat.constructionId).trim().toUpperCase();
      return {
        id: cat.constructionCode || cat.constructionId,
        label: (
          <span className={`inline-block font-bold rounded-lg px-2 py-0.5 ${singleColorClassHeader}`}>
            {code} <span className="text-[10px] font-normal">{tCommon('rateUnit')}</span>
          </span>
        ),
        tooltip: cat.description || cat.constructionId,
        headerClassName: `${singleColorClassHeader} font-bold text-xs text-center rounded-lg`,
      };
    })
  }
  metaColumns={[
    {
      id: "zoneNo",
      label: (
        <span className="flex items-center gap-0.5 text-[13px] font-bold text-blue-700">
          <MapPin size={12} />
          {t('columns.taxZoneNo')}
        </span>
      ),
      width: "70px"
    },
  ]}
  rows={(() => {
    const rows = matrixData.map((row) => {
      const cells: Record<string, string | number> = Object.fromEntries(
        rateCategories
          .filter(cat =>
            ![
              "zoneno",
              "zonedescription",
              "zone_no",
              "zone description",
              "zone_description"
            ].includes(cat.constructionId?.toLowerCase?.())
          )
          .map(cat => {
            const key = cat.constructionCode || cat.constructionId;
            const value = row[key];
            return [
              key,
              typeof value === 'number' ? value : String(value ?? '')
            ];
          })
      );
      return {
        id: String(row.id),
        cells,
        meta: {
          zoneNo: row.zoneNo ?? (row as unknown as { zone?: string }).zone ?? '',
          zoneNo_tooltip: zoneRemarksMap.get((row.zoneNo ?? (row as unknown as { zone?: string }).zone ?? '') as string) || '', // Tooltip for zone
        },
      };
    });
    return rows;
  })()}
  colorMap={categoryColorMap}
  mode={(() => {
    const gridMode = mode === 'edit' || mode === 'add' ? 'edit' : 'view';
    return gridMode;
  })()}
  editableColumns={(() => {
    const cols = rateCategories
    .filter(cat =>
      ![
        "zoneno",
        "zonedescription",
        "zone_no",
        "zone description",
        "zone_description"
      ].includes(cat.constructionId?.toLowerCase?.())
    )
    .map(cat => cat.constructionCode || cat.constructionId);
    return cols;
  })()}
  onCellChange={(rowId, colId, value) => {
    // Sanitize and validate value
    const sanitized = sanitizePositiveDecimal(String(value));
    const numValue = sanitized === "" ? 0 : Number(sanitized);
    // Find the row to get zoneNo
    const targetRow = matrixData.find(row => String(row.id) === rowId);
    // Support both 'zoneNo' and legacy 'zone' property
    const zoneNo = (targetRow?.zoneNo || (typeof targetRow === 'object' && targetRow && 'zone' in targetRow ? (targetRow as { zone?: string }).zone : undefined)) as string;
    // Update matrixData for current page
    setMatrixData(prev => {
      const updated = prev.map(row => {
        if (String(row.id) === rowId) {
          return { ...row, [colId]: numValue };
        }
        return row;
      });
      return updated;
    });
    // Update allZoneEdits to persist across page changes
    if (zoneNo) {
      setAllZoneEdits(prevEdits => {
        const updated = {
          ...prevEdits,
          [zoneNo]: {
            ...(prevEdits[zoneNo] || {}),
            [colId]: numValue
          }
        };
        return updated;
      });
    } else {
      console.warn('⚠️ No zoneNo found for row:', rowId, targetRow);
    }
  }}
  onCellKeyDown={(e) => {
    // Prevent invalid keys for positive decimal input using regex from validation.ts
    if (POSITIVE_DECIMAL_INVALID_KEYS.test(e.key)) {
      e.preventDefault();
    }
  }}
  getCellClassName={(value) => {
    // Highlight cells: blue for values > 0, light gray for 0
    return value > 0 
      ? "bg-blue-50 text-blue-800 border-blue-300" 
      : "bg-gray-50 text-gray-500 border-gray-200";
  }}
  translations={{
    action: tCommon('table.columns.actions'),
    currencySymbol: "₹",
    deleteRow: tCommon('table.actions.delete'),
  }}
 />
                </div>               
                {/* Pagination outside scrollable area */}
                <div className="mt-4">
                  <MatrixGridPagination
                    pageNumber={matrixPageNumber}
                    pageSize={matrixPageSize}
                    totalCount={matrixTotalCount}
                    totalPages={matrixTotalPages}
                    onPageChange={(page) => {
                      handleMatrixPaginationChange(page, matrixPageSize);
                    }}
                    onPageSizeChange={(size) => {
                      handleMatrixPaginationChange(1, size);
                    }}
                    pageSizeOptions={[5, 10, 20, 50]}
                  />
                </div>
              </div>
            </div>
          )}

        {/* Matrix Completion Progress Section - Separate */}
          {showMatrix && !hideMatrixSection && (
            <div className="mt-4 bg-white rounded-xl border border-blue-200 shadow-sm overflow-hidden">
              <div className="px-6 py-4">
                <div className="flex items-center gap-4">
                  {/* Left - Progress Label with Icon */}
                  <div className="flex items-center gap-2 min-w-fit">
            <TrendingUp size={14} className="text-[#4169E1]" />
                    <span className="text-sm font-medium text-gray-700 whitespace-nowrap">{t('sections.matrixCompletion')}</span>
                  </div>

                  {/* Center - Progress Bar */}
                  <div className="flex-1 h-2.5 bg-gray-200 rounded-full overflow-hidden">
                    <div 
                      className="h-full transition-all duration-500 ease-out rounded-full"
                      style={{ width: `${completionPercentage}%`, backgroundColor: '#4169E1' }}
                    />
                  </div>

                  {/* Right - Percentage Badge */}
                  <div className="px-3 py-1 text-white text-sm font-semibold rounded-full min-w-15 text-center" style={{ backgroundColor: '#4169E1' }}>
                    {completionPercentage}%
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
export default RateMasterForm;

