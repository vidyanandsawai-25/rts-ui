'use server';

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
  ownerId?: number;
  createdBy?: number;
  applicationStatus?: string;
  fileFields?: SubmitRtsFileFieldMeta[];
}

export async function getRtsServiceByIdSSR(serviceId: number): Promise<RtsServiceApiItem> {
  return getRtsServiceById(serviceId);
}

export async function submitRtsApplicationAction(
  formData: FormData
): Promise<CreateRtsApplicationResponse> {
  const serializedInput = formData.get("submitInput");
  if (typeof serializedInput !== "string" || !serializedInput.trim()) {
    throw new Error("Missing RTS submit input");
  }

  const input = JSON.parse(serializedInput) as SubmitRtsApplicationActionInput;
  const fileFields = Array.isArray(input.fileFields) ? input.fileFields : [];
  const documentGuidByFieldDefinitionId: Record<string, string> = {};

  for (const fileField of fileFields) {
    const file = formData.get(fileField.fileKey);

    if (!(file instanceof File) || file.size <= 0) {
      continue;
    }

    const uploadResult = await uploadRtsDocument({
      file,
      ownerUserId: input.ownerId,
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
    ownerId: input.ownerId,
    createdBy: input.createdBy,
    applicationStatus: input.applicationStatus,
    documentGuidByFieldDefinitionId,
  });

  return createRtsApplication(payload);
}
