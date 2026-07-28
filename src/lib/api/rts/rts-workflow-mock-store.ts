import "server-only";

import { getAllRtsServices } from "./rtsservices.service";
import { getRtsFieldDefinitionsByServiceId } from "./rtsfielddefinition.service";
import type {
  CreateRtsApplicationFieldValueResponse,
  CreateRtsApplicationResponseItem,
} from "./rtsapplication.service";
import type {
  ApplicationWorkflowState,
  RtsApprovalFlowStageApiItem,
  SubmitWorkflowActionPayload,
  TrackHistoryActionType,
  TrackHistoryEntry,
} from "@/types/rts/workflow.types";

/**
 * TEMPORARY dev-only stand-in for the parts of application processing the real
 * backend doesn't implement yet: no GET for a single RTSApplication, and no
 * workflow/actions endpoints at all (confirmed against the live swagger spec —
 * see rts-workflow.service.ts). Never active in production. Delete this file
 * and its call sites (in rtsapplication.service.ts and rts-workflow.service.ts)
 * once the backend adds those endpoints.
 *
 * Services, field definitions, and approval-flow/stage config are all real and
 * already work — this store only fabricates the pieces that have nothing to
 * call, and seeds itself from real submissions so the demo stays internally
 * consistent (submit an application for real, then process that exact
 * application through the mocked workflow).
 */
export function isRtsMockModeEnabled(): boolean {
  return process.env.NODE_ENV !== "production";
}

const MOCK_STAGES: RtsApprovalFlowStageApiItem[] = [
  {
    id: -1,
    approvalFlowId: -1,
    stageOrder: 1,
    stageName: "Clerk Verification",
    employeeTypeId: 1,
    slaDays: 3,
    canVerifyDocument: true,
    canApprove: true,
    canReject: true,
    canReturn: true,
    canPay: false,
    isFinalStage: false,
  },
  {
    id: -2,
    approvalFlowId: -1,
    stageOrder: 2,
    stageName: "Head Officer Approval",
    employeeTypeId: 2,
    slaDays: 4,
    canVerifyDocument: false,
    canApprove: true,
    canReject: true,
    canReturn: true,
    canPay: true,
    isFinalStage: false,
  },
  {
    id: -3,
    approvalFlowId: -1,
    stageOrder: 3,
    stageName: "Final Approval (Senior Officer)",
    employeeTypeId: 3,
    slaDays: 2,
    canVerifyDocument: false,
    canApprove: true,
    canReject: true,
    canReturn: false,
    canPay: false,
    isFinalStage: true,
  },
];

interface MockApplicationRecord {
  applicationNo: string;
  departmentId: number;
  serviceId: number;
  applicationStatus: "pending" | "approved" | "rejected" | "returned";
  paymentStatus: "NotRequired" | "Pending" | "Paid";
  /** -1 once terminal (approved/rejected). */
  currentStageIndex: number;
  stageEnteredAt: string;
  history: TrackHistoryEntry[];
  fieldValues: CreateRtsApplicationFieldValueResponse[];
}

// Resets on dev-server restart — fine, it exists purely so the workflow UI is
// clickable end-to-end before the real backend exists.
const mockStore = new Map<string, MockApplicationRecord>();
let historyIdSeq = 9000;

function placeholderValueForType(
  fieldType: string,
  label: string,
  fieldDefinitionId: number
): Partial<CreateRtsApplicationFieldValueResponse> {
  const type = fieldType.toLowerCase();
  if (type === "date") return { dateValue: new Date().toISOString() };
  if (type === "number" || type === "decimal" || type === "amount") return { numberValue: 1 };
  if (type === "checkbox") return { booleanValue: true };
  if (type === "file") {
    // Placeholder attachment so the "Attached Documents" section (and the
    // "Verify Documents" decision) has something concrete to point at in mock
    // mode — the real backend would supply a real documentGuid from uploads.
    return { documentGuid: `mock-doc-${fieldDefinitionId}`, textValue: `${label}.pdf` };
  }
  return { textValue: `Sample ${label}` };
}

async function buildPlaceholderFieldValues(
  departmentId: number,
  serviceId: number
): Promise<CreateRtsApplicationFieldValueResponse[]> {
  try {
    // Field definitions (RTS.FieldDefinition) are scoped by both DepartmentId
    // and ServiceId — the real, working endpoint — so both must be passed to
    // get the field set that actually matches this application (with a
    // service-only fallback baked into the helper for inconsistently-tagged
    // seed data).
    const definitions = await getRtsFieldDefinitionsByServiceId(serviceId, departmentId);
    const now = new Date().toISOString();

    return definitions
      .filter((def) => def.isActive !== false)
      .map((def) => ({
        applicationId: 0,
        fieldDefinitionId: def.id,
        textValue: null,
        numberValue: null,
        dateValue: null,
        booleanValue: null,
        documentGuid: null,
        id: def.id,
        isActive: true,
        createdDate: now,
        updatedDate: null,
        ...placeholderValueForType(def.fieldType, def.fieldLabel || def.fieldCode, def.id),
      }));
  } catch {
    return [];
  }
}

async function resolveDefaultService(): Promise<{ serviceId: number; departmentId: number }> {
  try {
    const services = await getAllRtsServices();
    const service = services.find((s) => s.isActive) ?? services[0];
    return { serviceId: service?.id ?? 1, departmentId: service?.departmentId ?? 0 };
  } catch {
    return { serviceId: 1, departmentId: 0 };
  }
}

function submittedHistoryEntry(now: string): TrackHistoryEntry {
  return {
    id: historyIdSeq++,
    applicationId: 0,
    fromStageId: null,
    fromStageName: null,
    toStageId: MOCK_STAGES[0].id,
    toStageName: MOCK_STAGES[0].stageName,
    actionType: "Submitted",
    performedByUserId: null,
    performedByUserName: "Citizen",
    remark: "Application submitted by citizen.",
    actionDate: now,
  };
}

async function ensureRecord(applicationNo: string): Promise<MockApplicationRecord> {
  const existing = mockStore.get(applicationNo);
  if (existing) return existing;

  const { serviceId, departmentId } = await resolveDefaultService();
  const fieldValues = await buildPlaceholderFieldValues(departmentId, serviceId);
  const now = new Date().toISOString();

  const record: MockApplicationRecord = {
    applicationNo,
    departmentId,
    serviceId,
    applicationStatus: "pending",
    paymentStatus: "NotRequired",
    currentStageIndex: 0,
    stageEnteredAt: now,
    history: [submittedHistoryEntry(now)],
    fieldValues,
  };

  mockStore.set(applicationNo, record);
  return record;
}

/** Called right after a real, successful citizen submission (POST /RTSApplication works today) so the mock layer reflects exactly what was submitted. */
export function seedMockApplication(response: CreateRtsApplicationResponseItem): void {
  if (!isRtsMockModeEnabled()) return;

  const now = new Date().toISOString();
  mockStore.set(response.applicationNo, {
    applicationNo: response.applicationNo,
    departmentId: response.departmentId,
    serviceId: response.serviceId,
    applicationStatus: "pending",
    paymentStatus: "NotRequired",
    currentStageIndex: 0,
    stageEnteredAt: now,
    history: [submittedHistoryEntry(now)],
    fieldValues: response.fieldValues,
  });
}

export async function getMockApplicationHeader(
  applicationNo: string
): Promise<CreateRtsApplicationResponseItem> {
  const record = await ensureRecord(applicationNo);
  return {
    departmentId: record.departmentId,
    serviceId: record.serviceId,
    applicationNo: record.applicationNo,
    applicationStatus: record.applicationStatus,
    fieldValues: record.fieldValues,
  };
}

function currentStageOf(record: MockApplicationRecord): RtsApprovalFlowStageApiItem | null {
  return record.currentStageIndex >= 0 ? MOCK_STAGES[record.currentStageIndex] : null;
}



function toWorkflowState(record: MockApplicationRecord): ApplicationWorkflowState {
  const currentStage = currentStageOf(record);
  const paymentOutstanding = !!currentStage?.canPay && record.paymentStatus !== "Paid";

  return {
    applicationId: 0,
    applicationNo: record.applicationNo,
    departmentId: record.departmentId,
    serviceId: record.serviceId,
    applicationStatus: record.applicationStatus,
    paymentStatus: record.paymentStatus,
    currentStage,
    stageEnteredAt: currentStage ? record.stageEnteredAt : null,
    // Mock mode has no real logged-in-user/role check, so it grants whatever
    // the current stage permits — enough to click through the whole flow.
    availableActions: currentStage
      ? [
          ...(currentStage.canVerifyDocument ? (["verifyDocument"] as const) : []),
          ...(paymentOutstanding ? (["pay"] as const) : []),
          ...(currentStage.canApprove && !paymentOutstanding ? (["approve"] as const) : []),
          ...(currentStage.canReject ? (["reject"] as const) : []),
          ...(currentStage.canReturn ? (["return"] as const) : []),
        ]
      : [],
    history: record.history,
  };
}

export async function getMockWorkflowState(applicationNo: string): Promise<ApplicationWorkflowState> {
  const record = await ensureRecord(applicationNo);
  return toWorkflowState(record);
}

function pushHistory(
  record: MockApplicationRecord,
  from: RtsApprovalFlowStageApiItem | null,
  to: RtsApprovalFlowStageApiItem | null,
  actionType: TrackHistoryActionType,
  remark: string
) {
  record.history.push({
    id: historyIdSeq++,
    applicationId: 0,
    fromStageId: from?.id ?? null,
    fromStageName: from?.stageName ?? null,
    toStageId: to?.id ?? null,
    toStageName: to?.stageName ?? null,
    actionType,
    performedByUserId: null,
    performedByUserName: "Mock Officer",
    remark,
    actionDate: new Date().toISOString(),
  });
}

export async function applyMockWorkflowAction(
  applicationNo: string,
  payload: SubmitWorkflowActionPayload
): Promise<ApplicationWorkflowState> {
  const record = await ensureRecord(applicationNo);
  const stage = currentStageOf(record);
  if (!stage) throw new Error("This application is already closed.");

  switch (payload.actionType) {
    case "pay":
      record.paymentStatus = "Paid";
      pushHistory(record, stage, stage, "PaymentRecorded", payload.remark);
      break;

    case "verifyDocument":
      pushHistory(record, stage, stage, "VerifyDocument", payload.remark);
      break;

    case "approve": {
      if (stage.isFinalStage) {
        record.applicationStatus = "approved";
        record.currentStageIndex = -1;
        pushHistory(record, stage, null, "Approve", payload.remark);
      } else {
        const nextIndex = record.currentStageIndex + 1;
        const next = MOCK_STAGES[nextIndex];
        record.currentStageIndex = nextIndex;
        record.stageEnteredAt = new Date().toISOString();
        record.paymentStatus = "NotRequired";
        pushHistory(record, stage, next, "Approve", payload.remark);
      }
      break;
    }

    case "reject":
      record.applicationStatus = "rejected";
      record.currentStageIndex = -1;
      pushHistory(record, stage, null, "Reject", payload.remark);
      break;

    case "return":
      record.applicationStatus = "returned";
      record.currentStageIndex = 0;
      record.stageEnteredAt = new Date().toISOString();
      pushHistory(record, stage, MOCK_STAGES[0], "Return", payload.remark);
      break;
  }

  return toWorkflowState(record);
}
