import { Service } from "@/types/service.types";

export async function getServices(): Promise<Service[]> {
  return [];
}

export type RequestOtpResponse = { message: string; txnId: string; expiresInSeconds: number; demoOtp?: string | null };

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

export async function requestOtp(mobile: string): Promise<RequestOtpResponse> {
  const otp = process.env.NEXT_PUBLIC_LIVE_OTP === 'true'
    ? Math.floor(100000 + Math.random() * 900000).toString()
    : "123456";

  const txnId = `txn_${mobile}_${Date.now()}`;

  const isLive = process.env.NEXT_PUBLIC_LIVE_OTP === 'true';
  if (isLive) {
    // Send SMS via SMS gateway
    const user = process.env.SMS_USER || "payakl";
    const password = process.env.SMS_PASSWORD || "fb05b4a701XX";
    const senderid = process.env.SMS_SENDERID || "AKOLMC";
    const tempid = process.env.SMS_TEMPID || "1707175319753583565";
    const smsText = `Your PTAX Login OTP is ${otp} Akola Municipal Corporation`;

    const url = `http://sms.ptaxcollection.com/sendsms.jsp?user=${user}&password=${password}&senderid=${senderid}&mobiles=${mobile}&sms=${encodeURIComponent(smsText)}&tempid=${tempid}`;

    try {
      const res = await fetch(url);
      if (!res.ok) {
        console.error(`SMS gateway error: HTTP status ${res.status}`);
      } else {
        const responseText = await res.text();
        console.log(`SMS gateway response: ${responseText}`);
      }
    } catch (err) {
      console.error("Error sending SMS:", err);
    }
  }

  return { message: "OTP generated", txnId, expiresInSeconds: 120, demoOtp: otp };
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
