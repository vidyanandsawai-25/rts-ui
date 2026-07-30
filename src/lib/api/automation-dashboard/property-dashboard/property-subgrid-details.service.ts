import { apiClient } from "@/services/api.service";
import { handleApiResponse } from "@/lib/utils/api";
import { getTranslations } from "next-intl/server";

import {
    PropertySubGridDetailsResponse,
    PropertySubGridDetailsItems,
    WardResponseItems,
    WardItem,
    PropertyTypeMasterResponseItems,
    PropertyTypeMasterItem
} from "@/types/automation-dashboard/property-dashboard/property-subgrid-details.type";

export async function automationGetPropertySubGridDetails(
    zoneId: string | number,
    workflowStageId: string | number,
    pageNumber: number = 1,
    pageSize: number = 10,
    wardId?: string | number,
    propertyDescription?: string,
    propertyTypeId?: string | number,
    assessmentTypeId?: string | number,
    searchTerm?: string,
    sortBy?: string,
    sortOrder?: string
): Promise<PropertySubGridDetailsItems | null> {
    const params = new URLSearchParams();
    params.append("zoneId", zoneId.toString());
    params.append("workflowStageId", workflowStageId.toString());
    params.append("PageNumber", pageNumber.toString());
    params.append("PageSize", pageSize.toString());

    if (wardId !== undefined && wardId !== null && wardId !== 'All') {
        params.append("WardId", wardId.toString());
    }
    if (propertyDescription !== undefined && propertyDescription !== null && propertyDescription !== 'All') {
        params.append("PropertyDescription", propertyDescription);
    }
    if (propertyTypeId !== undefined && propertyTypeId !== null && propertyTypeId !== 'All') {
        params.append("PropertyTypeId", propertyTypeId.toString());
    }
    if (assessmentTypeId !== undefined && assessmentTypeId !== null && assessmentTypeId !== 'All') {
        params.append("AssessmentTypeId", assessmentTypeId.toString());
    }
    if (searchTerm) {
        params.append("SearchTerm", searchTerm);
    }
    if (sortBy) {
        params.append("SortBy", sortBy);
    }
    if (sortOrder) {
        params.append("SortOrder", sortOrder);
    }

    const response = await apiClient.get<PropertySubGridDetailsResponse>(`/AutomationDashboard/GetSubGridPDData?${params.toString()}`, { cache: "force-cache" });
    const t = await getTranslations("automationDashboard");

    return handleApiResponse(response, t("errors.fetchGeoSequencingPropertyDetails") || "Failed to fetch geo sequencing property details").items ?? null;
}

export async function getWards(
    pageNumber: number = -1,
    pageSize: number = 10,
    zoneId?: string | number
): Promise<WardItem[] | null> {
    const params = new URLSearchParams();
    params.append("pageNumber", pageNumber.toString());
    params.append("pageSize", pageSize.toString());
    if (zoneId !== undefined) {
        params.append("zoneId", zoneId.toString());
    }

    const response = await apiClient.get<WardResponseItems>(`/Ward?${params.toString()}`,{cache: "force-cache"});
    const t = await getTranslations("automationDashboard");

    return handleApiResponse(response, t("errors.fetchGeoSequencingWardWiseSummary") || "Failed to fetch ward details").items ?? null;
}

export async function getPropertyTypeMaster(
    pageNumber: number = -1,
    pageSize: number = 10
): Promise<PropertyTypeMasterItem[] | null> {
    const params = new URLSearchParams();
    params.append("pageNumber", pageNumber.toString());
    params.append("pageSize", pageSize.toString());

    const response = await apiClient.get<PropertyTypeMasterResponseItems>(`/PropertyTypeMaster?${params.toString()}`,{cache: "force-cache"});
    const t = await getTranslations("automationDashboard");

    return handleApiResponse(response, t("errors.fetchPropertyTypeMaster") || "Failed to fetch property type master details").items ?? null;
}
