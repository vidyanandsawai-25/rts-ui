import { formatIndianNumber } from '@/lib/utils/format';

/**
 * Formats monetary currency values to standard Indian representation.
 */
export function formatCurrencyValue(val: number): string {
  const decimals = Number.isInteger(val) ? 0 : 2;
  return '₹' + formatIndianNumber(val, decimals, decimals);
}

/**
 * Formats currency values compactly using Indian numbering (L for Lakh, Cr for Crore).
 * Returns both compact text and full formatted text for hover tooltips.
 * e.g.,
 * 4,52,737 -> compact: "₹4.53 L", full: "₹4,52,737"
 * 1,25,89,000 -> compact: "₹1.26 Cr", full: "₹1,25,89,000"
 * 34,185 -> compact: "₹34,185", full: "₹34,185"
 */
export function formatCompactCurrency(val: number): { compact: string; full: string } {
  const absVal = Math.abs(val);
  const full = formatCurrencyValue(val);

  if (absVal >= 10000000) {
    const crVal = (val / 10000000).toFixed(2).replace(/\.00$/, '');
    return { compact: `₹${crVal} Cr`, full };
  }
  if (absVal >= 100000) {
    const lakhVal = (val / 100000).toFixed(2).replace(/\.00$/, '');
    return { compact: `₹${lakhVal} L`, full };
  }

  return { compact: full, full };
}

/**
 * Formats numeric values (e.g., Area) compactly.
 */
export function formatCompactNumber(val: number, unit?: string): { compact: string; full: string } {
  const absVal = Math.abs(val);
  const formattedUnit = formatAreaUnit(unit);
  const unitSuffix = formattedUnit ? ` ${formattedUnit}` : '';
  const full = `${val.toLocaleString('en-IN')}${unitSuffix}`;

  if (absVal >= 10000000) {
    const crVal = (val / 10000000).toFixed(2).replace(/\.00$/, '');
    return { compact: `${crVal} Cr${unitSuffix}`, full };
  }
  if (absVal >= 100000) {
    const lakhVal = (val / 100000).toFixed(2).replace(/\.00$/, '');
    return { compact: `${lakhVal} L${unitSuffix}`, full };
  }

  return { compact: full, full };
}

/**
 * Determines text color based on numerical change.
 */
export function getDiffColorClass(diff: number): string {
  if (diff > 0) return 'text-emerald-600';
  if (diff < 0) return 'text-rose-600';
  return 'text-gray-500';
}

/**
 * Returns arrow indicator depending on numerical change.
 */
export function getDiffArrowSymbol(diff: number): string {
  if (diff > 0) return '↑ ';
  if (diff < 0) return '↓ ';
  return '';
}

/**
 * Maps raw backend unit string (e.g., 'SqMeter') to UI representation (e.g., 'm²').
 */
export function formatAreaUnit(rawUnit?: string): string {
  if (!rawUnit) return 'm²';
  const unitLower = rawUnit.toLowerCase();
  if (unitLower.includes('sqmeter') || unitLower.includes('sqm') || unitLower === 'm2') {
    return 'm²';
  }
  if (unitLower.includes('sqft') || unitLower.includes('sqfeet')) {
    return 'sq.ft';
  }
  return rawUnit;
}
