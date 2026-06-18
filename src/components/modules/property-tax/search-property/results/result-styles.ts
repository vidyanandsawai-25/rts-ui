/** Fixed column widths — long text wraps within the cell */
export const COLUMN_WIDTHS = {
  upicId: "120px",
  zoneWard: "160px",
  propertyPartition: "160px",
  category: "130px",
  societyName: "160px",
  description: "150px",
  ownerOccupier: "210px",
  mobileAlternate: "140px",
  rvCv: "110px",
  totalTax: "160px",
  address: "230px",
  scrollbarSpacer: "20px",
} as const;

export const TABLE_TOTAL_WIDTH = Object.values(COLUMN_WIDTHS).reduce(
  (sum, width) => sum + Number.parseInt(width, 10),
  0
);

export const WRAP_HEADER =
  "whitespace-normal break-words align-middle leading-tight !text-xs !font-bold !text-[#1E3A8A] tracking-wider uppercase";

export const WRAP_CELL =
  "whitespace-normal break-words align-top leading-snug text-xs overflow-hidden box-border";

export const NUMERIC_CELL =
  "align-top leading-snug text-xs overflow-visible box-border";

export function formatInr(value: number): string {
  return `₹${value.toLocaleString("en-IN", {
    maximumFractionDigits: 2,
  })}`;
}

/** Placeholder for empty table cells — apply at render time, not in domain data. */
export function formatDisplayText(value: string): string {
  const trimmed = value.trim();
  return trimmed ? trimmed : "-";
}
