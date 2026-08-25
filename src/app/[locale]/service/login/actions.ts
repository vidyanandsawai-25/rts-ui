'use server';

import { cookies } from 'next/headers';
import { requestOtp } from '@/lib/api/otp.service';
import { fetchCitizenPropertiesFromApi, type CitizenProperty } from '@/lib/api/citizen-property.service';
import {
  getCitizenLoginNodes,
  getCitizenLoginSectors,
} from '@/lib/api/rts/rtscitizenlogin.service';
import { createRtsCitizenSession, logoutRtsCitizenSession } from '@/lib/api/rts/rtscitizensession.service';
import { resolveExternalServiceNavigation } from '@/lib/utils/rts/external-service-application';

const OTP_TTL_MS = 2 * 60 * 1000;

export type CitizenLoginActionResult = {
  success: boolean;
  error?: string;
  directLogin?: boolean;
  txnId?: string;
  demoOtp?: string | null;
  maskedPhone?: string;
  citizen?: {
    name: string;
    upicId: string;
    propertyNo: string;
    mobile: string;
    ownerId: number;
  };
  externalDestination?: string | null;
  serviceRedirectError?: string | null;
};

async function establishCitizenSession(
  mobile: string,
  c: any,
  fallbackProfile?: { name?: string; upicId?: string; propertyNo?: string; ownerId?: number },
  externalServiceId?: string
): Promise<CitizenLoginActionResult> {
  const selectedOwnerIdStr = c.get('rts_selected_owner_id')?.value;
  const targetOwnerId = selectedOwnerIdStr ? Number(selectedOwnerIdStr) : (fallbackProfile?.ownerId || 0);

  // Fetch citizen details from dynamic API
  let citizenProfile = {
    name: fallbackProfile?.name || 'नागरिक',
    upicId: fallbackProfile?.upicId || '',
    propertyNo: fallbackProfile?.propertyNo || '',
    mobile: mobile,
    ownerId: targetOwnerId,
  };

  let properties: CitizenProperty[] = [];

  try {
    properties = await fetchCitizenPropertiesFromApi('MobileNo', mobile);
    if (properties.length > 0) {
      const selected = (targetOwnerId > 0 ? properties.find((p) => p.ownerId === targetOwnerId) : null) || properties[0];
      citizenProfile = {
        name: selected.ownerNameMarathi || citizenProfile.name,
        upicId: selected.upicNo || citizenProfile.upicId,
        propertyNo: selected.propertyNo || citizenProfile.propertyNo,
        mobile: selected.mobileNo || mobile,
        ownerId: selected.ownerId || citizenProfile.ownerId,
      };
    }
  } catch (err) {
    console.error("Failed to fetch citizen profile during login:", err);
  }

  const sessionId = crypto.randomUUID();

  try {
    await createRtsCitizenSession({
      isActive: true,
      createdBy: 0,
      sessionId,
      citizenName: citizenProfile.name,
      mobileNo: citizenProfile.mobile,
      upic: citizenProfile.upicId,
      propertyNo: citizenProfile.propertyNo,
      ownerId: citizenProfile.ownerId,
    });
  } catch (err) {
    console.error("Failed to create RTS citizen session in backend:", err);
  }

  c.set('rts_session', sessionId, {
    httpOnly: true,
    sameSite: 'lax',
    secure: false,
    path: '/',
    maxAge: 24 * 60 * 60,
  });

  c.set('rts_logged_in', 'true', {
    httpOnly: false,
    sameSite: 'lax',
    secure: false,
    path: '/',
    maxAge: 24 * 60 * 60,
  });

  c.set('rts_citizen_profile', JSON.stringify(citizenProfile), {
    httpOnly: true,
    sameSite: 'lax',
    secure: false,
    path: '/',
    maxAge: 24 * 60 * 60,
  });

  if (properties.length > 0) {
    c.set('rts_citizen_properties', JSON.stringify(properties), {
      httpOnly: true,
      sameSite: 'lax',
      secure: false,
      path: '/',
      maxAge: 24 * 60 * 60,
    });
  }

  c.delete('rts_login_mobile');
  c.delete('rts_otp_txn');
  c.delete('rts_otp_code');
  c.delete('rts_otp_expires_at');
  c.delete('rts_selected_owner_id');

  const requestedServiceId = Number(externalServiceId);
  if (!Number.isInteger(requestedServiceId) || requestedServiceId <= 0) {
    return { success: true, citizen: citizenProfile, externalDestination: null, serviceRedirectError: null };
  }

  const navigation = await resolveExternalServiceNavigation(requestedServiceId, citizenProfile.upicId);

  if (!navigation.success) {
    return { success: true, citizen: citizenProfile, externalDestination: null, serviceRedirectError: navigation.errorCode };
  }

  return { success: true, citizen: citizenProfile, externalDestination: navigation.destination, serviceRedirectError: null };
}

export async function searchCitizenPropertiesAction(
  method: 'mobile' | 'upic' | 'property',
  payload: { mobile?: string; upicId?: string; propertyNo?: string }
): Promise<{ success: boolean; properties?: CitizenProperty[]; mobile?: string; error?: string }> {
  let searchValue = '';
  let searchType: 'MobileNo' | 'UpicId' | 'PropertyNo' = 'MobileNo';

  if (method === 'mobile') {
    searchValue = payload.mobile?.replace(/\D/g, '') || '';
    if (!/^\d{10}$/.test(searchValue)) {
      return { success: false, error: 'कृपया वैध १०-अंकी मोबाईल नंबर प्रविष्ट करा. / Please enter a valid 10-digit phone number.' };
    }
    searchType = 'MobileNo';
  } else if (method === 'upic') {
    searchValue = payload.upicId?.trim() || '';
    if (!searchValue) {
      return { success: false, error: 'कृपया युपीआयसी आयडी (UPIC ID) प्रविष्ट करा. / Please enter a UPIC ID.' };
    }
    searchType = 'UpicId';
  } else if (method === 'property') {
    searchValue = payload.propertyNo?.trim() || '';
    if (!searchValue) {
      return { success: false, error: 'कृपया मालमत्ता क्रमांक प्रविष्ट करा. / Please enter a Property Number.' };
    }
    searchType = 'PropertyNo';
  }

  try {
    const properties = await fetchCitizenPropertiesFromApi(searchType, searchValue);
    if (!properties || properties.length === 0) {
      return {
        success: false,
        error: method === 'mobile'
          ? 'हा मोबाईल नंबर नोंदणीकृत नाही. कृपया नोंदणीकृत मोबाईल नंबर प्रविष्ट करा. / This mobile number is not registered with any property.'
          : method === 'upic'
          ? 'हा UPIC आयडी नोंदणीकृत नाही. कृपया बरोबर UPIC आयडी प्रविष्ट करा. / This UPIC ID is not registered.'
          : 'हा मालमत्ता क्रमांक नोंदणीकृत नाही. कृपया बरोबर मालमत्ता क्रमांक प्रविष्ट करा. / This Property Number is not registered.',
      };
    }

    const mobile = properties[0].mobileNo || (method === 'mobile' ? searchValue : '');

    let allProperties = properties;
    if (searchType !== 'MobileNo' && mobile && /^\d{10}$/.test(mobile)) {
      try {
        const fullList = await fetchCitizenPropertiesFromApi('MobileNo', mobile);
        if (fullList && fullList.length > 0) {
          allProperties = fullList;
        }
      } catch {}
    }

    return {
      success: true,
      properties: allProperties,
      mobile,
    };
  } catch (err: any) {
    return { success: false, error: err?.message || 'मालमत्ता शोधण्यात अडचण आली. कृपया पुन्हा प्रयत्न करा.' };
  }
}

export async function sendCitizenOtpAction(
  method: 'mobile' | 'upic' | 'property',
  payload: { mobile?: string; upicId?: string; propertyNo?: string },
  _externalServiceId?: string,
  selectedOwnerId?: number
): Promise<CitizenLoginActionResult> {
  let searchValue = '';
  let searchType: 'MobileNo' | 'UpicId' | 'PropertyNo' = 'MobileNo';

  if (method === 'mobile') {
    searchValue = payload.mobile?.replace(/\D/g, '') || '';
    if (!/^\d{10}$/.test(searchValue)) {
      return { success: false, error: 'Please enter a valid 10-digit phone number.' };
    }
    searchType = 'MobileNo';
  } else if (method === 'upic') {
    searchValue = payload.upicId?.trim() || '';
    if (!searchValue) {
      return { success: false, error: 'Please enter a UPIC ID.' };
    }
    searchType = 'UpicId';
  } else if (method === 'property') {
    searchValue = payload.propertyNo?.trim() || '';
    if (!searchValue) {
      return { success: false, error: 'Please enter a Property Number.' };
    }
    searchType = 'PropertyNo';
  }

  try {
    // Check if the property/mobile is registered in the DB
    const properties = await fetchCitizenPropertiesFromApi(searchType, searchValue);
    let mobile = '';

    if (properties && properties.length > 0) {
      const first = properties[0];
      mobile = first.mobileNo || (method === 'mobile' ? searchValue : '');
    } else {
      return {
        success: false,
        error: method === 'mobile'
          ? 'हा मोबाईल नंबर नोंदणीकृत नाही. कृपया नोंदणीकृत मोबाईल नंबर प्रविष्ट करा. / This mobile number is not registered with any property.'
          : method === 'upic'
          ? 'हा UPIC आयडी नोंदणीकृत नाही. कृपया बरोबर UPIC आयडी प्रविष्ट करा. / This UPIC ID is not registered.'
          : 'हा मालमत्ता क्रमांक नोंदणीकृत नाही. कृपया बरोबर मालमत्ता क्रमांक प्रविष्ट करा. / This Property Number is not registered.'
      };
    }

    if (!mobile || !/^\d{10}$/.test(mobile)) {
      return {
        success: false,
        error: 'या मालमत्तेसाठी वैध मोबाईल नंबर नोंदणीकृत नाही. / No valid mobile number is registered for this property.'
      };
    }

    const resp = await requestOtp(mobile);
    const c = await cookies();

    // Live or Demo OTP mode (always show OTP step)
    const txnId = resp.txnId;
    const demoOtp = resp.demoOtp || '123456';
    const maskedPhone = `+91 ${mobile.slice(0, 2)}******${mobile.slice(8)}`;

    c.set('rts_login_mobile', mobile, { httpOnly: true, sameSite: 'lax', path: '/' });
    c.set('rts_otp_txn', txnId, { httpOnly: true, sameSite: 'lax', path: '/' });
    c.set('rts_otp_code', demoOtp, { httpOnly: true, sameSite: 'lax', path: '/' });
    c.set('rts_otp_expires_at', String(Date.now() + OTP_TTL_MS), { httpOnly: true, sameSite: 'lax', path: '/' });

    if (selectedOwnerId) {
      c.set('rts_selected_owner_id', String(selectedOwnerId), { httpOnly: true, sameSite: 'lax', path: '/' });
    }

    return {
      success: true,
      directLogin: false,
      txnId,
      demoOtp,
      maskedPhone,
    };
  } catch (e: any) {
    return { success: false, error: e?.message || 'Failed to send OTP. Please try again.' };
  }
}

export async function verifyCitizenOtpAction(otp: string, externalServiceId?: string): Promise<CitizenLoginActionResult> {
  if (!/^\d{6}$/.test(otp)) {
    return { success: false, error: 'Please enter a valid 6-digit OTP.' };
  }

  const c = await cookies();
  const mobile = c.get('rts_login_mobile')?.value;
  const txnId = c.get('rts_otp_txn')?.value;
  const storedOtp = c.get('rts_otp_code')?.value;
  const expiresAt = Number(c.get('rts_otp_expires_at')?.value || '0');

  if (!mobile || !txnId || !storedOtp) {
    return { success: false, error: 'Session not found. Please request OTP again.' };
  }

  if (Date.now() > expiresAt) {
    return { success: false, error: 'OTP session expired. Please request OTP again.' };
  }

  if (storedOtp !== otp) {
    return { success: false, error: 'Invalid OTP. Please try again.' };
  }

  return await establishCitizenSession(mobile, c, undefined, externalServiceId);
}

export async function logoutCitizenAction() {
  const c = await cookies();
  const sessionId = c.get('rts_session')?.value;

  if (sessionId) {
    try {
      await logoutRtsCitizenSession(sessionId);
    } catch {
      // non-blocking
    }
  }

  c.delete('rts_session');
  c.delete('rts_logged_in');
  c.delete('rts_citizen_profile');
  c.delete('rts_citizen_properties');
  c.delete('rts_login_mobile');
  c.delete('rts_otp_txn');
  c.delete('rts_otp_code');
  c.delete('rts_otp_expires_at');
  c.delete('rts_selected_owner_id');

  return { success: true };
}

export async function switchCitizenPropertyAction(ownerId: number) {
  try {
    const c = await cookies();
    const propertiesCookie = c.get('rts_citizen_properties')?.value;
    let properties: CitizenProperty[] = [];
    if (propertiesCookie) {
      try {
        properties = JSON.parse(propertiesCookie);
      } catch {
        properties = [];
      }
    }

    if (properties.length === 0) {
      const profileCookie = c.get('rts_citizen_profile')?.value;
      if (profileCookie) {
        try {
          const p = JSON.parse(profileCookie);
          if (p.mobile) {
            properties = await fetchCitizenPropertiesFromApi('MobileNo', p.mobile);
          }
        } catch {}
      }
    }

    if (properties.length === 0) {
      return { success: false, error: 'Properties not found in session.' };
    }

    const selected = properties.find((p) => p.ownerId === ownerId);
    if (!selected) {
      return { success: false, error: 'Property not found.' };
    }

    const citizenProfile = {
      name: selected.ownerNameMarathi || 'धारक . .',
      upicId: selected.upicNo,
      propertyNo: selected.propertyNo,
      mobile: selected.mobileNo,
      ownerId: selected.ownerId,
    };

    c.set('rts_citizen_profile', JSON.stringify(citizenProfile), {
      httpOnly: true,
      sameSite: 'lax',
      secure: false,
      path: '/',
      maxAge: 24 * 60 * 60,
    });

    return { success: true };
  } catch (err) {
    console.error('Failed to switch property:', err);
    return { success: false, error: 'Failed to switch property.' };
  }
}

export async function fetchNodesAction() {
  try {
    const data = await getCitizenLoginNodes();
    return { success: true, data };
  } catch (err: unknown) {
    console.error('Error fetching nodes:', err);
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Failed to fetch nodes.',
    };
  }
}

export async function fetchSectorsAction(node: string) {
  try {
    const data = await getCitizenLoginSectors(node);
    return { success: true, data };
  } catch (err: unknown) {
    console.error('Error fetching sectors:', err);
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Failed to fetch sectors.',
    };
  }
}
