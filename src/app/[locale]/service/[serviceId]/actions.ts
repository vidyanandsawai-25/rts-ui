'use server';

import { cookies } from "next/headers";
import {
  createRtsApplication,
  uploadRtsDocument,
  type CreateRtsApplicationPayload,
  type CreateRtsApplicationResponse,
} from "@/lib/api/rts/rtsapplication.service";
import { getRtsServiceById } from "@/lib/api/rts/rtsservices.service";
import { buildRtsApplicationPayload } from "@/lib/utils/rts/rts-application-payload";
import type { RtsServiceApiItem } from "@/types/rts/service.types";

interface SubmitRtsFileFieldMeta {
  fileKey: string;
  fieldId: string;
  fieldDefinitionId: number;
  fieldName: string;
  fieldLabel: string;
}

interface SubmitRtsApplicationActionInput {
  formValues: Record<string, unknown>;
  steps: Array<{ fields?: Array<Record<string, unknown>> }>;
  departmentId?: number | string | null;
  serviceId?: number | string | null;
  createdBy?: number;
  applicationStatus?: string;
  fileFields?: SubmitRtsFileFieldMeta[];
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

export async function submitRtsApplicationAction(
  formData: FormData
): Promise<CreateRtsApplicationResponse> {
  const cookieStore = await cookies();
  const serializedInput = formData.get("submitInput");
  if (typeof serializedInput !== "string" || !serializedInput.trim()) {
    throw new Error("Missing RTS submit input");
  }

  const input = JSON.parse(serializedInput) as SubmitRtsApplicationActionInput;
  const fileFields = Array.isArray(input.fileFields) ? input.fileFields : [];
  const documentGuidByFieldDefinitionId: Record<string, string> = {};
  const ownerId = readCitizenOwnerIdFromCookieValue(
    cookieStore.get("rts_citizen_profile")?.value
  );
  let sessionId = cookieStore.get("rts_session")?.value?.trim();

  if (!sessionId) {
    // Generate a guest session if none exists to support anonymous submissions
    const guestSessionCookie = cookieStore.get("rts_guest_session")?.value?.trim();
    if (guestSessionCookie) {
      sessionId = guestSessionCookie;
    } else {
      sessionId = "guest-" + Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
      cookieStore.set("rts_guest_session", sessionId, {
        path: "/",
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

    const uploadResult = await uploadRtsDocument({
      file,
      ownerUserId: ownerId,
      documentType: fileField.fieldLabel || fileField.fieldName,
      departmentId:
        input.departmentId == null || input.departmentId === ""
          ? undefined
          : Number(input.departmentId),
      moduleId:
        input.serviceId == null || input.serviceId === ""
          ? undefined
          : Number(input.serviceId),
      isPrimaryDocument: true,
    });

    documentGuidByFieldDefinitionId[String(fileField.fieldDefinitionId)] = uploadResult.documentGuid;
  }

  const payload: CreateRtsApplicationPayload = buildRtsApplicationPayload({
    formData: input.formValues,
    steps: input.steps,
    departmentId: input.departmentId,
    serviceId: input.serviceId,
    sessionId,
    ownerId,
    createdBy: input.createdBy,
    applicationStatus: input.applicationStatus,
    documentGuidByFieldDefinitionId,
  });

  return createRtsApplication(payload);
}
