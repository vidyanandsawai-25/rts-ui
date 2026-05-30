import { commonValidations } from '@/lib/utils/validation';
import { validateForm, type Validator } from '@/lib/utils/validation-helpers';
import { CODE_SANITIZE, DESCRIPTION_REGEX, DESCRIPTION_SANITIZE } from '@/lib/utils/validation-rules';
import { isValidWebsiteUrl } from './ulb-master.formatters';
import * as CONST from './ulb-form-validation.constants';
import type {
  ULBConfigurationFormData,
  UlbSectionKey,
} from '@/types/ulbconfig-master.types';

export type UlbConfigurationFieldErrors = Partial<
  Record<keyof ULBConfigurationFormData, string>
>;

type TranslateFn = (key: string, values?: Record<string, string | number | Date>) => string;

function chainValidators(...validators: Validator[]): Validator {
  return (value: unknown) => {
    for (const validator of validators) {
      const error = validator(value);
      if (error) return error;
    }
    return undefined;
  };
}

function requiredField(t: TranslateFn, messageKey: string): Validator {
  return (value: unknown) => {
    if (!String(value ?? '').trim()) return t(messageKey);
    return undefined;
  };
}

function pincodeValidator(t: TranslateFn, requiredKey?: string): Validator {
  return (value: unknown) => {
    const strVal = String(value ?? '').trim();
    if (!strVal) return requiredKey ? t(requiredKey) : undefined;
    if (!/^[1-9]\d{5}$/.test(strVal)) return t('form.validation.invalidPincode');
    return undefined;
  };
}

function websiteValidator(t: TranslateFn, formatKey: string): Validator {
  return (value: unknown) => {
    const strVal = String(value ?? '').trim();
    if (!strVal) return undefined;
    if (!isValidWebsiteUrl(strVal)) return t(formatKey);
    return undefined;
  };
}

function getTextMaxLength(field: keyof ULBConfigurationFormData): number {
  switch (field) {
    case 'ulbName':
      return CONST.ULB_NAME_MAX;
    case 'ulbCode':
      return CONST.ULB_CODE_MAX;
    case 'contactPerson':
      return CONST.CONTACT_PERSON_MAX;
    case 'designation':
      return CONST.DESIGNATION_MAX;
    case 'address':
      return CONST.ADDRESS_MAX;
    case 'implementationPartner':
      return CONST.IMPLEMENTATION_PARTNER_MAX;
    case 'projectManager':
      return CONST.PROJECT_MANAGER_MAX;
    case 'email':
    case 'projectManagerEmail':
      return CONST.EMAIL_MAX;
    case 'website':
      return CONST.WEBSITE_MAX;
    default:
      return 255;
  }
}

/** Sanitizes ULB text field input while typing. */
export function sanitizeUlbFieldValue(
  field: keyof ULBConfigurationFormData,
  value: string
): string {
  switch (field) {
    case 'ulbCode':
      return value.replace(CODE_SANITIZE, '').slice(0, CONST.ULB_CODE_MAX);
    case 'ulbName':
    case 'contactPerson':
    case 'designation':
    case 'address':
    case 'implementationPartner':
    case 'projectManager':
      return value.replace(DESCRIPTION_SANITIZE, '').slice(0, getTextMaxLength(field));
    case 'pincode':
      return value.replace(/\D/g, '').slice(0, CONST.PINCODE_LENGTH);
    case 'phone':
    case 'alternatePhone':
    case 'projectManagerPhone':
      return value.replace(/\D/g, '').slice(0, CONST.PHONE_LENGTH);
    case 'email':
    case 'projectManagerEmail':
      return value.slice(0, CONST.EMAIL_MAX);
    case 'website':
      return value.slice(0, CONST.WEBSITE_MAX);
    default:
      return value;
  }
}

function optionalDescription(t: TranslateFn, maxLength: number): Validator {
  return (value: unknown) => {
    const strVal = String(value ?? '').trim();
    if (!strVal) return undefined;
    if (strVal.length > maxLength) return t('form.validation.descriptionMaxLength', { count: maxLength });
    if (!DESCRIPTION_REGEX.test(strVal)) return t('form.validation.descriptionFormat');
    return undefined;
  };
}

function createUlbInfoSchema(tCommon: TranslateFn, tUlb: TranslateFn): Record<string, Validator> {
  return {
    ulbName: chainValidators(
      requiredField(tUlb, 'validation.ulbNameRequired'),
      commonValidations.masterDescription(tCommon, CONST.ULB_NAME_MAX)
    ),
    ulbCode: chainValidators(
      requiredField(tUlb, 'validation.ulbCodeRequired'),
      commonValidations.masterCode(tCommon, CONST.ULB_CODE_MAX)
    ),
    ulbType: requiredField(tUlb, 'validation.ulbTypeRequired'),
    state: requiredField(tUlb, 'validation.stateRequired'),
    district: requiredField(tUlb, 'validation.districtRequired'),
    pincode: pincodeValidator(tCommon, 'validation.pincodeRequired'),
    contactPerson: chainValidators(
      requiredField(tUlb, 'validation.contactPersonRequired'),
      commonValidations.masterDescription(tCommon, CONST.CONTACT_PERSON_MAX)
    ),
    designation: chainValidators(
      requiredField(tUlb, 'validation.designationRequired'),
      commonValidations.masterDescription(tCommon, CONST.DESIGNATION_MAX)
    ),
    address: chainValidators(
      requiredField(tUlb, 'validation.addressRequired'),
      commonValidations.masterDescription(tCommon, CONST.ADDRESS_MAX)
    ),
    email: chainValidators(
      requiredField(tUlb, 'validation.emailRequired'),
      commonValidations.email(tCommon, 'form.validation.invalidEmail')
    ),
    phone: chainValidators(
      requiredField(tUlb, 'validation.phoneRequired'),
      commonValidations.mobile(tCommon, 'form.validation.invalidPhone')
    ),
    alternatePhone: commonValidations.mobile(tCommon, 'form.validation.invalidPhone'),
    website: websiteValidator(tUlb, 'validation.websiteFormat'),
  };
}

function createProjectLicenseSchema(
  tCommon: TranslateFn,
  tUlb: TranslateFn
): Record<string, Validator> {
  return {
    projectStartDate: requiredField(tUlb, 'validation.projectStartDateRequired'),
    financialYearStart: requiredField(tUlb, 'validation.financialYearStartRequired'),
    projectManager: chainValidators(
      requiredField(tUlb, 'validation.projectManagerRequired'),
      commonValidations.masterDescription(tCommon, CONST.PROJECT_MANAGER_MAX)
    ),
    projectManagerEmail: chainValidators(
      requiredField(tUlb, 'validation.projectManagerEmailRequired'),
      commonValidations.email(tCommon, 'form.validation.invalidEmail')
    ),
    projectManagerPhone: commonValidations.mobile(tCommon, 'form.validation.invalidPhone'),
    implementationPartner: optionalDescription(tCommon, CONST.IMPLEMENTATION_PARTNER_MAX),
    licenseType: requiredField(tUlb, 'validation.licenseTypeRequired'),
    licenseKey: requiredField(tUlb, 'validation.licenseKeyRequired'),
    licenseStartDate: requiredField(tUlb, 'validation.licenseStartDateRequired'),
    licenseDuration: requiredField(tUlb, 'validation.licenseDurationRequired'),
    supportType: requiredField(tUlb, 'validation.supportTypeRequired'),
  };
}

const SECTION_SCHEMA_BUILDERS: Record<
  UlbSectionKey,
  ((tCommon: TranslateFn, tUlb: TranslateFn) => Record<string, Validator>) | null
> = {
  'ulb-info': createUlbInfoSchema,
  'logo-images': null,
  'project-license-info': createProjectLicenseSchema,
};

/** Validates ULB configuration text/select fields for a section using common validators. */
export function validateUlbConfigurationFields(
  data: ULBConfigurationFormData,
  section: UlbSectionKey,
  tCommon: TranslateFn,
  tUlb: TranslateFn
): UlbConfigurationFieldErrors {
  const buildSchema = SECTION_SCHEMA_BUILDERS[section];
  if (!buildSchema) return {};

  const schema = buildSchema(tCommon, tUlb);
  return validateForm(data, schema) as UlbConfigurationFieldErrors;
}

/** Returns the first validation error message for a section, if any. */
export function getFirstUlbFieldError(
  errors: UlbConfigurationFieldErrors,
  section: UlbSectionKey
): string | null {
  const buildSchema = SECTION_SCHEMA_BUILDERS[section];
  if (!buildSchema) return null;

  const fieldOrder = Object.keys(buildSchema(() => '', () => ''));
  for (const field of fieldOrder) {
    const message = errors[field as keyof ULBConfigurationFormData];
    if (message) return message;
  }

  return null;
}
