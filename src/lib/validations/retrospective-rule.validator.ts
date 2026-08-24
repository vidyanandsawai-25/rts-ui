import type { CreateRetrospectiveRuleInput } from '@/types/retrospective-rule.types';

export interface RetrospectiveRuleValidationResult {
  isValid: boolean;
  errors: Record<string, string>;
}

/**
 * Enterprise-grade validation function for Retrospective Rule Form & Builder.
 */
export function validateRetrospectiveRuleForm(
  input: Partial<CreateRetrospectiveRuleInput>,
  t?: (key: string) => string
): RetrospectiveRuleValidationResult {
  const errors: Record<string, string> = {};

  const getMsg = (key: string, fallback: string) => (t ? t(key) : fallback);

  // Rule Title Validation
  if (!input.ruleTitle || !input.ruleTitle.trim()) {
    errors.ruleTitle = getMsg('ruleTitleRequired', 'Rule title is required');
  } else if (input.ruleTitle.trim().length < 3) {
    errors.ruleTitle = getMsg('ruleTitleMin', 'Rule title must be at least 3 characters long');
  } else if (input.ruleTitle.trim().length > 100) {
    errors.ruleTitle = getMsg('ruleTitleMax', 'Rule title cannot exceed 100 characters');
  }

  // Rule Code Validation
  if (!input.ruleCode || !input.ruleCode.trim()) {
    errors.ruleCode = getMsg('ruleCodeRequired', 'Rule code is required');
  } else if (!/^[A-Z0-9-]+$/i.test(input.ruleCode.trim())) {
    errors.ruleCode = getMsg(
      'ruleCodeInvalid',
      'Rule code should only contain alphanumeric characters and hyphens'
    );
  }

  // Compare Evidence Dates Validation
  if (
    !input.compareEvidenceDates ||
    !input.compareEvidenceDates.trim() ||
    input.compareEvidenceDates.toLowerCase() === 'select'
  ) {
    errors.compareEvidenceDates = getMsg(
      'compareEvidenceDatesSelect',
      'Please select a valid comparison option'
    );
  }

  // Tax Starts From Validation
  if (
    !input.taxStartsFrom ||
    !input.taxStartsFrom.trim() ||
    input.taxStartsFrom.toLowerCase() === 'select'
  ) {
    errors.taxStartsFrom = getMsg(
      'taxStartsFromSelect',
      'Please select a valid tax start option'
    );
  }

  // Retrospective Limit Validation
  if (
    !input.retrospectiveLimit ||
    !input.retrospectiveLimit.trim() ||
    input.retrospectiveLimit.toLowerCase() === 'select'
  ) {
    errors.retrospectiveLimit = getMsg(
      'retrospectiveLimitSelect',
      'Please select a valid limit option'
    );
  }

  // Tax Calculation Mode Validation
  if (
    !input.taxCalculation ||
    !input.taxCalculation.trim() ||
    input.taxCalculation.toLowerCase() === 'select'
  ) {
    errors.taxCalculation = getMsg(
      'taxCalculationSelect',
      'Please select a valid tax calculation option'
    );
  }

  // Maximum Years Validation
  const isMaxYearsSelected =
    input.retrospectiveLimit &&
    (input.retrospectiveLimit.toLowerCase().includes('max') ||
      input.retrospectiveLimit.toLowerCase().includes('years'));

  if (isMaxYearsSelected && (input.maximumYears === undefined || input.maximumYears === '')) {
    errors.maximumYears = getMsg(
      'maxYearsRequired',
      'Maximum years is required when "Maximum years" limit is selected'
    );
  } else if (input.maximumYears !== undefined && input.maximumYears !== '') {
    const years = Number(input.maximumYears);
    if (isNaN(years) || years <= 0) {
      errors.maximumYears = getMsg('maxYearsPositive', 'Maximum years must be a positive number');
    } else if (years > 100) {
      errors.maximumYears = getMsg(
        'maxYearsLimit',
        'Maximum look-back limit cannot exceed 100 years'
      );
    }
  }

  // Tax Multiplier Validation
  if (input.taxMultiplier === undefined || input.taxMultiplier === '') {
    errors.taxMultiplier = getMsg('taxMultiplierRequired', 'Tax multiplier is required');
  } else {
    const mult = Number(input.taxMultiplier);
    if (isNaN(mult) || mult < 0) {
      errors.taxMultiplier = getMsg('taxMultiplierNegative', 'Tax multiplier cannot be negative');
    }
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}
