export interface CreatePropertyResponse {
  id: string;
  propertyNo: string;
  message: string;
}

export interface WardResponse {
  wardID: string;
  wardNo: string;
  description?: string | null;
  zoneId?: number | null;
  createdDate?: string | null;
  updatedDate?: string | null;
}

export interface CategoryResponse {
  category: string;
  createdDate?: string | null;
  updatedDate?: string | null;
}

export interface SubCategoryResponse {
  subCategory: string;
  subCategoryType: string;
  createdDate?: string | null;
  updatedDate?: string | null;
}

export interface OwnerTypeResponse {
  ownerType: string;
  ownerTypeEnglish: string;
  createdDate?: string | null;
  updatedDate?: string | null;
}

export interface OwnerTitleResponse {
  ownerTitle: string;
  createdDate?: string | null;
  updatedDate?: string | null;
}

export interface ConstructionTypeResponse {
  constructionId: string;
  description: string;
  descriptionEnglish?: string | null;
  groupID?: string | null;
  keyboardShortCutKey?: string | null;
  keyWiseSequence?: number | null;
  createdDate?: string | null;
  updatedDate?: string | null;
}

export interface TypeOfUseResponse {
  typeOfUseID: string;
  description: string;
  createdDate?: string | null;
  updatedDate?: string | null;
}

export interface FloorResponse {
  floorID: string;
  description?: string | null;
  sequenceNo?: number | null;
  descriptionEnglish?: string | null;
  maxFloorNo?: number | null;
  createdDate?: string | null;
  updatedDate?: string | null;
}

export interface PropertyBasicDetailsApiResponse {
  propertyId: number;
  wardId: number;
  wardNo: string;
  zoneId: number;
  division: string;
  propertyNo: string;
  partitionNo: string;
  flatOrShopNo: string;
  plotNo: string;
  surveyNo: string;
  taxZoneId: number;
  taxZoneNo: string;
  categoryId: number;
  categoryName: string;
  subCategoryId?: number;
  subCategoryName?: string;
  propertyTypeId: number;
  propertyDescription: string;
  upicId: string;
  subZoneNo: string;
  wingNo: string;
  noOfResidentialToilets: number;
  noOfCommercialToilets: number;
  totalCarpetAreaSqMeter: number;
  totalBuiltupAreaSqMeter: number;
  totalCarpetAreaSqFeet: number;
  totalBuiltupAreaSqFeet: number;
  plotArea: number;
  plotAreaFtLength: number;
  plotAreaFtWidth: number;
  plotAreaMtrLength: number;
  plotAreaMtrWidth: number;
  wingId: number;
  wingName: string;
}
