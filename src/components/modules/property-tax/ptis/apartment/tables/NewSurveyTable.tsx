'use client';

import React from 'react';
import { AssessmentUnit, PtisTaxMode } from '@/types/property-tax/apartment';
import { NewSurveyTableHeader } from './NewSurveyTableHeader';
import { NewSurveyTableRow } from './NewSurveyTableRow';
import { PtisTableSkeleton } from './PtisTableSkeleton';
import { PtisEmptyTableState } from './PtisEmptyTableState';

interface NewSurveyTableProps {
  units: AssessmentUnit[];
  hoveredUnitId: string | null;
  expandedUnitIds: string[];
  onHoverUnit: (id: string | null) => void;
  onToggleExpandRow: (id: string) => void;
  onEditUnit: (unit: AssessmentUnit) => void;
  onViewDocument?: (guid: string, title?: string) => void;
  onViewRules?: (unit: AssessmentUnit) => void;
  scrollRef?: React.RefObject<HTMLDivElement | null>;
  onScroll?: (e: React.UIEvent<HTMLDivElement>) => void;
  taxMode?: PtisTaxMode;
  isLoading?: boolean;
}

export const NewSurveyTable: React.FC<NewSurveyTableProps> = ({
  units,
  hoveredUnitId,
  expandedUnitIds,
  onHoverUnit,
  onToggleExpandRow,
  onEditUnit,
  onViewDocument,
  onViewRules,
  scrollRef,
  onScroll,
  taxMode,
  isLoading = false,
}) => {
  const showRv = taxMode !== 'capital';
  const showCv = taxMode !== 'rateable';
  const totalCols = showRv && showCv ? 26 : (showRv || showCv ? 25 : 24);

  return (
    <div
      ref={scrollRef}
      onScroll={onScroll}
      className="w-full h-full overflow-auto text-[11px] font-sans bg-white select-none ios-scrollbar [&::-webkit-scrollbar]:w-[3px] [&::-webkit-scrollbar]:h-[3px] [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-slate-400/50 hover:[&::-webkit-scrollbar-thumb]:bg-slate-500 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-button]:hidden [&::-webkit-scrollbar-button]:!w-0 [&::-webkit-scrollbar-button]:!h-0"
    >
      <table className="w-full text-left border-collapse min-w-max">
        <NewSurveyTableHeader taxMode={taxMode} />
        <tbody className="divide-y divide-zinc-200 text-zinc-800 font-medium">
          {isLoading && <PtisTableSkeleton columnCount={totalCols} rowCount={8} />}
          {!isLoading &&
            units.map((unit, idx) => (
              <NewSurveyTableRow
                key={unit.id ? `${unit.id}-${idx}` : idx}
                unit={unit}
                idx={idx}
                isHovered={hoveredUnitId === unit.id}
                isExpanded={expandedUnitIds.includes(unit.id)}
                onHoverUnit={onHoverUnit}
                onToggleExpandRow={onToggleExpandRow}
                onEditUnit={onEditUnit}
                onViewDocument={onViewDocument}
                onViewRules={onViewRules}
                taxMode={taxMode}
              />
            ))}
        </tbody>
      </table>
      {!isLoading && units.length === 0 && (
        <PtisEmptyTableState message="No survey assessment units returned from API." />
      )}
    </div>
  );
};
