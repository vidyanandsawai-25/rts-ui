import { SearchSelect, type SearchSelectOption } from '@/components/common/SearchSelect';
import { MultiSelectDropdown } from '@/components/common/Dropdown';
import { Tabs, TabList, Tab } from '@/components/common/Tabs';
import { CancelButton, AddButton } from '@/components/common/ActionButtons';
import { SelectionMethod } from '@/hooks/combineProperty/useCombinePropertyFilters';

export interface CombinePropertyFilterBarProps {
  t: (key: string, values?: Record<string, string | number>) => string;
  basePropertyOptions: SearchSelectOption[];
  subPropertyOptions: SearchSelectOption[];
  propertyTypeOptions: SearchSelectOption[];
  
  selectedBasePropertyId?: string;
  selectionMethod: SelectionMethod;
  rangeFrom: string;
  rangeTo: string;
  selectedProperties: string[];
  selectedPropertyType: string;
  showPropertyTypeDropdown: boolean;
  selectedCount: number;
  canProceed: boolean;
  isPending: boolean;

  handleBasePropertyChange: (_name: string, value: string) => void;
  handleMethodChange: (method: SelectionMethod) => void;
  handleRangeFromChange: (_name: string, value: string) => void;
  handleRangeToChange: (_name: string, value: string) => void;
  handleIndividualChange: (values: string[]) => void;
  setSelectedPropertyType: (val: string) => void;
  handleClear: () => void;
  handleProceed: () => void;
}

export function CombinePropertyFilterBar({
  t,
  basePropertyOptions,
  subPropertyOptions,
  propertyTypeOptions,
  selectedBasePropertyId,
  selectionMethod,
  rangeFrom,
  rangeTo,
  selectedProperties,
  selectedPropertyType,
  showPropertyTypeDropdown,
  selectedCount,
  canProceed,
  isPending,
  handleBasePropertyChange,
  handleMethodChange,
  handleRangeFromChange,
  handleRangeToChange,
  handleIndividualChange,
  setSelectedPropertyType,
  handleClear,
  handleProceed,
}: CombinePropertyFilterBarProps) {
  return (
    <div className="flex items-end gap-2 px-3 py-2 bg-[#EFF4FF] border-b border-blue-100">
      {/* ---- Base Property ---- */}
      <div className="flex flex-col gap-0.5 w-[160px] shrink-0">
        <label htmlFor="baseProperty" className="text-[10px] font-semibold text-gray-600 flex items-center gap-1">
          <span className="inline-flex items-center justify-center w-3.5 h-3.5 bg-blue-600 text-white text-[8px] font-bold rounded-[3px]">B</span>
          {t('baseProperty')} <span className="text-red-500">*</span>
        </label>
        <SearchSelect
          id="baseProperty"
          name="baseProperty"
          options={basePropertyOptions}
          value={selectedBasePropertyId ?? ''}
          onChange={handleBasePropertyChange}
          placeholder={t('select')}
          required
          className="text-[11px] h-[28px]"
        />
      </div>

      {/* ---- Divider ---- */}
      <div className="h-5 w-px bg-blue-200 self-center shrink-0" />

      {/* ---- Selection Method pill toggle ---- */}
      <div className="flex flex-col gap-0.5 shrink-0">
        <label className="text-[10px] font-semibold text-gray-600">{t('selectionMethod')}</label>
        <Tabs
          value={selectionMethod}
          onChange={(value) => handleMethodChange(value as SelectionMethod)}
          variant="pills"
          size="sm"
        >
          <TabList className="h-[28px] p-0.5 bg-gray-100 rounded-md" scrollable={false}>
            <Tab value="range" className="text-[11px] px-2.5 py-0">
              {t('range')}
            </Tab>
            <Tab value="individual" className="text-[11px] px-2.5 py-0">
              {t('individual')}
            </Tab>
          </TabList>
        </Tabs>
      </div>

      {/* ---- Conditional: Range fields ---- */}
      {selectionMethod === 'range' && (
        <>
          <div className="flex flex-col gap-0.5 w-[120px] shrink-0">
            <label htmlFor="rangeFrom" className="text-[10px] font-semibold text-gray-600">
              {t('from')} <span className="text-red-500">*</span>
            </label>
            <SearchSelect
              id="rangeFrom"
              name="rangeFrom"
              options={subPropertyOptions}
              value={rangeFrom}
              onChange={handleRangeFromChange}
              placeholder={t('selectStart')}
              required
              className="text-[11px] h-[28px]"
            />
          </div>
          <div className="flex flex-col gap-0.5 w-[120px] shrink-0">
            <label htmlFor="rangeTo" className="text-[10px] font-semibold text-gray-600">
              {t('to')} <span className="text-red-500">*</span>
            </label>
            <SearchSelect
              id="rangeTo"
              name="rangeTo"
              options={subPropertyOptions}
              value={rangeTo}
              onChange={handleRangeToChange}
              placeholder={t('selectEnd')}
              required
              className="text-[11px] h-[28px]"
            />
          </div>
        </>
      )}

      {/* ---- Conditional: Individual multi-select ---- */}
      {selectionMethod === 'individual' && (
        <div className="flex flex-col gap-0.5 w-[200px] shrink-0">
          <label
            id="selectedPropertiesLabel"
            htmlFor="selectedProperties"
            className="text-[10px] font-semibold text-gray-600"
          >
            {t('selectProperties')} <span className="text-red-500">*</span>
          </label>
          <MultiSelectDropdown
            id="selectedProperties"
            aria-labelledby="selectedPropertiesLabel"
            options={subPropertyOptions}
            value={selectedProperties}
            onChange={handleIndividualChange}
            placeholder={t('selectPropertiesPlaceholder')}
            className="text-[11px] text-gray-500"
            styles={{ trigger: 'h-[28px] py-0 px-2 rounded-md border-blue-200 shadow-none' }}
          />
        </div>
      )}

      {/* ---- Property Type (Conditionally Visible) ---- */}
      {showPropertyTypeDropdown && (
        <div className="flex flex-col gap-0.5 w-[140px] shrink-0">
          <label htmlFor="propertyType" className="text-[10px] font-semibold text-gray-600">
            {t('propertyType')} <span className="text-red-500">*</span>
          </label>
          <SearchSelect
            id="propertyType"
            name="propertyType"
            options={propertyTypeOptions}
            value={selectedPropertyType}
            onChange={(_name, val) => setSelectedPropertyType(val)}
            placeholder={t('select')}
            className="text-[11px] h-[28px]"
            required
          />
        </div>
      )}

      {/* ---- Action buttons ---- */}
      <div className="flex items-end gap-2 shrink-0 ml-auto">
        <CancelButton label={t('clear')} onClick={handleClear} size="sm" />
        <AddButton
          label={isPending ? t('loadingButton') : t('proceed', { count: selectedCount })}
          size="sm"
          disabled={!canProceed || isPending}
          onClick={handleProceed}
        />
      </div>
    </div>
  );
}
