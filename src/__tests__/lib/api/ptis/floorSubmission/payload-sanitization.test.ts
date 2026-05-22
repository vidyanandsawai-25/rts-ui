/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect } from 'vitest';
import { sanitizeRenterPayload } from '@/lib/api/ptis/floorSubmission/payload-sanitization';

describe('Payload Sanitization Tests', () => {
  describe('sanitizeRenterPayload - UI Normalized & Raw Keys', () => {
    it('should map UI-friendly keys to standard database keys successfully', () => {
      const uiPayload = {
        id: 206094,
        propertyDetailsId: 206094,
        propertyId: 1024,
        // UI normalized keys
        conYr: '2020',
        asstYr: '2021',
        rooms: 4,
        areaSqM: 120,
        areaSqFt: 1290,
        builtupAreaSqM: 130,
        builtupAreaSqFt: 1400,
        renter: 'Yes',
        isTaxable: 'Yes',
        renterName: 'Alice Renter',
        
        // Renter Details
        renterDetails: [
          {
            id: 405,
            agreementId: 'AGR-2026-UI',
            incrementFrequency: 'Yearly',
            incrementType: 'Percentage',
            incrementValue: 5,
            durationFrom: '2026-01-01',
            durationTo: '2026-12-31',
            rentMonthly: 1200,
          }
        ],
        // Renter Mast
        renterMast: [
          {
            id: 505,
            financialYear: '2026-27',
            finalRent: 14400,
            durationFrom: '2026-01-01',
            durationTo: '2026-12-31',
          }
        ],
        // UI rooms data
        roomData: [
          {
            id: 601,
            length: 5,
            width: 4,
            height: 3,
            area: 20,
            roomCount: 1,
            utilities: 'Bedroom',
            outer: 'Yes',
            offsetMinus: 'No',
          }
        ]
      };

      const result = sanitizeRenterPayload(uiPayload);

      // Verify Floor Base Attributes mapping
      expect(result.id).toBe(206094);
      expect(result.propertyDetailsId).toBe(206094);
      expect(result.propertyId).toBe(1024);
      expect(result.constructionYear).toBe('2020');
      expect(result.assessmentYear).toBe('2021');
      expect(result.noOfRooms).toBe(4);
      expect(result.carpetAreaSqMeter).toBe(120);
      expect(result.carpetAreaSqFeet).toBe(1290);
      expect(result.builtupAreaSqMeter).toBe(130);
      expect(result.builtupAreaSqFeet).toBe(1400);
      expect(result.renterYesNo).toBe(true);
      expect(result.isRenter).toBe(true);
      expect(result.isTaxable).toBe(true);
      expect(result.renterName).toBe('Alice Renter');

      // Verify Renter Details
      expect(result.renterDetails).toHaveLength(1);
      const rd = (result.renterDetails as any[])[0];
      expect(rd.id).toBe(405);
      expect(rd.propertyDetailsId).toBe(206094);
      expect(rd.agreementId).toBe('AGR-2026-UI');
      expect(rd.rentMonthly).toBe(1200);

      // Verify Renter Mast & Renters
      expect(result.renterMast).toHaveLength(1);
      expect(result.renters).toHaveLength(1);
      const rm = (result.renterMast as any[])[0];
      expect(rm.id).toBe(505);
      expect(rm.propertyDetailsId).toBe(206094);
      expect(rm.financialYear).toBe('2026'); // strictly 4-char truncated
      const rers = (result.renters as any[])[0];
      expect(rers.id).toBe(505);
      expect(rers.propertyDetailsId).toBe(206094);
      expect(rers.financialYear).toBe('2026');

      // Verify Room mapping and injection
      expect(result.roomWiseSubmissionDetails).toHaveLength(1);
      const room = (result.roomWiseSubmissionDetails as any[])[0];
      expect(room.id).toBe(601);
      expect(room.propertyDetailsId).toBe(206094);
      expect(room.lengthMtr).toBe(5);
      expect(room.widthMtr).toBe(4);
      expect(room.heightMtr).toBe(3);
      expect(room.areaSqMtr).toBe(20);
      expect(room.roomType).toBe('Bedroom');
      expect(room.outerYesNo).toBe(true);
      expect(room.minusYesNo).toBe(false);
    });

    it('should fall back to raw API keys if UI keys are not present', () => {
      const rawPayload = {
        propertyDetailsId: 206094,
        propertyId: 1024,
        constructionYear: '2019',
        assessmentYear: '2020',
        noOfRooms: 3,
        carpetAreaSqMeter: 100,
        carpetAreaSqFeet: 1076,
        builtupAreaSqMeter: 110,
        builtupAreaSqFeet: 1184,
        renterYesNo: true,
        isTaxable: false,
        renterNameEnglish: 'Bob Renter',
        
        roomWiseSubmissionDetails: [
          {
            id: 701,
            lengthMtr: 6,
            widthMtr: 5,
            heightMtr: 3,
            areaSqMtr: 30,
            noOfRooms: 1,
            roomType: 'Hall',
            outerYesNo: false,
            minusYesNo: true,
          }
        ]
      };

      const result = sanitizeRenterPayload(rawPayload);

      expect(result.constructionYear).toBe('2019');
      expect(result.assessmentYear).toBe('2020');
      expect(result.noOfRooms).toBe(3);
      expect(result.carpetAreaSqMeter).toBe(100);
      expect(result.carpetAreaSqFeet).toBe(1076);
      expect(result.builtupAreaSqMeter).toBe(110);
      expect(result.builtupAreaSqFeet).toBe(1184);
      expect(result.renterYesNo).toBe(true);
      expect(result.isRenter).toBe(true);
      expect(result.isTaxable).toBe(false);
      expect(result.renterName).toBe('Bob Renter');

      expect(result.roomWiseSubmissionDetails).toHaveLength(1);
      const room = (result.roomWiseSubmissionDetails as any[])[0];
      expect(room.id).toBe(701);
      expect(room.lengthMtr).toBe(6);
      expect(room.widthMtr).toBe(5);
      expect(room.areaSqMtr).toBe(30);
      expect(room.roomType).toBe('Hall');
      expect(room.minusYesNo).toBe(true);
    });

    it('should deduplicate room entries by ID or roomNo', () => {
      const payload = {
        propertyDetailsId: 206094,
        roomWiseSubmissionDetails: [
          { id: 1, roomNo: 'R-1', lengthMtr: 5 }
        ],
        roomData: [
          { id: 1, roomNo: 'R-1', length: 5 }, // Duplicate ID & roomNo
          { id: 2, roomNo: 'R-2', length: 6 }  // Unique
        ]
      };

      const result = sanitizeRenterPayload(payload);
      expect(result.roomWiseSubmissionDetails).toHaveLength(2);
      const ids = (result.roomWiseSubmissionDetails as any[]).map(r => r.id);
      expect(ids).toContain(1);
      expect(ids).toContain(2);
    });
  });
});
