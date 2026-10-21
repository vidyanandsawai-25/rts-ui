import type { RtsFeeEvaluationResult, RtsFeeMatchedCondition, RtsFeeMatchedRule } from '@/types/rts/rts-rulemaster.types';

export type FeeBreakdownField = { label: string; options?: Record<string, string> };
export type FeeBreakdownLine = { label: string; amount: number; details: string[] };
type Translate = (key: string, values?: Record<string, string | number>) => string;

export function escapeFeeBreakdownHtml(value: string): string {
  return value.replace(/[&<>"]/g, (character) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;',
  })[character] || character);
}

const currency = (value: number) => `₹${Number(value).toFixed(2)}`;
const number = (value: number) => Number(value).toLocaleString('en-IN', { maximumFractionDigits: 2 });

function displayValue(raw: string, field: FeeBreakdownField | undefined): string {
  const value = raw.trim();
  if (value.startsWith('[')) {
    try {
      const selected = JSON.parse(value) as unknown;
      if (Array.isArray(selected) && selected.every((item) => typeof item === 'string')) {
        return selected.map((item) => field?.options?.[item.toLowerCase()] || item).join(', ');
      }
    } catch {
      // An ordinary text value can begin with '['.
    }
  }
  return field?.options?.[value.toLowerCase()] || value;
}

function dateAgeDetail(
  condition: RtsFeeMatchedCondition,
  fieldName: string,
  evaluationDate: string | undefined,
  locale: string,
  t: Translate
): string | null {
  const date = condition.actualValue.slice(0, 10);
  const reference = evaluationDate?.slice(0, 10) ?? '';
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || !/^\d{4}-\d{2}-\d{2}$/.test(reference)) return null;
  const days = (Date.parse(`${reference}T00:00:00Z`) - Date.parse(`${date}T00:00:00Z`)) / 86_400_000;
  if (!Number.isInteger(days) || days < 0) return null;

  const thresholds = condition.expectedValue.match(/^DATE_AGE_DAYS:(\d+)(?::(\d+))?$/i);
  if (!thresholds) return null;
  const minimum = Number(thresholds[1]);
  const maximum = thresholds[2] === undefined ? undefined : Number(thresholds[2]);
  const rangeKey: Record<string, string> = {
    DATE_AGE_DAYS_LT: 'ageLessThan',
    DATE_AGE_DAYS_LTE: 'ageAtMost',
    DATE_AGE_DAYS_GT: 'ageMoreThan',
    DATE_AGE_DAYS_GTE: 'ageAtLeast',
    DATE_AGE_DAYS_BETWEEN: 'ageBetween',
  };
  const key = rangeKey[condition.comparisonOperator.toUpperCase()];
  if (!key || (key === 'ageBetween' && maximum === undefined)) return null;
  const range = t(key, { minimum, maximum: maximum ?? minimum });
  const formattedDate = new Intl.DateTimeFormat(locale === 'hi' ? 'hi-IN' : locale === 'mr' ? 'mr-IN' : 'en-IN', {
    day: 'numeric', month: 'short', year: 'numeric', timeZone: 'UTC',
  }).format(new Date(`${date}T00:00:00Z`));
  return t('dateAgeDetail', { field: fieldName, date: formattedDate, days, range });
}

function conditionDetail(
  condition: RtsFeeMatchedCondition,
  fields: Map<number, FeeBreakdownField>,
  evaluationDate: string | undefined,
  locale: string,
  t: Translate
): string | null {
  const field = fields.get(condition.fieldDefinitionId);
  const fieldName = field?.label || t('yourDetail');
  if (condition.comparisonOperator.toUpperCase().startsWith('DATE_AGE_DAYS_')) {
    return dateAgeDetail(condition, fieldName, evaluationDate, locale, t);
  }

  let actual = displayValue(condition.actualValue, field);
  if (/^\d{4}-\d{2}-\d{2}$/.test(actual) && Number.isFinite(Date.parse(`${actual}T00:00:00Z`))) {
    actual = new Intl.DateTimeFormat(locale === 'hi' ? 'hi-IN' : locale === 'mr' ? 'mr-IN' : 'en-IN', {
      day: 'numeric', month: 'short', year: 'numeric', timeZone: 'UTC',
    }).format(new Date(`${actual}T00:00:00Z`));
  }
  if (!actual) return null;
  const op = condition.comparisonOperator.trim();
  if (op === '=' || condition.expectedValue.startsWith('DATE_PARTS:') || condition.expectedValue.startsWith('DATETIME_PARTS:')) {
    return t('appliedOn', { field: fieldName, value: actual });
  }
  if (op === '!=') return t('appliedNot', { field: fieldName, value: actual, expected: displayValue(condition.expectedValue, field) });
  if (['<', '<=', '>', '>='].includes(op)) {
    const comparison = t(({ '<': 'lessThan', '<=': 'atMost', '>': 'moreThan', '>=': 'atLeast' } as Record<string, string>)[op],
      { threshold: condition.expectedValue });
    return t('appliedThreshold', { field: fieldName, value: actual, comparison });
  }
  return t('appliedOn', { field: fieldName, value: actual });
}

function ruleLine(
  rule: RtsFeeMatchedRule,
  fields: Map<number, FeeBreakdownField>,
  evaluationDate: string | undefined,
  locale: string,
  t: Translate
): FeeBreakdownLine {
  const kind = rule.ruleActionType === 'BASE_FEE' ? t('baseFee') : t('addonFee');
  const fieldId = rule.quantityFieldDefinitionId ?? rule.matchedConditions?.[0]?.fieldDefinitionId;
  const fieldName = fieldId ? fields.get(fieldId)?.label : undefined;
  const label = fieldName ? t('chargeForField', { kind, field: fieldName }) : kind;
  const details: string[] = [];
  const rate = rule.rateAmount;
  const quantity = rule.quantityValue;
  const type = rule.calculationType?.toUpperCase();

  if ((type === 'PER_UNIT' || type === 'PER_SQUARE_METER' || type === 'PER_SQUARE_FOOT') &&
      rate != null && quantity != null) {
    const unitKey = type === 'PER_UNIT' ? 'perUnit' : type === 'PER_SQUARE_METER' ? 'perSquareMeter' : 'perSquareFoot';
    details.push(t('quantityCalculation', { quantity: number(quantity), rate: currency(rate), unit: t(unitKey) }));
  } else if (type === 'PERCENTAGE' && rate != null && rule.percentageBaseAmount != null) {
    details.push(t('percentageCalculation', { base: currency(rule.percentageBaseAmount), rate: number(rate) }));
  }

  for (const condition of rule.matchedConditions ?? []) {
    const detail = conditionDetail(condition, fields, evaluationDate, locale, t);
    if (detail && !details.includes(detail)) details.push(detail);
  }
  if (details.length === 0 && type === 'FIXED') details.push(t('fixedCharge'));
  return { label, amount: rule.amount, details };
}

export function buildFeeBreakdownLines(
  estimate: RtsFeeEvaluationResult | null,
  serviceFee: number,
  fields: Map<number, FeeBreakdownField>,
  locale: string,
  t: Translate
): FeeBreakdownLine[] {
  if ((estimate?.payableAmount ?? serviceFee) <= 0) return [];
  if (!estimate || estimate.usedServiceFeeFallback) {
    const baseAmount = estimate?.baseFee ?? serviceFee;
    const baseLine: FeeBreakdownLine = {
      label: t('serviceDefaultFee'), amount: baseAmount, details: [t('standardServiceCharge')],
    };
    const addons = (estimate?.matchedRules ?? [])
      .filter((rule) => rule.ruleActionType === 'ADDON_FEE' && rule.amount > 0)
      .map((rule) => ruleLine(rule, fields, estimate?.evaluationDate, locale, t));
    return [baseLine, ...addons];
  }

  const lines = estimate.matchedRules
    .filter((rule) => rule.ruleActionType === 'BASE_FEE' || rule.amount > 0)
    .map((rule) => ruleLine(rule, fields, estimate.evaluationDate, locale, t));
  return lines.length ? lines : [{ label: t('baseFee'), amount: estimate.baseFee, details: [] }];
}
