import { apiClient } from "@/services/api.service";
import { handleApiResponse } from "@/lib/utils/api";
import { getTranslations } from "next-intl/server";
import { GeoSequencingPropertyDetailsResponse, GeoSequencingPropertyDetailsItems } from "@/types/automation-dashboard/geo-sequencing/geo-sequencing.type";

export async function automationGetGeoSequencingPropertyDetails(
    zoneId: string | number,
    workflowStageId: string | number,
    pageNumber: number = 1,
    pageSize: number = 10
): Promise<GeoSequencingPropertyDetailsItems | null> {
    const params = new URLSearchParams();
    params.append("zoneId", zoneId.toString());
    params.append("workflowStageId", workflowStageId.toString());
    params.append("pageNumber", pageNumber.toString());
    params.append("pageSize", pageSize.toString());

    const response = await apiClient.get<GeoSequencingPropertyDetailsResponse>(`/AutomationDashboard/GetSubGridPDData?${params.toString()}`);
    const t = await getTranslations("automationDashboard");

    return handleApiResponse(response, t("errors.fetchGeoSequencingPropertyDetails") || "Failed to fetch geo sequencing property details").items ?? null;
}
