/* ---------------- FLOOR INFORMATION SERVICES ---------------- */

import { apiClient } from "@/services/api.service";
import { handleApiResponse } from "../utils/api";
import {
     SubFloor,
     Floor,
     ConstructionType,
     TypeOfUse,
     SubTypeOfUse,
     OldFloorDetailsResponse
} from "@/types/property-old-details.types";

import { PagedResponse } from "@/types/common.types";

/* ---------------- GET FLOORS ---------------- */
export async function getFloors( pageNumber: number, pageSize: number, searchTerm?: string): Promise<PagedResponse<Floor>> {
    const params = new URLSearchParams({
        PageNumber: pageNumber.toString(),
        PageSize: pageSize.toString(),
    });

    if (searchTerm?.trim()) params.append("SearchTerm", searchTerm.trim());
    const response = await apiClient.get<PagedResponse<Floor>>(`/Floor?${params.toString()}`);
    return handleApiResponse(response, "Failed to fetch floors");
}

/* ---------------- GET SUB-FLOORS ---------------- */
export async function getSubFloors(pageNumber: number, pageSize: number,
    searchTerm?: string): Promise<PagedResponse<SubFloor>> {
    const params = new URLSearchParams({
        PageNumber: pageNumber.toString(),
        PageSize: pageSize.toString(),
    });

    if (searchTerm?.trim()) params.append("SearchTerm", searchTerm.trim());
    const response = await apiClient.get<PagedResponse<SubFloor>>(`/SubFloor?${params.toString()}`);
    return handleApiResponse(response, "Failed to fetch sub-floors");
}

/* ---------------- GET CONSTRUCTION TYPES ---------------- */
export async function getConstructionTypes( pageNumber: number, pageSize: number, searchTerm?: string): Promise<PagedResponse<ConstructionType>> {
    const params = new URLSearchParams({
        PageNumber: pageNumber.toString(),
        PageSize: pageSize.toString(),
    });

    if (searchTerm?.trim()) params.append("SearchTerm", searchTerm.trim());
    const response = await apiClient.get<PagedResponse<ConstructionType>>(`/ConstructionType?${params.toString()}`);
    return handleApiResponse(response, "Failed to fetch construction types");
}

/* ---------------- GET TYPE OF USES ---------------- */
export async function getTypeOfUses( pageNumber: number, pageSize: number, searchTerm?: string): Promise<PagedResponse<TypeOfUse>> {
    const params = new URLSearchParams({
        PageNumber: pageNumber.toString(),
        PageSize: pageSize.toString(),
    });

    if (searchTerm?.trim()) params.append("SearchTerm", searchTerm.trim());

    const response = await apiClient.get<PagedResponse<TypeOfUse>>(`/TypeOfUse?${params.toString()}`);
    return handleApiResponse(response, "Failed to fetch type of uses (server-paged)");
}

/* ---------------- GET SUB TYPE OF USES ---------------- */
export async function getSubTypeOfUses( typeOfUseId: number, pageNumber: number, pageSize: number, searchTerm?: string): Promise<PagedResponse<SubTypeOfUse>> {
    const params = new URLSearchParams({
        PageNumber: pageNumber.toString(),
        PageSize: pageSize.toString(),
    });

    if (typeOfUseId > 0) params.append("typeOfUseId", typeOfUseId.toString());

    if (searchTerm?.trim()) params.append("SearchTerm", searchTerm.trim());

    const response = await apiClient.get<PagedResponse<SubTypeOfUse>>(`/SubTypeOfUse?${params.toString()}`);
    return handleApiResponse(response, `Failed to fetch sub-type of uses for ${typeOfUseId}`);
}

/* ---------------- GET OLD FLOOR DETAILS ---------------- */
export async function getOldFloordetails(propertyId: number): Promise<OldFloorDetailsResponse> {
    const response = await apiClient.get<OldFloorDetailsResponse>(`/Property/${propertyId}/floor-details-old`);
    return handleApiResponse(response, `Failed to fetch old floor details for property ${propertyId}`);
}

/* ---------------- SAVE OLD FLOOR DETAILS ---------------- */
export async function saveOldFloorDetails(propertyId: number, data: unknown): Promise<OldFloorDetailsResponse> {
    const response = await apiClient.post<OldFloorDetailsResponse>(`/Property/${propertyId}/floor-details-old`, data);
    return handleApiResponse(response, "Failed to save floor details");
}

/* ---------------- UPDATE OLD FLOOR DETAILS ---------------- */
export async function updateOldFloorDetails( propertyId: number, floorDetailId: number, data: unknown): Promise<OldFloorDetailsResponse> {
    const response = await apiClient.put<OldFloorDetailsResponse>(
        `/Property/${propertyId}/floor-details-old/${floorDetailId}`,
        data
    );
    return handleApiResponse(response, "Failed to update floor details");
}

/* ---------------- DELETE OLD FLOOR DETAILS ---------------- */
export async function deleteOldFloorDetails( propertyId: number, floorDetailId: number): Promise<void> {
    const response = await apiClient.delete<void>(
        `/Property/${propertyId}/floor-details-old/${floorDetailId}`
    );
    return handleApiResponse(response, "Failed to delete floor details");
}
