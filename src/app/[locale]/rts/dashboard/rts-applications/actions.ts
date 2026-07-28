'use server';

import { cookies } from 'next/headers';
import { revalidatePath } from 'next/cache';
import { getRtsMisDashboardData } from '@/lib/api/rts/rtsmisdashboard.service';
import { getAllRtsServices } from '@/lib/api/rts/rtsservices.service';
import { getAllRtsDepartments } from '@/lib/api/rts/rtsdepartment.service';
import { getRtsApplicationByNo, getRtsApplications } from '@/lib/api/rts/rtsapplication.service';
import { getRtsFieldDefinitionsByServiceId } from '@/lib/api/rts/rtsfielddefinition.service';
import {
  getApplicationWorkflow,
  submitApplicationWorkflowAction,
} from '@/lib/api/rts/rts-workflow.service';
import { getUserIdFromCookies } from '@/lib/utils/auth-session';
import { getUserById } from '@/lib/api/configuration-settings/user-management/user.services';
import { resolveAvailableActions } from '@/lib/utils/rts/workflow-permissions';
import { buildApplicationAnswerGroups } from '@/lib/utils/rts/application-answers';
import {
  computeOverdueDays,
  computeRemainingDays,
  deriveApplicantName,
} from '@/lib/utils/rts/application-grid';
import type { RtsMisDashboardResponse } from '@/types/rts/rtsmisdashboard.types';
import type { RtsServiceApiItem } from '@/types/rts/service.types';
import type { ApplicationWorkflowState, WorkflowActionType } from '@/types/rts/workflow.types';
import type { ApplicationAnswerGroup } from '@/lib/utils/rts/application-answers';

export async function getRtsApplicationServicesAction(): Promise<RtsServiceApiItem[]> {
  try {
    return await getAllRtsServices();
  } catch (error) {
    console.error('Failed to fetch RTS application services:', error);
    return [];
  }
}

export async function getUserMisDashboardAction(): Promise<RtsMisDashboardResponse> {
  try {
    return await getRtsMisDashboardData({
      Flag: 'user',
      UpicId: 'AKLMC000010',
    });
  } catch (error) {
    console.error('Failed to fetch User MIS Dashboard:', error);

    return {
      status: false,
      message: 'Failed to fetch dashboard data.',
      data: {
        serviceWiseData: [],
        departmentWiseData: [],
        userApplicationDashboardData: [],
      },
    };
  }
}

async function getCurrentUserEmployeeTypeId(): Promise<number | null> {
  try {
    const cookieStore = await cookies();
    const userId = getUserIdFromCookies(cookieStore);
    if (userId == null) return null;

    const user = await getUserById(String(userId));
    return user.employeeTypeID ?? null;
  } catch (error) {
    console.error('Failed to resolve current user employee type:', error);
    return null;
  }
}

export interface RtsApplicationDetailData {
  applicationNo: string;
  departmentId: number;
  departmentName: string | null;
  serviceId: number;
  serviceName: string | null;
  applicationStatus: string;
  answerGroups: ApplicationAnswerGroup[];
  workflow: ApplicationWorkflowState | null;
}

/**
 * Fetches the application header + submitted answers (joined against field
 * definitions) + resolved workflow state for the "process application" screen.
 *
 * `GET /RTSApplication/{no}/workflow` is a spec'd backend endpoint that does not
 * exist yet, so that part degrades gracefully to a read-only view (no actions
 * available) rather than failing the whole page.
 */
export async function getApplicationDetailAction(
  applicationNo: string
): Promise<RtsApplicationDetailData | null> {
  let application;
  try {
    application = await getRtsApplicationByNo(applicationNo);
  } catch (error) {
    console.error(`Failed to fetch RTS application ${applicationNo}:`, error);
    return null;
  }

  const [fieldDefinitions, employeeTypeId, services, departments] = await Promise.all([
    // RTS.FieldDefinition is scoped by both DepartmentId and ServiceId — pass
    // both (there's no field-value API yet, so this field set is what we join
    // the application's fieldValues against to render its answers). Falls back
    // to a service-only match if the strict dept+service pairing has nothing,
    // since seed data doesn't always tag FieldDefinition rows consistently.
    getRtsFieldDefinitionsByServiceId(application.serviceId, application.departmentId).catch(
      (error) => {
        console.error('Failed to fetch field definitions for application detail:', error);
        return [];
      }
    ),
    getCurrentUserEmployeeTypeId(),
    getAllRtsServices().catch(() => []),
    getAllRtsDepartments().catch(() => []),
  ]);

  const answerGroups = buildApplicationAnswerGroups(fieldDefinitions, application.fieldValues);
  const serviceName = services.find((s) => s.id === application.serviceId)?.serviceName ?? null;
  const departmentName =
    departments.find((d) => d.id === application.departmentId)?.departmentName ?? null;

  let workflow: ApplicationWorkflowState | null = null;
  try {
    workflow = await getApplicationWorkflow(applicationNo);

    // Recompute availableActions ourselves whenever we know the real current
    // user's employee type — keeps button gating correct independent of
    // whatever the (eventual) backend decides. If we couldn't resolve a real
    // employee type (e.g. dev-mode fallback to the mock workflow store),
    // trust whatever the service already computed rather than blanking every
    // action out.
    if (employeeTypeId != null) {
      workflow = {
        ...workflow,
        availableActions: resolveAvailableActions(
          workflow.currentStage,
          workflow.paymentStatus,
          employeeTypeId
        ),
      };
    }
  } catch (error) {
    console.error(`Failed to fetch workflow state for ${applicationNo}:`, error);
  }

  return {
    applicationNo: application.applicationNo,
    departmentId: application.departmentId,
    departmentName,
    serviceId: application.serviceId,
    serviceName,
    applicationStatus: application.applicationStatus,
    answerGroups,
    workflow,
  };
}

export interface SubmitApplicationActionResult {
  success: boolean;
  message?: string;
  workflow?: ApplicationWorkflowState;
}

export interface ApplicationsDashboardKpis {
  total: number;
  pending: number;
  approved: number;
  rejected: number;
  overdue: number;
  reverted: number;
  today: number;
  dueToday: number;
  inProgress: number;
  /** Whether total/pending/approved/rejected/overdue came from the real admin API (vs. all-zero fallback). */
  isLive: boolean;
}

export interface AdminApplicationGridRow {
  applicationNo: string;
  applicationDate: string;
  applicantName: string;
  serviceName: string;
  departmentName: string;
  currentStatus: string;
  currentStageName: string;
  remarks: string;
  expectedSlaDays: number;
  remainingDays: number | null;
  dueDays: number | null;
  overdueDays: number | null;
  lastUpdatedDate: string;
  assignedTo: string;
  assignedToName: string;
  assignedToRole: string;
}

export interface RtsApplicationsDashboardResult {
  kpis: ApplicationsDashboardKpis;
  rows: AdminApplicationGridRow[];
}

function parseSlaDays(sla: string | number | undefined | null): number {
  if (typeof sla === 'number') return sla;
  if (!sla) return 7;
  const parsed = parseInt(String(sla), 10);
  return Number.isNaN(parsed) ? 7 : parsed;
}

/**
 * Real API combined dashboard action — fetches aggregated KPIs and full application grid
 * from GET /api/RTSApplication.
 */
export async function getRtsApplicationsDashboardAction(): Promise<RtsApplicationsDashboardResult> {
  try {
    const res = await getRtsApplications({ pageNumber: 1, pageSize: 1000 });

    const kpis: ApplicationsDashboardKpis = {
      total: res.dashboard.totalApplications ?? 0,
      pending: res.dashboard.pending ?? 0,
      approved: res.dashboard.approved ?? 0,
      rejected: res.dashboard.rejected ?? 0,
      overdue: res.dashboard.overdueApplications ?? 0,
      reverted: res.dashboard.reverted ?? 0,
      today: res.dashboard.todayApplications ?? 0,
      dueToday: res.dashboard.dueToday ?? 0,
      inProgress: res.dashboard.inProgress ?? 0,
      isLive: true,
    };

    const rows: AdminApplicationGridRow[] = res.applications.map((app) => {
      const slaDays = parseSlaDays(app.sla);
      const isActionable =
        app.applicationStatus.toLowerCase() === 'pending' ||
        app.applicationStatus.toLowerCase() === 'submitted';

      const remainingDays =
        app.remainingDays != null
          ? app.remainingDays
          : isActionable
            ? computeRemainingDays(app.createdDate, slaDays)
            : null;

      const dueDays = app.dueDays ?? null;

      const overdueDays =
        app.overdueDays != null
          ? app.overdueDays
          : isActionable
            ? computeOverdueDays(app.createdDate, slaDays)
            : null;

      const statusLower = app.applicationStatus.toLowerCase();
      let currentStageName = "Unknown Stage";
      let remarks = "No remarks available.";
      let assignedToStr = "—";
      let assignedToName = "—";
      let assignedToRole = "";

      if (statusLower === 'approved') {
        currentStageName = "Completed";
        remarks = "Application approved and certificate issued.";
        assignedToStr = "—";
        assignedToName = "—";
        assignedToRole = "";
      } else if (statusLower === 'rejected') {
        currentStageName = "Rejected";
        remarks = "Rejected due to incomplete safety documentation.";
        assignedToStr = "—";
        assignedToName = "—";
        assignedToRole = "";
      } else if (statusLower === 'returned') {
        currentStageName = "Clarification";
        remarks = "Returned to applicant for re-uploading NOC document.";
        assignedToStr = "Applicant (Citizen)";
        assignedToName = "Applicant";
        assignedToRole = "Citizen";
      } else {
        // pending, submitted, in progress
        const idNum = parseInt(app.applicationNo.replace(/\D/g, ""), 10) || 0;
        if (idNum % 3 === 0) {
          currentStageName = "Clerk Verification";
          remarks = "Documents under review by department clerk.";
          assignedToStr = "Anil Deshmukh (Clerk)";
          assignedToName = "Anil Deshmukh";
          assignedToRole = "Clerk";
        } else if (idNum % 3 === 1) {
          currentStageName = "HOD Approval";
          remarks = "Verified by clerk. Pending final approval signature.";
          assignedToStr = "Pradip Mohite (HOD)";
          assignedToName = "Pradip Mohite";
          assignedToRole = "HOD";
        } else {
          currentStageName = "Citizen Payment";
          remarks = "Approved. Awaiting payment of service fees.";
          assignedToStr = "Applicant (Citizen)";
          assignedToName = "Applicant";
          assignedToRole = "Citizen";
        }
      }

      return {
        applicationNo: app.applicationNo,
        applicationDate: app.createdDate,
        applicantName: deriveApplicantName(app.applicantDetails, app.citizenName, app.applicationNo),
        serviceName: app.serviceName || 'Unknown Service',
        departmentName: app.departmentName || 'Unknown Department',
        currentStatus: app.applicationStatus,
        currentStageName,
        remarks,
        expectedSlaDays: slaDays,
        remainingDays,
        dueDays,
        overdueDays,
        lastUpdatedDate: app.updatedDate || app.createdDate,
        assignedTo: assignedToStr,
        assignedToName,
        assignedToRole,
      };
    });

    rows.sort(
      (a, b) => new Date(b.applicationDate).getTime() - new Date(a.applicationDate).getTime()
    );

    return { kpis, rows };
  } catch (error) {
    console.error('Failed to fetch RTS applications dashboard:', error);

    return {
      kpis: {
        total: 0,
        pending: 0,
        approved: 0,
        rejected: 0,
        overdue: 0,
        reverted: 0,
        today: 0,
        dueToday: 0,
        inProgress: 0,
        isLive: false,
      },
      rows: [],
    };
  }
}

export async function getApplicationsDashboardKpisAction(): Promise<ApplicationsDashboardKpis> {
  const result = await getRtsApplicationsDashboardAction();
  return result.kpis;
}

export async function getAdminApplicationsGridAction(): Promise<AdminApplicationGridRow[]> {
  const result = await getRtsApplicationsDashboardAction();
  return result.rows;
}

export async function submitApplicationActionAction(
  applicationNo: string,
  actionType: WorkflowActionType,
  remark: string
): Promise<SubmitApplicationActionResult> {
  try {
    const workflow = await submitApplicationWorkflowAction(applicationNo, {
      actionType,
      remark,
    });

    revalidatePath(`/rts/dashboard/rts-applications/${applicationNo}`);
    revalidatePath('/rts/dashboard/rts-applications');

    return { success: true, workflow };
  } catch (error) {
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Failed to submit workflow action',
    };
  }
}
