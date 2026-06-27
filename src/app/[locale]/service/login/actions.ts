'use server';

import { cookies } from 'next/headers';
import { requestOtp } from '@/lib/api/services';

const OTP_TTL_MS = 2 * 60 * 1000;

export async function sendCitizenOtpAction(
  method: 'mobile' | 'upic' | 'property',
  payload: { mobile?: string }
) {
  if (method === 'upic' || method === 'property') {
    return { success: false, error: 'UPIC/Property login is not connected yet.' };
  }

  const mobile = payload.mobile?.replace(/\D/g, '') || '';
  if (!/^\d{10}$/.test(mobile)) {
    return { success: false, error: 'Please enter a valid 10-digit phone number.' };
  }

  try {
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
}
