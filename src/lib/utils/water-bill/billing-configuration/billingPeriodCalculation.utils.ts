import type {
  BillingPeriodMaster,
  DropdownOption,
} from "@/types/water-bill/billing-configuration/billingPeriodMaster.types";

export const MAX_GRACE_DAYS = 31;

/**
 * Robust date parser supporting YYYY-MM-DD, MM/DD/YYYY, and ISO date strings
 */
export const parseDateComponents = (
  dateStr?: string | null
): { y: number; m: number; d: number } | null => {
  if (!dateStr || typeof dateStr !== "string") return null;
  const clean = dateStr.trim().split("T")[0];

  // Format: YYYY-MM-DD or YYYY/MM/DD
  const ymdMatch = clean.match(/^(\d{4})[-/](\d{1,2})[-/](\d{1,2})$/);
  if (ymdMatch) {
    return {
      y: parseInt(ymdMatch[1], 10),
      m: parseInt(ymdMatch[2], 10),
      d: parseInt(ymdMatch[3], 10),
    };
  }

  // Format: MM/DD/YYYY or DD/MM/YYYY
  const slashMatch = clean.match(/^(\d{1,2})[-/](\d{1,2})[-/](\d{4})$/);
  if (slashMatch) {
    const part1 = parseInt(slashMatch[1], 10);
    const part2 = parseInt(slashMatch[2], 10);
    const year = parseInt(slashMatch[3], 10);
    if (part1 > 12) {
      return { y: year, m: part2, d: part1 };
    }
    return { y: year, m: part1, d: part2 };
  }

  const parsed = new Date(dateStr);
  if (!isNaN(parsed.getTime())) {
    return {
      y: parsed.getUTCFullYear(),
      m: parsed.getUTCMonth() + 1,
      d: parsed.getUTCDate(),
    };
  }

  return null;
};

/**
 * Add N calendar days to a date string, returns YYYY-MM-DD
 */
export const addDays = (dateStr: string, days: number): string => {
  if (!dateStr) return "";
  const comp = parseDateComponents(dateStr);
  if (!comp) return "";
  const d = new Date(Date.UTC(comp.y, comp.m - 1, comp.d + days));
  if (isNaN(d.getTime())) return "";
  return d.toISOString().split("T")[0];
};

/**
 * Count calendar days between two date strings (start to end)
 */
export const diffDays = (startStr: string, endStr: string): number => {
  if (!startStr || !endStr) return 0;
  const start = parseDateComponents(startStr);
  const end = parseDateComponents(endStr);
  if (!start || !end) return 0;
  const startUtc = Date.UTC(start.y, start.m - 1, start.d);
  const endUtc = Date.UTC(end.y, end.m - 1, end.d);
  return Math.max(0, Math.round((endUtc - startUtc) / (1000 * 60 * 60 * 24)));
};

/**
 * Get periods per year directly from Billing Frequency API data
 */
export const getFrequencyPeriodsPerYear = (option?: DropdownOption): number => {
  if (!option?.data) return 0;
  const count = Number(option.data.periodsPerYear);
  return !isNaN(count) && count > 0 ? count : 0;
};

/**
 * Calculate Period To Date based on Period From Date and Billing Frequency PeriodsPerYear
 */
export const calculatePeriodToDate = (
  periodFromStr: string,
  periodsPerYear: number
): string => {
  if (!periodFromStr || !periodsPerYear || periodsPerYear <= 0) return "";
  const comp = parseDateComponents(periodFromStr);
  if (!comp) return "";
  const { y, m, d } = comp;

  const months = Math.max(1, Math.round(12 / periodsPerYear));

  if (d === 1) {
    const targetDate = new Date(Date.UTC(y, m - 1 + months, 0));
    return targetDate.toISOString().split("T")[0];
  }

  const nextTarget = new Date(Date.UTC(y, m - 1 + months, d));
  nextTarget.setUTCDate(nextTarget.getUTCDate() - 1);
  return nextTarget.toISOString().split("T")[0];
};

/**
 * Calculate Next Period From Date from Year Start Date or Previous Existing Period To Date
 */
export const calculateNextPeriodFromDate = (
  yearStartDate: string,
  existingPeriods: BillingPeriodMaster[],
  financialYearId?: number | string,
  billingFrequencyId?: number | string
): string => {
  if (!financialYearId || !billingFrequencyId) return yearStartDate || "";

  const matching = existingPeriods.filter(
    (p) =>
      String(p.financialYearId) === String(financialYearId) &&
      String(p.billingFrequencyId) === String(billingFrequencyId) &&
      p.periodToDate
  );

  if (matching.length === 0) {
    return yearStartDate || "";
  }

  const sorted = [...matching].sort(
    (a, b) => new Date(b.periodToDate).getTime() - new Date(a.periodToDate).getTime()
  );

  const latestTo = sorted[0].periodToDate.split("T")[0];
  return addDays(latestTo, 1);
};

/**
 * Calculate Billing Period Sequence Number (always between 1 and periodsPerYear)
 */
export const calculateBillingPeriodSequenceNo = (
  periodFromDate?: string | null,
  periodsPerYear: number = 1,
  yearStartDate?: string | null,
  existingSequenceNo?: number | string | null
): number => {
  const total = Number(periodsPerYear) || 1;
  if (total <= 1) return 1;

  // If a valid existing sequence number is passed and falls within [1, total], preserve it
  if (existingSequenceNo !== undefined && existingSequenceNo !== null && existingSequenceNo !== "") {
    const num = Number(existingSequenceNo);
    if (!isNaN(num) && num >= 1 && num <= total) {
      return num;
    }
  }

  const monthsPerPeriod = Math.max(1, Math.round(12 / total));

  if (periodFromDate) {
    if (yearStartDate) {
      const fromComp = parseDateComponents(periodFromDate);
      const startComp = parseDateComponents(yearStartDate);
      if (fromComp && startComp) {
        const monthDiff = (fromComp.y - startComp.y) * 12 + (fromComp.m - startComp.m);
        if (monthDiff >= 0) {
          const seq = Math.floor(monthDiff / monthsPerPeriod) + 1;
          return Math.max(1, Math.min(total, seq));
        }
      }
    }

    const fromComp = parseDateComponents(periodFromDate);
    if (fromComp) {
      const fyMonthIdx = ((fromComp.m - 4 + 12) % 12) + 1;
      const seq = Math.floor((fyMonthIdx - 1) / monthsPerPeriod) + 1;
      return Math.max(1, Math.min(total, seq));
    }
  }

  return 1;
};
