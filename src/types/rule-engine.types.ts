/**
 * Rule Engine TypeScript Definitions
 * Standard interface definitions for dynamic visual conditions, effects, target filters,
 * field config schemas, scopes, and Microsoft Rules Engine compatible state models.
 */

export type DataType = 'STRING' | 'INTEGER' | 'DECIMAL' | 'DATE' | 'BOOLEAN';

/**
 * Structured response mapping config stored as JSON in the RuleFields.apiResponseMapping column.
 * Tells the dynamic fetcher exactly how to extract label/value pairs from any API response shape.
 */
export interface ApiResponseMapping {
  /** Dot-notated path to the array in the response (e.g. "items", "data.results") */
  responsePath?: string;
  /** Field name to use as the option value (e.g. "id") */
  valuePath: string;
  /** Field name to use as the option label (e.g. "description") */
  labelPath: string;
  /** Optional multi-field label template (e.g. "{floorCode} - {description}") */
  displayTemplate?: string;
  /** Additional fields to extract for template substitution */
  additionalFields?: Record<string, string>;
}

export type InputType =
  | 'DROPDOWN'
  | 'TEXTBOX'
  | 'DATEPICKER'
  | 'CHECKBOX'
  | 'RADIO'
  | 'MULTISELECT';

export type SourceType = 'STATIC' | 'API' | 'MASTER_TABLE' | 'NONE';

export interface OperatorItem {
  id: number;
  code: string;
  label: string;
  isDefault: boolean;
}

export interface StaticValue {
  value: string;
  label: string;
}

export interface FieldConfig {
  id: number;
  fieldId: string;
  fieldName?: string;
  databaseColumnName?: string;
  dataType: DataType;
  inputType: InputType;
  sourceType: SourceType;
  staticValuesJson?: string;
  apiEndpoint?: string;
  apiMethod?: string;
  apiParameters?: string;
  /** Raw JSON string of ApiResponseMapping — used by getDynamicFieldOptions for structured extraction */
  apiResponseMapping?: string;
  masterTableName?: string;
  valueColumn?: string;
  displayColumn?: string;
  filterColumn?: string;
  filterValue?: string;
  isRequired: boolean;
  supportsNA?: boolean;
  defaultValue?: string;
  validationRegex?: string;
  numericMin?: number;
  numericMax?: number;
  textMinLength?: number;
  textMaxLength?: number;
  placeholder?: string;
  helpText?: string;
  dependsOnFieldId?: string;
  dependencyMapping?: string;
  supportedOperators?: OperatorItem[];
}

export interface EffectTypeConfig {
  effectTypeId: number;
  effectType: string;
  dataType: string;
  inputType: string;
  hasApiSource: boolean;
  apiEndpoint: string | null;
  apiMethod: string | null;
  apiParameters: string | null;
  staticApiEndpoint?: string | null;
  staticApiInputType?: string | null;
  staticApiMethod?: string | null;
  staticApiParamter?: string | null;
  staticApiResponseMapping?: string | null;
  hasStaticValues: boolean;
  staticValuesJson: string | null;
  isRequired: boolean;
  defaultValue: string | null;
  validationRegex: string | null;
  minValue: number | null;
  maxValue: number | null;
  minLength: number | null;
  maxLength: number | null;
  expressionTemplate: string | null;
}

export interface RuleScope {
  id: number;
  scopeName: string;
  description?: string;
}

export interface PolicyType {
  id: number;
  typeName: string;
  description?: string;
}

export interface ConditionState {
  id: string;
  fieldId: string;
  operator: string;
  value: string | string[];
  valueLabel?: string | string[];
}

export interface ConditionGroupState {
  id: string;
  logicalOperator: 'AND' | 'OR';
  conditions: ConditionState[];
  groups: ConditionGroupState[];
}

export interface TargetFilterState {
  propertyTypes?: string[];
  constructionTypes?: string[];
  zones?: string[];
  usageTypes?: string[];
}

export interface EffectState {
  effectType: string; // e.g., EXEMPTION, MODIFIER_PERCENT, RATE_OVERRIDE, RATE_MULTIPLY
  value: number | string;
  isPercentage: boolean;
  multiplierField?: string;
  overrideRate?: number | string;
}

export interface SkipRuleRef {
  ruleId: number;
  ruleCode: string;
  ruleName: string;
  reason?: string;
}

export interface RuleItem {
  id?: number;
  ruleName: string;
  ruleCode: string;
  policyTypeId?: number;
  ruleScopeId: number;
  isActive: boolean;
  effectiveFrom?: string;
  effectiveTo?: string;
  conditionsJson: string;   // Serialized ConditionGroupState (UI visual state)
  effectJson: string;       // Serialized EffectState (UI visual state)
  ruleJson?: string;        // MS Rules Engine-compatible policy JSON
  targetFiltersJson?: string; // Serialized TargetFilterState
  createdDate?: string;
  updatedDate?: string;
  description?: string;
  ruleCategory?: string;
  changeReason?: string;
  createdBy?: number;
  updatedBy?: number;
  /** Rule evaluation priority — lower number = higher priority */
  priority?: number;
  /** Whether this rule is enabled for evaluation */
  isEnabled?: boolean;
  /** When true, no further rules are evaluated after this one matches */
  stopProcessing?: boolean;
  /** IDs of rules to skip when this rule matches */
  skipRuleIds?: number[];
  /** Human-readable reason why the listed rules are skipped */
  exclusionReason?: string;
  /** Populated by the API response — resolved skip rule references */
  skipRules?: SkipRuleRef[];
  ruleScopeName?: string;
  subRules?: {
    id: string;
    description: string | null;
    isEnabled: boolean;
    stopProcessing: boolean;
  }[];
}

export interface RuleListResponse {
  items: RuleItem[];
  totalCount: number;
  pageNumber: number;
  pageSize: number;
  totalPages: number;
  hasPrevious: boolean;
  hasNext: boolean;
}

export interface RuleBlock {
  id: string;
  description: string;
  conditions: ConditionGroupState;
  effect: EffectState;
  stopProcessing?: boolean;
  ruleScopeName?: string;
}
