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
