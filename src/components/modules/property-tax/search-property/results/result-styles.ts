/** Fixed column widths — long text wraps within the cell */
export const COLUMN_WIDTHS = {
  upicId: "120px",
  zone: "72px",
  ward: "64px",
  propertyNo: "115px",
  partitionNo: "130px",
  oldPropertyNo: "145px",
  citySurveyNo: "135px",
  plotNo: "80px",
  wingFlatNo: "110px",
  category: "148px",
  description: "185px",
  mobile: "96px",
  holderName: "185px",
  occupierName: "140px",
  shopBuildingName: "170px",
  societyName: "130px",
  address: "180px",
  rvCv: "180px",
  totalTax: "130px",
  scrollbarSpacer: "40px",
} as const;

export const TABLE_TOTAL_WIDTH = Object.values(COLUMN_WIDTHS).reduce(
  (sum, width) => sum + Number.parseInt(width, 10),
  0
);

export const WRAP_HEADER =
  "whitespace-nowrap align-middle leading-none !text-xs !font-bold !text-[#1E3A8A] tracking-wider uppercase";

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
