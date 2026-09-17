'use client';

import React from 'react';
import { AssessmentUnit, PtisTaxMode } from '@/types/property-tax/apartment';
import { ChevronRight, ChevronDown, Eye } from 'lucide-react';
import { cn } from '@/lib/utils/cn';
import { ImageWithFallback } from '@/components/modules/property-tax/ptis/media/ImageWithFallback';
import { MappedPropertiesExpandedRow } from './MappedPropertiesExpandedRow';

interface NewSurveyTableRowProps {
  unit: AssessmentUnit;
  idx: number;
  isHovered: boolean;
  isExpanded: boolean;
  onHoverUnit: (id: string | null) => void;
  onToggleExpandRow: (id: string) => void;
  onEditUnit?: (unit: AssessmentUnit) => void;
  onViewDocument?: (guid: string, title?: string) => void;
  onViewRules?: (unit: AssessmentUnit) => void;
  taxMode?: PtisTaxMode;
}

export const NewSurveyTableRow: React.FC<NewSurveyTableRowProps> = ({
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
  const raw = unit.rawSurvey;
  const propPhotoGuid = raw?.propertyPhotoDocumentGuid || raw?.photos?.find((p) => p.photoTypeCode === 'PROPERTY_PHOTO')?.documentGuid || null;
  const planPhotoGuid = raw?.planPhotoDocumentGuid || raw?.photos?.find((p) => p.photoTypeCode === 'PLAN_PHOTO')?.documentGuid || null;
  const rawAny = raw as Record<string, unknown> | undefined;
  const taxDetailOldId = raw?.oldTaxDetails?.find((t) => t.propertyMastOldId)?.propertyMastOldId;
  const oldPropertyId =
    unit.oldPropertyId ??
    (rawAny?.propertyMastOldId ? Number(rawAny.propertyMastOldId) : null) ??
    (taxDetailOldId ? Number(taxDetailOldId) : null) ??
    (rawAny?.oldPropertyId ? Number(rawAny.oldPropertyId) : null);
  const wingDetailsId =
    (rawAny?.wingDetailsId ? Number(rawAny.wingDetailsId) : null) ??
    (rawAny?.wingDetailId ? Number(rawAny.wingDetailId) : null) ??
    (rawAny?.WingDetailsId ? Number(rawAny.WingDetailsId) : null) ??
    (rawAny?.WingDetailId ? Number(rawAny.WingDetailId) : null) ??
    null;
  const showRv = taxMode !== 'capital';
  const showCv = taxMode !== 'rateable';

  return (
    <React.Fragment key={unit.id ? `${unit.id}-${idx}` : idx}>
      <tr
        onMouseEnter={() => onHoverUnit(unit.id)}
        onMouseLeave={() => onHoverUnit(null)}
        className={cn('h-11 transition-colors cursor-pointer hover:bg-sky-50/60', isHovered && 'bg-sky-100/80', isExpanded && 'bg-sky-100/90')}
        onClick={() => onToggleExpandRow(unit.id)}
      >
        <td className="w-12 px-1 py-1 text-center font-bold text-zinc-500 sticky left-0 bg-white z-10 border-r border-zinc-100 shadow-2xs h-11">
          <div className="flex items-center justify-center gap-1 text-zinc-400">
            <button type="button" onClick={(e) => { e.stopPropagation(); onToggleExpandRow(unit.id); }} className="p-0.5 rounded-sm hover:bg-zinc-200 text-zinc-600 cursor-pointer">
              {isExpanded ? <ChevronDown className="w-3.5 h-3.5 text-sky-700" /> : <ChevronRight className="w-3.5 h-3.5" />}
            </button>
            <span className="font-semibold text-zinc-600 text-xs min-w-[14px] text-center">{idx + 1}</span>
          </div>
        </td>
        <td className="px-3 py-1.5 font-bold text-zinc-900 whitespace-nowrap" title={`Property No: ${unit.propertyNo || '-'} | Partition: ${unit.partitionNo || '-'} | Flat No: ${unit.flatNo || '-'}`}>{unit.prop}</td>
        <td className="px-3 py-1.5 text-blue-700 font-bold whitespace-nowrap" title={unit.wgFl}>{unit.wgFl}</td>
        <td className="px-3 py-1.5 whitespace-nowrap" title={unit.type}>{unit.type}</td>
        <td className="px-3 py-1.5 whitespace-nowrap" title={unit.cty}>{unit.cty}</td>
        <td className="px-3 py-1.5 text-center whitespace-nowrap">{unit.ayr}</td>
        <td className="px-3 py-1.5 text-center whitespace-nowrap">{unit.cyr}</td>
        <td className="px-3 py-1.5 whitespace-nowrap" title={unit.use}>{unit.use}</td>
        <td className="px-3 py-1.5 text-right font-bold font-mono whitespace-nowrap">{unit.cptDisplay}</td>
        <td className="px-3 py-1.5 text-right font-bold font-mono whitespace-nowrap">{unit.buaDisplay}</td>
        <td className="px-3 py-1.5 whitespace-nowrap">{unit.ocNo}</td>
        <td className="px-3 py-1.5 text-center whitespace-nowrap">{unit.occdt}</td>
        <td className="px-3 py-1.5 whitespace-nowrap" title={unit.rntr}>{unit.rntr}</td>
        <td className="px-3 py-1.5 text-right font-mono whitespace-nowrap">{unit.rentDisplay}</td>
        <td className="px-3 py-1.5 text-center whitespace-nowrap">{unit.appliedOn}</td>
        <td className="px-3 py-1.5 text-right font-mono whitespace-nowrap">{unit.rateDisplay}</td>
        <td className="px-3 py-1.5 text-right font-bold font-mono whitespace-nowrap">{unit.yrv}</td>
        <td className="px-3 py-1.5 text-right font-mono whitespace-nowrap">{unit.depr}</td>
        <td className="px-3 py-1.5 text-right font-bold font-mono whitespace-nowrap">{unit.alv}</td>
        <td className="px-3 py-1.5 text-right font-mono whitespace-nowrap">{unit.mr}</td>
        {showRv && (
          <td className="px-3 py-1.5 text-right font-bold font-mono whitespace-nowrap">{unit.rvDisplay || '-'}</td>
        )}
        {showCv && (
          <td className="px-3 py-1.5 text-right font-bold font-mono whitespace-nowrap" title={`Capital Value: ${unit.cvDisplay || unit.cv || '-'}`}>
            {unit.cvDisplay || (unit.cv ? `₹${unit.cv.toLocaleString()}` : '-')}
          </td>
        )}
        <td className="px-3 py-1.5 text-right font-bold font-mono text-blue-900 whitespace-nowrap">{unit.taxDisplay || '-'}</td>

        <td className="px-1 py-1 text-center whitespace-nowrap">
          {propPhotoGuid ? (
            <div onClick={(e) => { e.stopPropagation(); onViewDocument?.(propPhotoGuid, `Unit ${unit.prop} - Property Photo`); }} className="w-7 h-7 mx-auto rounded border border-zinc-300 overflow-hidden shadow-2xs cursor-pointer hover:border-sky-500 hover:scale-105 transition-all bg-zinc-100 flex items-center justify-center" title="Click to view Property Photo">
              <ImageWithFallback src="" documentGuid={propPhotoGuid} alt="Property" className="w-full h-full object-cover" />
            </div>
          ) : <span className="text-zinc-300">-</span>}
        </td>
        <td className="px-1 py-1 text-center whitespace-nowrap">
          {planPhotoGuid ? (
            <div onClick={(e) => { e.stopPropagation(); onViewDocument?.(planPhotoGuid, `Unit ${unit.prop} - Floor Plan`); }} className="w-7 h-7 mx-auto rounded border border-zinc-300 overflow-hidden shadow-2xs cursor-pointer hover:border-sky-500 hover:scale-105 transition-all bg-zinc-100 flex items-center justify-center" title="Click to view Floor Plan">
              <ImageWithFallback src="" documentGuid={planPhotoGuid} alt="Plan" className="w-full h-full object-cover" />
            </div>
          ) : <span className="text-zinc-300">-</span>}
        </td>
        <td className="px-1 py-1 text-center whitespace-nowrap">
          <div className="flex items-center justify-center">
            <button type="button" onClick={(e) => { e.stopPropagation(); onViewRules?.(unit); }} className="p-1 rounded-md text-blue-600 hover:text-blue-800 hover:bg-blue-50 transition-all border border-blue-200 cursor-pointer shadow-2xs" title="View Applied Rules for this Unit">
              <Eye className="w-3.5 h-3.5" />
            </button>
          </div>
        </td>
      </tr>

      {isExpanded && (
        <tr className="bg-sky-50/40 border-b border-sky-200 transition-all">
          <td colSpan={showRv && showCv ? 26 : (showRv || showCv ? 25 : 24)} className="p-1.5 text-zinc-700 font-sans align-middle">
            <MappedPropertiesExpandedRow
              oldPropertyId={oldPropertyId}
              propertyId={unit.propertyId ?? (raw?.id ? Number(raw.id) : null)}
              wingDetailsId={wingDetailsId}
              societyDetailId={
                (rawAny?.societyDetailId ? Number(rawAny.societyDetailId) : null) ??
                (rawAny?.societydetailid ? Number(rawAny.societydetailid) : null) ??
                (rawAny?.societyId ? Number(rawAny.societyId) : null)
              }
              variant="survey"
              onViewDocument={onViewDocument}
            />
          </td>
        </tr>
      )}
    </React.Fragment>
  );
};
