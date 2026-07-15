import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { MultiSelect } from '@/components/common/MultiSelect';
import { Select } from '@/components/common/select';
import { SearchSelect } from '@/components/common/SearchSelect';
import { Label } from '@/components/common/label';
import { Input } from '@/components/common/Input';
import { Button } from '@/components/common/ActionButton';
import { Info, Calculator } from 'lucide-react';
import { getFieldConfig, getHeaderTitle } from './ScopeSelectionUtils';
import { Scope, ScopeOptionItem } from '@/types/addTaxes.types';

interface ScopeDynamicFieldsProps {
  selectedScope: Scope;
  currentScopeData: ScopeOptionItem | undefined;
  optionsToRender: string[];
  selectionData: Record<string, string[]>;
  handleSelectionChange: (key: string, values: string[]) => void;
  zoneOptions: { value: string; label: string }[];
  fetchedWards: { value: string; label: string; zoneId: string }[];
  fetchWards: () => void;
  propertyTypeOptions: { value: string; label: string }[];
  fetchedBuildings: { value: string; label: string }[];
  fetchBuildings: (zones: string[] | null, wards: string[]) => void;
  isCalculating: boolean;
  isValidated: boolean;
  eligibleCount: number | null;
  handleCalculateEligible: () => void;
  assessmentStatusOptions?: { value: string; label: string }[];
  fetchAssessmentStatuses?: () => void;
}

export function ScopeDynamicFields({
  selectedScope,
  currentScopeData,
  optionsToRender,
  selectionData,
  handleSelectionChange,
  zoneOptions,
  fetchedWards,
  fetchWards,
  propertyTypeOptions,
  fetchedBuildings,
  fetchBuildings,
  isCalculating,
  isValidated,
  eligibleCount,
  handleCalculateEligible,
  assessmentStatusOptions = [],
  fetchAssessmentStatuses
}: ScopeDynamicFieldsProps) {
  const t = useTranslations('addTaxes');
  const [isToFieldBlurred, setIsToFieldBlurred] = useState(false);

  let rangeError: string | null = null;
  let hasRangeError = false;

  if (selectedScope === 'range') {
    const fromKey = Object.keys(selectionData).find(k => k.toLowerCase().includes('from'));
    const toKey = Object.keys(selectionData).find(k => k.toLowerCase().includes('to'));
    const fromVal = fromKey ? selectionData[fromKey]?.[0] : null;
    const toVal = toKey ? selectionData[toKey]?.[0] : null;

    const fromIndex = fetchedBuildings.findIndex(b => b.value === fromVal);
    const toIndex = fetchedBuildings.findIndex(b => b.value === toVal);

    if (fromIndex !== -1 && toIndex !== -1 && toIndex < fromIndex) {
      hasRangeError = true;
      if (isToFieldBlurred) {
        rangeError = t('messages.invalidRange');
      }
    }
  }

  if (!currentScopeData || !optionsToRender || optionsToRender.length === 0) return null;

  return (
    <div className="bg-[#F9FAFB] border border-[#F3F4F6] rounded-xl p-5 mb-2">
      <div className="text-[10px] font-bold text-gray-400 mb-4 uppercase tracking-wider">
        {getHeaderTitle(selectedScope, currentScopeData.displayName, optionsToRender, t)}
      </div>

      {selectedScope === 'range' && (
        <div className="bg-orange-50 border border-orange-100 rounded-md p-3 flex items-start gap-3 mb-6">
          <Info className="h-5 w-5 text-orange-500 mt-0.5 flex-shrink-0" />
          <div>
            <h4 className="text-sm font-semibold text-orange-800">{t('dynamicFields.rangeWarningTitle', { fallback: 'Select a specific property number range' })}</h4>
            <p className="text-xs text-orange-700 mt-1">{t('dynamicFields.rangeWarningDesc', { fallback: 'Range will be calculated only between the selected From Property and To Property. Zone/Ward duplication is avoided on this screen.' })}</p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
        {optionsToRender.map(option => {
          const hasZone = optionsToRender.some((o: string) => o.toLowerCase().includes('zone'));
          const hasWard = optionsToRender.some((o: string) => o.toLowerCase().includes('ward'));
          const config = getFieldConfig(
            option,
            zoneOptions,
            selectionData,
            fetchedWards,
            fetchWards,
            propertyTypeOptions,
            fetchBuildings,
            fetchedBuildings,
            hasZone,
            hasWard,
            t,
            assessmentStatusOptions,
            fetchAssessmentStatuses
          );

          const isFullWidth = config.inputType === 'text' || config.label.toLowerCase().includes('search');
          return (
            <div key={option} className={isFullWidth ? "col-span-1 md:col-span-2 lg:col-span-3" : ""}>
              {config.inputType === 'multiselect' ? (
                <>
                  <Label required={config.required} className="mb-1 text-xs text-gray-700 font-semibold">
                    {config.label}
                  </Label>
                  <MultiSelect
                    options={config.fallbackOptions}
                    value={selectionData[option] || []}
                    onChange={(vals) => handleSelectionChange(option, vals)}
                    placeholder={config.placeholder}
                    disabled={config.disabled}
                    onOpen={config.onOpen}
                  />
                </>
              ) : config.inputType === 'select' ? (
                <Select
                  label={config.label}
                  placeholder={config.placeholder}
                  required={config.required}
                  options={config.fallbackOptions}
                  value={(selectionData[option] || [])[0] || ''}
                  onChange={(e) => handleSelectionChange(option, [e.target.value])}
                  disabled={config.disabled}
                />
              ) : config.inputType === 'searchselect' ? (
                <>
                  <SearchSelect
                    label={config.label}
                    required
                    options={config.fallbackOptions}
                    value={selectionData[option]?.[0] || ''}
                    onChange={(_name, val) => {
                      handleSelectionChange(option, val ? [val] : []);
                      if (option.toLowerCase().includes('to')) {
                        setIsToFieldBlurred(true);
                      }
                    }}
                    placeholder={config.placeholder}
                    disabled={config.disabled}
                    onInputFocus={config.onOpen}
                    error={option.toLowerCase().includes('to') ? (rangeError || undefined) : undefined}
                    onBlur={() => {
                      if (option.toLowerCase().includes('to')) {
                        setIsToFieldBlurred(true);
                      }
                    }}
                  />
                </>
              ) : (
                <Input
                  label={config.label}
                  required={config.required}
                  placeholder={config.placeholder}
                  value={selectionData[option]?.[0] || ''}
                  onChange={(e) => handleSelectionChange(option, [e.target.value])}
                  fullWidth
                />
              )}
            </div>
          );
        })}
        {selectedScope === 'ward' && (
          <div className="flex items-end h-[58px] pb-0.5 gap-4">
            <Button
              variant="primary"
              size="sm"
              icon={Calculator}
              onClick={handleCalculateEligible}
              disabled={isCalculating}
              className="h-[38px] px-5 flex-shrink-0"
            >
              {isCalculating ? '...' : t('dynamicFields.calculateEligible')}
            </Button>
            {isValidated && eligibleCount !== null && (
              <span className="text-sm text-gray-500 font-medium whitespace-nowrap">
                <span className="text-gray-900 font-bold mr-1">{eligibleCount}</span>
                {t('executionValidation.eligibleRecordsSub')}
              </span>
            )}
          </div>
        )}
      </div>

      {selectedScope !== 'ward' && (
        <div>
          <div className="flex items-center gap-4 mt-6">
            <Button
              variant="primary"
              size="sm"
              icon={Calculator}
              onClick={handleCalculateEligible}
              disabled={isCalculating || (selectedScope === 'range' && hasRangeError)}
              className="flex-shrink-0"
            >
              {isCalculating ? '...' : (selectedScope === 'range' ? t('dynamicFields.calculateRange') : t('dynamicFields.calculateEligible'))}
            </Button>
            {isValidated && eligibleCount !== null && (
              <span className="text-sm text-gray-500 font-medium">
                <span className="text-gray-900 font-bold mr-1">{eligibleCount}</span>
                {t('executionValidation.eligibleRecordsSub')}
              </span>
            )}
          </div>
          {selectedScope === 'range' && (
            <div className="text-[10px] text-gray-500 mt-2">
              {t('dynamicFields.internalValidationNotice')}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
