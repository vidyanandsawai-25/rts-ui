'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { Input, MultiSelect, Select, Checkbox, RadioGroup, RadioGroupItem } from '@/components/common';
import type { FieldConfig, StaticValue } from '@/types/rule-engine';
import { fetchDynamicConditionFieldOptionsAction } from '@/app/[locale]/property-tax/dynamic-tax-register/action';

export interface ConditionValueInputProps {
  config: FieldConfig | undefined;
  operator?: string;
  value: string | string[];
  onChange: (value: string | string[]) => void;
}

const MULTI_VALUE_OPERATORS = ['In', 'Not In', 'contains any', 'contains all'];

/** Operators whose value is a [min, max] pair — must line up with the backend evaluator's
 *  normalized range codes (ConditionRuleEvaluator.Compare: "BETWEEN" / "VALUE_BETWEEN_RANGE"). */
const RANGE_OPERATORS = ['BETWEEN', 'VALUE_BETWEEN_RANGE'];

/** Normalizes an operator to the backend's canonical form (UPPER_SNAKE) so a range operator is
 *  recognized whether the field stores its code ("VALUE_BETWEEN_RANGE") or its label ("Between"). */
const normalizeOperator = (op?: string) => (op ?? '').trim().replace(/\s+/g, '_').toUpperCase();

/**
 * Single value-input for a condition row, switching by the selected field's
 * inputType/dataType/sourceType — a trimmed, simpler version of the standalone Rule
 * Engine's ValueInput/DropdownValueInput/MultiSelectValueInput/RadioValueInput split,
 * intentionally inlined into one file (no nested groups/multi-block complexity here).
 */
export function ConditionValueInput({ config, operator, value, onChange }: ConditionValueInputProps) {
  const t = useTranslations('dynamicTaxRegister');
  const [apiOptions, setApiOptions] = useState<{ label: string; value: string }[]>([]);

  useEffect(() => {
    if (!config || config.sourceType !== 'API' || !config.apiEndpoint) {
      Promise.resolve().then(() => setApiOptions([]));
      return;
    }
    let cancelled = false;
    fetchDynamicConditionFieldOptionsAction(
      config.apiEndpoint,
      config.apiMethod ?? 'GET',
      config.apiParameters,
      config.apiResponseMapping
    ).then((opts) => {
      if (!cancelled) setApiOptions(opts);
    });
    return () => {
      cancelled = true;
    };
  }, [config]);

  if (!config) {
    return (
      <Input
        value={typeof value === 'string' ? value : ''}
        onChange={(e) => onChange(e.target.value)}
        className="h-9 text-xs"
      />
    );
  }

  const staticOptions: { label: string; value: string }[] =
    config.sourceType === 'API'
      ? apiOptions
      : config.staticValuesJson
      ? parseStaticValues(config.staticValuesJson)
      : [];

  const isMultiValue = operator ? MULTI_VALUE_OPERATORS.includes(operator) : false;
  const arrayValue = Array.isArray(value) ? value : value ? [value] : [];

  if (isMultiValue) {
    return <MultiSelect options={staticOptions} value={arrayValue} onChange={onChange} className="text-xs" />;
  }

  // Range / BETWEEN: two bound inputs (From / To), stored as a [min, max] tuple — the backend's
  // ConditionRuleEvaluator.IsBetween expects exactly two numeric values and matches min ≤ actual ≤ max.
  if (RANGE_OPERATORS.includes(normalizeOperator(operator))) {
    const from = arrayValue[0] ?? '';
    const to = arrayValue[1] ?? '';
    const boundType = config.dataType === 'DATE' ? 'date' : 'number';
    return (
      <div className="flex items-center gap-2">
        {/* Input's non-naked mode wraps the <input> in its own outer div (Input.tsx) that
            doesn't receive `className` — so sizing classes must go on a wrapper div around
            Input itself, the actual flex participant here, not on Input's className prop. */}
        <div className="flex-1 min-w-0">
          <Input
            value={from}
            onChange={(e) => onChange([e.target.value, to])}
            type={boundType}
            min={boundType === 'number' ? 0 : undefined}
            placeholder="From"
            className="h-9 text-xs w-full"
          />
        </div>
        <span className="text-[11px] font-semibold text-slate-400 shrink-0">{t('condition.rangeSeparator')}</span>
        <div className="flex-1 min-w-0">
          <Input
            value={to}
            onChange={(e) => onChange([from, e.target.value])}
            type={boundType}
            min={boundType === 'number' ? 0 : undefined}
            placeholder="To"
            className="h-9 text-xs w-full"
          />
        </div>
      </div>
    );
  }

  const scalarValue = Array.isArray(value) ? value[0] ?? '' : value;

  switch (config.inputType) {
    case 'DROPDOWN':
      return <Select options={staticOptions} value={scalarValue} onChange={(_, v) => onChange(v)} selectSize="sm" />;

    case 'DATEPICKER':
      return (
        <input
          type="date"
          value={scalarValue}
          onChange={(e) => onChange(e.target.value)}
          className="h-9 px-3 w-full rounded-md border border-gray-300 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      );

    case 'CHECKBOX':
      return (
        <Checkbox
          checked={scalarValue === 'true'}
          onCheckedChange={(checked) => onChange(checked ? 'true' : 'false')}
        />
      );

    case 'RADIO':
      return (
        <RadioGroup value={scalarValue} onValueChange={onChange} className="flex flex-row items-center gap-3">
          {staticOptions.map((o) => (
            <label key={o.value} className="flex items-center gap-1.5 text-xs cursor-pointer">
              <RadioGroupItem value={o.value} />
              {o.label}
            </label>
          ))}
        </RadioGroup>
      );

    case 'MULTISELECT':
      return <MultiSelect options={staticOptions} value={arrayValue} onChange={onChange} className="text-xs" />;

    case 'TEXTBOX':
    default:
      return (
        <Input
          value={scalarValue}
          onChange={(e) => onChange(e.target.value)}
          className="h-9 text-xs"
          type={config.dataType === 'INTEGER' || config.dataType === 'DECIMAL' ? 'number' : 'text'}
          min={config.dataType === 'INTEGER' || config.dataType === 'DECIMAL' ? 0 : undefined}
        />
      );
  }
}

function parseStaticValues(json: string): { label: string; value: string }[] {
  try {
    return (JSON.parse(json) as StaticValue[]).map((s) => ({ label: s.label, value: s.value }));
  } catch {
    return [];
  }
}
