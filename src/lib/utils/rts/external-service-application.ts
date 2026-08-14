import 'server-only';

import { createRtsApplication } from '@/lib/api/rts/rtsapplication.service';
import { getRtsServiceById } from '@/lib/api/rts/rtsservices.service';
import { prepareExternalServiceNavigation } from '@/lib/utils/rts/service-navigation';
import type { RtsServiceApiItem } from '@/types/rts/service.types';

export type ExternalServiceTrackingErrorCode =
  | 'login-required'
  | 'service-unavailable'
  | 'invalid-service'
  | 'missing-upic'
  | 'missing-citizen-session'
  | 'missing-citizen-profile'
  | 'tracking-failed';

export type ExternalServiceTrackingResult =
  | { success: true; destination: string }
  | { success: false; errorCode: ExternalServiceTrackingErrorCode; error: string };

export type ExternalServiceCitizenContext = {
  sessionId?: string | null;
  name?: string | null;
  ownerId?: number | null;
  upicId?: string | null;
};

function failure(
  errorCode: ExternalServiceTrackingErrorCode,
  error: string
): ExternalServiceTrackingResult {
  return { success: false, errorCode, error };
}

/**
 * Creates the minimal RTS tracking record required before launching a legacy
 * external service. The service master remains the source of the URL and IDs.
 */
export async function createTrackedExternalServiceNavigation(
  serviceId: number,
  citizen: ExternalServiceCitizenContext
): Promise<ExternalServiceTrackingResult> {
  if (!Number.isInteger(serviceId) || serviceId <= 0) {
    return failure('service-unavailable', 'The selected service is unavailable.');
  }

  const sessionId = citizen.sessionId?.trim();
  if (!sessionId) {
    return failure('login-required', 'Please sign in before opening this service.');
  }

  const name = citizen.name?.trim();
  if (!Number.isInteger(citizen.ownerId) || (citizen.ownerId ?? 0) <= 0 || !name) {
    return failure('missing-citizen-profile', 'Your citizen profile is incomplete. Please sign in again.');
  }
  const ownerId = citizen.ownerId as number;

  let service: RtsServiceApiItem;
  try {
    service = await getRtsServiceById(serviceId);
  } catch (error) {
    console.error('Failed to load external RTS service:', error);
    return failure('service-unavailable', 'The selected service is unavailable.');
  }

  if (!service.isActive || !Number.isInteger(service.departmentId) || service.departmentId <= 0) {
    return failure('service-unavailable', 'The selected service is unavailable.');
  }

  const navigation = prepareExternalServiceNavigation(service.serviceUrl, citizen.upicId);
  if (!navigation.ok) {
    return failure(
      navigation.reason === 'missing-upic' ? 'missing-upic' : 'invalid-service',
      navigation.reason === 'missing-upic'
        ? 'An active property UPIC is required to continue with this service.'
        : 'This service has an invalid external URL.'
    );
  }

  try {
    console.info('[RTS external tracking] Creating application', {
      departmentId: service.departmentId,
      serviceId: service.id,
      ownerId,
      userId: 0,
      hasSessionId: Boolean(sessionId),
      hasApplicantName: Boolean(name),
      fieldDefinitionId: 0,
      approvalFlowId: 0,
      currentApprovalFlowStageId: 0,
      currentStageOrder: 0,
    });

    await createRtsApplication({
      isActive: true,
      createdBy: 0,
      departmentId: service.departmentId,
      serviceId: service.id,
      approvalFlowId: 0,
      currentApprovalFlowStageId: 0,
      currentStageOrder: 0,
      userId: 0,
      sessionId,
      ownerId,
      // External confirmation has not happened yet, so the backend receives no status.
      applicationStatus: "Pending",
      remark: null,
      fieldValues: [
        {
          isActive: true,
          createdBy: 0,
          fieldDefinitionId: 0,
          textValue: name,
          numberValue: null,
          dateValue: null,
          booleanValue: null,
          documentGuid: null,
        },
      ],
    });

    return { success: true, destination: navigation.destination };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error('[RTS external tracking] Application creation failed', {
      departmentId: service.departmentId,
      serviceId: service.id,
      ownerId,
      userId: 0,
      fieldDefinitionId: 0,
      errorMessage,
      error,
    });
    return failure('tracking-failed', 'Unable to start this service. Please try again.');
  }
}
