import { DataType, InputType, SourceType, ApiResponseMapping, FieldConfig, EffectTypeConfig } from '@/types/rule-engine.types';

export function adaptEffectConfigToFieldConfig(config: EffectTypeConfig): FieldConfig {
  const isStaticApi = !!config.staticApiEndpoint;
  return {
    id: config.effectTypeId,
    fieldId: config.effectType,
    dataType: config.dataType as any,
    inputType: (isStaticApi ? config.staticApiInputType?.toUpperCase() : config.inputType?.toUpperCase()) as any,
    sourceType: isStaticApi ? 'API' : (config.hasApiSource ? 'API' : (config.hasStaticValues ? 'STATIC' : 'NONE')),
    staticValuesJson: config.staticValuesJson ?? undefined,
    apiEndpoint: (isStaticApi ? config.staticApiEndpoint : config.apiEndpoint) ?? undefined,
    apiMethod: (isStaticApi ? config.staticApiMethod : config.apiMethod) ?? undefined,
    apiParameters: (isStaticApi ? config.staticApiParamter : config.apiParameters) ?? undefined,
    apiResponseMapping: (isStaticApi ? config.staticApiResponseMapping : undefined) ?? undefined,
    isRequired: config.isRequired,
    defaultValue: config.defaultValue ?? undefined,
    validationRegex: config.validationRegex ?? undefined,
    numericMin: config.minValue ?? undefined,
    numericMax: config.maxValue ?? undefined,
    textMinLength: config.minLength ?? undefined,
    textMaxLength: config.maxLength ?? undefined,
  };
}

// ─── Field-type mappers ───────────────────────────────────────────────────────

export function mapFieldTypeToDataType(fieldType: string, fallbackDataType: string): DataType {
  const t = (fieldType || fallbackDataType || 'STRING').toUpperCase();
  if (t === 'INTEGER' || t === 'INT' || t === 'INT32') return 'INTEGER';
  if (t === 'DECIMAL' || t === 'DOUBLE' || t === 'FLOAT' || t === 'NUMBER') return 'DECIMAL';
  if (t === 'DATE' || t === 'DATETIME') return 'DATE';
  if (t === 'BOOLEAN' || t === 'BOOL') return 'BOOLEAN';
  return 'STRING';
}

export function mapInputType(
  apiInputType: string,
  dataType: DataType,
  hasStaticValues: boolean,
  staticValuesJson?: string
): InputType {
  const t = (apiInputType || '').toUpperCase();
  if (t === 'DROPDOWN') return 'DROPDOWN';
  if (t === 'TEXTBOX') return 'TEXTBOX';
  if (t === 'DATEPICKER') return 'DATEPICKER';
  if (t === 'CHECKBOX') return 'CHECKBOX';
  if (t === 'RADIO') return 'RADIO';
  if (t === 'MULTISELECT') return 'MULTISELECT';
  // Infer from data characteristics when inputType is not explicitly set
  if (hasStaticValues || (staticValuesJson && staticValuesJson.trim() && staticValuesJson !== '[]')) return 'MULTISELECT';
  if (dataType === 'BOOLEAN') return 'DROPDOWN';
  if (dataType === 'DATE') return 'DATEPICKER';
  return 'TEXTBOX';
}

export function mapSourceType(
  hasApiSource: boolean,
  hasStaticValues: boolean,
  staticJson?: string
): SourceType {
  if (hasApiSource) return 'API';
  if (hasStaticValues || (staticJson && staticJson.trim() && staticJson !== '[]')) return 'STATIC';
  return 'NONE';
}

// ─── API response → option list mappers ──────────────────────────────────────

/**
 * Structured mapper: uses ApiResponseMapping config for precise label/value extraction.
 * Supports dot-notated responsePath and {fieldName} displayTemplate substitution.
 * Falls back to heuristic mapper if mappingJson is malformed.
 */
export function mapApiResponseWithMapping(
  data: any,
  mappingJson: string
): { label: string; value: string }[] {
  let mapping: ApiResponseMapping;
  try {
    mapping = JSON.parse(mappingJson) as ApiResponseMapping;
  } catch {
    return mapApiResponseToOptions(data);
  }

  let items: any[] = [];
  if (mapping.responsePath) {
    let current: any = data;
    for (const key of mapping.responsePath.split('.')) { current = current?.[key]; }
    if (Array.isArray(current)) {
      items = current;
    } else if (data && typeof data === 'object') {
      if (Array.isArray(data.items)) items = data.items;
      else if (Array.isArray(data.data)) items = data.data;
      else if (Array.isArray(data)) items = data;
    }
  } else if (Array.isArray(data)) {
    items = data;
  } else if (data && typeof data === 'object') {
    if (Array.isArray(data.items)) items = data.items;
    else if (Array.isArray(data.data)) items = data.data;
  }

  if (items.length === 0) return [];

  return items
    .filter((item) => item && typeof item === 'object')
    .map((item) => {
      const value = String(item[mapping.valuePath] ?? '');
      if (!value) return null;
      const label = mapping.displayTemplate
        ? mapping.displayTemplate.replace(/\{(\w+)\}/g, (_, field: string) => String(item[field] ?? ''))
        : String(item[mapping.labelPath] ?? value);
      return { value, label };
    })
    .filter((opt): opt is { value: string; label: string } => opt !== null && opt.value !== '');
}

/**
 * Generic heuristic mapper: converts any PTIS API response to { label, value }[].
 * Handles direct arrays and paginated { items: [] } / { data: [] } shapes.
 */
export function mapApiResponseToOptions(data: any): { label: string; value: string }[] {
  let items: any[] = [];
  if (Array.isArray(data)) { items = data; }
  else if (data?.items && Array.isArray(data.items)) { items = data.items; }
  else if (data?.data && Array.isArray(data.data)) { items = data.data; }
  else { return []; }

  return items
    .filter((item) => item && typeof item === 'object')
    .map((item) => {
      const keys = Object.keys(item);
      const valueKey =
        keys.find((k) => k.toLowerCase() === 'id') ||
        keys.find((k) => k.toLowerCase() === 'code') ||
        keys.find((k) => k.toLowerCase() === 'value') ||
        keys.find((k) => k.toLowerCase() === 'key') ||
        keys[0];
      const labelKey =
        keys.find((k) => ['name', 'label', 'displayname', 'description', 'title'].includes(k.toLowerCase())) ||
        keys.find((k) => k.toLowerCase().includes('name') && k !== valueKey) ||
        keys.find((k) => k.toLowerCase().includes('type') && typeof item[k] === 'string' && k !== valueKey) ||
        keys.find((k) => typeof item[k] === 'string' && k !== valueKey) ||
        valueKey;
      return {
        value: String(valueKey ? item[valueKey] : ''),
        label: String(labelKey ? item[labelKey] : (valueKey ? item[valueKey] : '')),
      };
    })
    .filter((opt) => opt.value !== '');
}


