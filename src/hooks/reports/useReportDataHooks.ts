/* eslint-disable react-hooks/set-state-in-effect */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect, useRef } from 'react';
import type { WardSummary, PropertySummary, ReportDefinition, ReportParameterDefinition } from '@/types/report.types';
import type { PropertyType } from '@/types/property-type.types';
import { getPropertyTypesAction, getAssessmentTypesAction } from '@/app/[locale]/property-tax/reports/action';
import { ptisSuggestionsClient } from '@/lib/api/ptis/tab/ptis-suggestions-client';

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
  const loadedWardIdRef = useRef<number | null>(null);

  useEffect(() => {
    const id = Number(wardId);
    if (!wardId || !fetchProperties || isNaN(id) || id <= 0) {
      loadedWardIdRef.current = null;
      queueMicrotask(() => {
        setProperties([]);
        setLoading(false);
      });
      return;
    }
    // The full property list is only needed by the selection drawer. Keep an
    // already loaded list cached while the drawer is closed.
    if (!enabled) return;
    if (loadedWardIdRef.current === id) return;
    let cancelled = false;
    setProperties([]);
    setLoading(true);
    fetchProperties(id)
      .then((p) => {
        if (!cancelled) {
          setProperties(p);
          loadedWardIdRef.current = id;
        }
      })
      .catch(() => {
        if (!cancelled) {
          setProperties([]);
          loadedWardIdRef.current = null;
        }
      })
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
type ReportPropertyOption = {
  value: string;
  label: string;
  partitionNo: string;
};

function mapPropertySuggestions(items: Array<{
  propertyId: number;
  propertyNo: string;
  partitionNo?: string;
}>): ReportPropertyOption[] {
  return items.map((property) => {
    const part = property.partitionNo?.trim() ?? '';
    const hasPart = part !== '' && part !== '0';
    const rawLabel = hasPart ? `${property.propertyNo}-${part}` : property.propertyNo;

    return {
      value: property.propertyId ? `${rawLabel}|${property.propertyId}` : rawLabel,
      label: rawLabel.replace(/\//g, '-'),
      partitionNo: part,
    };
  });
}

function mergePropertyOptions(
  initialOptions: ReportPropertyOption[],
  suggestedOptions: ReportPropertyOption[]
): ReportPropertyOption[] {
  const seen = new Set<string>();
  return [...initialOptions, ...suggestedOptions].filter((option) => {
    if (seen.has(option.value)) return false;
    seen.add(option.value);
    return true;
  });
}

export function usePaginatedProperties(wardId: string[], selectionMode: string) {
  const [initialProperties, setInitialProperties] = useState<ReportPropertyOption[]>([]);
  const [suggestedProperties, setSuggestedProperties] = useState<ReportPropertyOption[]>([]);
  const [propertySearchQuery, setPropertySearchQuery] = useState('');
  const [isLoadingInitialProperties, setIsLoadingInitialProperties] = useState(false);
  const [isSearchingProperties, setIsSearchingProperties] = useState(false);
  const selectedWardId = wardId[0] ?? '';

  useEffect(() => {
    setInitialProperties([]);
    setSuggestedProperties([]);
    setPropertySearchQuery('');

    const numericWardId = Number(selectedWardId);
    if (selectionMode !== 'property' || !Number.isFinite(numericWardId) || numericWardId <= 0) {
      setIsLoadingInitialProperties(false);
      return;
    }

    let active = true;
    setIsLoadingInitialProperties(true);
    ptisSuggestionsClient.getSuggestions({ wardId: numericWardId })
      .then((result) => {
        if (!active) return;
        setInitialProperties(
          result.success && result.data ? mapPropertySuggestions(result.data) : []
        );
      })
      .catch(() => {
        if (active) setInitialProperties([]);
      })
      .finally(() => {
        if (active) setIsLoadingInitialProperties(false);
      });

    return () => {
      active = false;
    };
  }, [selectionMode, selectedWardId]);

  useEffect(() => {
    const query = propertySearchQuery.trim();
    const numericWardId = Number(selectedWardId);
    if (
      selectionMode !== 'property' ||
      !query ||
      !Number.isFinite(numericWardId) ||
      numericWardId <= 0
    ) {
      setSuggestedProperties([]);
      setIsSearchingProperties(false);
      return;
    }

    let active = true;
    const timer = setTimeout(() => {
      setIsSearchingProperties(true);
      ptisSuggestionsClient.getSuggestions({
        wardId: numericWardId,
        propertyNo: query,
      })
        .then((result) => {
          if (!active) return;
          setSuggestedProperties(
            result.success && result.data ? mapPropertySuggestions(result.data) : []
          );
        })
        .catch(() => {
          if (active) setSuggestedProperties([]);
        })
        .finally(() => {
          if (active) setIsSearchingProperties(false);
        });
    }, 300);

    return () => {
      active = false;
      clearTimeout(timer);
    };
  }, [propertySearchQuery, selectedWardId, selectionMode]);

  return {
    paginatedProperties: mergePropertyOptions(initialProperties, suggestedProperties),
    hasMoreProperties: false,
    isFetchingProperties: isLoadingInitialProperties || isSearchingProperties,
    isLoadingMoreProperties: false,
    loadMoreProperties: () => undefined,
    onPropertySearchChange: setPropertySearchQuery,
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
