import { apiClient } from '@/services/api.service';
import { PagedResponse } from '@/types/common.types';
import { Department, DepartmentLicenceDetails, DepartmentLicense } from '@/types/ulbconfig-master.types';
import { ApiError } from '@/lib/utils/api';
import { getDepartmentMastersPaged } from '@/lib/api/configuration-settings/department-master/departmentMaster.service';
import { normalizeDepartmentLicenceDetails, parseDepartmentLicenceMutationResponse, extractDepartmentLicenceRecord } from './department-licence-types-guard';
import { mapDepartmentLicenseToPayload } from './department-licence.mapper';
import {
  DEPARTMENT_LICENCE_ENDPOINT,
} from './ulb-master.constants';
import type { DepartmentLicenceMutationResponse } from '@/types/ulbconfig-master.types';

/** Fetch all records from a paginated API (PageSize=-1, with multi-page fallback). */
async function fetchAllPagedRecords<T>(
  endpoint: string,
  normalize: (item: Record<string, unknown>) => T,
  options?: { isActiveOnly?: boolean }
): Promise<T[]> {
  const allItems: T[] = [];
  let pageNumber = 1;
  let totalPages = 1;

  do {
    const params = new URLSearchParams();
    params.append('PageNumber', String(pageNumber));
    params.append('PageSize', '-1');
    if (options?.isActiveOnly) {
      params.append('IsActive', 'true');
    }

    const response = await apiClient.get<PagedResponse<Record<string, unknown>> | Record<string, unknown>[]>(
      `${endpoint}?${params.toString()}`
    );

    if (!response.success || !response.data) {
      throw new ApiError(
        response.statusCode ?? 500,
        response.error || `Failed to fetch from ${endpoint}`,
        `Fetch from ${endpoint} failed`
      );
    }

    if (Array.isArray(response.data)) {
      return response.data.map((item) => normalize(item as Record<string, unknown>));
    }

    const paged = response.data as PagedResponse<Record<string, unknown>>;
    const batch = (paged.items || []).map(normalize);
    allItems.push(...batch);

    totalPages = Math.max(paged.totalPages || 1, 1);

    if (paged.pageSize === -1 || batch.length === 0 || !paged.hasNext) {
      break;
    }

    pageNumber += 1;
  } while (pageNumber <= totalPages);

  return allItems;
}

function mapDepartmentMasterToUlbDepartment(dept: {
  departmentId: number;
  departmentCode: string;
  departmentName: string;
  departmentDescription?: string;
  isActive: boolean;
}): Department {
  return {
    departmentMasterId: dept.departmentId,
    departmentId: dept.departmentId,
    departmentCode: dept.departmentCode,
    departmentName: dept.departmentName,
    description: dept.departmentDescription,
    isActive: dept.isActive,
  };
}

/** GET `/DepartmentMaster?PageNumber=1&PageSize=-1` — active departments for the licence section. */
export async function getAllDepartments(): Promise<Department[]> {
  const paged = await getDepartmentMastersPaged(1, -1);
  return (paged.items ?? [])
    .filter((dept) => dept.departmentId > 0 && dept.isActive)
    .map(mapDepartmentMasterToUlbDepartment);
}

/** GET `/DepartmentLicenceDetails?PageNumber=1&PageSize=-1` — all department licences. */
export async function getAllDepartmentLicences(): Promise<DepartmentLicenceDetails[]> {
  return fetchAllPagedRecords(
    DEPARTMENT_LICENCE_ENDPOINT,
    normalizeDepartmentLicenceDetails,
    { isActiveOnly: false }
  );
}

/** POST `/DepartmentLicenceDetails` — create department licence. */
export async function createDepartmentLicence(
  data: DepartmentLicenceDetails
): Promise<{ licence: DepartmentLicenceDetails; message: string }> {
  const payload = {
    departmentId: data.departmentId ?? data.departmentMasterId,
    licenceStartDate: data.licenceStartDate,
    licenceEndDate: data.licenceEndDate,
    licenceDuration: data.licenceDuration,
    isActive: data.isActive ?? data.isEnabled ?? true,
  };

  const response = await apiClient.post<DepartmentLicenceMutationResponse>(
    DEPARTMENT_LICENCE_ENDPOINT,
    payload
  );

  if (!response.success || !response.data) {
    throw new ApiError(
      response.statusCode ?? 500,
      response.error || 'Failed to create department licence',
      'Create department licence failed'
    );
  }

  return parseDepartmentLicenceMutationResponse(
    response.data,
    'Failed to create department licence'
  );
}

/** PUT `/DepartmentLicenceDetails/{id}` — update department licence. */
export async function updateDepartmentLicence(
  id: number | string,
  data: DepartmentLicenceDetails
): Promise<{ licence: DepartmentLicenceDetails; message: string }> {
  const payload = {
    id: Number(id),
    departmentId: data.departmentId ?? data.departmentMasterId,
    licenceStartDate: data.licenceStartDate,
    licenceEndDate: data.licenceEndDate,
    licenceDuration: data.licenceDuration,
    isActive: data.isActive ?? data.isEnabled ?? true,
  };

  const response = await apiClient.put<DepartmentLicenceMutationResponse>(
    `${DEPARTMENT_LICENCE_ENDPOINT}/${id}`,
    payload
  );

  if (!response.success || !response.data) {
    throw new ApiError(
      response.statusCode ?? 500,
      response.error || 'Failed to update department licence',
      `Update department licence ${id} failed`
    );
  }

  return parseDepartmentLicenceMutationResponse(
    response.data,
    'Failed to update department licence'
  );
}

/** Creates or updates a department licence record from card state. */
export async function saveDepartmentLicence(
  dept: DepartmentLicense
): Promise<{ licence: DepartmentLicenceDetails; message: string }> {
  const payload = mapDepartmentLicenseToPayload(dept);

  if (dept.departmentLicenceDetailsId && dept.departmentLicenceDetailsId > 0) {
    return updateDepartmentLicence(dept.departmentLicenceDetailsId, payload);
  }

  return createDepartmentLicence(payload);
}

/** GET `/DepartmentLicenceDetails/{id}` — single department licence record. */
export async function getDepartmentLicenceById(
  id: number
): Promise<DepartmentLicenceDetails> {
  const response = await apiClient.get<Record<string, unknown>>(
    `${DEPARTMENT_LICENCE_ENDPOINT}/${id}`
  );

  if (!response.success || !response.data) {
    throw new ApiError(
      response.statusCode ?? 500,
      response.error || 'Failed to fetch department licence',
      `Get department licence ${id} failed`
    );
  }

  const normalized = extractDepartmentLicenceRecord(response.data);
  if (!normalized?.departmentLicenceDetailsId) {
    throw new ApiError(
      500,
      'Invalid department licence response',
      `Get department licence ${id} — invalid shape`
    );
  }

  return normalized;
}
