export type SupportedLanguage = 'en' | 'hi' | 'mr';

export type I18nText = {
  en: string;
  hi?: string;
  mr?: string;
};

export type Service = {
  id: string;
  name: I18nText;
  icon?: string;
  color?: string;
  title?: I18nText | string;
  serviceName?: string;
  [key: string]: unknown;
};

export type Department = {
  id: string;
  name: I18nText;
  icon: string;
  image?: string;
  color?: string;
  services: Service[];
  serviceCount?: number;
};

export interface RtsDepartmentApiItem {
  departmentServiceId: number | null;
  departmentName: string;
  departmentNameLocal?: string | null;
  departmentIcon: string | null;
  displayOrder: number;
  id: number;
  isActive: boolean;
  createdDate: string;
  updatedDate: string | null;
  [key: string]: unknown;
}

export interface RtsDepartmentQueryParams {
  DepartmentName?: string;
  PageNumber?: number;
  PageSize?: number;
  SearchTerm?: string;
}

export interface TrackingStage {
  stage: number;
  status: string;
  date?: string;
  remarks?: string;
  name?: string;
  remark?: string;
  officer?: string;
  time?: string;
}

export interface TrackingData {
  id: string;
  type: string;
  serviceName?: string;
  applicantName: string;
  submittedDate: string;
  currentStage: number;
  progress: number;
  status: string;
  stages: TrackingStage[];
  __source?: string;
  userUpicId?: string;
}
