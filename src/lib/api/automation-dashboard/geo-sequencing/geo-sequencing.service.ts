import { apiClient } from "@/services/api.service";
import { handleApiResponse } from "@/lib/utils/api";
import { getTranslations } from "next-intl/server";
import {
    GeoSequencingItems,
    GeoSequencingGridResponse,
    GeoSequencingWardWiseItems,
    GeoSequencingWardWiseResponse
} from "@/types/automation-dashboard/geo-sequencing/geo-sequencing.type";

export async function automationGetGeoSequencingGrid(workflowStageId?: string | number): Promise<GeoSequencingItems | null> {
    const url = workflowStageId !== undefined && workflowStageId !== null
        ? `/AutomationDashboard/GeoSequencingGrid?workflowStageId=${workflowStageId}`
        : `/AutomationDashboard/GeoSequencingGrid`;

    const response = await apiClient.get<GeoSequencingGridResponse>(url,{ cache: "force-cache" });
    const t = await getTranslations("automationDashboard");

    const responseData = handleApiResponse(response, t("errors.fetchGeoSequencingGrid") || "Failed to fetch geo sequencing grid data");
    return responseData.items?.[0] ?? null;
}

export async function automationGetGeoSequencingWardWiseSummary(
    zoneId: string | number,
    workflowStageId?: string | number,
    pageNumber: number = 1,
    pageSize: number = 10,
    propertyTypeCategoryId?: string | null,
    categoryId?: string | null
): Promise<GeoSequencingWardWiseItems | null> {
    const params = new URLSearchParams({
        zoneId: zoneId.toString(),
        pageNumber: pageNumber.toString(),
        pageSize: pageSize.toString(),
    });

    if (workflowStageId !== undefined && workflowStageId !== null) {
        params.append("workflowStageId", workflowStageId.toString());
    }
    if (propertyTypeCategoryId) {
        params.append("PropertyTypeCategoryId", propertyTypeCategoryId);
    }
    if (categoryId) {
        params.append("PropertyTypeId", categoryId);
    }

    const response = await apiClient.get<GeoSequencingWardWiseResponse>(
        `/AutomationDashboard/GeoSequencingWardWiseSummary?${params.toString()}`
    ,{ cache: "force-cache" });
    const t = await getTranslations("automationDashboard");

    const responseData = handleApiResponse(response, t("errors.fetchGeoSequencingWardWiseSummary") || "Failed to fetch geo sequencing ward-wise summary data");
    return responseData.items?.[0] ?? null;
}