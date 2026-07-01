import {
  createNewTaxationLocal,
  getRegisteredPropertyDetailsLocal,
  getRegisteredPropertyIdsLocal,
  getMockServices,
  requestOtpLocal,
  verifyOtpLocal,
} from "@/lib/mock/ui-only";
import type { Service } from "@/types/service.types";
import type { RegisteredPropertyDetails } from "@/types/propertyMast.types";

export type RequestOtpPayload = { mobile: string };
export type RequestOtpResponse = { message: string; txnId: string; expiresInSeconds: number; demoOtp?: string | null };
export type VerifyOtpPayload = { txnId: string; otp: string };
export type VerifyOtpResponse = { mobile: string; token: string };

export type CreateNewTaxationPayload = Record<string, unknown>;
export type CreateNewTaxationResponse = { id: number; message: string };

export async function getServices(): Promise<Service[]> {
  return getMockServices();
}

export async function requestOtp(mobile: string): Promise<RequestOtpResponse> {
  return requestOtpLocal(mobile);
}

export async function verifyOtp(txnId: string, otp: string): Promise<VerifyOtpResponse> {
  return verifyOtpLocal(txnId, otp);
}

export async function getRegisteredPropertyIds(): Promise<string[]> {
  return getRegisteredPropertyIdsLocal();
}

export async function getRegisteredPropertyDetails(propertyId: string): Promise<RegisteredPropertyDetails> {
  return getRegisteredPropertyDetailsLocal(propertyId);
}

export async function createNewTaxation(payload: CreateNewTaxationPayload): Promise<CreateNewTaxationResponse> {
  return createNewTaxationLocal(payload);
}

export interface CitizenProfile {
  name: string;
  upicId: string;
  propertyNo: string;
  mobile: string;
  ownerId?: number;
}

export interface CitizenProperty {
  ownerId: number;
  upicNo: string;
  ownerNameMarathi: string;
  propertyNo: string;
  mobileNo: string;
  category: string;
  propertyDescription: string;
}

export async function fetchCitizenPropertiesFromApi(
  searchType: 'MobileNo' | 'UpicId' | 'PropertyNo',
  value: string
): Promise<CitizenProperty[]> {
  try {
    const url = 'https://akolamc.in/PropertyTaxMicroService/PropertyTaxApi/Landing/GetCitizensDetails';
    const payload: any = {
      searchType,
      TD: '',
      ServiceId: '',
    };

    if (searchType === 'MobileNo') {
      payload.mobileNo = value;
    } else if (searchType === 'UpicId') {
      payload.upicNo = value;
    } else if (searchType === 'PropertyNo') {
      const parts = value.split('-');
      payload.newWardNo = parts[0] || '';
      payload.newPropertyNo = parts[1] || '';
      payload.partitionNo = parts[2] || '';
      
      // Alternate casing matching stored procedure parameters
      payload.NewWardNo = parts[0] || '';
      payload.NewPropertyNo = parts[1] || '';
      payload.PartitionNo = parts[2] || '';
    }

    console.log(`[API] Fetching properties for ${searchType}: ${value}`);
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      console.error(`[API] GetCitizensDetails API error: HTTP status ${res.status}`);
      return [];
    }

    const data = await res.json();
    console.log('[API] GetCitizensDetails API response loaded.');

    let list: any[] = [];
    if (Array.isArray(data)) {
      list = data;
    } else if (data && Array.isArray(data.data)) {
      list = data.data;
    } else if (data && Array.isArray(data.result)) {
      list = data.result;
    } else if (data && typeof data === 'object') {
      list = [data];
    }

    return list.map((item) => ({
      ownerId: Number(item.ownerID || item.OwnerID || 0),
      upicNo: String(item.upicNo || item.UpicNo || item.unicdeAddress || item.UnicdeAddress || '').trim(),
      ownerNameMarathi: String(item.ownerNameMarathi || item.OwnerNameMarathi || item.marathiOwnerPrathamNav || item.MarathiOwnerPrathamNav || 'धारक . .').trim(),
      propertyNo: String(item.propertyNo || item.PropertyNo || '').trim(),
      mobileNo: String(item.mobileNo || item.MobileNo || '').trim(),
      category: String(item.category || item.Category || '').trim(),
      propertyDescription: String(item.propertyDescription || item.PropertyDescription || '').trim(),
    }));
  } catch (error) {
    console.error('[API] Error in fetchCitizenPropertiesFromApi:', error);
    return [];
  }
}

export async function getCitizenProfileFromApi(mobile: string): Promise<CitizenProfile | undefined> {
  const properties = await fetchCitizenPropertiesFromApi('MobileNo', mobile);
  if (properties.length > 0) {
    const first = properties[0];
    return {
      name: first.ownerNameMarathi,
      upicId: first.upicNo,
      propertyNo: first.propertyNo,
      mobile: first.mobileNo || mobile,
      ownerId: first.ownerId,
    };
  }
  return undefined;
}
