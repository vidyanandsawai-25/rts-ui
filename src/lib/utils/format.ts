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

  const cleanVal = String(value).trim().toLowerCase();
  if (cleanVal === 'null' || cleanVal === 'undefined' || cleanVal === '' || cleanVal.startsWith('0001-01-01')) {
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

export function formatAreaWithUnit(
  sqft: number | null | undefined,
  sqm: number | null | undefined,
  minimumFractionDigits = 2,
  maximumFractionDigits = 2
): string {
  const sqftValue = formatNumber(sqft, minimumFractionDigits, maximumFractionDigits);
  const sqmValue = formatNumber(sqm, minimumFractionDigits, maximumFractionDigits);
  return `${sqftValue} (${sqmValue} m²)`;
}

import { DateUtils } from "./date-helpers";

export function formatDateToDDMMYYYY(dateStr: string | null | undefined): string {
  return DateUtils.formatToDDMMYYYY(dateStr);
}

export function formatDDMMYYYYToISO(dateStr: string | null | undefined): string | null {
  return DateUtils.parseToISO(dateStr);
}

export function toTitleCase(str: string | null | undefined): string {
  const trimmed = (str ?? '').trim();
  if (!trimmed) return '';
  return trimmed
    .toLowerCase()
    .split(/\s+/)
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

// --- Reassessment Specific Formatting Utilities ---

export function formatReassessmentCurrency(value: number): string {
  if (value >= 10000000) {
    return `₹${(value / 10000000).toFixed(2)}Cr`;
  } else if (value >= 100000) {
    return `₹${(value / 100000).toFixed(2)}L`;
  }
  return `₹${value.toLocaleString('en-IN')}`;
}

export function sumReassessmentTaxAmounts(taxes: Record<string, number>): number {
  return Object.values(taxes).reduce(
    (sum, val) => sum + (Number.isFinite(val) ? val : 0),
    0
  );
}

/**
 * Formats tax amounts with adaptive precision so small rupee-level
 * differences remain visible even when values are in Crores/Lakhs.
 */
export function formatReassessmentTaxCurrency(value: number, compareWith?: number): string {
  if (compareWith === undefined || value === compareWith) {
    return formatReassessmentCurrency(value);
  }

  const standardFormat = formatReassessmentCurrency(value);
  if (standardFormat !== formatReassessmentCurrency(compareWith)) {
    return standardFormat;
  }

  if (value >= 10000000 && compareWith >= 10000000) {
    for (let decimals = 3; decimals <= 7; decimals++) {
      const formatted = `₹${(value / 10000000).toFixed(decimals)}Cr`;
      const formattedCompare = `₹${(compareWith / 10000000).toFixed(decimals)}Cr`;
      if (formatted !== formattedCompare) return formatted;
    }
  } else if (value >= 100000 && compareWith >= 100000) {
    for (let decimals = 3; decimals <= 5; decimals++) {
      const formatted = `₹${(value / 100000).toFixed(decimals)}L`;
      const formattedCompare = `₹${(compareWith / 100000).toFixed(decimals)}L`;
      if (formatted !== formattedCompare) return formatted;
    }
  }

  return `₹${value.toLocaleString('en-IN', { maximumFractionDigits: 2 })}`;
}

export function formatReassessmentNumber(value: number): string {
  return value.toLocaleString('en-IN');
}
