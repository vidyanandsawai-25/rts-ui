'use client';

import { EffectState, EffectTypeConfig, FieldConfig } from '@/types/rule-engine.types';
import { Input, SearchSelect } from '@/components/common';
import { adaptEffectConfigToFieldConfig } from '@/lib/api/rule-engine/mappers';
import ValueInput from './ValueInput';
import { useEffectPanelOptions } from './useEffectPanelOptions';
import { useTranslations } from 'next-intl';

interface EffectPanelProps {
  effect: EffectState;
  onChange: (updated: EffectState) => void;
  effectTypes: { label: string; value: string }[];
  categoryOptions: { label: string; value: string }[];
  effectTypeConfigs: EffectTypeConfig[];
}

export default function EffectPanel({
  effect,
  onChange,
  effectTypes,
  categoryOptions,
  effectTypeConfigs,
}: EffectPanelProps) {
  const selectedConfig = effectTypeConfigs.find((c) => c.effectType === effect.effectType);
  const { dynamicCategoryOptions, staticApiOptions } = useEffectPanelOptions(selectedConfig);
  const t = useTranslations('ruleEngine');


  const options = [
    { label: 'Select category', value: '' },
    ...(dynamicCategoryOptions.length > 0 ? dynamicCategoryOptions : categoryOptions),
  ];

  const handleTypeChange = (type: string) => {
    onChange({
      ...effect,
      effectType: type,
      isPercentage: true,
      value: 0,
      multiplierField: undefined,
    });
  };

  const fieldConfig: FieldConfig = selectedConfig
    ? { ...adaptEffectConfigToFieldConfig(selectedConfig), numericMin: 0, numericMax: 100 }
    : {
        id: 0,
        fieldId: 'value',
        dataType: 'DECIMAL',
        inputType: 'TEXTBOX',
        sourceType: 'NONE',
        isRequired: true,
        numericMin: 0,
        numericMax: 100,
      };

  const handleValueChange = (newVal: string | string[]) => {
    const scalar = Array.isArray(newVal) ? newVal[0] : newVal;
    const num = Number(scalar);
    if (!isNaN(num) && num > 100) {
      onChange({
        ...effect,
        value: 100,
      });
      return;
    }
    if (!isNaN(num) && num < 0) {
      onChange({
        ...effect,
        value: 0,
      });
      return;
    }
    onChange({
      ...effect,
      value: isNaN(num) || scalar.trim() === '' ? scalar : num,
    });
  };

  const valNum = Number(effect.value);
  const isInvalidPercent = effect.value !== undefined && effect.value !== null && effect.value !== '' && (isNaN(valNum) || valNum < 0 || valNum > 100);

  const hasReferenceCategory = !!(selectedConfig && selectedConfig.hasApiSource && selectedConfig.apiEndpoint);
  const hasParameter = !!(selectedConfig && selectedConfig.staticApiEndpoint);

  const effectTypeColSpan = (hasReferenceCategory && hasParameter) ? 'md:col-span-3' : 'md:col-span-4';
  const referenceCategoryColSpan = (hasReferenceCategory && hasParameter) ? 'md:col-span-3' : 'md:col-span-4';
  const parameterColSpan = (hasReferenceCategory && hasParameter) ? 'md:col-span-3' : 'md:col-span-4';

  let valueColSpan = 'md:col-span-4';
  if (hasReferenceCategory && hasParameter) {
    valueColSpan = 'md:col-span-3';
  } else if (!hasReferenceCategory && !hasParameter) {
    valueColSpan = 'md:col-span-8';
  }

  return (
    <div className="flex flex-col gap-4 w-full">
      {/* Visual Dashed Divider: --- Perform the following action --- */}
      <div className="relative flex py-2 items-center">
        <div className="flex-grow border-t border-dashed border-zinc-300"></div>
        <span className="flex-shrink mx-4 text-xs font-semibold text-zinc-500 uppercase tracking-wider">
          {t('effectPanel.performAction')}
        </span>
        <div className="flex-grow border-t border-dashed border-zinc-300"></div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
        {/* 1. Effect Type selection */}
        <div className={effectTypeColSpan}>
          <SearchSelect
            label={t('effectPanel.effectType')}
            options={effectTypes}
            value={effect.effectType}
            onChange={(_, val) => handleTypeChange(val)}
            required
          />
        </div>

        {/* 2. Reference Category selection (shown when config has apiEndpoint) */}
        {hasReferenceCategory && (
          <div className={referenceCategoryColSpan}>
            <SearchSelect
              label={t('effectPanel.referenceCategory')}
              options={options}
              value={effect.multiplierField ?? ''}
              onChange={(_, val) => onChange({ ...effect, multiplierField: val })}
              required
            />
          </div>
        )}

        {/* 3. Parameter selection (shown when config has staticApiEndpoint) */}
        {hasParameter && (
          <div className={parameterColSpan}>
            <SearchSelect
              label={t('effectPanel.parameter')}
              options={staticApiOptions}
              value={effect.overrideRate === undefined || effect.overrideRate === null ? '' : effect.overrideRate.toString()}
              onChange={(_, val) => {
                if (!val) {
                  onChange({ ...effect, overrideRate: undefined });
                } else {
                  const num = Number(val);
                  onChange({ ...effect, overrideRate: isNaN(num) ? val : num });
                }
              }}
              required
            />
          </div>
        )}

        {/* 4. Value / Dynamic Value Input */}
        <div className={valueColSpan}>
          {hasParameter ? (
            <div className="flex flex-col gap-1 w-full">
              <label className="text-[13px] font-semibold text-zinc-600">
                {t('effectPanel.percentageValue')}
              </label>
              <Input
                type="number"
                min={0}
                max={100}
                value={effect.value === undefined || effect.value === null || effect.value === '' ? '' : effect.value.toString()}
                onChange={(e) => handleValueChange(e.target.value)}
                placeholder={t('effectPanel.enterValue')}
                error={isInvalidPercent ? t('effectPanel.invalidPercentage') : undefined}
              />
            </div>
          ) : (
            <div className="flex flex-col gap-1 w-full">
              <label className="text-[13px] font-semibold text-zinc-600">
                {t('effectPanel.percentageValue')}
              </label>
              <ValueInput
                config={fieldConfig}
                value={effect.value === undefined || effect.value === null || effect.value === '' ? '' : effect.value.toString()}
                onChange={handleValueChange}
                error={isInvalidPercent ? t('effectPanel.invalidPercentage') : undefined}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
