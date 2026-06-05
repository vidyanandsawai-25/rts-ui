import type {
  BuildingPermissionData,
  KYCDetailsData,
  OldDetailsData,
  PropertyDetailsData,
  SocialDetails,
  SocietyDetailsData,
} from './ptis-core.types';

export const defaultPropertyDetails: PropertyDetailsData = {
  division: '',
  wardNo: '',
  blockNo: '',
  propertyNo: '',
  partitionNo: '',
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
  moujaNo: '',
  moujaDescription: '',
};

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

export const defaultSocietyDetails: SocietyDetailsData = {
  buildingSocietyName: '',
  buildingSocietyNameMarathi: '',
  builderName: '',
  builderNameMarathi: '',
  landOwner: '',
  secretaryName: '',
  secretaryNameMarathi: '',
  secretaryMobileNo: '',
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

export const defaultBuildingPermission: BuildingPermissionData = {
  items: [],
};

export const defaultOldDetails: OldDetailsData = {
  oldZoneName: '',
  oldWardNo: '',
  oldPropertyNo: '',
  oldPartitionNo: '',
  oldEGovernanceNo: '',
  oldPlotArea: '',
  oldPlotNo: '',
  oldALV: '',
  oldRV: '',
  oldCV: '',
  oldPropertyTax: '',
  oldTotalTax: '',
  oldConstructionYear: '',
  oldCarpetAreaSqMeter: '',
  oldCarpetAreaSqFeet: '',
  oldRegistration: false,
  oldConstructionTypeId: '',
  oldTypeOfUseId: '',
};

export const defaultSocialDetails: SocialDetails = {
  residentialToiletCount: '',
  commercialToiletCount: '',
  liftAvailable: false,
  electricConnection: false,
};
