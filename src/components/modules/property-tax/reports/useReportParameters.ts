/* eslint-disable react-hooks/set-state-in-effect */
'use client';

import { useState, useEffect, useMemo, useTransition } from 'react';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { toast } from 'sonner';
import type { FinancialYear } from '@/types/financialYear.types';
import type { ZoneSummary, WardSummary, PropertySummary, ReportDefinition, ReportParamsPanelCopy } from '@/types/report.types';

interface UseReportParametersOptions {
  report: ReportDefinition | null;
  onQueued?: (reportRequestId: string) => void;
  copy: ReportParamsPanelCopy;
  zones?: ZoneSummary[];
  financialYears?: FinancialYear[];
  /** Injected from page.tsx — fetches wards for a given zone */
  fetchWards?: (zoneId: number) => Promise<WardSummary[]>;
  /** Injected from page.tsx — fetches properties for a given ward */
  fetchProperties?: (wardId: number) => Promise<PropertySummary[]>;
}

export function useReportParameters({ report, onQueued, copy, zones: initialZones, financialYears: initialYears, fetchWards, fetchProperties }: UseReportParametersOptions) {
  const [financialYears, setFinancialYears] = useState<FinancialYear[]>(initialYears || []);
  const [zones, setZones] = useState<ZoneSummary[]>(initialZones || []);
  const [wards, setWards] = useState<WardSummary[]>([]);

  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Read Zone/Ward from URL Search Parameters
  const zoneId = searchParams.get('zoneId') ?? '';
  const wardId = searchParams.get('wardId') ?? '';

  // Form values
  const [financialYearId, setFinancialYearId] = useState(() => {
    if (initialYears && initialYears.length > 0) {
      return String(initialYears[0].id);
    }
    return '';
  });
  const [selectedPropertyId, setSelectedPropertyId] = useState('');
  const [propertyMode, setPropertyMode] = useState<'single' | 'range'>('single');
  const [fromPropertyNo, setFromPropertyNo] = useState('');
  const [toPropertyNo, setToPropertyNo] = useState('');

  // Loading states — years and zones are always pre-loaded from page.tsx
  const [loadingYears] = useState(false);
  const [loadingZones] = useState(false);
  const [loadingWards, setLoadingWards] = useState(false);
  const [properties, setProperties] = useState<PropertySummary[]>([]);
  const [loadingProperties, setLoadingProperties] = useState(false);

  const [isPending, startTransition] = useTransition();
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState('');
  const [fieldErrors, setFieldErrors] = useState<{ financialYearId?: string; zoneId?: string; wardId?: string }>({});

  // Years and zones are pre-fetched on the server in page.tsx and passed as props.
  // No client-side fetching needed for the initial data.

  useEffect(() => {
    setWards([]);
    if (!zoneId) return;
    if (!fetchWards) return;
    setLoadingWards(true);
    fetchWards(Number(zoneId)).then((w) => {
      setWards(w);
      setLoadingWards(false);
    });
  }, [zoneId, fetchWards]);

  useEffect(() => {
    setProperties([]);
    setSelectedPropertyId('');
    setFromPropertyNo('');
    setToPropertyNo('');
    if (!wardId) return;
    if (!fetchProperties) return;
    setLoadingProperties(true);
    fetchProperties(Number(wardId))
      .then((props) => {
        setProperties(props);
      })
      .finally(() => {
        setLoadingProperties(false);
      });
  }, [wardId, fetchProperties]);

  useEffect(() => {
    setSubmitStatus('idle');
    setErrorMsg('');
  }, [report]);

  const handleZoneChange = (val: string) => {
    setFieldErrors((prev) => ({ ...prev, zoneId: undefined, wardId: undefined }));
    const next = new URLSearchParams(searchParams.toString());
    if (val) {
      next.set('zoneId', val);
    } else {
      next.delete('zoneId');
    }
    next.delete('wardId');
    router.push(`${pathname}?${next.toString()}`);
  };

  const handleWardChange = (val: string) => {
    setFieldErrors((prev) => ({ ...prev, wardId: undefined }));
    const next = new URLSearchParams(searchParams.toString());
    if (val) {
      next.set('wardId', val);
    } else {
      next.delete('wardId');
    }
    router.push(`${pathname}?${next.toString()}`);
  };

  const handleReset = () => {
    setFinancialYearId('');
    setSelectedPropertyId('');
    setFromPropertyNo('');
    setToPropertyNo('');
    setProperties([]);
    setSubmitStatus('idle');
    setErrorMsg('');
    setFieldErrors({});

    const next = new URLSearchParams(searchParams.toString());
    next.delete('zoneId');
    next.delete('wardId');
    router.push(`${pathname}?${next.toString()}`);
  };

  const handleSubmit = () => {
    if (!report) return;

    setSubmitStatus('idle');
    setErrorMsg('');

    const nextFieldErrors: { financialYearId?: string; zoneId?: string; wardId?: string } = {};
    if (!financialYearId) nextFieldErrors.financialYearId = copy.validation.financialYearRequired;
    if (!zoneId) nextFieldErrors.zoneId = copy.validation.zoneRequired;
    if (!wardId) nextFieldErrors.wardId = copy.validation.wardRequired;

    if (Object.keys(nextFieldErrors).length > 0) {
      setFieldErrors(nextFieldErrors);
      setSubmitStatus('error');
      setErrorMsg(copy.validation.fillAllRequired);
      return;
    }

    startTransition(async () => {
      try {
        const selectedProperty = properties.find((p) => String(p.propertyId) === selectedPropertyId);
        const currentPropertyNo = selectedProperty ? selectedProperty.propertyNo : '';
        const propertyId = (propertyMode === 'single' && selectedPropertyId) ? Number(selectedPropertyId) : null;

        const parameters: Record<string, string> = {};
        if (financialYearId) {
          parameters.financialYearId = financialYearId;
          parameters.FinancialYearId = financialYearId;
        }
        if (zoneId) {
          parameters.zoneId = zoneId;
          parameters.ZoneId = zoneId;
        }
        if (wardId) {
          parameters.wardId = wardId;
          parameters.WardId = wardId;
        }
        if (propertyMode === 'single' && currentPropertyNo) {
          parameters.propertyNo = currentPropertyNo;
          parameters.PropertyNo = currentPropertyNo;
        }
        if (propertyMode === 'range') {
          const fromIndex = properties.findIndex((p) => String(p.propertyId) === fromPropertyNo);
          const toIndex = properties.findIndex((p) => String(p.propertyId) === toPropertyNo);

          if (fromIndex !== -1 && toIndex !== -1) {
            const start = Math.min(fromIndex, toIndex);
            const end = Math.max(fromIndex, toIndex);
            const rangeProperties = properties.slice(start, end + 1);
            const bulkIds = rangeProperties.map((p) => p.propertyId).join(',');
            parameters.propertyId = bulkIds;
            parameters.PropertyId = bulkIds;
          } else if (fromIndex !== -1) {
            parameters.propertyId = String(properties[fromIndex].propertyId);
            parameters.PropertyId = String(properties[fromIndex].propertyId);
          } else if (toIndex !== -1) {
            parameters.propertyId = String(properties[toIndex].propertyId);
            parameters.PropertyId = String(properties[toIndex].propertyId);
          }
        } else if (propertyId !== null) {
          parameters.propertyId = String(propertyId);
          parameters.PropertyId = String(propertyId);
        }

        const response = await fetch('/api/report-request', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ reportCode: report.reportCode, parameters }),
        });

        if (!response.ok) {
          const err = await response.json().catch(() => ({ error: copy.validation.failedToQueue }));
          setSubmitStatus('error');
          setErrorMsg(err.error || copy.validation.failedToQueue);
          return;
        }

        const result = await response.json().catch(() => ({}));
        setSubmitStatus('success');
        toast.success(copy.reportQueued.replace('{name}', report.reportName));
        onQueued?.(result.reportRequestId || '');
      } catch {
        setSubmitStatus('error');
        setErrorMsg(copy.validation.networkError);
      }
    });
  };

  const yearOptions = financialYears.map((y) => ({
    value: String(y.id),
    label: y.yearCode ?? String(y.year),
  }));

  const zoneOptions = zones.map((z) => ({
    value: String(z.id),
    label: z.description || z.zoneNo || `Zone ${z.id}`,
  }));

  const wardOptions = wards.map((w) => ({
    value: String(w.id),
    label: w.description || w.wardNo || `Ward ${w.id}`,
  }));

  const propertyOptions = useMemo(() => {
    return properties.map((p: PropertySummary) => {
      // Build label from typed fields only — PropertySummary has propertyNo and partitionNo
      const label = p.partitionNo ? `${p.propertyNo}-${p.partitionNo}` : p.propertyNo;
      return { label, value: String(p.propertyId) };
    });
  }, [properties]);

  return {
    // URL-driven state
    zoneId,
    wardId,
    // Form state
    financialYearId,
    selectedPropertyId,
    setSelectedPropertyId,
    propertyMode,
    setPropertyMode,
    fromPropertyNo,
    setFromPropertyNo,
    toPropertyNo,
    setToPropertyNo,
    // Loading
    loadingYears,
    loadingZones,
    loadingWards,
    loadingProperties,
    // Submit state
    isPending,
    submitStatus,
    errorMsg,
    fieldErrors,
    setFinancialYearId,
    setFieldErrors,
    // Options
    yearOptions,
    zoneOptions,
    wardOptions,
    propertyOptions,
    // Handlers
    handleZoneChange,
    handleWardChange,
    handleReset,
    handleSubmit,
  };
}
