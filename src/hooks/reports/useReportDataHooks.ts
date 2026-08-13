/* eslint-disable react-hooks/set-state-in-effect */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect } from 'react';
import type { WardSummary, PropertySummary, ReportDefinition, ReportParameterDefinition } from '@/types/report.types';
import type { PropertyType } from '@/types/property-type.types';
import { getPropertyTypesAction, getAssessmentTypesAction } from '@/app/[locale]/property-tax/reports/action';
import { searchPropertiesByCategoryAction } from '@/app/[locale]/property-tax/add-taxes/actions';

// ─── small hook: fetch wards on zoneId change ─────────────────────────────────
export function useWards(
  zoneId: string,
  fetchWards?: (id: number) => Promise<WardSummary[]>
) {
  const [wards, setWards] = useState<WardSummary[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const id = Number(zoneId);
    if (!zoneId || !fetchWards || isNaN(id) || id <= 0) {
      queueMicrotask(() => setWards([]));
      return;
    }
    let cancelled = false;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLoading(true);
    fetchWards(id)
      .then((w) => { if (!cancelled) setWards(w); })
      .catch(() => { if (!cancelled) setWards([]); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [zoneId, fetchWards]);

  return { wards, wardLoading: loading };
}

// ─── small hook: fetch properties on wardId change ───────────────────────────
export function useProperties(
  wardId: string,
  enabled: boolean,
  fetchProperties?: (id: number) => Promise<PropertySummary[]>
) {
  const [properties, setProperties] = useState<PropertySummary[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const id = Number(wardId);
    if (!enabled || !wardId || !fetchProperties || isNaN(id) || id <= 0) {
      queueMicrotask(() => setProperties([]));
      return;
    }
    let cancelled = false;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLoading(true);
    fetchProperties(id)
      .then((p) => { if (!cancelled) setProperties(p); })
      .catch(() => { if (!cancelled) setProperties([]); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [wardId, enabled, fetchProperties]);

  return { properties, propLoading: loading };
}

// ─── small hook: fetch PropertyTypeMaster once ───────────────────────────────
export function usePropertyTypes() {
  const [propertyTypes, setPropertyTypes] = useState<PropertyType[]>([]);
  useEffect(() => {
    getPropertyTypesAction().then(setPropertyTypes).catch(() => setPropertyTypes([]));
  }, []);
  return propertyTypes;
}

// ─── small hook: fetch Assessment Statuses once ─────────────────────────────
export function useAssessmentTypes() {
  const [assessmentTypes, setAssessmentTypes] = useState<Array<{ id: number; name: string }>>([]);
  useEffect(() => {
    getAssessmentTypesAction().then(setAssessmentTypes).catch(() => setAssessmentTypes([]));
  }, []);
  return assessmentTypes;
}

// ─── small hook: fetch paginated properties on wardId change ────────────────
export function usePaginatedProperties(wardId: string[], selectionMode: string) {
  const [paginatedProperties, setPaginatedProperties] = useState<Array<{
    value: string;
    label: string;
    partitionNo: string;
  }>>([]);
  const [hasMoreProperties, setHasMoreProperties] = useState(false);
  const [propertyPage, setPropertyPage] = useState(1);
  const [isFetchingProperties, setIsFetchingProperties] = useState(false);
  const [isLoadingMoreProperties, setIsLoadingMoreProperties] = useState(false);

  useEffect(() => {
    setPaginatedProperties([]);
    setHasMoreProperties(false);
    setPropertyPage(1);
  }, [wardId]);

  const fetchPaginatedProperties = async () => {
    if (wardId.length === 0 || isFetchingProperties) return;
    setIsFetchingProperties(true);
    try {
      const res = await searchPropertiesByCategoryAction(2, wardId[0], 1, 100);
      if (res?.items?.items) {
        const mapped = res.items.items.map((b: any) => {
          const part = b.partitionNo?.trim();
          const hasPart = part && part !== '0' && part !== '';
          const label = hasPart ? `${b.propertyNo}/${part}` : b.propertyNo;
          const val = b.propertyId ? `${label}|${b.propertyId}` : label;
          return { value: val, label, partitionNo: part || '' };
        });
        setPaginatedProperties(mapped);
        setPropertyPage(1);
        const totalPages = res.items.totalPages || Math.ceil((res.items.totalCount || 0) / 100);
        setHasMoreProperties(1 < totalPages);
      } else {
        setPaginatedProperties([]);
        setHasMoreProperties(false);
      }
    } catch {
      // Empty fallback
    } finally {
      setIsFetchingProperties(false);
    }
  };

  const loadMoreProperties = async () => {
    if (!hasMoreProperties || isLoadingMoreProperties || isFetchingProperties) return;
    if (wardId.length === 0) return;
    setIsLoadingMoreProperties(true);
    try {
      const nextPage = propertyPage + 1;
      const res = await searchPropertiesByCategoryAction(2, wardId[0], nextPage, 100);
      if (res?.items?.items) {
        const mapped = res.items.items.map((b: any) => {
          const part = b.partitionNo?.trim();
          const hasPart = part && part !== '0' && part !== '';
          const label = hasPart ? `${b.propertyNo}/${part}` : b.propertyNo;
          const val = b.propertyId ? `${label}|${b.propertyId}` : label;
          return { value: val, label, partitionNo: part || '' };
        });
        setPaginatedProperties(prev => {
          const newItems = mapped.filter((m: any) => !prev.some(p => p.value === m.value));
          return [...prev, ...newItems];
        });
        setPropertyPage(nextPage);
        const totalPages = res.items.totalPages || Math.ceil((res.items.totalCount || 0) / 100);
        setHasMoreProperties(nextPage < totalPages);
      } else {
        setHasMoreProperties(false);
      }
    } catch {
      // Empty fallback
    } finally {
      setIsLoadingMoreProperties(false);
    }
  };

  useEffect(() => {
    if (selectionMode === 'property' && wardId.length > 0) {
      fetchPaginatedProperties();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectionMode, wardId]);

  return {
    paginatedProperties,
    hasMoreProperties,
    propertyPage,
    isFetchingProperties,
    isLoadingMoreProperties,
    fetchPaginatedProperties,
    loadMoreProperties,
    setPaginatedProperties,
    setHasMoreProperties,
    setPropertyPage
  };
}

// ─── small hook: handle generate from drawer ──────────────────────────────────
export function useGenerateFromDrawer({
  selectedProperties,
  report,
  createReportRequest,
  setIsPropertyDrawerOpen,
  paramValues,
  parameters,
  handleSubmit
}: {
  selectedProperties: string[];
  report: ReportDefinition | null;
  createReportRequest: any;
  setIsPropertyDrawerOpen: (open: boolean) => void;
  paramValues: Record<string, string>;
  parameters: ReportParameterDefinition[];
  handleSubmit: (overrideParams?: Record<string, string>) => void;
}) {
  const handleGenerateFromDrawer = () => {
    if (selectedProperties.length === 0 || !report || !createReportRequest) return;
    setIsPropertyDrawerOpen(false);

    const overrideParams = { ...paramValues };

    const selectedPropertyIds = Array.from(
      new Set(selectedProperties.map((id) => id.trim()).filter(Boolean))
    );
    const propertyIdsCsv = selectedPropertyIds.join(',');

    parameters
      .filter((p) =>
        /^(property|prop)/i.test(p.parameterKey) &&
        !/from|to|description|type|id/i.test(p.parameterKey)
      )
      .forEach((p) => {
        delete overrideParams[p.parameterKey];
      });

    overrideParams.ownerId = propertyIdsCsv;
    overrideParams.propertyId = propertyIdsCsv;
    overrideParams.propertySelectionMode = 'property';

    handleSubmit(overrideParams);
  };

  return handleGenerateFromDrawer;
}
