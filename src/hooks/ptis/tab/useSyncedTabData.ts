import { useState, useMemo } from 'react';
import {
  defaultPropertyDetails,
  defaultKycDetails,
  defaultSocietyDetails,
  defaultOldDetails,
} from '@/lib/constants/ptis.constants';
import type {
  PropertyDetailsData,
  KYCDetailsData,
  SocietyDetailsData,
  OldDetailsData,
  OldFloorDetailsData,
  OldTaxesData,
} from '@/types/ptis.types';

export function useSyncedTabData(
  initialPropertyDetails?: PropertyDetailsData,
  initialKycDetails?: KYCDetailsData,
  initialSocietyDetails?: SocietyDetailsData,
  initialOldDetails?: OldDetailsData,
  initialOldFloorTableData?: OldFloorDetailsData[],
  initialShowOldFloorInfo?: boolean,
  initialOldTaxesData?: OldTaxesData | null,
  initialShowOldTaxInfo?: boolean
) {
  const data = useMemo<PropertyDetailsData>(
    () => ({ ...defaultPropertyDetails, ...(initialPropertyDetails ?? {}) }),
    [initialPropertyDetails]
  );

  const kycDetailsData = useMemo<KYCDetailsData>(
    () => ({ ...defaultKycDetails, ...(initialKycDetails ?? {}) }),
    [initialKycDetails]
  );

  const societyDetailsData = useMemo<SocietyDetailsData>(
    () => ({ ...defaultSocietyDetails, ...(initialSocietyDetails ?? {}) }),
    [initialSocietyDetails]
  );

  const oldDetailsData = useMemo<OldDetailsData>(
    () => ({ ...defaultOldDetails, ...(initialOldDetails ?? {}) }),
    [initialOldDetails]
  );

  const oldFloorTableData = useMemo<OldFloorDetailsData[]>(
    () => initialOldFloorTableData ?? [],
    [initialOldFloorTableData]
  );

  const oldTaxesData = useMemo<OldTaxesData | null>(
    () => initialOldTaxesData ?? null,
    [initialOldTaxesData]
  );

  // UI-controlled state: user toggles these with buttons, so useState is correct here.
  const [showOldFloorInfo, setShowOldFloorInfo] = useState(initialShowOldFloorInfo ?? false);
  const [showOldTaxInfo, setShowOldTaxInfo] = useState(initialShowOldTaxInfo ?? false);

  return {
    data,
    kycDetailsData,
    societyDetailsData,
    oldDetailsData,
    showOldFloorInfo,
    setShowOldFloorInfo,
    oldFloorTableData,
    oldTaxesData,
    showOldTaxInfo,
    setShowOldTaxInfo,
  };
}
