/**
 * Tax Details Module Configuration
 * 
 * Centralized configuration for the TaxDetails component including:
 * - Policy codes and mappings
 * - Translation keys
 * - Styling classes and themes
 * - Row definitions
 */

// ==================== Policy Codes ====================

/**
 * Standard policy codes used across the tax system
 */
export const TAX_POLICY_CODES = {
  NETTAX: 'NETTAX',
  RETAIN: 'RETAIN',
  HEARING: 'HEARING',
  ALLTAXES: 'ALLTAXES',
} as const;

export type TaxPolicyCode = keyof typeof TAX_POLICY_CODES;

// ==================== Translation Keys ====================

/**
 * i18n translation keys for tax row labels
 */
export const TAX_ROW_LABELS = {
  NET_TAXES: 'netTaxes',
  RETAIN: 'retain',
  HEARING: 'hearing',
  ALL_TAXES: 'allTaxes',
} as const;

// ==================== Styling Classes ====================

/**
 * Base styling classes for tax labels (badges)
 */
export const TAX_LABEL_CLASSES = 'px-2 py-1 rounded-md shadow-sm border text-center text-[12px] font-black tracking-wide';

/**
 * Header text styling for table columns
 */
export const HEADER_TEXT_CLASSES = 'text-white text-[11px] font-bold uppercase tracking-tight py-2';

/**
 * Center alignment class for cells
 */
export const CELL_CENTER_CLASS = 'text-center';

/**
 * Styling for number cells (tax amount columns)
 */
export const NUMBER_CELL_CLASSES = 'border border-blue-300 rounded px-1.5 py-1 text-center bg-white text-[12px] min-w-[70px] shadow-sm font-bold text-slate-800';

/**
 * Styling for total column cells
 */
export const TOTAL_CELL_CLASSES = 'border border-indigo-400 rounded px-1.5 py-1 text-center bg-white text-[12px] min-w-[70px] font-black text-indigo-900 shadow-sm';

/**
 * Default fallback styling for unknown tax types
 */
export const DEFAULT_TAX_ROW_STYLE = 'bg-gray-50 border-gray-300 text-gray-700';

// ==================== Tax Row Style Themes ====================

/**
 * Color theme configuration for each tax row type
 */
export const TAX_ROW_STYLE_THEMES = {
  [TAX_ROW_LABELS.NET_TAXES]: 'bg-slate-100 text-slate-700 border-slate-300',
  [TAX_ROW_LABELS.RETAIN]: 'bg-blue-50 text-blue-700 border-blue-200',
  [TAX_ROW_LABELS.HEARING]: 'bg-purple-50 text-purple-700 border-purple-200',
  [TAX_ROW_LABELS.ALL_TAXES]: 'bg-rose-50 text-rose-700 border-rose-200',
} as const;

// ==================== Row Definitions ====================

/**
 * Complete row definition for tax table
 * Maps policy codes to display configuration
 */
export interface TaxRowDefinition {
  id: number;
  policyCode: string;
  labelKey: string;
  styleClass: string;
}

/**
 * Fixed row definitions for the tax details table
 * Defines the structure, order, and styling of all tax rows
 */
export const TAX_ROWS_DEFINITIONS: readonly TaxRowDefinition[] = [
  {
    id: 1,
    policyCode: TAX_POLICY_CODES.NETTAX,
    labelKey: TAX_ROW_LABELS.NET_TAXES,
    styleClass: TAX_ROW_STYLE_THEMES[TAX_ROW_LABELS.NET_TAXES],
  },
  {
    id: 2,
    policyCode: TAX_POLICY_CODES.RETAIN,
    labelKey: TAX_ROW_LABELS.RETAIN,
    styleClass: TAX_ROW_STYLE_THEMES[TAX_ROW_LABELS.RETAIN],
  },
  {
    id: 3,
    policyCode: TAX_POLICY_CODES.HEARING,
    labelKey: TAX_ROW_LABELS.HEARING,
    styleClass: TAX_ROW_STYLE_THEMES[TAX_ROW_LABELS.HEARING],
  },
  {
    id: 4,
    policyCode: TAX_POLICY_CODES.ALLTAXES,
    labelKey: TAX_ROW_LABELS.ALL_TAXES,
    styleClass: TAX_ROW_STYLE_THEMES[TAX_ROW_LABELS.ALL_TAXES],
  },
] as const;

// ==================== Helper Functions ====================

/**
 * Gets the styling class for a tax row by its label key
 * 
 * @param labelKey - The translation key for the tax row
 * @returns Styling classes for the row, or default style if not found
 */
export function getTaxRowStyleByLabel(labelKey: string): string {
  const rowDef = TAX_ROWS_DEFINITIONS.find((def) => def.labelKey === labelKey);
  return rowDef?.styleClass || DEFAULT_TAX_ROW_STYLE;
}

/**
 * Gets the policy code for a tax row by its label key
 * 
 * @param labelKey - The translation key for the tax row
 * @returns Policy code or undefined if not found
 */
export function getPolicyCodeByLabel(labelKey: string): string | undefined {
  const rowDef = TAX_ROWS_DEFINITIONS.find((def) => def.labelKey === labelKey);
  return rowDef?.policyCode;
}
