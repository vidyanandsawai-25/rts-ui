"use server";

/**
 * dashboard/actions.ts
 * Fetches department + service data for the citizen dashboard.
 * Delegates to lib/api/dashboard.ts → lib/api/rts-citizen.api.ts
 *
 * Switch to real API: set NEXT_PUBLIC_USE_REAL_API=true in .env.local
 */

import { cookies } from "next/headers";
import { getDashboardDepartments } from "@/lib/api/dashboard";
import { getRtsMisDashboardData } from "@/lib/api/rts/rtsmisdashboard.service";
import {
  createTrackedExternalServiceNavigation,
  type ExternalServiceTrackingResult,
} from "@/lib/utils/rts/external-service-application";
import type { RtsMisDashboardUserApplicationItem } from "@/types/rts/rtsmisdashboard.types";
import type { DepartmentDTO } from "@/types/rts-citizen.types";

export type DashboardData = {
  departments: DepartmentDTO[];
};

export type CitizenDashboardData = DashboardData & {
  userApplications: RtsMisDashboardUserApplicationItem[];
  upicId?: string;
};

export async function getDashboardData(): Promise<DashboardData> {
  const departments = await getDashboardDepartments();
  return { departments };
}

type CitizenProfileCookie = {
  upicId?: string;
  name?: string;
  ownerId?: number;
};

/** Creates the required RTS tracking record before opening a legacy service URL. */
export async function createExternalServiceApplicationAction(
  serviceId: number
): Promise<ExternalServiceTrackingResult> {
  const cookieStore = await cookies();
  const sessionId = cookieStore.get("rts_session")?.value;
  const profileCookie = cookieStore.get("rts_citizen_profile")?.value;

  if (!sessionId || !profileCookie) {
    return {
      success: false,
      errorCode: "login-required",
      error: "Please sign in before opening this service.",
    };
  }

  try {
    const profile = JSON.parse(profileCookie) as CitizenProfileCookie;
    return createTrackedExternalServiceNavigation(serviceId, {
      sessionId,
      name: profile.name,
      ownerId: profile.ownerId,
      upicId: profile.upicId,
    });
  } catch {
    return {
      success: false,
      errorCode: "missing-citizen-profile",
      error: "Your citizen profile is incomplete. Please sign in again.",
    };
  }
}

/** Loads all citizen dashboard data from the active server-side profile session. */
export async function getCitizenDashboardData(): Promise<CitizenDashboardData> {
  let departments: DepartmentDTO[] = [];
  try {
    departments = await getDashboardDepartments();
  } catch (err) {
    console.error("Failed to fetch dashboard departments:", err);
  }

  try {
    const profileCookie = (await cookies()).get("rts_citizen_profile")?.value;
    if (!profileCookie) {
      return { departments, userApplications: [] };
    }

    const profile = JSON.parse(profileCookie) as CitizenProfileCookie;
    const upicId = profile.upicId?.trim();
    if (!upicId) {
      return { departments, userApplications: [] };
    }

    const response = await getRtsMisDashboardData({ Flag: "user", UpicId: upicId }).catch(() => ({ status: false, data: { userApplicationDashboardData: [] } }));

    return {
      departments,
      upicId,
      userApplications: response.status ? response.data.userApplicationDashboardData ?? [] : [],
    };
  } catch (error) {
    console.error("Failed to load citizen dashboard data:", error);
    return { departments, userApplications: [] };
  }
}

/** Loads the logged-in citizen's MIS applications from the server-only profile cookie. */
export async function getCitizenMisApplications(): Promise<RtsMisDashboardUserApplicationItem[]> {
  try {
    const profileCookie = (await cookies()).get("rts_citizen_profile")?.value;
    if (!profileCookie) return [];

    const profile = JSON.parse(profileCookie) as CitizenProfileCookie;
    const upicId = profile.upicId?.trim();
    if (!upicId) return [];

    const response = await getRtsMisDashboardData({ Flag: "user", UpicId: upicId });
    return response.status ? response.data.userApplicationDashboardData ?? [] : [];
  } catch (error) {
    console.error("Failed to load citizen MIS applications:", error);
    return [];
  }
}

/**
 * Looks up UPIC-linked applications first, then retries as an application number
 * when the UPIC search has no matching rows or the backend rejects it.
 */
export async function searchCitizenMisApplicationsAction(
  value: string
): Promise<{ success: boolean; items: RtsMisDashboardUserApplicationItem[]; error?: string }> {
  const normalizedValue = value.trim();
  if (!normalizedValue) {
    return {
      success: false,
      items: [],
      error: 'Please enter a UPIC ID or application number.',
    };
  }

  try {
    // 1. Try external live API (onesolutionakola.tabamc.in) by UPIC ID
    const upicResponse = await getRtsMisDashboardData({
      Flag: 'user',
      UpicId: normalizedValue,
      ApplicationNo: '',
    }).catch(() => null);

    if (
      upicResponse?.status &&
      (upicResponse.data?.userApplicationDashboardData?.length ?? 0) > 0
    ) {
      return { success: true, items: upicResponse.data.userApplicationDashboardData };
    }

    // 2. Try external live API (onesolutionakola.tabamc.in) by ApplicationNo
    const applicationResponse = await getRtsMisDashboardData({
      Flag: 'user',
      UpicId: '',
      ApplicationNo: normalizedValue,
    }).catch(() => null);

    if (
      applicationResponse?.status &&
      (applicationResponse.data?.userApplicationDashboardData?.length ?? 0) > 0
    ) {
      return { success: true, items: applicationResponse.data.userApplicationDashboardData };
    }

    // 3. Fallback: Search local RTS-API database (for newly created / local applications)
    try {
      const { getApprovalApplicationsPaged } = await import(
        "@/lib/api/rts/rts-application-approval.service"
      );
      const localResponse = await getApprovalApplicationsPaged({
        applicationNo: normalizedValue,
      });

      if (localResponse.applications && localResponse.applications.length > 0) {
        const localMappedItems: RtsMisDashboardUserApplicationItem[] =
          localResponse.applications.map((app) => ({
            applicationId: app.id,
            applicationNo: app.applicationNo,
            departmentId: app.departmentId,
            departmentName: app.departmentName,
            serviceId: app.serviceId,
            serviceName: app.serviceName,
            applicationStatus: app.applicationStatus,
            applicationDate: app.createdDate || undefined,
            createdDate: app.createdDate || undefined,
            submittedDate: app.createdDate || "",
            status: app.applicationStatus || "Pending",
            sla: 7,
          }));
        return { success: true, items: localMappedItems };
      }
    } catch (localErr) {
      console.warn("Local RTS-API tracking lookup fallback error:", localErr);
    }

    return {
      success: false,
      items: [],
      error:
        applicationResponse?.message ||
        'Unable to find an application for this value.',
    };
  } catch (error) {
    console.error('Failed to load citizen MIS applications:', error);
    return {
      success: false,
      items: [],
      error: 'Unable to find applications for this value.',
    };
  }
}

/** Fetches dynamic documents and first-stage receiving officer for a selected service modal */
export async function getServiceDetailsModalInfoAction(serviceId: number): Promise<{
  documents: { en: string; mr?: string; hi?: string }[];
  receivingOfficer: string;
}> {
  try {
    const { getRtsFieldDefinitionsByServiceId } = await import("@/lib/api/rts/rtsfielddefinition.service");
    const { apiClient } = await import("@/services/api.service");

    const [fields, stagesResponse] = await Promise.all([
      getRtsFieldDefinitionsByServiceId(serviceId).catch(() => []),
      apiClient
        .get<{
          flowId?: number;
          stages?: Array<{ stageOrder: number; stageName: string }>;
        }>(`/ApprovalFlowMaster/stages/${serviceId}`, { cache: "no-store" }, false)
        .catch(() => null),
    ]);

    // Extract dynamic documents
    const docFields = fields.filter(
      (f) =>
        (f.fieldGroup === "Document Uploads" || f.fieldType?.toLowerCase() === "file") &&
        f.isActive !== false
    );

    const documents = docFields.map((f) => {
      const en = (f.fieldLabel || f.fieldCode || "")
        .replace(/\s*\(\s*optional\s*\)/gi, "")
        .replace(/\s*\(\s*auto\s*\)/gi, "")
        .trim();
      const local = (f.fieldLabelLocal || f.fieldLabel || f.fieldCode || "")
        .replace(/\s*\(\s*optional\s*\)/gi, "")
        .replace(/\s*\(\s*ऐच्छिक\s*\)/gi, "")
        .replace(/\s*\(\s*auto\s*\)/gi, "")
        .trim();

      return {
        en: en || "Required Document",
        mr: local || en || "आवश्यक कागदपत्र",
        hi: local || en || "आवश्यक दस्तावेज़",
      };
    });

    // Extract receiving officer from Approval Stage 1
    let receivingOfficer = "-";
    const rawData = stagesResponse?.data as any;
    const stages: Array<{ stageOrder: number; stageName: string }> =
      rawData?.data?.stages || rawData?.stages || [];

    if (stages && stages.length > 0) {
      const sortedStages = [...stages].sort((a, b) => a.stageOrder - b.stageOrder);
      const stage1 = sortedStages[0];
      if (stage1?.stageName) {
        receivingOfficer = stage1.stageName.trim();
      }
    }

    return { documents, receivingOfficer };
  } catch (error) {
    console.error("Failed to fetch service details modal info:", error);
    return { documents: [], receivingOfficer: "-" };
  }
}


