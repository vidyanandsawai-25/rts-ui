import type {
  KYCDetailsData,
  SocietyDetailsData,
  OldDetailsData,
  OldFloorDetailsData,
  OldTaxesData,
  KycDetailsApiResponse,
  SocietyDetailsApiResponse,
  OldDetailsApiResponse,
  OldFloorDetailApiResponse,
  OldTaxesApiResponse,
} from '@/types/ptis.types';
import { fetchWithCertSupport, getErrorFormattedMessage, extractData } from './base-api';
import { ptisMapper } from './ptis.mapper';

export const ptisDetailsService = {
  async getKycDetails(propertyId: string | number): Promise<{
    success: boolean;
    data?: KYCDetailsData;
    error?: string;
  }> {
    try {
      const response = await fetchWithCertSupport<unknown>(`/Property/${propertyId}/kyc-details`);

      if (!response.success) {
        return {
          success: false,
          error: getErrorFormattedMessage(response.error, 'Failed to fetch KYC details'),
        };
      }

      const rawData = extractData<KycDetailsApiResponse>(response.data);
      if (!rawData) return { success: false, error: 'Empty KYC data returned' };

      return { success: true, data: ptisMapper.mapKycDetails(rawData) };
    } catch (error: unknown) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch KYC details',
      };
    }
  },

  async getSocietyDetails(propertyId: string | number): Promise<{
    success: boolean;
    data?: SocietyDetailsData;
    error?: string;
  }> {
    try {
      const response = await fetchWithCertSupport<unknown>(
        `/Property/${propertyId}/society-details`
      );

      if (!response.success) {
        return {
          success: false,
          error: getErrorFormattedMessage(response.error, 'Society details not found'),
        };
      }

      const rawData = extractData<SocietyDetailsApiResponse>(response.data);
      if (!rawData) return { success: false, error: 'Society details not found' };

      return { success: true, data: ptisMapper.mapSocietyDetails(rawData) };
    } catch (error: unknown) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch society details',
      };
    }
  },

  async getOldDetails(propertyId: string | number): Promise<{
    success: boolean;
    data?: OldDetailsData;
    error?: string;
  }> {
    try {
      const response = await fetchWithCertSupport<OldDetailsApiResponse>(
        `/Property/${propertyId}/old-details`
      );

      if (!response.success) {
        return {
          success: false,
          error: getErrorFormattedMessage(response.error, 'Old details not found'),
        };
      }

      const rawData = extractData<OldDetailsApiResponse>(response.data);
      if (!rawData) return { success: false, error: 'Old details not found' };
      return { success: true, data: ptisMapper.mapOldDetails(rawData) };
    } catch (error: unknown) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch old details',
      };
    }
  },

  async getOldFloorDetails(propertyId: string | number): Promise<{
    success: boolean;
    data?: OldFloorDetailsData[];
    error?: string;
  }> {
    try {
      const response = await fetchWithCertSupport<unknown>(
        `/Property/${propertyId}/floor-details-old`
      );

      if (!response.success) {
        return {
          success: false,
          error: getErrorFormattedMessage(response.error, 'Old floor details not found'),
        };
      }

      const rawItems = extractData<{ floorDetails: OldFloorDetailApiResponse[] }>(response.data);
      const floorDetailsRaw = rawItems?.floorDetails;

      if (!Array.isArray(floorDetailsRaw)) return { success: true, data: [] };
      return {
        success: true,
        data: ptisMapper.mapOldFloorDetails(floorDetailsRaw as OldFloorDetailApiResponse[]),
      };
    } catch (error: unknown) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch old floor details',
      };
    }
  },

  async getOldTaxesDetails(propertyId: string | number): Promise<{
    success: boolean;
    data?: OldTaxesData;
    error?: string;
  }> {
    try {
      const response = await fetchWithCertSupport<OldTaxesApiResponse>(
        `/Property/${propertyId}/old-taxes-details`
      );

      if (!response.success) {
        return {
          success: false,
          error: getErrorFormattedMessage(response.error, 'Old tax details not found'),
        };
      }

      const rawData = extractData<OldTaxesApiResponse>(response.data);
      return rawData
        ? { success: true, data: rawData }
        : { success: false, error: 'Old tax details not found' };
    } catch (error: unknown) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch old tax details',
      };
    }
  },
};
