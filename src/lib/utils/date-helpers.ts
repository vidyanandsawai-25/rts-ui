import { logger } from "@/lib/utils/logger";

export interface DateValidationResult {
  valid: boolean;
  error?: "invalidFormat" | "invalidDate" | "futureDate";
  date?: Date;
}

export class DateUtils {
  private static readonly DD_MM_YYYY_REGEX =
    /^(0[1-9]|[12][0-9]|3[01])[-/](0[1-9]|1[012])[-/](19|20)\d\d$/;

  /**
   * Validates DD-MM-YYYY date format
   */
  static validate(dateStr: string): DateValidationResult {
    // Step 1: Check format
    if (!this.DD_MM_YYYY_REGEX.test(dateStr)) {
      return { valid: false, error: "invalidFormat" };
    }

    // Step 2: Parse and validate date exists
    const parts = dateStr.replace(/\//g, "-").split("-");
    const day = parseInt(parts[0], 10);
    const month = parseInt(parts[1], 10);
    const year = parseInt(parts[2], 10);

    const dateObj = new Date(year, month - 1, day);

    // Verify date components match (catches invalid dates like Feb 31st or April 31st)
    const isValidDate =
      dateObj.getFullYear() === year &&
      dateObj.getMonth() === month - 1 &&
      dateObj.getDate() === day;

    if (!isValidDate) {
      return { valid: false, error: "invalidDate" };
    }

    // Step 3: Check if date is in future
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    if (dateObj >= tomorrow) {
      return { valid: false, error: "futureDate" };
    }

    return { valid: true, date: dateObj };
  }

  /**
   * Format ISO date to DD-MM-YYYY
   */
  static formatToDDMMYYYY(isoDate: string | null | undefined): string {
    if (!isoDate || isoDate === "string") return "";

    try {
      const cleanDate = isoDate.split("T")[0];
      const parts = cleanDate.split("-");

      if (parts.length === 3) {
        const [year, month, day] = parts;
        return `${day}-${month}-${year}`;
      }

      logger.warn("Invalid date format in formatToDDMMYYYY", { isoDate });
      return "";
    } catch (error) {
      logger.error("Error formatting date to DD-MM-YYYY", {
        isoDate,
        error: error instanceof Error ? error : new Error(String(error))
      });
      return "";
    }
  }

  /**
   * Parse DD-MM-YYYY to ISO format
   */
  static parseToISO(ddmmyyyy: string | null | undefined): string | null {
    if (!ddmmyyyy) return null;

    const validation = this.validate(ddmmyyyy);
    if (!validation.valid) return null;

    const parts = ddmmyyyy.replace(/\//g, "-").split("-");
    const [day, month, year] = parts;

    return `${year.padStart(4, "0")}-${month.padStart(2, "0")}-${day.padStart(2, "0")}T00:00:00`;
  }

  /**
   * Calculates duration in years and months between two dates.
   * Inclusive of the end date (typical for rental agreement durations).
   * Supports: YYYY-MM-DD, DD-MM-YYYY, DD/MM/YYYY, or other standard ISO strings.
   */
  static calculateDurationYearsMonths(
    fromDateStr: string | null | undefined,
    toDateStr: string | null | undefined
  ): string {
    if (!fromDateStr || !toDateStr) return "N/A";

    const parseLocal = (dateStr: string): Date | null => {
      if (!dateStr) return null;
      // Match YYYY-MM-DD
      const ymdMatch = dateStr.match(/^(\d{4})-(\d{2})-(\d{2})/);
      if (ymdMatch) {
        return new Date(Number(ymdMatch[1]), Number(ymdMatch[2]) - 1, Number(ymdMatch[3]));
      }
      // Match DD-MM-YYYY or DD/MM/YYYY
      const dmyMatch = dateStr.match(/^(\d{1,2})[/-](\d{1,2})[/-](\d{4})/);
      if (dmyMatch) {
        return new Date(Number(dmyMatch[3]), Number(dmyMatch[2]) - 1, Number(dmyMatch[1]));
      }
      const d = new Date(dateStr);
      return isNaN(d.getTime()) ? null : d;
    };

    const start = parseLocal(fromDateStr);
    const end = parseLocal(toDateStr);

    if (!start || !end || end < start) return "N/A";

    // Adjust end date by adding 1 day to make the duration calculation inclusive
    const endAdjusted = new Date(end.getFullYear(), end.getMonth(), end.getDate() + 1);

    let years = endAdjusted.getFullYear() - start.getFullYear();
    let months = endAdjusted.getMonth() - start.getMonth();

    if (endAdjusted.getDate() < start.getDate()) {
      months -= 1;
    }

    if (months < 0) {
      years -= 1;
      months += 12;
    }

    return `${years}Y ${months}M`;
  }
}