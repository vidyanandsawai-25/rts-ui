import { apiClient } from "@/services/api.service";
import { handleApiResponse } from "@/lib/utils/api";
import { getTranslations } from "next-intl/server";
import {
    DataEntryGridItems,
    DataEntryGridResponse,
    DataEntryWardWiseSummaryItems,
    DataEntryWardWiseSummaryResponse
} from "@/types/automation-dashboard/data-entry-quality-check/data-entry-quality-check.type";

export async function automationGetDataEntryGrid(workflowStageId?: string | number): Promise<DataEntryGridItems | null> {
    const url = workflowStageId !== undefined && workflowStageId !== null
        ? `/AutomationDashboard/DataEntryGrid?workflowStageId=${workflowStageId}`
        : `/AutomationDashboard/DataEntryGrid`;

    const response = await apiClient.get<DataEntryGridResponse>(url, { cache: "force-cache" });
    const t = await getTranslations("automationDashboard");

    return handleApiResponse(response, t("errors.fetchDataEntryGrid") || "Failed to fetch data entry grid data").items ?? null;
}

export async function automationGetDataEntryWardWiseSummary(
    zoneId: string | number,
    workflowStageId?: string | number,
    pageNumber: number = 1,
    pageSize: number = 10,
    propertyTypeCategoryId?: string | null,
    categoryId?: string | null
): Promise<DataEntryWardWiseSummaryItems | null> {
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

    const response = await apiClient.get<DataEntryWardWiseSummaryResponse>(
        `/AutomationDashboard/DataEntryWardWiseSummary?${params.toString()}`,
        { cache: "force-cache" }
    );
    const t = await getTranslations("automationDashboard");

    return handleApiResponse(response, t("errors.fetchDataEntryWardWiseSummary") || "Failed to fetch data entry ward-wise summary data").items ?? null;
}
