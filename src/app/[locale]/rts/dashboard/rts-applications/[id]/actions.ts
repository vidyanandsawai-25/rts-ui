'use server';

import { revalidatePath } from 'next/cache';
import { cookies } from 'next/headers';

import { getAllRtsDepartments } from '@/lib/api/rts/rtsdepartment.service';
import { getRtsFieldDefinitionsByServiceId } from '@/lib/api/rts/rtsfielddefinition.service';
import { getRtsApplicationById } from '@/lib/api/rts/rtsapplication.service';
import { getAllRtsServices } from '@/lib/api/rts/rtsservices.service';
import {
  getApplicationWorkflow,
  submitApplicationWorkflowAction,
} from '@/lib/api/rts/rts-workflow.service';
import { getUserById } from '@/lib/api/configuration-settings/user-management/user.services';
import { getUserIdFromCookies } from '@/lib/utils/auth-session';
import { buildApplicationAnswerGroups } from '@/lib/utils/rts/application-answers';
import { resolveAvailableActions } from '@/lib/utils/rts/workflow-permissions';
import type { ApplicationAnswerGroup } from '@/lib/utils/rts/application-answers';
import type { ApplicationWorkflowState, WorkflowActionType } from '@/types/rts/workflow.types';

export interface RtsApplicationDetailData {
  applicationNo: string;
  departmentId: number;
  departmentName: string | null;
  serviceId: number;
  serviceName: string | null;
  sessionId: string | null;
  ownerId: number | null;
  applicationStatus: string;
  answerGroups: ApplicationAnswerGroup[];
  workflow: ApplicationWorkflowState | null;
}

export interface SubmitApplicationActionResult {
  success: boolean;
  message?: string;
  workflow?: ApplicationWorkflowState;
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

export async function getApplicationDetailAction(
  applicationId: number
): Promise<RtsApplicationDetailData | null> {
  let application;
  try {
    application = await getRtsApplicationById(applicationId);
  } catch (error) {
    console.error(`Failed to fetch RTS application ${applicationId}:`, error);
    return null;
  }

  const [fieldDefinitions, employeeTypeId, services, departments] = await Promise.all([
    getRtsFieldDefinitionsByServiceId(application.serviceId, application.departmentId).catch((error) => {
      console.error('Failed to fetch field definitions for application detail:', error);
      return [];
    }),
    getCurrentUserEmployeeTypeId(),
    getAllRtsServices().catch(() => []),
    getAllRtsDepartments().catch(() => []),
  ]);

  const answerGroups = buildApplicationAnswerGroups(fieldDefinitions, application.fieldValues);
  const serviceName = services.find((service) => service.id === application.serviceId)?.serviceName ?? null;
  const departmentName =
    departments.find((department) => department.id === application.departmentId)?.departmentName ?? null;

  let workflow: ApplicationWorkflowState | null = null;
  try {
    workflow = await getApplicationWorkflow(application.applicationNo);
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
    console.error(`Failed to fetch workflow state for ${application.applicationNo}:`, error);
  }

  return {
    applicationNo: application.applicationNo,
    departmentId: application.departmentId,
    departmentName,
    serviceId: application.serviceId,
    serviceName,
    sessionId: application.sessionId,
    ownerId: application.ownerId,
    applicationStatus: application.applicationStatus,
    answerGroups,
    workflow,
  };
}

export async function submitApplicationActionAction(
  applicationNo: string,
  actionType: WorkflowActionType,
  remark: string
): Promise<SubmitApplicationActionResult> {
  try {
    const workflow = await submitApplicationWorkflowAction(applicationNo, { actionType, remark });
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
