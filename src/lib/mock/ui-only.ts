import { departments } from "@/data/departments";
import { properties } from "@/data/properties";
import type { Service } from "@/types/service.types";
import type {
  CreateDraftRequest,
  CreateDraftResponse,
  GetApplicationResponse,
  RTSServiceFieldGroup,
  SaveDraftValuesRequest,
  SubmitRequest,
} from "@/types/rts.types";
import type { PropertyMastDto, PropertyMastListItem, RegisteredPropertyDetails } from "@/types/propertyMast.types";
import type { RequestOtpResponse, VerifyOtpResponse } from "@/lib/api/services";
import type { ChatRequest, ChatResponse } from "@/lib/chatbotApi";

type StoredDraft = GetApplicationResponse;

const readStore = () => {
  if (typeof window === "undefined") return null;
  return window.localStorage;
};

const shared = {
  otp: new Map<string, { mobile: string; otp: string; expiresAt: number; lastSentAt: number }>(),
  drafts: new Map<number, StoredDraft>(),
  nextDraftId: 1001,
};

const services: Service[] = [
  { id: 1, link: "/en/service/7204", icon: "baby", title: "Birth Certificate", subtext: "Local demo service" },
  { id: 2, link: "/en/service/7176", icon: "home", title: "New Taxation", subtext: "Property tax onboarding" },
  { id: 3, link: "/en/service/7177", icon: "home", title: "Re-Taxation", subtext: "Update property details" },
  { id: 4, link: "/en/service/7200", icon: "shield", title: "NOC", subtext: "Municipal certificate flow" },
];

const getRandomOtp = () => {
  const isLive = process.env.NEXT_PUBLIC_LIVE_OTP === 'true';
  return isLive 
    ? Math.floor(100000 + Math.random() * 900000).toString()
    : "123456";
};

export function getMockServices(): Service[] {
  return services;
}

export function getMockDashboardDepartments() {
  return departments;
}

export async function requestOtpLocal(mobile: string): Promise<RequestOtpResponse> {
  const otp = getRandomOtp();
  const txnId = `txn_${mobile}_${Date.now()}`;
  const entry = { mobile, otp, expiresAt: Date.now() + 2 * 60 * 1000, lastSentAt: Date.now() };
  shared.otp.set(txnId, entry);
  if (typeof window !== "undefined") {
    readStore()?.setItem("rts_demo_otp", JSON.stringify({ mobile, otp, txnId }));
  }

  const isLive = process.env.NEXT_PUBLIC_LIVE_OTP === 'true';
  if (isLive) {
    // Send SMS via SMS gateway
    const user = process.env.SMS_USER || "payakl";
    const password = process.env.SMS_PASSWORD || "fb05b4a701XX";
    const senderid = process.env.SMS_SENDERID || "AKOLMC";
    const tempid = process.env.SMS_TEMPID || "1707175319753583565";
    const smsText = `Your PTAX Login OTP is ${otp} Akola Municipal Corporation`;

    const url = `http://sms.ptaxcollection.com/sendsms.jsp?user=${user}&password=${password}&senderid=${senderid}&mobiles=${mobile}&sms=${encodeURIComponent(smsText)}&tempid=${tempid}`;

    try {
      const res = await fetch(url);
      if (!res.ok) {
        console.error(`SMS gateway error: HTTP status ${res.status}`);
      } else {
        const responseText = await res.text();
        console.log(`SMS gateway response: ${responseText}`);
      }
    } catch (err) {
      console.error("Error sending SMS:", err);
    }
  }

  return { message: "OTP generated locally", txnId, expiresInSeconds: 120, demoOtp: otp };
}

export function verifyOtpLocal(txnId: string, otp: string): VerifyOtpResponse {
  const entry = shared.otp.get(txnId);
  if (!entry) throw new Error("OTP session expired");
  if (Date.now() > entry.expiresAt) throw new Error("OTP expired");
  if (entry.otp !== otp) throw new Error("Invalid OTP");
  return { mobile: entry.mobile, token: `local_${entry.mobile}_${Date.now()}` };
}

const findProperty = (propertyId: string) =>
  properties.find((p) => p.propertyNo === propertyId || p.upicNo === propertyId || `PROP-${p.propertyNo}` === propertyId) || null;

export function getRegisteredPropertyIdsLocal(): string[] {
  return properties.map((p) => p.propertyNo);
}

export function getRegisteredPropertyDetailsLocal(propertyId: string): RegisteredPropertyDetails {
  const p = findProperty(propertyId);
  if (!p) throw new Error("Property not found");
  return {
    zoneId: p.zone ? String(p.zone).replace(/\D+/g, "") || null : null,
    wardNo: p.wardArea ? String(p.wardArea).replace(/\D+/g, "") || null : null,
    surveyNo: p.surveyNo ?? null,
    propertyAddress: p.address.en,
    buildingName: p.buildingName ?? null,
    flatNo: p.flatNo ?? null,
    pincode: p.pincode ?? null,
    commencementCertNo: p.commencementCertNo ?? null,
    commencementCertDate: p.commencementCertDate ?? null,
    occupancyCertNo: p.occupancyCertNo ?? null,
    occupancyCertDateType: p.occupancyCertDateType ?? null,
    occupancyCertDate: p.occupancyCertDate ?? null,
    propertyLatitude: null,
    propertyLongitude: null,
    propertyState: p.ownerState ?? null,
    propertyCity: p.ownerCity ?? null,
  };
}

export function createNewTaxationLocal(_payload: unknown): { id: number; message: string } {
  return { id: Date.now(), message: "Submitted locally" };
}

export function getPropertyMastListLocal(): PropertyMastListItem[] {
  return properties.map((p, idx) => ({
    ownerId: idx + 1,
    ownerName: [p.ownerFirstName, p.ownerMiddleName, p.ownerLastName].filter(Boolean).join(" ") || null,
    mobileNo: p.ownerMobile ?? null,
    propertyId: p.propertyNo,
    propertyNo: p.propertyNo,
  }));
}

export function getPropertyDtoLocal(ownerId: number): PropertyMastDto {
  const p = properties[ownerId - 1];
  if (!p) throw new Error("OwnerId not found");
  return {
    ownerId,
    propertyId: p.propertyNo,
    propertyNo: p.propertyNo,
    upicNo: p.upicNo,
    ownerName: [p.ownerFirstName, p.ownerMiddleName, p.ownerLastName].filter(Boolean).join(" ") || null,
    mobileNo: p.ownerMobile ?? null,
    ownerEmail: p.ownerEmail ?? null,
    ownerAadhar: p.ownerAadhar ?? null,
    ownerCity: p.ownerCity ?? null,
    ownerState: p.ownerState ?? null,
    zoneId: Number(String(p.zone).replace(/\D+/g, "")) || null,
    wardNo: Number(String(p.wardArea).replace(/\D+/g, "")) || null,
    surveyGatCtsNo: p.surveyNo ?? null,
    propertyAddress: p.address.en,
    buildingName: p.buildingName ?? null,
    wingFlatShopNo: p.flatNo ?? null,
    pincode: p.pincode ?? null,
    ccNo: p.commencementCertNo ?? null,
    ocNo: p.occupancyCertNo ?? null,
    dateType: p.occupancyCertDateType ?? null,
    selectedDate: p.occupancyCertDate ?? null,
  };
}

export function getPropertyDtoByPropertyIdLocal(propertyId: string): PropertyMastDto {
  const idx = properties.findIndex((p) => p.propertyNo === propertyId || p.upicNo === propertyId || `PROP-${p.propertyNo}` === propertyId);
  if (idx < 0) throw new Error("Property not found");
  return getPropertyDtoLocal(idx + 1);
}

export function getServiceFieldsLocal(rtsServiceId: number): RTSServiceFieldGroup[] {
  return [
    {
      groupTitle: `Service ${rtsServiceId} Fields`,
      fields: [
        { groupId: 1, rtsServiceId, groupTitle: "Applicant", groupFieldType: "text", groupFieldLabel: "Applicant Name", groupFieldRequired: true, isActive: true, groupFieldId: "applicantName" },
        { groupId: 1, rtsServiceId, groupTitle: "Applicant", groupFieldType: "tel", groupFieldLabel: "Mobile", groupFieldRequired: true, isActive: true, groupFieldId: "mobileNo" },
        { groupId: 2, rtsServiceId, groupTitle: "Address", groupFieldType: "text", groupFieldLabel: "Address", groupFieldRequired: false, isActive: true, groupFieldId: "address" },
      ],
    },
  ];
}

export function createDraftLocal(payload: CreateDraftRequest): CreateDraftResponse {
  const applicationId = shared.nextDraftId++;
  const now = new Date().toISOString();
  shared.drafts.set(applicationId, {
    applicationId,
    rtsServiceId: payload.rtsServiceId,
    departmentId: payload.departmentId,
    status: "DRAFT",
    currentStep: payload.currentStep ?? null,
    submittedOn: null,
    createdOn: now,
    updatedOn: now,
    values: [],
  });
  return { applicationId, status: "DRAFT", rtsServiceId: payload.rtsServiceId, departmentId: payload.departmentId };
}

export function saveDraftValuesLocal(applicationId: number, payload: SaveDraftValuesRequest) {
  const draft = shared.drafts.get(applicationId);
  if (!draft) return { message: "Application not found", applicationId };
  draft.values = payload.values.map((item) => ({ groupId: item.groupId, fieldValue: item.value }));
  draft.updatedOn = new Date().toISOString();
  shared.drafts.set(applicationId, draft);
  return { message: "Saved locally", applicationId };
}

export function submitApplicationLocal(applicationId: number, _payload: SubmitRequest) {
  const draft = shared.drafts.get(applicationId);
  if (!draft) return { message: "Application not found", applicationId };
  draft.status = "SUBMITTED";
  draft.submittedOn = new Date().toISOString();
  draft.updatedOn = draft.submittedOn;
  shared.drafts.set(applicationId, draft);
  return { message: "Submitted locally", applicationId };
}

export function getApplicationLocal(applicationId: number): GetApplicationResponse {
  const draft = shared.drafts.get(applicationId);
  if (!draft) throw new Error("Application not found");
  return draft;
}

export function sendChatMessageLocal(body: ChatRequest): ChatResponse {
  const text = body.text.toLowerCase();
  if (text.includes("property")) {
    return { replyText: "Open the property tax section for local demo data.", navigateDeptId: "property-tax", quickReplies: [{ title: "Property Tax", payload: "dept:property-tax" }] };
  }
  return { replyText: `Local assistant ready in ${body.language.toUpperCase()}.`, quickReplies: [{ title: "Dashboard", payload: "nav:dashboard" }] };
}

export function reverseGeocodeLocal(lat: number, lng: number) {
  return { found: true, label: `Pinned location (${lat.toFixed(4)}, ${lng.toFixed(4)})`, displayName: `Pinned location (${lat.toFixed(4)}, ${lng.toFixed(4)})`, lat, lng };
}



