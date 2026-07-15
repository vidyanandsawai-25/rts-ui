/* eslint-disable @typescript-eslint/no-explicit-any */
import { Scope, ScopeOptionItem, ScopeItem } from '@/types/addTaxes.types';

export interface ScopeSelectionPanelProps {
  scopes: ScopeItem[];
  selectedScope: Scope;
  handleScopeChange: (s: Scope) => void;
  selectionData: Record<string, string[]>;
  handleSelectionChange: (key: string, values: string[]) => void;
  scopeOptions: ScopeOptionItem[];
  zoneOptions?: { value: string; label: string }[];
  propertyTypeOptions?: { value: string; label: string }[];
  onStartExecution?: (jobId: string, totalCount: number, scheduledTime?: string) => void;
  isInitialized: boolean;
  onPreview?: () => Promise<void>;
  isPreviewLoading?: boolean;
  financeYear?: string;
}

export const getFieldConfig = (
  option: string,
  zoneOptions: { value: string; label: string }[],
  selectionData: Record<string, string[]>,
  allWards: { value: string; label: string; zoneId: string }[],
  fetchWards: () => void,
  propertyTypeOptions: { value: string; label: string }[],
  fetchBuildings: (zones: string[] | null, wards: string[]) => void,
  fetchedBuildings: { value: string; label: string }[],
  hasZoneField: boolean,
  hasWardField: boolean,
  t: any,
  assessmentStatusOptions?: { value: string; label: string }[],
  fetchAssessmentStatuses?: () => void
) => {
  const opt = option.toLowerCase();
  if (opt.includes('assessment status')) {
    return {
      label: t('dynamicFields.labels.assessmentStatus', { fallback: 'Assessment Status' }),
      placeholder: t('dynamicFields.placeholders.selectAssessmentStatus', { fallback: 'Select assessment status' }),
      required: true,
      inputType: 'multiselect',
      fallbackOptions: assessmentStatusOptions || [],
      onOpen: fetchAssessmentStatuses
    };
  }

  if (opt.includes('zone')) return { label: t('dynamicFields.labels.zoneNode'), placeholder: t('dynamicFields.placeholders.selectZoneNode'), required: true, inputType: 'multiselect', fallbackOptions: zoneOptions.length > 0 ? zoneOptions : [{ value: '1', label: 'Zone 1' }, { value: '2', label: 'Zone 2' }] };

  if (opt.includes('ward')) {
    let selectedZoneIds: string[] = [];
    for (const key in selectionData) {
      if (key.toLowerCase().includes('zone') && selectionData[key]) {
        selectedZoneIds = [...selectedZoneIds, ...selectionData[key]];
      }
    }

    let filteredWards = allWards;
    if (selectedZoneIds.length > 0) {
      filteredWards = allWards.filter(w => selectedZoneIds.includes(w.zoneId));
    }

    const disabled = hasZoneField && selectedZoneIds.length === 0;

    return {
      label: t('dynamicFields.labels.wardSector'),
      placeholder: t('dynamicFields.placeholders.selectWardSector'),
      required: true,
      inputType: 'multiselect',
      fallbackOptions: filteredWards,
      disabled: disabled,
      onOpen: fetchWards
    };
  }

  if (opt.includes('property type')) {
    let selectedZoneIds: string[] = [];
    let selectedWardIds: string[] = [];
    for (const key in selectionData) {
      if (key.toLowerCase().includes('zone') && selectionData[key]) {
        selectedZoneIds = [...selectedZoneIds, ...selectionData[key]];
      }
      if (key.toLowerCase().includes('ward') && selectionData[key]) {
        selectedWardIds = [...selectedWardIds, ...selectionData[key]];
      }
    }

    let disabled = false;
    if (hasZoneField && selectedZoneIds.length === 0) {
      disabled = true;
    }
    if (hasWardField && selectedWardIds.length === 0) {
      disabled = true;
    }

    return {
      label: t('dynamicFields.labels.propertyType'),
      placeholder: t('dynamicFields.placeholders.selectPropertyType'),
      required: true,
      inputType: 'multiselect',
      fallbackOptions: propertyTypeOptions.length > 0 ? propertyTypeOptions : [{ value: 'select-all', label: 'Select All' }, { value: '1', label: 'Residential' }, { value: '2', label: 'Commercial' }],
      disabled: disabled
    };
  }

  if (opt.includes('property no') || opt.includes('building')) {
    let selectedZoneIds: string[] = [];
    let selectedWardIds: string[] = [];
    for (const key in selectionData) {
      if (key.toLowerCase().includes('zone') && selectionData[key]) {
        selectedZoneIds = [...selectedZoneIds, ...selectionData[key]];
      }
      if (key.toLowerCase().includes('ward') && selectionData[key]) {
        selectedWardIds = [...selectedWardIds, ...selectionData[key]];
      }
    }
    const disabled = (hasZoneField && selectedZoneIds.length === 0) || selectedWardIds.length === 0;

    return {
      label: t('dynamicFields.labels.building'),
      placeholder: t('dynamicFields.placeholders.selectBuilding'),
      required: true,
      inputType: 'multiselect',
      fallbackOptions: disabled ? [] : fetchedBuildings,
      disabled: disabled,
      onOpen: () => fetchBuildings(selectedZoneIds.length > 0 ? selectedZoneIds : null, selectedWardIds)
    };
  }

  if (opt.includes('search') || opt.includes('specific')) return { label: t('dynamicFields.labels.searchProperty'), placeholder: t('dynamicFields.placeholders.searchByUPIC'), required: true, inputType: 'text', fallbackOptions: [] };
  if (opt.includes('from') || opt.includes('to')) {
    let selectedWardIds: string[] = [];
    for (const key in selectionData) {
      if (key.toLowerCase().includes('ward') && selectionData[key]) {
        selectedWardIds = [...selectedWardIds, ...selectionData[key]];
      }
    }
    const disabled = selectedWardIds.length === 0;

    return {
      label: opt.includes('from') ? t('dynamicFields.labels.fromPropertyNo') : t('dynamicFields.labels.toPropertyNo'),
      placeholder: disabled ? t('dynamicFields.placeholders.noOptionsAvailable') : t('dynamicFields.placeholders.selectPropertyNo'),
      required: true,
      inputType: 'searchselect',
      fallbackOptions: disabled ? [] : fetchedBuildings,
      disabled: disabled,
      onOpen: () => fetchBuildings(null, selectedWardIds)
    };
  }
  const fallbackLabelKey = `dynamicFields.labels.${opt}`;
  const fallbackPlaceholderKey = `dynamicFields.placeholders.select${opt.charAt(0).toUpperCase() + opt.slice(1)}`;
  return {
    label: t.has(fallbackLabelKey) ? t(fallbackLabelKey) : option,
    placeholder: t.has(fallbackPlaceholderKey) ? t(fallbackPlaceholderKey) : `Select ${option.toLowerCase()}`,
    required: false,
    inputType: 'text',
    fallbackOptions: []
  };
};

export const getHeaderTitle = (scope: Scope, displayName: string, options: string[], t: any) => {
  if (scope === 'property') return t('dynamicFields.headerTitle.property');
  if (scope === 'range') return t('dynamicFields.headerTitle.range');
  const localizedOptions = options.map(opt => {
    const cleanOpt = opt.toLowerCase();
    if (cleanOpt.includes('zone')) return t('dynamicFields.labels.zoneNode').toUpperCase();
    if (cleanOpt.includes('ward')) return t('dynamicFields.labels.wardSector').toUpperCase();
    if (cleanOpt.includes('property type')) return t('dynamicFields.labels.propertyType').toUpperCase();
    if (cleanOpt.includes('building') || cleanOpt.includes('property no')) return t('dynamicFields.labels.building').toUpperCase();
    if (cleanOpt.includes('assessment status')) return t('dynamicFields.labels.assessmentStatus').toUpperCase();
    return opt.toUpperCase();
  }).join(', ');

  const scopeKey = scope === 'all' ? 'allProperties' : scope === 'zone' ? 'zoneNode' : scope === 'ward' ? 'wardSector' : scope === 'building' ? 'buildingWise' : scope === 'property' ? 'propertyWise' : scope === 'range' ? 'propertyRange' : scope;
  const titleKey = `scopeSelection.scopes.${scopeKey}`;
  const scopeDisplayName = t.has(titleKey) ? t(titleKey) : displayName;
  return `${scopeDisplayName.toUpperCase()} — SELECT ${localizedOptions}`;
};
