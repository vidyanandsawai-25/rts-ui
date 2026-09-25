import { useState, useEffect, useRef } from 'react';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { logger } from '@/lib/utils/logger';
import { InitOperationsResponse, ScopeOptionItem, ScopeItem, Scope, Action, FinanceYearOption, MasterDataChangeSummary } from '@/types/addTaxes.types';
import {
  Globe,
  MapPin,
  Grid,
  Building,
  Home,
  ArrowLeftRight,
  CheckCircle,
  LucideIcon,
} from 'lucide-react';

export type { Scope, Action };

export function useAddTaxesState(
  initData: InitOperationsResponse | null,
  scopeOptions: ScopeOptionItem[],
  clientActions: {
    initOperationsAction: (financeYearId?: string | number) => Promise<InitOperationsResponse | null>;
    getMasterDataChangeSummaryAction?: (financeYearId: string | number) => Promise<MasterDataChangeSummary | null>;
  }
) {
  const t = useTranslations('addTaxes');
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const urlScope = searchParams.get('scope') as Scope | null;
  const [selectedScope, setSelectedScope] = useState<Scope>(urlScope || 'zone');

  const [selectedAction, setSelectedAction] = useState<Action>('addTax');
  const [selectionData, setSelectionData] = useState<Record<string, string[]>>({});
  const [isInitialized, setIsInitialized] = useState(false);

  const isLocalUpdateRef = useRef(false);

  // Track which scope has been initialized to prevent re-running on URL changes
  const initializedScopeRef = useRef<string | null>(null);

  // Sync selectionData from URL parameters ONLY on mount or when scope changes (not on URL param changes)
  useEffect(() => {
    if (!scopeOptions || scopeOptions.length === 0) return;

    // Skip if already initialized for this scope (user is actively selecting, don't overwrite)
    if (initializedScopeRef.current === selectedScope) return;

    const currentParams = typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : searchParams;
    const urlScope = currentParams.get('scope');
    const effectiveScope = (urlScope || selectedScope) as Scope;

    const currentScopeData = scopeOptions.find(s => s.scopeType === effectiveScope);
    if (!currentScopeData) return;

    const optionsToRender = effectiveScope === 'property' ? ['Search Property'] : (currentScopeData.options || []);
    const newSelectionData: Record<string, string[]> = {};

    for (const option of optionsToRender) {
      const optStr = option.toLowerCase();
      if (optStr.includes('zone')) {
        const val = currentParams.get('zoneid');
        if (val) newSelectionData[option] = val.split(',');
      } else if (optStr.includes('ward')) {
        const val = currentParams.get('wardid');
        if (val) newSelectionData[option] = val.split(',');
      } else if (optStr.includes('property type')) {
        const val = currentParams.get('PropertyTypeId') || currentParams.get('propertyTypeId') || currentParams.get('propertytypeid') || currentParams.get('TypeOfUseGroupId');
        if (val) {
          newSelectionData[option] = val.split(',');
        } else {
          newSelectionData[option] = [];
        }
      } else if (optStr.includes('property no') || optStr.includes('building')) {
        const val = currentParams.get('propertyno');
        if (val) newSelectionData[option] = val.split(',');
      } else if (optStr.includes('assessment status')) {
        const val = currentParams.get('assessmentStatusIds');
        if (val) newSelectionData[option] = val.split(',');
      } else if (optStr.includes('from')) {
        const val = currentParams.get('fromPropertyNo');
        if (val) newSelectionData[option] = [val];
      } else if (optStr.includes('to')) {
        const val = currentParams.get('toPropertyNo');
        if (val) newSelectionData[option] = [val];
      } else if (optStr.includes('search') || optStr.includes('specific')) {
        const val = currentParams.get('searchText') || currentParams.get('SearchText');
        if (val) newSelectionData[option] = [val];
      }
    }

    // Mark this scope as initialized so we don't overwrite user selections on URL changes
    initializedScopeRef.current = effectiveScope;

    const timer = setTimeout(() => {
      setSelectionData(newSelectionData);
      setIsInitialized(true);
    }, 0);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedScope, scopeOptions]);

  const handleSelectionChange = (key: string, values: string[], _labels?: string[]) => {
    isLocalUpdateRef.current = true;

    const prevKeys = Object.keys(selectionData);
    const next = { ...selectionData, [key]: values };

    const isZone = key.toLowerCase().includes('zone');
    if (isZone) {
      for (const k of prevKeys) {
        const lowerKey = k.toLowerCase();
        if (lowerKey.includes('ward')) {
          next[k] = [];
        }
        if (lowerKey.includes('building') || lowerKey.includes('property no') || lowerKey.includes('from') || lowerKey.includes('to')) {
          next[k] = [];
        }
      }
    }

    const isWard = key.toLowerCase().includes('ward');
    if (isWard) {
      for (const k of prevKeys) {
        const lowerKey = k.toLowerCase();
        if (lowerKey.includes('building') || lowerKey.includes('property no') || lowerKey.includes('from') || lowerKey.includes('to')) {
          next[k] = [];
        }
      }
    }

    setSelectionData(next);

    // Clean selection query params from URL if present to keep URL clean and prevent 404/414 URI Too Long errors
    const params = new URLSearchParams(typeof window !== 'undefined' ? window.location.search : searchParams.toString());
    const keyMap: Record<string, string> = {
      'zone': 'zoneid',
      'ward': 'wardid',
      'property type': 'PropertyTypeId',
      'assessment status': 'assessmentStatusIds',
      'search': 'searchText',
      'specific': 'searchText'
    };

    const labelMap: Record<string, string> = {
      'property no': 'propertyno',
      'building': 'propertyno',
      'from': 'fromPropertyNo',
      'to': 'toPropertyNo'
    };

    let paramsChanged = false;
    Object.values(keyMap).concat(Object.values(labelMap)).forEach(p => {
      if (params.has(p)) {
        params.delete(p);
        paramsChanged = true;
      }
    });

    if (paramsChanged) {
      const newUrl = `${pathname}?${params.toString()}`;
      if (typeof window !== 'undefined') {
        window.history.replaceState(null, '', newUrl);
      }
      router.replace(newUrl, { scroll: false });
    }
  };

  const clearSelectionData = (preventUrlUpdate = false) => {
    setSelectionData({});
    
    if (preventUrlUpdate) return;
    
    const params = new URLSearchParams(typeof window !== 'undefined' ? window.location.search : searchParams.toString());
    const paramsToClear = [
      'zoneid', 'wardid', 'PropertyTypeId', 'propertyTypeId', 'propertytypeid', 'TypeOfUseGroupId', 
      'propertyid', 'propertyno', 'assessmentStatusIds', 'fromPropertyId', 'toPropertyId', 
      'fromPropertyNo', 'toPropertyNo', 'searchText', 'SearchText', 'wardno', 'PropertyTypeCode',
      'propertyTypeCode', 'typeOfUseGroupCode'
    ];
    paramsToClear.forEach(p => params.delete(p));
    
    const newUrl = `${pathname}?${params.toString()}`;
    if (typeof window !== 'undefined') {
      window.history.replaceState(null, '', newUrl);
    }
    router.replace(newUrl, { scroll: false });
  };

  const defaultFinanceYearId = initData?.financeYears?.[0]?.value !== undefined ? String(initData.financeYears[0].value) : '';
  const urlFinanceYearId = searchParams.get('financeYearId') || searchParams.get('financeYear');
  const [financeYearId, setFinanceYearId] = useState<string>(urlFinanceYearId || defaultFinanceYearId);

  const [currentInitData, setCurrentInitData] = useState<InitOperationsResponse | null>(initData);
  const [isLoadingInit, setIsLoadingInit] = useState(false);
  const [masterDataChangeSummary, setMasterDataChangeSummary] = useState<MasterDataChangeSummary | null>(null);

  useEffect(() => {
    if (!financeYearId) return;
    let active = true;
    const fetchInitData = async () => {
      setIsLoadingInit(true);
      try {
        const [data, mdcSummary] = await Promise.all([
          clientActions.initOperationsAction(financeYearId),
          clientActions.getMasterDataChangeSummaryAction
            ? clientActions.getMasterDataChangeSummaryAction(financeYearId)
            : Promise.resolve(null)
        ]);

        if (data && active) {
          setCurrentInitData(data);
        }
        if (mdcSummary && active) {
          setMasterDataChangeSummary(mdcSummary);
        }
      } catch (err) {
        logger.error("Failed to load init data for finance year", { error: err as Error });
      } finally {
        if (active) setIsLoadingInit(false);
      }
    };
    fetchInitData();
    return () => {
      active = false;
    };
  }, [financeYearId, clientActions]);

  const refreshStats = async () => {
    if (!financeYearId) return;
    try {
      const [data, mdcSummary] = await Promise.all([
        clientActions.initOperationsAction(financeYearId),
        clientActions.getMasterDataChangeSummaryAction
          ? clientActions.getMasterDataChangeSummaryAction(financeYearId)
          : Promise.resolve(null)
      ]);

      if (data) {
        setCurrentInitData(data);
      }
      if (mdcSummary) {
        setMasterDataChangeSummary(mdcSummary);
      }
    } catch (err) {
      logger.error("Failed to load init data for finance year", { error: err as Error });
    }
  };

  useEffect(() => {
    const currentScope = searchParams.get('scope');
    const currentFy = searchParams.get('financeYearId') || searchParams.get('financeYear');

    const nextScope = currentScope || selectedScope;
    const nextFy = currentFy || financeYearId || defaultFinanceYearId;

    if (!nextScope || !nextFy) return;
    if (currentScope === nextScope && currentFy === nextFy && !searchParams.get('financeYear')) return;

    const params = new URLSearchParams(searchParams.toString());
    params.set('scope', nextScope);
    params.set('financeYearId', nextFy);
    params.delete('financeYear');

    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  }, [searchParams, selectedScope, financeYearId, defaultFinanceYearId, pathname, router]);

  const updateUrlParams = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set(key, value);
    if (key === 'financeYearId') {
      params.delete('financeYear');
    }
    router.push(`${pathname}?${params.toString()}`, { scroll: false });
  };

  const handleFinanceYearChange = (val: string) => {
    setFinanceYearId(val);
    updateUrlParams('financeYearId', val);
  };

  const handleScopeChange = (val: Scope) => {
    // Reset init ref so new scope gets initialized from URL on tab change
    initializedScopeRef.current = null;
    setSelectedScope(val);
    setSelectionData({}); // clear selections on scope change
    setIsInitialized(false);
    
    // Clear all other query params except scope, financeYearId, and tab to avoid race conditions
    const params = new URLSearchParams();
    const fy = searchParams.get('financeYearId') || searchParams.get('financeYear');
    if (fy) params.set('financeYearId', fy);
    const tab = searchParams.get('tab');
    if (tab) params.set('tab', tab);
    params.set('scope', val);
    
    if (typeof window !== 'undefined') {
      window.history.replaceState(null, '', `${pathname}?${params.toString()}`);
    }
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  };

  const stats = currentInitData?.summary || {
    totalProperties: 0,
    transmastProperties: 0,
    eligibleRecords: 0,
    skippedRecords: 0,
    runningJobs: 0
  };

  const permissions = currentInitData?.permissions || {};
  const financeYearOptions = currentInitData?.financeYears || ([] as FinanceYearOption[]);

  const selectedFyOption = financeYearOptions.find(opt => String(opt.value) === String(financeYearId));
  const isFinanceYearActive = selectedFyOption ? selectedFyOption.isActive !== false : true;
  const financeYearLabel = selectedFyOption ? selectedFyOption.label : '';

  const iconMap: Record<string, LucideIcon> = {
    all: Globe,
    zone: MapPin,
    ward: Grid,
    building: Building,
    property: Home,
    range: ArrowLeftRight,
  };

  const scopes: ScopeItem[] = scopeOptions.length > 0
    ? scopeOptions.map((s, idx) => {
      const scopeKey = s.scopeType === 'all' ? 'allProperties' : s.scopeType === 'zone' ? 'zoneNode' : s.scopeType === 'ward' ? 'wardSector' : s.scopeType === 'building' ? 'buildingWise' : s.scopeType === 'property' ? 'propertyWise' : s.scopeType === 'range' ? 'propertyRange' : s.scopeType;
      const titleKey = `scopeSelection.scopes.${scopeKey}`;
      const descKey = `scopeSelection.scopes.${scopeKey}Desc`;
      return {
        id: s.scopeType,
        num: (idx + 1).toString().padStart(2, '0'),
        icon: iconMap[s.scopeType] || Globe,
        title: t.has(titleKey) ? t(titleKey) : s.displayName,
        desc: t.has(descKey) ? t(descKey) : s.description
      };
    })
    : [
      { id: 'all', num: '01', icon: Globe, title: t('scopeSelection.scopes.allProperties'), desc: t('scopeSelection.scopes.allPropertiesDesc') },
      { id: 'zone', num: '02', icon: MapPin, title: t('scopeSelection.scopes.zoneNode'), desc: t('scopeSelection.scopes.zoneNodeDesc') },
      { id: 'ward', num: '03', icon: Grid, title: t('scopeSelection.scopes.wardSector'), desc: t('scopeSelection.scopes.wardSectorDesc') },
      { id: 'building', num: '04', icon: Building, title: t('scopeSelection.scopes.buildingWise'), desc: t('scopeSelection.scopes.buildingWiseDesc') },
      { id: 'property', num: '05', icon: Home, title: t('scopeSelection.scopes.propertyWise'), desc: t('scopeSelection.scopes.propertyWiseDesc') },
      { id: 'range', num: '06', icon: ArrowLeftRight, title: t('scopeSelection.scopes.propertyRange'), desc: t('scopeSelection.scopes.propertyRangeDesc') },
    ];

  const getActionStyle = (isAllowed: boolean, allowedStyle: Record<string, string>, restrictedStyle: Record<string, string>) => {
    return isAllowed ? { status: t('validateEligibility.status.allowed'), ...allowedStyle } : { status: t('validateEligibility.status.restricted'), ...restrictedStyle };
  };

  const actions = [
    {
      id: 'addTax', icon: CheckCircle, title: t('validateEligibility.actions.addTax'), desc: t('validateEligibility.actions.addTaxDesc'),
      ...getActionStyle(!!permissions?.addTax,
        { color: 'text-green-600', borderColor: 'border-green-500', bg: 'bg-green-50', iconColor: 'text-green-500' },
        { color: 'text-green-500', borderColor: 'border-green-200', bg: 'bg-white', iconColor: 'text-gray-400' }
      )
    }
  ];

  return {
    t,
    selectedScope,
    selectedAction,
    setSelectedAction,
    selectionData,
    handleSelectionChange,
    financeYearId,
    handleFinanceYearChange,
    handleScopeChange,
    stats,
    financeYearOptions,
    scopes,
    actions,
    scopeOptions,
    isInitialized,
    isFinanceYearActive,
    financeYearLabel,
    isLoadingInit,
    refreshStats,
    clearSelectionData,
    masterDataChangeSummary
  };
}
