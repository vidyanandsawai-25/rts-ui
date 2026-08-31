import { apiClient } from "@/services/api.service";

export type RequestOtpResponse = {
  message: string;
  txnId: string;
  expiresInSeconds: number;
  demoOtp?: string | null;
  isLive?: boolean;
  directLogin?: boolean;
};

/**
 * Sends OTP via the centralized backend RTS-API which checks if SMS gateway is active in DB.
 * If SMS gateway is inactive in DB, directLogin is returned as true.
 */
export async function requestOtp(mobile: string): Promise<RequestOtpResponse> {
  const sanitized = mobile.replace(/\D/g, "");

  try {
    const res = await apiClient.post<{
      success: boolean;
      message: string;
      txnId: string;
      demoOtp?: string;
      expiresInSeconds: number;
      isLive?: boolean;
      directLogin?: boolean;
    }>("/RTSApplication/citizen-otp/send", {
      mobile: sanitized,
    });

    if (res?.data?.success) {
      return {
        message: res.data.message || "OTP dispatched successfully via official SMS gateway.",
        txnId: res.data.txnId,
        expiresInSeconds: res.data.expiresInSeconds || 120,
        demoOtp: (res.data as any).otp || res.data.demoOtp,
        isLive: res.data.isLive ?? true,
        directLogin: res.data.directLogin ?? false,
      };
    }
    throw new Error(res?.data?.message || "Failed to send OTP via SMS Gateway.");
  } catch (err: any) {
    console.error("Error dispatching OTP via backend RTS-API:", err);
    throw new Error(err?.response?.data?.message || err?.message || "Failed to send OTP via SMS Gateway.");
  }
}
