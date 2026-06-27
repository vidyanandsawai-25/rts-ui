import {
  createDraftLocal,
  getApplicationLocal,
  getServiceFieldsLocal,
  saveDraftValuesLocal,
  submitApplicationLocal,
} from "@/lib/mock/ui-only";
import type { CreateDraftRequest, CreateDraftResponse, GetApplicationResponse, RTSServiceFieldGroup, SaveDraftValuesRequest, SubmitRequest } from "@/types/rts.types";

export function getServiceFields(rtsServiceId: number): Promise<RTSServiceFieldGroup[]> {
  return Promise.resolve(getServiceFieldsLocal(rtsServiceId));
}

export function createDraft(payload: CreateDraftRequest): Promise<CreateDraftResponse> {
  return Promise.resolve(createDraftLocal(payload));
}

export function saveDraftValues(applicationId: number, payload: SaveDraftValuesRequest) {
  return Promise.resolve(saveDraftValuesLocal(applicationId, payload));
}

export function submitApplication(applicationId: number, payload: SubmitRequest) {
  return Promise.resolve(submitApplicationLocal(applicationId, payload));
}

export function getApplication(applicationId: number): Promise<GetApplicationResponse> {
  return Promise.resolve(getApplicationLocal(applicationId));
}
