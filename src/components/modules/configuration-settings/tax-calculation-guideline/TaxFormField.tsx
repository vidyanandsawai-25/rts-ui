'use client';

import { Input, Select, Label, ValidationMessage, ToggleSwitch } from '@/components/common';
import type { InputProps } from '@/components/common';
import type { Option } from '@/components/common/select';
import { cn } from '@/lib/utils/cn';
import type { TaxCalculationGuidelineDto } from '@/types/tax-calculation-guideline.types';

type TranslationFn = ((key: string, params?: Record<string, string | number>) => string) & { has: (key: string) => boolean };

import type { PolicyConfiguration } from '@/types/policy-configuration.types';


const BASE_INPUT = 'h-9 bg-white border-slate-200/80 text-sm font-medium';
const BASE_SELECT = 'h-9';

// ─── TaxInput ──────────────────────────────────────────────────────────────

interface TaxInputProps extends InputProps {
  label?: string;
  error?: string;
  required?: boolean;
}

/** Thin wrapper around the shared `Input` component with an optional label. */
export function TaxInput({ label, error, required, className, ...rest }: TaxInputProps) {
  return (
    <div className="flex flex-col gap-1">
      {label && (
        <Label required={required} className="text-xs font-medium text-slate-700">
          {label}
        </Label>
      )}
      <Input
        className={cn(BASE_INPUT, error && 'border-red-500 focus-visible:ring-red-500', className)}
        {...rest}
      />
      {error && <ValidationMessage message={error} />}
    </div>
  );
}

// ─── TaxSelect ────────────────────────────────────────────────────────────

interface TaxSelectProps {
  label?: string;
  options: Option[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  error?: string;
  required?: boolean;
  className?: string;
}

/** Thin wrapper around the shared `Select` component. */
export function TaxSelect({
  label,
  options,
  value,
  onChange,
  placeholder = 'Select...',
  disabled = false,
  error,
  required,
  className,
}: TaxSelectProps) {
  return (
    <div className={cn("flex flex-col gap-1", disabled && "opacity-60 pointer-events-none")}>
      {label && (
        <Label required={required} className="text-xs font-medium text-slate-700">
          {label}
        </Label>
      )}
      <Select
        selectSize="sm"
        options={options}
        value={value}
        placeholder={placeholder}
        disabled={disabled}
        error={error}
        onChange={(_e, val) => onChange(val)}
        className={cn(BASE_SELECT, className)}
      />
      {error && <ValidationMessage message={error} />}
    </div>
  );
}

import { AnimatedDigitInput } from '@/components/common/AnimatedDigitInput';

export interface TaxNumberInputProps {
  label?: string;
  value: number | undefined;
  onChange: (value: number | undefined) => void;
  min?: number;
  max?: number;
  step?: number;
  className?: string;
  error?: string;
  required?: boolean;
  disabled?: boolean;
}

/** Numeric input with label, clamped to [min, max]. */
export function TaxNumberInput({
  label,
  value,
  onChange,
  min = 0,
  max = 999999,
  step = 1,
  className,
  error,
  required,
  disabled,
}: TaxNumberInputProps) {
  const isDecimal = step !== 1;
  const pattern = isDecimal ? /^[0-9.]$/ : /^[0-9]$/;

  return (
    <div className={cn("flex flex-col gap-1", disabled && "opacity-60 pointer-events-none")}>
      {label && (
        <Label required={required} className="text-xs font-medium text-slate-700">
          {label}
        </Label>
      )}
      <AnimatedDigitInput
        value={value !== undefined && !isNaN(value) ? String(value) : ''}
        maxLength={10}
        allowedPattern={pattern}
        disabled={disabled}
        onChange={(valStr) => {
          if (valStr === '') {
            onChange(undefined);
          } else {
            const raw = parseFloat(valStr);
            if (!isNaN(raw)) {
              onChange(raw);
            }
          }
        }}
        onBlur={(e) => {
          const valStr = e.target.value;
          if (valStr === '') {
            onChange(undefined);
          } else {
            const raw = parseFloat(valStr);
            if (!isNaN(raw)) {
              const clamped = Math.min(Math.max(raw, min), max);
              onChange(clamped);
            }
          }
        }}
        className={cn(BASE_INPUT, error && 'border-red-500', className)}
      />
      {error && <ValidationMessage message={error} />}
    </div>
  );
}

// ─── DynamicGuidelineField ──────────────────────────────────────────────────

interface DynamicGuidelineFieldProps {
  guideline: TaxCalculationGuidelineDto;
  value: string | boolean | number | null | undefined;
  onChange: (val: string | null) => void;
  disabled?: boolean;
  t: TranslationFn;
  policyConfigs?: PolicyConfiguration[];
}

function getTranslationForOption(val: string, code: string, t: TranslationFn): string {
  const keys = [
    `options.priorities.${val}`,
    `options.ebRules.${val}`,
    `options.noDateRules.${val}`,
    `options.proration.${val}`,
    `options.persistence.${val}`,
    ...(code === 'FINANCIAL_YEAR_START_MONTH' ? [`options.months.${val}`] : []),
    `options.units.${val}`,
    `options.${val}`
  ];
  for (const k of keys) {
    if (t.has(k)) return t(k);
  }
  return val;
}

function getTranslationForFieldLabel(code: string, defaultName: string, t: TranslationFn): string {
  // Convert guidelineCode back to camelCase or direct key lookup in locales
  const camelCaseCode = code.toLowerCase().replace(/_([a-z])/g, (_m, chr) => chr.toUpperCase());
  if (t.has(`fields.${camelCaseCode}`)) {
    return t(`fields.${camelCaseCode}`);
  }
  // Try direct key matching
  const directKeys = [
    `fields.enableCertificateBasedTax`,
    `fields.applyTaxOnlyForTaxable`,
    `fields.financialYearStart`,
    `fields.certificateTaxScopeMode`,
    `fields.applyCcToOcSplit`,
    `fields.ccPeriodMultiplier`,
    `fields.ocPeriodMultiplier`,
    `fields.enableCurrentFyPartialPolicy`,
    `fields.ccPartialPolicyCode`,
    `fields.ccFullPolicyCode`,
    `fields.ocPartialPolicyCode`,
    `fields.ocFullPolicyCode`,
    `fields.electricBillDateRule`,
    `fields.addMonths`,
    `fields.electricBillMultiplier`,
    `fields.electricBillMinimumFinancialYear`,
    `fields.electricBillPartialPolicyCode`,
    `fields.electricBillFullPolicyCode`,
    `fields.enableRetrospectiveTax`,
    `fields.whenNoDateIsAvailable`,
    `fields.lookbackYears`,
    `fields.defaultRetrospectiveMultiplier`,
    `fields.enableProration`,
    `fields.prorationMethod`,
    `fields.taxPersistenceMode`,
    `fields.doNotUpdateNettax`,
    `fields.guidelineChangeApplyMode`,
    `fields.recalculateOnCertificateSave`,
    `fields.recalculateOnCertificateDelete`,
    `fields.allowFloorWiseCertificateMetadata`,
    `fields.floorPolicyDisplayRule`,
    `fields.certificateRequireNoAndDate`,
    `fields.missingCertificateNoAction`,
    `fields.missingCertificateDateAction`,
    `fields.ignoreCcToOcWithinValue`,
    `fields.ignoreCcToOcWithinType`,
    `fields.ccOcGapComparison`,
    `fields.ccOcGapWithinAction`,
    `fields.ccOcGapExceededAction`,
    `fields.invalidCcOcDateOrderAction`,
    `fields.noDateLookbackYears`,
    `fields.retrospectiveCurrentYearCount`,
    `fields.retrospectivePendingYearCountMode`,
    `fields.noDateRetrospectiveMultiplier`,
    `fields.currentYearProrationStartRule`,
    `fields.saveCertificateTaxInPolicyTaxDetails`,
    `fields.saveCertificateTaxInTransmast`,
  ];
  // Match code to direct key
  const match = directKeys.find(key => {
    const lastPart = key.split('.').pop() || '';
    return lastPart.toLowerCase() === camelCaseCode.toLowerCase() ||
           lastPart.toLowerCase() === code.replace(/_/g, '').toLowerCase();
  });
  if (match && t.has(match)) {
    return t(match);
  }
  return defaultName;
}

export function DynamicGuidelineField({ guideline, value, onChange, disabled = false, t, policyConfigs }: DynamicGuidelineFieldProps) {
  const code = guideline.guidelineCode || '';
  const label = getTranslationForFieldLabel(code, guideline.guidelineName || code, t);
  let dataType = guideline.dataType || 'VARCHAR';
  const allowedValues = guideline.allowedValues;

  // Force toggle/switch for known boolean naming patterns
  const isBooleanToggle =
    code.startsWith('ENABLE_') ||
    code.startsWith('SAVE_') ||
    code.startsWith('ALLOW_') ||
    [
      'CERTIFICATE_REQUIRE_NO_AND_DATE',
      'APPLY_ONLY_TAXABLE_CERT_TYPES',
      'DO_NOT_UPDATE_NETTAX',
      'RECALCULATE_ON_CERTIFICATE_SAVE',
      'RECALCULATE_ON_CERTIFICATE_DELETE'
    ].includes(code);

  if (isBooleanToggle) {
    dataType = 'BIT';
  }

  // Handle PolicyCodeMaster dropdowns
  const isPolicyField = [
    'CC_PARTIAL_POLICY_CODE',
    'CC_FULL_POLICY_CODE',
    'OC_PARTIAL_POLICY_CODE',
    'OC_FULL_POLICY_CODE',
    'ELECTRIC_BILL_PARTIAL_POLICY_CODE',
    'ELECTRIC_BILL_FULL_POLICY_CODE'
  ].includes(code);

  if (isPolicyField) {
    const options = (policyConfigs || []).map((p) => ({
      label: p.displayName || p.policyCode,
      value: p.policyCode,
    }));
    const selectOptions = options.some(opt => opt.value === 'Select') ? options : [
      { label: t('options.select'), value: 'Select' },
      ...options
    ];
    const stringValue = value === undefined || value === null ? 'Select' : String(value);

    return (
      <TaxSelect
        label={label}
        options={selectOptions}
        value={stringValue}
        disabled={disabled}
        onChange={(val) => onChange(val === 'Select' ? null : val)}
        className="w-full"
      />
    );
  }

  // Render toggle switch if BIT
  if (dataType === 'BIT') {
    const isChecked = value === true || value === 'true' || value === '1';
    return (
      <div className={cn('flex flex-col gap-1', disabled && 'opacity-60 pointer-events-none')}>
        {/* Label on top — same text-xs style and height as all other field labels */}
        <Label className="text-xs font-medium text-slate-600">{label}</Label>
        {/* h-9 container matches the height of input/select fields */}
        <div className="h-9 flex items-center">
          <ToggleSwitch
            id={`dynamic-toggle-${code}`}
            checked={isChecked}
            disabled={disabled}
            onChange={(val: boolean) => onChange(String(val))}
            showPopup={false}
          />
        </div>
      </div>
    );
  }

  // Render dropdown if VARCHAR or other data type with allowed values list
  if (allowedValues && allowedValues.trim()) {
    let parsedValues: string[] = [];
    if (allowedValues.includes('-') && !allowedValues.includes(',')) {
      const [startStr, endStr] = allowedValues.split('-');
      const start = parseInt(startStr, 10);
      const end = parseInt(endStr, 10);
      if (!isNaN(start) && !isNaN(end)) {
        for (let i = start; i <= end; i++) {
          parsedValues.push(String(i));
        }
      } else {
        parsedValues = allowedValues.split(',').map((v) => v.trim());
      }
    } else {
      parsedValues = allowedValues.split(',').map((v) => v.trim());
    }

    const options = parsedValues.map((v) => ({
      label: getTranslationForOption(v, code, t),
      value: v,
    }));
    // Make sure we have a "Select" or empty option if not present and no default is selected
    const selectOptions = options.some(opt => opt.value === 'Select') ? options : [
      { label: t('options.select'), value: 'Select' },
      ...options
    ];

    // Priority field value translation: translate e.g. "CC Date" to short code "CC" for comparison
    const isPriorityCode = code.startsWith('DATE_PRIORITY_');
    const getShortPriorityValue = (val: string | boolean | number | null | undefined): string => {
      if (val === undefined || val === null || val === 'Select') return 'Select';
      const cleanVal = String(val);
      if (cleanVal === 'CC Date') return 'CC';
      if (cleanVal === 'OC Date') return 'OC';
      if (cleanVal === 'Electric Bill Date') return 'ELECTRIC_BILL';
      if (cleanVal === 'Retrospective (No Date)') return 'RETROSPECTIVE';
      return cleanVal;
    };

    const stringValue = isPriorityCode ? getShortPriorityValue(value) : (value === undefined || value === null ? 'Select' : String(value));

    return (
      <TaxSelect
        label={label}
        options={selectOptions}
        value={stringValue}
        disabled={disabled}
        onChange={(val) => onChange(val === 'Select' ? null : val)}
        className="w-full"
      />
    );
  }

  // Render number input if INT or DECIMAL
  if (dataType === 'INT' || dataType === 'DECIMAL') {
    const numValue = value === undefined || value === '' || isNaN(Number(value)) ? undefined : Number(value);
    const step = dataType === 'DECIMAL' ? 0.01 : 1;
    return (
      <TaxNumberInput
        label={label}
        value={numValue}
        onChange={(val) => onChange(val === undefined ? null : String(val))}
        min={0}
        max={999999}
        step={step}
        disabled={disabled}
        className="w-full"
      />
    );
  }

  // Fallback to text input for VARCHAR without allowed values
  const textValue = value === undefined || value === null ? '' : String(value);
  return (
    <TaxInput
      label={label}
      value={textValue}
      disabled={disabled}
      onChange={(e) => onChange(e.target.value || null)}
      className="w-full"
    />
  );
}
