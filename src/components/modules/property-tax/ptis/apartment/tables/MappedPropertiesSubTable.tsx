/* eslint-disable i18next/no-literal-string */
'use client';

import React from 'react';
import { MappedNewPropertyItem } from '@/types/property-mapping';
import { ChevronDown, ChevronRight, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils/cn';
import { ImageWithFallback } from '@/components/modules/property-tax/ptis/media/ImageWithFallback';
import { SelectedPropertyTaxBreakdown, TaxAmountItem } from './SelectedPropertyTaxBreakdown';

interface MappedPropertiesSubTableProps {
  items: MappedNewPropertyItem[];
  selectedPropId: number | null;
  onSelectProperty: (id: number) => void;
  onScroll?: (e: React.UIEvent<HTMLDivElement>) => void;
  isLoadingMore?: boolean;
  variant?: 'survey' | 'existing';
  onViewDocument?: (guid: string, title?: string) => void;
  loadingTax?: boolean;
  loadingRv?: boolean;
  loadingCv?: boolean;
  rvTaxes?: TaxAmountItem[];
  rvTotal?: number | null;
  cvTaxes?: TaxAmountItem[];
  cvTotal?: number | null;
}

export const MappedPropertiesSubTable: React.FC<MappedPropertiesSubTableProps> = ({
  items,
  selectedPropId,
  onSelectProperty,
  onScroll,
  isLoadingMore = false,
  variant = 'survey',
  onViewDocument,
  loadingTax,
  loadingRv = false,
  loadingCv = false,
  rvTaxes = [],
  rvTotal = null,
  cvTaxes = [],
  cvTotal = null,
}) => {
  const isExisting = variant === 'existing';

  return (
    <div
      onScroll={onScroll}
      className={cn(
        'max-h-72 overflow-x-auto overflow-y-auto rounded-md border bg-white shadow-2xs ios-scrollbar',
        isExisting ? 'border-emerald-200' : 'border-sky-200'
      )}
    >
      <table className="w-max min-w-full text-left border-collapse text-[10.5px] leading-tight">
        <thead className={cn(
          'sticky top-0 font-bold border-b z-20 text-[10px] uppercase tracking-wider shadow-2xs',
          isExisting ? 'bg-emerald-50 text-emerald-950 border-emerald-200' : 'bg-sky-50 text-sky-950 border-sky-200'
        )}>
          <tr className="h-8">
            <th className={cn('px-2 py-1 text-center w-8 sticky left-0 z-30', isExisting ? 'bg-emerald-50' : 'bg-sky-50')}>#</th>
            <th className={cn('px-2.5 py-1 whitespace-nowrap sticky left-8 z-30 border-r', isExisting ? 'bg-emerald-50 border-emerald-200' : 'bg-sky-50 border-sky-200')}>
              Prop / Flat
            </th>
            <th className="px-2.5 py-1 whitespace-nowrap">Wing / Flr</th>
            <th className="px-2.5 py-1 whitespace-nowrap">Type</th>
            <th className="px-2.5 py-1 whitespace-nowrap">Use</th>
            <th className="px-2.5 py-1 whitespace-nowrap">Const Type</th>
            <th className="px-2.5 py-1 text-center whitespace-nowrap">Year</th>
            <th className="px-2.5 py-1 text-right whitespace-nowrap">Carpet</th>
            <th className="px-2.5 py-1 text-right whitespace-nowrap">Builtup</th>
            <th className="px-2.5 py-1 text-right whitespace-nowrap">RV (₹)</th>
            <th className="px-2.5 py-1 text-right whitespace-nowrap">CV (₹)</th>
            <th className="px-2.5 py-1 text-right whitespace-nowrap">Tax (₹)</th>
            <th className="px-2.5 py-1 whitespace-nowrap">Owner</th>
            <th className="px-1.5 py-1 text-center whitespace-nowrap">IMG</th>
            <th className="px-1.5 py-1 text-center whitespace-nowrap">PLAN</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-zinc-100 text-zinc-800 font-medium">
          {items.map((m, idx) => {
            const isSelected = selectedPropId === m.id;
            const propPhotoGuid = m.propertyPhotoDocumentGuid || (m.photos as Array<{ photoTypeCode?: string; documentGuid?: string }> | undefined)?.find((p) => p.photoTypeCode === 'PROPERTY_PHOTO')?.documentGuid || null;
            const planPhotoGuid = m.planPhotoDocumentGuid || (m.photos as Array<{ photoTypeCode?: string; documentGuid?: string }> | undefined)?.find((p) => p.photoTypeCode === 'PLAN_PHOTO')?.documentGuid || null;
            const propLabel = m.flatOrShopNo || m.propertyNo || String(m.id);

            return (
              <React.Fragment key={`${m.id}-${idx}`}>
                <tr
                  onClick={() => onSelectProperty(m.id)}
                  className={cn(
                    'cursor-pointer transition-colors h-8',
                    isExisting ? 'hover:bg-emerald-50/80' : 'hover:bg-sky-50/80',
                    isSelected && (isExisting
                      ? 'bg-emerald-100/90 font-bold text-emerald-950 border-l-4 border-l-emerald-600'
                      : 'bg-sky-100/90 font-bold text-sky-950 border-l-4 border-l-sky-600'
                    )
                  )}
                >
                  <td className={cn('px-2 py-1 text-center text-zinc-400 font-bold sticky left-0 z-10 align-middle', isSelected ? (isExisting ? 'bg-emerald-100' : 'bg-sky-100') : 'bg-white')}>
                    <div className="flex items-center justify-center gap-0.5">
                      {isSelected ? (
                        <ChevronDown className={cn('w-3 h-3', isExisting ? 'text-emerald-700' : 'text-sky-700')} />
                      ) : (
                        <ChevronRight className="w-3 h-3 text-zinc-400" />
                      )}
                      <span>{idx + 1}</span>
                    </div>
                  </td>
                  <td className={cn('px-2.5 py-1 font-bold text-zinc-900 whitespace-nowrap sticky left-8 z-10 border-r border-zinc-100 align-middle', isSelected ? (isExisting ? 'bg-emerald-100' : 'bg-sky-100') : 'bg-white')}>
                    {m.flatOrShopNo || m.propertyNo || '-'}
                  </td>
                  <td className={cn('px-2.5 py-1 font-semibold whitespace-nowrap align-middle', isExisting ? 'text-emerald-700' : 'text-blue-700')}>
                    {[m.wing, m.floor].filter(Boolean).join(' / ') || '-'}
                  </td>
                  <td className="px-2.5 py-1 whitespace-nowrap align-middle">{m.apartmentType || m.propertyTypeName || m.type || '-'}</td>
                  <td className="px-2.5 py-1 whitespace-nowrap align-middle">{m.typeOfUse || m.subTypeOfUse || '-'}</td>
                  <td className="px-2.5 py-1 whitespace-nowrap align-middle">{m.constructionType || '-'}</td>
                  <td className="px-2.5 py-1 text-center whitespace-nowrap align-middle">{m.constructionYear || m.assessmentYear || '-'}</td>
                  <td className="px-2.5 py-1 text-right font-mono whitespace-nowrap align-middle">{m.carpetASqFt ?? m.carpetASqMtr ?? '-'}</td>
                  <td className="px-2.5 py-1 text-right font-mono whitespace-nowrap align-middle">{m.builtupASqFt ?? m.builtupASqMtr ?? '-'}</td>
                  <td className="px-2.5 py-1 text-right font-mono font-bold text-emerald-700 whitespace-nowrap align-middle">{m.rateableValue != null ? `₹${Number(m.rateableValue).toLocaleString()}` : '-'}</td>
                  <td className="px-2.5 py-1 text-right font-mono font-bold whitespace-nowrap align-middle">{m.capitalValue != null ? `₹${Number(m.capitalValue).toLocaleString()}` : '-'}</td>
                  <td className={cn('px-2.5 py-1 text-right font-mono font-bold whitespace-nowrap align-middle', isExisting ? 'text-emerald-950' : 'text-sky-950')}>{m.newTaxTotal != null ? `₹${Number(m.newTaxTotal).toLocaleString()}` : '-'}</td>
                  <td className="px-2.5 py-1 truncate max-w-[120px] whitespace-nowrap align-middle" title={m.ownerName || m.ownerNameEnglish || '-'}>{m.ownerName || m.ownerNameEnglish || '-'}</td>

                  <td className="px-1.5 py-1 text-center whitespace-nowrap align-middle">
                    {propPhotoGuid ? (
                      <div
                        onClick={(e) => { e.stopPropagation(); onViewDocument?.(propPhotoGuid, `Unit ${propLabel} - Property Photo`); }}
                        className="w-5.5 h-5.5 mx-auto rounded border border-zinc-300 overflow-hidden shadow-2xs cursor-pointer hover:scale-105 transition-all bg-zinc-100 flex items-center justify-center"
                        title="View Property Photo"
                      >
                        <ImageWithFallback src="" documentGuid={propPhotoGuid} alt="Prop" className="w-full h-full object-cover" />
                      </div>
                    ) : <span className="text-zinc-300">-</span>}
                  </td>

                  <td className="px-1.5 py-1 text-center whitespace-nowrap align-middle">
                    {planPhotoGuid ? (
                      <div
                        onClick={(e) => { e.stopPropagation(); onViewDocument?.(planPhotoGuid, `Unit ${propLabel} - Floor Plan`); }}
                        className="w-5.5 h-5.5 mx-auto rounded border border-zinc-300 overflow-hidden shadow-2xs cursor-pointer hover:scale-105 transition-all bg-zinc-100 flex items-center justify-center"
                        title="View Floor Plan"
                      >
                        <ImageWithFallback src="" documentGuid={planPhotoGuid} alt="Plan" className="w-full h-full object-cover" />
                      </div>
                    ) : <span className="text-zinc-300">-</span>}
                  </td>
                </tr>

                {isSelected && (
                  <tr className={cn('border-b transition-all', isExisting ? 'bg-emerald-50/60 border-emerald-200' : 'bg-sky-50/60 border-sky-200')}>
                    <td colSpan={15} className="p-1.5 align-middle">
                      <div className="sticky left-1 max-w-[calc(100vw-120px)] w-fit">
                        <SelectedPropertyTaxBreakdown
                          selectedPropId={m.id}
                          loadingTax={loadingTax}
                          loadingRv={loadingRv}
                          loadingCv={loadingCv}
                          rvTaxes={rvTaxes}
                          rvTotal={rvTotal}
                          cvTaxes={cvTaxes}
                          cvTotal={cvTotal}
                          propertyLabel={propLabel}
                          variant={variant}
                          fallbackTax={m.newTaxTotal}
                          onClose={() => onSelectProperty(m.id)}
                        />
                      </div>
                    </td>
                  </tr>
                )}
              </React.Fragment>
            );
          })}
        </tbody>
      </table>
      {isLoadingMore && (
        <div className="py-1.5 flex items-center justify-center gap-1.5 text-[10px] text-zinc-500 bg-slate-50 border-t border-zinc-100">
          <Loader2 className={cn('w-3 h-3 animate-spin', isExisting ? 'text-emerald-600' : 'text-sky-600')} />
          <span>Loading more records...</span>
        </div>
      )}
    </div>
  );
};
