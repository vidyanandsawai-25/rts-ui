import { PagedResponse } from "./common.types";

export interface SocietyDetailItem {
  propertyId: number;
  wingId: number;
  wingName: string;
  societyName: string;
  societyAddress: string;
  secretaryName: string;
  managerName: string;
  landOwnerName: string;
  builderName: string;
  secretaryNameEnglish: string;
  societyNameEnglish: string;
  societyAddressEnglish: string;
  managerNameEnglish: string;
  landOwnerNameEnglish: string;
  builderNameEnglish: string;
  managerMobileNo: string;
  secretaryMobileNo: string;
  societyEmailId: string;
  secretaryEmailId: string;
  managerEmailId: string;
  markedForDeletion: boolean;
  id: number;
  isActive: boolean;
  createdDate: string;
  updatedDate: string | null;
}

export type SocietyDetailsListResponse = PagedResponse<SocietyDetailItem>;

export interface CreateSocietyDetailPayload {
  isActive: boolean;
  createdBy: number;
  propertyId: number;
  wingId: number;
  wingName: string;
}
