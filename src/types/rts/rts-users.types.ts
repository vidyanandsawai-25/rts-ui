import type { PagedResponse } from '@/types/common.types';

/** Compact user profile returned by GET /RtsUsers; allocation collections are excluded. */
export interface RtsUserLookupItem {
  id: number;
  userName: string;
  firstName: string | null;
  middleName: string | null;
  lastName: string | null;
  userCode: string | null;
  address: string | null;
  mobileNo: string | null;
  alternateMobileNo: string | null;
  email: string | null;
  remark: string | null;
  employeeTypeID: number | null;
}

export interface RtsUserLookupQueryParams {
  UserId?: number;
  UserName?: string;
  FirstName?: string;
  MiddleName?: string;
  LastName?: string;
  MobileNo?: string;
  DepartmentId?: number;
  IsActive?: boolean;
  PageNumber?: number;
  PageSize?: number;
  SortBy?: string;
  SortOrder?: 'asc' | 'desc';
  FilterLogic?: 0 | 1;
}

export type RtsUserLookupPage = PagedResponse<RtsUserLookupItem>;
