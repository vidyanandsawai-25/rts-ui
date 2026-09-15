'use server';

import {
  fetchApartmentQcTopSection,
  patchApartmentQcTopSection,
  type ApartmentQcTopSectionDto,
  type UpdateApartmentQcTopSectionPayload,
} from './apartment-qc-top-section.service';
import { mapApartmentQcTopSectionToPropertyMasterData } from './apartment-qc-top-section.mapper';
import { getPropertySocietyDetails } from '@/lib/api/property-society.service';
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

  const [topRes, socDetails] = await Promise.all([
    fetchApartmentQcTopSection(propertyId),
    numPropId > 0 ? getPropertySocietyDetails(numPropId).catch(() => null) : Promise.resolve(null),
  ]);

  if (topRes.success && topRes.data) {
    const mapped = mapApartmentQcTopSectionToPropertyMasterData(topRes.data);
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
