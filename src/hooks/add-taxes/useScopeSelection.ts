import { useState, useEffect } from 'react';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { logger } from '@/lib/utils/logger';
import { Scope, OperationScope, ExecuteOperationPayload, OperationPreviewPayload, OperationPreviewResponse } from '@/types/addTaxes.types';
import type { ScopeOptionItem, EligibleCountPayload, SearchPropertyItem } from '@/types/addTaxes.types';
import { fetchAllWardsAction, searchPropertiesAction, getEligibleCountAction, executeOperationAction, previewOperationAction, fetchAssessmentStatusesAction } from '@/app/[locale]/property-tax/add-taxes/actions';
import type { PropertyAssessmentStatus } from '@/types/property-assessment-status.types';
import { toast } from 'sonner';
import { useTranslations } from 'next-intl';

interface WardOption {
  value: string;
  label: string;
  zoneId: string;
}

interface BuildingOption {
  value: string;
  label: string;
  propertyNo: string;
}

export function useScopeSelection(
  selectedScope: Scope,
  selectionData: Record<string, string[]>,
  currentScopeData: ScopeOptionItem | undefined,
  propertyTypeOptions: { value: string; label: string }[],
  isInitialized: boolean,
  onStartExecution?: (jobId: string, totalCount: number, scheduledTime?: string) => void
) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const t = useTranslations('addTaxes');

  const [isValidated, setIsValidated] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isCalculating, setIsCalculating] = useState(false);
  const [eligibleCount, setEligibleCount] = useState<number | null>(null);

  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false);
  const [previewData, setPreviewData] = useState<OperationPreviewResponse | null>(null);
  const [isPreviewLoading, setIsPreviewLoading] = useState(false);

  const pageParam = searchParams.get('previewPage');
  const pageSizeParam = searchParams.get('previewPageSize');

  const previewPage = pageParam ? Number(pageParam) : 1;
  const previewPageSize = pageSizeParam ? Number(pageSizeParam) : 5;

  const setPreviewPage = (page: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('previewPage', String(page));
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  };

  const setPreviewPageSize = (size: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('previewPage', '1');
    params.set('previewPageSize', String(size));
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  };

  const [fetchedWards, setFetchedWards] = useState<WardOption[]>([]);
  const [isFetchingWards, setIsFetchingWards] = useState(false);

  const [fetchedBuildings, setFetchedBuildings] = useState<BuildingOption[]>([]);
  const [isFetchingBuildings, setIsFetchingBuildings] = useState(false);

  const [fetchedAssessmentStatuses, setFetchedAssessmentStatuses] = useState<{ value: string; label: string }[]>([]);
  const [isFetchingAssessmentStatuses, setIsFetchingAssessmentStatuses] = useState(false);

  const handleCalculateEligible = async () => {
    setIsCalculating(true);
    setIsValidated(false);
    try {
      const zoneIds = searchParams.get('zoneid');
      const wardIds = searchParams.get('wardid');
      const propertyTypeId = searchParams.get('PropertyTypeId') || searchParams.get('propertyTypeId') || searchParams.get('propertytypeid') || searchParams.get('TypeOfUseGroupId');
      const assessmentStatusIds = searchParams.get('assessmentStatusIds');

      // Validate required fields before calculating
      let isConfigValid = false;
      if (selectedScope === 'zone') {
        isConfigValid = !!zoneIds;
      } else if (selectedScope === 'ward') {
        isConfigValid = !!zoneIds && !!wardIds;
      } else if (selectedScope === 'building') {
        const propertyIds = searchParams.get('propertyid');
        isConfigValid = !!zoneIds && !!wardIds && !!propertyIds;
      } else if (selectedScope === 'property') {
        const propertyIds = searchParams.get('propertyid');
        const searchText = searchParams.get('searchText') || searchParams.get('SearchText') || (selectionData['Search Property'] || [])[0];
        isConfigValid = !!propertyIds || !!searchText;
      } else if (selectedScope === 'range') {
        const fromPropNo = searchParams.get('fromPropertyNo');
        const toPropNo = searchParams.get('toPropertyNo');
        isConfigValid = !!wardIds && !!fromPropNo && !!toPropNo;
      }

      if (!isConfigValid) {
        toast.error(t('messages.fillRequiredFields'));
        setIsCalculating(false);
        return;
      }

      if (selectedScope === 'range') {
        const fromPropId = searchParams.get('fromPropertyId');
        const toPropId = searchParams.get('toPropertyId');

        const fromIndex = fetchedBuildings.findIndex(b => b.value === fromPropId);
        const toIndex = fetchedBuildings.findIndex(b => b.value === toPropId);

        if (fromIndex !== -1 && toIndex !== -1 && toIndex < fromIndex) {
          toast.error(t('messages.invalidRange'));
          setIsCalculating(false);
          return;
        }
      }

      const scopeData: OperationScope = {};
      if (zoneIds) {
        scopeData.zoneIds = zoneIds.split(',').map(Number);
      } else if (wardIds) {
        const wIds = wardIds.split(',');
        const parentZoneIds = wIds.map(id => {
          const w = fetchedWards.find(x => x.value === id);
          return w ? Number(w.zoneId) : null;
        }).filter(Boolean) as number[];
        scopeData.zoneIds = Array.from(new Set(parentZoneIds));
      }

      if (wardIds) scopeData.wardIds = wardIds.split(',').map(Number);
      if (propertyTypeId && propertyTypeId !== 'select-all') {
        const ptIds = propertyTypeId
          .split(',')
          .map((x) => Number(x))
          .filter(Number.isFinite);
        if (ptIds.length > 0) {
          scopeData.propertyTypeIds = ptIds;
          scopeData.propertyTypeId = ptIds[0];
        }
      }
      if (assessmentStatusIds) {
        scopeData.assessmentStatusIds = assessmentStatusIds.split(',').map(Number);
      }

      if (selectedScope === 'property') {
        scopeData.propertyIds = [];
        const propertyIds = searchParams.get('propertyid');
        if (propertyIds) {
          scopeData.propertyIds = propertyIds.split(',').map(Number).filter(Number.isFinite);
        }

        const searchText = searchParams.get('searchText') || searchParams.get('SearchText');
        if (searchText) {
          scopeData.searchText = searchText;
        } else {
          scopeData.searchText = '';
        }
      }

      if (selectedScope === 'building') {
        const propertyIds = searchParams.get('propertyid');
        if (propertyIds) {
          scopeData.propertyIds = propertyIds.split(',').map(Number).filter(Number.isFinite);
        } else {
          scopeData.propertyIds = [];
        }
        const buildingNo = searchParams.get('propertyno');
        if (buildingNo) scopeData.building = buildingNo;
      }

      if (selectedScope === 'range') {
        const fromPropId = searchParams.get('fromPropertyId');
        if (fromPropId) scopeData.fromPropertyId = Number(fromPropId);
        const toPropId = searchParams.get('toPropertyId');
        if (toPropId) scopeData.toPropertyId = Number(toPropId);

        const fromPropNo = searchParams.get('fromPropertyNo');
        if (fromPropNo) scopeData.fromPropertyNo = fromPropNo;
        const toPropNo = searchParams.get('toPropertyNo');
        if (toPropNo) scopeData.toPropertyNo = toPropNo;
      }

      const financeYearVal = searchParams.get('financeYearId') || searchParams.get('financeYear') || '1';
      const financeYearId = isNaN(Number(financeYearVal)) ? financeYearVal : Number(financeYearVal);
      const operation = 'addTax';

      const payload: EligibleCountPayload = {
        financeYearId,
        scopeType: selectedScope,
        scope: scopeData,
        operation
      };

      const response = await getEligibleCountAction(payload);
      if (response) {
        setEligibleCount(response.eligible);
      } else {
        setEligibleCount(0);
      }
      setIsValidated(true);
    } catch (error) {
      logger.error('Failed to calculate eligible count', { error: error as Error });
      setEligibleCount(0);
      setIsValidated(false);
    } finally {
      setIsCalculating(false);
    }
  };

  const executeJob = async (isScheduled: boolean, scheduledDateTime?: string) => {
    setIsCalculating(true);
    try {
      let zoneIds = selectionData['Zone']?.map(Number) || searchParams.get('zoneid')?.split(',').map(Number) || [];
      const wardIds = selectionData['Ward']?.map(Number) || searchParams.get('wardid')?.split(',').map(Number) || [];

      if (zoneIds.length === 0 && wardIds.length > 0) {
        const parentZoneIds = wardIds.map(id => {
          const w = fetchedWards.find(x => x.value === String(id));
          return w ? Number(w.zoneId) : null;
        }).filter(Boolean) as number[];
        zoneIds = Array.from(new Set(parentZoneIds));
      }

      const propertyTypeIdVal = selectionData['Property Type'] || searchParams.get('PropertyTypeId')?.split(',') || [];
      const propertyTypeIds = propertyTypeIdVal.filter(x => x !== 'select-all').map(Number);

      const assessmentStatusVal = selectionData['Assessment Status'] || searchParams.get('assessmentStatusIds')?.split(',') || [];
      const assessmentStatusIds = assessmentStatusVal.map(Number);

      const scopeData: OperationScope = {};
      if (selectedScope === 'zone') {
        scopeData.zoneIds = zoneIds;
      } else if (selectedScope === 'ward') {
        scopeData.zoneIds = zoneIds;
        scopeData.wardIds = wardIds;
      } else if (selectedScope === 'building') {
        scopeData.zoneIds = zoneIds;
        scopeData.wardIds = wardIds;
        const buildingNo = searchParams.get('propertyno');
        if (buildingNo) scopeData.building = buildingNo;
        const propertyIdsStr = searchParams.get('propertyid');
        if (propertyIdsStr) scopeData.propertyIds = propertyIdsStr.split(',').map(Number);
      } else if (selectedScope === 'property') {
        scopeData.propertyIds = [];
        const propertyIdsStr = searchParams.get('propertyid');
        if (propertyIdsStr) {
          scopeData.propertyIds = propertyIdsStr.split(',').map(Number).filter(Number.isFinite);
        }
        const searchText = searchParams.get('searchText') || searchParams.get('SearchText');
        if (searchText) {
          scopeData.searchText = searchText;
        } else {
          scopeData.searchText = '';
        }
      } else if (selectedScope === 'range') {
        scopeData.wardIds = wardIds;
        const fromPropId = searchParams.get('fromPropertyId');
        if (fromPropId) scopeData.fromPropertyId = Number(fromPropId);
        const toPropId = searchParams.get('toPropertyId');
        if (toPropId) scopeData.toPropertyId = Number(toPropId);

        // Keep propertyIds as well in case the backend still relies on it
        const rangeIds = [scopeData.fromPropertyId, scopeData.toPropertyId].filter(
          (v): v is number => typeof v === 'number' && Number.isFinite(v)
        );
        if (rangeIds.length > 0) scopeData.propertyIds = rangeIds;

        const fromPropNo = searchParams.get('fromPropertyNo');
        if (fromPropNo) scopeData.fromPropertyNo = fromPropNo;
        const toPropNo = searchParams.get('toPropertyNo');
        if (toPropNo) scopeData.toPropertyNo = toPropNo;
      }

      if (propertyTypeIds.length > 0) {
        scopeData.propertyTypeId = propertyTypeIds[0];
        scopeData.propertyTypeIds = propertyTypeIds;
      }
      if (assessmentStatusIds.length > 0) {
        scopeData.assessmentStatusIds = assessmentStatusIds;
      }

      const currentFy = searchParams.get('financeYearId') || searchParams.get('financeYear');
      const financeYearId = currentFy ? Number(currentFy) : 1;

      const payload: ExecuteOperationPayload = {
        financeYearId,
        operation: 'addTax',
        scopeType: selectedScope,
        scope: scopeData,
        options: {
          previewBeforeExecute: true,
          isScheduled,
          ...(scheduledDateTime ? { scheduledDateTime } : {})
        }
      };

      const response = await executeOperationAction(payload);
      if (response && response.items && response.items.jobId) {
        setIsModalOpen(false);
        if (isScheduled) {
          toast.success(t('messages.jobScheduled', { jobId: response.items.jobId }));
          if (onStartExecution) {
            onStartExecution(response.items.jobId, response.items.summary.total, scheduledDateTime);
          }
        } else {
          toast.success(t('messages.executionStarted', { jobId: response.items.jobId }));
          if (onStartExecution) {
            onStartExecution(response.items.jobId, response.items.summary.total);
          }
        }
      } else {
        toast.error(response?.error || t('messages.failedExecute'));
      }
    } catch (e) {
      logger.error('Failed to execute operation', { error: e as Error });
      toast.error(t('messages.errorExecution'));
    } finally {
      setIsCalculating(false);
    }
  };

  const handlePreview = async (targetPage?: number, targetPageSize?: number) => {
    setIsPreviewLoading(true);
    try {
      const p = targetPage ?? previewPage;
      const size = targetPageSize ?? previewPageSize;

      let zoneIds = selectionData['Zone']?.map(Number) || searchParams.get('zoneid')?.split(',').map(Number) || [];
      const wardIds = selectionData['Ward']?.map(Number) || searchParams.get('wardid')?.split(',').map(Number) || [];

      if (zoneIds.length === 0 && wardIds.length > 0) {
        const parentZoneIds = wardIds.map(id => {
          const w = fetchedWards.find(x => x.value === String(id));
          return w ? Number(w.zoneId) : null;
        }).filter(Boolean) as number[];
        zoneIds = Array.from(new Set(parentZoneIds));
      }
      const propertyTypeIdVal = selectionData['Property Type']?.[0];
      const propertyTypeId = propertyTypeIdVal && propertyTypeIdVal !== 'select-all' ? Number(propertyTypeIdVal) : undefined;

      const scopeData: OperationScope = {};
      if (selectedScope === 'zone') {
        scopeData.zoneIds = zoneIds;
      } else if (selectedScope === 'ward') {
        scopeData.zoneIds = zoneIds;
        scopeData.wardIds = wardIds;
        if (propertyTypeId) scopeData.propertyTypeId = propertyTypeId;
      } else if (selectedScope === 'building') {
        scopeData.zoneIds = zoneIds;
        scopeData.wardIds = wardIds;
        const buildingNo = searchParams.get('propertyno');
        if (buildingNo) scopeData.building = buildingNo;
        const propertyIdsStr = searchParams.get('propertyid');
        if (propertyIdsStr) scopeData.propertyIds = propertyIdsStr.split(',').map(Number);
      } else if (selectedScope === 'property') {
        scopeData.propertyIds = [];
        const rawText = (selectionData['Search Property'] || [])[0] || '';
        if (rawText && !/^\d+$/.test(rawText)) {
          scopeData.searchText = rawText;
        } else if (rawText) {
          scopeData.propertyIds = [Number(rawText)];
          scopeData.searchText = '';
        } else {
          scopeData.searchText = '';
        }
      } else if (selectedScope === 'range') {
        scopeData.wardIds = wardIds;
        const fromPropId = searchParams.get('fromPropertyId');
        if (fromPropId) scopeData.fromPropertyId = Number(fromPropId);
        const toPropId = searchParams.get('toPropertyId');
        if (toPropId) scopeData.toPropertyId = Number(toPropId);

        // Keep propertyIds as well in case the backend still relies on it
        const rangeIds = [scopeData.fromPropertyId, scopeData.toPropertyId].filter(
          (v): v is number => typeof v === 'number' && Number.isFinite(v)
        );
        if (rangeIds.length > 0) scopeData.propertyIds = rangeIds;

        const fromPropNo = searchParams.get('fromPropertyNo');
        if (fromPropNo) scopeData.fromPropertyNo = fromPropNo;
        const toPropNo = searchParams.get('toPropertyNo');
        if (toPropNo) scopeData.toPropertyNo = toPropNo;
      }

      const currentFy = searchParams.get('financeYearId') || searchParams.get('financeYear');
      const financeYearId = currentFy ? Number(currentFy) : 1;

      const payload: OperationPreviewPayload = {
        pageNumber: p,
        pageSize: size,
        searchTerm: '',
        sortBy: '',
        sortOrder: '',
        filterLogic: 0,
        financeYearId,
        scopeType: selectedScope,
        scope: scopeData,
        operation: 'addTax'
      };

      const result = await previewOperationAction(payload);
      if (result && !result.error) {
        setPreviewData(result);
        setIsPreviewModalOpen(true);
      } else {
        toast.error(result?.error || t('messages.failedPreview'));
      }
    } catch (e) {
      logger.error('Failed to preview operation', { error: e as Error });
      toast.error(t('messages.errorPreview'));
    } finally {
      setIsPreviewLoading(false);
    }
  };

  useEffect(() => {
    if (isPreviewModalOpen) {
      const timer = setTimeout(() => {
        handlePreview(previewPage, previewPageSize);
      }, 0);
      return () => clearTimeout(timer);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [previewPage, previewPageSize, isPreviewModalOpen]);

  const fetchBuildings = async (zoneIds: string[] | null, wardIds: string[]) => {
    if (wardIds.length === 0 || isFetchingBuildings) return;
    setIsFetchingBuildings(true);
    try {
      const zId = zoneIds && zoneIds.length > 0 ? zoneIds[0] : null;
      const res = await searchPropertiesAction(zId, wardIds[0]);
      if (res?.items?.items) {
        const buildings: BuildingOption[] = res.items.items.map((b: SearchPropertyItem) => {
          const part = b.partitionNo?.trim();
          const hasPart = part && part !== '0';
          return {
            value: b.propertyId.toString(),
            label: hasPart ? `${b.propertyNo}-${part}` : b.propertyNo,
            propertyNo: b.propertyNo
          };
        });
        setFetchedBuildings(buildings);
      }
    } catch (e) {
      logger.error('Failed to fetch buildings', { error: e as Error });
    } finally {
      setIsFetchingBuildings(false);
    }
  };

  const fetchWards = async () => {
    if (fetchedWards.length > 0 || isFetchingWards) return;
    setIsFetchingWards(true);
    try {
      const res = await fetchAllWardsAction();
      if (res?.data) {
        const wards: WardOption[] = (res.data as Array<{ id: number; description?: string; wardNo?: string; zoneId?: number }>).map((w) => ({
          value: w.id.toString(),
          label: w.wardNo || '',
          zoneId: w.zoneId?.toString() ?? ''
        }));
        setFetchedWards(wards);
      }
    } catch (e) {
      logger.error('Failed to fetch wards', { error: e as Error });
    } finally {
      setIsFetchingWards(false);
    }
  };

  const fetchAssessmentStatuses = async () => {
    if (fetchedAssessmentStatuses.length > 0 || isFetchingAssessmentStatuses) return;
    setIsFetchingAssessmentStatuses(true);
    try {
      const res = await fetchAssessmentStatusesAction();
      if (res?.data) {
        const statuses = res.data.map((item: PropertyAssessmentStatus) => ({
          value: item.id.toString(),
          label: item.statusName
        }));
        setFetchedAssessmentStatuses(statuses);
      }
    } catch (e) {
      logger.error('Failed to fetch assessment statuses', { error: e as Error });
    } finally {
      setIsFetchingAssessmentStatuses(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsValidated(false);
      setEligibleCount(null);
    }, 0);
    return () => clearTimeout(timer);
  }, [selectedScope, selectionData]);

  useEffect(() => {
    if (!isInitialized) {
      return;
    }
    // Avoid race conditions when changing scope
    if (selectedScope !== searchParams.get('scope')) {
      return;
    }

    const params = new URLSearchParams(searchParams.toString());
    let hasChanges = false;

    // Process all selections
    const optionsToRender = selectedScope === 'property' ? ['Search Property'] : (currentScopeData?.options || []);
    for (const option of optionsToRender) {
      const optStr = option.toLowerCase();
      const selectedVals = selectionData[option] || [];

      if (optStr.includes('zone')) {
        const currentZone = params.get('zoneid');
        const newZone = selectedVals.join(',');
        if (selectedVals.length > 0) {
          if (currentZone !== newZone) {
            params.set('zoneid', newZone);
            hasChanges = true;
          }
        } else if (currentZone) {
          params.delete('zoneid');
          hasChanges = true;
        }
      } else if (optStr.includes('ward')) {
        const currentWard = params.get('wardid');
        const currentWardNo = params.get('wardno');
        const newWard = selectedVals.join(',');

        const expectedWardNos = selectedVals.map(id => {
          const ward = fetchedWards.find(w => w.value === id);
          return ward ? ward.label.split(' — ')[0] : id;
        }).join(',');

        if (selectedVals.length > 0) {
          if (currentWard !== newWard || currentWardNo !== expectedWardNos) {
            params.set('wardid', newWard);
            params.set('wardno', expectedWardNos);
            hasChanges = true;
          }
        } else if (currentWard) {
          params.delete('wardid');
          params.delete('wardno');
          hasChanges = true;
        }
      } else if (optStr.includes('property type')) {
        const currentPt = params.get('PropertyTypeId') || params.get('propertyTypeId') || params.get('propertytypeid') || params.get('TypeOfUseGroupId');
        const filteredVals = selectedVals.filter(v => v !== 'select-all');
        const newPt = filteredVals.join(',');

        if (filteredVals.length > 0) {
          if (currentPt !== newPt) {
            params.set('PropertyTypeId', newPt);
            hasChanges = true;
          }
        } else if (currentPt) {
          params.delete('PropertyTypeId');
          hasChanges = true;
        }

        // Clean up PropertyTypeCode and fallback casings
        if (params.has('PropertyTypeCode') || params.has('propertyTypeCode') || params.has('typeOfUseGroupCode')) {
          params.delete('PropertyTypeCode');
          params.delete('propertyTypeCode');
          params.delete('typeOfUseGroupCode');
          hasChanges = true;
        }

        // Clean up alternative casings of PropertyTypeId
        if (params.has('propertyTypeId') || params.has('propertytypeid') || params.has('TypeOfUseGroupId')) {
          params.delete('propertyTypeId');
          params.delete('propertytypeid');
          params.delete('TypeOfUseGroupId');
          hasChanges = true;
        }
      } else if (optStr.includes('property no') || optStr.includes('building')) {
        const currentProp = params.get('propertyid');
        const currentPropNo = params.get('propertyno');
        const newProp = selectedVals.join(',');

        const expectedPropNos = selectedVals.map(id => {
          const b = fetchedBuildings.find(x => x.value === id);
          return b ? b.propertyNo : id;
        }).join(',');

        if (selectedVals.length > 0) {
          if (currentProp !== newProp || currentPropNo !== expectedPropNos) {
            params.set('propertyid', newProp);
            params.set('propertyno', expectedPropNos);
            hasChanges = true;
          }
        } else if (currentProp) {
          params.delete('propertyid');
          params.delete('propertyno');
          hasChanges = true;
        }
      } else if (optStr.includes('from')) {
        const currentFrom = params.get('fromPropertyId');
        const currentFromNo = params.get('fromPropertyNo');
        const newFrom = selectedVals[0] || '';

        let expectedFromNo = '';
        if (newFrom) {
          const b = fetchedBuildings.find(x => x.value === newFrom);
          expectedFromNo = b ? b.propertyNo : newFrom;
        }

        if (newFrom) {
          if (currentFrom !== newFrom || currentFromNo !== expectedFromNo) {
            params.set('fromPropertyId', newFrom);
            params.set('fromPropertyNo', expectedFromNo);
            hasChanges = true;
          }
        } else if (currentFrom) {
          params.delete('fromPropertyId');
          params.delete('fromPropertyNo');
          hasChanges = true;
        }
      } else if (optStr.includes('to')) {
        const currentTo = params.get('toPropertyId');
        const currentToNo = params.get('toPropertyNo');
        const newTo = selectedVals[0] || '';

        let expectedToNo = '';
        if (newTo) {
          const b = fetchedBuildings.find(x => x.value === newTo);
          expectedToNo = b ? b.propertyNo : newTo;
        }

        if (newTo) {
          if (currentTo !== newTo || currentToNo !== expectedToNo) {
            params.set('toPropertyId', newTo);
            params.set('toPropertyNo', expectedToNo);
            hasChanges = true;
          }
        } else if (currentTo) {
          params.delete('toPropertyId');
          params.delete('toPropertyNo');
          hasChanges = true;
        }
      } else if (optStr.includes('assessment status')) {
        const currentAs = params.get('assessmentStatusIds');
        const newAs = selectedVals.join(',');
        if (selectedVals.length > 0) {
          if (currentAs !== newAs) {
            params.set('assessmentStatusIds', newAs);
            hasChanges = true;
          }
        } else if (currentAs) {
          params.delete('assessmentStatusIds');
          hasChanges = true;
        }
      } else if (optStr.includes('search') || optStr.includes('specific')) {
        const currentSearch = params.get('searchText') || params.get('SearchText');
        const newSearch = selectedVals[0] || '';
        if (newSearch) {
          if (currentSearch !== newSearch) {
            params.set('searchText', newSearch);
            params.delete('SearchText');
            hasChanges = true;
          }
        } else if (currentSearch) {
          params.delete('searchText');
          params.delete('SearchText');
          hasChanges = true;
        }
      }
    }

    if (hasChanges) {
      router.replace(`${pathname}?${params.toString()}`, { scroll: false });
    }
  }, [selectionData, currentScopeData, selectedScope, fetchedWards, propertyTypeOptions, fetchedBuildings, searchParams, pathname, router, isInitialized]);

  return {
    isValidated, setIsValidated,
    isModalOpen, setIsModalOpen,
    isCalculating, setIsCalculating,
    eligibleCount, setEligibleCount,
    fetchedWards, fetchWards,
    fetchedBuildings, fetchBuildings,
    fetchedAssessmentStatuses, fetchAssessmentStatuses,
    handleCalculateEligible,
    executeJob,
    isPreviewModalOpen, setIsPreviewModalOpen,
    previewData, setPreviewData,
    isPreviewLoading,
    handlePreview,
    previewPage, setPreviewPage,
    previewPageSize, setPreviewPageSize
  };
}
