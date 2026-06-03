'use client';
import { FieldConfig, ConditionState } from '@/types/rule-engine.types';
import { SearchSelect, EditLabelButton, DeleteButton, ApplyButton } from '@/components/common';
import { useConditionRow } from './useConditionRow';
import ValueInput from './ValueInput';
import { useTranslations } from 'next-intl';

interface ConditionRowProps {
  index: number;
  condition: ConditionState;
  fields: FieldConfig[];
  onChange: (updated: ConditionState) => void;
  onRemove: () => void;
}

export default function ConditionRow({
  index,
  condition,
  fields,
  onChange,
  onRemove,
}: ConditionRowProps) {
  const {
    isEditing,
    setIsEditing,
    fieldOptions,
    operatorOptions,
    currentField,
    handleFieldChange,
    resolveLabelForValue,
    formattedValueLabel,
    operatorLabel,
    fieldLabel,
  } = useConditionRow({ condition, fields, onChange });
  const t = useTranslations('ruleEngine');

  if (!isEditing) {
    // 1. Collapsed Read-only State
    return (
      <div className="flex items-center justify-between p-3 bg-white hover:bg-blue-50/10 border border-blue-200 rounded-lg shadow-sm hover:border-blue-300 transition-all">
        <div className="flex items-center gap-2 text-sm text-blue-900 font-semibold">
          <span className="text-gray-500 font-bold">{index}.</span>
          <span className="text-blue-950 font-bold">{fieldLabel}</span>
          <span className="text-blue-600 font-medium">{operatorLabel}</span>
          <span className="text-gray-700 bg-gray-100/80 px-2 py-0.5 rounded font-bold border border-gray-200">
            {formattedValueLabel}
          </span>
        </div>
        <div className="flex items-center gap-3">
          <EditLabelButton onClick={() => setIsEditing(true)} />
          <DeleteButton onClick={onRemove} aria-label="Delete condition" />
        </div>
      </div>
    );
  }

  // 2. Active Editing State
  return (
    <div className="flex flex-col lg:flex-row items-stretch lg:items-center gap-3 p-4 bg-blue-50/20 border-2 border-blue-500 rounded-lg shadow-md transition-all">
      {/* Field Dropdown */}
      <div className="flex-1 lg:max-w-[24%]">
        <SearchSelect
          options={fieldOptions}
          value={condition.fieldId}
          onChange={(_, val) => handleFieldChange(val)}
          placeholder={t('conditionRow.selectField')}
        />
      </div>

      {/* Operator Dropdown */}
      <div className="w-full lg:max-w-[18%]">
        <SearchSelect
          options={operatorOptions}
          value={condition.operator}
          onChange={(_, val) => onChange({ ...condition, operator: val })}
          placeholder={t('conditionRow.selectOperator')}
          disabled={!condition.fieldId}
        />
      </div>

      {/* Dynamic Input Control */}
      <div className="flex-1">
        {currentField ? (
          <ValueInput
            config={currentField}
            value={condition.value}
            onChange={(val) => {
              const label = resolveLabelForValue(val);
              onChange({ ...condition, value: val, valueLabel: label });
            }}
          />
        ) : (
          <div className="h-10 bg-gray-50 border border-dashed border-gray-200 rounded-lg flex items-center justify-center text-xs text-gray-400 font-semibold">
            {t('conditionRow.chooseField')}
          </div>
        )}
      </div>

      {/* Done green button */}
      <ApplyButton label={t('conditionRow.done')} onClick={() => setIsEditing(false)} />
    </div>
  );
}
