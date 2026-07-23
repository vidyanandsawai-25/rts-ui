import React from 'react';
import { useRouter, useParams } from 'next/navigation';
import { toast } from 'sonner';
import { useConfirm, type SearchSelectOption } from '@/components/common';
import {
  fetchDataEntrySameAsAction,
  applyDataEntrySameAsAction,
  getPropertyBasicDetailsAction,
} from '@/app/[locale]/property-tax/ptis/QuickDataEntry/[propertyId]/FloorSubmission/actions';
import { updatePropertyBasicDetailsAction } from '@/app/[locale]/property-tax/ptis/QuickDataEntry/[propertyId]/Property/action';
import type { SelectableProperty } from '@/types/floor-details.types';
import { FloorData } from '@/types/room-details.types';
import { getWardListAction } from '@/app/[locale]/property-tax/ptis/actions';
import {
  DATA_ENTRY_SAME_AS_FILTER_TYPES,
  normalizePartitionNo,
  getDataEntrySameAsType,
} from '../components/sameAsUtils';

interface UseDataEntrySameAsProps {
  isOpen: boolean;
  wardId?: string | number;
  propertyNo?: string;
  partitionNo?: string;
  initialPropertyID?: string | number;
  t: (key: string, values?: Record<string, string | number | Date>) => string;
  localFloors?: FloorData[];
  initialFloors?: FloorData[];
}

function comparePartitionNo(a: SelectableProperty, b: SelectableProperty): number {
  return String(a.partitionNo ?? '').localeCompare(String(b.partitionNo ?? ''), undefined, {
    numeric: true,
    sensitivity: 'base',
  });
}

export function useDataEntrySameAs({ isOpen, wardId, propertyNo, partitionNo, initialPropertyID, t, localFloors, initialFloors }: UseDataEntrySameAsProps) {
  const router = useRouter();
  const routeParams = useParams();
  const locale = String(routeParams?.locale || 'en');
  const { confirm } = useConfirm();

  const validateFloorSubmission = React.useCallback((): boolean => {
    const floors = (localFloors && localFloors.length > 0) ? localFloors : (initialFloors || []);
    const hasFloorSubmission = Array.isArray(floors) && floors.length > 0;

    if (!hasFloorSubmission) {
      confirm({
        variant: 'warning',
        title: t('common.warning') || 'Warning',
        description: t("floorSubmission.validation.requiredBeforeApply"),
        confirmText: t('common.ok') || 'OK',
        onConfirm: () => { },
      });
      return false;
    }
    return true;
  }, [localFloors, initialFloors, t, confirm]);

  React.useEffect(() => {
    if (isOpen) {
      const floors = (localFloors && localFloors.length > 0) ? localFloors : (initialFloors || []);
      const hasFloorSubmission = Array.isArray(floors) && floors.length > 0;
      if (!hasFloorSubmission) {
        confirm({
          variant: 'warning',
          title: t('common.warning') || 'Warning',
          description: t("floorSubmission.validation.requiredBeforeApply"),
          confirmText: t('common.ok') || 'OK',
          onConfirm: () => { },
        });
      }
    }
  }, [isOpen, localFloors, initialFloors, t, confirm]);

  const currentPropertyId = React.useMemo(() => {
    return initialPropertyID ? Number(initialPropertyID) : undefined;
  }, [initialPropertyID]);

  const [dataEntrySameAsTab, setDataEntrySameAsTab] = React.useState('type-wise');
  const [selectableProperties, setSelectableProperties] = React.useState<SelectableProperty[]>([]);
  const [selectedPropertyIds, setSelectedPropertyIds] = React.useState<Set<string | number>>(new Set());
  const [isLoadingProperties, setIsLoadingProperties] = React.useState(false);
  const [isApplyingSameAs, setIsApplyingSameAs] = React.useState(false);
  const [isApplyingTypeSubmission, setIsApplyingTypeSubmission] = React.useState(false);
  const [searchWardId, setSearchWardId] = React.useState(wardId ? String(wardId) : '');
  const [searchPropertyNo, setSearchPropertyNo] = React.useState(propertyNo || '');
  const [wardOptions, setWardOptions] = React.useState<SearchSelectOption[]>([]);
  const [isFetchingWards, setIsFetchingWards] = React.useState(false);
  const [changeTypeInput, setChangeTypeInput] = React.useState<string>('');
  const initializedRequestRef = React.useRef<string | null>(null);
  const wardsLoadedRef = React.useRef(false);

  const currentPropertyType = React.useMemo(() => {
    const match = selectableProperties.find((p) => normalizePartitionNo(p.partitionNo) === normalizePartitionNo(partitionNo));
    return match ? String(match.type ?? '') : '';
  }, [selectableProperties, partitionNo]);

  const sanitizeWardNo = React.useCallback((val: string) => val.replace(/[^a-zA-Z0-9]/g, '').slice(0, 10), []);
  const sanitizePropertyNo = React.useCallback((val: string) => val.replace(/[^a-zA-Z0-9-]/g, '').slice(0, 10), []);

  const loadWards = React.useCallback(async () => {
    setIsFetchingWards(true);
    try {
      const res = await getWardListAction();
      if (res.success && res.data) {
        setWardOptions(res.data.map((w) => ({ label: w.wardNo || '', value: String(w.wardId) })));
        wardsLoadedRef.current = true;
      }
    } catch { } finally { setIsFetchingWards(false); }
  }, []);

  const handleWardChange = React.useCallback((_name: string | undefined, value: string) => {
    setSearchWardId(value);
    setSearchPropertyNo('');
    setSelectableProperties([]);
    setSelectedPropertyIds(new Set());
  }, []);

  const handleSearchProperties = React.useCallback(async () => {
    if (!Number(searchWardId) || !searchPropertyNo.trim()) return;
    setIsLoadingProperties(true);
    setSelectableProperties([]);
    setSelectedPropertyIds(new Set());
    try {
      const results = await fetchDataEntrySameAsAction(Number(searchWardId), searchPropertyNo.trim());
      setSelectableProperties(results);
    } finally { setIsLoadingProperties(false); }
  }, [searchWardId, searchPropertyNo]);

  React.useEffect(() => {
    if (!isOpen) {
      initializedRequestRef.current = null;
      return;
    }

    const requestKey = `${wardId ?? ''}|${propertyNo ?? ''}|${partitionNo ?? ''}`;
    if (initializedRequestRef.current === requestKey) return;
    initializedRequestRef.current = requestKey;

    let cancelled = false;
    const initData = async () => {
      setSearchWardId(wardId ? String(wardId) : '');
      setSearchPropertyNo(propertyNo || '');
      setSelectableProperties([]);
      setSelectedPropertyIds(new Set());
      setChangeTypeInput(''); // Reset on drawer open
      setIsLoadingProperties(true);

      const wardPromise = wardsLoadedRef.current ? Promise.resolve() : loadWards();
      const propertiesPromise = Number(wardId) && propertyNo?.trim()
        ? fetchDataEntrySameAsAction(Number(wardId), propertyNo.trim())
        : Promise.resolve([]);

      try {
        const [, results] = await Promise.all([wardPromise, propertiesPromise]);
        if (!cancelled) setSelectableProperties(results);
      } finally {
        if (!cancelled) setIsLoadingProperties(false);
      }
    };
    void initData();

    return () => {
      cancelled = true;
    };
  }, [isOpen, wardId, propertyNo, partitionNo, loadWards]);

  const filterPropertiesForTable = React.useCallback((properties: SelectableProperty[], includeCurrentPartition = false) => {
    const mapped = properties
      .filter(p => p.partitionNo && p.partitionNo !== '-')
      .filter(p => includeCurrentPartition || normalizePartitionNo(p.partitionNo) !== normalizePartitionNo(partitionNo))
      .map(p => {
        const wardOpt = wardOptions.find(o => o.value === String(p.wardId));
        return { ...p, wardNo: wardOpt ? wardOpt.label : '-' };
      });

    const sorted = [...mapped].sort(comparePartitionNo);

    if (currentPropertyId) {
      const sourceIndex = sorted.findIndex(p => Number(String(p.id).split('-')[0]) === currentPropertyId);
      if (sourceIndex > -1) {
        const [sourceProp] = sorted.splice(sourceIndex, 1);
        sorted.unshift(sourceProp);
      }
    }

    return sorted;
  }, [partitionNo, wardOptions, currentPropertyId]);

  const sourcePropertyIds = React.useMemo(() => {
    const matches = selectableProperties.filter((p) => Number(String(p.id).split('-')[0]) === currentPropertyId);
    return new Set<string | number>(matches.map((m) => m.id));
  }, [currentPropertyId, selectableProperties]);

  const typeWiseLockedPropertyIds = React.useMemo(() => {
    return new Set<string | number>(sourcePropertyIds);
  }, [sourcePropertyIds]);

  const activeLockedPropertyIds = dataEntrySameAsTab === 'type-wise' ? typeWiseLockedPropertyIds : sourcePropertyIds;

  const effectiveSelectedPropertyIds = selectedPropertyIds;

  const handleDataEntrySameAsTabChange = React.useCallback((tab: string) => {
    if (!validateFloorSubmission()) {
      return;
    }
    setDataEntrySameAsTab(tab);
    setSelectedPropertyIds(new Set(sourcePropertyIds));
    setChangeTypeInput(''); // Reset on tab change
  }, [sourcePropertyIds, validateFloorSubmission]);

  const handleTogglePropertySelection = React.useCallback((id: string | number) => {
    setSelectedPropertyIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const handleToggleMultipleProperties = React.useCallback((ids: Array<string | number>, select: boolean) => {
    setSelectedPropertyIds(prev => {
      const next = new Set(prev);
      ids.forEach((id) => {
        if (select) {
          next.add(id);
        } else {
          next.delete(id);
        }
      });
      return next;
    });
  }, []);

  const handleClearPropertySelection = React.useCallback(() => setSelectedPropertyIds(new Set(sourcePropertyIds)), [sourcePropertyIds]);

  const handleApplySameAsDetails = React.useCallback(async () => {
    if (!validateFloorSubmission()) {
      return;
    }
    const sourcePropertyId = currentPropertyId;
    if (!sourcePropertyId) {
      toast.error(t('floor.selectProperties.sourcePropertyNotFound', { partitionNo: partitionNo || '-' }));
      return;
    }

    // Check if any source property row is selected (checked) by the user
    const isSourceSelected = Array.from(sourcePropertyIds).some((id) => effectiveSelectedPropertyIds.has(id));

    // Calculate destination property IDs (excluding sourcePropertyId)
    const destinationPropertyIds = Array.from(new Set(
      Array.from(effectiveSelectedPropertyIds)
        .map((id) => Number(String(id).split('-')[0]))
        .filter((propId) => (
          Number.isFinite(propId) &&
          propId > 0 &&
          propId !== sourcePropertyId
        ))
    ));

    // If neither source property nor any destination property is selected, show error
    if (destinationPropertyIds.length === 0 && !isSourceSelected) {
      toast.error(t('floor.selectProperties.selectDestinationProperty'));
      return;
    }

    setIsApplyingSameAs(true);
    try {
      const newType = getDataEntrySameAsType(changeTypeInput || currentPropertyType);

      // Validate that we have a valid property type ID
      if (newType === undefined || newType === null || !Number.isFinite(newType) || newType <= 0) {
        toast.error(t('floor.selectProperties.invalidPropertyType'));
        setIsApplyingSameAs(false);
        return;
      }

      const promises: Promise<{ success: boolean; error?: string }>[] = [];

      // For TYPEWISE, include ALL selected properties (including source) in the applyDataEntrySameAsAction
      // This ensures /DataEntrySameAs/units API returns updated data since it uses same data source
      if (dataEntrySameAsTab === 'type-wise') {
        // Get ALL selected property IDs (including source)
        const allSelectedPropertyIds = Array.from(new Set(
          Array.from(effectiveSelectedPropertyIds)
            .map((id) => Number(String(id).split('-')[0]))
            .filter((propId) => Number.isFinite(propId) && propId > 0)
        ));

        if (allSelectedPropertyIds.length > 0) {
          const payload = {
            sourcePropertyId,
            destinationPropertyIds: allSelectedPropertyIds,
            filterType: DATA_ENTRY_SAME_AS_FILTER_TYPES[dataEntrySameAsTab] ?? dataEntrySameAsTab.toUpperCase(),
            type: newType
          };
          promises.push(applyDataEntrySameAsAction(payload));
        }
      } else {
        // For non-TYPEWISE tabs, use original logic
        // 1. If source property is selected, update its type via basic details API
        if (isSourceSelected) {
          promises.push((async () => {
            // Fetch current basic details of source property
            const basicDetails = await getPropertyBasicDetailsAction(sourcePropertyId);
            if (!basicDetails) {
              return { success: false, error: t('floor.selectProperties.sourcePropertyNotFound', { partitionNo: partitionNo || '-' }) };
            }

            // Map only the fields required by UpdatePropertyBasicDetailsDto
            const updatedPayload = {
              wardId: basicDetails.wardId,
              taxZoneId: basicDetails.taxZoneId,
              categoryId: basicDetails.categoryId,
              propertyTypeId: newType, // modified
              partitionNo: basicDetails.partitionNo,
              flatOrShopNo: basicDetails.flatOrShopNo,
              plotNo: basicDetails.plotNo,
              surveyNo: basicDetails.surveyNo,
              upicId: basicDetails.upicId,
              subZoneNo: basicDetails.subZoneNo,
              moujaId: basicDetails.moujaId,
              moujaName: basicDetails.moujaName,
              noOfResidentialToilets: basicDetails.noOfResidentialToilets,
              noOfCommercialToilets: basicDetails.noOfCommercialToilets,
              totalBuiltupAreaSqFeet: basicDetails.totalBuiltupAreaSqFeet,
              totalCarpetAreaSqFeet: basicDetails.totalCarpetAreaSqFeet,
              totalBuiltupAreaSqMeter: basicDetails.totalBuiltupAreaSqMeter,
              totalCarpetAreaSqMeter: basicDetails.totalCarpetAreaSqMeter,
              plotArea: basicDetails.plotArea ?? null,
              plotAreaFtLength: basicDetails.plotAreaFtLength,
              plotAreaFtWidth: basicDetails.plotAreaFtWidth,
              plotAreaMtrLength: basicDetails.plotAreaMtrLength,
              plotAreaMtrWidth: basicDetails.plotAreaMtrWidth,
              rateSectionDescription: basicDetails.rateSectionDescription,
            };

            // Call the action to save it
            return await updatePropertyBasicDetailsAction(locale, sourcePropertyId, updatedPayload, false);
          })());
        }

        // 2. If there are destination properties selected, update their types via SameAs API
        if (destinationPropertyIds.length > 0) {
          const payload = {
            sourcePropertyId,
            destinationPropertyIds,
            filterType: DATA_ENTRY_SAME_AS_FILTER_TYPES[dataEntrySameAsTab] ?? dataEntrySameAsTab.toUpperCase(),
            type: newType
          };
          promises.push(applyDataEntrySameAsAction(payload, locale));
        }
      }

      // Check if any API call will be made
      if (promises.length === 0) {
        toast.error(t('floor.selectProperties.selectDestinationProperty'));
        setIsApplyingSameAs(false);
        return;
      }

      const originalProperties = [...selectableProperties];

      // Optimistic UI update based on user requirement to see changes immediately
      if (dataEntrySameAsTab === 'type-wise') {
        const allSelectedIds = new Set(
          Array.from(effectiveSelectedPropertyIds)
            .map((id) => Number(String(id).split('-')[0]))
        );
        setSelectableProperties((prev) => prev.map((p) => {
          const propId = Number(String(p.id).split('-')[0]);
          if (allSelectedIds.has(propId)) {
            return { ...p, type: changeTypeInput || currentPropertyType, typeLabel: changeTypeInput || currentPropertyType };
          }
          return p;
        }));
      } else setSelectedPropertyIds(new Set(sourcePropertyIds));

      const results = await Promise.all(promises);
      const failedResult = results.find(r => !r.success);

      if (!failedResult) {
        toast.success(t('floor.selectProperties.applySuccess'));
        // Re-fetch the properties to get updated data from server
        if (Number(searchWardId) && searchPropertyNo.trim()) {
          const updatedResults = await fetchDataEntrySameAsAction(Number(searchWardId), searchPropertyNo.trim());
          setSelectableProperties(updatedResults);
        }
        router.refresh();
      } else {
        if (dataEntrySameAsTab === 'type-wise') {
          setSelectableProperties(originalProperties);
        }
        toast.error(failedResult.error || t('floor.selectProperties.unknownError'));
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : t('floor.selectProperties.unknownError'));
    } finally { setIsApplyingSameAs(false); }
  }, [partitionNo, selectableProperties, effectiveSelectedPropertyIds, dataEntrySameAsTab, t, router, changeTypeInput, currentPropertyType, currentPropertyId, sourcePropertyIds, locale, searchWardId, searchPropertyNo, validateFloorSubmission]);

  const handleApplyTypeSubmission = React.useCallback(async () => {
    if (!validateFloorSubmission()) {
      return;
    }
    const sourceProperty = selectableProperties.find((p) => Number(String(p.id).split('-')[0]) === currentPropertyId);
    const sourcePropertyId = currentPropertyId;
    if (!sourcePropertyId) {
      toast.error(t('floor.selectProperties.sourcePropertyNotFound', { partitionNo: partitionNo || '-' }));
      return;
    }
    const destinationPropertyIds = Array.from(new Set(
      Array.from(effectiveSelectedPropertyIds)
        .map((id) => Number(String(id).split('-')[0]))
        .filter((propId) => (
          Number.isFinite(propId) &&
          propId > 0 &&
          propId !== sourcePropertyId
        ))
    ));
    if (destinationPropertyIds.length === 0) {
      toast.error(t('floor.selectProperties.selectDestinationProperty'));
      return;
    }

    const isSourceSelected = Array.from(sourcePropertyIds).some((id) => effectiveSelectedPropertyIds.has(id));

    const executeSubmission = async () => {
      setIsApplyingTypeSubmission(true);
      try {
        // Optimistic UI update based on user requirement to see changes immediately
        const updatedIds = new Set(destinationPropertyIds);
        setSelectableProperties((prev) => prev.map((p) => {
          const propId = Number(String(p.id).split('-')[0]);
          if (updatedIds.has(propId)) {
            return {
              ...p,
              carpetAreaSqFeet: sourceProperty?.carpetAreaSqFeet ?? p.carpetAreaSqFeet,
              carpetAreaSqMeter: sourceProperty?.carpetAreaSqMeter ?? p.carpetAreaSqMeter,
            };
          }
          return p;
        }));

        const currentType = getDataEntrySameAsType(changeTypeInput || currentPropertyType) || 1;
        const submissionResult = await applyDataEntrySameAsAction({
          sourcePropertyId,
          destinationPropertyIds,
          filterType: "TYPEWISE,PROPERTYWISE",
          type: currentType,

        }, locale);

        if (submissionResult.success) {
          toast.success(t('floor.selectProperties.applySuccess'));
          // Clear all selections (including source property) after successful submission
          setSelectedPropertyIds(new Set());
          // Re-fetch the properties to get updated data from server
          if (Number(searchWardId) && searchPropertyNo.trim()) {
            const updatedResults = await fetchDataEntrySameAsAction(Number(searchWardId), searchPropertyNo.trim());
            setSelectableProperties(updatedResults);
          }
          router.refresh();
        } else {
          toast.error(submissionResult.error || t('floor.selectProperties.unknownError'));
        }
      } finally {
        setIsApplyingTypeSubmission(false);
      }
    };

    if (isSourceSelected) {
      confirm({
        variant: 'warning',
        title: t('floor.selectProperties.warningTitle') || 'Warning',
        description: t('floor.selectProperties.sourcePropertySubmissionWarning', { partitionNo: partitionNo || '-' }),
        onConfirm: async () => {
          await executeSubmission();
        }
      });
    } else {
      await executeSubmission();
    }
  }, [partitionNo, selectableProperties, effectiveSelectedPropertyIds, t, currentPropertyId, confirm, sourcePropertyIds, router, searchWardId, searchPropertyNo, locale, validateFloorSubmission]);

  return {
    dataEntrySameAsTab, setDataEntrySameAsTab: handleDataEntrySameAsTabChange, selectableProperties, selectedPropertyIds: effectiveSelectedPropertyIds, isLoadingProperties, currentPropertyType,
    searchWardId, searchPropertyNo, setSearchPropertyNo, wardOptions, isFetchingWards,
    sanitizeWardNo, sanitizePropertyNo, handleWardChange, handleSearchProperties, isApplyingSameAs, handleApplySameAsDetails,
    filterPropertiesForTable, sourcePropertyIds, typeWiseLockedPropertyIds, activeLockedPropertyIds, handleTogglePropertySelection,
    handleToggleMultipleProperties,
    handleClearPropertySelection, changeTypeInput, setChangeTypeInput,
    isApplyingTypeSubmission, handleApplyTypeSubmission,
  };
}
