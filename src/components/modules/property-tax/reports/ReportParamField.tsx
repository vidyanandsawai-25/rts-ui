'use client';

import { Select } from '@/components/common/select';
import { Checkbox, Input } from '@/components/common';
import { useState, useEffect, useRef } from 'react';
import { getLookupOptions } from '@/hooks/useLookupOptions';
import type { ReportParameterDefinition, LookupOption } from '@/types/report.types';

interface ParamFieldCopy {
  selectPreviousFirst: string;
  loading: string;
  select: string;
}

interface ReportParamFieldProps {
  param: ReportParameterDefinition;
  value: string;
  /** Current value of the param named by cascadeFromKey (parent), if any. */
  parentValue: string | undefined;
  onChange: (key: string, value: string) => void;
  onBlur: (key: string) => void;
  error?: string;
  copy: ParamFieldCopy;
}

/**
 * Renders ONE report parameter generically from its metadata - no per-report or per-dropdown code.
 * 'select' fetches its options from the generic lookup endpoint (by OptionsSource + parent value);
 * 'date' supports a min-bound from its cascade parent (date ranges); plus text/number/boolean.
 */
export function ReportParamField({ param, value, parentValue, onChange, onBlur, error, copy }: ReportParamFieldProps) {
  const isSelect = param.parameterType === 'select';
  const hasParent = !!param.cascadeFromKey;
  const cascadeBlocked = hasParent && !parentValue?.trim();

  const [options, setOptions] = useState<LookupOption[]>([]);
  const [isFetching, setIsFetching] = useState(false);
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  useEffect(() => {
    const source = isSelect ? (param.optionsSource ?? null) : null;
    const blocked = !source || (hasParent && !parentValue?.trim());

    if (blocked) {
      // keep effect pure from sync setState in body by scheduling microtask
      queueMicrotask(() => {
        if (mountedRef.current) {
          setOptions([]);
          setIsFetching(false);
        }
      });
      return;
    }

    let cancelled = false;

    queueMicrotask(() => {
      if (!cancelled && mountedRef.current) {
        setIsFetching(true);
      }
    });

    getLookupOptions(source, parentValue?.trim() || undefined)
      .then((opts) => {
        if (!cancelled && mountedRef.current) {
          setOptions(opts);
        }
      })
      .catch(() => {
        if (!cancelled && mountedRef.current) {
          setOptions([]);
        }
      })
      .finally(() => {
        if (!cancelled && mountedRef.current) {
          setIsFetching(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [isSelect, param.optionsSource, parentValue, hasParent]);

  const change = (v: string) => onChange(param.parameterKey, v);
  const blur = () => onBlur(param.parameterKey);

  switch (param.parameterType) {
    case 'select':
      return (
        <Select
          name={param.parameterKey}
          label={param.label}
          required={param.isRequired}
          placeholder={cascadeBlocked ? copy.selectPreviousFirst : isFetching ? copy.loading : copy.select}
          options={options.map((o) => ({ value: o.value, label: o.label }))}
          value={value}
          disabled={cascadeBlocked || isFetching}
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
        <Checkbox
          name={param.parameterKey}
          checked={value === 'true'}
          onCheckedChange={(checked) => change(checked ? 'true' : 'false')}
          onBlur={blur}
          label={`${param.label}${param.isRequired ? ' *' : ''}`}
        />
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
