"use client";

import { useCallback, useEffect, useState } from "react";
import {
  fetchSocietyDetailsByPropertyAction,
  getSocietyAmenityDetailsAction,
} from "@/app/[locale]/property-tax/zone-master/actions";
import type { SocietyDetailItem } from "@/types/zone-master/properties/societyDetails.types";
import type { SocietyAmenityDetailItem } from "@/types/zone-master/properties/society-amenity-details.types";

interface UsePropertyAmenityDataProps {
  propertyId: string;
}

interface UsePropertyAmenityDataReturn {
  // Wings
  wings: SocietyDetailItem[];
  wingsLoading: boolean;
  selectedSocietyDetailId: number | null;
  setSelectedSocietyDetailId: (id: number | null) => void;
  wingOptions: { label: string; value: string }[];
  
  // Toggle
  isAmenity: boolean;
  setIsAmenity: (value: boolean) => void;
  
  // Table data
  tableData: SocietyAmenityDetailItem[];
  tableLoading: boolean;
  refreshTable: () => void;
  
  // Selection reset
  resetSelection: () => void;
}

export function usePropertyAmenityData({
  propertyId,
}: UsePropertyAmenityDataProps): UsePropertyAmenityDataReturn {
  // Wings state
  const [wings, setWings] = useState<SocietyDetailItem[]>([]);
  const [wingsLoading, setWingsLoading] = useState(false);
  const [selectedSocietyDetailId, setSelectedSocietyDetailId] = useState<number | null>(null);

  // Toggle state
  const [isAmenity, setIsAmenity] = useState(false);

  // Table state
  const [tableData, setTableData] = useState<SocietyAmenityDetailItem[]>([]);
  const [tableLoading, setTableLoading] = useState(false);

  // Load wings when property changes
  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    setWings([]);
    setSelectedSocietyDetailId(null);
    setTableData([]);
    setIsAmenity(false);

    if (!propertyId) return;

    let cancelled = false;
    setWingsLoading(true);

    fetchSocietyDetailsByPropertyAction(Number(propertyId))
      .then((result) => {
        if (cancelled) return;
        setWings(result.success && result.data ? result.data.items || [] : []);
      })
      .catch(() => {
        if (!cancelled) setWings([]);
      })
      .finally(() => {
        if (!cancelled) setWingsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [propertyId]);
  /* eslint-enable react-hooks/set-state-in-effect */

  // Load table when wing / toggle changes
  const loadTable = useCallback((sdId: number, amenity: boolean) => {
    setTableLoading(true);

    getSocietyAmenityDetailsAction(sdId, amenity)
      .then((result) => {
        setTableData(result.success && result.data ? result.data : []);
      })
      .catch(() => setTableData([]))
      .finally(() => setTableLoading(false));
  }, []);

  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    if (!selectedSocietyDetailId) {
      setTableData([]);
      return;
    }
    loadTable(selectedSocietyDetailId, isAmenity);
  }, [selectedSocietyDetailId, isAmenity, loadTable]);
  /* eslint-enable react-hooks/set-state-in-effect */

  const refreshTable = useCallback(() => {
    if (selectedSocietyDetailId) loadTable(selectedSocietyDetailId, isAmenity);
  }, [selectedSocietyDetailId, isAmenity, loadTable]);

  const resetSelection = useCallback(() => {
    // This will be used by parent to reset selection state
  }, []);

  // Wing dropdown options
  const wingOptions = wings.map((item) => ({
    label: `${item.wingId} - ${item.wingName}`,
    value: item.id.toString(),
  }));

  return {
    wings,
    wingsLoading,
    selectedSocietyDetailId,
    setSelectedSocietyDetailId,
    wingOptions,
    isAmenity,
    setIsAmenity,
    tableData,
    tableLoading,
    refreshTable,
    resetSelection,
  };
}
