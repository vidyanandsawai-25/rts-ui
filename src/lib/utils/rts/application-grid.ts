import type { RtsApplicationApiApplicantDetail } from "@/types/rts/rts-application.types";

const MS_PER_DAY = 86_400_000;

export function computeElapsedDays(submittedDate: string): number {
  return Math.max(0, Math.floor((Date.now() - new Date(submittedDate).getTime()) / MS_PER_DAY));
}

export function computeRemainingDays(submittedDate: string, expectedSlaDays: number): number {
  return Math.max(0, expectedSlaDays - computeElapsedDays(submittedDate));
}

export function computeOverdueDays(submittedDate: string, expectedSlaDays: number): number {
  return Math.max(0, computeElapsedDays(submittedDate) - expectedSlaDays);
}

export function isSameCalendarDay(isoDate: string, reference: Date): boolean {
  return new Date(isoDate).toDateString() === reference.toDateString();
}

/**
 * Derives applicant name from real RTS API `applicantDetails` shape or `citizenName`.
 */
export function deriveApplicantName(
  applicantDetails?: RtsApplicationApiApplicantDetail[] | null,
  citizenName?: string | null,
  applicationNo?: string
): string {
  if (citizenName?.trim()) {
    return citizenName.trim();
  }

  if (applicantDetails && Array.isArray(applicantDetails)) {
    const map = new Map<string, string>();
    for (const item of applicantDetails) {
      if (item?.fieldLabel && item?.fieldValue?.trim()) {
        map.set(item.fieldLabel.trim().toLowerCase(), item.fieldValue.trim());
      }
    }

    // 1. Direct full name labels
    const fullNameKeys = [
      "full name",
      "applicant name",
      "name",
      "applicantfullname",
      "director name",
      "directorname",
    ];
    for (const key of fullNameKeys) {
      const val = map.get(key);
      if (val) return val;
    }

    // 2. First + Middle + Last name
    const first = map.get("first name") || map.get("applicant first name");
    const middle = map.get("middle name");
    const last = map.get("last name") || map.get("applicant last name");
    if (first || last) {
      const parts = [first, middle, last].filter(Boolean);
      if (parts.length > 0) return parts.join(" ");
    }

    // 3. Child First + Middle + Last name
    const childFirst = map.get("child first name");
    const childMiddle = map.get("child middle name");
    const childLast = map.get("child last name");
    if (childFirst || childLast) {
      const parts = [childFirst, childMiddle, childLast].filter(Boolean);
      if (parts.length > 0) return parts.join(" ");
    }

    // 4. Parent/Guardian Full Name
    const parentName = map.get("parent/guardian full name") || map.get("guardian name");
    if (parentName) return parentName;

    // 5. First text-like non-numeric fieldValue from applicantDetails
    for (const item of applicantDetails) {
      if (item?.fieldValue?.trim()) {
        const val = item.fieldValue.trim();
        if (Number.isNaN(Number(val)) && val.length > 1) {
          return val;
        }
      }
    }
  }

  const suffix = applicationNo ? applicationNo.slice(-4) : "—";
  return `Citizen ${suffix}`;
}
