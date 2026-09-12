'use server';

import {
  fetchApartmentQcTopSection,
  patchApartmentQcTopSection,
  type ApartmentQcTopSectionDto,
  type UpdateApartmentQcTopSectionPayload,
} from './apartment-qc-top-section.service';
import { mapApartmentQcTopSectionToPropertyMasterData } from './apartment-qc-top-section.mapper';
import { getPropertySocietyDetails } from '@/lib/api/property-society.service';
import { getPropertyKycById } from '@/lib/api/property-kyc.service';
import type { PropertyMasterData } from '@/types/property-tax/apartment';
import { syncSocietyAndKycDetails } from './apartment-qc-top-section.sync';

export async function getApartmentQcTopSectionAction(
  propertyId: number | string
): Promise<{
  success: boolean;
  data?: PropertyMasterData;
  rawDto?: ApartmentQcTopSectionDto;
  error?: string;
}> {
  if (!propertyId) {
    return {
      success: false,
      error: 'Property identifier is missing. Please select a valid property.',
    };
  }

  const numPropId = Number(propertyId);

  const [topRes, socDetails, kycRes] = await Promise.all([
    fetchApartmentQcTopSection(propertyId),
    numPropId > 0 ? getPropertySocietyDetails(numPropId).catch(() => null) : Promise.resolve(null),
    numPropId > 0 ? getPropertyKycById(numPropId).catch(() => null) : Promise.resolve(null),
  ]);

  if (topRes.success && topRes.data) {
    const mapped = mapApartmentQcTopSectionToPropertyMasterData(topRes.data);
    if (socDetails) {
      if (socDetails.builderName && socDetails.builderName !== '-') mapped.builderName = socDetails.builderName;
      if (socDetails.landOwnerName && socDetails.landOwnerName !== '-') mapped.landOwnerName = socDetails.landOwnerName;
      if (socDetails.societyName && socDetails.societyName !== '-') mapped.societyName = socDetails.societyName;
      if (socDetails.societyEmailId && socDetails.societyEmailId !== '-') mapped.societyEmail = socDetails.societyEmailId;
      if (socDetails.secretaryName && socDetails.secretaryName !== '-') mapped.secretaryName = socDetails.secretaryName;
      if (socDetails.secretaryMobileNo && socDetails.secretaryMobileNo !== '-') {
        mapped.secretaryMobileNo = socDetails.secretaryMobileNo.startsWith('+') ? socDetails.secretaryMobileNo : `+91 ${socDetails.secretaryMobileNo.replace(/\D/g, '').slice(-10)}`;
      }
      if (socDetails.secretaryEmailId && socDetails.secretaryEmailId !== '-') mapped.secretaryEmail = socDetails.secretaryEmailId;
      if (socDetails.managerName && socDetails.managerName !== '-') mapped.managerName = socDetails.managerName;
      if (socDetails.managerMobileNo && socDetails.managerMobileNo !== '-') {
        mapped.managerMobileNo = socDetails.managerMobileNo.startsWith('+') ? socDetails.managerMobileNo : `+91 ${socDetails.managerMobileNo.replace(/\D/g, '').slice(-10)}`;
      }
      if (socDetails.societyNameEnglish && socDetails.societyNameEnglish !== '-') mapped.societyNameEnglish = socDetails.societyNameEnglish;
      if (socDetails.landOwnerNameEnglish && socDetails.landOwnerNameEnglish !== '-') mapped.landOwnerNameEnglish = socDetails.landOwnerNameEnglish;
      if (socDetails.builderNameEnglish && socDetails.builderNameEnglish !== '-') mapped.builderNameEnglish = socDetails.builderNameEnglish;
      if (socDetails.societyAddress && socDetails.societyAddress !== '-') mapped.societyAddress = socDetails.societyAddress;
      if (socDetails.societyAddressEnglish && socDetails.societyAddressEnglish !== '-') mapped.societyAddressEnglish = socDetails.societyAddressEnglish;
      if (socDetails.secretaryNameEnglish && socDetails.secretaryNameEnglish !== '-') mapped.secretaryNameEnglish = socDetails.secretaryNameEnglish;
      if (socDetails.managerNameEnglish && socDetails.managerNameEnglish !== '-') mapped.managerNameEnglish = socDetails.managerNameEnglish;
    }
    if (kycRes?.items) {
      if (kycRes.items.mobileNo && (!mapped.builderMobileNo || mapped.builderMobileNo === '-')) {
        mapped.mobileNo = kycRes.items.mobileNo;
        mapped.builderMobileNo = `+91 ${kycRes.items.mobileNo.replace(/\D/g, '').slice(-10)}`;
      }
      if (kycRes.items.alternateMobileNo && (!mapped.alternateMobileNo || mapped.alternateMobileNo === '-')) {
        mapped.alternateMobileNo = kycRes.items.alternateMobileNo;
      }
    }
    return {
      success: true,
      data: {
        ...mapped,
        propertyId: !isNaN(numPropId) && numPropId > 0 ? numPropId : undefined,
      },
      rawDto: topRes.data,
    };
  }

  if (socDetails) {
    return {
      success: true,
      data: {
        propertyNo: '-',
        upic: '-',
        societyName: socDetails.societyName || '-',
        ownerName: socDetails.landOwnerName || '-',
        status: 'ACTIVE PROPERTY',
        category: 'Apartment',
        propertyDescriptionRegional: '-',
        division: '-',
        taxZone: '-',
        taxZoneAndName: '-',
        subZoneCsnNo: '-',
        plotNo: '-',
        address: socDetails.societyAddress || '-',
        societyAddress: socDetails.societyAddress || '-',
        plotArea: '-',
        carpetBuiltUpArea: '-',
        oldCarpetBuiltUp: '-',
        totalFloors: '-',
        totalPropertiesResCommAmen: '-',
        secretaryName: socDetails.secretaryName || '-',
        secretaryMobileNo: socDetails.secretaryMobileNo || '-',
        secretaryEmail: socDetails.secretaryEmailId || '-',
        builderName: socDetails.builderName || '-',
        landOwnerName: socDetails.landOwnerName || '-',
        societyEmail: socDetails.societyEmailId || '-',
        propertyId: numPropId,
      },
    };
  }

  return {
    success: false,
    error: topRes.error || 'Unable to load apartment details. Please refresh the page or try again later.',
  };
}

export async function updateApartmentQcTopSectionAction(
  propertyId: number | string,
  payload: UpdateApartmentQcTopSectionPayload
): Promise<{
  success: boolean;
  message?: string;
  error?: string;
}> {
  if (!propertyId) {
    return {
      success: false,
      error: 'Property identifier is missing. Please select a valid property to update.',
    };
  }

  const numPropId = Number(propertyId);
  const patchRes = await patchApartmentQcTopSection(propertyId, payload);

  if (!isNaN(numPropId) && numPropId > 0 && patchRes.success) {
    await syncSocietyAndKycDetails(numPropId, payload);
  }

  return patchRes;
}
