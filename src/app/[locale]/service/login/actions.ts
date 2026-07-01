'use server';

import { cookies } from 'next/headers';
import { requestOtp, fetchCitizenPropertiesFromApi, type CitizenProperty } from '@/lib/api/services';

const OTP_TTL_MS = 2 * 60 * 1000;

export async function sendCitizenOtpAction(
  method: 'mobile' | 'upic' | 'property',
  payload: { mobile?: string; upicId?: string; propertyNo?: string }
) {
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
    if (!properties || properties.length === 0) {
      return {
        success: false,
        error: method === 'mobile'
          ? 'हा मोबाईल नंबर नोंदणीकृत नाही. कृपया प्रथम मालमत्ता नोंदणी करा. / This mobile number is not registered. Please register your property first.'
          : method === 'upic'
            ? 'हा UPIC आयडी नोंदणीकृत नाही. कृपया बरोबर UPIC आयडी प्रविष्ट करा. / This UPIC ID is not registered. Please enter a correct UPIC ID.'
            : 'हा मालमत्ता क्रमांक नोंदणीकृत नाही. कृपया बरोबर मालमत्ता क्रमांक प्रविष्ट करा. / This Property Number is not registered. Please enter a correct Property Number.'
      };
    }

    // Extract dynamic mobile number from the retrieved property to send OTP
    const mobile = properties[0].mobileNo;
    if (!mobile || !/^\d{10}$/.test(mobile)) {
      return {
        success: false,
        error: 'या मालमत्तेसाठी वैध मोबाईल नंबर नोंदणीकृत नाही. / No valid mobile number is registered for this property.'
      };
    }

    const resp = await requestOtp(mobile);
    const txnId = resp.txnId;
    const demoOtp = resp.demoOtp || '123456';
    const maskedPhone = `+91 ${mobile.slice(0, 2)}******${mobile.slice(8)}`;

    const c = await cookies();
    c.set('rts_login_mobile', mobile, { httpOnly: true, sameSite: 'lax', path: '/' });
    c.set('rts_otp_txn', txnId, { httpOnly: true, sameSite: 'lax', path: '/' });
    c.set('rts_otp_code', demoOtp, { httpOnly: true, sameSite: 'lax', path: '/' });
    c.set('rts_otp_expires_at', String(Date.now() + OTP_TTL_MS), { httpOnly: true, sameSite: 'lax', path: '/' });

    return {
      success: true,
      txnId,
      demoOtp,
      maskedPhone,
    };
  } catch (e: any) {
    return { success: false, error: e?.message || 'Failed to send OTP. Please try again.' };
  }
}

export async function verifyCitizenOtpAction(otp: string) {
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

  // Fetch citizen details from dynamic API
  let citizenProfile = {
    name: 'धारक . .',
    upicId: 'AKLMC089194',
    propertyNo: 'B3-434',
    mobile: mobile,
    ownerId: 0,
  };

  let properties: CitizenProperty[] = [];

  try {
    properties = await fetchCitizenPropertiesFromApi('MobileNo', mobile);
    if (properties.length > 0) {
      const first = properties[0];
      citizenProfile = {
        name: first.ownerNameMarathi || 'धारक . .',
        upicId: first.upicNo,
        propertyNo: first.propertyNo,
        mobile: first.mobileNo,
        ownerId: first.ownerId,
      };
    }
  } catch (err) {
    console.error("Failed to fetch citizen profile during login:", err);
  }

  c.set('rts_session', `local_${mobile}_${Date.now()}`, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: 24 * 60 * 60,
  });

  c.set('rts_logged_in', 'true', {
    httpOnly: false,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: 24 * 60 * 60,
  });

  c.set('rts_citizen_profile', JSON.stringify(citizenProfile), {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: 24 * 60 * 60,
  });

  if (properties.length > 0) {
    c.set('rts_citizen_properties', JSON.stringify(properties), {
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      path: '/',
      maxAge: 24 * 60 * 60,
    });
  }

  c.delete('rts_login_mobile');
  c.delete('rts_otp_txn');
  c.delete('rts_otp_code');
  c.delete('rts_otp_expires_at');

  return { success: true };
}

export async function logoutCitizenAction() {
  const c = await cookies();
  c.delete('rts_session');
  c.delete('rts_logged_in');
  c.delete('rts_citizen_profile');
  c.delete('rts_citizen_properties');
}

export async function switchCitizenPropertyAction(ownerId: number) {
  try {
    const c = await cookies();
    const propertiesCookie = c.get('rts_citizen_properties')?.value;
    if (!propertiesCookie) {
      return { success: false, error: 'Properties not found in session.' };
    }

    const properties: CitizenProperty[] = JSON.parse(propertiesCookie);
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
      secure: process.env.NODE_ENV === 'production',
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
    const res = await fetch('https://akolamc.in/PropertyTax/FillComboForPayment/FillComboForPayments', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ Flag: 'GetNode' }),
    });

    if (!res.ok) {
      return { success: false, error: `Failed to fetch nodes. Status: ${res.status}` };
    }

    const data = await res.json();
    return { success: true, data };
  } catch (err: any) {
    console.error('Error fetching nodes:', err);
    return { success: false, error: err?.message || 'Failed to fetch nodes.' };
  }
}

export async function fetchSectorsAction(node: string) {
  try {
    const res = await fetch('https://akolamc.in/PropertyTax/FillComboForPayment/FillComboForPayments', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ Flag: 'GetSector', Node: node }),
    });

    if (!res.ok) {
      return { success: false, error: `Failed to fetch sectors. Status: ${res.status}` };
    }

    const data = await res.json();
    return { success: true, data };
  } catch (err: any) {
    console.error('Error fetching sectors:', err);
    return { success: false, error: err?.message || 'Failed to fetch sectors.' };
  }
}
