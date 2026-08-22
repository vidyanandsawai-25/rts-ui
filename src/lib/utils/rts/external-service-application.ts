import 'server-only';

import { getRtsServiceById } from '@/lib/api/rts/rtsservices.service';
import { prepareExternalServiceNavigation } from '@/lib/utils/rts/service-navigation';
import type { RtsServiceApiItem } from '@/types/rts/service.types';

export type ExternalServiceNavigationErrorCode =
  | 'service-unavailable'
  | 'invalid-service'
  | 'missing-upic';

export type ExternalServiceNavigationResult =
  | { success: true; destination: string }
  | { success: false; errorCode: ExternalServiceNavigationErrorCode; error: string };

function failure(
  errorCode: ExternalServiceNavigationErrorCode,
  error: string
): ExternalServiceNavigationResult {
  return { success: false, errorCode, error };
}

/**
 * Resolves an active legacy service URL from the service master. This deliberately
 * does not create an RTS application; the external system owns its own tracking.
 */
export async function resolveExternalServiceNavigation(
  serviceId: number,
  upicId?: string | null
): Promise<ExternalServiceNavigationResult> {
  if (!Number.isInteger(serviceId) || serviceId <= 0) {
    return failure('service-unavailable', 'The selected service is unavailable.');
  }

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

  const navigation = prepareExternalServiceNavigation(service.serviceUrl, upicId);
  if (!navigation.ok) {
    return failure(
      navigation.reason === 'missing-upic' ? 'missing-upic' : 'invalid-service',
      navigation.reason === 'missing-upic'
        ? 'An active property UPIC is required to continue with this service.'
        : 'This service has an invalid external URL.'
    );
  }

  return { success: true, destination: navigation.destination };
}
