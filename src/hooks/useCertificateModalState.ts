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

  const [unitSearchQuery, setUnitSearchQuery] = useState('');
  const [wingFilter, setWingFilterRaw] = useState<string>(() => {
    if (initialWingDetailId && resolvedWings.some(w => Number(w.wingDetailId) === Number(initialWingDetailId))) {
      return String(initialWingDetailId);
    }
    return resolvedWings.length > 0 ? String(resolvedWings[0].wingDetailId) : '';
  });
  const [floorFilter, setFloorFilter] = useState<string>('all');
  const [useFilter, setUseFilter] = useState<string>('all');

  const [prevInitialWingDetailId, setPrevInitialWingDetailId] = useState<number | null | undefined>(initialWingDetailId);
  if (initialWingDetailId !== prevInitialWingDetailId) {
    setPrevInitialWingDetailId(initialWingDetailId);
    if (initialWingDetailId != null) {
      const targetId = Number(initialWingDetailId);
      if (resolvedWings.some(w => Number(w.wingDetailId) === targetId)) {
        setSelectedWingDetailId(targetId);
        setWingFilterRaw(String(targetId));
      }
    }
  }

  const [prevResolvedWingsLen, setPrevResolvedWingsLen] = useState<number>(resolvedWings.length);
  if (resolvedWings.length !== prevResolvedWingsLen) {
    setPrevResolvedWingsLen(resolvedWings.length);
    if (resolvedWings.length > 0 && (!wingFilter || wingFilter === 'all')) {
      const defaultWingId = selectedWingDetailId ?? resolvedWings[0].wingDetailId;
      setWingFilterRaw(String(defaultWingId));
    }
  }

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

  const lastFetchedKeyRef = useRef<string | null>(null);

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
      targetPropId = null;
      targetWingId = targetWingDetailId ?? selectedWingDetailId ?? null;
    }

    if (!targetPropId && !targetWingId && !targetSocId) return;

    const requestKey = `${level}_${targetPropId}_${targetWingId}_${targetSocId}`;
    if (lastFetchedKeyRef.current === requestKey) {
      return;
    }

    // Only refetch if gridItems is not already populated from SSR
    if (gridItemsRef.current && (level === 'Apartment' && targetSocId === societyId)) {
      lastFetchedKeyRef.current = requestKey;
      return;
    }

    lastFetchedKeyRef.current = requestKey;

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

  // Helper: natural alphanumeric sort for units (e.g. A1, A2, A3, ..., A10, A12)
  const naturalUnitSort = useCallback((a: UnitSelectionItem, b: UnitSelectionItem): number => {
    return (a.unitNo || '').localeCompare(b.unitNo || '', undefined, { numeric: true, sensitivity: 'base' });
  }, []);

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

  // Load next units on scroll (wing-scoped)
  const loadNextUnitsPage = useCallback(async () => {
    if (!propertyId || isLoadingMoreUnits || !hasMoreUnits) return;
    setIsLoadingMoreUnits(true);

    const nextPage = unitsPage + 1;
    const wingDetailIdParam = getWingDetailIdFromFilter(wingFilter);
    const res = await getUnitsByPropertyAction(propertyId, wingDetailIdParam, nextPage, 100);

    if (res.success && Array.isArray(res.data) && res.data.length > 0) {
      const newItems: UnitSelectionItem[] = (res.data as Record<string, unknown>[]).map(mapRawUnitItem);

      setDynamicUnits((prev) => {
        const existingIds = new Set(prev.map((item) => item.propertyDetailsId));
        const filteredNew = newItems.filter((item) => !existingIds.has(item.propertyDetailsId));
        const updated = [...prev, ...filteredNew].sort(naturalUnitSort);
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
  }, [propertyId, isLoadingMoreUnits, hasMoreUnits, unitsPage, totalUnitsCount, wingFilter, getWingDetailIdFromFilter, naturalUnitSort]);

  // When wingFilter changes, re-fetch units AND grid data in parallel
  const setWingFilter = useCallback((value: string) => {
    setWingFilterRaw(value);
    if (!propertyId) return;

    setUnitsPage(1);
    setHasMoreUnits(true);
    setIsLoadingMoreUnits(true);
    setIsLoadingGridRecords(true);
    // Clear unit selection since the new wing will have different units
    setSelectedUnitIds(new Set());

    // Resolve wingDetailId using findWingDetailId helper
    const wingDetailIdParam = findWingDetailId(value, resolvedWings, gridItems);
    if (wingDetailIdParam != null) {
      setSelectedWingDetailId(wingDetailIdParam);
    }

    // Pre-set lastFetchedKeyRef to prevent the grid-sync useEffect from re-fetching
    const preemptKey = `${level}_${null}_${wingDetailIdParam}_${null}`;
    lastFetchedKeyRef.current = preemptKey;

    // Fetch all units in the wing (large page size) and certificate grid in parallel
    const unitsPromise = getUnitsByPropertyAction(propertyId, wingDetailIdParam, 1, 200);
    const gridPromise = getApartmentQcCertificateGridAction(null, wingDetailIdParam, null);

    Promise.all([unitsPromise, gridPromise]).then(([unitsRes, gridRes]) => {
      // Process units
      if (unitsRes.success && Array.isArray(unitsRes.data)) {
        const mappedUnits: UnitSelectionItem[] = (unitsRes.data as Record<string, unknown>[]).map(mapRawUnitItem).sort(naturalUnitSort);
        setDynamicUnits(mappedUnits);
        const total = typeof unitsRes.totalCount === 'number' ? unitsRes.totalCount : mappedUnits.length;
        setTotalUnitsCount(total);
        setHasMoreUnits(mappedUnits.length < total);
      } else {
        setDynamicUnits([]);
        setTotalUnitsCount(0);
        setHasMoreUnits(false);
      }
      setIsLoadingMoreUnits(false);

      // Process grid data
      if (gridRes.success && gridRes.data) {
        const normalized = normalizeCertificateGridData(gridRes.data);
        setGridItems(normalized);
      }
      setIsLoadingGridRecords(false);
    });
  }, [propertyId, resolvedWings, gridItems, level, naturalUnitSort]);



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

  const selectedUnitPropertyIds = useMemo(() => {
    return Array.from(selectedUnitIds).map((id) => {
      const matched = resolvedUnits.find((u) => u.propertyDetailsId === id || u.propertyId === id);
      return matched?.propertyId || matched?.propertyDetailsId || id;
    });
  }, [selectedUnitIds, resolvedUnits]);

  const selectedUnitNumbers = useMemo(() => {
    return Array.from(selectedUnitIds).map((id) => {
      const matched = resolvedUnits.find((u) => u.propertyDetailsId === id || u.propertyId === id);
      return matched?.unitNo || '';
    }).filter(Boolean);
  }, [selectedUnitIds, resolvedUnits]);

  // Derived active certificate and inheritedFrom based on current level & selection
  const { certificate: activeCertificate, inheritedFrom } = useMemo(() => {
    if (!gridItems) return { certificate: null, inheritedFrom: null };
    return getActiveCertificateForLevel(
      gridItems,
      level,
      selectedTypeId,
      targetWingDetailId ?? selectedWingDetailId,
      targetUnitPropertyId,
      societyId,
      selectedUnitPropertyIds,
      selectedUnitNumbers
    );
  }, [
    gridItems,
    level,
    selectedTypeId,
    targetWingDetailId,
    selectedWingDetailId,
    targetUnitPropertyId,
    societyId,
    selectedUnitPropertyIds,
    selectedUnitNumbers,
  ]);

  // Automatically update input fields when active certificate / selection targets change
  const selectedIdsKey = selectedUnitPropertyIds.join(',');
  const fieldSyncKey = `${level}_${selectedTypeId}_${targetWingDetailId ?? selectedWingDetailId}_${targetUnitPropertyId}_${societyId}_${selectedIdsKey}_${gridItems ? 'loaded' : 'none'}_${activeCertificate?.propertyCertificateId || activeCertificate?.certificateNumber || 'none'}`;

  const [prevFieldSyncKey, setPrevFieldSyncKey] = useState<string>(fieldSyncKey);
  if (fieldSyncKey !== prevFieldSyncKey) {
    setPrevFieldSyncKey(fieldSyncKey);
    if (activeCertificate) {
      setCertificateNumber(activeCertificate.certificateNumber || '');
      const formattedDate = activeCertificate.certificateDate
        ? activeCertificate.certificateDate.includes('T')
          ? activeCertificate.certificateDate.split('T')[0]
          : activeCertificate.certificateDate
        : '';
      setCertificateDate(formattedDate);
      setStatus((activeCertificate.status as CertificateStatus) || 'Active');
    } else {
      setCertificateNumber('');
      setCertificateDate('');
      setStatus('Active');
    }
  }

  const refetchGrid = useCallback(async () => {
    let targetPropId: string | number | null = null;
    let targetWingId: number | string | null = null;
    let targetSocId: number | string | null = null;

    if (level === 'Apartment') {
      targetSocId = societyId ?? null;
    } else if (level === 'Wing') {
      targetWingId = targetWingDetailId ?? selectedWingDetailId ?? null;
    } else if (level === 'Unit') {
      targetPropId = null;
      targetWingId = targetWingDetailId ?? selectedWingDetailId ?? null;
    }

    if (!targetPropId && !targetWingId && !targetSocId) return null;

    setIsLoadingGridRecords(true);
    try {
      const res = await getApartmentQcCertificateGridAction(targetPropId, targetWingId, targetSocId);
      if (res.success && res.data) {
        const normalized = normalizeCertificateGridData(res.data);
        setGridItems(normalized);
        const { certificate: match } = getActiveCertificateForLevel(
          normalized,
          level,
          selectedTypeId,
          targetWingDetailId ?? selectedWingDetailId,
          targetUnitPropertyId,
          societyId,
          selectedUnitPropertyIds,
          selectedUnitNumbers
        );
        if (match) {
          setCertificateNumber(match.certificateNumber || '');
          const formattedDate = match.certificateDate
            ? match.certificateDate.includes('T')
              ? match.certificateDate.split('T')[0]
              : match.certificateDate
            : '';
          setCertificateDate(formattedDate);
          setStatus((match.status as CertificateStatus) || 'Active');
        }
        return normalized;
      }
      return null;
    } finally {
      setIsLoadingGridRecords(false);
    }
  }, [level, targetWingDetailId, selectedWingDetailId, societyId, selectedTypeId, targetUnitPropertyId, selectedUnitPropertyIds, selectedUnitNumbers]);

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
    const list = resolvedUnits.filter((unit) => {
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
    return list.sort(naturalUnitSort);
  }, [resolvedUnits, floorFilter, useFilter, unitSearchQuery, naturalUnitSort]);

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

  const toggleAllUnits = useCallback((forceSelect?: boolean) => {
    setSelectedUnitIds((prev) => {
      const next = new Set(prev);
      const shouldSelect = typeof forceSelect === 'boolean' ? forceSelect : !isAllUnitsSelected;
      if (!shouldSelect) {
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
    selectedWingDetailId: targetWingDetailId ?? selectedWingDetailId,
    rawSelectedWingDetailId: selectedWingDetailId,
    targetWingDetailId,
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
    refetchGrid,
  };
}
