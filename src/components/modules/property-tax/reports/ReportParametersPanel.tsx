'use client';

import { Send, CheckCircle2 } from 'lucide-react';
import { ApplyButton, ClearButton, SearchSelect, Tabs, TabList, Tab, Label, Badge, ValidationMessage } from '@/components/common';
import type { ReportDefinition, ReportParamsPanelCopy } from '@/types/report.types';
import { useReportParameters } from './useReportParameters';

interface ReportParametersPanelProps {
  /** The selected report from the left tabs panel */
  report: ReportDefinition | null;
  /** Called when a report is successfully queued */
  onQueued?: (reportRequestId: string) => void;
  /** Translated copy strings */
  copy: ReportParamsPanelCopy;
}

function FieldLabel({ children, required }: { children: React.ReactNode; required?: boolean }) {
  return (
    <Label
      required={required}
      className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1.5 flex items-center gap-1.5"
    >
      <span className="w-1.5 h-3.5 rounded-full bg-blue-600 block shrink-0" />
      {children}
    </Label>
  );
}

export function ReportParametersPanel({ report, onQueued, copy }: ReportParametersPanelProps) {
  const {
    zoneId, wardId,
    financialYearId, setFinancialYearId, setFieldErrors,
    selectedPropertyId, setSelectedPropertyId,
    propertyMode, setPropertyMode,
    fromPropertyNo, setFromPropertyNo,
    toPropertyNo, setToPropertyNo,
    loadingYears, loadingZones, loadingWards, loadingProperties,
    isPending, submitStatus, errorMsg, fieldErrors,
    yearOptions, zoneOptions, wardOptions, propertyOptions,
    handleZoneChange, handleWardChange, handleReset, handleSubmit,
  } = useReportParameters({ report, onQueued, copy });

  if (!report) {
    return (
      <div className="flex flex-col items-center justify-center h-full py-16 text-center gap-3">
        <Badge variant="secondary" size="lg" icon={Send} className="h-auto py-2.5 px-4 font-medium text-gray-500 rounded-2xl">
          {copy.emptyState}
        </Badge>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4 p-5">
      {/* Financial Year */}
      <div>
        <FieldLabel required>{copy.financialYear}</FieldLabel>
        <SearchSelect
          id="financialYear"
          name="financialYear"
          value={financialYearId}
          onChange={(_, val) => {
            setFinancialYearId(val);
            setFieldErrors((prev) => ({ ...prev, financialYearId: undefined }));
          }}
          placeholder={copy.selectYear}
          options={yearOptions}
          isLoading={loadingYears}
          required
          error={fieldErrors.financialYearId}
        />
      </div>

      {/* Zone & Ward */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <FieldLabel required>{copy.zoneNo}</FieldLabel>
          <SearchSelect
            id="zone"
            name="zone"
            value={zoneId}
            onChange={(_, val) => handleZoneChange(val)}
            placeholder={copy.selectZone}
            options={zoneOptions}
            isLoading={loadingZones}
            required
            error={fieldErrors.zoneId}
          />
        </div>
        <div>
          <FieldLabel required>{copy.wardNo}</FieldLabel>
          <SearchSelect
            id="ward"
            name="ward"
            value={wardId}
            onChange={(_, val) => handleWardChange(val)}
            disabled={!zoneId || loadingWards}
            placeholder={loadingWards ? copy.loading : !zoneId ? copy.selectZoneFirst : copy.selectWard}
            options={wardOptions}
            isLoading={loadingWards}
            required
            error={fieldErrors.wardId}
          />
        </div>
      </div>

      {/* Property Mode Toggle */}
      <div>
        <FieldLabel>{copy.propertySelection}</FieldLabel>
        <Tabs
          value={propertyMode}
          onChange={(value) => {
            const nextMode = value as 'single' | 'range';
            setPropertyMode(nextMode);
            if (nextMode === 'single') {
              setFromPropertyNo('');
              setToPropertyNo('');
            } else {
              setSelectedPropertyId('');
            }
          }}
          variant="pills"
          size="sm"
          className="mb-3"
        >
          <TabList className="flex w-full gap-1 rounded-lg border border-gray-200 bg-gray-100 p-1" scrollable={false}>
            <Tab value="single" className="flex-1 justify-center py-2 text-xs font-semibold">{copy.propertyNo}</Tab>
            <Tab value="range" className="flex-1 justify-center py-2 text-xs font-semibold">{copy.fromPropertyToProperty}</Tab>
          </TabList>
        </Tabs>

        {propertyMode === 'single' && (
          <SearchSelect
            id="propertySelect"
            name="propertySelect"
            label={copy.propertyNo}
            value={selectedPropertyId}
            onChange={(_, val) => setSelectedPropertyId(val)}
            disabled={!wardId || loadingProperties}
            placeholder={loadingProperties ? copy.loading : !wardId ? copy.selectWardFirst : copy.selectProperty}
            options={propertyOptions}
            isLoading={loadingProperties}
          />
        )}

        {propertyMode === 'range' && (
          <div className="grid grid-cols-2 gap-3">
            <SearchSelect
              id="fromPropertyNo"
              name="fromPropertyNo"
              label={copy.fromProperty}
              value={fromPropertyNo}
              onChange={(_, val) => setFromPropertyNo(val)}
              disabled={!wardId || loadingProperties}
              placeholder={loadingProperties ? copy.loading : !wardId ? copy.selectWardFirst : copy.selectStartProperty}
              options={propertyOptions}
              isLoading={loadingProperties}
            />
            <SearchSelect
              id="toPropertyNo"
              name="toPropertyNo"
              label={copy.toProperty}
              value={toPropertyNo}
              onChange={(_, val) => setToPropertyNo(val)}
              disabled={!wardId || loadingProperties}
              placeholder={loadingProperties ? copy.loading : !wardId ? copy.selectWardFirst : copy.selectEndProperty}
              options={propertyOptions}
              isLoading={loadingProperties}
            />
          </div>
        )}
      </div>

      {/* Status messages */}
      <ValidationMessage message={errorMsg} visible={submitStatus === 'error'} />
      {submitStatus === 'success' && (
        <div className="flex items-start gap-2.5 bg-emerald-50/70 border border-emerald-100/80 rounded-xl px-4 py-3 text-xs font-semibold text-emerald-800">
          <CheckCircle2 className="w-4 h-4 flex-shrink-0 mt-0.5 text-emerald-600" />
          <span>{copy.queuedSuccess}</span>
        </div>
      )}

      {/* Action buttons */}
      <div className="flex gap-2.5 mt-2 pt-3 border-t border-gray-100">
        <ClearButton type="button" size="md" label={copy.buttons.reset} onClick={handleReset} disabled={isPending} />
        <ApplyButton
          type="button"
          size="md"
          label={isPending ? copy.buttons.queuing : copy.buttons.generate}
          isLoading={isPending}
          onClick={handleSubmit}
          disabled={isPending || !financialYearId || !zoneId || !wardId}
          className="w-auto min-w-[150px] rounded-xl py-2.5 font-bold tracking-wide shadow-md hover:shadow-lg active:scale-95 transition-all duration-150"
        />
      </div>
    </div>
  );
}
