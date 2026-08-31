// src/types/rts/service.types.ts

export interface Stat {
  label: string;
  value: string;
}

export interface Service {
  id: number;
  link: string;
  icon: string;
  title: string;
  subtext: string;
  stats?: Stat[];
}

export interface RtsServiceApiItem {
  departmentId: number;
  /** Government RTS portal service reference code (e.g., 7204 = Birth Certificate) */
  govtServiceCode?: number;
  serviceName: string;
  serviceNameLocal?: string | null;
  // The RTSService list and get-by-id responses do not include this field.
  departmentName?: string | null;
  id: number;
  description?: string | null;
  serviceUrl?: string | null;
  serviceIcon?: string | null;
  displayOrder: number;
  isActive: boolean;
  createdDate: string;
  updatedDate: string | null;

  // SLA and Fees fields from rts.ServiceMaster
  sla?: string | number | null;
  fees?: number | null;
  feesRequired?: boolean | null;
  isFeesRequired?: boolean | null;
  isCertificateRequired?: boolean | null;
  isSmsEnabled?: boolean | null;
  serviceCode?: string | null;
  [key: string]: unknown;
}

export interface RtsServiceQueryParams {
  id?: number;
  ServiceName?: string;
  DepartmentId?: number;
  PageNumber?: number;
  PageSize?: number;
  SearchTerm?: string;
}
