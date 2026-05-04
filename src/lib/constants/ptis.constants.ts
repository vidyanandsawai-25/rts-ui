import type {
  PropertyDetailsData,
  KYCDetailsData,
  SocietyDetailsData,
  OldDetailsData,
} from '@/types/ptis.types';

/**
 * Default Values for PTIS Property Details
 */
export const defaultPropertyDetails: PropertyDetailsData = {
  division: '',
  wardNo: '',
  blockNo: '',
  propertyNo: '',
  partitionNo: '',
  flatOrShopNo: '',
  upicId: '',
  taxZoneNo: '',
  subZoneNo: '',
  surveyNo: '',
  plotNo: '',
  propertyDescription: '',
  plotArea: '',
  totalCarpetArea: '',
  builtupArea: '',
  category: '',
  wingNo: '',
  wingName: '',
  moujaNo: '',
  moujaDescription: '',
  noOfResidentialToilets: '',
  noOfCommercialToilets: '',
  ownerName: '',
};

/**
 * Default Values for PTIS KYC Details
 */
export const defaultKycDetails: KYCDetailsData = {
  ownerType: '',
  title: '',
  propertyHolderName: '',
  propertyHolderNameMarathi: '',
  occupierName: '',
  occupierNameMarathi: '',
  aadharCardNo: '',
  mobileNumber: '',
  email: '',
  shopName: '',
  address: '',
  wingNo: '',
  flatNo: '',
  shopNo: '',
  buildingName: '',
};

/**
 * Default Values for PTIS Society Details
 */
export const defaultSocietyDetails: SocietyDetailsData = {
  buildingSocietyName: '',
  buildingSocietyNameMarathi: '',
  builderName: '',
  builderNameMarathi: '',
  landOwner: '',
  secretaryName: '',
  secretaryNameMarathi: '',
  secretaryMobileNo: '',
  secretaryEmail: '',
  societyEmail: '',
  societyEmailMain: '',
  ocDate: '',
  ocNumber: '',
  societyAddress: '',
  societyAddressMarathi: '',
  managerName: '',
  managerEmail: '',
  managerMobileNo: '',
};

/**
 * Default Values for PTIS Old Details
 */
export const defaultOldDetails: OldDetailsData = {
  oldZoneName: '',
  oldWardNo: '',
  oldPropertyNo: '',
  oldPartitionNo: '',
  oldEGovernanceNo: '',
  oldPlotArea: '',
  oldPlotNo: '',
  oldRV: '',
  oldCV: '',
  oldALV: '',
  oldPropertyTax: '',
  oldTotalTax: '',
  oldConstructionYear: '',
  oldCarpetAreaSqMeter: '',
  oldCarpetAreaSqFeet: '',
  oldBuiltupAreaSqMeter: '',
  oldBuiltupAreaSqFeet: '',
  oldConstructionTypeId: '',
  oldTypeOfUseId: '',
};
