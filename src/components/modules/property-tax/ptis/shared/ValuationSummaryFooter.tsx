import type { TaxDetailsData } from '@/types/ptisMain-taxdetails.types';
import TaxDetails from '../TaxDetails/TaxDetails';
import { TaxBadge, type BadgeThemeColor } from './TaxBadge';

/**
 * Represents a single badge in the summary footer
 */
export interface SummaryBadge {
  /** The translated label for the badge */
  label: string;
  /** The value to display (number or string) */
  value: number | string;
  /** The theme color for the badge */
  color: BadgeThemeColor;
}

/**
 * Properties for the ValuationSummaryFooter component
 */
export interface ValuationSummaryFooterProps {
  /** The section title (e.g., "Total Valuation") */
  title: string;
  /** List of badges to display on the right side */
  badges: SummaryBadge[];

  initialTaxDetails?: TaxDetailsData;
}

/**
 * A shared footer component for valuation sections across modules (Property Tax, Water Tax, etc.)
 * Displays a title and a set of badges with values.
 */
export function ValuationSummaryFooter({ title, badges, initialTaxDetails }: ValuationSummaryFooterProps) {
  return (
    <div className="overflow-hidden rounded-lg border border-gray-200 bg-white p-1 shadow-sm">
      <div className="flex w-full items-center justify-between gap-3 border-b border-indigo-100 bg-[#FAF8FF] p-2">
        <h3 className="shrink-0 whitespace-nowrap text-xs font-semibold text-[#9C31C5]">
          {title}
        </h3>
        <div className="flex flex-wrap items-center justify-end gap-2">
          {badges.map((badge) => (
            <TaxBadge key={badge.label} label={badge.label} value={badge.value} color={badge.color} />
          ))}
        </div>
      </div>
      <TaxDetails initialTaxDetails={initialTaxDetails} />
    </div>
  );
}
