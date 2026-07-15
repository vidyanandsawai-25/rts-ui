"use client";

import { useRouter } from "next/navigation";
import { useTranslations, useLocale } from "next-intl";
import { RateMasterFormProps } from "@/types/RVRateMaster";
import { useConfirm } from "@/components/common/ConfirmProvider";
import { useRateMasterFilters } from "@/hooks/RVRateMaster/useRateMasterFilters";
import { useRateMasterOperations } from "@/hooks/RVRateMaster/useRateMasterOperations";
import { useRateMasterFormState } from "@/hooks/RVRateMaster/useRateMasterFormState";
import { useRateMasterImportExport } from "@/hooks/RVRateMaster/useRateMasterImportExport";
import { useExistingRateCheck } from "@/hooks/RVRateMaster/useExistingRateCheck";
import { useUrlParamSync } from "@/hooks/RVRateMaster/useUrlParamSync";
import { useRateFormHandlers } from "@/hooks/RVRateMaster/useRateFormHandlers";
import { useLazyDropdownData } from "@/hooks/RVRateMaster/useLazyDropdownData";
import {
  RateMasterFormHeader, RateFiltersSection,
  RateFrequencySection,
  RateCopyMultipliersWrapper,
  RateMatrixSection,
  RateCompletionProgress,
} from "./components";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { ConfigureRatesDrawer } from "./components/ConfigureRatesDrawer";
import { getTypeOfUseDetailsAction, getRateMasterByFilters } from "@/app/[locale]/property-tax/rate-master/rvratemaster/action";
import type { RateCategory, ITypeOfUseDetails } from "@/types/RVRateMaster";

const RateMasterForm: React.FC<RateMasterFormProps> = ({ id, zoneOptions, useGroupOptions, assessmentYears, assessmentYearRanges, zoneDescriptions, allZones, rateCategories, editData, bulkEditData, backendRates, filterValues, showCopyRateSection, showMultipliersSection, hideMatrixSection, onClose, mode: propMode, paginatedZonesData, initialExistingRatesCheck, rateFrequencyPolicy, rateUnitPolicy, isOpenPlot = false }) => {
  const mode: "edit" | "delete" | "add" = propMode || "edit";
  const t = useTranslations("ptis_RVRateMaster");
  const tCommon = useTranslations("common");
  const locale = useLocale();
  const router = useRouter();
  const { confirm } = useConfirm();

  // Open Plot Configure Rates States
  const [hasConfiguredRates, setHasConfiguredRates] = useState(false);
  const [isConfigureRatesOpen, setIsConfigureRatesOpen] = useState(false);
  const [localRateCategories, setLocalRateCategories] = useState<RateCategory[]>(rateCategories);

  const fetchLatestRateCategories = async () => {
    try {
      const detailsResult = await getTypeOfUseDetailsAction(1, -1);
      const details = detailsResult.items || [];
      const opCategory = details.find(t => t.typeOfUseCode === 'OP');

      const categoriesList: RateCategory[] = [];
      const seenGroupIds = new Set<number>();

      const getAssociatedTypes = (groupId?: number) => {
        if (!isOpenPlot || !groupId) return undefined;
        return details
          .filter(t => t.typeOfUseGroupId === groupId)
          .map(t => ({
            code: t.typeOfUseCode || "",
            description: t.description || ""
          }));
      };

      if (opCategory) {
        categoriesList.push({
          constructionId: String(opCategory.id),
          constructionCode: opCategory.typeOfUseCode || String(opCategory.id),
          description: opCategory.description || "",
          typeOfUseGroupId: opCategory.typeOfUseGroupId,
          associatedUseTypes: getAssociatedTypes(opCategory.typeOfUseGroupId)
        });
        if (opCategory.typeOfUseGroupId) {
          seenGroupIds.add(opCategory.typeOfUseGroupId);
        }
      }

      // Filter other categories with distinct group IDs (excluding duplicates of OP's group ID)
      details.forEach(tu => {
        if (tu.typeOfUseCode === 'OP') return;

        const groupId = tu.typeOfUseGroupId;
        if (groupId && groupId > 0) {
          if (!seenGroupIds.has(groupId)) {
            seenGroupIds.add(groupId);
            categoriesList.push({
              constructionId: String(tu.id),
              constructionCode: tu.typeOfUseCode || String(tu.id),
              description: tu.description || "",
              typeOfUseGroupId: groupId,
              associatedUseTypes: getAssociatedTypes(groupId)
            });
          }
        }
      });

      setLocalRateCategories(categoriesList);
    } catch (err) {
      console.error("Failed to load latest rate categories", err);
    }
  };

  // Sync localRateCategories state with rateCategories prop when it changes
  useEffect(() => {
    setLocalRateCategories(rateCategories);
  }, [rateCategories]);

  // Sync configureRates state from URL on initial load
  useEffect(() => {
    if (isOpenPlot) {
      const searchParams = new URLSearchParams(window.location.search);
      if (searchParams.get("configureRates") === "true") {
        setIsConfigureRatesOpen(true);
      }
    }
  }, [isOpenPlot]);

  const handleConfigureRatesClick = async () => {
    if (!selectedZone || selectedZone === "ALL" || !assessmentYear || assessmentYear === "ALL") {
      toast.error("Please select a Rate Section and Assessment Year Range first.");
      return;
    }
    try {
      const detailsResult = await getTypeOfUseDetailsAction(1, -1);
      const details = detailsResult.items || [];
      const opExcluded = details.filter(t => t.typeOfUseCode !== 'OP');
      const descriptionList = opExcluded.map(t => t.description || t.typeOfUseCode).join(', ');

      confirm({
        title: "Configure Use Type",
        description: `Do you want to configure different use types for - ${descriptionList}?`,
        confirmText: "Yes",
        cancelText: "No",
        onConfirm: () => {
          setIsConfigureRatesOpen(true);
          const params = new URLSearchParams(window.location.search);
          params.set("configureRates", "true");
          window.history.replaceState({}, "", `${window.location.pathname}?${params.toString()}`);
        },
        onCancel: () => {
          setHasConfiguredRates(true);
          const opCategory = details.find(t => t.typeOfUseCode === 'OP');
          if (opCategory) {
            const associated = details
              .filter(t => t.typeOfUseGroupId === opCategory.typeOfUseGroupId)
              .map(t => ({
                code: t.typeOfUseCode || "",
                description: t.description || ""
              }));
            const opCategories = [{
              constructionId: String(opCategory.id),
              constructionCode: opCategory.typeOfUseCode || String(opCategory.id),
              description: opCategory.description || "",
              typeOfUseGroupId: opCategory.typeOfUseGroupId,
              associatedUseTypes: isOpenPlot ? associated : undefined
            }];
            setLocalRateCategories(opCategories);
          }
        }
      });
    } catch (err) {
      toast.error("Failed to fetch types of use for configuration check");
    }
  };

  const handleConfigureDrawerClose = async (savedAny: boolean) => {
    setIsConfigureRatesOpen(false);
    const params = new URLSearchParams(window.location.search);
    params.delete("configureRates");
    params.delete("checkedUseTypes");
    window.history.replaceState({}, "", `${window.location.pathname}?${params.toString()}`);
    if (savedAny) {
      setHasConfiguredRates(true);
      await fetchLatestRateCategories();
    }
  };

  const handleConfigureSelected = async (selectedTypes: ITypeOfUseDetails[]) => {
    setIsConfigureRatesOpen(false);

    // Clear URL parameters
    const params = new URLSearchParams(window.location.search);
    params.delete("configureRates");
    params.delete("checkedUseTypes");
    window.history.replaceState({}, "", `${window.location.pathname}?${params.toString()}`);

    try {
      const detailsResult = await getTypeOfUseDetailsAction(1, -1);
      const details = detailsResult.items || [];
      const opCategory = details.find(t => t.typeOfUseCode === 'OP');

      const categoriesList: RateCategory[] = [];
      const seenGroupIds = new Set<number>();

      if (isOpenPlot) {
        // 1. Fetch existing rates to check which ones are already configured
        let existingGroupIds = new Set<number>();
        if (selectedZone && assessmentYear) {
          try {
            const existingRates = await getRateMasterByFilters(selectedZone, "ALL", assessmentYear);
            if (existingRates && Array.isArray(existingRates)) {
              existingRates.forEach(rate => {
                if (rate.typeOfUseGroupId) {
                  existingGroupIds.add(rate.typeOfUseGroupId);
                }
              });
            }
          } catch (err) {
            console.error("Failed to check existing rates:", err);
          }
        }

        const toAddCategories: RateCategory[] = [];
        const alreadyConfiguredCodes: string[] = [];

        const getAssociatedTypes = (groupId?: number) => {
          if (!groupId) return undefined;
          return details
            .filter(t => t.typeOfUseGroupId === groupId)
            .map(t => ({
              code: t.typeOfUseCode || "",
              description: t.description || ""
            }));
        };

        const processType = (tu: ITypeOfUseDetails) => {
          const groupId = tu.typeOfUseGroupId;
          const code = tu.typeOfUseCode || String(tu.id);
          const exists = groupId && existingGroupIds.has(groupId);

          if (exists) {
            if (!alreadyConfiguredCodes.includes(code)) {
              alreadyConfiguredCodes.push(code);
            }
          } else {
            if (groupId && groupId > 0) {
              if (!seenGroupIds.has(groupId)) {
                seenGroupIds.add(groupId);
                toAddCategories.push({
                  constructionId: String(tu.id),
                  constructionCode: code,
                  description: tu.description || "",
                  typeOfUseGroupId: groupId,
                  associatedUseTypes: getAssociatedTypes(groupId)
                });
              }
            } else {
              toAddCategories.push({
                constructionId: String(tu.id),
                constructionCode: code,
                description: tu.description || "",
                typeOfUseGroupId: groupId,
                associatedUseTypes: getAssociatedTypes(groupId)
              });
            }
          }
        };

        // Check OP first
        if (opCategory) {
          processType(opCategory);
        }

        // Check other selected types
        selectedTypes.forEach(tu => {
          if (tu.typeOfUseCode === 'OP') return;
          processType(tu);
        });

        if (toAddCategories.length > 0) {
          setLocalRateCategories(toAddCategories);
          if (alreadyConfiguredCodes.length > 0) {
            const codesStr = `'${alreadyConfiguredCodes.join(", ")}'`;
            toast.success(t('messages.validationRatesAlreadyExistSome', { codes: codesStr }) || `Rates already exist for ${codesStr}. Only unconfigured use types are shown.`);
          }
        } else {
          // If all selected types are already configured, we display them all to trigger validationRatesAlreadyExist
          const allCategories: RateCategory[] = [];
          const seenAll = new Set<number>();

          const processAllType = (tu: ITypeOfUseDetails) => {
            const groupId = tu.typeOfUseGroupId;
            const code = tu.typeOfUseCode || String(tu.id);
            if (groupId && groupId > 0) {
              if (!seenAll.has(groupId)) {
                seenAll.add(groupId);
                allCategories.push({
                  constructionId: String(tu.id),
                  constructionCode: code,
                  description: tu.description || "",
                  typeOfUseGroupId: groupId,
                  associatedUseTypes: getAssociatedTypes(groupId)
                });
              }
            } else {
              allCategories.push({
                constructionId: String(tu.id),
                constructionCode: code,
                description: tu.description || "",
                typeOfUseGroupId: groupId,
                associatedUseTypes: getAssociatedTypes(groupId)
              });
            }
          };

          if (opCategory) processAllType(opCategory);
          selectedTypes.forEach(tu => {
            if (tu.typeOfUseCode === 'OP') return;
            processAllType(tu);
          });

          setLocalRateCategories(allCategories);
          toast.error(t('messages.validationRatesAlreadyExist'));
        }
      } else {
        // Original logic for Construction Type Rate Master (unchanged)
        if (opCategory) {
          categoriesList.push({
            constructionId: String(opCategory.id),
            constructionCode: opCategory.typeOfUseCode || String(opCategory.id),
            description: opCategory.description || "",
            typeOfUseGroupId: opCategory.typeOfUseGroupId
          });
          if (opCategory.typeOfUseGroupId) {
            seenGroupIds.add(opCategory.typeOfUseGroupId);
          }
        }

        selectedTypes.forEach(tu => {
          if (tu.typeOfUseCode === 'OP') return;

          const groupId = tu.typeOfUseGroupId;
          if (groupId && groupId > 0) {
            if (!seenGroupIds.has(groupId)) {
              seenGroupIds.add(groupId);
              categoriesList.push({
                constructionId: String(tu.id),
                constructionCode: tu.typeOfUseCode || String(tu.id),
                description: tu.description || "",
                typeOfUseGroupId: groupId
              });
            }
          } else {
            categoriesList.push({
              constructionId: String(tu.id),
              constructionCode: tu.typeOfUseCode || String(tu.id),
              description: tu.description || "",
              typeOfUseGroupId: groupId
            });
          }
        });

        setLocalRateCategories(categoriesList);
      }

      setHasConfiguredRates(true);
    } catch (err) {
      toast.error("Failed to map selected configuration");
    }
  };
  // Use lazy dropdown data hook for on-demand loading
  const {
    zoneOptions: lazyZoneOptions,
    useGroupOptions: lazyUseGroupOptions,
    assessmentYears: lazyAssessmentYears,
    isLoadingZones,
    isLoadingUseGroups,
    isLoadingAssessmentYears,
    loadZoneOptions,
    loadUseGroupOptions,
    loadAssessmentYears,
  } = useLazyDropdownData();

  // Use lazy-loaded options if server-provided options are empty, otherwise use server options
  const finalZoneOptions = zoneOptions && zoneOptions.length > 0 ? zoneOptions : lazyZoneOptions;
  const finalUseGroupOptions = useGroupOptions && useGroupOptions.length > 0 ? useGroupOptions : lazyUseGroupOptions;
  const finalAssessmentYears = assessmentYears && assessmentYears.length > 0 ? assessmentYears : lazyAssessmentYears;

  // Trigger lazy loading on mount if filterValues are present (for page reload)
  useEffect(() => {
    if (filterValues?.zone && finalZoneOptions.length === 0) {
      loadZoneOptions();
    }
    if (!isOpenPlot && filterValues?.useGroup && finalUseGroupOptions.length === 0) {
      loadUseGroupOptions();
    }
    if (filterValues?.year && finalAssessmentYears.length === 0) {
      loadAssessmentYears();
    }
  }, [filterValues, finalZoneOptions.length, finalUseGroupOptions.length, finalAssessmentYears.length, loadZoneOptions, loadUseGroupOptions, loadAssessmentYears, isOpenPlot]);

  const { selectedZone, selectedZoneLabel, selectedUseGroup, selectedUseGroupLabel, assessmentYear, assessmentYearLabel, setSelectedZone, setSelectedUseGroup, setAssessmentYear, fetchedBackendRates, rateFrequency, setRateFrequency, rateUnit, setRateUnit, multipliers, setMultipliers, handleDropdownChange } = useRateMasterFilters({ mode, backendRates: backendRates || undefined, filterValues, useGroupOptions: finalUseGroupOptions, rateFrequencyPolicy, rateUnitPolicy });
  const { handleBulkCreate, handleBulkUpdate, handleDelete } = useRateMasterOperations({ mode, id: id || undefined, selectedZone, selectedUseGroup, assessmentYear, rateFrequency, rateUnit, multipliers, rateCategories: localRateCategories, useGroupOptions: finalUseGroupOptions, isOpenPlot });

  const { showMatrix, setShowMatrix, matrixData, setMatrixData, matrixPageNumber, matrixPageSize, matrixTotalPages, matrixTotalCount, paginatedZoneDescriptions, allZoneEdits, setAllZoneEdits, existingRateFound, setExistingRateFound, isCheckingRates, setIsCheckingRates, allFiltersSelected, errors, zoneRemarksMap, filledRatesCount, completionPercentage, matrixStorageKey, handleMatrixPaginationChange, buildCompleteMatrixForSubmission } = useRateMasterFormState({ mode, id, editData, bulkEditData, backendRates, fetchedBackendRates, filterValues, selectedZone, selectedUseGroup, assessmentYear, setSelectedZone, setSelectedUseGroup, setAssessmentYear, rateFrequency, setRateFrequency, rateUnit, zoneDescriptions, allZones, rateCategories: localRateCategories, assessmentYears: finalAssessmentYears, zoneOptions: finalZoneOptions, useGroupOptions: finalUseGroupOptions, showCopyRateSection, showMultipliersSection, paginatedZonesData, initialExistingRatesCheck, isOpenPlot });

  const { sourceUseGroup, setSourceUseGroup, sourceRateSection, setSourceRateSection, sourceRateSectionOptions, copySectionsExpanded, setCopySectionsExpanded, copyRatesActiveTab, setCopyRatesActiveTab, showMultipliersInline, setShowMultipliersInline, tempMultipliers, setTempMultipliers, fileInputRef, handleCopyRates, handleCopyRatesFromRateSection, handleDownloadTemplate, handleUploadExcel } = useRateMasterImportExport({ selectedZone, selectedUseGroup, assessmentYear, allZones, zoneDescriptions, rateCategories: localRateCategories, zoneOptions: finalZoneOptions, useGroupOptions: finalUseGroupOptions, assessmentYears: finalAssessmentYears, assessmentYearRanges, matrixData, setMatrixData, allZoneEdits, setAllZoneEdits, setShowMatrix, showMatrix, showCopyRateSection, t, multipliers, setMultipliers, rateUnit });

  useExistingRateCheck({ mode, id, editData, bulkEditData, selectedZone, selectedUseGroup, assessmentYear, allFiltersSelected, setExistingRateFound, setIsCheckingRates, isOpenPlot, rateCategories: localRateCategories });
  useUrlParamSync({ selectedZone, selectedUseGroup, assessmentYear, copySectionsExpanded, showMultipliersInline, isOpenPlot, rateCategories: localRateCategories });

  // Synchronize matrixData columns dynamically when localRateCategories is reconfigured
  useEffect(() => {
    if (showMatrix && matrixData.length > 0) {
      setMatrixData(prev => prev.map(row => {
        const newRow = { ...row };
        const validIds = new Set(localRateCategories.map(c => c.constructionId));
        // Remove columns not present in localRateCategories
        Object.keys(newRow).forEach(key => {
          if (key !== 'id' && key !== 'zone' && key !== 'zoneNo' && !validIds.has(key)) {
            delete newRow[key];
          }
        });
        // Add newly configured columns with default value of 0
        localRateCategories.forEach(cat => {
          if (newRow[cat.constructionId] === undefined) {
            newRow[cat.constructionId] = 0;
          }
        });
        return newRow;
      }));
    }
  }, [localRateCategories, showMatrix, setMatrixData]);

  const { handleAddRates, handleUpdateRates, handleDeleteRates, handleGenerateMatrix, handleToggleMultipliers, handleToggleCopyRates, handleCloseCopySection, handleCloseMultipliersSection, handleApplyMultipliers, handleCopyRatesWithValidation } = useRateFormHandlers({ mode, id, editData, bulkEditData, selectedZone, selectedUseGroup, assessmentYear, existingRateFound, rateCategories: localRateCategories, useGroupOptions: finalUseGroupOptions, zoneOptions: finalZoneOptions, assessmentYears: finalAssessmentYears, assessmentYearRanges, zoneDescriptions, paginatedZoneDescriptions, matrixStorageKey, locale, onClose, router, confirm, buildCompleteMatrixForSubmission, handleBulkCreate, handleBulkUpdate, handleDelete, setMatrixData, setShowMatrix, setCopySectionsExpanded, setShowMultipliersInline, setMultipliers, tempMultipliers, sourceUseGroup, handleCopyRates, t, isOpenPlot });


  const isDrawerMode = !!onClose;
  const isEditMode = !!id || !!editData || !!bulkEditData;
  const isImportDisabled = (!isOpenPlot && existingRateFound) || !selectedZone || selectedZone === 'ALL' ||
    (!isOpenPlot && (!selectedUseGroup || selectedUseGroup === 'ALL')) || !assessmentYear || assessmentYear === 'ALL' ||
    (isOpenPlot && !hasConfiguredRates);

  // Show toast when filters match existing rates
  const hasShownToastRef = useRef(false);

  // Reset toast shown flag when filters change
  useEffect(() => {
    hasShownToastRef.current = false;
  }, [selectedZone, selectedUseGroup, assessmentYear]);

  useEffect(() => {
    if (isOpenPlot) return; // bypass for open plot
    if (!isEditMode && existingRateFound && !hasShownToastRef.current) {
      toast.error(t('messages.validationRatesAlreadyExist'));
      hasShownToastRef.current = true;
    }
    if (!existingRateFound) {
      hasShownToastRef.current = false;
    }
  }, [existingRateFound, isEditMode, t, selectedZone, selectedUseGroup, assessmentYear, isOpenPlot]);

  return (
    <div className={isDrawerMode ? "space-y-3" : "max-w-7xl mx-auto p-2 md:p-3"}>
      {!isDrawerMode && <RateMasterFormHeader id={id} t={t} />}
      <div className="space-y-3">
        <RateFrequencySection
          rateFrequency={rateFrequency}
          onRateFrequencyChange={setRateFrequency}
          rateUnit={rateUnit}
          onRateUnitChange={setRateUnit}
          mode={mode}
          onDownloadTemplate={handleDownloadTemplate}
          onUploadClick={() => fileInputRef.current?.click()}
          fileInputRef={fileInputRef}
          onFileChange={handleUploadExcel}
          isDisabled={isImportDisabled}
          isFrequencyLocked={true}
          isUnitLocked={true}
          t={t}
        />
        <div className="bg-[#f8faff] rounded-xl border border-blue-200 shadow-md p-1">
          <RateFiltersSection
            selectedZone={selectedZone}
            selectedUseGroup={selectedUseGroup}
            assessmentYear={assessmentYear}
            zoneOptions={finalZoneOptions}
            useGroupOptions={finalUseGroupOptions}
            assessmentYears={finalAssessmentYears}
            assessmentYearRanges={assessmentYearRanges}
            errors={errors}
            allFiltersSelected={allFiltersSelected}
            existingRateFound={existingRateFound}
            isCheckingRates={isCheckingRates}
            mode={mode}
            isLoadingZones={isLoadingZones}
            isLoadingUseGroups={isLoadingUseGroups}
            isLoadingAssessmentYears={isLoadingAssessmentYears}
            onDropdownChange={handleDropdownChange}
            onGenerateMatrix={handleGenerateMatrix}
            onToggleMultipliers={() => handleToggleMultipliers(showMultipliersInline)}
            onToggleCopyRates={handleToggleCopyRates}
            onLoadZones={loadZoneOptions}
            onLoadUseGroups={loadUseGroupOptions}
            onLoadAssessmentYears={loadAssessmentYears}
            t={t}
            isOpenPlot={isOpenPlot}
            hasConfiguredRates={hasConfiguredRates}
            onConfigureRates={handleConfigureRatesClick}
          />
          {mode === "add" && (
            <RateCopyMultipliersWrapper
              copySectionsExpanded={copySectionsExpanded}
              showMultipliersInline={showMultipliersInline}
              sourceUseGroup={sourceUseGroup}
              setSourceUseGroup={setSourceUseGroup}
              sourceRateSection={sourceRateSection}
              setSourceRateSection={setSourceRateSection}
              sourceRateSectionOptions={sourceRateSectionOptions}
              copyRatesActiveTab={copyRatesActiveTab}
              setCopyRatesActiveTab={setCopyRatesActiveTab}
              useGroupOptions={finalUseGroupOptions}
              selectedUseGroup={selectedUseGroup}
              selectedZone={selectedZone}
              onCopyRates={handleCopyRatesWithValidation}
              onCopyRatesFromRateSection={handleCopyRatesFromRateSection}
              onCloseCopySection={handleCloseCopySection}
              tempMultipliers={tempMultipliers}
              setTempMultipliers={setTempMultipliers}
              onApplyMultipliers={handleApplyMultipliers}
              onCloseMultipliersSection={handleCloseMultipliersSection}
              t={t}
            />
          )}
          {showMatrix && !hideMatrixSection && (
            <>
              <RateMatrixSection
                matrixData={matrixData}
                setMatrixData={setMatrixData}
                setAllZoneEdits={setAllZoneEdits}
                rateCategories={localRateCategories}
                selectedZone={selectedZone}
                selectedZoneLabel={selectedZoneLabel}
                selectedUseGroup={selectedUseGroup}
                selectedUseGroupLabel={selectedUseGroupLabel}
                assessmentYear={assessmentYear}
                assessmentYearLabel={assessmentYearLabel}
                rateUnit={rateUnit}
                zoneOptions={finalZoneOptions}
                useGroupOptions={finalUseGroupOptions}
                assessmentYears={finalAssessmentYears}
                assessmentYearRanges={assessmentYearRanges}
                zoneRemarksMap={zoneRemarksMap}
                filledRatesCount={filledRatesCount}
                matrixPageNumber={matrixPageNumber}
                matrixPageSize={matrixPageSize}
                matrixTotalPages={matrixTotalPages}
                matrixTotalCount={matrixTotalCount}
                onPaginationChange={handleMatrixPaginationChange}
                mode={mode}
                id={id}
                onAddRates={handleAddRates}
                onUpdateRates={handleUpdateRates}
                onDeleteRates={handleDeleteRates}
                existingRateFound={existingRateFound}
                multipliers={multipliers}
                t={t}
                tCommon={tCommon}
              />
              <RateCompletionProgress completionPercentage={completionPercentage} t={t} />
            </>
          )}
        </div>
      </div>
      <ConfigureRatesDrawer
        open={isConfigureRatesOpen}
        onClose={handleConfigureDrawerClose}
        isMatrixVisible={showMatrix}
        currentCategories={localRateCategories}
        onConfigureSelected={handleConfigureSelected}
      />
    </div>
  );
};

export default RateMasterForm;
