import React from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { type SearchSelectOption } from '@/components/common';
import {
  fetchDataEntrySameAsAction,
  applyDataEntrySameAsAction,
  type SelectableProperty,
} from '@/app/[locale]/property-tax/ptis/QuickDataEntry/[propertyId]/FloorSubmission/actions';
import { getWardListAction, getPropertyListByWardAction } from '@/app/[locale]/property-tax/ptis/actions';
import {
  DATA_ENTRY_SAME_AS_FILTER_TYPES,
  normalizePartitionNo,
  normalizeDataEntrySameAsType,
  getDataEntrySameAsType,
  getNumericDataEntrySameAsId,
  getDataEntrySameAsTypeLabel,
} from './sameAsUtils';

interface UseDataEntrySameAsProps {
  isOpen: boolean;
  wardId?: string | number;
  propertyNo?: string;
  partitionNo?: string;
  t: (key: string, values?: Record<string, string | number | Date>) => string;
}

export function useDataEntrySameAs({ isOpen, wardId, propertyNo, partitionNo, t }: UseDataEntrySameAsProps) {
  const router = useRouter();
  const [dataEntrySameAsTab, setDataEntrySameAsTab] = React.useState('type-wise');
  const [selectableProperties, setSelectableProperties] = React.useState<SelectableProperty[]>([]);
  const [selectedPropertyIds, setSelectedPropertyIds] = React.useState<Set<string | number>>(new Set());
  const [isLoadingProperties, setIsLoadingProperties] = React.useState(false);
  const [isApplyingSameAs, setIsApplyingSameAs] = React.useState(false);
  const [searchWardId, setSearchWardId] = React.useState(wardId ? String(wardId) : '');
  const [searchPropertyNo, setSearchPropertyNo] = React.useState(propertyNo || '');
  const [wardOptions, setWardOptions] = React.useState<SearchSelectOption[]>([]);
  const [isFetchingWards, setIsFetchingWards] = React.useState(false);
  const [propertyOptions, setPropertyOptions] = React.useState<SearchSelectOption[]>([]);
  const [isFetchingProperties, setIsFetchingProperties] = React.useState(false);

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
    setSearchWardId(wardId ? String(wardId) : '');
    setSearchPropertyNo(propertyNo || '');
    setSelectableProperties([]);
    setSelectedPropertyIds(new Set());
    const initData = async () => {
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
        const wardOpt = wardOptions.find(o => o.value === String(p.wardNo));
        return { ...p, wardNo: wardOpt ? wardOpt.label : p.wardNo };
      });
  }, [partitionNo, wardOptions]);

  const sourcePropertyIds = React.useMemo(() => {
    const sourceProperty = selectableProperties.find((p) => normalizePartitionNo(p.partitionNo) === normalizePartitionNo(partitionNo));
    return sourceProperty ? new Set<string | number>([sourceProperty.id]) : new Set<string | number>();
  }, [partitionNo, selectableProperties]);

  const typeWiseLockedPropertyIds = React.useMemo(() => {
    const currentType = normalizeDataEntrySameAsType(currentPropertyType);
    if (!currentType) return new Set<string | number>(sourcePropertyIds);
    const matchingPropertyIds = filterPropertiesForTable(selectableProperties, true)
      .filter((p) => normalizeDataEntrySameAsType(p.type) === currentType)
      .map((p) => p.id);
    return new Set<string | number>([...sourcePropertyIds, ...matchingPropertyIds]);
  }, [currentPropertyType, filterPropertiesForTable, selectableProperties, sourcePropertyIds]);

  const activeLockedPropertyIds = dataEntrySameAsTab === 'type-wise' ? typeWiseLockedPropertyIds : sourcePropertyIds;

  React.useEffect(() => {
    if (isOpen) setSelectedPropertyIds(new Set(activeLockedPropertyIds));
  }, [activeLockedPropertyIds, isOpen]);

  const handleTogglePropertySelection = React.useCallback((id: string | number) => {
    if (activeLockedPropertyIds.has(id)) return;
    setSelectedPropertyIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, [activeLockedPropertyIds]);

  const handleClearPropertySelection = React.useCallback(() => setSelectedPropertyIds(new Set(activeLockedPropertyIds)), [activeLockedPropertyIds]);

  const handleApplySameAsDetails = React.useCallback(async () => {
    const sourceProperty = selectableProperties.find((p) => normalizePartitionNo(p.partitionNo) === normalizePartitionNo(partitionNo));
    const sourcePropertyId = getNumericDataEntrySameAsId(sourceProperty?.id);
    if (!sourcePropertyId) {
      toast.error(t('floor.selectProperties.sourcePropertyNotFound', { partitionNo: partitionNo || '-' }));
      return;
    }
    const destinationPropertyIds = Array.from(selectedPropertyIds).map(Number)
      .filter((id) => (Number.isFinite(id) && id > 0 && id !== sourcePropertyId && id !== Number(sourceProperty?.id)));
    if (destinationPropertyIds.length === 0) {
      toast.error(t('floor.selectProperties.selectDestinationProperty'));
      return;
    }
    setIsApplyingSameAs(true);
    try {
      const payload = { sourcePropertyId, destinationPropertyIds, filterType: DATA_ENTRY_SAME_AS_FILTER_TYPES[dataEntrySameAsTab] ?? dataEntrySameAsTab.toUpperCase(), type: dataEntrySameAsTab === 'property-wise' ? 0 : (getDataEntrySameAsType(sourceProperty?.type) ?? 0) };
      const res = await applyDataEntrySameAsAction(payload);
      if (res.success && res.data) {
        if (Number(res.data.processedDestinations) <= 0) {
          toast.error(t('floor.selectProperties.noDestinationProcessed'));
          return;
        }
        toast.success(t('floor.selectProperties.applySuccess'));
        if (dataEntrySameAsTab === 'type-wise') {
          const updatedIds = new Set(destinationPropertyIds);
          setSelectableProperties((prev) => prev.map((p) => updatedIds.has(Number(p.id)) ? { ...p, type: sourceProperty?.type ?? p.type, typeLabel: sourceProperty?.typeLabel ?? p.typeLabel } : p));
        } else setSelectedPropertyIds(new Set());
        router.refresh();
      } else toast.error(res.error || t('floor.selectProperties.applyFailed'));
    } catch (error) {
      toast.error(error instanceof Error ? error.message : t('floor.selectProperties.unknownError'));
    } finally { setIsApplyingSameAs(false); }
  }, [partitionNo, selectableProperties, selectedPropertyIds, dataEntrySameAsTab, t, router]);

  return {
    dataEntrySameAsTab, setDataEntrySameAsTab, selectableProperties, selectedPropertyIds, isLoadingProperties, currentPropertyType,
    searchWardId, searchPropertyNo, setSearchPropertyNo, wardOptions, isFetchingWards, propertyOptions, isFetchingProperties,
    sanitizeWardNo, sanitizePropertyNo, handleWardChange, handleSearchProperties, isApplyingSameAs, handleApplySameAsDetails,
    filterPropertiesForTable, sourcePropertyIds, typeWiseLockedPropertyIds, activeLockedPropertyIds, handleTogglePropertySelection,
    handleClearPropertySelection,
  };
}
