'use client';

import React from 'react';
import { UnitDifference, PtisTaxMode } from '@/types/property-tax/apartment';
import { cn } from '@/lib/utils/cn';
import { DifferenceEngineTableHeader } from './DifferenceEngineTableHeader';
import { DifferenceEngineTableRow } from './DifferenceEngineTableRow';
import { PtisTableSkeleton } from './PtisTableSkeleton';
import { PtisEmptyTableState } from './PtisEmptyTableState';

interface DifferenceEngineTableProps {
  differences: UnitDifference[];
  totalDeltas?: {
    carpetDelta?: number;
    buaDelta?: number;
    rvDelta?: number;
    taxDelta?: number;
    rtTaxDelta?: number;
  };
  hoveredUnitId: string | null;
  expandedUnitIds: string[];
  onHoverUnit: (id: string | null) => void;
  onToggleExpandRow: (id: string) => void;
  scrollRef?: React.RefObject<HTMLDivElement | null>;
  onScroll?: (e: React.UIEvent<HTMLDivElement>) => void;
  taxMode?: PtisTaxMode;
  isLoading?: boolean;
  isFullscreen?: boolean;
}

export const DifferenceEngineTable: React.FC<DifferenceEngineTableProps> = ({
  differences,
  hoveredUnitId,
  expandedUnitIds,
  onHoverUnit,
  onToggleExpandRow,
  scrollRef,
  onScroll,
  taxMode,
  isLoading = false,
  isFullscreen = false,
}) => {
  const showRv = taxMode !== 'capital';
  const showCv = taxMode !== 'rateable';
  const totalCols = showRv && showCv ? 8 : (showRv || showCv ? 7 : 6);

  return (
    <div
      ref={scrollRef}
      onScroll={onScroll}
      className={cn(
        'w-full overflow-auto text-[11px] font-sans bg-white select-none ios-scrollbar',
        isFullscreen ? 'h-full' : 'max-h-[calc(100vh-230px)]'
      )}
    >
      <table className="w-full text-left border-collapse min-w-max">
        <DifferenceEngineTableHeader taxMode={taxMode} />
        <tbody className="divide-y divide-zinc-200 text-zinc-800 font-medium">
          {isLoading && <PtisTableSkeleton columnCount={totalCols} rowCount={8} />}
          {!isLoading &&
            differences.map((diff, idx) => (
              <DifferenceEngineTableRow
                key={diff.unitId ? `${diff.unitId}-${idx}` : idx}
                diff={diff}
                idx={idx}
                isHovered={hoveredUnitId === diff.unitId}
                isExpanded={expandedUnitIds.includes(diff.unitId)}
                onHoverUnit={onHoverUnit}
                onToggleExpandRow={onToggleExpandRow}
                taxMode={taxMode}
              />
            ))}
        </tbody>
      </table>
      {!isLoading && differences.length === 0 && (
        <PtisEmptyTableState message="No differences calculated." />
      )}
    </div>
  );
};
