'use client';

import { useState, useMemo, useCallback, useEffect, useRef } from 'react';
import type {
  ApplicationLevel,
  CertificateStatus,
  WingOption,
  UnitSelectionItem,
  CertificateTypeMasterOption,
  CertificateData,
} from '@/types/building-permission.types';

import {
  normalizeCertificateGridData,
  flattenCertificateRecords,
  getActiveCertificateForLevel,
  findWingDetailId,
  type CertificateGridItems,
  type CertificateItem,
} from '@/lib/utils/certificate-grid-mapper';

import {
  getUnitsByPropertyAction,
  getApartmentQcCertificateGridAction,
} from '@/app/[locale]/property-tax/ptis/QuickDataEntry/[propertyId]/Building/action';

export interface UseCertificateModalStateProps {
  propertyId?: string;
  societyId?: number | null;
  wings?: WingOption[];
  units?: UnitSelectionItem[];
  certificateTypes?: CertificateTypeMasterOption[];
  initialCertificateGrid?: unknown;
  initialLevel?: ApplicationLevel;
  initialWingDetailId?: number | null;
  initialCertificateTypeId?: number;
  initialData?: CertificateData | null;
}

export function useCertificateModalState({
  propertyId,
  societyId,
  wings: initialWings = [],
  units: initialUnits = [],
  certificateTypes: initialTypes = [],
  initialCertificateGrid = null,
  initialLevel = 'Apartment',
  initialWingDetailId = null,
  initialCertificateTypeId = 3,
  initialData = null,
}: UseCertificateModalStateProps) {
  const [level, setLevel] = useState<ApplicationLevel>(initialLevel);
  const [dynamicWings] = useState<WingOption[]>(initialWings);
  const [dynamicUnits, setDynamicUnits] = useState<UnitSelectionItem[]>(initialUnits);
  const [dynamicTypes] = useState<CertificateTypeMasterOption[]>(initialTypes);
  const [gridItems, setGridItems] = useState<CertificateGridItems | null>(() => {
    return initialCertificateGrid ? normalizeCertificateGridData(initialCertificateGrid) : null;
  });
  const [isLoadingGridRecords, setIsLoadingGridRecords] = useState<boolean>(false);

  const [unitsPage, setUnitsPage] = useState(1);
  const [totalUnitsCount, setTotalUnitsCount] = useState(initialUnits.length);
  const [hasMoreUnits, setHasMoreUnits] = useState(false);
  const [isLoadingMoreUnits, setIsLoadingMoreUnits] = useState(false);

  const resolvedWings = dynamicWings.length > 0 ? dynamicWings : initialWings;
  const resolvedUnits = dynamicUnits.length > 0 ? dynamicUnits : initialUnits;
  const resolvedCertificateTypes = dynamicTypes.length > 0 ? dynamicTypes : initialTypes;

  const [selectedWingDetailId, setSelectedWingDetailId] = useState<number | null>(() => {
    if (initialWingDetailId && resolvedWings.some(w => Number(w.wingDetailId) === Number(initialWingDetailId))) {
      return Number(initialWingDetailId);
    }
    return resolvedWings.length > 0 ? resolvedWings[0].wingDetailId : null;
  });

  useEffect(() => {
    if (initialWingDetailId && resolvedWings.some(w => Number(w.wingDetailId) === Number(initialWingDetailId))) {
      const targetId = Number(initialWingDetailId);
      if (selectedWingDetailId !== targetId) {
        queueMicrotask(() => setSelectedWingDetailId(targetId));
      }
    } else if (!selectedWingDetailId && resolvedWings.length > 0) {
      queueMicrotask(() => setSelectedWingDetailId(resolvedWings[0].wingDetailId));
    }
  }, [initialWingDetailId, resolvedWings, selectedWingDetailId]);

  const [unitSearchQuery, setUnitSearchQuery] = useState('');
  const [wingFilter, setWingFilterRaw] = useState<string>('all');
  const [floorFilter, setFloorFilter] = useState<string>('all');
  const [useFilter, setUseFilter] = useState<string>('all');

  const [selectedUnitIds, setSelectedUnitIds] = useState<Set<number>>(() => {
    const set = new Set<number>();
    initialUnits.forEach((u) => {
      if (u.isSelected) set.add(u.propertyDetailsId);
    });
    return set;
  });

  const gridRecords = useMemo<CertificateItem[]>(() => flattenCertificateRecords(gridItems), [gridItems]);

  // Resolve targetWingDetailId dynamically based on level, active wing filter, selected unit, or explicit wing selection
  const targetWingDetailId = useMemo(() => {
    if (wingFilter && wingFilter !== 'all') {
      const resolved = findWingDetailId(wingFilter, resolvedWings, gridItems);
      if (resolved != null) return resolved;
    }

    if (level === 'Unit' && selectedUnitIds.size > 0) {
      const selectedId = Array.from(selectedUnitIds)[0];
      const matchedUnit = resolvedUnits.find((u) => u.propertyDetailsId === selectedId || u.propertyId === selectedId);
      if (matchedUnit && matchedUnit.wingDetailId) {
        return matchedUnit.wingDetailId;
      }
    }

    return selectedWingDetailId;
  }, [level, wingFilter, resolvedWings, gridItems, selectedUnitIds, resolvedUnits, selectedWingDetailId]);

  // Compute single selected unit propertyId for unit-level matching
  const targetUnitPropertyId = useMemo(() => {
    if (level === 'Unit') {
      if (selectedUnitIds.size === 1) {
        const selectedId = Array.from(selectedUnitIds)[0];
        const matchedUnit = resolvedUnits.find((u) => u.propertyDetailsId === selectedId || u.propertyId === selectedId);
        if (matchedUnit) {
          return matchedUnit.propertyId || matchedUnit.propertyDetailsId || selectedId;
        }
        return selectedId;
      }
    }
    return propertyId ?? null;
  }, [level, selectedUnitIds, resolvedUnits, propertyId]);

  const gridItemsRef = useRef(gridItems);
  useEffect(() => {
    gridItemsRef.current = gridItems;
  }, [gridItems]);

  // Sync grid items dynamically when level or selected targets change
  useEffect(() => {
    let isSubscribed = true;

    let targetPropId: string | number | null = null;
    let targetWingId: number | string | null = null;
    let targetSocId: number | string | null = null;

    if (level === 'Apartment') {
      targetSocId = societyId ?? null;
    } else if (level === 'Wing') {
      targetWingId = targetWingDetailId ?? selectedWingDetailId ?? null;
    } else if (level === 'Unit') {
      targetPropId = targetUnitPropertyId ?? null;
      targetWingId = targetWingDetailId ?? selectedWingDetailId ?? null;
    }

    if (!targetPropId && !targetWingId && !targetSocId) return;

    // Only refetch if gridItems is not already populated from SSR
    if (gridItemsRef.current && (level === 'Apartment' && targetSocId === societyId)) {
      return;
    }

    Promise.resolve().then(() => {
      if (isSubscribed) setIsLoadingGridRecords(true);
    });

    getApartmentQcCertificateGridAction(targetPropId, targetWingId, targetSocId)
      .then((res) => {
        if (isSubscribed && res.success && res.data) {
          const normalized = normalizeCertificateGridData(res.data);
          setGridItems(normalized);
        }
      })
      .finally(() => {
        if (isSubscribed) {
          setIsLoadingGridRecords(false);
        }
      });

    return () => {
      isSubscribed = false;
    };
  }, [level, targetWingDetailId, selectedWingDetailId, targetUnitPropertyId, societyId]);

  // Helper: map raw unit record from API to UnitSelectionItem
  const mapRawUnitItem = (u: Record<string, unknown>, idx: number): UnitSelectionItem => ({
    propertyDetailsId: Number(u.propertyDetailsId || u.PropertyDetailsId || u.id || u.Id || idx + 1),
    propertyId: Number(u.propertyId || u.PropertyId || u.propertyDetailsId || u.PropertyDetailsId || 0),
    unitNo: String(u.unitNo || u.UnitNo || u.partitionNo || u.PartitionNo || u.flatNo || u.FlatNo || `Unit ${idx + 1}`),
    wingDetailId: Number(u.wingDetailId || u.WingDetailId || 0),
    wingName: String(u.wingName || u.WingName || 'Wing'),
    floorName: String(u.floorName || u.FloorName || u.floor || '1st Floor'),
    useName: String(u.useName || u.UseName || u.use || 'Residential'),
    isSelected: false,
  });

  // Helper: resolve wingDetailId from the current wingFilter value
  const getWingDetailIdFromFilter = useCallback((filterValue: string): number | null => {
    if (filterValue === 'all') return null;
    const matchedWing = resolvedWings.find(
      (w) => w.wingName === filterValue || String(w.wingDetailId) === filterValue
    );
    return matchedWing?.wingDetailId ?? null;
  }, [resolvedWings]);

  // Load next 10 units on scroll (wing-scoped)
  const loadNextUnitsPage = useCallback(async () => {
    if (!propertyId || isLoadingMoreUnits || !hasMoreUnits) return;
    setIsLoadingMoreUnits(true);

    const nextPage = unitsPage + 1;
    const wingDetailIdParam = getWingDetailIdFromFilter(wingFilter);
    const res = await getUnitsByPropertyAction(propertyId, wingDetailIdParam, nextPage, 10);

    if (res.success && Array.isArray(res.data) && res.data.length > 0) {
      const newItems: UnitSelectionItem[] = (res.data as Record<string, unknown>[]).map(mapRawUnitItem);

      setDynamicUnits((prev) => {
        const existingIds = new Set(prev.map((item) => item.propertyDetailsId));
        const filteredNew = newItems.filter((item) => !existingIds.has(item.propertyDetailsId));
        const updated = [...prev, ...filteredNew];
        const total = typeof res.totalCount === 'number' ? res.totalCount : totalUnitsCount;
        setTotalUnitsCount(total);
        setHasMoreUnits(updated.length < total);
        return updated;
      });
      setUnitsPage(nextPage);
    } else {
      setHasMoreUnits(false);
    }

    setIsLoadingMoreUnits(false);
  }, [propertyId, isLoadingMoreUnits, hasMoreUnits, unitsPage, totalUnitsCount, wingFilter, getWingDetailIdFromFilter]);

  // When wingFilter changes, re-fetch units from the API server-side
  const setWingFilter = useCallback((value: string) => {
    setWingFilterRaw(value);
    if (!propertyId) return;

    setUnitsPage(1);
    setHasMoreUnits(true);
    setIsLoadingMoreUnits(true);

    // Resolve wingDetailId using findWingDetailId helper
    const wingDetailIdParam = findWingDetailId(value, resolvedWings, gridItems);
    if (wingDetailIdParam != null) {
      setSelectedWingDetailId(wingDetailIdParam);
    }

    getUnitsByPropertyAction(propertyId, wingDetailIdParam, 1, 10).then((res) => {
      if (res.success && Array.isArray(res.data)) {
        const mappedUnits: UnitSelectionItem[] = (res.data as Record<string, unknown>[]).map(mapRawUnitItem);
        setDynamicUnits(mappedUnits);
        const total = typeof res.totalCount === 'number' ? res.totalCount : mappedUnits.length;
        setTotalUnitsCount(total);
        setHasMoreUnits(mappedUnits.length < total);
      } else {
        setDynamicUnits([]);
        setTotalUnitsCount(0);
        setHasMoreUnits(false);
      }
      setIsLoadingMoreUnits(false);
    });
  }, [propertyId, resolvedWings, gridItems]);



  // Certificate selection state
  const [selectedTypeId, setSelectedTypeId] = useState<number>(
    initialCertificateTypeId || (resolvedCertificateTypes[0]?.certificateTypeId ?? 3)
  );

  // Document form fields
  const [certificateDate, setCertificateDate] = useState<string>(initialData?.date || '');
  const [certificateNumber, setCertificateNumber] = useState<string>(initialData?.number || '');
  const [status, setStatus] = useState<CertificateStatus>('Active');
  const [remarks, setRemarks] = useState<string>('');
  const [attachedFiles, setAttachedFiles] = useState<File[]>([]);

  const [inheritedFrom, setInheritedFrom] = useState<'Direct' | 'Wing' | 'Apartment' | null>(null);
  const [activeCertificate, setActiveCertificate] = useState<CertificateItem | null>(null);





  // Automatically update fields when gridItems, level, targetWingDetailId, targetUnitPropertyId, or selectedTypeId changes
  useEffect(() => {
    if (!gridItems) return;
    const { certificate: match, inheritedFrom: source } = getActiveCertificateForLevel(
      gridItems,
      level,
      selectedTypeId,
      targetWingDetailId,
      targetUnitPropertyId,
      societyId
    );

    queueMicrotask(() => {
      setInheritedFrom(source);
      setActiveCertificate(match);

      if (match) {
        setCertificateNumber(match.certificateNumber || '');
        const formattedDate = match.certificateDate
          ? match.certificateDate.includes('T')
            ? match.certificateDate.split('T')[0]
            : match.certificateDate
          : '';
        setCertificateDate(formattedDate);
        setStatus((match.status as CertificateStatus) || 'Active');
      } else {
        // If selected certificate has no record, reset input fields to empty
        setCertificateNumber('');
        setCertificateDate('');
        setStatus('Active');
        setAttachedFiles([]);
      }
    });
  }, [gridItems, level, selectedTypeId, targetWingDetailId, targetUnitPropertyId, societyId]);

  const activeCertificateType = useMemo(
    () => resolvedCertificateTypes.find((t) => t.certificateTypeId === selectedTypeId) || resolvedCertificateTypes[0],
    [resolvedCertificateTypes, selectedTypeId]
  );

  // Unique floors and uses for filter dropdowns — derived from ALL loaded units, not filtered
  const availableFloors = useMemo(() => {
    const set = new Set<string>();
    resolvedUnits.forEach((u) => {
      if (u.floorName) set.add(u.floorName);
    });
    return Array.from(set);
  }, [resolvedUnits]);

  const availableUses = useMemo(() => {
    const set = new Set<string>();
    resolvedUnits.forEach((u) => {
      if (u.useName) set.add(u.useName);
    });
    return Array.from(set);
  }, [resolvedUnits]);

  // Filtered unit list — wing filtering is server-side, floor/use/search are client-side
  const filteredUnits = useMemo(() => {
    return resolvedUnits.filter((unit) => {
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
  }, [resolvedUnits, floorFilter, useFilter, unitSearchQuery]);

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
    selectedTypeId,
    setSelectedTypeId,
    activeCertificateType,
    certificateDate,
    setCertificateDate,
    certificateNumber,
    setCertificateNumber,
    status,
    setStatus,
    remarks,
    setRemarks,
    attachedFiles,
    setAttachedFiles,
    wings: resolvedWings,
    certificateTypes: resolvedCertificateTypes,
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
    gridRecords,
    gridItems,
    isLoadingGridRecords,
    inheritedFrom,
    activeCertificate,
  };
}
