import type {
  DiscountData,
  BuildingPermissionData,
  BuildingPermissionItem,
  PropertySocialDetailItem,
} from '@/types/ptis.types';


import { getViewDocumentUrl } from '@/lib/utils/document-utils';

/** Runtime type guard — returns null if data is not a valid object */
function safeRecord(data: unknown): Record<string, unknown> | null {
  return data != null && typeof data === 'object' && !Array.isArray(data) ? data as Record<string, unknown> : null;
}

export const ptisSocialMapper = {
  mapDiscountDetails: (data: unknown): DiscountData => {
    const rawData = safeRecord(data);
    let rawItems: unknown[] = [];
    if (rawData) {
      if (rawData.items && typeof rawData.items === 'object' && !Array.isArray(rawData.items)) {
        const nestedItems = rawData.items as Record<string, unknown>;
        if (Array.isArray(nestedItems.discountAttributes)) {
          rawItems = nestedItems.discountAttributes;
        } else if (Array.isArray(nestedItems.items)) {
          rawItems = nestedItems.items;
        }
      }

      if (rawItems.length === 0) {
        if (Array.isArray(rawData.discountAttributes)) {
          rawItems = rawData.discountAttributes;
        } else if (Array.isArray(rawData.items)) {
          rawItems = rawData.items;
        }
      }
    }

    const activeItems = rawItems.filter(
      (item): item is Record<string, unknown> => !!item && typeof item === 'object'
    );

    return {
      items: activeItems.map((item) => ({
        propertyId: Number(item.propertyId || rawData?.propertyId || 0),
        socialAttributeId: Number(item.socialAttributeId ?? item.id),
        bitValue: typeof item.bitValue === 'boolean' ? item.bitValue : null,
        intValue: item.intValue != null ? Number(item.intValue) : null,
        decimalValue: item.decimalValue != null ? Number(item.decimalValue) : null,
        textValue: item.textValue != null ? String(item.textValue) : null,
        dateValue: item.dateValue != null ? String(item.dateValue) : null,
        documentBindingId: item.documentBindingId != null ? Number(item.documentBindingId) : null,
        remark: item.remark != null ? String(item.remark) : null,
        socialAttributeCode: String(item.socialAttributeCode || ''),
        socialAttributeName: String(item.socialAttributeName || ''),
        id:
          item.propertySocialDetailId != null
            ? Number(item.propertySocialDetailId)
            : Number(item.id),
        isActive: item.isActive !== false,
        createdDate: String(item.createdDate || ''),
        updatedDate: item.updatedDate ? String(item.updatedDate) : null,
        isDiscountApplicable:
          typeof item.isDiscountApplicable === 'boolean'
            ? item.isDiscountApplicable
            : typeof item.isDiscount === 'boolean'
              ? item.isDiscount
              : false,
        documentGuid: item.documentGuid ? String(item.documentGuid) : null,
        percentage: item.percentage != null ? Number(item.percentage) : null,
        amount: item.amount != null ? Number(item.amount) : null,
      })),
    };
  },

  mapSocialDetails: (data: unknown): DiscountData => {
    interface RawSocialAttribute {
      id?: number | string;
      bitValue?: boolean | null;
      intValue?: number | string | null;
      decimalValue?: number | string | null;
      textValue?: string | null;
      dateValue?: string | null;
      documentBindingId?: number | string | null;
      remark?: string | null;
      socialAttributeCode?: string;
      socialAttributeName?: string;
      propertySocialDetailId?: number | string | null;
      isActive?: boolean;
      isDiscountApplicable?: boolean;
      documentGuid?: string | null;
      children?: RawSocialAttribute[];
    }

    const rawData = data as Record<string, unknown> | null;
    const rawAttributes =
      rawData && Array.isArray(rawData.socialAttributes)
        ? (rawData.socialAttributes as RawSocialAttribute[])
        : rawData &&
            rawData.items &&
            typeof rawData.items === 'object' &&
            !Array.isArray(rawData.items) &&
            Array.isArray((rawData.items as Record<string, unknown>).socialAttributes)
          ? ((rawData.items as Record<string, unknown>).socialAttributes as RawSocialAttribute[])
          : [];

    const propertyId = Number(
      rawData?.propertyId ||
        (rawData?.items &&
          typeof rawData.items === 'object' &&
          !Array.isArray(rawData.items) &&
          (rawData.items as Record<string, unknown>).propertyId) ||
        0
    );
    const flatItems: PropertySocialDetailItem[] = [];

    const traverse = (attrs: RawSocialAttribute[]) => {
      for (const attr of attrs) {
        flatItems.push({
          propertyId,
          socialAttributeId: Number(attr.id),
          bitValue: typeof attr.bitValue === 'boolean' ? attr.bitValue : null,
          intValue: attr.intValue != null ? Number(attr.intValue) : null,
          decimalValue: attr.decimalValue != null ? Number(attr.decimalValue) : null,
          textValue: attr.textValue != null ? String(attr.textValue) : null,
          dateValue: attr.dateValue != null ? String(attr.dateValue) : null,
          documentBindingId: attr.documentBindingId != null ? Number(attr.documentBindingId) : null,
          remark: attr.remark != null ? String(attr.remark) : null,
          socialAttributeCode: String(attr.socialAttributeCode || ''),
          socialAttributeName: String(attr.socialAttributeName || ''),
          id: attr.propertySocialDetailId != null ? Number(attr.propertySocialDetailId) : 0,
          isActive: attr.isActive !== false,
          createdDate: '',
          updatedDate: null,
          isDiscountApplicable: attr.isDiscountApplicable === true,
          documentGuid: attr.documentGuid ? String(attr.documentGuid) : null,
        });
        if (Array.isArray(attr.children) && attr.children.length > 0) {
          traverse(attr.children);
        }
      }
    };

    traverse(rawAttributes);

    return {
      items: flatItems,
    };
  },

  mapBuildingPermissionDetails: (data: unknown): BuildingPermissionData => {
    const rawData = safeRecord(data);
    const itemsMap = new Map<string, BuildingPermissionItem>();

    const addCert = (rec: Record<string, unknown>, floorId: number | null = null, floorDesc: string | null = null) => {
      const typeId = Number(rec.certificateTypeId);
      if (!typeId) return;

      const certNo = rec.certificateNo != null ? String(rec.certificateNo) : null;
      const issueDate = rec.issueDate ? String(rec.issueDate) : null;
      const docGuid = rec.documentGuid ? String(rec.documentGuid) : null;
      const hasCert = Boolean(rec.hasCertificate);
      const isActive = rec.isActive !== undefined ? Boolean(rec.isActive) : true;

      const hasAttachedData = hasCert || !!(certNo?.trim() || issueDate?.trim() || docGuid?.trim());

      const propCertId = rec.propertyCertificateId != null ? Number(rec.propertyCertificateId) : null;
      
      // Each attached certificate in DB has a unique propertyCertificateId (e.g. 57, 58, 59, 60, 61).
      // Use propertyCertificateId if available to prevent overwriting multiple certificates of the same type across floors or property-level.
      const uniqueKey = propCertId 
        ? `id-${propCertId}` 
        : `type-${typeId}-floor-${floorId ?? 'prop'}-${docGuid || certNo || issueDate || (hasCert ? 'hasCert' : 'noCert')}`;

      itemsMap.set(uniqueKey, {
        certificateTypeId: typeId,
        certificateTypeName: String(rec.certificateTypeName || ''),
        displayOrder: Number(rec.displayOrder || 0),
        hasCertificate: hasCert || hasAttachedData,
        propertyCertificateId: propCertId,
        isActive: isActive,
        certificateNo: certNo,
        issueDate: issueDate,
        documentGuid: docGuid,
        fileName: rec.fileName ? String(rec.fileName) : null,
        documentViewUrl: docGuid ? getViewDocumentUrl(docGuid) : null,
        propertyDetailsId: floorId,
        floorDescription: floorDesc,
      });
    };

    // 1. Process property-level certificates (types-with-status) FIRST
    const propCertsRaw = rawData?.propertyCertificates ?? data;
    const propRecord = safeRecord(propCertsRaw);
    const rawItems = Array.isArray(propRecord?.items)
      ? propRecord.items
      : Array.isArray(propCertsRaw)
      ? propCertsRaw
      : [];

    for (const item of rawItems) {
      const rec = safeRecord(item);
      if (rec) {
        const propCertId = rec.propertyCertificateId != null ? Number(rec.propertyCertificateId) : null;
        const hasContent = Boolean(rec.hasCertificate || rec.certificateNo || rec.issueDate || rec.documentGuid);
        if (propCertId || hasContent) {
          addCert(rec, null, null);
        }
      }
    }

    // 2. Process floor-level types-with-status SECOND
    // Note: Floor-level cards must ONLY be added if there is a distinct floor certificate record
    // in ptis.PropertyCertificates for that floor (i.e. rec.propertyCertificateId != null or rec.documentGuid != null).
    // If rec.propertyCertificateId is null, the floor is merely inheriting property-wide values for tax calculations,
    // so we do NOT duplicate the property-wide card across all floors.
    if (Array.isArray(rawData?.floorCertificatesWithStatus)) {
      for (const floorGroup of rawData.floorCertificatesWithStatus) {
        const fg = safeRecord(floorGroup);
        if (fg) {
          const fId = fg.propertyDetailsId != null ? Number(fg.propertyDetailsId) : null;
          const fDesc = fg.floorDescription ? String(fg.floorDescription) : null;
          const certs = Array.isArray(fg.certificates) ? fg.certificates : [];

          for (const cert of certs) {
            const rec = safeRecord(cert);
            if (rec) {
              const propCertId = rec.propertyCertificateId != null ? Number(rec.propertyCertificateId) : null;
              const docGuid = rec.documentGuid ? String(rec.documentGuid) : null;
              // Only add floor card if there is an ACTUAL floor-specific certificate entity or attached document for this floor
              if (propCertId != null || docGuid != null) {
                addCert(rec, fId, fDesc);
              }
            }
          }
        }
      }
    }

    return { items: Array.from(itemsMap.values()) };
  },
};
