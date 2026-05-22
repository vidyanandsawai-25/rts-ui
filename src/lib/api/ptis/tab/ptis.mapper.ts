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
} from '@/types/ptis.types';
import {
  defaultPropertyDetails,
  defaultKycDetails,
  defaultSocietyDetails,
  defaultOldDetails,
} from '@/lib/constants/ptis.constants';

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
      totalCarpetArea: data.totalCarpetAreaSqMeter?.toString() || '',
      builtupArea: data.totalBuiltupAreaSqMeter?.toString() || '',
      category: data.categoryName || '',
      wingNo: data.wingNo || '',
      wingName: data.wingName || '',
      moujaNo: data.moujaId?.toString() || '',
      moujaDescription: data.moujaName || '',
      noOfResidentialToilets: data.noOfResidentialToilets?.toString() || '',
      noOfCommercialToilets: data.noOfCommercialToilets?.toString() || '',
      ownerName: data.ownerName || data.ownerNameEnglish || '',
    };
  },

  mapKycDetails: (data: KycDetailsApiResponse): KYCDetailsData => {
    return {
      ...defaultKycDetails,
      ownerType: data.ownerType || '',
      title: data.ownerTitle || '',
      propertyHolderName: data.ownerName || '',
      // TODO: [API-CONTRACT] Marathi name not in KYC API response; using English as fallback.
      propertyHolderNameMarathi: data.ownerName || '',
      occupierName: data.occupierName || '',
      // TODO: [API-CONTRACT] Marathi occupier name not in KYC API response; using English as fallback.
      occupierNameMarathi: data.occupierName || '',
      aadharCardNo: data.adharCardNo || '',
      mobileNumber: data.mobileNo || '',
      email: data.emailId || '',
      shopName: data.flatOrShopName || '',
      shopNo: data.flatOrShopNo || '',
      address: data.address || '',
      // TODO: [API-CONTRACT] buildingName not directly available; using flatOrShopName as fallback.
      buildingName: data.flatOrShopName || '',
      wingNo: data.wingNo || '',
      flatNo: data.flatOrShopNo || '',
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
      oldPropertyTax: (data.oldPropertyTax as number | string)?.toString() || '',
      oldTotalTax: data.oldTotalTax?.toString() || '',
      oldConstructionYear: data.oldConstructionYear?.toString() || '',
      oldCarpetAreaSqMeter: data.oldCarpetAreaSqMeter?.toString() || '',
      oldCarpetAreaSqFeet: data.oldCarpetAreaSqFeet?.toString() || '',
      oldBuiltupAreaSqMeter: data.oldBuiltupAreaSqMeter?.toString() || '',
      oldBuiltupAreaSqFeet: data.oldBuiltupAreaSqFeet?.toString() || '',
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
      carpetArea: `${(item.carpetAreaSqFeet as number) || 0} / ${(item.carpetAreaSqMeter as number) || 0}`,
      builtupArea: `${(item.builtupAreaSqFeet as number) || 0} / ${(item.builtupAreaSqMeter as number) || 0}`,
    }));
  },
};
