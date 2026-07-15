/**
 * Tax Calculation Guideline – Data Mapper
 * Converts between API DTOs and the UI form data model.
 */
import { DEFAULT_TAX_GUIDELINE_FORM } from '@/config/tax-calculation-guideline.config';
import type {
  TaxCalculationGuidelineDto,
  TaxCalculationGuidelineFormData,
  DatePriorityOption,
  DurationUnit,
  ElectricBillDateRule,
  NoDateRule,
  ProrationType,
  TaxPersistenceMode,
} from '@/types/tax-calculation-guideline.types';

// ─── Bidirectional Enum Mappers ───────────────────────────────────────────

const DTO_TO_PRIORITY: Record<string, DatePriorityOption> = {
  OC: 'OC Date',
  CC: 'CC Date',
  ELECTRIC_BILL: 'Electric Bill Date',
  RETROSPECTIVE: 'Retrospective (No Date)',
};

const PRIORITY_TO_DTO: Record<DatePriorityOption, string | null> = {
  'OC Date': 'OC',
  'CC Date': 'CC',
  'Electric Bill Date': 'ELECTRIC_BILL',
  'Retrospective (No Date)': 'RETROSPECTIVE',
  Select: null,
};

const DTO_TO_EB_RULE: Record<string, ElectricBillDateRule> = {
  FROM_FY_START: 'From Financial Year Start Date',
  FROM_CC: 'From CC Date',
  FROM_OC: 'From OC Date',
  FROM_ELECTRIC_BILL: 'From Electric Bill Date',
  EXACT_DATE: 'Exact Date',
};

const EB_RULE_TO_DTO: Record<ElectricBillDateRule, string | null> = {
  'From Financial Year Start Date': 'FROM_FY_START',
  'From CC Date': 'FROM_CC',
  'From OC Date': 'FROM_OC',
  'From Electric Bill Date': 'FROM_ELECTRIC_BILL',
  'Exact Date': 'EXACT_DATE',
  Select: null,
};

const DTO_TO_NO_DATE_RULE: Record<string, NoDateRule> = {
  DEFAULT_RETROSPECTIVE: 'Apply Default Retrospective',
  NO_TAX: 'Skip Tax Calculation',
  USE_LAST_KNOWN: 'Use Last Known Date',
};

const NO_DATE_RULE_TO_DTO: Record<NoDateRule, string | null> = {
  'Apply Default Retrospective': 'DEFAULT_RETROSPECTIVE',
  'Skip Tax Calculation': 'NO_TAX',
  'Use Last Known Date': 'USE_LAST_KNOWN',
  Select: null,
};

const DTO_TO_UNIT: Record<string, DurationUnit> = {
  DAYS: 'Days',
  MONTHS: 'Months',
  YEARS: 'Years',
};

const UNIT_TO_DTO: Record<DurationUnit, string | null> = {
  Days: 'DAYS',
  Months: 'MONTHS',
  Years: 'YEARS',
  Select: null,
};

const DTO_TO_PRORATION: Record<string, ProrationType> = {
  MONTHLY: 'Monthly',
  DAILY: 'Daily',
  NONE: 'Select',
  FULL_YEAR: 'Full Year',
};

const PRORATION_TO_DTO: Record<ProrationType, string | null> = {
  Monthly: 'MONTHLY',
  Daily: 'DAILY',
  'Full Year': 'FULL_YEAR',
  Select: null,
};

const DTO_TO_PERSISTENCE: Record<string, TaxPersistenceMode> = {
  PROPERTY_AGGREGATED: 'Property Aggregated',
  FLOOR_LEVEL: 'Floor Level',
  ASSESSMENT_YEAR: 'Assessment Year',
  FLOOR_LEDGER: 'Floor Ledger',
};

const PERSISTENCE_TO_DTO: Record<TaxPersistenceMode, string | null> = {
  'Property Aggregated': 'PROPERTY_AGGREGATED',
  'Floor Level': 'FLOOR_LEVEL',
  'Assessment Year': 'ASSESSMENT_YEAR',
  'Floor Ledger': 'FLOOR_LEDGER',
  Select: null,
};

// ─── Mapping Functions ─────────────────────────────────────────────────────

/** Convert an API DTO → UI form data */
export function mapDtoToFormData(dto: TaxCalculationGuidelineDto): TaxCalculationGuidelineFormData {
  return {
    generalSettings: {
      enableCertificateBasedTax: dto.enableCertificateBasedTax ?? DEFAULT_TAX_GUIDELINE_FORM.generalSettings.enableCertificateBasedTax,
      applyTaxOnlyForProtectedCertificateTypes: dto.applyOnlyProtectedCertificateTypes ?? DEFAULT_TAX_GUIDELINE_FORM.generalSettings.applyTaxOnlyForProtectedCertificateTypes,
      financialYearStart: {
        month: dto.financialYearStartMonth ?? 'Select',
        day: dto.financialYearStartDay ?? 'Select',
      },
    },
    certificateDatePriority: {
      priority1: dto.datePriority1 ? (DTO_TO_PRIORITY[dto.datePriority1] ?? 'Select') : 'Select',
      priority2: dto.datePriority2 ? (DTO_TO_PRIORITY[dto.datePriority2] ?? 'Select') : 'Select',
      priority3: dto.datePriority3 ? (DTO_TO_PRIORITY[dto.datePriority3] ?? 'Select') : 'Select',
      priority4: dto.datePriority4 ? (DTO_TO_PRIORITY[dto.datePriority4] ?? 'Select') : 'Select',
    },
    ccOcRules: {
      applyCcToOcSplit:
        dto.enableCCToOCSplit ??
        DEFAULT_TAX_GUIDELINE_FORM.ccOcRules.applyCcToOcSplit,
      ccOcDifferenceThreshold: dto.ignoreCCToOCIfWithinValue,
      ccOcDifferenceUnit: dto.ignoreCCToOCIfWithinType ? (DTO_TO_UNIT[dto.ignoreCCToOCIfWithinType] ?? 'Select') : 'Select',
      ccPeriodMultiplier: dto.ccPeriodMultiplier,
      ocPeriodMultiplier: dto.ocPeriodMultiplier,
    },
    electricBillRules: {
      electricBillDateRule: dto.electricBillDateRule ? (DTO_TO_EB_RULE[dto.electricBillDateRule] ?? 'Select') : 'Select',
      addMonthsToElectricBillDate: dto.electricBillAddMonths,
      // WARNING: addMonthsUnit has no backend API field and cannot be persisted.
      // This field exists only in the UI. User selections will be lost on save/refresh.
      // Backend support required before this field becomes functional.
      addMonthsUnit: DEFAULT_TAX_GUIDELINE_FORM.electricBillRules.addMonthsUnit,
      electricBillMultiplier: dto.electricBillMultiplier,
    },
    retrospectiveRules: {
      whenNoDateIsAvailable: dto.noDateRule ? (DTO_TO_NO_DATE_RULE[dto.noDateRule] ?? 'Select') : 'Select',
      lookbackYears: dto.lookbackYears,
      defaultRetrospectiveMultiplier: dto.defaultRetrospectiveMultiplier,
    },
    otherSettings: {
      enableCurrentYearProration:
        dto.enableCurrentYearProration ??
        DEFAULT_TAX_GUIDELINE_FORM.otherSettings.enableCurrentYearProration,
      prorationType: dto.prorationMethod ? (DTO_TO_PRORATION[dto.prorationMethod] ?? 'Select') : 'Select',
      taxPersistenceMode: dto.taxPersistenceMode ? (DTO_TO_PERSISTENCE[dto.taxPersistenceMode] ?? 'Select') : 'Select',
    },
  };
}

/** Convert UI form data → API DTO payload, preserving unchanged keys from baseDto */
export function mapFormDataToDto(
  formData: TaxCalculationGuidelineFormData,
  baseDto?: TaxCalculationGuidelineDto | null
): TaxCalculationGuidelineDto {
  return {
    ...baseDto,
    guidelineCode: baseDto?.guidelineCode || 'DEFAULT',
    guidelineName: baseDto?.guidelineName || 'Default CC OC Electric Bill Tax Guideline',
    description: baseDto?.description || 'Default guideline for CC, OC, Electric Bill and retrospective tax calculation.',
    floorCertificatePriority: baseDto?.floorCertificatePriority || 'FLOOR_OVERRIDES_PROPERTY',
    remark: baseDto?.remark || 'Initial configuration settings.',
    isActive: baseDto?.isActive !== false,
    enableCertificateBasedTax: formData.generalSettings.enableCertificateBasedTax,
    applyOnlyProtectedCertificateTypes: formData.generalSettings.applyTaxOnlyForProtectedCertificateTypes,
    financialYearStartMonth: formData.generalSettings.financialYearStart.month === 'Select' ? null : Number(formData.generalSettings.financialYearStart.month),
    financialYearStartDay: formData.generalSettings.financialYearStart.day === 'Select' ? null : Number(formData.generalSettings.financialYearStart.day),
    datePriority1: PRIORITY_TO_DTO[formData.certificateDatePriority.priority1],
    datePriority2: PRIORITY_TO_DTO[formData.certificateDatePriority.priority2],
    datePriority3: PRIORITY_TO_DTO[formData.certificateDatePriority.priority3],
    datePriority4: PRIORITY_TO_DTO[formData.certificateDatePriority.priority4],
    enableCCToOCSplit: formData.ccOcRules.applyCcToOcSplit,
    ignoreCCToOCIfWithinValue: formData.ccOcRules.ccOcDifferenceThreshold,
    ignoreCCToOCIfWithinType: UNIT_TO_DTO[formData.ccOcRules.ccOcDifferenceUnit] ?? 'MONTHS',
    ccPeriodMultiplier: formData.ccOcRules.ccPeriodMultiplier,
    ocPeriodMultiplier: formData.ccOcRules.ocPeriodMultiplier,
    electricBillDateRule: EB_RULE_TO_DTO[formData.electricBillRules.electricBillDateRule] ?? 'FROM_FY_START',
    electricBillAddMonths: formData.electricBillRules.addMonthsToElectricBillDate,
    electricBillMultiplier: formData.electricBillRules.electricBillMultiplier,
    noDateRule: NO_DATE_RULE_TO_DTO[formData.retrospectiveRules.whenNoDateIsAvailable] ?? 'DEFAULT_RETROSPECTIVE',
    lookbackYears: formData.retrospectiveRules.lookbackYears,
    defaultRetrospectiveMultiplier: formData.retrospectiveRules.defaultRetrospectiveMultiplier,
    enableCurrentYearProration: formData.otherSettings.enableCurrentYearProration,
    prorationMethod: PRORATION_TO_DTO[formData.otherSettings.prorationType] ?? 'MONTHLY',
    taxPersistenceMode: PERSISTENCE_TO_DTO[formData.otherSettings.taxPersistenceMode] ?? 'PROPERTY_AGGREGATED',
  };
}

/** Build initial form data from an API DTO (or defaults when dto is null). */
export function buildInitialFormData(dto: TaxCalculationGuidelineDto | null): TaxCalculationGuidelineFormData {
  if (!dto) return DEFAULT_TAX_GUIDELINE_FORM;
  return mapDtoToFormData(dto);
}
