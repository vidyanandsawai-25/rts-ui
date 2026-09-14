'use client';

import React from 'react';
import { AssessmentUnit, PtisTaxMode } from '@/types/property-tax/apartment';
import { ChevronRight, ChevronDown, Eye } from 'lucide-react';
import { cn } from '@/lib/utils/cn';
import { ImageWithFallback } from '@/components/modules/property-tax/ptis/media/ImageWithFallback';
import { MappedOldPropertiesExpandedRow } from './MappedOldPropertiesExpandedRow';

interface ExistingAssessmentTableRowProps {
  unit: AssessmentUnit;
  idx: number;
  isHovered: boolean;
  isExpanded: boolean;
  onHoverUnit: (id: string | null) => void;
  onToggleExpandRow: (id: string) => void;
  onViewDocument?: (guid: string, title?: string) => void;
  onViewRules?: (unit: AssessmentUnit) => void;
  taxMode?: PtisTaxMode;
}

export const ExistingAssessmentTableRow: React.FC<ExistingAssessmentTableRowProps> = ({
  unit,
  idx,
  isHovered,
  isExpanded,
  onHoverUnit,
  onToggleExpandRow,
  onViewDocument,
  onViewRules,
  taxMode,
}) => {
  const showRv = taxMode !== 'capital';
  const showCv = taxMode !== 'rateable';
  const raw = unit.rawSurvey;
  const propPhotoGuid = raw?.propertyPhotoDocumentGuid || raw?.photos?.find((p) => p.photoTypeCode === 'PROPERTY_PHOTO')?.documentGuid || null;
  const planPhotoGuid = raw?.planPhotoDocumentGuid || raw?.photos?.find((p) => p.photoTypeCode === 'PLAN_PHOTO')?.documentGuid || null;
  const rawAny = raw as Record<string, unknown> | undefined;

  // propertyId = the old property record's own ID (from the old survey DTO).
  // unit.propertyId is set by the mapper to oldSurvey.id (via resolvedPropertyId = pdnId ?? id).
  // rawAny?.propertyId and raw?.id are fallbacks for the same value.
  const propertyId =
    unit.propertyId ??
    (rawAny?.propertyId ? Number(rawAny.propertyId) : null) ??
    (raw?.id ? Number(raw.id) : null);

  return (
    <React.Fragment key={unit.id ? `${unit.id}-${idx}` : idx}>
      <tr
        onMouseEnter={() => onHoverUnit(unit.id)}
        onMouseLeave={() => onHoverUnit(null)}
        onClick={() => onToggleExpandRow(unit.id)}
        className={cn('h-11 transition-colors cursor-pointer hover:bg-emerald-50/60', isHovered && 'bg-emerald-100/80', isExpanded && 'bg-emerald-100/90')}
      >
        <td className="w-10 px-1 py-1 text-center whitespace-nowrap">
          <div className="flex items-center justify-center gap-1 text-zinc-400">
            <button type="button" onClick={(e) => { e.stopPropagation(); onToggleExpandRow(unit.id); }} className="p-0.5 hover:text-zinc-700">
              {isExpanded ? <ChevronDown className="w-3.5 h-3.5 text-emerald-700" /> : <ChevronRight className="w-3.5 h-3.5" />}
            </button>
            <span className="font-semibold text-zinc-600">{idx + 1}</span>
          </div>
        </td>
        <td className="px-1.5 py-1 font-bold text-zinc-900 whitespace-nowrap">{unit.prop}</td>
        <td className="px-1 py-1 text-emerald-700 font-semibold whitespace-nowrap">{unit.wgFl}</td>
        <td className="px-1 py-1 whitespace-nowrap">{unit.type}</td>
        <td className="px-1 py-1 whitespace-nowrap">{unit.cty}</td>
        <td className="px-1 py-1 whitespace-nowrap">{unit.ayr}</td>
        <td className="px-1 py-1 whitespace-nowrap">{unit.cyr}</td>
        <td className="px-1 py-1 whitespace-nowrap">{unit.use}</td>
        <td className="px-1 py-1 text-right font-mono whitespace-nowrap">{unit.cptDisplay}</td>
        <td className="px-1 py-1 text-right font-mono whitespace-nowrap">{unit.buaDisplay}</td>
        <td className="px-1 py-1 whitespace-nowrap">{unit.ocNo}</td>
        <td className="px-1 py-1 whitespace-nowrap">{unit.occdt}</td>
        <td className="px-1 py-1 whitespace-nowrap">{unit.rntr}</td>
        <td className="px-1 py-1 text-right font-mono whitespace-nowrap">{unit.rentDisplay}</td>
        <td className="px-1 py-1 whitespace-nowrap">{unit.appliedOn}</td>
        <td className="px-1 py-1 text-right font-mono whitespace-nowrap">{unit.rateDisplay}</td>
        <td className="px-1 py-1 text-right font-mono whitespace-nowrap">{unit.yrv}</td>
        <td className="px-1 py-1 text-right font-mono whitespace-nowrap">{unit.depr}</td>
        <td className="px-1 py-1 text-right font-mono whitespace-nowrap">{unit.alv}</td>
        <td className="px-1 py-1 text-right font-mono whitespace-nowrap">{unit.mr}</td>
        {showRv && <td className="px-1 py-1 text-right font-mono font-bold text-emerald-700 whitespace-nowrap">{unit.rvDisplay}</td>}
        {showCv && <td className="px-1 py-1 text-right font-mono font-bold whitespace-nowrap">{unit.cvDisplay || '-'}</td>}
        <td className="px-1 py-1 text-right font-mono font-bold text-emerald-950 whitespace-nowrap">{unit.taxDisplay}</td>
        <td className="px-1 py-1 text-right font-mono whitespace-nowrap">{unit.pen ? `₹${unit.pen.toLocaleString()}` : '-'}</td>
        <td className="px-1 py-1 truncate max-w-[120px] whitespace-nowrap" title={unit.owner || '-'}>{unit.owner || '-'}</td>
        <td className="px-1 py-1 truncate max-w-[120px] whitespace-nowrap" title={unit.ocpr || '-'}>{unit.ocpr || '-'}</td>
        <td className="px-1 py-1 text-center whitespace-nowrap">
          {propPhotoGuid ? (
            <div onClick={(e) => { e.stopPropagation(); onViewDocument?.(propPhotoGuid, `Unit ${unit.prop} - Property Photo`); }} className="w-7 h-7 mx-auto rounded border border-zinc-300 overflow-hidden shadow-2xs cursor-pointer hover:border-emerald-500 hover:scale-105 transition-all bg-zinc-100 flex items-center justify-center" title="Click to view Property Photo">
              <ImageWithFallback src="" documentGuid={propPhotoGuid} alt="Prop" className="w-full h-full object-cover" />
            </div>
          ) : <span className="text-zinc-300">-</span>}
        </td>
        <td className="px-1 py-1 text-center whitespace-nowrap">
          {planPhotoGuid ? (
            <div onClick={(e) => { e.stopPropagation(); onViewDocument?.(planPhotoGuid, `Unit ${unit.prop} - Floor Plan`); }} className="w-7 h-7 mx-auto rounded border border-zinc-300 overflow-hidden shadow-2xs cursor-pointer hover:border-emerald-500 hover:scale-105 transition-all bg-zinc-100 flex items-center justify-center" title="Click to view Floor Plan">
              <ImageWithFallback src="" documentGuid={planPhotoGuid} alt="Plan" className="w-full h-full object-cover" />
            </div>
          ) : <span className="text-zinc-300">-</span>}
        </td>
        <td className="px-1 py-1 text-center whitespace-nowrap">
          <div className="flex items-center justify-center">
            <button type="button" onClick={(e) => { e.stopPropagation(); onViewRules?.(unit); }} className="p-1 rounded-md text-emerald-700 hover:text-emerald-900 hover:bg-emerald-50 transition-all border border-emerald-200 cursor-pointer shadow-2xs" title="View Applied Rules for this Unit">
              <Eye className="w-3.5 h-3.5" />
            </button>
          </div>
        </td>
      </tr>

      {isExpanded && (
        <tr className="bg-emerald-50/40 border-b border-emerald-200 transition-all">
          <td colSpan={30} className="p-1.5 text-zinc-700 font-sans align-middle">
            <MappedOldPropertiesExpandedRow
              propertyId={propertyId}
            />
          </td>
        </tr>
      )}
    </React.Fragment>
  );
};
