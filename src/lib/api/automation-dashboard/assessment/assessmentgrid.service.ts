import { apiClient } from "@/services/api.service";
import { handleApiResponse } from "@/lib/utils/api";
import { getTranslations } from "next-intl/server";
import {
  AssessmentGridItems,
  AssessmentGridResponse,
  AssessmentGridType,
  PendingAssessmentItems,
  PendingAssessmentResponse
} from "@/types/automation-dashboard/assessment/assessmentgrid.type";

export async function automationGetAssessmentGrid(workflowStageId?: string | number, type: AssessmentGridType = "Total"): Promise<AssessmentGridItems | null> {
  const url = workflowStageId !== undefined && workflowStageId !== null
    ? `/AutomationDashboard/AssessmentGrid?workflowStageId=${workflowStageId}&type=${type}`
    : `/AutomationDashboard/AssessmentGrid?type=${type}`;

  const response = await apiClient.get<AssessmentGridResponse>(url, { cache: "force-cache" });
  const t = await getTranslations("automationDashboard");

  return handleApiResponse(response, t("errors.fetchAssessmentGrid") || "Failed to fetch assessment grid data").items ?? null;
}

export async function automationGetPendingAssessmentProps(
  pageNumber: number = 1,
  pageSize: number = 10
): Promise<PendingAssessmentItems | null> {
  const params = new URLSearchParams();
  params.append("pageNumber", pageNumber.toString());
  params.append("pageSize", pageSize.toString());

  const response = await apiClient.get<PendingAssessmentResponse>(
    `/AutomationDashboard/GetPendingAssessmentProps?${params.toString()}`
  ,{ cache: "force-cache" });
  const t = await getTranslations("automationDashboard");

  return handleApiResponse(response, t("errors.fetchPendingAssessmentProps") || "Failed to fetch pending assessment properties").items ?? null;
}

