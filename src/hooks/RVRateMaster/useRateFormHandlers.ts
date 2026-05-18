import { toast } from "sonner";
import { getRateMasterByFilters } from "@/app/[locale]/property-tax/rate-master/rvratemaster/action";
import type { IBackendRateMaster, ISelectOption, IZoneDescription, RateCategory } from "@/types/RVRateMaster";
import type { ConfirmOptions } from "@/components/common/ConfirmProvider";

type MatrixRow = {
  id: number;
  zone?: string;
  zoneNo?: string;
  [key: string]: number | string | undefined;
};

interface RateFormHandlersProps {
  mode: "edit" | "delete" | "add";
  id?: string | null;
  editData?: unknown;
  bulkEditData?: unknown;
  selectedZone: string;
  selectedUseGroup: string;
  assessmentYear: string;
  existingRateFound: boolean;
  rateCategories: RateCategory[];
  useGroupOptions: ISelectOption[];
  zoneOptions: ISelectOption[];
  assessmentYears: ISelectOption[];
  assessmentYearRanges?: Array<{ label: string; value: string }>;
  zoneDescriptions: IZoneDescription[];
  paginatedZoneDescriptions: IZoneDescription[];
  matrixStorageKey: string;
  locale: string;
  onClose?: () => void;
  router: { replace: (url: string) => void };
  confirm: (options: ConfirmOptions) => void;
  buildCompleteMatrixForSubmission: () => MatrixRow[];
  handleBulkCreate: (data: MatrixRow[]) => Promise<{ success: boolean } | undefined>;
  handleBulkUpdate: (data: MatrixRow[]) => Promise<{ success: boolean } | undefined>;
  handleDelete: (data: IBackendRateMaster[]) => Promise<{ success: boolean } | undefined>;
  setMatrixData: (data: MatrixRow[]) => void;
  setShowMatrix: (show: boolean) => void;
  setCopySectionsExpanded: (expanded: boolean) => void;
  setShowMultipliersInline: (show: boolean) => void;
  setMultipliers: (multipliers: Record<string, number>) => void;
  tempMultipliers: Record<string, number>;
  sourceUseGroup: string;
  handleCopyRates: () => Promise<void>;
  t: ReturnType<typeof import("next-intl").useTranslations>;
}

/**
 * Hook providing all handler functions for rate form operations
 */
export function useRateFormHandlers(props: RateFormHandlersProps) {
  const {
    id, editData, bulkEditData, selectedZone, selectedUseGroup, assessmentYear,
    existingRateFound, rateCategories, useGroupOptions, zoneOptions, assessmentYears,
    assessmentYearRanges, zoneDescriptions, paginatedZoneDescriptions, matrixStorageKey,
    locale, onClose, router, confirm, buildCompleteMatrixForSubmission,
    handleBulkCreate, handleBulkUpdate, handleDelete, setMatrixData, setShowMatrix,
    setCopySectionsExpanded, setShowMultipliersInline, setMultipliers,
    tempMultipliers, sourceUseGroup, handleCopyRates, t
  } = props;

  const handleClose = () => {
    if (onClose) {
      onClose();
    } else {
      router.replace(`/${locale}/property-tax/rate-master/rvratemaster`);
    }
  };

  const handleAddRates = async () => {
    const completeMatrixData = buildCompleteMatrixForSubmission();
    const totalCells = completeMatrixData.length * rateCategories.length;
    const filledCells = completeMatrixData.reduce((count, row) => {
      return count + rateCategories.filter(cat => {
        const key = cat.constructionCode || cat.constructionId;
        const value = row[key] as number;
        return value && value > 0;
      }).length;
    }, 0);
    const completionPct = totalCells > 0 ? Math.round((filledCells / totalCells) * 100) : 0;
    if (completionPct < 100) {
      toast.error(t('messages.validationIncompleteMatrix', { percentage: completionPct }));
      return;
    }
    const result = await handleBulkCreate(completeMatrixData);
    if (result?.success) {
      handleClose();
    }
  };

  const handleUpdateRates = async () => {
    const completeMatrixData = buildCompleteMatrixForSubmission();
    const result = await handleBulkUpdate(completeMatrixData);
    if (result?.success) {
      handleClose();
    }
  };

  const handleDeleteRates = async () => {
    let latestBackendRates: IBackendRateMaster[] = [];
    try {
      latestBackendRates = await getRateMasterByFilters(selectedZone, selectedUseGroup, assessmentYear);
    } catch (_err) {
      toast.error(t('messages.fetchRatesForDeleteFailed'));
      return;
    }
    if (!latestBackendRates || latestBackendRates.length === 0) {
      toast.error(t('messages.noRatesToDelete'));
      return;
    }

    const configuredRatesCount = latestBackendRates.filter(rate => Number(rate.rateSquareMeter) > 0).length;
    let zoneName = selectedZone;
    if (zoneOptions?.length) {
      const found = zoneOptions.find(z => z.value === selectedZone);
      if (found?.label) zoneName = found.label;
    } else if (zoneDescriptions?.length) {
      const found = zoneDescriptions.find(z => String(z.zoneNo) === String(selectedZone));
      if (found?.description) zoneName = found.description;
    }
    const useGroupLabel = useGroupOptions.find(opt => opt.value === selectedUseGroup)?.label || selectedUseGroup;
    const assessmentYearLabel = assessmentYearRanges?.find(ay => String(ay.value) === String(assessmentYear))?.label
      || assessmentYears?.find(ay => String(ay.value) === String(assessmentYear))?.label
      || assessmentYear;

    confirm({
      variant: "delete",
      title: t('dialogs.deleteRatesTitle'),
      description: t('dialogs.deleteRatesDescription', {
        count: configuredRatesCount,
        zoneName,
        useGroup: useGroupLabel,
        assessmentYear: assessmentYearLabel,
      }),
      confirmText: t('dialogs.confirmDelete'),
      cancelText: t('dialogs.cancel'),
      onConfirm: async () => {
        const result = await handleDelete(latestBackendRates);
        if (result?.success) {
          handleClose();
        }
      },
    });
  };

  const handleGenerateMatrix = async () => {
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
    if (!isEditMode && existingRateFound) {
      toast.error(t('messages.validationRatesAlreadyExist'));
      return;
    }

    const params = new URLSearchParams({ zone: selectedZone, useGroup: selectedUseGroup });
    if (assessmentYear) params.append("assessmentYear", assessmentYear);
    const newUrl = `/${locale}/property-tax/rate-master/rvratemaster/add?${params.toString()}`;
    window.history.pushState({}, '', newUrl);

    if (!isEditMode && assessmentYear) {
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
    setShowMatrix(true);
  };

  const handleToggleMultipliers = (currentShowMultipliers: boolean) => {
    const params = new URLSearchParams(window.location.search);
    if (currentShowMultipliers) {
      params.delete('showMultipliers');
    } else {
      params.set('showMultipliers', 'true');
    }
    const newUrl = `${window.location.pathname}?${params.toString()}`;
    window.history.pushState({}, '', newUrl);
    setShowMultipliersInline(!currentShowMultipliers);
  };

  const handleToggleCopyRates = () => {
    const params = new URLSearchParams(window.location.search);
    params.set('zone', selectedZone);
    params.set('useGroup', selectedUseGroup);
    params.set('assessmentYear', assessmentYear);
    params.set('showCopyRates', 'true');
    const newUrl = `${window.location.pathname}?${params.toString()}`;
    window.history.pushState({}, '', newUrl);
    setCopySectionsExpanded(true);
  };

  const handleCloseCopySection = () => {
    const params = new URLSearchParams(window.location.search);
    params.delete('showCopyRates');
    const newUrl = params.toString() ? `${window.location.pathname}?${params.toString()}` : window.location.pathname;
    window.history.pushState({}, '', newUrl);
    setCopySectionsExpanded(false);
  };

  const handleCloseMultipliersSection = () => {
    const params = new URLSearchParams(window.location.search);
    params.delete('showMultipliers');
    const newUrl = params.toString() ? `${window.location.pathname}?${params.toString()}` : window.location.pathname;
    window.history.pushState({}, '', newUrl);
    setShowMultipliersInline(false);
  };

  const handleApplyMultipliers = () => {
    setMultipliers({ ...tempMultipliers });
    const changedMultipliers = Object.entries(tempMultipliers)
      .filter(([_, value]) => value > 0 && value !== 1.0)
      .map(([key]) => useGroupOptions.find(opt => opt.value === key)?.label || key);
    if (changedMultipliers.length > 0) {
      toast.success(t('messages.multiplierAdded', { groups: changedMultipliers.join(', ') }));
      handleCloseMultipliersSection();
    } else {
      toast.info(t('messages.noMultipliersChanged'));
    }
  };

  const handleCopyRatesWithValidation = () => {
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
  };

  return {
    handleClose,
    handleAddRates,
    handleUpdateRates,
    handleDeleteRates,
    handleGenerateMatrix,
    handleToggleMultipliers,
    handleToggleCopyRates,
    handleCloseCopySection,
    handleCloseMultipliersSection,
    handleApplyMultipliers,
    handleCopyRatesWithValidation,
  };
}
