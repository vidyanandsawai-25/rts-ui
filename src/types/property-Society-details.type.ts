export interface PropertySocietyDetailsApiItem {
  propertyId: number;
  societyDetailId: number | null;
  wingId: number | null;
  wingNo: string | null;
  wingName: string | null;
  societyName: string;
  societyAddress: string;
  secretaryName: string;
  managerName: string;
  landOwnerName: string;
  builderName: string;
  societyNameEnglish: string;
  societyAddressEnglish: string;
  secretaryNameEnglish: string;
  managerNameEnglish: string;
  landOwnerNameEnglish: string;
  builderNameEnglish: string;
  managerMobileNo: string;
  secretaryMobileNo: string;
  societyEmailId: string;
  secretaryEmailId: string;
  managerEmailId: string;
}

export interface PropertySocietyDetailsResponse {
  success: boolean;
  message: string;
  items: PropertySocietyDetailsApiItem;
  errors: any | null;
}

export interface UpdatePropertySocietyDetailsDto {
  propertyId: number;
  societyDetailId: number | null;
  wingId: number | null;
  wingNo: string | null;
  wingName: string | null;
  societyName: string | null;
  societyAddress: string | null;
  secretaryName: string | null;
  managerName: string | null;
  landOwnerName: string | null;
  builderName: string | null;
  societyNameEnglish: string | null;
  societyAddressEnglish: string | null;
  secretaryNameEnglish: string | null;
  managerNameEnglish: string | null;
  landOwnerNameEnglish: string | null;
  builderNameEnglish: string | null;
  managerMobileNo: string | null;
  secretaryMobileNo: string | null;
  societyEmailId: string | null;
  secretaryEmailId: string | null;
  managerEmailId: string | null;
}
