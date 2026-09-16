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
  coveredPropertyIds?: number[];
  certificateTypeId: number;
  certificateTypeCode?: string;
  certificateTypeName?: string;
  certificateDate?: string | null;
  certificateNumber?: string;
  status?: string;
  propertyCertificateId?: number | null;
  hasDocument?: boolean;
  documentGuid?: string | null;
  fileName?: string | null;
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
  const certDate = (raw.certificateDate || raw.CertificateDate || raw.issueDate || raw.IssueDate || raw.date || raw.Date) as string | null | undefined;
  const certTypeId = Number(raw.certificateTypeId || raw.CertificateTypeId || raw.typeId || raw.TypeId || 0);
  const docGuid = (raw.documentGuid || raw.DocumentGuid || raw.guid || raw.Guid || raw.documentId || raw.DocumentId) as string | null | undefined;
  const hasDoc = Boolean(raw.hasDocument || raw.HasDocument || raw.hasDocumentBinding || raw.HasDocumentBinding || (docGuid && String(docGuid).trim().length > 0 && String(docGuid).toLowerCase() !== 'null'));
  const docName = (raw.fileName || raw.FileName || raw.documentName || raw.DocumentName || raw.name || raw.Name) as string | null | undefined;
  const level = String(raw.level || raw.Level || 'Apartment');
  const rawUnitNos = raw.coveredUnitNumbers || raw.CoveredUnitNumbers;
  const coveredUnitNos = Array.isArray(rawUnitNos) ? (rawUnitNos as string[]) : [];
  const rawPropIds = raw.coveredPropertyIds || raw.CoveredPropertyIds;
  const coveredPropIds = Array.isArray(rawPropIds) ? (rawPropIds as number[]) : [];

  return {
    ...(raw as unknown as CertificateItem),
    level: level as CertificateItem['level'],
    certificateTypeId: certTypeId || (raw.certificateTypeId as number),
    certificateNumber: certNo,
    certificateDate: certDate ? String(certDate) : (raw.certificateDate as string | null | undefined),
    propertyCertificateId:
      raw.propertyCertificateId != null
        ? Number(raw.propertyCertificateId)
        : raw.PropertyCertificateId != null
          ? Number(raw.PropertyCertificateId)
          : raw.id != null
            ? Number(raw.id)
            : raw.Id != null
              ? Number(raw.Id)
              : undefined,
    hasDocument: hasDoc,
    documentGuid: docGuid ? String(docGuid) : (raw.documentGuid as string | null | undefined),
    fileName: docName ? String(docName) : (raw.fileName as string | null | undefined),

    wingDetailId: raw.wingDetailId != null ? Number(raw.wingDetailId) : raw.WingDetailId != null ? Number(raw.WingDetailId) : (raw.wingDetailId as number | null | undefined),
    societyDetailId: raw.societyDetailId != null ? Number(raw.societyDetailId) : raw.SocietyDetailId != null ? Number(raw.SocietyDetailId) : (raw.societyDetailId as number | null | undefined),
    propertyId: raw.propertyId != null ? Number(raw.propertyId) : raw.PropertyId != null ? Number(raw.PropertyId) : (raw.propertyId as number | null | undefined),
    propertyDetailsId: raw.propertyDetailsId != null ? Number(raw.propertyDetailsId) : raw.PropertyDetailsId != null ? Number(raw.PropertyDetailsId) : (raw.propertyDetailsId as number | null | undefined),
    coveredUnitNumbers: coveredUnitNos,
    coveredPropertyIds: coveredPropIds,
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

export type UnitCertificateStatusType = 'direct' | 'wing' | 'apartment' | 'none';

export interface UnitStatusResolution {
  status: UnitCertificateStatusType;
  certificate: CertificateItem | null;
  certificateNumber?: string;
  certificateDate?: string | null;
  hasDocument?: boolean;
  documentGuid?: string | null;
  fileName?: string | null;
}

/**
 * Resolves the certificate status for an individual unit given the hierarchical grid items.
 */
export function resolveUnitCertificateStatus(
  gridItems: CertificateGridItems | null | undefined,
  certificateTypeId: number,
  unit: { propertyId?: number | null; propertyDetailsId?: number | null; unitNo?: string | null; wingDetailId?: number | null },
  societyId?: number | null
): UnitStatusResolution {
  if (!gridItems) {
    return { status: 'none', certificate: null };
  }

  const { societyCertificates = [], wingCertificates = [], unitCertificates = [] } = gridItems;
  const propId = unit.propertyId != null ? Number(unit.propertyId) : null;
  const propDetailsId = unit.propertyDetailsId != null ? Number(unit.propertyDetailsId) : null;
  const unitNumber = (unit.unitNo || '').trim().toLowerCase();
  const wingId = unit.wingDetailId != null ? Number(unit.wingDetailId) : null;
  const socId = societyId != null ? Number(societyId) : null;

  // 1. Direct Unit Match
  const directMatch = unitCertificates.find((c) => {
    if (c.certificateTypeId !== certificateTypeId) return false;
    if (propId != null && (c.propertyId === propId || c.coveredPropertyIds?.includes(propId))) return true;
    if (propDetailsId != null && (c.propertyDetailsId === propDetailsId || c.coveredPropertyIds?.includes(propDetailsId))) return true;
    if (unitNumber && c.coveredUnitNumbers?.some((num) => num.trim().toLowerCase() === unitNumber)) return true;
    return false;
  });

  if (directMatch) {
    return {
      status: 'direct',
      certificate: directMatch,
      certificateNumber: directMatch.certificateNumber,
      certificateDate: directMatch.certificateDate,
      hasDocument: directMatch.hasDocument,
      documentGuid: directMatch.documentGuid,
      fileName: directMatch.fileName,
    };
  }

  // 2. Wing Inherited Match
  const wingMatch = wingCertificates.find((c) => {
    if (c.certificateTypeId !== certificateTypeId) return false;
    if (wingId != null && (c.wingDetailId === wingId || c.wingDetailId == null)) return true;
    return false;
  });

  if (wingMatch && (wingMatch.certificateNumber || wingMatch.hasDocument || wingMatch.status === 'Active')) {
    return {
      status: 'wing',
      certificate: wingMatch,
      certificateNumber: wingMatch.certificateNumber,
      certificateDate: wingMatch.certificateDate,
      hasDocument: wingMatch.hasDocument,
      documentGuid: wingMatch.documentGuid,
      fileName: wingMatch.fileName,
    };
  }

  // 3. Society / Apartment Inherited Match
  const societyMatch = societyCertificates.find((c) => {
    if (c.certificateTypeId !== certificateTypeId) return false;
    if (socId != null && (c.societyDetailId === socId || c.societyDetailId == null)) return true;
    return true;
  });

  if (societyMatch && (societyMatch.certificateNumber || societyMatch.hasDocument || societyMatch.status === 'Active')) {
    return {
      status: 'apartment',
      certificate: societyMatch,
      certificateNumber: societyMatch.certificateNumber,
      certificateDate: societyMatch.certificateDate,
      hasDocument: societyMatch.hasDocument,
      documentGuid: societyMatch.documentGuid,
      fileName: societyMatch.fileName,
    };
  }

  return { status: 'none', certificate: null };
}

/**
 * Retrieves the matching certificate for the given UI level, certificateTypeId, wingDetailId, propertyId, and societyId.
 * Hierarchical mapping:
 * - Unit level: strict propertyId/selectedPropertyIds match -> wingDetailId match -> societyDetailId match
 * - Wing level: wingDetailId match -> societyDetailId match
 * - Apartment level: societyDetailId match
 */
export function getActiveCertificateForLevel(
  gridItems: CertificateGridItems | null | undefined,
  selectedLevel: 'Apartment' | 'Wing' | 'Unit' | string,
  selectedTypeId: number,
  selectedWingDetailId?: number | null,
  selectedPropertyId?: number | string | null,
  selectedSocietyId?: number | string | null,
  selectedPropertyIds?: (number | string)[] | null,
  selectedUnitNumbers?: string[] | null
): MatchedCertificateResult {
  if (!gridItems) return { certificate: null, inheritedFrom: null };

  const { societyCertificates = [], wingCertificates = [], unitCertificates = [] } = gridItems;
  const numericPropId = selectedPropertyId != null && String(selectedPropertyId).trim() !== '' ? Number(selectedPropertyId) : null;
  const numericWingId = selectedWingDetailId != null ? Number(selectedWingDetailId) : null;
  const numericSocietyId = selectedSocietyId != null ? Number(selectedSocietyId) : null;

  // PRIORITY 1: Direct Unit Level Match (highest priority when at Unit level)
  if (selectedLevel === 'Unit') {
    const propIdList: number[] = [];
    if (numericPropId != null) propIdList.push(numericPropId);
    if (Array.isArray(selectedPropertyIds)) {
      selectedPropertyIds.forEach((id) => {
        const num = Number(id);
        if (!isNaN(num) && num > 0 && !propIdList.includes(num)) {
          propIdList.push(num);
        }
      });
    }

    const unitNumberList = (selectedUnitNumbers || []).map((n) => String(n).trim().toLowerCase());

    if (propIdList.length > 0 || unitNumberList.length > 0) {
      const unitMatch = unitCertificates.find((c) => {
        if (c.certificateTypeId !== selectedTypeId) return false;
        if (c.propertyId != null && propIdList.includes(c.propertyId)) return true;
        if (c.propertyDetailsId != null && propIdList.includes(c.propertyDetailsId)) return true;
        if (c.coveredPropertyIds && c.coveredPropertyIds.some((id) => propIdList.includes(id))) return true;
        if (c.coveredUnitNumbers && c.coveredUnitNumbers.some((num) => unitNumberList.includes(String(num).trim().toLowerCase()))) return true;
        return false;
      });
      if (unitMatch) return { certificate: unitMatch, inheritedFrom: 'Direct' };

      const wingUnitMatch = wingCertificates.find((c) => {
        if (c.certificateTypeId !== selectedTypeId) return false;
        if (c.propertyId != null && propIdList.includes(c.propertyId)) return true;
        if (c.propertyDetailsId != null && propIdList.includes(c.propertyDetailsId)) return true;
        if (c.coveredPropertyIds && c.coveredPropertyIds.some((id) => propIdList.includes(id))) return true;
        return false;
      });
      if (wingUnitMatch) return { certificate: wingUnitMatch, inheritedFrom: 'Direct' };

      const socUnitMatch = societyCertificates.find((c) => {
        if (c.certificateTypeId !== selectedTypeId) return false;
        if (c.propertyId != null && propIdList.includes(c.propertyId)) return true;
        if (c.propertyDetailsId != null && propIdList.includes(c.propertyDetailsId)) return true;
        if (c.coveredPropertyIds && c.coveredPropertyIds.some((id) => propIdList.includes(id))) return true;
        return false;
      });
      if (socUnitMatch) return { certificate: socUnitMatch, inheritedFrom: 'Direct' };
    }
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
