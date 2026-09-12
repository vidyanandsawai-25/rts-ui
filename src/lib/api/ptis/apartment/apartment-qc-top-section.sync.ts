import {
  getPropertySocietyDetails,
  updatePropertySocietyDetails,
} from '@/lib/api/property-society.service';
import {
  getPropertyKycById,
  updatePropertyKyc,
} from '@/lib/api/property-kyc.service';
import type { KycDetails } from '@/types/property-kyc.types';
import type { UpdateApartmentQcTopSectionPayload } from './apartment-qc-top-section.service';

export async function syncSocietyAndKycDetails(
  numPropId: number,
  payload: UpdateApartmentQcTopSectionPayload
): Promise<void> {
  if (isNaN(numPropId) || numPropId <= 0) return;

  try {
    const existingSoc = await getPropertySocietyDetails(numPropId).catch(() => null);

    const builderVal = payload.occupierName !== undefined ? (payload.occupierName || null) : (existingSoc?.builderName || null);
    const builderEnglishVal = payload.occupierNameEnglish !== undefined ? (payload.occupierNameEnglish || null) : (existingSoc?.builderNameEnglish || null);

    const societyPayload = {
      propertyId: numPropId,
      societyDetailId: existingSoc?.societyDetailId ?? null,
      wingId: existingSoc?.wingId ?? null,
      wingNo: existingSoc?.wingNo ?? null,
      wingName: existingSoc?.wingName ?? null,
      societyName: payload.societyName !== undefined ? (payload.societyName || null) : (existingSoc?.societyName || null),
      societyAddress: payload.address !== undefined ? (payload.address || null) : (existingSoc?.societyAddress || null),
      secretaryName: payload.secretaryName !== undefined ? (payload.secretaryName || null) : (existingSoc?.secretaryName || null),
      managerName: payload.managerName !== undefined ? (payload.managerName || null) : (existingSoc?.managerName || null),
      landOwnerName: payload.ownerName !== undefined ? (payload.ownerName || null) : (existingSoc?.landOwnerName || null),
      builderName: builderVal,
      builderNameEnglish: builderEnglishVal,
      societyNameEnglish: payload.societyNameEnglish !== undefined ? (payload.societyNameEnglish || null) : (existingSoc?.societyNameEnglish || null),
      societyAddressEnglish: payload.societyAddressEnglish !== undefined ? (payload.societyAddressEnglish || null) : (existingSoc?.societyAddressEnglish || null),
      secretaryNameEnglish: payload.secretaryNameEnglish !== undefined ? (payload.secretaryNameEnglish || null) : (existingSoc?.secretaryNameEnglish || null),
      managerNameEnglish: payload.managerNameEnglish !== undefined ? (payload.managerNameEnglish || null) : (existingSoc?.managerNameEnglish || null),
      landOwnerNameEnglish: payload.ownerNameEnglish !== undefined ? (payload.ownerNameEnglish || null) : (existingSoc?.landOwnerNameEnglish || null),
      managerMobileNo: payload.managerMobileNo ? payload.managerMobileNo.replace(/\D/g, '').slice(-10) : (existingSoc?.managerMobileNo ? existingSoc.managerMobileNo.replace(/\D/g, '').slice(-10) : null),
      secretaryMobileNo: payload.secretaryMobileNo ? payload.secretaryMobileNo.replace(/\D/g, '').slice(-10) : (existingSoc?.secretaryMobileNo ? existingSoc.secretaryMobileNo.replace(/\D/g, '').slice(-10) : null),
      societyEmailId: payload.emailId !== undefined ? (payload.emailId || null) : (existingSoc?.societyEmailId || null),
      secretaryEmailId: payload.secretaryEmailId !== undefined ? (payload.secretaryEmailId || null) : (existingSoc?.secretaryEmailId || null),
      managerEmailId: payload.managerEmailId !== undefined ? (payload.managerEmailId || null) : (existingSoc?.managerEmailId || null),
    };

    await updatePropertySocietyDetails(numPropId, societyPayload);
  } catch {
    // Non-blocking fallback for society detail table sync
  }

  try {
    const existingKyc = await getPropertyKycById(numPropId).catch(() => null);
    if (existingKyc?.items) {
      const kycPayload: KycDetails = {
        ...existingKyc.items,
        mobileNo: payload.mobileNo ? payload.mobileNo.replace(/\D/g, '').slice(-10) : existingKyc.items.mobileNo,
        alternateMobileNo: payload.alternateMobileNo ? payload.alternateMobileNo.replace(/\D/g, '').slice(-10) : existingKyc.items.alternateMobileNo,
        emailId: payload.emailId || existingKyc.items.emailId,
        address: payload.address || existingKyc.items.address,
        addressEnglish: payload.societyAddressEnglish || existingKyc.items.addressEnglish,
        ownerName: payload.ownerName || existingKyc.items.ownerName,
        ownerNameEnglish: payload.ownerNameEnglish || existingKyc.items.ownerNameEnglish,
        occupierName: payload.occupierName || existingKyc.items.occupierName,
        occupierNameEnglish: payload.occupierNameEnglish || existingKyc.items.occupierNameEnglish,
        pinCode: payload.pinCode || existingKyc.items.pinCode,
        adharCardNo: payload.aadharNo || existingKyc.items.adharCardNo,
      };
      await updatePropertyKyc(numPropId, kycPayload).catch(() => null);
    }
  } catch {
    // Non-blocking fallback for kyc details sync
  }
}
