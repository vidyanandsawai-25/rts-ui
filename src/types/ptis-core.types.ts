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

export interface BuildingPermissionData {
  completionCertificate: boolean;
  completionCertificateNumber: string;
  completionCertificateDate: string;
  completionCertificateDoc: string;
  completionCertificateDocData: string;
  completionCertificateDocType: string;
  occupancyCertificate: boolean;
  occupancyCertificateNumber: string;
  occupancyCertificateDate: string;
  occupancyCertificateDoc: string;
  occupancyCertificateDocData: string;
  occupancyCertificateDocType: string;
  possessionCertificate: boolean;
  possessionCertificateNumber: string;
  possessionCertificateDate: string;
  possessionCertificateDoc: string;
  possessionCertificateDocData: string;
  possessionCertificateDocType: string;
  index2: boolean;
  index2Number: string;
  index2Date: string;
  index2Doc: string;
  index2DocData: string;
  index2DocType: string;
  electricBill: boolean;
  electricBillNumber: string;
  electricBillDate: string;
  electricBillDoc: string;
  electricBillDocData: string;
  electricBillDocType: string;
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
export interface DiscountData {
  flags: {
    solarPanel: boolean;
    rainwater: boolean;
    waste: boolean;
    evCharging: boolean;
    solarWater: boolean;
    solarElectric: boolean;
    wasteDisposal: boolean;
    fireFighting: boolean;
    greenProperty: boolean;
    womanOwner: boolean;
    exServiceman: boolean;
  };
  amounts: {
    solarPanel: string;
    rainwater: string;
    waste: string;
    evCharging: string;
    solarWater: string;
    solarElectric: string;
    wasteDisposal: string;
    fireFighting: string;
    greenProperty: string;
    womanOwner: string;
    exServiceman: string;
  };
  percentages: {
    solarPanel: string;
    rainwater: string;
    waste: string;
    evCharging: string;
    solarWater: string;
    solarElectric: string;
    wasteDisposal: string;
    fireFighting: string;
    greenProperty: string;
    womanOwner: string;
    exServiceman: string;
  };
  documents: Record<string, string>;
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