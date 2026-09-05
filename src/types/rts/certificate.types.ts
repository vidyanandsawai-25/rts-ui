export interface OfficerFieldConfig {
  fieldKey: string;
  fieldLabelMarathi: string;
  fieldLabelEnglish: string;
  fieldType: "text" | "textarea" | "number" | "date" | "select";
  isMandatory: boolean;
  defaultValue?: string;
  options?: string[];
}

export interface RTSCertificateServiceOption {
  id: string;
  name: string;
  nameLocal?: string;
  departmentId?: number;
  departmentName?: string;
  departmentNameLocal?: string;
}

export interface RTSCertificateDepartmentOption {
  id: string;
  name: string;
  nameLocal?: string;
}

export interface RTSCertificateTemplate {
  id: number;
  serviceId: number;
  serviceName?: string;
  departmentName?: string;
  templateName: string;
  templateCode: string;
  headerContent?: string;
  bodyContent: string;
  footerContent?: string;
  /** Certificate canvas document. Undefined means the API has not exposed canvas persistence yet. */
  designJson?: string | null;
  defaultConditionsJson?: string;
  officerFieldsConfigJson?: string;
  isActive: boolean;
  createdDate: string;
  updatedDate?: string;
  officerFields: OfficerFieldConfig[];
  defaultConditions: string[];
}

export interface CreateRTSCertificateTemplateInput {
  serviceId: number;
  templateName: string;
  templateCode: string;
  headerContent?: string;
  bodyContent: string;
  footerContent?: string;
  designJson?: string | null;
  defaultConditionsJson?: string;
  officerFieldsConfigJson?: string;
  isActive?: boolean;
}

export interface UpdateRTSCertificateTemplateInput extends CreateRTSCertificateTemplateInput {
  id: number;
}

export interface RTSCertificateLibraryTemplate {
  id: number;
  templateName: string;
  templateCode: string;
  description?: string;
  headerContent?: string;
  bodyContent: string;
  footerContent?: string;
  designJson?: string | null;
  isActive: boolean;
  createdDate: string;
  updatedDate?: string;
}

export interface CreateRTSCertificateLibraryTemplateInput {
  templateName: string;
  templateCode: string;
  description?: string;
  headerContent?: string;
  bodyContent: string;
  footerContent?: string;
  designJson?: string | null;
  isActive?: boolean;
}

export interface UpdateRTSCertificateLibraryTemplateInput
  extends CreateRTSCertificateLibraryTemplateInput {
  id: number;
}

export interface CertificateAvailableTag {
  tagKey: string;
  tagLabelMarathi: string;
  tagLabelEnglish: string;
  sourceType: "Citizen" | "System" | "Officer";
}

export interface CertificatePreviewRequest {
  applicationId: number;
  officerInputs?: Record<string, string>;
  customConditions?: string;
}

export type RTSCertificateType = 0 | 1 | 2; // 0 = None, 1 = Digital, 2 = Manual

export interface CertificatePreviewResponse {
  hasTemplate: boolean;
  templateId: number;
  templateName: string;
  mergedHtml: string;
  citizenAutoValues: Record<string, string>;
  requiredOfficerFields: OfficerFieldConfig[];
  defaultConditions: string[];
  sampleCertificateNo?: string;
  certificateType?: RTSCertificateType;
}

export interface IssueCertificateRequest {
  applicationId: number;
  officerInputs?: Record<string, string>;
  customConditions?: string;
  actionRemark?: string;
  signAndApprove?: boolean;
  certificateType?: RTSCertificateType;
  documentGuid?: string;
}

export interface RTSIssuedCertificate {
  id: number;
  certificateGuid: string;
  certificateNo: string;
  applicationId: number;
  applicationNo: string;
  serviceId: number;
  serviceName: string;
  departmentName: string;
  applicantName: string;
  applicantMobile: string;
  officerInputs: Record<string, string>;
  mergedHtmlContent: string;
  qrCodePayload?: string;
  issuedByUserId: number;
  issuedByUserName?: string;
  issuedByOfficerDesignation?: string;
  issuedAt: string;
  isDigitallySigned: boolean;
  digitalSignatureInfo?: string;
  certificateType?: RTSCertificateType;
  documentGuid?: string;
  documentDownloadUrl?: string;
  departmentCollectionNotice?: string;
}

export interface CertificateVerificationResponse {
  isValid: boolean;
  message?: string;
  certificateGuid: string;
  certificateNo?: string;
  applicationNo?: string;
  serviceName?: string;
  departmentName?: string;
  applicantName?: string;
  ulbName?: string;
  ulbLogo?: string;
  ulbAddress?: string;
  issuedAt?: string;
  issuedByOfficer?: string;
  officerDesignation?: string;
  isDigitallySigned: boolean;
  digitalSignatureInfo?: string;
  dscSignerName?: string;
  dscIssuer?: string;
  dscSerialNumber?: string;
  dscThumbprint?: string;
  dscValidUntil?: string;
  mergedHtmlContent?: string;
  certificateType?: RTSCertificateType;
  documentGuid?: string;
  documentDownloadUrl?: string;
  departmentCollectionNotice?: string;
}

export interface DigitalSignatureMetadata {
  isAvailable: boolean;
  signerName: string;
  signerSubject: string;
  issuer: string;
  serialNumber: string;
  thumbprint: string;
  validFrom?: string;
  validTo?: string;
  algorithm: string;
  hasPrivateKey: boolean;
  organization: string;
  location: string;
}
