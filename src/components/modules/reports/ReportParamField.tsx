'use client';

import { Select } from '@/components/common/select';
import { Input } from '@/components/common';
import { useLookupOptions } from '@/hooks/useLookupOptions';
import type { ReportParameterDefinition } from '@/types/report.types';

interface ReportParamFieldProps {
  param: ReportParameterDefinition;
  value: string;
  /** Current value of the param named by cascadeFromKey (parent), if any. */
  parentValue: string | undefined;
  onChange: (key: string, value: string) => void;
  onBlur: (key: string) => void;
  error?: string;
}

/**
 * Renders ONE report parameter generically from its metadata — no per-report or per-dropdown code.
 * 'select' fetches its options from the generic lookup endpoint (by OptionsSource + parent value);
 * 'date' supports a min-bound from its cascade parent (date ranges); plus text/number/boolean.
 */
export function ReportParamField({ param, value, parentValue, onChange, onBlur, error }: ReportParamFieldProps) {
  const isSelect = param.parameterType === 'select';
  const hasParent = !!param.cascadeFromKey;
  const cascadeBlocked = hasParent && !parentValue?.trim();

  // Always called (hook rules); a null source means "don't fetch" for non-select params.
  const { options, loading } = useLookupOptions(
    isSelect ? (param.optionsSource ?? null) : null,
    parentValue,
    hasParent,
  );

  const change = (v: string) => onChange(param.parameterKey, v);
  const blur = () => onBlur(param.parameterKey);

  switch (param.parameterType) {
    case 'select':
      return (
        <Select
          name={param.parameterKey}
          label={param.label}
          required={param.isRequired}
          placeholder={cascadeBlocked ? 'Select the previous field first' : loading ? 'Loading…' : 'Select…'}
          options={options.map((o) => ({ value: o.value, label: o.label }))}
          value={value}
          disabled={cascadeBlocked || loading}
          onChange={(_, v) => change(v)}
          onBlur={blur}
          error={error}
        />
      );

    case 'date':
      return (
        <Input
          type="date"
          name={param.parameterKey}
          label={param.label}
          required={param.isRequired}
          fullWidth
          value={value}
          disabled={cascadeBlocked}
          min={hasParent ? (parentValue || undefined) : undefined}
          onChange={(e) => change(e.target.value)}
          onBlur={blur}
          error={error}
        />
      );

    case 'number':
      return (
        <Input
          type="number"
          name={param.parameterKey}
          label={param.label}
          required={param.isRequired}
          fullWidth
          value={value}
          disabled={cascadeBlocked}
          onChange={(e) => change(e.target.value)}
          onBlur={blur}
          error={error}
        />
      );

    case 'boolean':
      return (
        <label className="flex items-center gap-2 text-sm text-gray-700 py-1">
          <input
            type="checkbox"
            name={param.parameterKey}
            checked={value === 'true'}
            onChange={(e) => change(e.target.checked ? 'true' : 'false')}
            onBlur={blur}
            className="h-4 w-4 rounded border-gray-300 text-blue-600"
          />
          <span>{param.label}{param.isRequired ? ' *' : ''}</span>
        </label>
      );

    default: // 'text'
      return (
        <Input
          type="text"
          name={param.parameterKey}
          label={param.label}
          required={param.isRequired}
          fullWidth
          value={value}
          disabled={cascadeBlocked}
          onChange={(e) => change(e.target.value)}
          onBlur={blur}
          error={error}
        />
      );
  }
}
