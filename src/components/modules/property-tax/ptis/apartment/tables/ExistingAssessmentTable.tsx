'use client';

import React from 'react';
import { AssessmentUnit, PtisTaxMode } from '@/types/property-tax/apartment';
import { cn } from '@/lib/utils/cn';
import { ExistingAssessmentTableHeader } from './ExistingAssessmentTableHeader';
import { ExistingAssessmentTableRow } from './ExistingAssessmentTableRow';
import { PtisTableSkeleton } from './PtisTableSkeleton';
import { PtisEmptyTableState } from './PtisEmptyTableState';

interface ExistingAssessmentTableProps {
  units: AssessmentUnit[];
  hoveredUnitId: string | null;
  expandedUnitIds: string[];
  onHoverUnit: (id: string | null) => void;
  onToggleExpandRow: (id: string) => void;
  onViewDocument?: (guid: string, title?: string) => void;
  onViewRules?: (unit: AssessmentUnit) => void;
  scrollRef?: React.RefObject<HTMLDivElement | null>;
  onScroll?: (e: React.UIEvent<HTMLDivElement>) => void;
  taxMode?: PtisTaxMode;
  isLoading?: boolean;
  isFullscreen?: boolean;
}

export const ExistingAssessmentTable: React.FC<ExistingAssessmentTableProps> = ({
  units,
  hoveredUnitId,
  expandedUnitIds,
  onHoverUnit,
  onToggleExpandRow,
  onViewDocument,
  onViewRules,
  scrollRef,
  onScroll,
  taxMode,
  isLoading = false,
  isFullscreen = false,
}) => {
  const showRv = taxMode !== 'capital';
  const showCv = taxMode !== 'rateable';
  const totalCols = showRv && showCv ? 21 : (showRv || showCv ? 20 : 19);

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
        <ExistingAssessmentTableHeader taxMode={taxMode} />
        <tbody className="divide-y divide-zinc-200 text-zinc-800 font-medium">
          {isLoading && <PtisTableSkeleton columnCount={totalCols} rowCount={8} />}
          {!isLoading &&
            units.map((unit, idx) => (
              <ExistingAssessmentTableRow
                key={unit.id ? `${unit.id}-${idx}` : idx}
                unit={unit}
                idx={idx}
                isHovered={hoveredUnitId === unit.id}
                isExpanded={expandedUnitIds.includes(unit.id)}
                onHoverUnit={onHoverUnit}
                onToggleExpandRow={onToggleExpandRow}
                onViewDocument={onViewDocument}
                onViewRules={onViewRules}
                taxMode={taxMode}
              />
            ))}
        </tbody>
      </table>
      {!isLoading && units.length === 0 && (
        <PtisEmptyTableState message="No existing assessment units returned from API." />
      )}
    </div>
  );
};
