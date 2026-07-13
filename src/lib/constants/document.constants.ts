export const DOCUMENT_TYPE = {
  Certificate: 'Certificate',
  Permit: 'Permit',
  Invoice: 'Invoice',
  Contract: 'Contract',
  Report: 'Report',
  Proof: 'Proof',
  Application: 'Application',
  Approval: 'Approval',
  Photo: 'Photo',
} as const;

export const BINDING_PURPOSE = {
  MainDocument: 'MainDocument',
  SupportingDocument: 'SupportingDocument',
  ProofDocument: 'ProofDocument',
  ApprovalDocument: 'ApprovalDocument',
  ApplicationDocument: 'ApplicationDocument',
  Photo: 'Photo',
} as const;

export const REFERENCE_TABLE = {
  PropertyCertificate: 'PropertyCertificates',
  PropertyDiscount: 'PropertySocialDetails',
  PropertyPhoto: 'PropertyPhoto',
  PropertyOwner: 'PropertyOwners',
  BuildingPermission: 'BuildingPermissions',
} as const;

export const DEPARTMENT_ID = {
  PTIS: 1,
} as const;

export const MODULE_ID = {
  PropertyCertificate: 1,
  PropertyPhoto: 1,
  PropertyDiscount: 1,
  PropertySocialDetails: 1,
} as const;

