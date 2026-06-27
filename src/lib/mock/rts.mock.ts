import type {
  RTSServiceFieldGroup,
  CreateDraftRequest,
  CreateDraftResponse,
  SaveDraftValuesRequest,
  SubmitRequest,
  GetApplicationResponse,
} from "@/types/rts.types";

let nextAppId = 1001;
const drafts = new Map<number, GetApplicationResponse>();

export function mockGetServiceFields(_rtsServiceId: number): RTSServiceFieldGroup[] {
  return [
    {
      groupId: 1,
      groupName: "Property Identification",
      sortOrder: 1,
      fields: [
        { fieldId: 11, fieldName: "propertyId", label: "Property ID", fieldType: "TEXT", isRequired: true },
        { fieldId: 12, fieldName: "wardNo", label: "Ward No", fieldType: "NUMBER", isRequired: true },
      ],
    } as any,
    {
      groupId: 2,
      groupName: "Owner Details",
      sortOrder: 2,
      fields: [
        { fieldId: 21, fieldName: "ownerName", label: "Owner Name", fieldType: "TEXT", isRequired: true },
        { fieldId: 22, fieldName: "mobileNo", label: "Mobile No", fieldType: "TEXT", isRequired: true },
      ],
    } as any,
  ];
}

export function mockCreateDraft(_payload: CreateDraftRequest): CreateDraftResponse {
  const applicationId = nextAppId++;

  const app: GetApplicationResponse = {
    status: true,
    message: "Draft created (mock)",
    data: {
      applicationId,
      values: {},
      documents: [],
      stage: "DRAFT",
    },
  } as any;

  drafts.set(applicationId, app);

  return {
    status: true,
    message: "Draft created (mock)",
    data: { applicationId },
  } as any;
}

export function mockSaveDraftValues(applicationId: number, payload: SaveDraftValuesRequest) {
  const existing = drafts.get(applicationId);
  if (!existing) return { message: "Application not found (mock)", applicationId };

  (existing as any).data.values = { ...(existing as any).data.values, ...(payload as any) };
  drafts.set(applicationId, existing);

  return { message: "Draft saved (mock)", applicationId };
}

export function mockSubmitApplication(applicationId: number, _payload: SubmitRequest) {
  const existing = drafts.get(applicationId);
  if (!existing) return { message: "Application not found (mock)", applicationId };

  (existing as any).data.stage = "SUBMITTED";
  (existing as any).data.submittedAt = new Date().toISOString();
  drafts.set(applicationId, existing);

  return { message: "Submitted (mock)", applicationId };
}

export function mockGetApplication(applicationId: number): GetApplicationResponse {
  const existing = drafts.get(applicationId);
  if (!existing) {
    return { status: false, message: "Application not found (mock)", data: null } as any;
  }
  return existing;
}
