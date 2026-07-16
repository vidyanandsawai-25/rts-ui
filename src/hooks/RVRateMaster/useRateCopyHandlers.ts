import { toast } from "sonner";
import type { ISelectOption, IZoneDescription, RateCategory } from "@/types/RVRateMaster";

type MatrixRow = {
  id: number;
  zone?: string;
  zoneNo?: string;
  [key: string]: number | string | undefined;
};

interface RateCopyHandlersProps {
  id?: string | null;
  editData?: unknown;
  bulkEditData?: unknown;
  selectedZone: string;
  selectedUseGroup: string;
  assessmentYear: string;
  existingRateFound: boolean;
  rateCategories: RateCategory[];
  useGroupOptions: ISelectOption[];
  assessmentYears: ISelectOption[];
  assessmentYearRanges?: Array<{ label: string; value: string }>;
  zoneDescriptions: IZoneDescription[];
  paginatedZoneDescriptions: IZoneDescription[];
  matrixStorageKey: string;
  locale: string;
  setMatrixData: (data: MatrixRow[]) => void;
  setShowMatrix: (show: boolean) => void;
  setCopySectionsExpanded: (expanded: boolean) => void;
  setShowMultipliersInline: (show: boolean) => void;
  setMultipliers: (multipliers: Record<string, number>) => void;
  tempMultipliers: Record<string, number>;
  sourceUseGroup: string;
  handleCopyRates: () => Promise<void>;
  t: ReturnType<typeof import("next-intl").useTranslations>;
  isOpenPlot?: boolean;
}

export function useRateCopyHandlers(props: RateCopyHandlersProps) {
  const {
    id, editData, bulkEditData, selectedZone, selectedUseGroup, assessmentYear,
    existingRateFound, rateCategories, useGroupOptions, assessmentYears, assessmentYearRanges,
    zoneDescriptions, paginatedZoneDescriptions, matrixStorageKey, locale, setMatrixData,
    setShowMatrix, setCopySectionsExpanded, setShowMultipliersInline, setMultipliers,
    tempMultipliers, sourceUseGroup, handleCopyRates, t, isOpenPlot
  } = props;

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
    const currentPath = typeof window !== 'undefined' ? window.location.pathname : `/${locale}/property-tax/rate-master/rvratemaster/add`;
    const newUrl = `${currentPath}?${params.toString()}`;
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
    handleGenerateMatrix,
    handleToggleMultipliers,
    handleToggleCopyRates,
    handleCloseCopySection,
    handleCloseMultipliersSection,
    handleApplyMultipliers,
    handleCopyRatesWithValidation,
  };
}
