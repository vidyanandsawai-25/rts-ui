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
    applyTaxOnlyForProtectedCertificateTypes: false,
    financialYearStart: { month: 'Select', day: 'Select' },
  },
  certificateDatePriority: {
    priority1: 'Select',
    priority2: 'Select',
    priority3: 'Select',
    priority4: 'Select',
  },
  ccOcRules: {
    applyCcToOcSplit: false,
    ccOcDifferenceThreshold: undefined,
    ccOcDifferenceUnit: 'Select',
    ccPeriodMultiplier: undefined,
    ocPeriodMultiplier: undefined,
  },
  electricBillRules: {
    electricBillDateRule: 'Select',
    addMonthsToElectricBillDate: undefined,
    addMonthsUnit: 'Select',
    electricBillMultiplier: undefined,
  },
  retrospectiveRules: {
    whenNoDateIsAvailable: 'Select',
    lookbackYears: undefined,
    defaultRetrospectiveMultiplier: undefined,
  },
  otherSettings: {
    enableCurrentYearProration: false,
    prorationType: 'Select',
    taxPersistenceMode: 'Select',
  },
};
