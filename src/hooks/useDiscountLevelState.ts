'use client';

import { useState, useMemo, useCallback, useEffect } from 'react';
import type {
  ApplicationLevel,
  WingOption,
  UnitSelectionItem,
} from '@/types/building-permission.types';

export interface UseDiscountLevelStateProps {
  propertyId?: string;
  initialLevel?: ApplicationLevel;
  initialWingDetailId?: number | null;
  isSociety?: boolean;
  wings?: WingOption[];
  units?: UnitSelectionItem[];
}

export function useDiscountLevelState({
  propertyId,
  initialLevel = 'Apartment',
  initialWingDetailId = null,
  isSociety = false,
  wings = [],
  units = []
}: UseDiscountLevelStateProps) {
  const [level, setLevel] = useState<ApplicationLevel>(initialLevel);
  const dynamicWings = useMemo(() => (Array.isArray(wings) ? wings : []), [wings]);
  const dynamicUnits = useMemo(() => (Array.isArray(units) ? units : []), [units]);

  const [explicitSelectedWingDetailId, setExplicitSelectedWingDetailId] = useState<number | null>(initialWingDetailId);
  
  const selectedWingDetailId = explicitSelectedWingDetailId ?? (dynamicWings.length > 0 ? dynamicWings[0].wingDetailId : null);
  const setSelectedWingDetailId = setExplicitSelectedWingDetailId;

  const totalUnitsCount = 0;
  const hasMoreUnits = true;
  const [isLoadingMoreUnits, setIsLoadingMoreUnits] = useState(false);

  // Dynamic API Data Fetching
  useEffect(() => {
    // API calls removed per user request for Discount section
  }, [propertyId, isSociety]);

  // Unit filter state
  const [unitSearchQuery, setUnitSearchQuery] = useState('');
  const [wingFilter, setWingFilterRaw] = useState<string>('all');
  const [floorFilter, setFloorFilter] = useState<string>('all');
  const [useFilter, setUseFilter] = useState<string>('all');



  // Load next 10 units on scroll (wing-scoped)
  const loadNextUnitsPage = useCallback(async () => {
    // API pagination removed per user request
    setIsLoadingMoreUnits(false);
  }, []);

  // When wingFilter changes, re-fetch units from the API server-side
  const setWingFilter = useCallback((value: string) => {
    setWingFilterRaw(value);
    // API filtering removed per user request
  }, []);

  // Selected unit IDs (for Unit level)
  const [selectedUnitIds, setSelectedUnitIds] = useState<Set<number>>(() => new Set());

  // Unique floors and uses for filter dropdowns — derived from ALL loaded units, not filtered
  const availableFloors = useMemo(() => {
    const set = new Set<string>();
    dynamicUnits.forEach((u) => {
      if (u.floorName) set.add(u.floorName);
    });
    return Array.from(set);
  }, [dynamicUnits]);

  const availableUses = useMemo(() => {
    const set = new Set<string>();
    dynamicUnits.forEach((u) => {
      if (u.useName) set.add(u.useName);
    });
    return Array.from(set);
  }, [dynamicUnits]);

  // Filtered unit list — wing filtering is server-side, floor/use/search are client-side
  const filteredUnits = useMemo(() => {
    return dynamicUnits.filter((unit) => {
      if (floorFilter !== 'all' && unit.floorName.toLowerCase() !== floorFilter.toLowerCase()) {
        return false;
      }
      if (useFilter !== 'all' && unit.useName.toLowerCase() !== useFilter.toLowerCase()) {
        return false;
      }
      if (unitSearchQuery.trim()) {
        const query = unitSearchQuery.trim().toLowerCase();
        const matchesUnit = unit.unitNo.toLowerCase().includes(query);
        const matchesWing = unit.wingName.toLowerCase().includes(query);
        const matchesFloor = unit.floorName.toLowerCase().includes(query);
        return matchesUnit || matchesWing || matchesFloor;
      }
      return true;
    });
  }, [dynamicUnits, floorFilter, useFilter, unitSearchQuery]);

  const isAllUnitsSelected = useMemo(() => {
    if (filteredUnits.length === 0) return false;
    return filteredUnits.every((u) => selectedUnitIds.has(u.propertyDetailsId));
  }, [filteredUnits, selectedUnitIds]);

  const toggleUnitSelection = useCallback((propertyDetailsId: number) => {
    setSelectedUnitIds((prev) => {
      const next = new Set(prev);
      if (next.has(propertyDetailsId)) {
        next.delete(propertyDetailsId);
      } else {
        next.add(propertyDetailsId);
      }
      return next;
    });
  }, []);

  const toggleAllUnits = useCallback(() => {
    setSelectedUnitIds((prev) => {
      const next = new Set(prev);
      if (isAllUnitsSelected) {
        filteredUnits.forEach((u) => next.delete(u.propertyDetailsId));
      } else {
        filteredUnits.forEach((u) => next.add(u.propertyDetailsId));
      }
      return next;
    });
  }, [filteredUnits, isAllUnitsSelected]);

  return {
    level,
    setLevel,
    selectedWingDetailId,
    setSelectedWingDetailId,
    unitSearchQuery,
    setUnitSearchQuery,
    wingFilter,
    setWingFilter,
    floorFilter,
    setFloorFilter,
    useFilter,
    setUseFilter,
    selectedUnitIds,
    setSelectedUnitIds,
    wings: dynamicWings,
    availableFloors,
    availableUses,
    filteredUnits,
    isAllUnitsSelected,
    toggleUnitSelection,
    toggleAllUnits,
    totalUnitsCount,
    hasMoreUnits,
    isLoadingMoreUnits,
    loadNextUnitsPage,
  };
}
