import { apiClient } from '@/services/api.service';
import type { DepartmentMasterData, ModuleMasterData } from '@/types/screen-access.types';
import type { PagedResponse } from '@/types/common.types';
import { ApiError } from '@/lib/utils/api';
import { getMasterDataPageSize } from './screen-access.services';

export async function getDepartments(): Promise<DepartmentMasterData[]> {
  const url = `/DepartmentMaster?PageSize=${getMasterDataPageSize()}`;
  const response = await apiClient.get<PagedResponse<unknown>>(url);

  if (!response.success) {
    throw new ApiError(
      response.statusCode ?? 500,
      response.error || 'errors.apiConnection.fetchDepartmentsFailed',
      'Get departments failed'
    );
  }

  const items = (response.data?.items ?? []) as Record<string, unknown>[];
  return items
    .map((dept) => {
      const id = Number(
        dept.departmentMasterId ??
          dept.DepartmentMasterId ??
          dept.departmentId ??
          dept.DepartmentId ??
          dept.id ??
          dept.Id
      );
      return {
        departmentMasterId: id,
        departmentId: id,
        departmentName: String(dept.departmentName ?? dept.DepartmentName ?? ''),
        departmentCode: String(dept.departmentCode ?? dept.DepartmentCode ?? ''),
      };
    })
    .filter((dept) => dept.departmentMasterId > 0);
}

export async function getModules(): Promise<ModuleMasterData[]> {
  const url = `/ModuleMaster?PageSize=${getMasterDataPageSize()}`;
  const response = await apiClient.get<PagedResponse<unknown>>(url);

  if (!response.success) {
    throw new ApiError(
      response.statusCode ?? 500,
      response.error || 'errors.apiConnection.fetchModulesFailed',
      'Get modules failed'
    );
  }

  const items = (response.data?.items ?? []) as Record<string, unknown>[];
  return items
    .map((module) => {
      const id = Number(
        module.moduleMasterId ??
          module.ModuleMasterId ??
          module.moduleId ??
          module.ModuleId ??
          module.id ??
          module.Id
      );
      const deptId = Number(
        module.departmentMasterId ??
          module.DepartmentMasterId ??
          module.departmentId ??
          module.DepartmentId
      );
      return {
        moduleMasterId: id,
        moduleId: id,
        moduleName: String(module.moduleName ?? module.ModuleName ?? ''),
        departmentMasterId: deptId,
        departmentId: deptId,
      };
    })
    .filter((module) => module.moduleMasterId > 0 && module.departmentMasterId > 0);
}
