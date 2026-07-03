import type {
  DiscountData,
  BuildingPermissionData,
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
        } else if (Array.isArray(rawData)) {
          rawItems = rawData;
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
    const rawItems = Array.isArray(rawData?.items) ? rawData.items : [];

    // Filter to only include active items
    const activeItems = rawItems.filter(
      (item): item is Record<string, unknown> =>
        !!item && typeof item === 'object' && 'isActive' in item && Boolean(item.isActive)
    );

    return {
      items: activeItems.map((item) => ({
        certificateTypeId: Number(item.certificateTypeId),
        certificateTypeName: String(item.certificateTypeName || ''),
        displayOrder: Number(item.displayOrder || 0),
        hasCertificate: Boolean(item.hasCertificate),
        propertyCertificateId:
          item.propertyCertificateId != null ? Number(item.propertyCertificateId) : null,
        isActive: Boolean(item.isActive),
        certificateNo: item.certificateNo != null ? String(item.certificateNo) : null,
        issueDate: item.issueDate ? String(item.issueDate) : null,
        documentGuid: item.documentGuid ? String(item.documentGuid) : null,
        fileName: item.fileName ? String(item.fileName) : null,
        documentViewUrl: item.documentGuid ? getViewDocumentUrl(String(item.documentGuid)) : null,
      })),
    };
  },
};
