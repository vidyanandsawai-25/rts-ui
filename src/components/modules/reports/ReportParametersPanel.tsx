'use client';

import { useState, useEffect, useMemo, useTransition } from 'react';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { Send, AlertCircle, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';
import { ApplyButton, ClearButton, SearchSelect, Tabs, TabList, Tab } from '@/components/common';
import {
  getFinancialYearsAction,
  getZonesAction,
  getWardsByZoneAction,
  getPropertiesByWardAction,
} from '@/app/[locale]/reports/action';
import type { FinancialYear } from '@/types/financialYear.types';
import type { ZoneSummary, WardSummary, PropertySummary, ReportDefinition } from '@/types/report.types';

interface ReportParametersPanelProps {
  /** The selected report from the left tabs panel */
  report: ReportDefinition | null;
  /** Called when a report is successfully queued */
  onQueued?: (reportRequestId: string) => void;
}

function FieldLabel({ children, required }: { children: React.ReactNode; required?: boolean }) {
  return (
    <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1.5 flex items-center gap-1.5">
      <span className="w-1.5 h-3.5 rounded-full bg-blue-600 block shrink-0" />
      {children}
      {required && <span className="text-red-500 ml-0.5">*</span>}
    </label>
  );
}

export function ReportParametersPanel({ report, onQueued }: ReportParametersPanelProps) {
  const [financialYears, setFinancialYears] = useState<FinancialYear[]>([]);
  const [zones, setZones] = useState<ZoneSummary[]>([]);
  const [wards, setWards] = useState<WardSummary[]>([]);

  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Read Zone/Ward from URL Search Parameters
  const zoneId = searchParams.get('zoneId') ?? '';
  const wardId = searchParams.get('wardId') ?? '';

  // Form values
  const [financialYearId, setFinancialYearId] = useState('');
  const [selectedPropertyId, setSelectedPropertyId] = useState('');
  const [propertyMode, setPropertyMode] = useState<'single' | 'range'>('single');
  const [fromPropertyNo, setFromPropertyNo] = useState('');
  const [toPropertyNo, setToPropertyNo] = useState('');

  // Loading states
  const [loadingYears, setLoadingYears] = useState(true);
  const [loadingZones, setLoadingZones] = useState(true);
  const [loadingWards, setLoadingWards] = useState(false);
  const [properties, setProperties] = useState<PropertySummary[]>([]);
  const [loadingProperties, setLoadingProperties] = useState(false);

  const [isPending, startTransition] = useTransition();
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState('');
  const [fieldErrors, setFieldErrors] = useState<{ financialYearId?: string; zoneId?: string; wardId?: string }>({});

  useEffect(() => {
    getFinancialYearsAction().then((years) => {
      setFinancialYears(years);
      setLoadingYears(false);
      // Auto-select the first active year so user doesn't get a disabled button by default
      if (years.length > 0) {
        setFinancialYearId(String(years[0].id));
      }
    });
    getZonesAction().then((z) => {
      setZones(z);
      setLoadingZones(false);
    });
  }, []);

  useEffect(() => {
    setWards([]);
    if (!zoneId) return;
    setLoadingWards(true);
    getWardsByZoneAction(Number(zoneId)).then((w) => {
      setWards(w);
      setLoadingWards(false);
    });
  }, [zoneId]);

  useEffect(() => {
    setProperties([]);
    setSelectedPropertyId('');
    setFromPropertyNo('');
    setToPropertyNo('');
    if (!wardId) return;
    setLoadingProperties(true);
    getPropertiesByWardAction(Number(wardId))
      .then((props) => {
        setProperties(props);
      })
      .finally(() => {
        setLoadingProperties(false);
      });
  }, [wardId]);

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
    next.delete('wardId'); // clear ward when zone changes
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

    // Clear zone/ward from URL
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
    if (!financialYearId) nextFieldErrors.financialYearId = 'Financial year is required.';
    if (!zoneId) nextFieldErrors.zoneId = 'Zone is required.';
    if (!wardId) nextFieldErrors.wardId = 'Ward is required.';

    if (Object.keys(nextFieldErrors).length > 0) {
      setFieldErrors(nextFieldErrors);
      setSubmitStatus('error');
      setErrorMsg('Please fill all required fields.');
      return;
    }

    startTransition(async () => {
      try {
        const selectedProperty = properties.find((p) => String(p.propertyId) === selectedPropertyId);
        const currentPropertyNo = selectedProperty ? selectedProperty.propertyNo : '';
        const propertyId = (propertyMode === 'single' && selectedPropertyId) ? Number(selectedPropertyId) : null;

        // Build parameters - userId is injected server-side in the route handler
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
          if (fromPropertyNo.trim()) {
            parameters.fromPropertyNo = fromPropertyNo.trim();
            parameters.FromPropertyNo = fromPropertyNo.trim();
          }
          if (toPropertyNo.trim()) {
            parameters.toPropertyNo = toPropertyNo.trim();
            parameters.ToPropertyNo = toPropertyNo.trim();
          }
        }
        if (propertyId !== null) {
          parameters.propertyId = String(propertyId);
          parameters.PropertyId = String(propertyId);
        }

        const response = await fetch('/api/report-request', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ reportCode: report.reportCode, parameters }),
        });

        if (!response.ok) {
          const err = await response.json().catch(() => ({ error: 'Failed to queue report' }));
          setSubmitStatus('error');
          setErrorMsg(err.error || 'Failed to queue report');
          return;
        }

        const result = await response.json().catch(() => ({}));
        setSubmitStatus('success');
        toast.success(`Report "${report.reportName}" queued successfully!`);
        onQueued?.(result.reportRequestId || '');
      } catch {
        setSubmitStatus('error');
        setErrorMsg('Network error. Please try again.');
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
    return properties.map((p: any) => {
      let label = p.propertyNo;
      if (p.fromProperty) {
        label += `-${p.fromProperty}`;
        if (p.toProperty && p.toProperty !== p.fromProperty) {
          label += ` – ${p.toProperty}`;
        }
      } else if (p.toProperty) {
        label += `-${p.toProperty}`;
      } else if (p.partitionNo) {
        label += `-${p.partitionNo}`;
      }
      return {
        label,
        value: String(p.propertyId),
      };
    });
  }, [properties]);

  if (!report) {
    return (
      <div className="flex flex-col items-center justify-center h-full py-16 text-center text-gray-400 gap-3">
        <div className="w-12 h-12 rounded-xl bg-gray-100 flex items-center justify-center">
          <Send className="w-5 h-5 text-gray-300" />
        </div>
        <p className="text-sm text-gray-400">Select a report from the list to configure parameters</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4 p-5">
      <div>
        <FieldLabel required>Financial Year</FieldLabel>
        <SearchSelect
          id="financialYear"
          name="financialYear"
          value={financialYearId}
          onChange={(_, val) => {
            setFinancialYearId(val);
            setFieldErrors((prev) => ({ ...prev, financialYearId: undefined }));
          }}
          placeholder="Select year"
          options={yearOptions}
          isLoading={loadingYears}
          required
          error={fieldErrors.financialYearId}
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <FieldLabel required>Zone No.</FieldLabel>
          <SearchSelect
            id="zone"
            name="zone"
            value={zoneId}
            onChange={(_, val) => handleZoneChange(val)}
            placeholder="Select zone"
            options={zoneOptions}
            isLoading={loadingZones}
            required
            error={fieldErrors.zoneId}
          />
        </div>
        <div>
          <FieldLabel required>Ward No.</FieldLabel>
          <SearchSelect
            id="ward"
            name="ward"
            value={wardId}
            onChange={(_, val) => handleWardChange(val)}
            disabled={!zoneId || loadingWards}
            placeholder={loadingWards ? 'Loading...' : !zoneId ? 'Select zone first' : 'Select ward'}
            options={wardOptions}
            isLoading={loadingWards}
            required
            error={fieldErrors.wardId}
          />
        </div>
      </div>

      {/* Property Mode Toggle */}
      <div>
        <FieldLabel>Property Selection</FieldLabel>
        <Tabs
          value={propertyMode}
          onChange={(value) => {
            const nextMode = value as 'single' | 'range';
            setPropertyMode(nextMode);
            if (nextMode === 'single') {
              setFromPropertyNo('');
              setToPropertyNo('');
              return;
            }
            setSelectedPropertyId('');
          }}
          variant="pills"
          size="sm"
          className="mb-3"
        >
          <TabList className="flex w-full gap-1 rounded-lg border border-gray-200 bg-gray-100 p-1" scrollable={false}>
            <Tab value="single" className="flex-1 justify-center py-2 text-xs font-semibold">
              Property No
            </Tab>
            <Tab value="range" className="flex-1 justify-center py-2 text-xs font-semibold">
              From Property To Property
            </Tab>
          </TabList>
        </Tabs>

        {/* Single Property Dropdown */}
        {propertyMode === 'single' && (
          <div>
            <label className="block text-[12px] font-medium text-gray-400 mb-1">Property No</label>
            <SearchSelect
              id="propertySelect"
              name="propertySelect"
              value={selectedPropertyId}
              onChange={(_, val) => setSelectedPropertyId(val)}
              disabled={!wardId || loadingProperties}
              placeholder={loadingProperties ? 'Loading...' : !wardId ? 'Select ward first' : 'Select property'}
              options={propertyOptions}
              isLoading={loadingProperties}
            />
          </div>
        )}

        {/* Range Property Dropdowns */}
        {propertyMode === 'range' && (
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[12px] font-medium text-gray-400 mb-1">From Property</label>
              <SearchSelect
                id="fromPropertyNo"
                name="fromPropertyNo"
                value={fromPropertyNo}
                onChange={(_, val) => setFromPropertyNo(val)}
                disabled={!wardId || loadingProperties}
                placeholder={loadingProperties ? 'Loading...' : !wardId ? 'Select ward first' : 'Select start property'}
                options={propertyOptions}
                isLoading={loadingProperties}
              />
            </div>
            <div>
              <label className="block text-[12px] font-medium text-gray-400 mb-1">To Property</label>
              <SearchSelect
                id="toPropertyNo"
                name="toPropertyNo"
                value={toPropertyNo}
                onChange={(_, val) => setToPropertyNo(val)}
                disabled={!wardId || loadingProperties}
                placeholder={loadingProperties ? 'Loading...' : !wardId ? 'Select ward first' : 'Select end property'}
                options={propertyOptions}
                isLoading={loadingProperties}
              />
            </div>
          </div>
        )}
      </div>

      {submitStatus === 'error' && (
        <div className="flex items-start gap-2.5 bg-rose-50/70 border border-rose-100/80 rounded-xl px-4 py-3 text-xs font-semibold text-rose-800">
          <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5 text-rose-600" />
          <span>{errorMsg}</span>
        </div>
      )}
      {submitStatus === 'success' && (
        <div className="flex items-start gap-2.5 bg-emerald-50/70 border border-emerald-100/80 rounded-xl px-4 py-3 text-xs font-semibold text-emerald-800">
          <CheckCircle2 className="w-4 h-4 flex-shrink-0 mt-0.5 text-emerald-600" />
          <span>Report queued! It will appear in the jobs list when ready.</span>
        </div>
      )}

      <div className="flex gap-2.5 mt-2 pt-3 border-t border-gray-100">
        <ClearButton
          type="button"
          size="md"
          label="Reset"
          onClick={handleReset}
          disabled={isPending}
        />
        <ApplyButton
          type="button"
          size="md"
          label={isPending ? 'Queuing...' : 'Generate Report'}
          isLoading={isPending}
          onClick={handleSubmit}
          disabled={isPending || !financialYearId || !zoneId || !wardId}
          className="w-auto min-w-[150px] rounded-xl py-2.5 font-bold tracking-wide shadow-md hover:shadow-lg active:scale-95 transition-all duration-150"
        />
      </div>
    </div>
  );
}
