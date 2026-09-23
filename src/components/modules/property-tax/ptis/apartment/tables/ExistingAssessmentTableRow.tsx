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

import { useTranslations } from 'next-intl';

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
  const t = useTranslations('ptisRedesign.subTables');
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
  const hasMappedProperties = Boolean((unit.oldPropertyId && unit.oldPropertyId > 0) || (propertyId && propertyId > 0));

  const getSignedColorClass = (val: string | number | null | undefined, defaultClass = '') => {
    if (val == null) return defaultClass;
    const s = String(val).trim();
    if (s.startsWith('-') || s.startsWith('₹-') || s.startsWith('-₹')) {
      return 'text-rose-600 font-bold';
    }
    if (s.startsWith('+') || s.startsWith('₹+') || s.startsWith('+₹')) {
      return 'text-emerald-600 font-bold';
    }
    return defaultClass;
  };

  return (
    <React.Fragment key={unit.id ? `${unit.id}-${idx}` : idx}>
      <tr
        onMouseEnter={() => onHoverUnit(unit.id)}
        onMouseLeave={() => onHoverUnit(null)}
        onClick={() => {
          if (hasMappedProperties) {
            onToggleExpandRow(unit.id);
          }
        }}
        className={cn('h-11 transition-colors cursor-pointer hover:bg-emerald-50/60', isHovered && 'bg-emerald-100/80', isExpanded && 'bg-emerald-100/90')}
      >
        <td className="w-12 px-1 py-1 text-center font-bold text-zinc-500 sticky left-0 bg-white z-10 border-r border-zinc-100 shadow-2xs h-11">
          <div className="flex items-center justify-center gap-1 text-zinc-400">
            {hasMappedProperties ? (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onToggleExpandRow(unit.id);
                }}
                className="p-0.5 rounded-sm hover:bg-zinc-200 text-zinc-600 cursor-pointer"
                title={t('expandMapped') || 'Expand mapped properties'}
              >
                {isExpanded ? <ChevronDown className="w-3.5 h-3.5 text-emerald-700" /> : <ChevronRight className="w-3.5 h-3.5" />}
              </button>
            ) : null}
            <span className="font-semibold text-zinc-600 text-xs min-w-[14px] text-center">{idx + 1}</span>
          </div>
        </td>
        <td className="px-1.5 py-1 font-bold text-zinc-900 whitespace-nowrap w-28 min-w-[100px] max-w-[125px]" title={`Property No: ${unit.propertyNo || unit.oldPropertyNo || '-'} | Partition: ${unit.partitionNo || '-'} | Flat No: ${unit.flatNo || '-'} | Owner: ${unit.owner || '-'}`}>{unit.prop}</td>
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
        <td className="px-1 py-1 text-right font-mono whitespace-nowrap">{unit.alv}</td>
        {showRv && <td className={cn("px-1 py-1 text-right font-mono font-bold whitespace-nowrap", getSignedColorClass(unit.rvDisplay, "text-emerald-700"))}>{unit.rvDisplay}</td>}
        {showCv && <td className={cn("px-1 py-1 text-right font-mono font-bold whitespace-nowrap", getSignedColorClass(unit.cvDisplay || unit.cv))}>{unit.cvDisplay || '-'}</td>}
        <td className={cn("px-1 py-1 text-right font-mono font-bold whitespace-nowrap", getSignedColorClass(unit.taxDisplay, "text-emerald-950"))}>{unit.taxDisplay}</td>
        <td className="px-1 py-1 text-center whitespace-nowrap">
          {propPhotoGuid ? (
            <div onClick={(e) => { e.stopPropagation(); onViewDocument?.(propPhotoGuid, `Unit ${unit.prop} - Property Photo`); }} className="w-7 h-7 mx-auto rounded border border-zinc-300 overflow-hidden shadow-2xs cursor-pointer hover:border-emerald-500 hover:scale-105 transition-all bg-zinc-100 flex items-center justify-center" title={t('viewPropPhoto') || 'Click to view Property Photo'}>
              <ImageWithFallback src="" documentGuid={propPhotoGuid} alt="Prop" className="w-full h-full object-cover" />
            </div>
          ) : <span className="text-zinc-300">-</span>}
        </td>
        <td className="px-1 py-1 text-center whitespace-nowrap">
          {planPhotoGuid ? (
            <div onClick={(e) => { e.stopPropagation(); onViewDocument?.(planPhotoGuid, `Unit ${unit.prop} - Floor Plan`); }} className="w-7 h-7 mx-auto rounded border border-zinc-300 overflow-hidden shadow-2xs cursor-pointer hover:border-emerald-500 hover:scale-105 transition-all bg-zinc-100 flex items-center justify-center" title={t('viewFloorPlan') || 'Click to view Floor Plan'}>
              <ImageWithFallback src="" documentGuid={planPhotoGuid} alt="Plan" className="w-full h-full object-cover" />
            </div>
          ) : <span className="text-zinc-300">-</span>}
        </td>
        <td className="px-1 py-1 text-center whitespace-nowrap">
          <div className="flex items-center justify-center">
            <button type="button" onClick={(e) => { e.stopPropagation(); onViewRules?.(unit); }} className="p-1 rounded-md text-emerald-700 hover:text-emerald-900 hover:bg-emerald-50 transition-all border border-emerald-200 cursor-pointer shadow-2xs" title={t('viewRules') || 'View Applied Rules for this Unit'}>
              <Eye className="w-3.5 h-3.5" />
            </button>
          </div>
        </td>
      </tr>

      {isExpanded && (
        <tr className="bg-emerald-50/40 border-b border-emerald-200 transition-all">
          <td colSpan={showRv && showCv ? 21 : (showRv || showCv ? 20 : 19)} className="p-1.5 text-zinc-700 font-sans align-middle">
            <MappedOldPropertiesExpandedRow
              propertyId={propertyId}
            />
          </td>
        </tr>
      )}
    </React.Fragment>
  );
};
