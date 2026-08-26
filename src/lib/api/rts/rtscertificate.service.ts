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

export async function getAllCertificateTemplates(): Promise<RTSCertificateTemplate[]> {
  const response = await apiClient.get<RTSCertificateTemplate[]>("/rts-certificate/templates", {
    cache: "no-store",
  }, false);

  if (!response.success || !response.data) {
    return [];
  }

  return response.data;
}

export async function getCertificateTemplateById(id: number): Promise<RTSCertificateTemplate | null> {
  const response = await apiClient.get<RTSCertificateTemplate>(`/rts-certificate/templates/${id}`, {
    cache: "no-store",
  }, false);

  return response.success && response.data ? response.data : null;
}

export async function getCertificateTemplateByServiceId(serviceId: number): Promise<RTSCertificateTemplate | null> {
  const response = await apiClient.get<RTSCertificateTemplate>(`/rts-certificate/templates/by-service/${serviceId}`, {
    cache: "no-store",
  }, false);

  return response.success && response.data ? response.data : null;
}

export async function getAvailableTagsForService(serviceId: number): Promise<CertificateAvailableTag[]> {
  const response = await apiClient.get<CertificateAvailableTag[]>(`/rts-certificate/templates/available-tags/${serviceId}`, {
    cache: "no-store",
  }, false);

  return response.success && response.data ? response.data : [];
}

export async function createCertificateTemplate(
  payload: CreateRTSCertificateTemplateInput
): Promise<RTSCertificateTemplate> {
  const response = await apiClient.post<RTSCertificateTemplate>("/rts-certificate/templates", payload, undefined, false);

  if (!response.success || !response.data) {
    throw new Error(response.error || "Failed to create certificate template");
  }

  return response.data;
}

export async function updateCertificateTemplate(
  id: number,
  payload: UpdateRTSCertificateTemplateInput
): Promise<RTSCertificateTemplate> {
  const response = await apiClient.put<RTSCertificateTemplate>(`/rts-certificate/templates/${id}`, payload, undefined, false);

  if (!response.success || !response.data) {
    throw new Error(response.error || "Failed to update certificate template");
  }

  return response.data;
}

export async function deleteCertificateTemplate(id: number): Promise<boolean> {
  const response = await apiClient.delete<boolean>(`/rts-certificate/templates/${id}`, undefined, false);
  return response.success && !!response.data;
}

export async function getCertificatePreview(
  payload: CertificatePreviewRequest
): Promise<CertificatePreviewResponse> {
  const response = await apiClient.post<CertificatePreviewResponse>("/rts-certificate/preview", payload, undefined, false);

  if (!response.success || !response.data) {
    throw new Error(response.error || "Failed to generate certificate preview");
  }

  return response.data;
}

export async function issueCertificate(
  payload: IssueCertificateRequest
): Promise<RTSIssuedCertificate> {
  const response = await apiClient.post<RTSIssuedCertificate>("/rts-certificate/issue", payload, undefined, false);

  if (!response.success || !response.data) {
    throw new Error(response.error || "Failed to issue certificate");
  }

  return response.data;
}

export async function getIssuedCertificateByApplicationNo(
  applicationNo: string
): Promise<RTSIssuedCertificate | null> {
  const response = await apiClient.get<RTSIssuedCertificate>(`/rts-certificate/by-application/${encodeURIComponent(applicationNo)}`, {
    cache: "no-store",
  }, false);

  return response.success && response.data ? response.data : null;
}

export async function getIssuedCertificateByGuid(
  certificateGuid: string
): Promise<RTSIssuedCertificate | null> {
  const response = await apiClient.get<RTSIssuedCertificate>(`/rts-certificate/by-guid/${encodeURIComponent(certificateGuid)}`, {
    cache: "no-store",
  }, false);

  return response.success && response.data ? response.data : null;
}

export async function verifyCertificatePublic(
  certificateGuid: string
): Promise<CertificateVerificationResponse> {
  const response = await apiClient.get<CertificateVerificationResponse>(`/rts-certificate-verification/verify/${encodeURIComponent(certificateGuid)}`, {
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

  return response.data;
}
