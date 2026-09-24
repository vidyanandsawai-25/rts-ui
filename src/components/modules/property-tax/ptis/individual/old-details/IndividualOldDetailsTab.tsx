'use client';

import React from 'react';
import type {
  OldFloorDetailsData,
  OldDetailsData,
  OldTaxesData,
  MappedPropertyItem,
} from '@/types/ptis.types';
import { IndividualOldTaxDetailsTable } from './IndividualOldTaxDetailsTable';
import {
  IndividualOldFieldsGrid,
  IndividualOldToolbar,
  IndividualOldMapDetailsTable,
  IndividualOldFloorDetailsTable,
} from './components';
import { useIndividualOldDetailsTab } from './hooks';

export interface IndividualOldDetailsTabProps {
  propertyId?: number | string | null;
  showOldFloorInfo?: boolean;
  setShowOldFloorInfo?: (value: boolean) => void;
  showOldTaxInfo?: boolean;
  setShowOldTaxInfo?: (value: boolean) => void;
  showOldMapInfo?: boolean;
  setShowOldMapInfo?: (value: boolean) => void;
  oldFloorTableData?: OldFloorDetailsData[];
  oldDetailsData?: OldDetailsData;
  oldTaxesData?: OldTaxesData | null;
  mappedPropertiesData?: MappedPropertyItem[];
}

export const IndividualOldDetailsTab: React.FC<IndividualOldDetailsTabProps> = (props) => {
  const {
    effectiveShowFloor,
    effectiveShowTax,
    effectiveShowMap,
    currentDetails,
    currentFloors,
    currentTaxes,
    currentMapped,
    isLoadingFloors,
    isLoadingTaxes,
    isLoadingMapped,
    handleToggleMapDetails,
    handleToggleFloorDetails,
    handleToggleOldTax,
  } = useIndividualOldDetailsTab(props);

  return (
    <div className="p-0.5 space-y-2">
      {/* 12 Old details fields in 2 perfectly balanced rows of 6 */}
      <IndividualOldFieldsGrid currentDetails={currentDetails} />

      {/* Action Toolbar */}
      <IndividualOldToolbar
        effectiveShowMap={effectiveShowMap}
        effectiveShowFloor={effectiveShowFloor}
        effectiveShowTax={effectiveShowTax}
        isLoadingMapped={isLoadingMapped}
        isLoadingFloors={isLoadingFloors}
        isLoadingTaxes={isLoadingTaxes}
        onToggleMapDetails={handleToggleMapDetails}
        onToggleFloorDetails={handleToggleFloorDetails}
        onToggleOldTax={handleToggleOldTax}
      />

      {/* Sub-tables: Dynamic Tax Details Section */}
      <IndividualOldTaxDetailsTable
        oldTaxesData={currentTaxes}
        showOldTaxInfo={effectiveShowTax}
        isLoading={isLoadingTaxes}
      />

      {/* Sub-tables: Map Details Table */}
      <IndividualOldMapDetailsTable
        showOldMapInfo={effectiveShowMap}
        mappedPropertiesData={currentMapped}
        isLoading={isLoadingMapped}
      />

      {/* Sub-tables: Floor Details Table */}
      <IndividualOldFloorDetailsTable
        showOldFloorInfo={effectiveShowFloor}
        oldFloorTableData={currentFloors}
        currentDetails={currentDetails}
        isLoading={isLoadingFloors}
      />
    </div>
  );
};

export default IndividualOldDetailsTab;
