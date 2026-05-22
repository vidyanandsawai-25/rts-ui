/* eslint-disable @typescript-eslint/no-explicit-any */
import { apiClient } from "@/services/api.service";
import { ApiError } from "@/lib/utils/api";
import { normalizeApiFloorData, normalizeRenterDetailItem, normalizeRenterMastItem } from "./floor-types-guard";
import { sanitizeRenterPayload } from "./payload-sanitization";
import { validateRenterFormData } from "./payload-validation";
import { createApiError } from "./error-helpers";
import { type SubmissionResponse } from '@/types/floor-details.types';

import { getFloorById } from "./floor-info.service";

/**
 * Helper to robustly extract arrays from api responses that might be wrapped in envelopes
 */
const extractArray = (resData: any): any[] => {
    if (!resData) return [];
    if (Array.isArray(resData)) return resData;
    if (Array.isArray(resData.items)) return resData.items;
    if (Array.isArray(resData.data)) return resData.data;
    if (resData.data) {
        if (Array.isArray(resData.data.items)) return resData.data.items;
        if (Array.isArray(resData.data.data)) return resData.data.data;
        if (Array.isArray(resData.data)) return resData.data;
    }
    return [];
};


const API_ENDPOINTS = {
    DATA_ENTRY: '/DataEntry',
    DATA_ENTRY_BY_ID: (id: string | number) => `/DataEntry/${encodeURIComponent(String(id))}`,
};

const TEMP_ID_THRESHOLD = 1_000_000_000_000;

/**
 * Helper function to run smart differential sync (DELETE, PUT, POST) on renter sub-tables.
 */
async function syncRenterTables(
    realPropertyDetailsId: number,
    payload: any,
    dbDetails: any[],
    dbMasts: any[]
): Promise<void> {
    const customIncrements = (payload as any).renterCustomIncrements || [];
    const mapDetailPayload = (item: any) => {
        const isCustomSegment = customIncrements.some((ci: any) => {
            if (!ci.Customfromdate || !ci.Customtodate || !item.durationFrom || !item.durationTo) return false;
            const ciFrom = new Date(ci.Customfromdate).toISOString().split('T')[0];
            const ciTo = new Date(ci.Customtodate).toISOString().split('T')[0];
            const itemFrom = new Date(item.durationFrom).toISOString().split('T')[0];
            const itemTo = new Date(item.durationTo).toISOString().split('T')[0];
            return ciFrom === itemFrom && ciTo === itemTo;
        });

        return {
            propertyDetailsId: realPropertyDetailsId,
            agreementId: String(item.agreementId || ''),
            incrementFrequency: String(item.incrementFrequency || 'Yearly'),
            incrementType: String(item.incrementType || 'Percentage'),
            incrementValue: Number(item.incrementValue || 0),
            incrementMethod: String(item.incrementMethod || 'base'),
            durationFrom: item.durationFrom ? new Date(item.durationFrom).toISOString() : null,
            durationTo: item.durationTo ? new Date(item.durationTo).toISOString() : null,
            rentAmount: Number(item.rentAmount || 0),
            rentMonthly: Number(item.rentMonthly || 0),
            increment: Number(item.increment || 0),
            incrementStatus: item.incrementStatus !== false,
            customFromDate: isCustomSegment && item.durationFrom ? new Date(item.durationFrom).toISOString() : null,
            customToDate: isCustomSegment && item.durationTo ? new Date(item.durationTo).toISOString() : null,
            customIncrementType: isCustomSegment ? String(item.incrementType || 'Percentage') : null,
            customIncrementValue: isCustomSegment ? Number(item.incrementValue || 0) : null,
            customMethod: isCustomSegment ? String(item.incrementMethod || 'base') : null,
        };
    };

    const formDetails = (payload as any).renterDetails || [];

    // Align existing database IDs to formDetails by index to ensure updates instead of recreate
    formDetails.forEach((item: any, idx: number) => {
        if ((!item.id || Number(item.id) >= TEMP_ID_THRESHOLD) && dbDetails[idx]) {
            item.id = dbDetails[idx].id;
        }
    });

    const detailsToDelete = dbDetails.filter((dbItem: any) => 
        !formDetails.some((item: any) => item.id && Number(item.id) === Number(dbItem.id))
    );
    const detailsToUpdate = formDetails.filter((item: any) => 
        item.id && Number(item.id) < TEMP_ID_THRESHOLD && dbDetails.some((dbItem: any) => Number(dbItem.id) === Number(item.id))
    );
    const detailsToCreate = formDetails.filter((item: any) => 
        !item.id || Number(item.id) >= TEMP_ID_THRESHOLD || !dbDetails.some((dbItem: any) => Number(dbItem.id) === Number(item.id))
    );

    const detailDeletePromises = detailsToDelete.map((item: any) => 
        apiClient.delete(`/RenterDetails/${item.id}`)
    );
    const detailUpdatePromises = detailsToUpdate.map((item: any) => 
        apiClient.put(`/RenterDetails/${item.id}`, { id: Number(item.id), ...mapDetailPayload(item) })
    );
    const detailCreatePromises = detailsToCreate.map((item: any) => 
        apiClient.post('/RenterDetails', mapDetailPayload(item))
    );

    const mapMastPayload = (item: any) => {
        const financialYearClean = String(item.financialYear || '').substring(0, 4);
        const rentMonthlyVal = Number(item.rentMonthly || (item.finalRent ? Number(item.finalRent) / 12 : 0) || 0);
        const finalYearlyRentVal = Number(item.finalYearlyRent || item.finalRent || (rentMonthlyVal * 12) || 0);
        
        return {
            isActive: item.isActive !== false,
            createdBy: Number(item.createdBy || 0),
            propertyDetailsId: realPropertyDetailsId,
            rentMonthly: rentMonthlyVal,
            finalRent: Number(item.finalRent || finalYearlyRentVal || 0),
            finalYearlyRent: finalYearlyRentVal,
            financialYear: financialYearClean,
            durationFrom: item.durationFrom ? new Date(item.durationFrom).toISOString() : null,
            durationTo: item.durationTo ? new Date(item.durationTo).toISOString() : null,
            taxLiability: String((payload as any).taxLiability || 'Taxable'),
            nonCalculateRentMonthly: Number(item.nonCalculateRentMonthly || rentMonthlyVal || 0),
            renterNameEnglish: String((payload as any).renterNameEnglish || (payload as any).renterName || ''),
            renterName: String((payload as any).renterName || (payload as any).renterNameEnglish || ''),
            agreementDate: (payload as any).agreementDate ? new Date((payload as any).agreementDate).toISOString() : null,
            agreementFromDate: (payload as any).agreementFromDate ? new Date((payload as any).agreementFromDate).toISOString() : null,
            agreementToDate: (payload as any).agreementToDate ? new Date((payload as any).agreementToDate).toISOString() : null,
        };
    };

    const formMasts = (payload as any).renterMast || [];

    // Align existing database IDs to formMasts by financialYear to ensure updates instead of recreate
    formMasts.forEach((item: any) => {
        if (!item.id || Number(item.id) >= TEMP_ID_THRESHOLD) {
            const matchedDb = dbMasts.find((dbItem: any) => 
                String(dbItem.financialYear).substring(0, 4) === String(item.financialYear).substring(0, 4)
            );
            if (matchedDb) {
                item.id = matchedDb.id;
            }
        }
    });

    const mastsToDelete = dbMasts.filter((dbItem: any) => 
        !formMasts.some((item: any) => item.id && Number(item.id) === Number(dbItem.id))
    );
    const mastsToUpdate = formMasts.filter((item: any) => 
        item.id && Number(item.id) < TEMP_ID_THRESHOLD && dbMasts.some((dbItem: any) => Number(dbItem.id) === Number(item.id))
    );
    const mastsToCreate = formMasts.filter((item: any) => 
        !item.id || Number(item.id) >= TEMP_ID_THRESHOLD || !dbMasts.some((dbItem: any) => Number(dbItem.id) === Number(item.id))
    );

    const mastDeletePromises = mastsToDelete.map((item: any) => 
        apiClient.delete(`/RenterMast/${item.id}`)
    );
    const mastUpdatePromises = mastsToUpdate.map((item: any) => 
        apiClient.put(`/RenterMast/${item.id}`, { id: Number(item.id), ...mapMastPayload(item) })
    );
    const mastCreatePromises = mastsToCreate.map((item: any) => 
        apiClient.post('/RenterMast', mapMastPayload(item))
    );

    await Promise.all([
        ...detailDeletePromises,
        ...detailUpdatePromises,
        ...detailCreatePromises,
        ...mastDeletePromises,
        ...mastUpdatePromises,
        ...mastCreatePromises
    ]);
}

/**
 * Submits/upserts renter details for a specific floor.
 * Follows the floor-submission pattern with validation, sanitization, and normalization.
 */
export async function saveRenterDetails(floorId: string | number, payload: unknown): Promise<Record<string, unknown> | unknown> {
    try {
        validateRenterFormData(payload);
        
        // Determine if this is an update (PUT) or create (POST) on the floor object
        let propertyDetailsId = Number(floorId);
        if (isNaN(propertyDetailsId) || propertyDetailsId <= 0) {
            propertyDetailsId = Number((payload as any).propertyDetailsId || (payload as any).id);
        }
        if (isNaN(propertyDetailsId) || propertyDetailsId <= 0) {
            propertyDetailsId = 0;
        }
        const TEMP_ID_THRESHOLD = 1_000_000_000_000;
        const isUpdate = propertyDetailsId > 0 && propertyDetailsId < TEMP_ID_THRESHOLD;

        let dbDetails: any[] = [];
        let dbMasts: any[] = [];

        // For updates, fetch and align existing database IDs to prevent backend duplicate recreation
        if (isUpdate) {
            try {
                const [existingDetailsRes, existingMastRes] = await Promise.all([
                    apiClient.get<any>(`/RenterDetails?PageSize=100000&PropertyDetailsId=${propertyDetailsId}`),
                    apiClient.get<any>(`/RenterMast?PageSize=100000&PropertyDetailsId=${propertyDetailsId}`)
                ]);

                const existingDetailsData = existingDetailsRes.success ? extractArray(existingDetailsRes.data).map(normalizeRenterDetailItem) : [];
                dbDetails = existingDetailsData.filter((item: any) => item && Number(item.propertyDetailsId) === propertyDetailsId);

                const existingMastData = existingMastRes.success ? extractArray(existingMastRes.data).map(normalizeRenterMastItem) : [];
                dbMasts = existingMastData.filter((item: any) => item && Number(item.propertyDetailsId) === propertyDetailsId);

                // Align existing database IDs to payload.renterDetails
                const formDetails = (payload as any).renterDetails || [];
                formDetails.forEach((item: any, idx: number) => {
                    if ((!item.id || Number(item.id) >= TEMP_ID_THRESHOLD) && dbDetails[idx]) {
                        item.id = dbDetails[idx].id;
                    }
                });

                // Align existing database IDs to payload.renterMast
                const formMasts = (payload as any).renterMast || [];
                formMasts.forEach((item: any) => {
                    if (!item.id || Number(item.id) >= TEMP_ID_THRESHOLD) {
                        const matchedDb = dbMasts.find((dbItem: any) => 
                            String(dbItem.financialYear).substring(0, 4) === String(item.financialYear).substring(0, 4)
                        );
                        if (matchedDb) {
                            item.id = matchedDb.id;
                        }
                    }
                });
            } catch (err) {
                console.warn("Failed to fetch/align existing records before save", err);
            }
        }

        // Run the differential sync FIRST for updates to clean up and avoid sequence exceptions
        if (isUpdate) {
            await syncRenterTables(propertyDetailsId, payload, dbDetails, dbMasts);
        }

        const resolvedId = propertyDetailsId > 0 ? propertyDetailsId : undefined;
        const payloadWithIds = {
            ...(payload as any),
            ...(resolvedId ? {
                id: resolvedId,
                propertyDetailsId: resolvedId,
            } : {}),
        };
        const sanitizedPayload = sanitizeRenterPayload(payloadWithIds);
        const { renterDetails: _renterDetails, renterMast: _renterMast, renters: _renters, ...floorAttributesPayload } = sanitizedPayload;

        let response;
        if (isUpdate) {
            response = await apiClient.put<SubmissionResponse>(API_ENDPOINTS.DATA_ENTRY_BY_ID(propertyDetailsId), floorAttributesPayload);
        } else {
            response = await apiClient.post<SubmissionResponse>(API_ENDPOINTS.DATA_ENTRY, floorAttributesPayload);
        }

        if (!response.success) {
            const errorMsg = response.error || "";
            const isDuplicate = errorMsg.toLowerCase().includes("already exists") ||
                errorMsg.toLowerCase().includes("duplicate");

            if (!isDuplicate) {
                throw createApiError(response.statusCode, response.error, "Save renter floor attributes failed");
            }
            
            // If the backend indicates a duplicate, we proceed to sync the renter details/master records
            console.warn("Ignoring backend duplicate floor attributes warning to proceed with saving renter details:", errorMsg);
        }

        // Retrieve real database propertyDetailsId assigned by database
        const floorResponse = (response?.data?.items || response?.data) as Record<string, any>;
        let realPropertyDetailsId = Number(floorResponse?.propertyDetailsId || floorResponse?.id || propertyDetailsId);
        if (isNaN(realPropertyDetailsId) || realPropertyDetailsId <= 0) {
            realPropertyDetailsId = propertyDetailsId;
        }

        // Fallback: if still no valid ID (new floor with duplicate error), find the existing floor
        if (realPropertyDetailsId <= 0) {
            const ownerID = Number((payload as any).propertyId || (payload as any).ownerID || (sanitizedPayload as any).ownerID || 0);
            if (ownerID > 0) {
                try {
                    const floorsRes = await apiClient.get<any>(`/DataEntry?PropertyId=${ownerID}&PageSize=100`);
                    if (floorsRes.success) {
                        const items = floorsRes.data?.items || (Array.isArray(floorsRes.data) ? floorsRes.data : []);
                        const payloadFloorId = String((sanitizedPayload as any).floorID || (sanitizedPayload as any).floorId || (payload as any).floorId || '');
                        const payloadSubFloorId = String((sanitizedPayload as any).subFloorID || (sanitizedPayload as any).subFloorId || (payload as any).subFloorId || '');
                        const match = (items as any[]).find((f: any) =>
                            String(f.floorID || f.floorId || '') === payloadFloorId &&
                            String(f.subFloorID || f.subFloorId || '') === payloadSubFloorId
                        );
                        if (match) {
                            realPropertyDetailsId = Number(match.propertyDetailsId || match.id);
                        }
                    }
                } catch (_e) {
                    console.warn("Failed to find existing floor after duplicate error", _e);
                }
            }
        }

        // For creates, run the differential sync AFTER the POST call
        if (!isUpdate && realPropertyDetailsId > 0) {
            try {
                const [existingDetailsRes, existingMastRes] = await Promise.all([
                    apiClient.get<any>(`/RenterDetails?PageSize=100000&PropertyDetailsId=${realPropertyDetailsId}`),
                    apiClient.get<any>(`/RenterMast?PageSize=100000&PropertyDetailsId=${realPropertyDetailsId}`)
                ]);

                const existingDetailsData = existingDetailsRes.success ? extractArray(existingDetailsRes.data).map(normalizeRenterDetailItem) : [];
                dbDetails = existingDetailsData.filter((item: any) => item && Number(item.propertyDetailsId) === realPropertyDetailsId);

                const existingMastData = existingMastRes.success ? extractArray(existingMastRes.data).map(normalizeRenterMastItem) : [];
                dbMasts = existingMastData.filter((item: any) => item && Number(item.propertyDetailsId) === realPropertyDetailsId);
            } catch (err) {
                console.warn("Failed to fetch existing records after save", err);
            }

            await syncRenterTables(realPropertyDetailsId, payload, dbDetails, dbMasts);
        }

        // Return a fully synced, hydrated floor object from the server
        return await getFloorById(realPropertyDetailsId);
    } catch (error) {
        throw error;
    }
}

/**
 * Updates an existing renter record directly.
 */
export async function updateRenterDetails(renterId: string | number, payload: unknown): Promise<Record<string, unknown> | unknown> {
    try {
        const floorIdNum = Number(renterId);
        let dbDetails: any[] = [];
        let dbMasts: any[] = [];

        if (floorIdNum > 0) {
            try {
                // Fetch existing records from /RenterDetails and /RenterMast concurrently
                const [existingDetailsRes, existingMastRes] = await Promise.all([
                    apiClient.get<any>(`/RenterDetails?PageSize=100000&PropertyDetailsId=${floorIdNum}`),
                    apiClient.get<any>(`/RenterMast?PageSize=100000&PropertyDetailsId=${floorIdNum}`)
                ]);

                const existingDetailsData = existingDetailsRes.success ? extractArray(existingDetailsRes.data).map(normalizeRenterDetailItem) : [];
                dbDetails = existingDetailsData.filter((item: any) => item && Number(item.propertyDetailsId) === floorIdNum);

                const existingMastData = existingMastRes.success ? extractArray(existingMastRes.data).map(normalizeRenterMastItem) : [];
                dbMasts = existingMastData.filter((item: any) => item && Number(item.propertyDetailsId) === floorIdNum);

                // Align existing database IDs to payload.renterDetails
                const formDetails = (payload as any).renterDetails || [];
                formDetails.forEach((item: any, idx: number) => {
                    if ((!item.id || Number(item.id) >= TEMP_ID_THRESHOLD) && dbDetails[idx]) {
                        item.id = dbDetails[idx].id;
                    }
                });

                // Align existing database IDs to payload.renterMast
                const formMasts = (payload as any).renterMast || [];
                formMasts.forEach((item: any) => {
                    if (!item.id || Number(item.id) >= TEMP_ID_THRESHOLD) {
                        const matchedDb = dbMasts.find((dbItem: any) => 
                            String(dbItem.financialYear).substring(0, 4) === String(item.financialYear).substring(0, 4)
                        );
                        if (matchedDb) {
                            item.id = matchedDb.id;
                        }
                    }
                });
            } catch (err) {
                console.warn("Failed to fetch/align existing records before direct update", err);
            }

            // Sync renter tables first to clean up duplicate records before putting new floor details
            await syncRenterTables(floorIdNum, payload, dbDetails, dbMasts);
        }

        const resolvedId = floorIdNum > 0 ? floorIdNum : undefined;
        const payloadWithIds = {
            ...(payload as any),
            ...(resolvedId ? {
                id: resolvedId,
                propertyDetailsId: resolvedId,
            } : {}),
        };
        const sanitizedPayload = sanitizeRenterPayload(payloadWithIds);
        const { renterDetails: _renterDetails, renterMast: _renterMast, renters: _renters, ...floorAttributesPayload } = sanitizedPayload;
        const response = await apiClient.put<SubmissionResponse>(API_ENDPOINTS.DATA_ENTRY_BY_ID(renterId), floorAttributesPayload);
        
        if (!response.success) {
            throw createApiError(response.statusCode, response.error, "Update renter details failed");
        }
        
        const rawFloor = (response.data?.items || response.data) as Record<string, any>;
        if (!rawFloor) {
            return response.data;
        }

        const resolvedFloorIdNum = Number(rawFloor.propertyDetailsId || rawFloor.id || renterId);

        // Concurrently fetch existing details and mast records to ensure proper hydration
        const [existingDetailsRes, existingMastRes] = await Promise.all([
            apiClient.get<any>(`/RenterDetails?PageSize=100000&PropertyDetailsId=${resolvedFloorIdNum}`),
            apiClient.get<any>(`/RenterMast?PageSize=100000&PropertyDetailsId=${resolvedFloorIdNum}`)
        ]);

        const detailsData = existingDetailsRes.success ? extractArray(existingDetailsRes.data).map(normalizeRenterDetailItem) : [];
        const floorDetails = detailsData.filter((item: any) => item && Number(item.propertyDetailsId) === resolvedFloorIdNum);

        const mastData = existingMastRes.success ? extractArray(existingMastRes.data).map(normalizeRenterMastItem) : [];
        const floorMast = mastData.filter((item: any) => item && Number(item.propertyDetailsId) === resolvedFloorIdNum);

        const mergedRawFloor = {
            ...rawFloor,
            renterDetails: (rawFloor.renterDetails && rawFloor.renterDetails.length > 0) ? rawFloor.renterDetails : floorDetails,
            renterMast: (rawFloor.renterMast && rawFloor.renterMast.length > 0) ? rawFloor.renterMast : floorMast,
            renters: (rawFloor.renters && rawFloor.renters.length > 0) ? rawFloor.renters : floorMast
        };
        
        return normalizeApiFloorData(mergedRawFloor);
    } catch (error) {
        throw error;
    }
}

/**
 * Deletes a renter record (clears renter data from floor while preserving floor data).
 */
export async function deleteRenterDetails(renterId: string | number): Promise<void> {
    try {
        if (!renterId) {
            throw new ApiError(400, "floor.errors.submissionIdRequired", "Renter ID validation failed");
        }
        
        const realRenterId = Number(renterId);
        
        // 1. Fetch sub-records
        const [existingDetailsRes, existingMastRes] = await Promise.all([
            apiClient.get<any>(`/RenterDetails?PageSize=100000&PropertyDetailsId=${realRenterId}`),
            apiClient.get<any>(`/RenterMast?PageSize=100000&PropertyDetailsId=${realRenterId}`)
        ]);
        
        const existingDetailsData = existingDetailsRes.success ? extractArray(existingDetailsRes.data).map(normalizeRenterDetailItem) : [];
        const dbDetails = existingDetailsData.filter((item: any) => item && Number(item.propertyDetailsId) === realRenterId);

        const existingMastData = existingMastRes.success ? extractArray(existingMastRes.data).map(normalizeRenterMastItem) : [];
        const dbMasts = existingMastData.filter((item: any) => item && Number(item.propertyDetailsId) === realRenterId);
            
        // 2. Delete all related details/masters in the database
        const detailDeletePromises = dbDetails.map((item: any) => 
            apiClient.delete(`/RenterDetails/${item.id}`)
        );

        const mastDeletePromises = dbMasts.map((item: any) => 
            apiClient.delete(`/RenterMast/${item.id}`)
        );
        
        await Promise.all([...detailDeletePromises, ...mastDeletePromises]);

        // 3. Following the pattern of sending a PUT with renterYesNo: 0 to clear renter data
        const response = await apiClient.put<SubmissionResponse>(API_ENDPOINTS.DATA_ENTRY_BY_ID(realRenterId), { 
            renterYesNo: false,
            isRenter: false,
            updatedBy: 0 
        });
        
        if (!response.success) {
            throw createApiError(response.statusCode, response.error, "Delete renter details failed");
        }
    } catch (error) {
        throw error;
    }
}

