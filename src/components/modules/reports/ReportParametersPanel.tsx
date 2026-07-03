'use client';

import { useState, useEffect, useTransition } from 'react';
import { Send, Loader2, AlertCircle, CheckCircle2, RotateCcw } from 'lucide-react';
import { toast } from 'sonner';
import { Button, Input, SearchSelect } from '@/components/common';
import {
  getFinancialYearsAction,
  getZonesAction,
  getWardsByZoneAction,
  resolvePropertyIdAction,
  resolvePropertiesAction,
  type PropertySummaryItem,
} from '@/app/[locale]/reports/action';
import type { FinancialYear } from '@/types/financialYear.types';
import type { ZoneSummary, WardSummary, ReportDefinition } from '@/types/report.types';

interface ReportParametersPanelProps {
  /** The selected report from the left tabs panel */
  report: ReportDefinition | null;
  /** Called when a report is successfully queued */
  onQueued?: () => void;
}

function FieldLabel({ children, required }: { children: React.ReactNode; required?: boolean }) {
  return (
    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-widest mb-1.5">
      {children}
      {required && <span className="text-red-500 ml-0.5">*</span>}
    </label>
  );
}

export function ReportParametersPanel({ report, onQueued }: ReportParametersPanelProps) {
  const [financialYears, setFinancialYears] = useState<FinancialYear[]>([]);
  const [zones, setZones] = useState<ZoneSummary[]>([]);
  const [wards, setWards] = useState<WardSummary[]>([]);

  // Form values
  const [financialYearId, setFinancialYearId] = useState('');
  const [zoneId, setZoneId] = useState('');
  const [wardId, setWardId] = useState('');
  const [propertyNo, setPropertyNo] = useState('');

  // Partitions resolution state
  const [matchingProperties, setMatchingProperties] = useState<PropertySummaryItem[]>([]);
  const [selectedPropertyId, setSelectedPropertyId] = useState('');
  const [searchingProperties, setSearchingProperties] = useState(false);

  // Loading states
  const [loadingYears, setLoadingYears] = useState(true);
  const [loadingZones, setLoadingZones] = useState(true);
  const [loadingWards, setLoadingWards] = useState(false);

  const [isPending, startTransition] = useTransition();
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState('');

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
    setWardId('');
    setWards([]);
    if (!zoneId) return;
    setLoadingWards(true);
    getWardsByZoneAction(Number(zoneId)).then((w) => {
      setWards(w);
      setLoadingWards(false);
    });
  }, [zoneId]);

  // Debounced resolution of property No & ward into matches
  useEffect(() => {
    setMatchingProperties([]);
    setSelectedPropertyId('');
    setErrorMsg('');
    setSubmitStatus('idle');

    const trimmed = propertyNo.trim();
    if (!trimmed) return;

    const delayDebounce = setTimeout(async () => {
      setSearchingProperties(true);
      try {
        const props = await resolvePropertiesAction(trimmed, wardId ? Number(wardId) : undefined);
        setMatchingProperties(props);
        if (props.length === 1) {
          // Auto select if only 1 exists
          setSelectedPropertyId(String(props[0].propertyId));
        }
      } catch {
        // Silently catch
      } finally {
        setSearchingProperties(false);
      }
    }, 600);

    return () => clearTimeout(delayDebounce);
  }, [propertyNo, wardId]);

  useEffect(() => {
    setSubmitStatus('idle');
    setErrorMsg('');
  }, [report]);

  const handleReset = () => {
    setFinancialYearId('');
    setZoneId('');
    setWardId('');
    setPropertyNo('');
    setMatchingProperties([]);
    setSelectedPropertyId('');
    setSubmitStatus('idle');
    setErrorMsg('');
  };

  const handleSubmit = () => {
    if (!report) return;

    setSubmitStatus('idle');
    setErrorMsg('');

    // If multiple properties/partitions exist but user did not select one
    if (matchingProperties.length > 1 && !selectedPropertyId) {
      setSubmitStatus('error');
      setErrorMsg('Multiple properties/partitions found. Please select a partition from the dropdown first.');
      return;
    }

    startTransition(async () => {
      try {
        let propertyId: number | null = null;

        if (propertyNo.trim()) {
          if (selectedPropertyId) {
            propertyId = Number(selectedPropertyId);
          } else {
            // Fallback resolve
            propertyId = await resolvePropertyIdAction(propertyNo.trim(), wardId ? Number(wardId) : undefined);
            if (propertyId === null) {
              setSubmitStatus('error');
              setErrorMsg(`Property number "${propertyNo}" not found. Please check and try again.`);
              return;
            }
          }
        }

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
        if (propertyNo.trim()) {
          parameters.propertyNo = propertyNo.trim();
          parameters.PropertyNo = propertyNo.trim();
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

        setSubmitStatus('success');
        toast.success(`Report "${report.reportName}" queued successfully!`);
        onQueued?.();
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
          onChange={(_, val) => setFinancialYearId(val)}
          placeholder="Select year"
          options={yearOptions}
          isLoading={loadingYears}
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <FieldLabel>Zone No.</FieldLabel>
          <SearchSelect
            id="zone"
            name="zone"
            value={zoneId}
            onChange={(_, val) => setZoneId(val)}
            placeholder="All Zones"
            options={zoneOptions}
            isLoading={loadingZones}
          />
        </div>
        <div>
          <FieldLabel>Ward No.</FieldLabel>
          <SearchSelect
            id="ward"
            name="ward"
            value={wardId}
            onChange={(_, val) => setWardId(val)}
            disabled={!zoneId || loadingWards}
            placeholder={loadingWards ? 'Loading...' : !zoneId ? 'Select zone first' : 'All Wards'}
            options={wardOptions}
            isLoading={loadingWards}
          />
        </div>
      </div>

      <div>
        <FieldLabel>Property Number</FieldLabel>
        <Input
          type="text"
          id="propertyNo"
          value={propertyNo}
          onChange={(e) => setPropertyNo(e.target.value)}
          placeholder="e.g. 001001"
          fullWidth
          className="border-gray-200 py-2.5 focus:ring-blue-500"
        />
        <p className="text-[10px] text-gray-400 mt-1">Enter the property number - the system will find the property ID automatically.</p>
      </div>

      {/* ── Partition Select Dropdown ── */}
      {searchingProperties && (
        <div className="flex items-center gap-2 text-xs text-gray-400 py-1">
          <Loader2 className="w-3.5 h-3.5 animate-spin" /> Resolving property partitions...
        </div>
      )}

      {!searchingProperties && matchingProperties.length > 1 && (
        <div className="bg-blue-50/50 border border-blue-100 rounded-lg p-3.5 flex flex-col gap-2">
          <FieldLabel required>Partition / Owner</FieldLabel>
          <SearchSelect
            id="selectedPropertyId"
            name="selectedPropertyId"
            value={selectedPropertyId}
            onChange={(_, val) => setSelectedPropertyId(val)}
            placeholder="Select a partition"
            options={matchingProperties.map((p) => ({
              value: String(p.propertyId),
              label: p.partitionNo 
                ? `Partition ${p.partitionNo} (${p.ownerName})` 
                : `Main Property (No Partition) (${p.ownerName})`,
            }))}
          />
          <p className="text-[10px] text-gray-400">Multiple partitions found for Property No. {propertyNo}. Please choose one to generate its report.</p>
        </div>
      )}

      {!searchingProperties && propertyNo.trim() !== '' && matchingProperties.length === 0 && (
        <div className="flex items-center gap-1.5 text-xs text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2">
          <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
          <span>No matching property found for Number "{propertyNo}".</span>
        </div>
      )}

      {submitStatus === 'error' && (
        <div className="flex items-start gap-2.5 bg-red-50 border border-red-200 rounded-lg px-4 py-3 text-sm text-red-700">
          <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
          <span>{errorMsg}</span>
        </div>
      )}
      {submitStatus === 'success' && (
        <div className="flex items-start gap-2.5 bg-green-50 border border-green-200 rounded-lg px-4 py-3 text-sm text-green-700">
          <CheckCircle2 className="w-4 h-4 flex-shrink-0 mt-0.5" />
          <span>Report queued! It will appear in the jobs list when ready.</span>
        </div>
      )}

      <div className="flex gap-2.5 mt-2 pt-3 border-t border-gray-100">
        <Button
          type="button"
          variant="secondary"
          size="md"
          icon={RotateCcw}
          onClick={handleReset}
          disabled={isPending}
          className="border-gray-200 text-gray-600"
        >
          Reset
        </Button>
        <Button
          type="button"
          size="md"
          icon={Send}
          isLoading={isPending}
          onClick={handleSubmit}
          disabled={isPending || !financialYearId || (propertyNo.trim() !== '' && matchingProperties.length === 0)}
          className="flex-1 bg-[#004c8c] hover:bg-[#003d6f] border-[#004c8c] text-white shadow-sm shadow-blue-100"
        >
          {isPending ? 'Queuing...' : 'Generate Report'}
        </Button>
      </div>
    </div>
  );
}
