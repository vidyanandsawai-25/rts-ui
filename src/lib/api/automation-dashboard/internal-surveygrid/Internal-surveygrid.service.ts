import { apiClient } from "@/services/api.service";
import { handleApiResponse } from "@/lib/utils/api";
import { getTranslations } from "next-intl/server";
import { 
    InternalSurveyGridItems, 
    InternalSurveyGridResponse,
    InternalSurveyWardWiseItems,
    InternalSurveyWardWiseResponse
} from "@/types/automation-dashboard/internal-surveygrid/internal-surveygrid.type";

export async function automationGetInternalSurveyGrid(workflowStageId?: string | number): Promise<InternalSurveyGridItems | null> {
    const url = workflowStageId !== undefined && workflowStageId !== null
        ? `/AutomationDashboard/InternalSurveyGrid?workflowStageId=${workflowStageId}`
        : `/AutomationDashboard/InternalSurveyGrid`;

    const response = await apiClient.get<InternalSurveyGridResponse>(url, { cache: "force-cache" });
    const t = await getTranslations("automationDashboard");

    return handleApiResponse(response, t("errors.fetchInternalSurveyGrid") || "Failed to fetch internal survey grid data").items ?? null;
}

export async function automationGetInternalSurveyWardWiseSummary(
    zoneId: string | number,
    workflowStageId?: string | number,
    pageNumber: number = 1,
    pageSize: number = 10,
    propertyTypeCategoryId?: string | null,
    categoryId?: string | null
): Promise<InternalSurveyWardWiseItems | null> {
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
        params.append("CategoryId", categoryId);
    }

    const response = await apiClient.get<InternalSurveyWardWiseResponse>(
        `/AutomationDashboard/InternalSurveyWardWiseSummary?${params.toString()}`,
        { cache: "force-cache" }
    );
    const t = await getTranslations("automationDashboard");

    return handleApiResponse(response, t("errors.fetchInternalSurveyWardWiseSummary") || "Failed to fetch internal survey ward-wise summary data").items ?? null;
}
