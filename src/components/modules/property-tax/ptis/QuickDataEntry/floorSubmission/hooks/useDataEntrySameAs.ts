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
import { getWardListAction, getPropertyListByWardAction } from '@/app/[locale]/property-tax/ptis/actions';
import {
  DATA_ENTRY_SAME_AS_FILTER_TYPES,
  normalizePartitionNo,
  getDataEntrySameAsType,
  getNumericDataEntrySameAsId,
} from '../components/sameAsUtils';

interface UseDataEntrySameAsProps {
  isOpen: boolean;
  wardId?: string | number;
  propertyNo?: string;
  partitionNo?: string;
  initialPropertyID?: string | number;
  t: (key: string, values?: Record<string, string | number | Date>) => string;
}

function comparePartitionNo(a: SelectableProperty, b: SelectableProperty): number {
  return String(a.partitionNo ?? '').localeCompare(String(b.partitionNo ?? ''), undefined, {
    numeric: true,
    sensitivity: 'base',
  });
}


export function useDataEntrySameAs({ isOpen, wardId, propertyNo, partitionNo, initialPropertyID, t }: UseDataEntrySameAsProps) {
  const router = useRouter();
  const routeParams = useParams();
  const locale = String(routeParams?.locale || 'en');
  const { confirm } = useConfirm();
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
  const [propertyOptions, setPropertyOptions] = React.useState<SearchSelectOption[]>([]);
  const [isFetchingProperties, setIsFetchingProperties] = React.useState(false);
  const [changeTypeInput, setChangeTypeInput] = React.useState<string>('');

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
      if (res.success && res.data) setWardOptions(res.data.map((w) => ({ label: w.wardNo || '', value: String(w.wardId) })));
    } catch {} finally { setIsFetchingWards(false); }
  }, []);

  const loadPropertiesForWard = React.useCallback(async (wId: number) => {
    setIsFetchingProperties(true);
    try {
      const res = await getPropertyListByWardAction(wId);
      if (res.success && res.data) {
        const uniqueNos = Array.from(new Set(res.data.map((p) => p.propertyNo).filter(Boolean)))
          .sort((a, b) => a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' }));
        setPropertyOptions(uniqueNos.map((pNo) => ({ label: pNo, value: pNo })));
      } else setPropertyOptions([]);
    } catch { setPropertyOptions([]); } finally { setIsFetchingProperties(false); }
  }, []);

  const handleWardChange = React.useCallback(async (_name: string | undefined, value: string) => {
    setSearchWardId(value);
    setSearchPropertyNo('');
    setSelectableProperties([]);
    setSelectedPropertyIds(new Set());
    if (Number(value)) await loadPropertiesForWard(Number(value));
    else setPropertyOptions([]);
  }, [loadPropertiesForWard]);

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
    if (!isOpen) return;
    const initData = async () => {
      setSearchWardId(wardId ? String(wardId) : '');
      setSearchPropertyNo(propertyNo || '');
      setSelectableProperties([]);
      setSelectedPropertyIds(new Set());
      setChangeTypeInput(''); // Reset on drawer open
      setIsLoadingProperties(true);
      if (wardOptions.length === 0) await loadWards();
      if (Number(wardId) && propertyOptions.length === 0) await loadPropertiesForWard(Number(wardId));
      if (Number(wardId) && propertyNo?.trim()) {
        try {
          const results = await fetchDataEntrySameAsAction(Number(wardId), propertyNo.trim());
          setSelectableProperties(results);
        } finally { setIsLoadingProperties(false); }
      } else setIsLoadingProperties(false);
    };
    initData();
  }, [isOpen, wardId, propertyNo, wardOptions.length, propertyOptions.length, loadWards, loadPropertiesForWard]);

  const filterPropertiesForTable = React.useCallback((properties: SelectableProperty[], includeCurrentPartition = false) => {
    return properties
      .filter(p => p.partitionNo && p.partitionNo !== '-')
      .filter(p => includeCurrentPartition || normalizePartitionNo(p.partitionNo) !== normalizePartitionNo(partitionNo))
      .map(p => {
        const wardOpt = wardOptions.find(o => o.value === String(p.wardId));
        return { ...p, wardNo: wardOpt ? wardOpt.label : '-' };
      })
      .sort(comparePartitionNo);
  }, [partitionNo, wardOptions]);

  const sourcePropertyIds = React.useMemo(() => {
    const sourceProperty = selectableProperties.find((p) => normalizePartitionNo(p.partitionNo) === normalizePartitionNo(partitionNo));
    return sourceProperty ? new Set<string | number>([sourceProperty.id]) : new Set<string | number>();
  }, [partitionNo, selectableProperties]);

  const typeWiseLockedPropertyIds = React.useMemo(() => {
    return new Set<string | number>(sourcePropertyIds);
  }, [sourcePropertyIds]);

  const activeLockedPropertyIds = dataEntrySameAsTab === 'type-wise' ? typeWiseLockedPropertyIds : sourcePropertyIds;

  const effectiveSelectedPropertyIds = selectedPropertyIds;

  const handleDataEntrySameAsTabChange = React.useCallback((tab: string) => {
    setDataEntrySameAsTab(tab);
    setSelectedPropertyIds(new Set(sourcePropertyIds));
    setChangeTypeInput(''); // Reset on tab change
  }, [sourcePropertyIds]);

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
    const sourceProperty = selectableProperties.find((p) => normalizePartitionNo(p.partitionNo) === normalizePartitionNo(partitionNo));
    const sourcePropertyId = getNumericDataEntrySameAsId(sourceProperty?.id);
    if (!sourcePropertyId) {
      toast.error(t('floor.selectProperties.sourcePropertyNotFound', { partitionNo: partitionNo || '-' }));
      return;
    }

    // Check if the source property is selected (checked) by the user
    const isSourceSelected = effectiveSelectedPropertyIds.has(String(sourcePropertyId)) || 
                             effectiveSelectedPropertyIds.has(Number(sourcePropertyId)) ||
                             (sourceProperty?.id !== undefined && (
                               effectiveSelectedPropertyIds.has(String(sourceProperty.id)) ||
                               effectiveSelectedPropertyIds.has(Number(sourceProperty.id))
                             ));

    // Calculate destination property IDs (excluding sourcePropertyId)
    const destinationPropertyIds = Array.from(effectiveSelectedPropertyIds).map(Number)
      .filter((id) => (
        Number.isFinite(id) && 
        id > 0 && 
        id !== sourcePropertyId && 
        id !== Number(sourceProperty?.id) &&
        (!currentPropertyId || id !== currentPropertyId)
      ));

    // If neither source property nor any destination property is selected, show error
    if (destinationPropertyIds.length === 0 && !isSourceSelected) {
      toast.error(t('floor.selectProperties.selectDestinationProperty'));
      return;
    }

    setIsApplyingSameAs(true);
    try {
      const newType = getDataEntrySameAsType(changeTypeInput || currentPropertyType) ?? 0;
      const promises: Promise<any>[] = [];

      // 1. If source property is selected, update its type directly in the database!
      if (isSourceSelected) {
        promises.push((async () => {
          // Fetch current basic details of source property
          const basicDetails = await getPropertyBasicDetailsAction(sourcePropertyId);
          if (!basicDetails) {
            return { success: false, error: 'Could not fetch source property details' };
          }
          // Modify only the propertyTypeId
          const updatedPayload = {
            ...basicDetails,
            propertyTypeId: newType
          };
          // Call the action to save it
          return await updatePropertyBasicDetailsAction(locale, sourcePropertyId, updatedPayload);
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
        promises.push(applyDataEntrySameAsAction(payload));
      }

      const originalProperties = [...selectableProperties];

      // Optimistic UI update based on user requirement to see changes immediately
      if (dataEntrySameAsTab === 'type-wise') {
        const updatedIds = new Set(destinationPropertyIds);
        setSelectableProperties((prev) => prev.map((p) => {
          if (updatedIds.has(Number(p.id)) || (isSourceSelected && Number(p.id) === sourcePropertyId)) {
            return { ...p, type: changeTypeInput || currentPropertyType, typeLabel: changeTypeInput || currentPropertyType };
          }
          return p;
        }));
      } else setSelectedPropertyIds(new Set(sourcePropertyIds));
      
      const results = await Promise.all(promises);
      const failedResult = results.find(r => !r.success);

      if (!failedResult) {
        toast.success(t('floor.selectProperties.applySuccess'));
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
  }, [partitionNo, selectableProperties, effectiveSelectedPropertyIds, dataEntrySameAsTab, t, router, changeTypeInput, currentPropertyType, currentPropertyId, sourcePropertyIds, locale]);

  const handleApplyTypeSubmission = React.useCallback(async () => {
    const sourceProperty = selectableProperties.find((p) => normalizePartitionNo(p.partitionNo) === normalizePartitionNo(partitionNo));
    const sourcePropertyId = getNumericDataEntrySameAsId(sourceProperty?.id);
    if (!sourcePropertyId) {
      toast.error(t('floor.selectProperties.sourcePropertyNotFound', { partitionNo: partitionNo || '-' }));
      return;
    }
    const destinationPropertyIds = Array.from(effectiveSelectedPropertyIds).map(Number)
      .filter((id) => (
        Number.isFinite(id) && 
        id > 0 && 
        id !== sourcePropertyId && 
        id !== Number(sourceProperty?.id) &&
        (!currentPropertyId || id !== currentPropertyId)
      ));
    if (destinationPropertyIds.length === 0) {
      toast.error(t('floor.selectProperties.selectDestinationProperty'));
      return;
    }

    const isSourceSelected = effectiveSelectedPropertyIds.has(String(sourcePropertyId)) || 
                             effectiveSelectedPropertyIds.has(Number(sourcePropertyId)) ||
                             (sourceProperty?.id !== undefined && (
                               effectiveSelectedPropertyIds.has(String(sourceProperty.id)) ||
                               effectiveSelectedPropertyIds.has(Number(sourceProperty.id))
                             ));

    const executeSubmission = async () => {
      setIsApplyingTypeSubmission(true);
      try {
        // Optimistic UI update based on user requirement to see changes immediately
        const updatedIds = new Set(destinationPropertyIds);
        setSelectableProperties((prev) => prev.map((p) => {
          if (updatedIds.has(Number(p.id))) {
            return {
              ...p,
              carpetAreaSqFeet: sourceProperty?.carpetAreaSqFeet ?? p.carpetAreaSqFeet,
              carpetAreaSqMeter: sourceProperty?.carpetAreaSqMeter ?? p.carpetAreaSqMeter,
            };
          }
          return p;
        }));

        const [resParking, resPropertywise] = await Promise.all([
          applyDataEntrySameAsAction({
            sourcePropertyId,
            destinationPropertyIds,
            filterType: "PARKING",
            type: 1
          }),
          applyDataEntrySameAsAction({
            sourcePropertyId,
            destinationPropertyIds,
            filterType: "PROPERTYWISE",
            type: 1
          })
        ]);
        
        if (resParking.success && resPropertywise.success) {
          toast.success(t('floor.selectProperties.applySuccess'));
          router.refresh();
        } else {
          toast.error(resParking.error || resPropertywise.error || t('floor.selectProperties.unknownError'));
        }
      } catch (error) {
        toast.error(error instanceof Error ? error.message : t('floor.selectProperties.unknownError'));
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
  }, [partitionNo, selectableProperties, effectiveSelectedPropertyIds, t, router, currentPropertyId, confirm]);

  return {
    dataEntrySameAsTab, setDataEntrySameAsTab: handleDataEntrySameAsTabChange, selectableProperties, selectedPropertyIds: effectiveSelectedPropertyIds, isLoadingProperties, currentPropertyType,
    searchWardId, searchPropertyNo, setSearchPropertyNo, wardOptions, isFetchingWards, propertyOptions, isFetchingProperties,
    sanitizeWardNo, sanitizePropertyNo, handleWardChange, handleSearchProperties, isApplyingSameAs, handleApplySameAsDetails,
    filterPropertiesForTable, sourcePropertyIds, typeWiseLockedPropertyIds, activeLockedPropertyIds, handleTogglePropertySelection,
    handleToggleMultipleProperties,
    handleClearPropertySelection, changeTypeInput, setChangeTypeInput,
    isApplyingTypeSubmission, handleApplyTypeSubmission,
  };
}




