'use client';

import React from 'react';
import { cn } from '@/lib/utils/cn';
import { Folder, Building2, Percent, History, FileText, TrendingUp, Layers, Loader2, GitMerge } from 'lucide-react';
import { useTranslations } from 'next-intl';
import type { PtisTaxMode } from '@/types/property-tax/apartment';

export type IndividualFloorTopNavSection = 'floor' | 'building' | 'discount' | 'oldDetails';

export interface IndividualFloorTopNavProps {
  activeSection: IndividualFloorTopNavSection | null;
  onToggleSection: (section: IndividualFloorTopNavSection) => void;
  taxMode?: PtisTaxMode;
  onTaxModeChange?: (mode: PtisTaxMode) => void;
  isLoadingValuation?: boolean;
  onOpenAppliedRules?: () => void;
  hasAppliedRules?: boolean;
}

export const IndividualFloorTopNav: React.FC<IndividualFloorTopNavProps> = ({
  activeSection = 'floor',
  onToggleSection,
  taxMode = 'rateable',
  onTaxModeChange,
  isLoadingValuation = false,
  onOpenAppliedRules,
  hasAppliedRules,
}) => {
  const valuationView: 'rv' | 'cvm' | 'dual' =
    taxMode === 'capital' ? 'cvm' : taxMode === 'dual' ? 'dual' : 'rv';

  const tQDE = useTranslations('quickDataEntry');
  const tWing = useTranslations('ptisRedesign.wingIntelligence');
  const tInd = useTranslations('individual');
  const tPtis = useTranslations('ptis');

  const handleValuationChange = (mode: 'rv' | 'cvm' | 'dual') => {
    onToggleSection('floor');
    if (mode === 'cvm') {
      onTaxModeChange?.('capital');
    } else if (mode === 'dual') {
      onTaxModeChange?.('dual');
    } else {
      onTaxModeChange?.('rateable');
    }
  };

  const getButtonStyle = (isActive: boolean) =>
    cn(
      'px-3 sm:px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-xs select-none whitespace-nowrap',
      isActive
        ? 'bg-white text-[#0047cc] border-2 border-[#0047cc] hover:bg-blue-50/50'
        : 'bg-[#0047cc] text-white border-2 border-[#0047cc] hover:bg-blue-800 active:bg-blue-900'
    );

  return (
    <div className="flex flex-wrap items-center justify-between gap-2.5 pb-2.5 w-full">
      {/* Left Navigation Buttons */}
      <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
        <button
          type="button"
          onClick={() => onToggleSection('floor')}
          className={getButtonStyle(activeSection === 'floor')}
        >
          <Folder className={cn('w-3.5 h-3.5', activeSection === 'floor' ? 'text-[#0047cc]' : 'text-white')} />
          <span>{tInd('floor.floorDetails')}</span>
        </button>

        <button
          type="button"
          onClick={() => onToggleSection('building')}
          className={getButtonStyle(activeSection === 'building')}
        >
          <Building2 className={cn('w-3.5 h-3.5', activeSection === 'building' ? 'text-[#0047cc]' : 'text-white')} />
          <span>{tQDE('tabs.BuildingPermission') || 'Building Permission'}</span>
        </button>

        <button
          type="button"
          onClick={() => onToggleSection('discount')}
          className={getButtonStyle(activeSection === 'discount')}
        >
          <Percent className={cn('w-3.5 h-3.5', activeSection === 'discount' ? 'text-[#0047cc]' : 'text-white')} />
          <span>{tQDE('tabs.Discount') || 'Discount & Social Data'}</span>
        </button>

        <button
          type="button"
          onClick={() => onToggleSection('oldDetails')}
          className={getButtonStyle(activeSection === 'oldDetails')}
        >
          <History className={cn('w-3.5 h-3.5', activeSection === 'oldDetails' ? 'text-[#0047cc]' : 'text-white')} />
          <span>{tQDE('tabs.OldDetails') || 'Old Details'}</span>
        </button>
      </div>

      {/* Right Valuation Views */}
      <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
        <button
          type="button"
          onClick={() => handleValuationChange('rv')}
          className={getButtonStyle(valuationView === 'rv')}
        >
          {isLoadingValuation && valuationView === 'rv' ? (
            <Loader2 className={cn('w-3.5 h-3.5 animate-spin', valuationView === 'rv' ? 'text-[#0047cc]' : 'text-white')} />
          ) : (
            <FileText className={cn('w-3.5 h-3.5', valuationView === 'rv' ? 'text-[#0047cc]' : 'text-white')} />
          )}
          <span>{tWing('valuation.rv', { defaultValue: 'Rateable Value (RV)' })}</span>
        </button>
        <button
          type="button"
          onClick={() => handleValuationChange('cvm')}
          className={getButtonStyle(valuationView === 'cvm')}
        >
          {isLoadingValuation && valuationView === 'cvm' ? (
            <Loader2 className={cn('w-3.5 h-3.5 animate-spin', valuationView === 'cvm' ? 'text-[#0047cc]' : 'text-white')} />
          ) : (
            <TrendingUp className={cn('w-3.5 h-3.5', valuationView === 'cvm' ? 'text-[#0047cc]' : 'text-white')} />
          )}
          <span>{tWing('valuation.cvm', { defaultValue: 'Capital Value Method (CVM)' })}</span>
        </button>
        <button
          type="button"
          onClick={() => handleValuationChange('dual')}
          className={getButtonStyle(valuationView === 'dual')}
        >
          {isLoadingValuation && valuationView === 'dual' ? (
            <Loader2 className={cn('w-3.5 h-3.5 animate-spin', valuationView === 'dual' ? 'text-[#0047cc]' : 'text-white')} />
          ) : (
            <Layers className={cn('w-3.5 h-3.5', valuationView === 'dual' ? 'text-[#0047cc]' : 'text-white')} />
          )}
          <span>{tWing('valuation.dual', { defaultValue: 'Dual Method View (RV + CVM)' })}</span>
        </button>

        <button
          type="button"
          id="applied-rules-tab-btn"
          onClick={() => {
            if (onOpenAppliedRules) {
              onOpenAppliedRules();
            } else if (typeof window !== 'undefined') {
              window.dispatchEvent(new CustomEvent('ptis:open-applied-rules'));
            }
          }}
          className="px-3 sm:px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-xs select-none whitespace-nowrap bg-gradient-to-r from-indigo-50 via-white to-blue-50 border-2 border-indigo-200 text-indigo-700 hover:from-indigo-100 hover:to-blue-100 hover:text-indigo-900 active:scale-95"
          title={tPtis('appliedRules.buttonLabel')}
        >
          <GitMerge className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
          <span>{tPtis('appliedRules.buttonLabel')}</span>
          {hasAppliedRules && (
            <span className="w-1.5 h-1.5 rounded-full bg-indigo-600 animate-pulse shrink-0" />
          )}
        </button>
      </div>
    </div>
  );
};

export default IndividualFloorTopNav;
