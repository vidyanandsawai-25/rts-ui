'use client';

import { Select } from '@/components/common/select';
import { useReportForm } from '@/hooks/useReportForm';
import { ReportParamField } from './ReportParamField';
import type { ReportGenerationFormProps } from '@/types/report.types';
import type { Option } from '@/components/common/select';

export function ReportGenerationForm({ copy, reportDefinitions, onQueued }: ReportGenerationFormProps) {
  const {
    reportCode,
    paramValues,
    parameters,
    parametersLoading,
    parametersError,
    isSubmitting,
    showError,
    handleReportChange,
    handleParamChange,
    handleBlur,
    handleSubmit,
    handleReset,
    selectedDefinition,
  } = useReportForm({ reportDefinitions, onQueued });

  const reportOptions: Option[] = reportDefinitions.map((d) => ({
    value: d.reportCode,
    label: d.reportName,
  }));

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Form panel */}
      <form
        onSubmit={handleSubmit}
        noValidate
        className="lg:col-span-2 bg-white rounded-xl border border-gray-200 shadow-sm p-6 flex flex-col gap-5"
      >
        {/* Report Type */}
        <Select
          name="reportCode"
          label={copy.fields.reportType}
          required
          placeholder={copy.placeholders.selectReport}
          options={reportOptions}
          value={reportCode}
          onChange={(_, v) => handleReportChange(v)}
          onBlur={() => handleBlur('reportCode')}
          error={showError('reportCode')}
        />

        {/* Dynamic parameter fields */}
        {parametersLoading && (
          <div className="flex items-center gap-2 text-sm text-gray-500 py-2">
            <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
            </svg>
            <span>Loading parameters…</span>
          </div>
        )}

        {!parametersLoading && reportCode && parametersError && (
          <div className="text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg px-4 py-3 space-y-1">
            <p className="font-medium">Failed to load parameters from API:</p>
            <code className="block font-mono text-xs break-all">{parametersError}</code>
          </div>
        )}

        {!parametersLoading && reportCode && !parametersError && parameters.length === 0 && (
          <p className="text-sm text-amber-600 bg-amber-50 border border-amber-200 rounded-lg px-4 py-3">
            No parameters are defined for{' '}
            <code className="font-mono text-xs">{selectedDefinition?.reportName ?? reportCode}</code>.
          </p>
        )}

        {!parametersLoading &&
          parameters.map((param) => (
            <ReportParamField
              key={param.parameterKey}
              param={param}
              value={paramValues[param.parameterKey] ?? ''}
              parentValue={param.cascadeFromKey ? (paramValues[param.cascadeFromKey] ?? '') : undefined}
              onChange={handleParamChange}
              onBlur={handleBlur}
              error={showError(param.parameterKey)}
            />
          ))}

        {/* Buttons */}
        <div className="flex flex-wrap gap-3 mt-2">
          <button
            type="button"
            onClick={handleReset}
            disabled={isSubmitting}
            className="px-5 py-2 rounded-lg border border-gray-300 text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors disabled:opacity-50"
          >
            {copy.buttons.reset}
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-6 py-2 rounded-lg text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center gap-2"
          >
            {isSubmitting && (
              <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
              </svg>
            )}
            {copy.buttons.generate}
          </button>
        </div>
      </form>

      {/* Pro-tip side panel */}
      <aside className="bg-blue-50 border border-blue-100 rounded-xl p-5 flex flex-col gap-3 h-fit">
        <p className="text-sm font-semibold text-blue-800">{copy.proTip.title}</p>
        <p className="text-sm text-blue-700 leading-relaxed">{copy.proTip.body}</p>
      </aside>
    </div>
  );
}
