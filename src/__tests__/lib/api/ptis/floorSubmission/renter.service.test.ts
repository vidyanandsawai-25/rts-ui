/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { saveRenterDetails, deleteRenterDetails, updateRenterDetails } from '@/lib/api/ptis/floorSubmission/renter.service';
import { getFloorById, getSubmissionDetails } from '@/lib/api/ptis/floorSubmission/floor-info.service';
import { apiClient } from '@/services/api.service';

// Mock the api service
vi.mock('@/services/api.service', () => ({
  apiClient: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
  },
}));

describe('Renter Service Integration & Hydration Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('saveRenterDetails - Smart Differential Sync', () => {
    const mockFloorResponse = {
      success: true,
      data: {
        propertyDetailsId: 100,
        floorId: '1',
        renterYesNo: true,
      },
    };

    const mockDetailsGetResponse = {
      success: true,
      data: [
        { id: 201, propertyDetailsId: 100, agreementId: 'AGR-OLD', incrementFrequency: 'Yearly' },
      ],
    };

    const mockMastGetResponse = {
      success: true,
      data: [
        { id: 301, propertyDetailsId: 100, financialYear: '2025', finalRent: 5000 },
      ],
    };

    const incomingPayload = {
      propertyId: 100,
      propertyDetailsId: 100,
      renterYesNo: true,
      taxLiability: 'Taxable',
      renterName: 'John Doe',
      renterDetails: [
        // Update existing item 201
        { id: 201, agreementId: 'AGR-NEW', incrementFrequency: 'Monthly', incrementType: 'Percentage', incrementValue: 10, durationFrom: '2026-01-01', durationTo: '2026-12-31' },
        // Create new item (temp id / no id)
        { id: 9999999999999, agreementId: 'AGR-TEMP', incrementFrequency: 'Yearly' },
      ],
      renterMast: [
        // Update existing item 301
        { id: 301, financialYear: '2026-27', finalRent: 6000 },
        // Create new item
        { financialYear: '2027-28', finalRent: 7000 },
      ],
    };

    it('should perform PUT on the floor, then perform differential sync (POST/PUT/DELETE) for details and masters', async () => {
      // Setup mocked resolutions
      vi.mocked(apiClient.put).mockImplementation(async (url) => {
        if (url.includes('/DataEntry/100')) {
          return mockFloorResponse;
        }
        return { success: true };
      });
      vi.mocked(apiClient.get).mockImplementation(async (url) => {
        if (url.includes('/RenterDetails')) return mockDetailsGetResponse;
        if (url.includes('/RenterMast')) return mockMastGetResponse;
        if (url.includes('/DataEntry/100')) return mockFloorResponse;
        return { success: false };
      });
      vi.mocked(apiClient.post).mockResolvedValue({ success: true, data: { id: 500 } });
      vi.mocked(apiClient.delete).mockResolvedValue({ success: true });

      // Run
      const result = await saveRenterDetails(100, incomingPayload);

      // Verify Floor PUT was executed
      expect(apiClient.put).toHaveBeenCalledWith('/DataEntry/100', expect.any(Object));

      // Verify existing records were fetched
      expect(apiClient.get).toHaveBeenCalledWith('/RenterDetails');
      expect(apiClient.get).toHaveBeenCalledWith('/RenterMast');

      // Verifysmart differential operations:
      // RenterDetails:
      // - 201 updated (PUT)
      // - 9999999999999 created (POST)
      expect(apiClient.put).toHaveBeenCalledWith('/RenterDetails/201', expect.objectContaining({
        id: 201,
        agreementId: 'AGR-NEW',
      }));
      expect(apiClient.post).toHaveBeenCalledWith('/RenterDetails', expect.objectContaining({
        agreementId: 'AGR-TEMP',
      }));

      // RenterMast:
      // - 301 updated (PUT) and financialYear truncated to 4 characters
      // - Null id created (POST) and financialYear truncated
      expect(apiClient.put).toHaveBeenCalledWith('/RenterMast/301', expect.objectContaining({
        id: 301,
        financialYear: '2026', // strictly truncated to 4 characters
      }));
      expect(apiClient.post).toHaveBeenCalledWith('/RenterMast', expect.objectContaining({
        financialYear: '2027', // strictly truncated
      }));

      expect(result).toBeDefined();
    });

    it('should delete existing sub-records when they are omitted in the payload (Smart Sync Delete)', async () => {
      // Setup payload with zero details/masts, which means we should delete the existing 201 and 301
      const emptyRenterPayload = {
        propertyId: 100,
        propertyDetailsId: 100,
        renterYesNo: true,
        renterDetails: [],
        renterMast: [],
      };

      vi.mocked(apiClient.put).mockResolvedValue(mockFloorResponse);
      vi.mocked(apiClient.get).mockImplementation(async (url) => {
        if (url.includes('/RenterDetails')) return mockDetailsGetResponse;
        if (url.includes('/RenterMast')) return mockMastGetResponse;
        if (url.includes('/DataEntry/100')) return mockFloorResponse;
        return { success: false };
      });
      vi.mocked(apiClient.delete).mockResolvedValue({ success: true });

      await saveRenterDetails(100, emptyRenterPayload);

      // Assert deletions were triggered
      expect(apiClient.delete).toHaveBeenCalledWith('/RenterDetails/201');
      expect(apiClient.delete).toHaveBeenCalledWith('/RenterMast/301');
    });

    it('should ignore duplicate record errors from floor attributes PUT/POST and proceed to save renter details successfully', async () => {
      const incomingPayload = {
        propertyId: 100,
        propertyDetailsId: 100,
        renterYesNo: true,
        renterDetails: [
          { id: 201, agreementId: 'AGR-NEW-DUP' }
        ],
        renterMast: []
      };

      // Mock floor update to return success: false with "A record with the same details already exists."
      vi.mocked(apiClient.put).mockImplementation(async (url) => {
        if (url.includes('/DataEntry/100')) {
          return {
            success: false,
            statusCode: 409,
            error: "A record with the same details already exists."
          } as any;
        }
        return { success: true };
      });

      vi.mocked(apiClient.get).mockImplementation(async (url) => {
        if (url.includes('/RenterDetails')) return mockDetailsGetResponse;
        if (url.includes('/RenterMast')) return mockMastGetResponse;
        if (url.includes('/DataEntry/100')) return mockFloorResponse;
        return { success: false };
      });
      vi.mocked(apiClient.delete).mockResolvedValue({ success: true });

      const result = await saveRenterDetails(100, incomingPayload);

      // Verify Floor PUT was executed (even though it returned 409 duplicate)
      expect(apiClient.put).toHaveBeenCalledWith('/DataEntry/100', expect.any(Object));

      // Verify that Smart Sync still proceeded to update Renter Details
      expect(apiClient.put).toHaveBeenCalledWith('/RenterDetails/201', expect.objectContaining({
        id: 201,
        agreementId: 'AGR-NEW-DUP',
      }));

      expect(result).toBeDefined();
    });
  });


  describe('deleteRenterDetails', () => {
    const mockDetailsGetResponse = {
      success: true,
      data: [
        { id: 201, propertyDetailsId: 100 },
        { id: 202, propertyDetailsId: 200 }, // other floor, do not delete
      ],
    };

    const mockMastGetResponse = {
      success: true,
      data: [
        { id: 301, propertyDetailsId: 100 },
      ],
    };

    it('should fetch associated records, delete only matching ones, and then set renterYesNo: false on the floor', async () => {
      vi.mocked(apiClient.get).mockImplementation(async (url) => {
        if (url.includes('/RenterDetails')) return mockDetailsGetResponse;
        if (url.includes('/RenterMast')) return mockMastGetResponse;
        return { success: false };
      });
      vi.mocked(apiClient.delete).mockResolvedValue({ success: true });
      vi.mocked(apiClient.put).mockResolvedValue({ success: true });

      await deleteRenterDetails(100);

      // Verify deletions
      expect(apiClient.delete).toHaveBeenCalledWith('/RenterDetails/201');
      expect(apiClient.delete).not.toHaveBeenCalledWith('/RenterDetails/202');
      expect(apiClient.delete).toHaveBeenCalledWith('/RenterMast/301');

      // Verify floor renter flag cleared
      expect(apiClient.put).toHaveBeenCalledWith('/DataEntry/100', expect.objectContaining({
        renterYesNo: false,
      }));
    });
  });

  describe('floor-info.service Hydration on Retrieval', () => {
    const mockFloorApiResponse = {
      success: true,
      data: {
        propertyDetailsId: 100,
        floorId: '1',
        renterYesNo: true,
      },
    };

    const mockDetailsResponse = {
      success: true,
      data: {
        items: [
          { id: 201, propertyDetailsId: 100, agreementId: 'AGR-100' },
          { id: 202, propertyDetailsId: 200, agreementId: 'AGR-200' },
        ],
      },
    };

    const mockMastResponse = {
      success: true,
      data: [
        { id: 301, propertyDetailsId: 100, financialYear: '2026' },
      ],
    };

    beforeEach(() => {
      vi.mocked(apiClient.get).mockImplementation(async (url) => {
        if (url.includes('/DataEntry/100')) return mockFloorApiResponse;
        if (url.includes('/RenterDetails')) return mockDetailsResponse;
        if (url.includes('/RenterMast')) return mockMastResponse;
        return { success: false };
      });
    });

    it('getFloorById should concurrently fetch floor and sub-records, filter them, and return hydrated object', async () => {
      const result = await getFloorById(100);

      expect(apiClient.get).toHaveBeenCalledWith('/DataEntry/100', { cache: 'no-store' });
      expect(apiClient.get).toHaveBeenCalledWith('/RenterDetails');
      expect(apiClient.get).toHaveBeenCalledWith('/RenterMast');

      // Verify hydration:
      // renterDetails should only contain ID 201 (since 202 belongs to floor 200)
      expect(result.renterDetails).toHaveLength(1);
      expect((result.renterDetails as any[])[0].id).toBe(201);

      // renterMast should contain ID 301
      expect(result.renterMast).toHaveLength(1);
      expect((result.renterMast as any[])[0].id).toBe(301);
    });

    it('getSubmissionDetails should concurrently fetch floor and sub-records, filter them, and return hydrated object', async () => {
      const result = await getSubmissionDetails(100);

      expect(result).not.toBeNull();
      expect(result!.renterDetails).toHaveLength(1);
      expect((result!.renterDetails as any[])[0].id).toBe(201);
      expect(result!.renterMast).toHaveLength(1);
      expect((result!.renterMast as any[])[0].id).toBe(301);
    });

    it('should return empty/null safely and not trigger API requests when queried with invalid IDs (NaN or <= 0)', async () => {
      const getSpy = vi.spyOn(apiClient, 'get');
      
      const floorRes = await getFloorById('new');
      expect(floorRes).toEqual({});
      
      const subRes = await getSubmissionDetails(NaN);
      expect(subRes).toBeNull();
      
      // Verify that apiClient.get was NOT called for invalid/NaN IDs
      expect(getSpy).not.toHaveBeenCalledWith(expect.stringContaining('NaN'), expect.any(Object));
      expect(getSpy).not.toHaveBeenCalledWith(expect.stringContaining('new'), expect.any(Object));
      
      getSpy.mockRestore();
    });
  });

  describe('updateRenterDetails', () => {
    const mockDetailsGetResponse = {
      success: true,
      data: [
        { id: 201, propertyDetailsId: 228338, agreementId: 'AGR-201' },
      ],
    };

    const mockMastGetResponse = {
      success: true,
      data: [
        { id: 301, propertyDetailsId: 228338, financialYear: '2026' },
      ],
    };

    it('should update floor, extract wrapped floor details from items envelope, and hydrate it with RenterDetails & RenterMast', async () => {
      const mockPutResponse = {
        success: true,
        message: "Record updated successfully",
        data: {
          items: {
            id: 228338,
            propertyDetailsId: 228338,
            floorId: '2',
            renterYesNo: true,
          }
        }
      };

      vi.mocked(apiClient.put).mockResolvedValue(mockPutResponse);
      vi.mocked(apiClient.get).mockImplementation(async (url) => {
        if (url.includes('/RenterDetails')) return mockDetailsGetResponse;
        if (url.includes('/RenterMast')) return mockMastGetResponse;
        return { success: false };
      });

      const payload = { floorId: '2', renterYesNo: true };
      const result = await updateRenterDetails(228338, payload) as Record<string, any>;

      expect(apiClient.put).toHaveBeenCalledWith('/DataEntry/228338', expect.any(Object));
      expect(apiClient.get).toHaveBeenCalledWith('/RenterDetails');
      expect(apiClient.get).toHaveBeenCalledWith('/RenterMast');

      expect(result).toBeDefined();
      expect(result.id).toBe(228338);
      expect(result.renterDetails).toHaveLength(1);
      expect(result.renterDetails[0].id).toBe(201);
      expect(result.renterMast).toHaveLength(1);
      expect(result.renterMast[0].id).toBe(301);
    });

    it('should throw ApiError if PUT fails', async () => {
      vi.mocked(apiClient.put).mockResolvedValue({
        success: false,
        statusCode: 400,
        error: "Invalid payload details"
      });

      await expect(updateRenterDetails(228338, {})).rejects.toThrow("Invalid payload details");
    });
  });
});

