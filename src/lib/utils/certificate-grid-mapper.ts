export interface CertificateItem {
  rowNumber?: number;
  level: 'Apartment' | 'Wing' | 'Unit' | 'Floor' | string;
  societyDetailId?: number | null;
  wingDetailId?: number | null;
  propertyId?: number | null;
  propertyDetailsId?: number | null;
  applicableToLabel?: string;
  applicableToSubLabel?: string | null;
  unitsCoveredCount?: number | null;
  unitsTotalCount?: number | null;
  unitsMissingCount?: number | null;
  coveredUnitNumbers?: string[];
  certificateTypeId: number;
  certificateTypeCode?: string;
  certificateTypeName?: string;
  certificateDate?: string | null;
  certificateNumber?: string;
  status?: string;
  hasDocument?: boolean;
  documentGuid?: string | null;
}

export interface WingOption {
  wingDetailId: number;
  wingName?: string | null;
  wingNo?: string | null;
}

export interface CertificateGridItems {
  wingCount?: number;
  unitCount?: number;
  societyCertificates?: CertificateItem[];
  wingCertificates?: CertificateItem[];
  unitCertificates?: CertificateItem[];
  floorCertificates?: CertificateItem[];
}

export interface CertificateGridApiResponseData {
  wingCount?: number;
  unitCount?: number;
  records?: CertificateItem[];
  items?: CertificateGridItems | CertificateItem[];
  societyCertificates?: CertificateItem[];
  wingCertificates?: CertificateItem[];
  unitCertificates?: CertificateItem[];
  floorCertificates?: CertificateItem[];
}

function mapRawCertificateItem(item: unknown): CertificateItem {
  if (!item || typeof item !== 'object') return item as CertificateItem;
  const raw = item as Record<string, unknown>;
  const certNo = String(raw.certificateNumber || raw.certificateNo || raw.CertificateNo || raw.CertificateNumber || '');
  return {
    ...(raw as unknown as CertificateItem),
    certificateNumber: certNo,
  };
}

/**
 * Normalizes any structure returned by `/api/ApartmentQC/certificate-grid` into a standard `CertificateGridItems` container.
 */
export function normalizeCertificateGridData(data: unknown): CertificateGridItems {
  if (!data || typeof data !== 'object') {
    return { societyCertificates: [], wingCertificates: [], unitCertificates: [], floorCertificates: [] };
  }

  const raw = data as Record<string, unknown>;

  // Case 1: Response has `items` object
  if (raw.items && typeof raw.items === 'object' && !Array.isArray(raw.items)) {
    const items = raw.items as Record<string, unknown>;
    return {
      wingCount: Number(items.wingCount || raw.wingCount || 0),
      unitCount: Number(items.unitCount || raw.unitCount || 0),
      societyCertificates: Array.isArray(items.societyCertificates) ? (items.societyCertificates as unknown[]).map(mapRawCertificateItem) : [],
      wingCertificates: Array.isArray(items.wingCertificates) ? (items.wingCertificates as unknown[]).map(mapRawCertificateItem) : [],
      unitCertificates: Array.isArray(items.unitCertificates) ? (items.unitCertificates as unknown[]).map(mapRawCertificateItem) : [],
      floorCertificates: Array.isArray(items.floorCertificates) ? (items.floorCertificates as unknown[]).map(mapRawCertificateItem) : [],
    };
  }

  // Case 2: Response directly has top-level `societyCertificates`, `wingCertificates`, etc.
  if (Array.isArray(raw.societyCertificates) || Array.isArray(raw.wingCertificates) || Array.isArray(raw.unitCertificates)) {
    return {
      wingCount: Number(raw.wingCount || 0),
      unitCount: Number(raw.unitCount || 0),
      societyCertificates: Array.isArray(raw.societyCertificates) ? (raw.societyCertificates as unknown[]).map(mapRawCertificateItem) : [],
      wingCertificates: Array.isArray(raw.wingCertificates) ? (raw.wingCertificates as unknown[]).map(mapRawCertificateItem) : [],
      unitCertificates: Array.isArray(raw.unitCertificates) ? (raw.unitCertificates as unknown[]).map(mapRawCertificateItem) : [],
      floorCertificates: Array.isArray(raw.floorCertificates) ? (raw.floorCertificates as unknown[]).map(mapRawCertificateItem) : [],
    };
  }

  // Case 3: Response has a flat `records` or `items` array
  const rawArray = Array.isArray(raw.records) ? raw.records : Array.isArray(raw.items) ? raw.items : Array.isArray(data) ? data : [];
  if (Array.isArray(rawArray) && rawArray.length > 0) {
    const itemsList = (rawArray as unknown[]).map(mapRawCertificateItem);
    return {
      societyCertificates: itemsList.filter((c) => c.level === 'Apartment'),
      wingCertificates: itemsList.filter((c) => c.level === 'Wing'),
      unitCertificates: itemsList.filter((c) => c.level === 'Unit'),
      floorCertificates: itemsList.filter((c) => c.level === 'Floor'),
    };
  }

  return { societyCertificates: [], wingCertificates: [], unitCertificates: [], floorCertificates: [] };
}

/**
 * Extracts all certificate items into a single flat array
 */
export function flattenCertificateRecords(gridItems: CertificateGridItems | null | undefined): CertificateItem[] {
  if (!gridItems) return [];
  return [
    ...(gridItems.societyCertificates || []),
    ...(gridItems.wingCertificates || []),
    ...(gridItems.unitCertificates || []),
    ...(gridItems.floorCertificates || []),
  ];
}

export interface MatchedCertificateResult {
  certificate: CertificateItem | null;
  inheritedFrom: 'Direct' | 'Wing' | 'Apartment' | null;
}

/**
 * Flexible helper to resolve numerical wingDetailId from string name or ID across wings list and grid items
 */
export function findWingDetailId(
  wingValue: string | number | null | undefined,
  wingsList: WingOption[] = [],
  gridItems?: CertificateGridItems | null
): number | null {
  if (!wingValue || wingValue === 'all') return null;

  const valStr = String(wingValue).trim().toLowerCase();
  const valNum = Number(wingValue);

  // 1. Direct numeric match in wingsList
  if (!isNaN(valNum) && valNum > 0) {
    const directMatch = wingsList.find((w) => w.wingDetailId === valNum);
    if (directMatch && directMatch.wingDetailId != null) return directMatch.wingDetailId;
  }

  // 2. Name match in wingsList (exact, "Wing X", "X Wing", or substring)
  const nameMatch = wingsList.find((w) => {
    const name = (w.wingName ?? '').trim().toLowerCase();
    return (
      name === valStr ||
      name === `wing ${valStr}` ||
      name === `${valStr} wing` ||
      name === `block ${valStr}` ||
      name === `${valStr} block` ||
      name.includes(valStr)
    );
  });
  if (nameMatch && nameMatch.wingDetailId != null) return nameMatch.wingDetailId;

  // 3. Match in gridItems.wingCertificates (applicableToLabel or wingDetailId)
  if (gridItems?.wingCertificates) {
    const gridMatch = gridItems.wingCertificates.find((c) => {
      if (!isNaN(valNum) && valNum > 0 && c.wingDetailId === valNum) return true;
      const label = (c.applicableToLabel || '').trim().toLowerCase();
      return (
        label === valStr ||
        label === `wing ${valStr}` ||
        label === `${valStr} wing` ||
        label.includes(valStr)
      );
    });
    if (gridMatch?.wingDetailId) return gridMatch.wingDetailId;
  }

  return !isNaN(valNum) && valNum > 0 ? valNum : null;
}

/**
 * Retrieves the matching certificate for the given UI level, certificateTypeId, wingDetailId, propertyId, and societyId.
 * Hierarchical mapping:
 * - Unit level: strict propertyId match -> wingDetailId match -> societyDetailId match
 * - Wing level: wingDetailId match -> societyDetailId match
 * - Apartment level: societyDetailId match
 */
export function getActiveCertificateForLevel(
  gridItems: CertificateGridItems | null | undefined,
  selectedLevel: 'Apartment' | 'Wing' | 'Unit' | string,
  selectedTypeId: number,
  selectedWingDetailId?: number | null,
  selectedPropertyId?: number | string | null,
  selectedSocietyId?: number | string | null
): MatchedCertificateResult {
  if (!gridItems) return { certificate: null, inheritedFrom: null };

  const { societyCertificates = [], wingCertificates = [], unitCertificates = [] } = gridItems;
  const numericPropId = selectedPropertyId != null && String(selectedPropertyId).trim() !== '' ? Number(selectedPropertyId) : null;
  const numericWingId = selectedWingDetailId != null ? Number(selectedWingDetailId) : null;
  const numericSocietyId = selectedSocietyId != null ? Number(selectedSocietyId) : null;

  // PRIORITY 1: Direct Unit Level Match (highest priority)
  // Check unitCertificates, wingCertificates, or societyCertificates for an explicit matching propertyId
  if (numericPropId != null) {
    const unitMatch = unitCertificates.find(
      (c) => c.certificateTypeId === selectedTypeId && (c.propertyId === numericPropId || c.propertyDetailsId === numericPropId)
    );
    if (unitMatch) return { certificate: unitMatch, inheritedFrom: 'Direct' };

    const wingUnitMatch = wingCertificates.find(
      (c) => c.certificateTypeId === selectedTypeId && (c.propertyId === numericPropId || c.propertyDetailsId === numericPropId)
    );
    if (wingUnitMatch) return { certificate: wingUnitMatch, inheritedFrom: 'Direct' };

    const socUnitMatch = societyCertificates.find(
      (c) => c.certificateTypeId === selectedTypeId && (c.propertyId === numericPropId || c.propertyDetailsId === numericPropId)
    );
    if (socUnitMatch) return { certificate: socUnitMatch, inheritedFrom: 'Direct' };
  }

  // PRIORITY 2: Wing Level Match (second priority)
  if (selectedLevel === 'Wing' || selectedLevel === 'Unit') {
    const wingMatch = wingCertificates.find(
      (c) => c.certificateTypeId === selectedTypeId && (numericWingId != null ? c.wingDetailId === numericWingId || c.wingDetailId == null : true)
    );
    if (wingMatch) {
      return {
        certificate: wingMatch,
        inheritedFrom: selectedLevel === 'Unit' ? 'Wing' : 'Direct',
      };
    }

    const wingUnitMatch = unitCertificates.find(
      (c) =>
        c.certificateTypeId === selectedTypeId &&
        (numericWingId != null ? c.wingDetailId === numericWingId || c.wingDetailId == null : true) &&
        c.propertyId == null
    );
    if (wingUnitMatch) {
      return {
        certificate: wingUnitMatch,
        inheritedFrom: selectedLevel === 'Unit' ? 'Wing' : 'Direct',
      };
    }
  }

  // PRIORITY 3: Apartment / Society Level Match (lowest priority fallback)
  const societyMatch = societyCertificates.find(
    (c) => c.certificateTypeId === selectedTypeId && (numericSocietyId != null ? c.societyDetailId === numericSocietyId || c.societyDetailId == null : true)
  );
  if (societyMatch) {
    return {
      certificate: societyMatch,
      inheritedFrom: selectedLevel === 'Apartment' ? 'Direct' : 'Apartment',
    };
  }

  return { certificate: null, inheritedFrom: null };
}
