/**
 * Tax Calculation Guideline – Configuration Constants
 */
import type {
  DatePriorityOption,
  DurationUnit,
  ElectricBillDateRule,
  NoDateRule,
  ProrationType,
  TaxCalculationGuidelineFormData,
  TaxPersistenceMode,
} from '@/types/tax-calculation-guideline.types';

// ─── Dropdown Options ──────────────────────────────────────────────────────

export const DATE_PRIORITY_OPTIONS: { label: string; value: DatePriorityOption }[] = [
  { label: 'Select', value: 'Select' },
  { label: 'OC Date', value: 'OC Date' },
  { label: 'CC Date', value: 'CC Date' },
  { label: 'Electric Bill Date', value: 'Electric Bill Date' },
  { label: 'Retrospective (No Date)', value: 'Retrospective (No Date)' },
];

export const ELECTRIC_BILL_DATE_RULE_OPTIONS: { label: string; value: ElectricBillDateRule }[] = [
  { label: 'Select', value: 'Select' },
  { label: 'From Financial Year Start Date', value: 'From Financial Year Start Date' },
  { label: 'From CC Date', value: 'From CC Date' },
  { label: 'From OC Date', value: 'From OC Date' },
  { label: 'From Electric Bill Date', value: 'From Electric Bill Date' },
  { label: 'Exact Date', value: 'Exact Date' },
];

export const NO_DATE_RULE_OPTIONS: { label: string; value: NoDateRule }[] = [
  { label: 'Select', value: 'Select' },
  { label: 'Apply Default Retrospective', value: 'Apply Default Retrospective' },
  { label: 'Skip Tax Calculation', value: 'Skip Tax Calculation' },
  { label: 'Use Last Known Date', value: 'Use Last Known Date' },
];

export const DURATION_UNIT_OPTIONS: { label: string; value: DurationUnit }[] = [
  { label: 'Select', value: 'Select' },
  { label: 'Days', value: 'Days' },
  { label: 'Months', value: 'Months' },
  { label: 'Years', value: 'Years' },
];

export const PRORATION_TYPE_OPTIONS: { label: string; value: ProrationType }[] = [
  { label: 'Select', value: 'Select' },
  { label: 'Monthly', value: 'Monthly' },
  { label: 'Daily', value: 'Daily' },
  { label: 'Full Year', value: 'Full Year' },
];

export const TAX_PERSISTENCE_MODE_OPTIONS: { label: string; value: TaxPersistenceMode }[] = [
  { label: 'Select', value: 'Select' },
  { label: 'Property Aggregated', value: 'Property Aggregated' },
  { label: 'Floor Level', value: 'Floor Level' },
  { label: 'Assessment Year', value: 'Assessment Year' },
  { label: 'Floor Ledger', value: 'Floor Ledger' },
];

/** Months for the financial year start picker (1-indexed) */
export const MONTH_OPTIONS = [
  { label: 'Select', value: 'Select' },
  { label: 'January (1)', value: '1' },
  { label: 'February (2)', value: '2' },
  { label: 'March (3)', value: '3' },
  { label: 'April (4)', value: '4' },
  { label: 'May (5)', value: '5' },
  { label: 'June (6)', value: '6' },
  { label: 'July (7)', value: '7' },
  { label: 'August (8)', value: '8' },
  { label: 'September (9)', value: '9' },
  { label: 'October (10)', value: '10' },
  { label: 'November (11)', value: '11' },
  { label: 'December (12)', value: '12' },
];

/** Day options (1-31) */
export const DAY_OPTIONS = [
  { label: 'Select', value: 'Select' },
  ...Array.from({ length: 31 }, (_, i) => ({
    label: String(i + 1),
    value: String(i + 1),
  })),
];

// ─── Default Form Values ───────────────────────────────────────────────────

export const DEFAULT_TAX_GUIDELINE_FORM: TaxCalculationGuidelineFormData = {
  generalSettings: {
    enableCertificateBasedTax: false,
    applyTaxOnlyForTaxableCertificateTypes: false,
    financialYearStart: { month: 'Select', day: 'Select' },
    certificateTaxScopeMode: 'Select',
    minimumBackdateFinancialYear: 2016,
  },
  certificateDatePriority: {
    priority1: 'CC Date',
    priority2: 'OC Date',
    priority3: 'Electric Bill Date',
    priority4: 'Retrospective (No Date)',
  },
  ccOcRules: {
    applyCcToOcSplit: false,
    ccOcDifferenceThreshold: undefined,
    ccOcDifferenceUnit: 'Select',
    ccPeriodMultiplier: undefined,
    ocPeriodMultiplier: undefined,
    enableCurrentFyPartialPolicy: false,
    ccPartialPolicyCode: 'Select',
    ocPartialPolicyCode: 'Select',
  },
  electricBillRules: {
    electricBillDateRule: 'From Financial Year Start Date',
    addMonthsToElectricBillDate: 0,
    addMonthsUnit: 'Select',
    electricBillMultiplier: 1,
    electricBillMinimumFinancialYear: 2016,
    electricBillPartialPolicyCode: 'Select',
  },
  retrospectiveRules: {
    enableRetrospectiveTax: false,
    whenNoDateIsAvailable: 'Skip Tax Calculation',
    lookbackYears: 6,
    defaultRetrospectiveMultiplier: undefined,
  },
  otherSettings: {
    enableCurrentYearProration: false,
    prorationType: 'Select',
    taxPersistenceMode: 'Select',
    doNotUpdateNettax: false,
    guidelineChangeApplyMode: 'Select',
    recalculateOnCertificateSave: false,
    recalculateOnCertificateDelete: false,
    allowFloorWiseCertificateMetadata: false,
    floorPolicyDisplayRule: 'Select',
  },
  dynamicGuidelines: [],
};

export const FIELD_MAPPINGS: Record<string, {
  section: string;
  field: string;
  type: string;
}> = {
  // General Settings
  'ENABLE_CERTIFICATE_BASED_TAX': { section: 'generalSettings', field: 'enableCertificateBasedTax', type: 'boolean' },
  'APPLY_ONLY_TAXABLE_CERT_TYPES': { section: 'generalSettings', field: 'applyTaxOnlyForTaxableCertificateTypes', type: 'boolean' },
  'FINANCIAL_YEAR_START_MONTH': { section: 'generalSettings', field: 'financialYearStart.month', type: 'month' },
  'FINANCIAL_YEAR_START_DAY': { section: 'generalSettings', field: 'financialYearStart.day', type: 'day' },
  'MINIMUM_BACKDATE_FINANCIAL_YEAR': { section: 'generalSettings', field: 'minimumBackdateFinancialYear', type: 'number' },
  'CERTIFICATE_TAX_SCOPE_MODE': { section: 'generalSettings', field: 'certificateTaxScopeMode', type: 'string' },

  // Date Priority Rules
  'DATE_PRIORITY_1': { section: 'certificateDatePriority', field: 'priority1', type: 'priority' },
  'DATE_PRIORITY_2': { section: 'certificateDatePriority', field: 'priority2', type: 'priority' },
  'DATE_PRIORITY_3': { section: 'certificateDatePriority', field: 'priority3', type: 'priority' },
  'DATE_PRIORITY_4': { section: 'certificateDatePriority', field: 'priority4', type: 'priority' },

  // CC & OC Rules
  'ENABLE_CC_TO_OC_SPLIT': { section: 'ccOcRules', field: 'applyCcToOcSplit', type: 'boolean' },
  'IGNORE_CC_TO_OC_IF_WITHIN_VALUE': { section: 'ccOcRules', field: 'ccOcDifferenceThreshold', type: 'number' },
  'IGNORE_CC_TO_OC_IF_WITHIN_TYPE': { section: 'ccOcRules', field: 'ccOcDifferenceUnit', type: 'unit' },
  'CC_PERIOD_MULTIPLIER': { section: 'ccOcRules', field: 'ccPeriodMultiplier', type: 'number' },
  'OC_PERIOD_MULTIPLIER': { section: 'ccOcRules', field: 'ocPeriodMultiplier', type: 'number' },
  'ENABLE_CURRENT_FY_PARTIAL_POLICY': { section: 'ccOcRules', field: 'enableCurrentFyPartialPolicy', type: 'boolean' },
  'CC_PARTIAL_POLICY_CODE': { section: 'ccOcRules', field: 'ccPartialPolicyCode', type: 'string' },
  'OC_PARTIAL_POLICY_CODE': { section: 'ccOcRules', field: 'ocPartialPolicyCode', type: 'string' },

  // Electric Bill Rules
  'ELECTRIC_BILL_DATE_RULE': { section: 'electricBillRules', field: 'electricBillDateRule', type: 'ebRule' },
  'ELECTRIC_BILL_ADD_MONTHS': { section: 'electricBillRules', field: 'addMonthsToElectricBillDate', type: 'number' },
  'ELECTRIC_BILL_MULTIPLIER': { section: 'electricBillRules', field: 'electricBillMultiplier', type: 'number' },
  'ELECTRIC_BILL_MINIMUM_FINANCIAL_YEAR': { section: 'electricBillRules', field: 'electricBillMinimumFinancialYear', type: 'number' },
  'ELECTRIC_BILL_PARTIAL_POLICY_CODE': { section: 'electricBillRules', field: 'electricBillPartialPolicyCode', type: 'string' },

  // Retrospective Rules
  'ENABLE_RETROSPECTIVE_TAX': { section: 'retrospectiveRules', field: 'enableRetrospectiveTax', type: 'boolean' },
  'NO_DATE_RULE': { section: 'retrospectiveRules', field: 'whenNoDateIsAvailable', type: 'noDateRule' },
  'LOOKBACK_YEARS': { section: 'retrospectiveRules', field: 'lookbackYears', type: 'number' },
  'DEFAULT_RETROSPECTIVE_MULTIPLIER': { section: 'retrospectiveRules', field: 'defaultRetrospectiveMultiplier', type: 'number' },

  // Other Settings
  'ENABLE_CURRENT_YEAR_PRORATION': { section: 'otherSettings', field: 'enableCurrentYearProration', type: 'boolean' },
  'PRORATION_METHOD': { section: 'otherSettings', field: 'prorationType', type: 'proration' },
  'TAX_PERSISTENCE_MODE': { section: 'otherSettings', field: 'taxPersistenceMode', type: 'persistence' },
  'DO_NOT_UPDATE_NETTAX': { section: 'otherSettings', field: 'doNotUpdateNettax', type: 'boolean' },
  'GUIDELINE_CHANGE_APPLY_MODE': { section: 'otherSettings', field: 'guidelineChangeApplyMode', type: 'string' },
  'RECALCULATE_ON_CERTIFICATE_SAVE': { section: 'otherSettings', field: 'recalculateOnCertificateSave', type: 'boolean' },
  'RECALCULATE_ON_CERTIFICATE_DELETE': { section: 'otherSettings', field: 'recalculateOnCertificateDelete', type: 'boolean' },
  'ALLOW_FLOOR_WISE_CERTIFICATE_METADATA': { section: 'otherSettings', field: 'allowFloorWiseCertificateMetadata', type: 'boolean' },
  'FLOOR_POLICY_DISPLAY_RULE': { section: 'otherSettings', field: 'floorPolicyDisplayRule', type: 'string' }
};
