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
  resolveExternalServiceNavigation,
  type ExternalServiceNavigationResult,
} from "@/lib/utils/rts/external-service-application";
import type { RtsMisDashboardUserApplicationItem } from "@/types/rts/rtsmisdashboard.types";
import type { DepartmentDTO } from "@/types/rts-citizen.types";
import {
  getApplicationDetailAction,
  type RtsApplicationDetailData,
} from "@/app/[locale]/rts/dashboard/rts-applications/actions";
import {
  getPaymentReceiptByNo,
  getPaymentStatus,
  type PaymentReceiptResult,
  type PaymentStatusResult,
} from "@/lib/api/rts/rtspayment.service";

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

export type CitizenDashboardRouteState = {
  detailApplication: RtsMisDashboardUserApplicationItem | null;
  detail: RtsApplicationDetailData | null;
  paymentStatus: PaymentStatusResult | null;
  paymentApplication: RtsMisDashboardUserApplicationItem | null;
  receipt: PaymentReceiptResult | null;
};

type CitizenDashboardRouteInput = {
  details?: string;
  payment?: string;
  receipt?: string;
};

const emptyCitizenDashboardRouteState: CitizenDashboardRouteState = {
  detailApplication: null,
  detail: null,
  paymentStatus: null,
  paymentApplication: null,
  receipt: null,
};

function findCitizenApplication(
  applications: RtsMisDashboardUserApplicationItem[],
  applicationNo: string | undefined
): RtsMisDashboardUserApplicationItem | null {
  const normalizedApplicationNo = applicationNo?.trim().toLowerCase();
  if (!normalizedApplicationNo) return null;

  return applications.find((application) =>
    application.applicationNo.trim().toLowerCase() === normalizedApplicationNo
  ) ?? null;
}

/** Resolves reloadable dashboard overlays only for applications owned by this citizen. */
export async function getCitizenDashboardRouteState(
  applications: RtsMisDashboardUserApplicationItem[],
  input: CitizenDashboardRouteInput
): Promise<CitizenDashboardRouteState> {
  const detailApplication = findCitizenApplication(applications, input.details);
  const requestedPaymentApplication = findCitizenApplication(applications, input.payment);

  // Payment can only be nested under matching details when a Details route exists.
  let paymentApplication = detailApplication && input.payment
    ? requestedPaymentApplication?.applicationNo === detailApplication.applicationNo
      ? requestedPaymentApplication
      : null
    : requestedPaymentApplication;

  let receipt: PaymentReceiptResult | null = null;
  if (input.receipt?.trim()) {
    try {
      const candidate = await getPaymentReceiptByNo(input.receipt);
      const receiptApplication = candidate
        ? findCitizenApplication(applications, candidate.applicationNo)
        : null;

      // A receipt overlay must belong to the current citizen and to Details when nested.
      if (
        candidate &&
        receiptApplication &&
        (!detailApplication || receiptApplication.applicationNo === detailApplication.applicationNo)
      ) {
        receipt = candidate;
      }
    } catch (error) {
      console.error('Failed to resolve citizen dashboard receipt route:', error);
    }
  }

  const paymentStatusApplication = detailApplication ?? paymentApplication;
  const paymentStatusApplicationId = paymentStatusApplication
    ? Number.parseInt(paymentStatusApplication.applicationNo.replace(/\D/g, ''), 10)
    : null;
  let detail: RtsApplicationDetailData | null = null;
  let paymentStatus: PaymentStatusResult | null = null;

  if (detailApplication || paymentStatusApplication) {
    const [detailResult, paymentStatusResult] = await Promise.allSettled([
      detailApplication
        ? getApplicationDetailAction(detailApplication.applicationNo)
        : Promise.resolve(null),
      paymentStatusApplicationId && Number.isFinite(paymentStatusApplicationId) && paymentStatusApplicationId > 0
        ? getPaymentStatus(paymentStatusApplicationId)
        : Promise.resolve(null),
    ]);

    if (detailResult.status === 'fulfilled') {
      detail = detailResult.value;
    } else {
      console.warn('Failed to resolve citizen dashboard details route:', detailResult.reason);
    }

    if (paymentStatusResult.status === 'fulfilled') {
      paymentStatus = paymentStatusResult.value;
    } else {
      console.warn('Failed to resolve citizen dashboard payment status route:', paymentStatusResult.reason);
    }

    // A payment route must never open checkout for a free or unresolved payment status.
    if (
      paymentApplication &&
      (!paymentStatus || paymentStatus.isFeeRequired === false || Number(paymentStatus.requiredFee) <= 0)
    ) {
      paymentApplication = null;
    }
  }

  return {
    ...emptyCitizenDashboardRouteState,
    detailApplication,
    detail,
    paymentStatus,
    // Receipt wins over payment if both parameters are supplied.
    paymentApplication: receipt ? null : paymentApplication,
    receipt,
  };
}

type ExternalServiceNavigationActionResult =
  | ExternalServiceNavigationResult
  | {
      success: false;
      errorCode: 'login-required' | 'missing-citizen-profile';
      error: string;
    };

/** Resolves a legacy service URL without creating an RTS application record. */
export async function resolveExternalServiceNavigationAction(
  serviceId: number
): Promise<ExternalServiceNavigationActionResult> {
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
    return resolveExternalServiceNavigation(serviceId, profile.upicId);
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
      const rawItems = applicationResponse.data?.userApplicationDashboardData ?? [];
      const exactMatch = rawItems.filter(
        (item) => item.applicationNo?.trim().toLowerCase() === normalizedValue.toLowerCase()
      );
      if (exactMatch.length > 0) {
        return { success: true, items: exactMatch };
      }
      const partialMatch = rawItems.filter(
        (item) => item.applicationNo?.trim().toLowerCase().includes(normalizedValue.toLowerCase())
      );
      if (partialMatch.length > 0) {
        return { success: true, items: partialMatch };
      }
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
        const exactLocal = localResponse.applications.filter(
          (app) => app.applicationNo?.trim().toLowerCase() === normalizedValue.toLowerCase()
        );
        const filteredLocal = exactLocal.length > 0 ? exactLocal : localResponse.applications;

        const localMappedItems: RtsMisDashboardUserApplicationItem[] =
          filteredLocal.map((app) => ({
            applicationNo: app.applicationNo,
            serviceName: app.serviceName || "",
            status: app.applicationStatus || "Submitted",
            submittedDate: app.createdDate ? new Date(app.createdDate).toISOString().split('T')[0] : "",
            sla: Number(app.sla) || 0,
          }));
        return { success: true, items: localMappedItems };
      }
    } catch (localErr) {
      console.warn("Local RTS-API tracking lookup fallback error:", localErr);
    }

    // 4. Fallback: Search by Receipt No (e.g. REC/RTS/20260820/020027)
    try {
      const { getPaymentReceiptByNo } = await import("@/lib/api/rts/rtspayment.service");
      const receipt = await getPaymentReceiptByNo(normalizedValue);
      if (receipt && receipt.applicationNo) {
        const { getApprovalApplicationsPaged } = await import(
          "@/lib/api/rts/rts-application-approval.service"
        );
        const appRes = await getApprovalApplicationsPaged({
          applicationNo: receipt.applicationNo,
        });
        if (appRes.applications && appRes.applications.length > 0) {
          const mapped: RtsMisDashboardUserApplicationItem[] = appRes.applications.map((app) => ({
            applicationNo: app.applicationNo,
            serviceName: app.serviceName || receipt.serviceName || "",
            serviceNameLocal: receipt.serviceNameLocal,
            status: app.applicationStatus || "Fee Paid",
            submittedDate: app.createdDate ? new Date(app.createdDate).toISOString().split('T')[0] : "",
            sla: Number(app.sla) || 0,
          }));
          return { success: true, items: mapped };
        } else {
          const fallbackItem: RtsMisDashboardUserApplicationItem = {
            applicationNo: receipt.applicationNo,
            serviceName: receipt.serviceName || "",
            serviceNameLocal: receipt.serviceNameLocal,
            status: "Fee Paid",
            submittedDate: receipt.paymentDate ? new Date(receipt.paymentDate).toISOString().split('T')[0] : "",
            sla: 0,
          };
          return {
            success: true,
            items: [fallbackItem],
          };
        }
      }
    } catch (rcpErr) {
      console.warn("Receipt lookup fallback error:", rcpErr);
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
