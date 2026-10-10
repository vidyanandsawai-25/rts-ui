//ntis-ui\src\lib\api\property-basic-details.service.ts
import { apiClient } from '@/services/api.service';
import { handleApiResponse, ApiError } from '@/lib/utils/api';
import { getTranslations } from 'next-intl/server';

import {
  PropertyBasicDetailsApiItem,
  PropertyCategoryApiItem,
  PropertyTypeApiItem,
  TaxDetailsApiResponse,
  UpdatePropertyBasicDetailsDto,
  WingItem,
  MoujaItem,
  TaxZoneItem,
} from '@/types/property-basic-details.types';
import { ActionResult } from '@/types/common.types';

import {
  isPropertyBasicDetailsShape,
  normalizePropertyBasicDetails,
  isPropertyTypeShape,
  normalizePropertyType,
  isPropertyCategoryShape,
  normalizePropertyCategory,
  isMoujaShape,
  normalizeMouja,
  isTaxZoneShape,
  normalizeTaxZone,
  isWingShape,
  normalizeWing,
} from './property-basic-details.guard';

/* ---------------- PROPERTY TYPE ---------------- */
export async function getPropertyTypes(
  pageNumber: number,
  pageSize: number,
  searchTerm?: string
): Promise<PropertyTypeApiItem[]> {
  try {
    const params = new URLSearchParams();
    params.append('PageSize', pageSize.toString());
    if (searchTerm?.trim()) {
      params.append('SearchTerm', searchTerm.trim());
    }
    params.append('PageNo', pageNumber.toString());

    const response = await apiClient.get<unknown>(
      `/PropertyTypeMaster?${params.toString()}`
    );

    if (!response.success || !response.data) return [];

    const rootData = response.data;
    const rawList = Array.isArray(rootData)
      ? rootData
      : (typeof rootData === 'object' && rootData !== null && 'items' in rootData && Array.isArray((rootData as { items: unknown }).items))
        ? (rootData as { items: unknown[] }).items
        : [];

    return rawList.filter(isPropertyTypeShape).map(normalizePropertyType);
  } catch {
    return [];
  }
}

/* ---------------- PROPERTY CATEGORY ---------------- */
export async function getPropertyCategories(
  pageNumber: number,
  pageSize: number,
  searchTerm?: string
): Promise<PropertyCategoryApiItem[]> {
  try {
    const params = new URLSearchParams();
    params.append('PageSize', pageSize.toString());
    if (searchTerm?.trim()) {
      params.append('SearchTerm', searchTerm.trim());
    }
    params.append('PageNo', pageNumber.toString());

    const response = await apiClient.get<unknown>(
      `/PropertyCategory?${params.toString()}`
    );

    if (!response.success || !response.data) return [];

    const rootData = response.data;
    const rawList = Array.isArray(rootData)
      ? rootData
      : (typeof rootData === 'object' && rootData !== null && 'items' in rootData && Array.isArray((rootData as { items: unknown }).items))
        ? (rootData as { items: unknown[] }).items
        : [];

    return rawList.filter(isPropertyCategoryShape).map(normalizePropertyCategory);
  } catch {
    return [];
  }
}

/* ---------------- PROPERTY BASIC DETAILS ---------------- */
export async function getPropertyBasicDetails(
  propertyId: number
): Promise<PropertyBasicDetailsApiItem | null> {
  try {
    const response = await apiClient.get<unknown>(
      `/Property/${propertyId}/basic-details`
    );

    if (response.success && response.data) {
      const rootData = response.data;
      const payload = (typeof rootData === 'object' && rootData !== null && 'items' in rootData)
        ? (rootData as { items: unknown }).items
        : rootData;

      if (isPropertyBasicDetailsShape(payload)) {
        return normalizePropertyBasicDetails(payload);
      }
    }
  } catch (_e) {
    // Primary endpoint failed, fallback below
  }

  // Fallback: Try individual property top section
  try {
    const { fetchIndividualQcTopSection } = await import('@/lib/api/ptis/individual');
    const individualRes = await fetchIndividualQcTopSection(propertyId);
    if (individualRes.success && individualRes.data) {
      const item = individualRes.data;
      if (isPropertyBasicDetailsShape(item)) {
        return normalizePropertyBasicDetails(item);
      }
    }
  } catch (_e) {
    // ignore
  }

  return null;
}

/* ---------------- UPDATE PROPERTY BASIC DETAILS ---------------- */
export async function updatePropertyBasicDetails(
  propertyId: number,
  payload: UpdatePropertyBasicDetailsDto
): Promise<ActionResult<null>> {
  const response = await apiClient.put<ActionResult<null>>(
    `/Property/${propertyId}/basic-details`,
    payload
  );
  const t = await getTranslations('quickDataEntry');
  return handleApiResponse(response, t('property.errors.updatePropertyBasicDetails'));
}

export async function getWingMaster(
  pageNumber: number,
  pageSize: number,
  searchTerm?: string
): Promise<WingItem[]> {
  try {
    const params = new URLSearchParams();
    params.append('PageSize', pageSize.toString());
    if (searchTerm?.trim()) {
      params.append('SearchTerm', searchTerm.trim());
    }
    params.append('PageNo', pageNumber.toString());
    const response = await apiClient.get<unknown>(`/Wing?${params.toString()}`);
    if (!response.success || !response.data) return [];
    const rootData = response.data;
    const rawList = Array.isArray(rootData)
      ? rootData
      : (typeof rootData === 'object' && rootData !== null && 'items' in rootData && Array.isArray((rootData as { items: unknown }).items))
        ? (rootData as { items: unknown[] }).items
        : [];
    return rawList.filter(isWingShape).map(normalizeWing);
  } catch {
    return [];
  }
}

export async function getMoujaMaster(
  pageNumber: number,
  pageSize: number,
  searchTerm?: string
): Promise<MoujaItem[]> {
  try {
    const params = new URLSearchParams();
    params.append('PageSize', pageSize.toString());
    if (searchTerm?.trim()) {
      params.append('SearchTerm', searchTerm.trim());
    }
    params.append('PageNo', pageNumber.toString());
    const response = await apiClient.get<unknown>(`/Mouja?${params.toString()}`);
    if (!response.success || !response.data) return [];
    const rootData = response.data;
    const rawList = Array.isArray(rootData)
      ? rootData
      : (typeof rootData === 'object' && rootData !== null && 'items' in rootData && Array.isArray((rootData as { items: unknown }).items))
        ? (rootData as { items: unknown[] }).items
        : [];
    return rawList.filter(isMoujaShape).map(normalizeMouja);
  } catch {
    return [];
  }
}

/** Fetches CV tax details for a property. */
export async function getTaxDetailsCvByPropertyId(
  propertyId: number
): Promise<{ propertyId: number; taxAmounts: Record<string, number | undefined> }> {
  const response = await apiClient.get<TaxDetailsApiResponse>(
    `/Property/${propertyId}/tax-details-cv`
  );
  const t = await getTranslations('quickDataEntry');
  return handleApiResponse(response, t('property.errors.fetchCvTaxDetails')).items;
}

export async function getTaxZones(
  pageNumber: number = 1,
  pageSize: number = 100,
  searchTerm?: string
): Promise<TaxZoneItem[]> {
  try {
    const params = new URLSearchParams();
    params.append('PageSize', pageSize.toString());
    if (searchTerm?.trim()) {
      params.append('SearchTerm', searchTerm.trim());
    }
    params.append('PageNo', pageNumber.toString());
    const response = await apiClient.get<unknown>(`/TaxZone?${params.toString()}`);
    if (!response.success || !response.data) return [];
    const rootData = response.data;
    const rawList = Array.isArray(rootData)
      ? rootData
      : (typeof rootData === 'object' && rootData !== null && 'items' in rootData && Array.isArray((rootData as { items: unknown }).items))
        ? (rootData as { items: unknown[] }).items
        : [];
    return rawList.filter(isTaxZoneShape).map(normalizeTaxZone);
  } catch {
    return [];
  }
}

/* ---------------- DELETE ALL DETAILS BY PROPERTY ID ---------------- */
export async function deletePropertyDetails(propertyId: number): Promise<ActionResult<null>> {
  const response = await apiClient.delete<ActionResult<null>>(
    `/DataEntry/ByPropertyId/${propertyId}`
  );
  const t = await getTranslations('quickDataEntry');
  if (!response.success) {
    throw new ApiError(
      response.statusCode || 500,
      response.error || 'Unknown error',
      t('property.errors.deletePropertyDetails')
    );
  }
  // DELETE may return 204 No Content; when the backend provides an
  // ActionResult, preserve it.
  return response.data ?? { success: true, data: null };
}
