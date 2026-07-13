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
  departmentName: string | null;
  id: number;
  description?: string | null;
  serviceUrl?: string | null;
  serviceIcon?: string | null;
  displayOrder: number;
  isActive: boolean;
  createdDate: string;
  updatedDate: string | null;
}

export interface RtsServiceQueryParams {
  ServiceName?: string;
  DepartmentId?: number;
  PageNumber?: number;
  PageSize?: number;
  SearchTerm?: string;
}
