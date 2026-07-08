import { useState, useCallback, useEffect } from 'react';
import { ApartmentTaxDetailsItems, DualMethodTaxDetails, ApartmentQCDetail } from '@/types/apartmentQC.types';
import {
  fetchApartmentQCDetailsSafeAction,
  fetchFloorQCByPropertyIdSafeAction,
  fetchAllPropertyTypesAction,
  fetchApartmentPropertyTaxDetailsByTabAction,
  fetchApartmentPropertyTaxDetailsCvByTabAction,
  fetchDualMethodTaxDetailsByTabAction,
} from '@/app/[locale]/property-tax/ptis/appartmentQC/action';

export interface DrawerLocalData {
  basicInfo: ApartmentQCDetail | null;
  floorQCData: ApartmentQCDetail[];
  propertyTypes: Array<{ value: string; label: string }>;
}

export interface UseAppartmentQCSectionDataProps {
  wardId?: string;
  propertyNo?: string;
  partitionNo?: string;
  activeMainTab: string;
  activeSubTab: string;
  drawerOpen: boolean;
  selectedPropertyId: string | null;
}

export const useAppartmentQCSectionData = ({
  wardId,
  propertyNo,
  partitionNo,
  activeMainTab,
  activeSubTab,
  drawerOpen,
  selectedPropertyId
}: UseAppartmentQCSectionDataProps) => {
  // Tax details state
  const [taxDetails, setTaxDetails] = useState<ApartmentTaxDetailsItems | null>(null);
  const [dualMethodDetails, setDualMethodDetails] = useState<DualMethodTaxDetails | null>(null);
  const [taxDetailsLoading, setTaxDetailsLoading] = useState(false);

  const [drawerLocalData, setDrawerLocalData] = useState<DrawerLocalData | null>(null);

  const refetchTaxDetails = useCallback(async () => {
    if (!wardId || !propertyNo) {
      return;
    }

    try {
      setTaxDetails(null);
      setDualMethodDetails(null);
      setTaxDetailsLoading(true);

      if (activeSubTab === 'rateable') {
        const result = await fetchApartmentPropertyTaxDetailsByTabAction(wardId, propertyNo, activeMainTab, partitionNo);
        if (result.success && result.data) {
          setTaxDetails(result.data);
        }
      } else if (activeSubTab === 'capital') {
        const result = await fetchApartmentPropertyTaxDetailsCvByTabAction(wardId, propertyNo, activeMainTab, partitionNo);
        if (result.success && result.data) {
          setTaxDetails(result.data);
        }
      } else if (activeSubTab === 'dual-method') {
        const result = await fetchDualMethodTaxDetailsByTabAction(wardId, propertyNo, activeMainTab, partitionNo);
        if (result.success && result.data) {
          setDualMethodDetails(result.data);
        }
      }
    } catch {
      // Error handled silently
    } finally {
      setTaxDetailsLoading(false);
    }
  }, [activeSubTab, activeMainTab, wardId, propertyNo, partitionNo]);

  // Fetch tax details effect
  useEffect(() => {
    if (!wardId || !propertyNo) {
      return;
    }

    let cancelled = false;

    const fetchData = async () => {
      try {
        if (!cancelled) {
          await refetchTaxDetails();
        }
      } catch {
        // Error handled silently
      }
    };

    fetchData();

    return () => {
      cancelled = true;
    };
  }, [activeSubTab, activeMainTab, wardId, propertyNo, refetchTaxDetails]);

  // Fetch drawer local data effect
  useEffect(() => {
    if (!drawerOpen || !selectedPropertyId) return;

    let cancelled = false;

    const type = activeSubTab === 'dual-method' ? 'dual' : activeSubTab;

    Promise.all([
      fetchApartmentQCDetailsSafeAction({ propertyId: selectedPropertyId, pageSize: 1 }),
      fetchFloorQCByPropertyIdSafeAction(Number(selectedPropertyId), type),
      fetchAllPropertyTypesAction(),
    ])
      .then(([basicArr, floorArr, propTypesRes]) => {
        if (cancelled) return;

        setDrawerLocalData({
          basicInfo: basicArr.length > 0 ? basicArr[0] : null,
          floorQCData: floorArr,
          propertyTypes: propTypesRes.success && propTypesRes.data ? propTypesRes.data : [],
        });
      })
      .catch(() => {
        if (cancelled) return;

        setDrawerLocalData({
          basicInfo: null,
          floorQCData: [],
          propertyTypes: [],
        });
      });

    return () => {
      cancelled = true;
      setDrawerLocalData(null);
    };
  }, [drawerOpen, selectedPropertyId, activeSubTab]);

  return {
    taxDetails,
    dualMethodDetails,
    taxDetailsLoading,
    refetchTaxDetails,
    drawerLocalData
  };
};
