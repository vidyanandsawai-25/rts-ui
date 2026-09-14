'use client';

import React from 'react';
import { ChevronDown, ChevronRight } from 'lucide-react';
import BuildingPermissionTab from '@/components/modules/property-tax/ptis/tabs/BuildingPermissionTab';
import DiscountDataTab from '@/components/modules/property-tax/ptis/tabs/DiscountDataTab';
import { OldDetailsPanel } from '../old-details/OldDetailsPanel';
import type { BuildingPermissionData, DiscountData } from '@/types/ptis.types';
import { WingIntelligenceTopNavSection } from './ApartmentWingTopNav';

export interface WingIntelligencePanelsProps {
  activeSection: WingIntelligenceTopNavSection;
  isExpanded: boolean;
  onToggleExpand: () => void;
  buildingPermissionData?: BuildingPermissionData | null;
  discountData?: DiscountData | null;
  propertyId?: number | string | null;
  wingDetailsId?: number | null;
  societyDetailId?: number | null;
  wingName?: string | null;
  selectedFloor?: string | null;
}

export const ApartmentWingPanels: React.FC<WingIntelligencePanelsProps> = ({
  activeSection,
  isExpanded,
  onToggleExpand,
  buildingPermissionData,
  discountData,
  propertyId,
  wingDetailsId,
  societyDetailId,
  wingName,
  selectedFloor,
}) => {
  const titles = {
    building: 'BUILDING PERMISSION (Certificates & Clearances)',
    discount: 'DISCOUNT & SOCIAL DATA (Discounts & Concessions)',
    oldDetails: 'OLD DETAILS (Mapped Properties Society / Wing Wise)',
  };

  const title = titles[activeSection as 'building' | 'discount' | 'oldDetails'];
  if (!title) return null;

  return (
    <div className="pt-1">
      <div
        className="flex items-center gap-1.5 cursor-pointer select-none group pb-2"
        onClick={onToggleExpand}
      >
        <h2 className="text-[13px] font-black text-slate-900 uppercase tracking-wide">{title}</h2>
        {isExpanded ? (
          <ChevronDown size={16} strokeWidth={3} className="text-slate-400 group-hover:text-slate-600" />
        ) : (
          <ChevronRight size={16} strokeWidth={3} className="text-slate-400 group-hover:text-slate-600" />
        )}
      </div>

      {isExpanded && (
        <>
          {activeSection === 'building' && (
            <div className="p-3 bg-slate-50/70 rounded-xl border border-slate-200">
              <BuildingPermissionTab data={buildingPermissionData ?? undefined} />
            </div>
          )}

          {activeSection === 'discount' && (
            <div className="p-3 bg-slate-50/70 rounded-xl border border-slate-200">
              <DiscountDataTab
                propertyId={typeof propertyId === 'number' ? propertyId : propertyId ? Number(propertyId) : undefined}
                initialData={discountData ?? undefined}
              />
            </div>
          )}

          {activeSection === 'oldDetails' && (
            <OldDetailsPanel
              wingDetailsId={wingDetailsId}
              societyDetailId={societyDetailId}
              wingName={wingName}
              selectedFloor={selectedFloor}
              onClose={onToggleExpand}
            />
          )}
        </>
      )}
    </div>
  );
};

export default ApartmentWingPanels;
