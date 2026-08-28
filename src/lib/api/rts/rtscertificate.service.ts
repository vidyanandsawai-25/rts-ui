import "server-only";

import { apiClient } from "@/services/api.service";
import type {
  CertificateAvailableTag,
  CertificatePreviewRequest,
  CertificatePreviewResponse,
  CertificateVerificationResponse,
  CreateRTSCertificateTemplateInput,
  IssueCertificateRequest,
  RTSCertificateTemplate,
  RTSIssuedCertificate,
  UpdateRTSCertificateTemplateInput,
} from "@/types/rts/certificate.types";

function extractItems<T>(data: unknown): T {
  if (data && typeof data === "object") {
    const obj = data as Record<string, unknown>;
    if ("items" in obj && obj.items !== undefined && obj.items !== null) {
      return obj.items as T;
    }
    if ("data" in obj && obj.data !== undefined && obj.data !== null) {
      return obj.data as T;
    }
  }
  return data as T;
}

export async function getAllCertificateTemplates(): Promise<RTSCertificateTemplate[]> {
  const response = await apiClient.get<unknown>("/rts-certificate/templates", {
    cache: "no-store",
  }, false);

  if (!response.success || !response.data) {
    return [];
  }

  return extractItems<RTSCertificateTemplate[]>(response.data) ?? [];
}

export async function getCertificateTemplateById(id: number): Promise<RTSCertificateTemplate | null> {
  const response = await apiClient.get<unknown>(`/rts-certificate/templates/${id}`, {
    cache: "no-store",
  }, false);

  return response.success && response.data ? extractItems<RTSCertificateTemplate>(response.data) : null;
}

export async function getCertificateTemplateByServiceId(serviceId: number): Promise<RTSCertificateTemplate | null> {
  const response = await apiClient.get<unknown>(`/rts-certificate/templates/by-service/${serviceId}`, {
    cache: "no-store",
  }, false);

  return response.success && response.data ? extractItems<RTSCertificateTemplate>(response.data) : null;
}

export async function getAvailableTagsForService(serviceId: number): Promise<CertificateAvailableTag[]> {
  const response = await apiClient.get<unknown>(`/rts-certificate/templates/available-tags/${serviceId}`, {
    cache: "no-store",
  }, false);

  return response.success && response.data ? extractItems<CertificateAvailableTag[]>(response.data) : [];
}

export async function createCertificateTemplate(
  payload: CreateRTSCertificateTemplateInput
): Promise<RTSCertificateTemplate> {
  const response = await apiClient.post<unknown>("/rts-certificate/templates", payload, undefined, false);

  if (!response.success || !response.data) {
    throw new Error(response.error || "Failed to create certificate template");
  }

  return extractItems<RTSCertificateTemplate>(response.data);
}

export async function updateCertificateTemplate(
  id: number,
  payload: UpdateRTSCertificateTemplateInput
): Promise<RTSCertificateTemplate> {
  const response = await apiClient.put<unknown>(`/rts-certificate/templates/${id}`, payload, undefined, false);

  if (!response.success || !response.data) {
    throw new Error(response.error || "Failed to update certificate template");
  }

  return extractItems<RTSCertificateTemplate>(response.data);
}

export async function deleteCertificateTemplate(id: number): Promise<boolean> {
  const response = await apiClient.delete<unknown>(`/rts-certificate/templates/${id}`, undefined, false);
  return response.success && !!response.data;
}

export async function getCertificatePreview(
  payload: CertificatePreviewRequest
): Promise<CertificatePreviewResponse> {
  const response = await apiClient.post<unknown>("/rts-certificate/preview", payload, undefined, false);

  if (!response.success || !response.data) {
    throw new Error(response.error || "Failed to generate certificate preview");
  }

  return extractItems<CertificatePreviewResponse>(response.data);
}

export async function issueCertificate(
  payload: IssueCertificateRequest
): Promise<RTSIssuedCertificate> {
  const response = await apiClient.post<unknown>("/rts-certificate/issue", payload, undefined, false);

  if (!response.success || !response.data) {
    throw new Error(response.error || "Failed to issue certificate");
  }

  return extractItems<RTSIssuedCertificate>(response.data);
}

export async function getIssuedCertificateByApplicationNo(
  applicationNo: string
): Promise<RTSIssuedCertificate | null> {
  const response = await apiClient.get<unknown>(`/rts-certificate/by-application/${encodeURIComponent(applicationNo)}`, {
    cache: "no-store",
  }, false);

  return response.success && response.data ? extractItems<RTSIssuedCertificate>(response.data) : null;
}

export async function getIssuedCertificateByGuid(
  certificateGuid: string
): Promise<RTSIssuedCertificate | null> {
  const response = await apiClient.get<unknown>(`/rts-certificate/by-guid/${encodeURIComponent(certificateGuid)}`, {
    cache: "no-store",
  }, false);

  return response.success && response.data ? extractItems<RTSIssuedCertificate>(response.data) : null;
}

export async function verifyCertificatePublic(
  certificateGuid: string
): Promise<CertificateVerificationResponse> {
  const response = await apiClient.get<unknown>(`/rts-certificate-verification/verify/${encodeURIComponent(certificateGuid)}`, {
    cache: "no-store",
  }, false);

  if (!response.success || !response.data) {
    return {
      isValid: false,
      certificateGuid,
      message: response.error || "सदर प्रमाणपत्र पडताळणी अयशस्वी ठरली आहे.",
      isDigitallySigned: false,
    };
  }

  return extractItems<CertificateVerificationResponse>(response.data);
}
