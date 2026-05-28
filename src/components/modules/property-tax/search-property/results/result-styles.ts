/** Fixed column widths — long text wraps within the cell */
export const COLUMN_WIDTHS = {
  upicId: "120px",
  zone: "72px",
  ward: "64px",
  propertyNo: "96px",
  partitionNo: "96px",
  oldPropertyNo: "108px",
  citySurveyNo: "100px",
  plotNo: "80px",
  wingFlatNo: "88px",
  propertyCount: "118px",
  category: "148px",
  description: "120px",
  mobile: "96px",
  holderName: "140px",
  occupierName: "140px",
  shopBuildingName: "130px",
  societyName: "130px",
  address: "180px",
  rvCv: "180px",
  totalTax: "96px",
} as const;

export const TABLE_TOTAL_WIDTH = Object.values(COLUMN_WIDTHS).reduce(
  (sum, width) => sum + Number.parseInt(width, 10),
  0
);

export const WRAP_HEADER =
  "whitespace-normal break-words align-top leading-tight";

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
