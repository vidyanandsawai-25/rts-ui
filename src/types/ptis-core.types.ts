export interface PropertyDetailsData {
  division: string;
  wardNo: string;
  blockNo: string;
  propertyNo: string;
  partitionNo: string;
  upicId: string;
  taxZoneNo: string;
  subZoneNo: string;
  surveyNo: string;
  plotNo: string;
  propertyDescription: string;
  plotArea: string;
  totalCarpetArea: string;
  builtupArea: string;
  category?: string;
  wingNo?: string;
  moujaNo?: string;
  moujaDescription?: string;
}

export interface KYCDetailsData {
  ownerType: string;
  title: string;
  propertyHolderName: string;
  propertyHolderNameMarathi: string;
  occupierName: string;
  occupierNameMarathi: string;
  aadharCardNo: string;
  mobileNumber: string;
  email: string;
  shopName: string;
  address: string;
  wingNo: string;
  flatNo: string;
  shopNo: string;
  buildingName?: string;
}
export interface SocietyDetailsData {
  buildingSocietyName: string;
  buildingSocietyNameMarathi: string;
  builderName: string;
  builderNameMarathi: string;
  landOwner: string;
  secretaryName: string;
  secretaryNameMarathi: string;
  secretaryMobileNo: string;
  societyEmail: string;
  societyEmailMain: string;
  ocDate: string;
  ocNumber: string;
  societyAddress: string;
  societyAddressMarathi: string;
  managerName: string;
  managerEmail: string;
  managerMobileNo: string;
}

export interface BuildingPermissionItem {
  certificateTypeId: number;
  certificateTypeName: string;
  displayOrder: number;
  hasCertificate: boolean;
  propertyCertificateId: number | null;
  isActive: boolean;
  certificateNo: string | null;
  issueDate: string | null;
  documentGuid: string | null;
  fileName: string | null;
  documentViewUrl?: string | null;
}

export interface BuildingPermissionData {
  items: BuildingPermissionItem[];
}
export interface OldDetailsData {
  oldZoneName: string;
  oldWardNo: string;
  oldPropertyNo: string;
  oldPartitionNo: string;
  oldEGovernanceNo: string;
  oldPlotArea: string;
  oldPlotNo: string;
  oldRV: string;
  oldCV: string;
  oldALV: string;
  oldPropertyTax: string;
  oldTotalTax: string;
  oldConstructionYear?: string;
  oldCarpetAreaSqMeter?: string;
  oldCarpetAreaSqFeet?: string;
  oldRegistration?: boolean;
  oldConstructionTypeId?: string;
  oldTypeOfUseId?: string;
  oldConstructionArea?: string;
  oldGeneralTax?: string;
}
export interface OldFloorDetailsData {
  floor: string;
  year: string;
  constructionType: string;
  typeOfUse: string;
  carpetAreaSqFt: string;
  carpetAreaSqMtr: string;
  registration: string;
}

export interface OldFloorFormData {
  floor: string;
  year: string;
  constructionType: string;
  typeOfUse: string;
  carpetAreaSqFt: string;
  autoCalculate: string;
  registration: boolean;
}
export interface SocialDetails {
  residentialToiletCount: string;
  commercialToiletCount: string;
  liftAvailable: boolean;
  electricConnection: boolean;
}
export interface PropertySocialDetailItem {
  propertyId: number;
  socialAttributeId: number;
  bitValue: boolean | null;
  intValue: number | null;
  decimalValue: number | null;
  textValue: string | null;
  dateValue: string | null;
  documentBindingId: number | null;
  remark: string | null;
  socialAttributeCode: string;
  socialAttributeName: string;
  id: number;
  isActive: boolean;
  createdDate: string;
  updatedDate: string | null;
}

export interface DiscountData {
  items: PropertySocialDetailItem[];
}
export interface PropertyData {
  id: string;
  propertyDetails: PropertyDetailsData;
  oldDetails: unknown;
  kycDetails: KYCDetailsData;
  societyDetails: SocietyDetailsData;
  buildingPermission: BuildingPermissionData;
  discountData: DiscountData;
  createdAt: string;
  updatedAt: string;
}
export interface PtisTaxDetail {
  taxId: number;
  taxName: string;
  percentage: number;
  amount: number;
}
