export interface OfficerFieldConfig {
  fieldKey: string;
  fieldLabelMarathi: string;
  fieldLabelEnglish: string;
  fieldType: "text" | "textarea" | "number" | "date" | "select";
  isMandatory: boolean;
  defaultValue?: string;
  options?: string[];
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
  defaultConditionsJson?: string;
  officerFieldsConfigJson?: string;
  isActive?: boolean;
}

export interface UpdateRTSCertificateTemplateInput extends CreateRTSCertificateTemplateInput {
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

export interface CertificatePreviewResponse {
  hasTemplate: boolean;
  templateId: number;
  templateName: string;
  mergedHtml: string;
  citizenAutoValues: Record<string, string>;
  requiredOfficerFields: OfficerFieldConfig[];
  defaultConditions: string[];
  sampleCertificateNo?: string;
}

export interface IssueCertificateRequest {
  applicationId: number;
  officerInputs?: Record<string, string>;
  customConditions?: string;
  actionRemark?: string;
  signAndApprove?: boolean;
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
  mergedHtmlContent: string;
  qrCodePayload?: string;
  issuedByUserId: number;
  issuedByUserName?: string;
  issuedByOfficerDesignation?: string;
  issuedAt: string;
  isDigitallySigned: boolean;
  digitalSignatureInfo?: string;
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
  issuedAt?: string;
  issuedByOfficer?: string;
  officerDesignation?: string;
  isDigitallySigned: boolean;
  mergedHtmlContent?: string;
}
