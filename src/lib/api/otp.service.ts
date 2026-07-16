export type RequestOtpResponse = { message: string; txnId: string; expiresInSeconds: number; demoOtp?: string | null };

/**
 * Sends OTP via SMS Gateway (Akola Municipal Corporation SMS Gateway)
 * @param mobile - 10-digit mobile number
 */
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
