/**
 * Constants for the TaxDetails module.
 */

export const TAX_POLICY_CODES = {
  NETTAX: 'NETTAX',
  RETAIN: 'RETAIN',
  HEARING: 'HEARING',
  ALLTAXES: 'ALLTAXES',
} as const;

export type TaxPolicyCode = keyof typeof TAX_POLICY_CODES;

export const TAX_LABEL_CLASSES = 'px-1.5 py-0.5 rounded-md shadow-sm border text-center text-[9px] font-bold';

export const TAX_ROW_LABELS = {
  NET_TAXES: 'netTaxes',
  RETAIN: 'retain',
  HEARING: 'hearing',
  ALL_TAXES: 'allTaxes',
} as const;
