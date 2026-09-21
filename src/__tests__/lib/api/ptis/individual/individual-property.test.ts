import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  formatIndianCurrency,
  mapIndividualPerformanceData,
  mapIndividualPropertyDtoToMasterData,
} from '@/lib/api/ptis/individual/individual-property.mapper';
import {
  fetchIndividualQcTopSection,
  patchIndividualProperty,
} from '@/lib/api/ptis/individual/individual-property.service';
import {
  getIndividualQcTopSectionAction,
  patchIndividualPropertyAction,
} from '@/lib/api/ptis/individual/individual-property.actions';
import {
  buildInitialIndividualMasterData,
  type PtisPageData,
} from '@/app/[locale]/property-tax/ptis/individual/individual-property.builder';
import { apiClient } from '@/services/api.service';
import * as individualService from '@/lib/api/ptis/individual/individual-property.service';
import * as apartmentService from '@/lib/api/ptis/apartment/apartment-qc-top-section.service';
import type { ApartmentQcTopSectionDto } from '@/lib/api/ptis/apartment/apartment-qc-top-section.service';
import * as propertySocietyService from '@/lib/api/property-society.service';
import { revalidatePath } from 'next/cache';
import type {
  IndividualPropertyDto,
  IndividualAdditionalRevenueDto,
  IndividualPropertyMasterData,
  IndividualPerformanceData,
} from '@/types/property-tax/individual';

vi.mock('@/lib/utils/document-utils', () => ({
  getViewDocumentUrl: (guid: string) => `https://test.docs.com/view/${guid}`,
}));

vi.mock('@/services/api.service', () => ({
  apiClient: {
    get: vi.fn(),
    patch: vi.fn(),
  },
}));

vi.mock('@/lib/api/ptis/apartment/apartment-qc-top-section.service', () => ({
  fetchApartmentQcTopSection: vi.fn(),
}));

vi.mock('@/lib/api/property-society.service', () => ({
  getPropertySocietyDetails: vi.fn(),
}));

describe('Individual Property - API, Mapper, Actions & Builder', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // ==========================================
  // 1. MAPPER TESTS
  // ==========================================
  describe('individual-property.mapper', () => {
    describe('formatIndianCurrency', () => {
      it('formats valid, negative, zero and edge cases correctly', () => {
        expect(formatIndianCurrency(null)).toBe('₹0');
        expect(formatIndianCurrency(undefined)).toBe('₹0');
        expect(formatIndianCurrency('')).toBe('₹0');
        expect(formatIndianCurrency('invalid')).toBe('₹0');
        expect(formatIndianCurrency(0)).toBe('₹0');
        expect(formatIndianCurrency(116318)).toBe('₹1,16,318');
        expect(formatIndianCurrency(-659221)).toBe('-₹6,59,221');
        expect(formatIndianCurrency('5000')).toBe('₹5,000');
      });
    });

    describe('mapIndividualPerformanceData', () => {
      it('returns zeroed defaults when rev is null or undefined', () => {
        const res = mapIndividualPerformanceData(null);
        expect(res.thisAssessmentRevenue).toBe('₹0');
        expect(res.isGrowthNegative).toBe(false);
        expect(res.collectionPercent).toBe('0%');
      });

      it('maps positive revenue metrics accurately', () => {
        const mockRev: IndividualAdditionalRevenueDto = {
          currentTax: 50000,
          retroTax: 10000,
          totalTax: 60000,
          totalDemand: 60000,
          pendingDemand: 10000,
          collection: 30000,
          collectionPercentage: 50,
          totalBalance: 30000,
          differenceAmount: 15000,
          oldCurrentTax: 45000,
          changePercent: 33.33,
        };
        const res = mapIndividualPerformanceData(mockRev);
        expect(res.thisAssessmentRevenue).toBe('₹15,000');
        expect(res.isGrowthNegative).toBe(false);
        expect(res.differenceAmount).toBe('₹15,000');
      });

      it('maps negative difference and growth correctly', () => {
        const mockRev: IndividualAdditionalRevenueDto = {
          currentTax: 20000,
          differenceAmount: -10000,
          changePercent: -28.5,
        };
        const res = mapIndividualPerformanceData(mockRev);
        expect(res.isGrowthNegative).toBe(true);
        expect(res.differenceAmount).toBe('-₹10,000');
        expect(res.thisAssessmentRevenue).toBe('-₹10,000');
      });

      it('handles array input for additionalRevenue correctly', () => {
        const mockRevArray: IndividualAdditionalRevenueDto[] = [
          {
            currentTax: 116340,
            retroTax: 953,
            totalTax: 117293,
            differenceAmount: -60871979,
            changePercent: -99.81,
          },
        ];
        const res = mapIndividualPerformanceData(mockRevArray);
        expect(res.thisAssessmentRevenue).toBe('-₹6,08,71,979');
        expect(res.differenceAmount).toBe('-₹6,08,71,979');
        expect(res.totalTax).toBe('₹1,17,293');
        expect(res.isGrowthNegative).toBe(true);
      });
    });

    describe('mapIndividualPropertyDtoToMasterData', () => {
      it('returns default placeholders when dto is null', () => {
        const res = mapIndividualPropertyDtoToMasterData(null);
        expect(res.propertyNo).toBe('-');
        expect(res.upic).toBe('-');
        expect(res.status).toBe('ACTIVE PROPERTY');
      });

      it('maps full DTO with Aadhar, photos, and areas accurately', () => {
        const mockDto: IndividualPropertyDto = {
          propertyId: 101,
          propertyNo: 'PROP-101',
          upicId: 'UPIC-999',
          ownerName: 'Rajesh Sharma',
          holderRegional: 'राजेश शर्मा',
          occupierName: 'Amit Verma',
          occupierRegional: 'अमित वर्मा',
          ownerCategory: 'RESIDENTIAL',
          division: 'East Division',
          moujaName: 'Central Mouja',
          surveyNo: '142/A',
          taxZone: 'Zone-1',
          plotNo: 'Plot 42',
          aadharNo: '585675914738',
          ownerTitle: 'Mr',
          mobileNo: '9876543210',
          alternateMobileNo: '9876543211',
          emailId: 'rajesh@example.com',
          fullAddress: 'Flat 101, Galaxy Heights',
          plotAreaFt: 1200,
          plotAreaMtr: 111.48,
          individualPropertyPhotoGuid: 'photo-guid-123',
        };

        const res = mapIndividualPropertyDtoToMasterData(mockDto);
        expect(res.propertyId).toBe(101);
        expect(res.aadharWithTitle).toBe('5856 7591 4738 / Mr');
        expect(res.plotAreaFtMtr).toBe('1200 Ft / 111.48 Mtr');
        expect(res.societyBuildingPhotoGuid).toBe('photo-guid-123');
        expect(res.imageUrl).toBe('https://test.docs.com/view/photo-guid-123');
      });

      it('formats aadhar and title across variations', () => {
        expect(mapIndividualPropertyDtoToMasterData({ aadharNo: '123456789012' }).aadharWithTitle).toBe('1234 5678 9012');
        expect(mapIndividualPropertyDtoToMasterData({ ownerTitle: 'Mrs' }).aadharWithTitle).toBe('Mrs');
        expect(mapIndividualPropertyDtoToMasterData({}).aadharWithTitle).toBe('-');
      });

      it('resolves photo GUID hierarchy and area variants', () => {
        const resPhoto = mapIndividualPropertyDtoToMasterData({
          individualPropertyGuid: 'photo-2',
          societyBuildingPhotoGuid: 'photo-3',
        });
        expect(resPhoto.societyBuildingPhotoGuid).toBe('photo-2');

        expect(mapIndividualPropertyDtoToMasterData({ plotAreaFt: 500 }).plotAreaFtMtr).toBe('500 Ft');
        expect(mapIndividualPropertyDtoToMasterData({ carpetAreaMtr: 45 }).carpetAreaFtMtr).toBe('45 Mtr');
        expect(mapIndividualPropertyDtoToMasterData({ builtUpAreaMtr: 0 }).builtUpAreaFtMtr).toBe('0 Mtr');
        expect(mapIndividualPropertyDtoToMasterData({}).plotAreaFtMtr).toBe('-');
      });
    });
  });

  // ==========================================
  // 2. SERVICE TESTS
  // ==========================================
  describe('individual-property.service', () => {
    it('fetchIndividualQcTopSection succeeds with uppercase and lowercase endpoints', async () => {
      vi.mocked(apiClient.get).mockResolvedValueOnce({
        success: true,
        data: { items: { propertyId: 101 } },
      });
      const res1 = await fetchIndividualQcTopSection(101);
      expect(res1.success).toBe(true);

      vi.mocked(apiClient.get)
        .mockResolvedValueOnce({ success: false })
        .mockResolvedValueOnce({ success: true, data: { items: { propertyId: 102 } } });
      const res2 = await fetchIndividualQcTopSection(102);
      expect(res2.success).toBe(true);
    });

    it('fetchIndividualQcTopSection handles errors and exceptions', async () => {
      vi.mocked(apiClient.get).mockResolvedValue({ success: false, error: 'Failed' });
      const res1 = await fetchIndividualQcTopSection(103);
      expect(res1.success).toBe(false);

      vi.mocked(apiClient.get).mockRejectedValueOnce(new Error('Network error'));
      const res2 = await fetchIndividualQcTopSection(104);
      expect(res2.success).toBe(false);
      expect(res2.error).toBe('Network error');
    });

    it('patchIndividualProperty succeeds and falls back to root endpoint', async () => {
      vi.mocked(apiClient.patch).mockResolvedValueOnce({ success: true });
      const res1 = await patchIndividualProperty(201, { aadharNo: '123' });
      expect(res1.success).toBe(true);

      vi.mocked(apiClient.patch)
        .mockResolvedValueOnce({ success: false })
        .mockResolvedValueOnce({ success: true, data: { updated: true } });
      const res2 = await patchIndividualProperty(202, {});
      expect(res2.success).toBe(true);

      vi.mocked(apiClient.patch).mockRejectedValueOnce(new Error('Patch error'));
      const res3 = await patchIndividualProperty(203, {});
      expect(res3.success).toBe(false);
    });
  });

  // ==========================================
  // 3. ACTIONS TESTS
  // ==========================================
  describe('individual-property.actions', () => {
    it('getIndividualQcTopSectionAction handles missing id, success, and fallbacks', async () => {
      const resEmpty = await getIndividualQcTopSectionAction('');
      expect(resEmpty.success).toBe(false);

      vi.spyOn(individualService, 'fetchIndividualQcTopSection').mockResolvedValueOnce({
        success: true,
        data: { propertyId: 501, ownerName: 'Sunil' } as unknown as IndividualPropertyDto,
      });
      const resSuccess = await getIndividualQcTopSectionAction(501);
      expect(resSuccess.success).toBe(true);
      expect(resSuccess.data?.ownerName).toBe('Sunil');

      // Fallback to apartment service
      vi.spyOn(individualService, 'fetchIndividualQcTopSection').mockResolvedValueOnce({ success: false });
      vi.mocked(apartmentService.fetchApartmentQcTopSection).mockResolvedValueOnce({
        success: true,
        data: { propertyOverview: { propertyId: '502' } } as unknown as ApartmentQcTopSectionDto,
      });
      vi.mocked(propertySocietyService.getPropertySocietyDetails).mockResolvedValueOnce(null);
      const resFallback = await getIndividualQcTopSectionAction(502);
      expect(resFallback.success).toBe(true);

      // Complete failure
      vi.spyOn(individualService, 'fetchIndividualQcTopSection').mockResolvedValueOnce({ success: false });
      vi.mocked(apartmentService.fetchApartmentQcTopSection).mockResolvedValueOnce({ success: false });
      vi.mocked(propertySocietyService.getPropertySocietyDetails).mockResolvedValueOnce(null);
      const resFail = await getIndividualQcTopSectionAction(503);
      expect(resFail.success).toBe(false);
    });

    it('patchIndividualPropertyAction validates id, revalidates paths, and handles errors', async () => {
      const resNoId = await patchIndividualPropertyAction('', {});
      expect(resNoId.success).toBe(false);

      vi.spyOn(individualService, 'patchIndividualProperty').mockResolvedValueOnce({ success: true });
      const resSuccess = await patchIndividualPropertyAction(601, {}, 'en');
      expect(resSuccess.success).toBe(true);
      expect(revalidatePath).toHaveBeenCalledWith('/en/property-tax/ptis/individual', 'page');

      vi.spyOn(individualService, 'patchIndividualProperty').mockRejectedValueOnce(new Error('Crash'));
      const resCrash = await patchIndividualPropertyAction(602, {});
      expect(resCrash.success).toBe(false);
    });
  });

  // ==========================================
  // 4. BUILDER TESTS
  // ==========================================
  describe('individual-property.builder', () => {
    const emptyPageData = {
      propertyDetailsResult: undefined,
      societyDetails: undefined,
      kycDetails: undefined,
      tabHeaderInfo: undefined,
      rawPropertyData: undefined,
      initialPhotos: [],
      initialPhotoSlots: [],
    } as unknown as PtisPageData;

    it('returns undefined when neither propertyId nor baseData is provided', () => {
      expect(buildInitialIndividualMasterData({ pageData: emptyPageData })).toBeUndefined();
    });

    it('builds master data prioritizing baseData and falling back to pageData', () => {
      const resBase = buildInitialIndividualMasterData({
        resolvedPropertyId: 101,
        baseData: {
          propertyNo: 'BASE-1',
          wardNo: 'W-01',
          ownerName: 'Base Owner',
          status: 'ACTIVE PROPERTY',
          performance: { thisAssessmentRevenue: '₹50,000' } as unknown as IndividualPerformanceData,
        } as unknown as IndividualPropertyMasterData,
        pageData: emptyPageData,
      });
      expect(resBase?.propertyId).toBe(101);
      expect(resBase?.propertyNo).toBe('BASE-1');
      expect(resBase?.ownerName).toBe('Base Owner');

      const pageData = {
        propertyDetailsResult: {
          propertyDetails: {
            wardNo: 'W-05',
            propertyNo: 'PROP-999',
            upicId: 'UPIC-999',
            ownerName: 'Details Owner',
            plotArea: '1500',
            taxZone: 'Zone-1',
            taxZoneName: 'Main',
          },
        },
        kycDetails: {
          propertyHolderName: 'KYC Holder',
          aadharNo: '987654321098',
          title: 'Mr',
        },
        initialPhotos: [{ photoTypeCode: 'PROPERTY_PHOTO', documentGuid: 'prop-guid' }],
        initialPhotoSlots: [],
      } as unknown as PtisPageData;

      const resFallback = buildInitialIndividualMasterData({
        resolvedPropertyId: 202,
        pageData,
      });
      expect(resFallback?.propertyId).toBe(202);
      expect(resFallback?.ownerName).toBe('KYC Holder');
      expect(resFallback?.plotAreaFtMtr).toBe('1500 sq.ft');
      expect(resFallback?.taxZoneAndName).toBe('Zone-1 - Main');
      expect(resFallback?.societyBuildingPhotoGuid).toBe('prop-guid');
    });
  });
});
