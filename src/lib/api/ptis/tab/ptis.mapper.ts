import type {
  PropertyDetailsData,
  KYCDetailsData,
  SocietyDetailsData,
  OldDetailsData,
  OldFloorDetailsData,
  KycDetailsApiResponse,
  PropertyBasicDetailsApiResponse,
  SocietyDetailsApiResponse,
  OldDetailsApiResponse,
  OldFloorDetailApiResponse,
  DiscountData,
  BuildingPermissionData,
  PropertySocialDetailItem,
} from '@/types/ptis.types';
import {
  defaultPropertyDetails,
  defaultKycDetails,
  defaultSocietyDetails,
  defaultOldDetails,
} from '@/lib/constants/ptis.constants';
import { getViewDocumentUrl } from '@/lib/utils/document-utils';

export const ptisMapper = {
  mapBasicDetails: (data: PropertyBasicDetailsApiResponse): PropertyDetailsData => {
    return {
      ...defaultPropertyDetails,
      division: data.division || '',
      wardNo: data.wardNo || '',
      propertyNo: data.propertyNo || '',
      partitionNo: data.partitionNo || '',
      flatOrShopNo: data.flatOrShopNo || '',
      upicId: data.upicId || '',
      taxZoneNo: data.taxZoneNo || '',
      subZoneNo: data.subZoneNo || '',
      surveyNo: data.surveyNo || '',
      plotNo: data.plotNo || '',
      propertyDescription: data.propertyDescription || '',
      plotArea: data.plotArea?.toString() || '',
      totalCarpetArea:
        data.totalCarpetAreaSqFeet != null || data.totalCarpetAreaSqMeter != null
          ? `${data.totalCarpetAreaSqFeet != null ? Number(data.totalCarpetAreaSqFeet).toFixed(2) : '0.00'} / ${data.totalCarpetAreaSqMeter != null ? Number(data.totalCarpetAreaSqMeter).toFixed(2) : '0.00'}`
          : '',
      builtupArea:
        data.totalBuiltupAreaSqFeet != null || data.totalBuiltupAreaSqMeter != null
          ? `${data.totalBuiltupAreaSqFeet != null ? Number(data.totalBuiltupAreaSqFeet).toFixed(2) : '0.00'} / ${data.totalBuiltupAreaSqMeter != null ? Number(data.totalBuiltupAreaSqMeter).toFixed(2) : '0.00'}`
          : '',
      category: data.categoryName || '',
      wingNo: data.wingNo || '',
      wingName: data.wingName || '',
      moujaNo: data.moujaId?.toString() || '',
      moujaDescription: data.moujaName || '',
      noOfResidentialToilets: data.noOfResidentialToilets?.toString() || '',
      noOfCommercialToilets: data.noOfCommercialToilets?.toString() || '',
      ownerName: data.ownerName || data.ownerNameEnglish || '',
      categoryId: data.categoryId,
      rateSectionDescription: data.rateSectionDescription || '',
      latitude: data.latitude || null,
      longitude: data.longitude || null,
      constructionYear: data.constructionYear || null,
    };
  },

  mapKycDetails: (data: KycDetailsApiResponse): KYCDetailsData => {
    return {
      ...defaultKycDetails,
      ownerType: data.ownerType || '',
      title: data.ownerTitle || '',
      propertyHolderName: data.ownerName || '',
      propertyHolderNameMarathi: data.ownerName || '',
      propertyHolderNameEnglish: data.ownerNameEnglish || '',
      occupierName: data.occupierName || '',
      occupierNameMarathi: data.occupierName || '',
      occupierNameEnglish: data.occupierNameEnglish || '',
      aadharCardNo: data.adharCardNo || '',
      mobileNumber: data.mobileNo || '',
      email: data.emailId || '',
      shopName: data.flatOrShopName || '',
      shopNameEnglish: data.flatOrShopNameEnglish || '',
      shopNo: data.flatOrShopNo || '',
      address: data.address || '',
      addressEnglish: data.addressEnglish || '',
      buildingName: data.flatOrShopName || '',
      wingNo: data.wingNo || '',
      flatNo: data.flatOrShopNo || '',
      alternateMobileNo: data.alternateMobileNo || '',
      pinCode: data.pinCode || '',
    };
  },

  mapSocietyDetails: (data: SocietyDetailsApiResponse): SocietyDetailsData => {
    return {
      ...defaultSocietyDetails,
      buildingSocietyName: data.societyName || '',
      buildingSocietyNameMarathi: data.societyName || '',
      builderName: data.builderName || '',
      builderNameMarathi: data.builderName || '',
      landOwner: data.landOwnerName || '',
      secretaryName: data.secretaryName || '',
      secretaryNameMarathi: data.secretaryName || '',
      secretaryMobileNo: data.secretaryMobileNo || '',
      secretaryEmail: data.secretaryEmailId || '',
      societyEmail: data.societyEmailId || '',
      societyEmailMain: data.societyEmailId || '',
      ocDate: data.ocDate || '',
      ocNumber: data.ocNumber || '',
      societyAddress: data.societyAddress || '',
      societyAddressMarathi: data.societyAddress || '',
      managerName: data.managerName || '',
      managerEmail: data.managerEmailId || '',
      managerMobileNo: data.managerMobileNo || '',
      societyDetailId: data.societyDetailId,
    };
  },

  mapOldDetails: (data: OldDetailsApiResponse): OldDetailsData => {
    return {
      ...defaultOldDetails,
      oldZoneName: data.oldZoneNo?.toString() || '',
      oldWardNo: (data.oldWardNo as string) || '',
      oldPropertyNo: (data.oldPropertyNo as string) || '',
      oldPartitionNo: (data.oldPartitionNo as string) || '',
      oldEGovernanceNo: (data.oldEgovNo as string) || '',
      oldPlotArea: data.oldPlotArea?.toString() || '',
      oldPlotNo: (data.oldPlotNo as string) || '',
      oldRV: data.oldRV?.toString() || '',
      oldALV: data.oldALV?.toString() || '',
      oldPropertyTax:
        data.oldGeneralTax?.toString() ||
        (data.oldPropertyTax as number | string)?.toString() ||
        '',
      oldTotalTax: data.oldTotalTax?.toString() || '',
      oldConstructionYear: data.oldConstructionYear?.toString() || '',
      oldCarpetAreaSqMeter: data.oldCarpetAreaSqMeter?.toString() || '',
      oldCarpetAreaSqFeet: data.oldCarpetAreaSqFeet?.toString() || '',
      oldBuiltupAreaSqMeter: data.oldBuiltupAreaSqMeter?.toString() || '',
      oldBuiltupAreaSqFeet: data.oldBuiltupAreaSqFeet?.toString() || '',
      oldConstructionArea: data.oldConstructionArea?.toString() || '',
      oldGeneralTax: data.oldGeneralTax?.toString() || '',
    };
  },

  mapOldFloorDetails: (items: OldFloorDetailApiResponse[]): OldFloorDetailsData[] => {
    return items.map((item) => ({
      floor: (item.floorDescription as string) || '',
      subFloor: (item.subFloorDescription as string) || '',
      assessmentYear: (item.oldAssessmentYear as string) || '',
      year: item.constructionYear?.toString() || item.oldConstructionYear?.toString() || '',
      constructionType: (item.constructionTypeDescription as string) || '',
      typeOfUse: (item.typeOfUseDescription as string) || '',
      subType: (item.subTypeOfUseDescription as string) || '',
      carpetArea: `${item.oldCarpetAreaSqFeet ?? item.carpetAreaSqFeet ?? 0} / ${item.oldCarpetAreaSqMeter ?? item.carpetAreaSqMeter ?? 0}`,
      builtupArea: `${item.oldBuiltupAreaSqFeet ?? item.builtupAreaSqFeet ?? 0} / ${item.oldBuiltupAreaSqMeter ?? item.builtupAreaSqMeter ?? 0}`,
    }));
  },

  mapDiscountDetails: (data: unknown): DiscountData => {
    const rawData = data as Record<string, unknown> | null;
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
    const rawData = data as Record<string, unknown> | null;
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
