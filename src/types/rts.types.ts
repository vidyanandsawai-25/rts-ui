// src/types/rts.types.ts

export type RTSServiceField = {
  groupId: number;
  rtsServiceId: number;
  groupTitle: string;
  groupFieldType: string; // text | select | email | tel | number (based on your DB)
  groupFieldLabel: string;
  groupFieldPlaceHolder?: string | null;
  groupFieldRequired: boolean;
  isActive: boolean;
  groupFieldId: string; // unique key like ownerFirstName
};

export type RTSServiceFieldGroup = {
  groupTitle: string;
  fields: RTSServiceField[];
};

export type CreateDraftRequest = {
  rtsServiceId: number;
  departmentId: number;
  currentStep?: string;
};

export type CreateDraftResponse = {
  applicationId: number;
  status: string;
  rtsServiceId: number;
  departmentId: number;
};

export type SaveDraftValuesRequest = {
  currentStep?: string;
  values: { groupId: number; value: string | null }[];
};

export type SubmitRequest = {
  currentStep?: string;
};

export type GetApplicationResponse = {
  applicationId: number;
  rtsServiceId: number;
  departmentId: number;
  status: string;
  currentStep?: string | null;
  submittedOn?: string | null;
  createdOn: string;
  updatedOn: string;
  values: { groupId: number; fieldValue: string | null }[];
};
