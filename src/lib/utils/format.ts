/**
 * Utility functions for formatting data
 */

export const formatDate = (date: string | Date, locale = 'en-US'): string => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return new Intl.DateTimeFormat(locale, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(dateObj);
};

export const formatDateTime = (date: string | Date, locale = 'en-US'): string => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return new Intl.DateTimeFormat(locale, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(dateObj);
};

export const formatCurrency = (amount: number, currency = 'USD', locale = 'en-US'): string => {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
  }).format(amount);
};

export const truncateText = (text: string, maxLength: number): string => {
  if (text.length <= maxLength) return text;
  return `${text.slice(0, maxLength)}...`;
};

export const toSafeString = (value: unknown): string =>
  typeof value === 'string' ? value.trim() : '';

export const toPositiveInt = (value: unknown): number | undefined => {
  if (typeof value !== 'string') return undefined;

  const trimmed = value.trim();
  if (!trimmed) return undefined;

  const num = Number(trimmed);
  return Number.isInteger(num) && num > 0 ? num : undefined;
};

export const normalizePartition = (val: string | null | undefined): string => {
  const trimmed = (val ?? '').trim();
  return trimmed === '0' ? '' : trimmed;
};
// --- PTIS Specific Formatting Utilities ---

function formatNumber(
  value: number | null | undefined,
  minimumFractionDigits: number,
  maximumFractionDigits: number
) {
  return new Intl.NumberFormat('en-IN', {
    minimumFractionDigits,
    maximumFractionDigits,
  }).format(Number(value ?? 0));
}

export function formatIndianNumber(
  value: number | null | undefined,
  minimumFractionDigits = 0,
  maximumFractionDigits = 0
): string {
  return formatNumber(value, minimumFractionDigits, maximumFractionDigits);
}

export function formatNumberPair(
  first: number | null | undefined,
  second: number | null | undefined,
  minimumFractionDigits = 2,
  maximumFractionDigits = 2
): string {
  return `${formatNumber(first, minimumFractionDigits, maximumFractionDigits)} / ${formatNumber(second, minimumFractionDigits, maximumFractionDigits)}`;
}

export function formatNumericDate(value: string | null | undefined): string {
  if (!value) {
    return '-';
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(date);
}
