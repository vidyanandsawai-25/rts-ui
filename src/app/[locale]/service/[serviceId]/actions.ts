'use server';

import { cookies } from 'next/headers';
import { getUserIdFromCookies } from '@/lib/utils/auth-session';
import { createRtsApplication, updateRtsApplication } from '@/lib/api/rts/rtsapplication.service';
import {
  RtsDocumentUploadError,
  uploadRtsDocument,
  type RtsDocumentUploadErrorCode,
} from '@/lib/api/rts/rtsdocument.service';
import { getRtsServiceById } from '@/lib/api/rts/rtsservices.service';
import { evaluateRtsFee } from '@/lib/api/rts/rtsRulemater.service';
import { buildRtsApplicationPayload } from '@/lib/utils/rts/rts-application-payload';
import type {
  CreateRtsApplicationPayload,
  CreateRtsApplicationResponse,
  UpdateRtsApplicationPayload,
  UpdateRtsApplicationResponse,
} from '@/types/rts/rts-application.types';
import type { RtsServiceApiItem } from '@/types/rts/service.types';
import type {
  RtsFeeEvaluationFieldValue,
  RtsFeeEvaluationResult,
} from '@/types/rts/rts-rulemaster.types';

interface SubmitRtsFileFieldMeta {
  fileKey: string;
  fieldId: string;
  fieldDefinitionId: number;
  fieldName: string;
  fieldLabel: string;
  textValue?: string | null;
}

interface SubmitRtsApplicationActionInput {
  formValues: Record<string, unknown>;
  steps: Array<{ fields?: Array<Record<string, unknown>> }>;
  departmentId?: number | string | null;
  serviceId?: number | string | null;
  createdBy?: number;
  applicationStatus?: string;
  fileFields?: SubmitRtsFileFieldMeta[];
  tokenTD?: string | null;
}

/**
 * Returned failures are intentional: Server Action exceptions can be redacted
 * by Next.js, while this shape lets the citizen form distinguish an attachment
 * problem from a failed application submission without exposing backend details.
 */
export type SubmitRtsApplicationActionResult =
  | CreateRtsApplicationResponse
  | {
      success: false;
      message: string;
      items: null;
      errors: null;
      correlationId: null;
      failureType: 'document-upload' | 'application-submit';
      errorCode?: RtsDocumentUploadErrorCode;
      documentLabel?: string;
    };

function documentUploadFailure(
  error: unknown,
  documentLabel: string
): SubmitRtsApplicationActionResult {
  const uploadError = error instanceof RtsDocumentUploadError ? error : null;
  const safeMessage = uploadError?.message ?? 'The document could not be uploaded. Please try again.';

  return {
    success: false,
    message: documentLabel ? `${documentLabel}: ${safeMessage}` : safeMessage,
    items: null,
    errors: null,
    correlationId: null,
    failureType: 'document-upload',
    errorCode: uploadError?.code,
    documentLabel: documentLabel || undefined,
  };
}

function applicationSubmitFailure(): SubmitRtsApplicationActionResult {
  return {
    success: false,
    message:
      'We could not submit your application right now. Your form has not been submitted. Please try again shortly.',
    items: null,
    errors: null,
    correlationId: null,
    failureType: 'application-submit',
  };
}

function readCitizenOwnerIdFromCookieValue(profileCookie?: string): number | undefined {
  if (!profileCookie) return undefined;

  try {
    const profile = JSON.parse(profileCookie) as { ownerId?: unknown };
    const ownerId = Number(profile?.ownerId);
    return Number.isFinite(ownerId) && ownerId > 0 ? ownerId : undefined;
  } catch {
    return undefined;
  }
}

export async function getRtsServiceByIdSSR(serviceId: number): Promise<RtsServiceApiItem> {
  return getRtsServiceById(serviceId);
}

export async function evaluateRtsFeeAction(
  serviceId: number,
  fieldValues: RtsFeeEvaluationFieldValue[]
): Promise<{ success: boolean; data?: RtsFeeEvaluationResult; error?: string }> {
  try {
    return { success: true, data: await evaluateRtsFee(serviceId, fieldValues) };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to calculate the payable fee.',
    };
  }
}

export async function submitRtsApplicationAction(
  formData: FormData
): Promise<SubmitRtsApplicationActionResult> {
  const cookieStore = await cookies();
  const serializedInput = formData.get('submitInput');
  if (typeof serializedInput !== 'string' || !serializedInput.trim()) {
    throw new Error('Missing RTS submit input');
  }

  const input = JSON.parse(serializedInput) as SubmitRtsApplicationActionInput;
  const fileFields = Array.isArray(input.fileFields) ? input.fileFields : [];
  const documentGuidByFieldDefinitionId: Record<string, string> = {};
  const textValueByFieldDefinitionId: Record<string, string> = {};
  const ownerId = readCitizenOwnerIdFromCookieValue(cookieStore.get('rts_citizen_profile')?.value);
  const userId = getUserIdFromCookies(cookieStore) ?? undefined;
  let sessionId = cookieStore.get('rts_session')?.value?.trim();

  if (!sessionId) {
    // Generate a guest session if none exists to support anonymous submissions
    const guestSessionCookie = cookieStore.get('rts_guest_session')?.value?.trim();
    if (guestSessionCookie) {
      sessionId = guestSessionCookie;
    } else {
      sessionId =
        'guest-' +
        Math.random().toString(36).substring(2, 15) +
        Math.random().toString(36).substring(2, 15);
      cookieStore.set('rts_guest_session', sessionId, {
        path: '/',
        maxAge: 60 * 60 * 24 * 7, // 7 days
        httpOnly: true,
      });
    }
  }

  for (const fileField of fileFields) {
    const file = formData.get(fileField.fileKey);

    if (!(file instanceof File) || file.size <= 0) {
      continue;
    }

    let uploadResult;
    try {
      uploadResult = await uploadRtsDocument({
        file,
        documentType: fileField.fieldLabel || fileField.fieldName,
        isPrimaryDocument: true,
      });
    } catch (error) {
      return documentUploadFailure(error, fileField.fieldLabel || fileField.fieldName || file.name);
    }

    documentGuidByFieldDefinitionId[String(fileField.fieldDefinitionId)] =
      uploadResult.documentGuid;
    if (typeof fileField.textValue === 'string' && fileField.textValue.trim()) {
      textValueByFieldDefinitionId[String(fileField.fieldDefinitionId)] = fileField.textValue;
    }
  }

  const tdToken =
    input.tokenTD?.trim() || cookieStore.get('rts_aaplesarkar_td')?.value?.trim() || undefined;

  const payload: CreateRtsApplicationPayload = buildRtsApplicationPayload({
    formData: input.formValues,
    steps: input.steps,
    departmentId: input.departmentId,
    serviceId: input.serviceId,
    sessionId,
    ownerId,
    userId,
    createdBy: input.createdBy,
    applicationStatus: input.applicationStatus,
    documentGuidByFieldDefinitionId,
    textValueByFieldDefinitionId,
    tdToken,
  });

  let result: CreateRtsApplicationResponse;
  try {
    result = await createRtsApplication(payload);
  } catch {
    return applicationSubmitFailure();
  }

  if (tdToken) {
    try {
      cookieStore.delete('rts_aaplesarkar_td');
    } catch {
      // ignore cookie delete failure
    }
  }

  return result;
}

/** Uploads a replacement document while the citizen is correcting an application. */
export async function uploadRtsResubmitDocumentAction(
  formData: FormData
): Promise<{ success: boolean; documentGuid?: string; error?: string }> {
  const file = formData.get('file');
  if (!(file instanceof File) || file.size <= 0) {
    return { success: false, error: 'A replacement document is required.' };
  }

  try {
    const result = await uploadRtsDocument({ file });
    return { success: true, documentGuid: result.documentGuid };
  } catch (error) {
    return {
      success: false,
      error:
        error instanceof RtsDocumentUploadError
          ? error.message
          : 'The replacement document could not be uploaded. Please try again.',
    };
  }
}

/**
 * Resubmits a reverted application through the application API. Audit identity
 * is resolved on the server instead of trusting a browser supplied value.
 */
export async function updateRtsApplicationAction(
  applicationId: number,
  payload: UpdateRtsApplicationPayload
): Promise<UpdateRtsApplicationResponse> {
  const cookieStore = await cookies();
  const updatedBy = getUserIdFromCookies(cookieStore) ?? 0;
  const sessionId =
    cookieStore.get('rts_session')?.value?.trim() ||
    cookieStore.get('rts_guest_session')?.value?.trim() ||
    payload.sessionId ||
    null;

  return updateRtsApplication(applicationId, {
    ...payload,
    isActive: true,
    updatedBy,
    sessionId,
    fieldValues: payload.fieldValues.map((fieldValue) => ({
      ...fieldValue,
      isActive: true,
      updatedBy,
    })),
  });
}
