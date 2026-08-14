import { useState, useEffect } from 'react';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { logger } from '@/lib/utils/logger';
import { Scope, OperationScope, ExecuteOperationPayload, OperationPreviewPayload, OperationPreviewResponse } from '@/types/addTaxes.types';
import type { ScopeOptionItem, EligibleCountPayload, SearchPropertyItem, SearchPropertiesResponse } from '@/types/addTaxes.types';
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
  partitionNo?: string;
}

interface ZoneResponseItem {
  id: string | number;
  description?: string;
  zoneNo?: string;
}

interface PropertyTypeResponseItem {
  id: string | number;
  propertyDescription?: string;
}

interface SearchByCategoryItem {
  propertyId: string | number;
  propertyNo: string;
  partitionNo?: string | null;
}

interface SearchByCategoryItemsPayload {
  items: SearchByCategoryItem[];
  totalPages?: number;
  totalCount?: number;
}

interface SearchByCategoryResponse {
  items?: SearchByCategoryItemsPayload;
}

interface EligibleCountActionResponse {
  eligible?: number;
}

interface ExecuteOperationActionResponse {
  items?: {
    jobId: string;
    summary: {
      total: number;
    };
  };
  error?: string;
}

type PreviewOperationActionResponse = (OperationPreviewResponse & { error?: string }) | { error: string };

interface WardsActionResponse {
  data?: Array<{ id: number; wardNo?: string; zoneId?: number }>;
}

interface ZonesActionResponse {
  items?: ZoneResponseItem[];
}

interface PropertyTypesActionResponse {
  items?: PropertyTypeResponseItem[];
}

interface AssessmentStatusesActionResponse {
  data?: PropertyAssessmentStatus[];
}

function resolveBuildingScope(
  propertyIdsStr: string | null,
  propertyNoStr: string | null,
  fetchedBuildings: BuildingOption[]
) {
  const propertyIdsList: number[] = [];
  const buildingsList: string[] = [];
  const partitionNosList: string[] = [];

  const splitIds = propertyIdsStr ? propertyIdsStr.split(',') : [];
  const splitNos = propertyNoStr ? propertyNoStr.split(',') : [];

  for (let i = 0; i < splitIds.length; i++) {
    const idVal = Number(splitIds[i]);
    if (Number.isFinite(idVal) && idVal > 0) {
      propertyIdsList.push(idVal);
      const bObj = fetchedBuildings.find(b => b.value === splitIds[i]);
      if (bObj) {
        if (bObj.propertyNo) buildingsList.push(bObj.propertyNo);
        if (bObj.partitionNo) partitionNosList.push(bObj.partitionNo);
      } else {
        if (splitNos[i]) buildingsList.push(splitNos[i]);
      }
    }
  }

  return {
    propertyIds: propertyIdsList,
    building: buildingsList.length > 0 ? buildingsList : undefined,
    partitionNos: partitionNosList.length > 0 ? partitionNosList : undefined
  };
}

export function useScopeSelection(
  selectedScope: Scope,
  selectionData: Record<string, string[]>,
  _currentScopeData: ScopeOptionItem | undefined,
  _propertyTypeOptions: { value: string; label: string }[],
  _isInitialized: boolean,
  onStartExecution: ((jobId: string, totalCount: number, scheduledTime?: string) => void) | undefined,
  actions: {
    fetchAllWardsAction: () => Promise<WardsActionResponse | null>;
    searchPropertiesAction: (zoneId: string | number | null, wardId: string | number) => Promise<SearchPropertiesResponse | null>;
    searchPropertiesByCategoryAction: (searchCategory?: number, wardId?: string | number, pageNumber?: number, pageSize?: number, propertyFrom?: string, propertyTo?: string, zoneId?: string | number) => Promise<SearchByCategoryResponse | null>;
    getEligibleCountAction: (payload: EligibleCountPayload) => Promise<EligibleCountActionResponse | null>;
    executeOperationAction: (payload: ExecuteOperationPayload) => Promise<ExecuteOperationActionResponse | null>;
    previewOperationAction: (payload: OperationPreviewPayload) => Promise<PreviewOperationActionResponse | null>;
    fetchAssessmentStatusesAction: () => Promise<AssessmentStatusesActionResponse>;
    fetchAllZonesAction: () => Promise<ZonesActionResponse | null>;
    fetchAllPropertyTypesAction: () => Promise<PropertyTypesActionResponse | null>;
  }
) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const t = useTranslations('addTaxes');

  // Helper to extract values from selectionData first, with fallback to URL searchParams
  const getSelectedValues = (substring: string): string[] => {
    const key = Object.keys(selectionData).find(k => k.toLowerCase().includes(substring));
    return key ? selectionData[key] || [] : [];
  };

  const getSelectedJoined = (substring: string, searchParamKey?: string): string => {
    const vals = getSelectedValues(substring);
    if (vals.length > 0) {
      return vals.filter(v => v !== 'select-all').join(',');
    }
    if (searchParamKey) {
      return searchParams.get(searchParamKey) || '';
    }
    return '';
  };

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
  const [fetchedToBuildings, setFetchedToBuildings] = useState<BuildingOption[]>([]);
  const [toBuildingPage, setToBuildingPage] = useState(1);
  const [hasMoreToBuildings, setHasMoreToBuildings] = useState(false);
  const [isLoadingMoreToBuildings, setIsLoadingMoreToBuildings] = useState(false);
  const [isFetchingToBuildings, setIsFetchingToBuildings] = useState(false);
  const [currentPropertyFrom, setCurrentPropertyFrom] = useState<string>('');

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsValidated(false);
      setEligibleCount(null);
    }, 0);

    return () => clearTimeout(timer);
  }, [selectionData, selectedScope]);

  const [fetchedAssessmentStatuses, setFetchedAssessmentStatuses] = useState<{ value: string; label: string }[]>([]);
  const [isFetchingAssessmentStatuses, setIsFetchingAssessmentStatuses] = useState(false);

  const [fetchedZones, setFetchedZones] = useState<{ value: string; label: string }[]>([]);
  const [isFetchingZones, setIsFetchingZones] = useState(false);

  const [fetchedPropertyTypes, setFetchedPropertyTypes] = useState<{ value: string; label: string }[]>([]);
  const [isFetchingPropertyTypes, setIsFetchingPropertyTypes] = useState(false);

  const fetchZones = async () => {
    if (fetchedZones.length > 0 || isFetchingZones) return;
    setIsFetchingZones(true);
    try {
      const res = await actions.fetchAllZonesAction();
      const zoneOpts = res?.items
        ? res.items.map((z: ZoneResponseItem) => ({
            value: String(z.id),
            label: z.description && z.zoneNo ? `${z.zoneNo} — ${z.description}` : (z.description || z.zoneNo || ''),
          }))
        : [];
      setFetchedZones(zoneOpts);
    } catch (err) {
      logger.error('Failed to fetch zones on demand', { error: err as Error });
    } finally {
      setIsFetchingZones(false);
    }
  };

  const fetchPropertyTypes = async () => {
    if (fetchedPropertyTypes.length > 0 || isFetchingPropertyTypes) return;
    setIsFetchingPropertyTypes(true);
    try {
      const res = await actions.fetchAllPropertyTypesAction();
      const typeOpts = res?.items
        ? res.items.map((pt: PropertyTypeResponseItem) => ({
            value: String(pt.id),
            label: pt.propertyDescription || '',
          }))
        : [];
      setFetchedPropertyTypes(typeOpts);
    } catch (err) {
      logger.error('Failed to fetch property types on demand', { error: err as Error });
    } finally {
      setIsFetchingPropertyTypes(false);
    }
  };

  const handleCalculateEligible = async () => {
    setIsCalculating(true);
    setIsValidated(false);
    try {
      const zoneIds = getSelectedJoined('zone', 'zoneid');
      const wardIds = getSelectedJoined('ward', 'wardid');
      const propertyTypeId = getSelectedJoined('property type', 'PropertyTypeId') || searchParams.get('propertyTypeId') || searchParams.get('propertytypeid') || searchParams.get('TypeOfUseGroupId');
      const assessmentStatusIds = getSelectedJoined('assessment status', 'assessmentStatusIds');

      const fromPropId = getSelectedJoined('from', 'fromPropertyId');
      const toPropId = getSelectedJoined('to', 'toPropertyId');
      const fromPropNo = (fetchedBuildings.find(b => b.value === fromPropId)?.label) || searchParams.get('fromPropertyNo') || fromPropId;
      const toPropNo = (fetchedToBuildings.find(b => b.value === toPropId)?.label) || searchParams.get('toPropertyNo') || toPropId;

      // Validate required fields before calculating
      let isConfigValid = false;
      if (selectedScope === 'zone') {
        isConfigValid = !!zoneIds;
      } else if (selectedScope === 'ward') {
        isConfigValid = !!zoneIds && !!wardIds;
      } else if (selectedScope === 'building') {
        const propertyIds = getSelectedJoined('property no') || getSelectedJoined('building') || searchParams.get('propertyid');
        isConfigValid = !!zoneIds && !!wardIds && !!propertyIds;
      } else if (selectedScope === 'property') {
        const propertyIds = getSelectedJoined('property no') || getSelectedJoined('building') || searchParams.get('propertyid');
        const searchText = getSelectedJoined('search') || searchParams.get('searchText') || searchParams.get('SearchText') || (selectionData['Search Property'] || [])[0];
        isConfigValid = !!propertyIds || !!searchText;
      } else if (selectedScope === 'range') {
        isConfigValid = !!wardIds && !!fromPropNo && !!toPropNo;
      }

      if (!isConfigValid) {
        toast.error(t('messages.fillRequiredFields'));
        setIsCalculating(false);
        return;
      }

      if (selectedScope === 'range') {
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
        const propertyIds = getSelectedJoined('property no') || getSelectedJoined('building') || searchParams.get('propertyid');
        if (propertyIds) {
          scopeData.propertyIds = propertyIds.split(',').map(Number).filter(Number.isFinite);
        }

        const searchText = getSelectedJoined('search') || searchParams.get('searchText') || searchParams.get('SearchText');
        if (searchText) {
          scopeData.searchText = searchText;
        } else {
          scopeData.searchText = '';
        }
      }

      if (selectedScope === 'building') {
        const propIdVal = getSelectedJoined('property no') || getSelectedJoined('building') || searchParams.get('propertyid');
        const propNoVal = (fetchedBuildings.find(b => b.value === (getSelectedValues('property no')[0] || getSelectedValues('building')[0] || searchParams.get('propertyid')?.split(',')[0]))?.propertyNo || searchParams.get('propertyno') || '');
        const buildingScope = resolveBuildingScope(
          propIdVal,
          propNoVal,
          fetchedBuildings
        );
        scopeData.propertyIds = buildingScope.propertyIds;
        if (buildingScope.building) scopeData.building = buildingScope.building;
        if (buildingScope.partitionNos) scopeData.partitionNos = buildingScope.partitionNos;
      }

      if (selectedScope === 'range') {
        if (fromPropId) scopeData.fromPropertyId = Number(fromPropId);
        if (toPropId) scopeData.toPropertyId = Number(toPropId);
        if (fromPropNo) scopeData.fromPropertyNo = fromPropNo;
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

      const response = await actions.getEligibleCountAction(payload);
      if (response) {
        setEligibleCount(response.eligible ?? 0);
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
      const zoneVals = getSelectedValues('zone');
      let zoneIds = zoneVals.length > 0 ? zoneVals.map(Number) : (searchParams.get('zoneid')?.split(',').map(Number) || []);
      const wardVals = getSelectedValues('ward');
      const wardIds = wardVals.length > 0 ? wardVals.map(Number) : (searchParams.get('wardid')?.split(',').map(Number) || []);

      if (zoneIds.length === 0 && wardIds.length > 0) {
        const parentZoneIds = wardIds.map(id => {
          const w = fetchedWards.find(x => x.value === String(id));
          return w ? Number(w.zoneId) : null;
        }).filter(Boolean) as number[];
        zoneIds = Array.from(new Set(parentZoneIds));
      }

      const propertyTypeIdVal = getSelectedValues('property type');
      const propertyTypeIds = (propertyTypeIdVal.length > 0 ? propertyTypeIdVal : (searchParams.get('PropertyTypeId')?.split(',') || [])).filter(x => x !== 'select-all').map(Number);

      const assessmentStatusVal = getSelectedValues('assessment status');
      const assessmentStatusIds = (assessmentStatusVal.length > 0 ? assessmentStatusVal : (searchParams.get('assessmentStatusIds')?.split(',') || [])).map(Number);

      const scopeData: OperationScope = {};
      if (selectedScope === 'zone') {
        scopeData.zoneIds = zoneIds;
      } else if (selectedScope === 'ward') {
        scopeData.zoneIds = zoneIds;
        scopeData.wardIds = wardIds;
      } else if (selectedScope === 'building') {
        scopeData.zoneIds = zoneIds;
        scopeData.wardIds = wardIds;
        const propIdVal = getSelectedJoined('property no') || getSelectedJoined('building') || searchParams.get('propertyid');
        const propNoVal = (fetchedBuildings.find(b => b.value === (getSelectedValues('property no')[0] || getSelectedValues('building')[0] || searchParams.get('propertyid')?.split(',')[0]))?.propertyNo || searchParams.get('propertyno') || '');
        const buildingScope = resolveBuildingScope(
          propIdVal,
          propNoVal,
          fetchedBuildings
        );
        scopeData.propertyIds = buildingScope.propertyIds;
        if (buildingScope.building) scopeData.building = buildingScope.building;
        if (buildingScope.partitionNos) scopeData.partitionNos = buildingScope.partitionNos;
      } else if (selectedScope === 'property') {
        scopeData.propertyIds = [];
        const propertyIdsStr = getSelectedJoined('property no') || getSelectedJoined('building') || searchParams.get('propertyid');
        if (propertyIdsStr) {
          scopeData.propertyIds = propertyIdsStr.split(',').map(Number).filter(Number.isFinite);
        }
        const searchText = getSelectedJoined('search') || searchParams.get('searchText') || searchParams.get('SearchText');
        if (searchText) {
          scopeData.searchText = searchText;
        } else {
          scopeData.searchText = '';
        }
      } else if (selectedScope === 'range') {
        scopeData.wardIds = wardIds;
        const fromPropId = getSelectedJoined('from') || searchParams.get('fromPropertyId');
        if (fromPropId) scopeData.fromPropertyId = Number(fromPropId);
        const toPropId = getSelectedJoined('to') || searchParams.get('toPropertyId');
        if (toPropId) scopeData.toPropertyId = Number(toPropId);

        // Keep propertyIds as well in case the backend still relies on it
        const rangeIds = [scopeData.fromPropertyId, scopeData.toPropertyId].filter(
          (v): v is number => typeof v === 'number' && Number.isFinite(v)
        );
        if (rangeIds.length > 0) scopeData.propertyIds = rangeIds;

        const fromPropNo = (fetchedBuildings.find(b => b.value === fromPropId)?.label) || searchParams.get('fromPropertyNo') || fromPropId;
        if (fromPropNo) scopeData.fromPropertyNo = fromPropNo;
        const toPropNo = (fetchedToBuildings.find(b => b.value === toPropId)?.label) || searchParams.get('toPropertyNo') || toPropId;
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
      if (!currentFy) {
        throw new Error('financeYearId is required for preview export');
      }
      const financeYearId = Number(currentFy);

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

      const response = await actions.executeOperationAction(payload);
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

      const zoneVals = getSelectedValues('zone');
      let zoneIds = zoneVals.length > 0 ? zoneVals.map(Number) : (searchParams.get('zoneid')?.split(',').map(Number) || []);
      const wardVals = getSelectedValues('ward');
      const wardIds = wardVals.length > 0 ? wardVals.map(Number) : (searchParams.get('wardid')?.split(',').map(Number) || []);

      if (zoneIds.length === 0 && wardIds.length > 0) {
        const parentZoneIds = wardIds.map(id => {
          const w = fetchedWards.find(x => x.value === String(id));
          return w ? Number(w.zoneId) : null;
        }).filter(Boolean) as number[];
        zoneIds = Array.from(new Set(parentZoneIds));
      }
      const propertyTypeIdVal = getSelectedValues('property type');
      const propertyTypeIds = (propertyTypeIdVal.length > 0 ? propertyTypeIdVal : (searchParams.get('PropertyTypeId')?.split(',') || [])).filter(x => x !== 'select-all').map(Number);

      const assessmentStatusVal = getSelectedValues('assessment status');
      const assessmentStatusIds = (assessmentStatusVal.length > 0 ? assessmentStatusVal : (searchParams.get('assessmentStatusIds')?.split(',') || [])).map(Number);

      const scopeData: OperationScope = {};
      if (propertyTypeIds.length > 0) {
        scopeData.propertyTypeId = propertyTypeIds[0];
        scopeData.propertyTypeIds = propertyTypeIds;
      }
      if (assessmentStatusIds.length > 0) {
        scopeData.assessmentStatusIds = assessmentStatusIds;
      }

      if (selectedScope === 'zone') {
        scopeData.zoneIds = zoneIds;
      } else if (selectedScope === 'ward') {
        scopeData.zoneIds = zoneIds;
        scopeData.wardIds = wardIds;
      } else if (selectedScope === 'building') {
        scopeData.zoneIds = zoneIds;
        scopeData.wardIds = wardIds;
        const propIdVal = getSelectedJoined('property no') || getSelectedJoined('building') || searchParams.get('propertyid');
        const propNoVal = (fetchedBuildings.find(b => b.value === (getSelectedValues('property no')[0] || getSelectedValues('building')[0] || searchParams.get('propertyid')?.split(',')[0]))?.propertyNo || searchParams.get('propertyno') || '');
        const buildingScope = resolveBuildingScope(
          propIdVal,
          propNoVal,
          fetchedBuildings
        );
        scopeData.propertyIds = buildingScope.propertyIds;
        if (buildingScope.building) scopeData.building = buildingScope.building;
        if (buildingScope.partitionNos) scopeData.partitionNos = buildingScope.partitionNos;
      } else if (selectedScope === 'property') {
        scopeData.propertyIds = [];
        const rawText = (selectionData['Search Property'] || [])[0] || getSelectedJoined('property no') || getSelectedJoined('building') || searchParams.get('propertyid') || '';
        if (rawText && !/^\d{1,8}$/.test(rawText)) {
          scopeData.searchText = rawText;
        } else if (rawText) {
          scopeData.propertyIds = [Number(rawText)];
          scopeData.searchText = '';
        } else {
          scopeData.searchText = '';
        }
      } else if (selectedScope === 'range') {
        scopeData.wardIds = wardIds;
        const fromPropId = getSelectedJoined('from') || searchParams.get('fromPropertyId');
        if (fromPropId) scopeData.fromPropertyId = Number(fromPropId);
        const toPropId = getSelectedJoined('to') || searchParams.get('toPropertyId');
        if (toPropId) scopeData.toPropertyId = Number(toPropId);

        // Keep propertyIds as well in case the backend still relies on it
        const rangeIds = [scopeData.fromPropertyId, scopeData.toPropertyId].filter(
          (v): v is number => typeof v === 'number' && Number.isFinite(v)
        );
        if (rangeIds.length > 0) scopeData.propertyIds = rangeIds;

        const fromPropNo = (fetchedBuildings.find(b => b.value === fromPropId)?.label) || searchParams.get('fromPropertyNo') || fromPropId;
        if (fromPropNo) scopeData.fromPropertyNo = fromPropNo;
        const toPropNo = (fetchedToBuildings.find(b => b.value === toPropId)?.label) || searchParams.get('toPropertyNo') || toPropId;
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

      const result = await actions.previewOperationAction(payload);
      if (result && 'records' in result) {
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

  const [isExportingPreview, setIsExportingPreview] = useState<{
    all: boolean;
    eligible: boolean;
    skipped: boolean;
  }>({
    all: false,
    eligible: false,
    skipped: false
  });

  const handleDownloadPreviewExport = async (downloadType: 'all' | 'eligible' | 'skipped') => {
    setIsExportingPreview(prev => ({ ...prev, [downloadType]: true }));
    const loadingToast = toast.loading(t('messages.previewExportInProgress', { downloadType }));
    try {
      const zoneVals = getSelectedValues('zone');
      let zoneIds = zoneVals.length > 0 ? zoneVals.map(Number) : (searchParams.get('zoneid')?.split(',').map(Number) || []);
      const wardVals = getSelectedValues('ward');
      const wardIds = wardVals.length > 0 ? wardVals.map(Number) : (searchParams.get('wardid')?.split(',').map(Number) || []);

      if (zoneIds.length === 0 && wardIds.length > 0) {
        const parentZoneIds = wardIds.map(id => {
          const w = fetchedWards.find(x => x.value === String(id));
          return w ? Number(w.zoneId) : null;
        }).filter(Boolean) as number[];
        zoneIds = Array.from(new Set(parentZoneIds));
      }
      const propertyTypeIdVal = getSelectedValues('property type');
      const propertyTypeIds = (propertyTypeIdVal.length > 0 ? propertyTypeIdVal : (searchParams.get('PropertyTypeId')?.split(',') || [])).filter(x => x !== 'select-all').map(Number);

      const assessmentStatusVal = getSelectedValues('assessment status');
      const assessmentStatusIds = (assessmentStatusVal.length > 0 ? assessmentStatusVal : (searchParams.get('assessmentStatusIds')?.split(',') || [])).map(Number);

      const scopeData: OperationScope = {};
      if (propertyTypeIds.length > 0) {
        scopeData.propertyTypeId = propertyTypeIds[0];
        scopeData.propertyTypeIds = propertyTypeIds;
      }
      if (assessmentStatusIds.length > 0) {
        scopeData.assessmentStatusIds = assessmentStatusIds;
      }

      if (selectedScope === 'zone') {
        scopeData.zoneIds = zoneIds;
      } else if (selectedScope === 'ward') {
        scopeData.zoneIds = zoneIds;
        scopeData.wardIds = wardIds;
      } else if (selectedScope === 'building') {
        scopeData.zoneIds = zoneIds;
        scopeData.wardIds = wardIds;
        const propIdVal = getSelectedJoined('property no') || getSelectedJoined('building') || searchParams.get('propertyid');
        const propNoVal = (fetchedBuildings.find(b => b.value === (getSelectedValues('property no')[0] || getSelectedValues('building')[0] || searchParams.get('propertyid')?.split(',')[0]))?.propertyNo || searchParams.get('propertyno') || '');
        const buildingScope = resolveBuildingScope(
          propIdVal,
          propNoVal,
          fetchedBuildings
        );
        scopeData.propertyIds = buildingScope.propertyIds;
        if (buildingScope.building) scopeData.building = buildingScope.building;
        if (buildingScope.partitionNos) scopeData.partitionNos = buildingScope.partitionNos;
      } else if (selectedScope === 'property') {
        scopeData.propertyIds = [];
        const rawText = (selectionData['Search Property'] || [])[0] || getSelectedJoined('property no') || getSelectedJoined('building') || searchParams.get('propertyid') || '';
        if (rawText && !/^\d{1,8}$/.test(rawText)) {
          scopeData.searchText = rawText;
        } else if (rawText) {
          scopeData.propertyIds = [Number(rawText)];
          scopeData.searchText = '';
        } else {
          scopeData.searchText = '';
        }
      } else if (selectedScope === 'range') {
        scopeData.wardIds = wardIds;
        const fromPropId = getSelectedJoined('from') || searchParams.get('fromPropertyId');
        if (fromPropId) scopeData.fromPropertyId = Number(fromPropId);
        const toPropId = getSelectedJoined('to') || searchParams.get('toPropertyId');
        if (toPropId) scopeData.toPropertyId = Number(toPropId);

        // Keep propertyIds as well in case the backend still relies on it
        const rangeIds = [scopeData.fromPropertyId, scopeData.toPropertyId].filter(
          (v): v is number => typeof v === 'number' && Number.isFinite(v)
        );
        if (rangeIds.length > 0) scopeData.propertyIds = rangeIds;

        const fromPropNo = (fetchedBuildings.find(b => b.value === fromPropId)?.label) || searchParams.get('fromPropertyNo') || fromPropId;
        if (fromPropNo) scopeData.fromPropertyNo = fromPropNo;
        const toPropNo = (fetchedToBuildings.find(b => b.value === toPropId)?.label) || searchParams.get('toPropertyNo') || toPropId;
        if (toPropNo) scopeData.toPropertyNo = toPropNo;
      }

      const currentFy = searchParams.get('financeYearId') || searchParams.get('financeYear');
      const financeYearId = currentFy ? Number(currentFy) : 1;

      const payload = {
        financeYearId,
        scopeType: selectedScope,
        scope: scopeData,
        operation: 'addTax'
      };

      const response = await fetch(`/api/property-tax/preview-export?downloadType=${downloadType}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        throw new Error(`Export failed: ${response.statusText}`);
      }

      const blob = await response.blob();
      const disposition = response.headers.get('Content-Disposition');
      let filename = `preview_${downloadType}_${selectedScope}_${new Date().toISOString().slice(0,10)}.csv`;
      if (disposition && disposition.indexOf('attachment') !== -1) {
        const filenameRegex = /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/;
        const matches = filenameRegex.exec(disposition);
        if (matches != null && matches[1]) {
          filename = matches[1].replace(/['"]/g, '');
        }
      }

      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);

      toast.success(t('messages.previewExportSuccess', { downloadType }), { id: loadingToast });
    } catch (e) {
      logger.error('Failed to download preview export', { error: e as Error });
      toast.error(t('messages.previewExportFailed'), { id: loadingToast });
    } finally {
      setIsExportingPreview(prev => ({ ...prev, [downloadType]: false }));
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

  const [buildingPage, setBuildingPage] = useState(1);
  const [hasMoreBuildings, setHasMoreBuildings] = useState(false);
  const [isLoadingMoreBuildings, setIsLoadingMoreBuildings] = useState(false);
  const toBuildingOption = (b: SearchByCategoryItem): BuildingOption => {
    const part = b.partitionNo?.trim();
    const hasPart = part && part !== '0' && part !== '';
    return {
      value: String(b.propertyId),
      label: hasPart ? `${b.propertyNo}-${part}` : b.propertyNo,
      propertyNo: b.propertyNo,
      partitionNo: part || ''
    };
  };

  const fetchBuildings = async (zoneIds: string[] | null, wardIds: string[]) => {
    if (wardIds.length === 0 || isFetchingBuildings) return;
    setIsFetchingBuildings(true);
    try {
      if (selectedScope === 'range') {
        const res = await actions.searchPropertiesByCategoryAction(2, wardIds[0], 1, 100);
        if (res?.items?.items) {
          const buildings: BuildingOption[] = res.items.items.map(toBuildingOption);
          setFetchedBuildings(buildings);
          setBuildingPage(1);
          const totalPages = res.items.totalPages || Math.ceil((res.items.totalCount || 0) / 100);
          setHasMoreBuildings(1 < totalPages);
        } else {
          setFetchedBuildings([]);
          setHasMoreBuildings(false);
        }
      } else if (selectedScope === 'building') {
        const zId = zoneIds && zoneIds.length > 0 ? zoneIds[0] : null;
        const res = await actions.searchPropertiesByCategoryAction(2, wardIds[0], 1, 100, undefined, undefined, zId || undefined);
        if (res?.items?.items) {
          const buildings: BuildingOption[] = res.items.items.map(toBuildingOption);
          setFetchedBuildings(buildings);
          setBuildingPage(1);
          const totalPages = res.items.totalPages || Math.ceil((res.items.totalCount || 0) / 100);
          setHasMoreBuildings(1 < totalPages);
        } else {
          setFetchedBuildings([]);
          setHasMoreBuildings(false);
        }
      } else {
        const zId = zoneIds && zoneIds.length > 0 ? zoneIds[0] : null;
        const res = await actions.searchPropertiesAction(zId, wardIds[0]);
        if (res?.items?.items) {
          const buildings: BuildingOption[] = res.items.items.map((b: SearchPropertyItem) => {
            const part = b.partitionNo?.trim();
            const hasPart = part && part !== '0' && part !== '';
            return {
              value: b.propertyId.toString(),
              label: hasPart ? `${b.propertyNo}-${part}` : b.propertyNo,
              propertyNo: b.propertyNo,
              partitionNo: part || ''
            };
          });
          setFetchedBuildings(buildings);
          setHasMoreBuildings(false);
        }
      }
    } catch (e) {
      logger.error('Failed to fetch buildings', { error: e as Error });
    } finally {
      setIsFetchingBuildings(false);
    }
  };

  const loadMoreBuildings = async () => {
    if (!hasMoreBuildings || isLoadingMoreBuildings || isFetchingBuildings) return;
    const wardId = searchParams.get('wardid') || (selectionData['Ward / Sector'] || selectionData['Ward'])?.[0];
    if (!wardId) return;

    setIsLoadingMoreBuildings(true);
    try {
      const nextPage = buildingPage + 1;
      const category = 2;
      const zoneId = searchParams.get('zoneid') || (selectionData['Zone / Node'] || selectionData['Zone'])?.[0];
      const res = await actions.searchPropertiesByCategoryAction(category, wardId, nextPage, 100, undefined, undefined, selectedScope === 'building' && zoneId ? zoneId : undefined);
      if (res?.items?.items) {
        const newBuildings: BuildingOption[] = res.items.items.map(toBuildingOption);
        setFetchedBuildings(prev => {
          const existingIds = new Set(prev.map(item => item.value));
          const filtered = newBuildings.filter(item => !existingIds.has(item.value));
          return [...prev, ...filtered];
        });
        setBuildingPage(nextPage);
        const totalPages = res.items.totalPages || Math.ceil((res.items.totalCount || 0) / 100);
        setHasMoreBuildings(nextPage < totalPages);
      } else {
        setHasMoreBuildings(false);
      }
    } catch (e) {
      logger.error('Failed to load more buildings', { error: e as Error });
    } finally {
      setIsLoadingMoreBuildings(false);
    }
  };

  const fetchWards = async () => {
    if (fetchedWards.length > 0 || isFetchingWards) return;
    setIsFetchingWards(true);
    try {
      const res = await actions.fetchAllWardsAction();
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
      const res = await actions.fetchAssessmentStatusesAction();
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

  const fetchToBuildings = async (wardId: string, propertyFrom: string) => {
    if (!wardId || !propertyFrom || isFetchingToBuildings) return;
    setIsFetchingToBuildings(true);
    setCurrentPropertyFrom(propertyFrom);
    try {
      const res = await actions.searchPropertiesByCategoryAction(4, wardId, 1, 100, propertyFrom);
      if (res?.items?.items) {
        const buildings: BuildingOption[] = res.items.items.map(toBuildingOption);
        setFetchedToBuildings(buildings);
        setToBuildingPage(1);
        const totalPages = res.items.totalPages || Math.ceil((res.items.totalCount || 0) / 100);
        setHasMoreToBuildings(1 < totalPages);
      } else {
        setFetchedToBuildings([]);
        setHasMoreToBuildings(false);
      }
    } catch (e) {
      logger.error('Failed to fetch to-buildings', { error: e as Error });
    } finally {
      setIsFetchingToBuildings(false);
    }
  };

  const loadMoreToBuildings = async () => {
    if (!hasMoreToBuildings || isLoadingMoreToBuildings || isFetchingToBuildings) return;
    const wardId = searchParams.get('wardid') || (selectionData['Ward / Sector'] || selectionData['Ward'])?.[0];
    if (!wardId || !currentPropertyFrom) return;

    setIsLoadingMoreToBuildings(true);
    try {
      const nextPage = toBuildingPage + 1;
      const res = await actions.searchPropertiesByCategoryAction(4, wardId, nextPage, 100, currentPropertyFrom);
      if (res?.items?.items) {
        const newBuildings: BuildingOption[] = res.items.items.map(toBuildingOption);
        setFetchedToBuildings(prev => {
          const existingIds = new Set(prev.map(item => item.value));
          const filtered = newBuildings.filter(item => !existingIds.has(item.value));
          return [...prev, ...filtered];
        });
        setToBuildingPage(nextPage);
        const totalPages = res.items.totalPages || Math.ceil((res.items.totalCount || 0) / 100);
        setHasMoreToBuildings(nextPage < totalPages);
      } else {
        setHasMoreToBuildings(false);
      }
    } catch (e) {
      logger.error('Failed to load more to-buildings', { error: e as Error });
    } finally {
      setIsLoadingMoreToBuildings(false);
    }
  };


  useEffect(() => {
    if (selectedScope === 'range' || selectedScope === 'building') {
      const wardId = searchParams.get('wardid') || (selectionData['Ward / Sector'] || selectionData['Ward'])?.[0];
      const zoneId = searchParams.get('zoneid') || (selectionData['Zone / Node'] || selectionData['Zone'])?.[0];

      const timer = setTimeout(() => {
        if (wardId) {
          void fetchBuildings(zoneId ? [zoneId] : null, [wardId]);
        } else {
          setFetchedBuildings([]);
        }
      }, 0);

      return () => clearTimeout(timer);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedScope, searchParams.get('wardid'), searchParams.get('zoneid'), selectionData['Ward / Sector'], selectionData['Ward'], selectionData['Zone / Node'], selectionData['Zone']]);

  useEffect(() => {
    if (selectedScope === 'range') {
      const wardId = searchParams.get('wardid') || (selectionData['Ward / Sector'] || selectionData['Ward'])?.[0];
      const fromKey = Object.keys(selectionData).find(k => k.toLowerCase().includes('from'));
      const fromVal = (fromKey ? selectionData[fromKey]?.[0] : null) || searchParams.get('fromPropertyId');

      const timer = setTimeout(() => {
        if (wardId && fromVal) {
          const fromObj = fetchedBuildings.find(b => b.value === fromVal);
          const fromLabel = fromObj ? fromObj.label : (searchParams.get('fromPropertyNo') || fromVal);
          void fetchToBuildings(wardId, fromLabel);
        } else {
          setFetchedToBuildings([]);
          setHasMoreToBuildings(false);
        }
      }, 0);

      return () => clearTimeout(timer);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedScope, searchParams.get('wardid'), selectionData, fetchedBuildings]);



  return {
    isValidated, setIsValidated,
    isModalOpen, setIsModalOpen,
    isCalculating, setIsCalculating,
    eligibleCount, setEligibleCount,
    fetchedWards, fetchWards,
    fetchedBuildings, fetchBuildings,
    hasMoreBuildings, loadMoreBuildings, isLoadingMoreBuildings, isFetchingBuildings,
    fetchedToBuildings, hasMoreToBuildings, loadMoreToBuildings, isLoadingMoreToBuildings, isFetchingToBuildings, fetchToBuildings,
    fetchedAssessmentStatuses, fetchAssessmentStatuses,
    handleCalculateEligible,
    executeJob,
    isPreviewModalOpen, setIsPreviewModalOpen,
    previewData, setPreviewData,
    isPreviewLoading,
    handlePreview,
    previewPage, setPreviewPage,
    previewPageSize, setPreviewPageSize,
    isExportingPreview, handleDownloadPreviewExport,
    fetchedZones, fetchZones,
    fetchedPropertyTypes, fetchPropertyTypes
  };
}
