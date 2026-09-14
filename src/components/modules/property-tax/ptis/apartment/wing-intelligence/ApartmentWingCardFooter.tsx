'use client';
import React, { useState } from "react";
import { ArrowUpRight, X } from "lucide-react";
import { useTranslations } from "next-intl";
import { Tooltip } from "@/components/common";
import { formatCompactCurrency, formatFullCurrency } from "@/lib/utils/format";
import { ExemptionSummaryProps, OverallTaxSummaryProps, RevenueImpactSummaryProps, WingCardFooterProps } from "@/types/property-tax/apartment";

const Popover: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}> = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;

  return (
    <>
      <div 
        className="fixed inset-0 z-40" 
        onClick={(e) => { e.stopPropagation(); onClose(); }} 
      />
      <div
        className="absolute z-50 bottom-[calc(100%+10px)] left-1/2 -translate-x-1/2 bg-white rounded-lg shadow-2xl border border-slate-200 p-4 w-[280px] cursor-default pointer-events-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center border-b border-slate-200 pb-2 mb-3">
          <h3 className="text-xs font-black text-blue-800 uppercase tracking-wider">{title}</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors relative z-50">
            <X size={14} strokeWidth={3} />
          </button>
        </div>
        <div className="flex flex-col gap-2.5 relative z-50">
          {children}
        </div>
      </div>
    </>
  );
};

const RowItem = ({ label, value, valueClass = "text-slate-700", isLast = false }: { label: string; value: React.ReactNode; valueClass?: string; isLast?: boolean }) => (
  <div className={`flex justify-between items-center ${isLast ? '' : 'border-b border-slate-100 pb-1.5'}`}>
    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{label}</span>
    <span className={`text-[11px] font-black ${valueClass}`}>{value}</span>
  </div>
);

const OverallTaxSummary: React.FC<OverallTaxSummaryProps> = ({ from, to }) => {
  const t = useTranslations('ptisRedesign.wingIntelligence');

  return (
    <div className="flex flex-col border border-slate-200 rounded-lg px-1.5 py-1 flex-1 bg-white justify-between">
      <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">{t('overallTax') || 'OVERALL TAX'}</span>
      <div>
        <Tooltip content={`${formatFullCurrency(from)} \u2192 ${formatFullCurrency(to)}`} placement="top">
          <div className="text-sm font-black text-slate-900 leading-none cursor-help w-fit">
            {formatCompactCurrency(from)} - {formatCompactCurrency(to)}
          </div>
        </Tooltip>
        <div className="text-[9px] font-bold text-slate-400 mt-0.5 leading-none">
          {t('oldVsNewTotalTaxComparison') || 'Old vs Total Tax Comparison'}
        </div>
      </div>
    </div>
  );
};

const RevenueImpactSummary: React.FC<RevenueImpactSummaryProps> = ({
  wingName,
  amount,
  pct,
  isPositive,
  previousRv,
  revisedRv,
  affectedUnits,
}) => {
  const t = useTranslations('ptisRedesign.wingIntelligence');
  const [isOpen, setIsOpen] = useState(false);
  const prevValue = previousRv ?? 0;
  const revisedValue = revisedRv ?? 0;
  const unitsCount = affectedUnits ?? 0;
  
  return (
    <div className="relative flex-1">
      <div 
        onClick={(e) => { e.stopPropagation(); setIsOpen(true); }}
        className="flex flex-col h-full border border-emerald-200 rounded-lg px-1.5 py-1 bg-[#f0fdf4] justify-between cursor-pointer hover:bg-[#dcfce7] transition-colors"
      >
        <span className="text-[9px] font-bold text-teal-800 uppercase tracking-wider mb-0.5">{t('revenueImpact') || 'REVENUE IMPACT'}</span>
        <div className="flex flex-col">
          <div className="flex items-center gap-0.5 mb-0.5">
            <div className="text-sm font-black text-emerald-600 leading-none flex items-center gap-0.5 mt-[1px]">
              {isPositive ? <ArrowUpRight size={14} strokeWidth={3} /> : null} 
              {!isPositive ? <ArrowUpRight size={14} strokeWidth={3} className="rotate-90" /> : null}
              {formatCompactCurrency(Math.abs(amount))}
            </div>
          </div>
          <div className="text-[9px] font-bold text-teal-700 leading-none">
            {isPositive ? (t('increase') || 'Increase') : (t('decrease') || 'Decrease')} {pct}% {t('vsOldTax') || 'vs old tax'}
          </div>
        </div>
      </div>
      <Popover isOpen={isOpen} onClose={() => setIsOpen(false)} title={`${t('revImpactDetails') || 'REV IMPACT DETAILS'} – ${wingName}`}>
        <RowItem label={t('previousRv') || 'PREVIOUS RV'} value={formatFullCurrency(prevValue)} />
        <RowItem label={t('revisedRv') || 'REVISED RV'} value={formatFullCurrency(revisedValue)} valueClass="text-blue-800" />
        <RowItem label={t('differenceRv') || 'DIFFERENCE RV'} value={formatFullCurrency(Math.abs(amount))} valueClass="text-emerald-600" />
        <RowItem label={t('percentageChange') || 'PERCENTAGE CHANGE'} value={`${isPositive ? '+' : '-'}${pct}%`} valueClass="text-emerald-600" />
        <RowItem label={t('affectedUnits') || 'AFFECTED UNITS'} value={`${unitsCount} ${unitsCount === 1 ? (t('unit') || 'Unit') : (t('units') || 'Units')}`} isLast />
      </Popover>
    </div>
  );
};

const ExemptionSummary: React.FC<ExemptionSummaryProps> = ({ wingName, amount, count }) => {
  const t = useTranslations('ptisRedesign.wingIntelligence');
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative flex-1">
      <div 
        onClick={(e) => { e.stopPropagation(); setIsOpen(true); }}
        className="flex flex-col h-full border border-purple-100 rounded-lg px-1.5 py-1 bg-[#faf5ff] justify-between cursor-pointer hover:bg-purple-100 transition-colors"
      >
        <span className="text-[9px] font-bold text-purple-800 uppercase tracking-wider mb-0.5">{t('exemptionApplied') || 'EXEMPTION APPLIED'}</span>
        <div className="flex flex-col">
          <span className="text-sm font-black text-purple-900 leading-none w-fit mb-0.5">{formatCompactCurrency(amount)}</span>
          <div className="flex items-center gap-1.5 mb-0.5">
            <span className="bg-purple-200 text-purple-900 text-[8px] font-black px-1.5 py-[3px] rounded-sm uppercase leading-none">
              {count} {count === 1 ? (t('property') || 'PROPERTY') : (t('properties') || 'PROPERTIES')}
            </span>
            <span className="text-[9px] font-bold text-purple-700 leading-none">{t('exempted') || 'Exempted'}</span>
          </div>
          <button className="text-[10px] font-extrabold text-blue-700 self-start hover:underline leading-none">
            {t('viewList') || 'View List'} &gt;
          </button>
        </div>
      </div>
      <Popover isOpen={isOpen} onClose={() => setIsOpen(false)} title={`${t('exemptionDetails') || 'EXEMPTION DETAILS'} – ${wingName}`}>
        <RowItem label={t('exemptedUnits') || 'EXEMPTED UNITS'} value={`${count} ${t('units') || 'Units'}`} />
        <RowItem label={t('category') || 'CATEGORY'} value={<div className="text-right max-w-[120px] leading-tight">{t('freedomFighterExemption') || 'Freedom Fighter & Defense Exemption'}</div>} valueClass="text-purple-700" />
        <RowItem label={t('eligibleUnits') || 'ELIGIBLE UNITS'} value="Flat 102, Flat 204" />
        <RowItem label={t('exemptionAmount') || 'EXEMPTION AMOUNT'} value={formatFullCurrency(amount)} valueClass="text-purple-700" isLast />
      </Popover>
    </div>
  );
};

export const ApartmentWingCardFooter: React.FC<WingCardFooterProps> = ({
  wingName,
  exemption,
  overallTax,
  revenueImpact
}) => {
  return (
    <div className="flex gap-1.5 bg-white rounded-b-xl border-t border-slate-100 p-1">
      <OverallTaxSummary from={overallTax.from} to={overallTax.to} />
      <RevenueImpactSummary
        wingName={wingName}
        amount={revenueImpact.amount}
        pct={revenueImpact.pct}
        isPositive={revenueImpact.isPositive}
        previousRv={revenueImpact.previousRv ?? overallTax.from}
        revisedRv={revenueImpact.revisedRv ?? overallTax.to}
        affectedUnits={revenueImpact.affectedUnits}
      />
      <ExemptionSummary wingName={wingName} amount={exemption.amount} count={exemption.count} />
    </div>
  );
};

export default ApartmentWingCardFooter;
