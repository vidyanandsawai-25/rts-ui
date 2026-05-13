import { apiClient } from '@/services/api.service';
import type { ApiResponse } from '@/types/common.types';
import type {
  Department,
  DepartmentUpdateRequest,
  Module,
  ModuleUpdateRequest,
  DepartmentListResponse,
  ModuleListResponse,
} from '@/types/departmentActivation.types';
import { normalizeDepartment, normalizeModule } from './activation-types-guard';

const API_ENDPOINTS = {
  departmentMaster: {
    getAll: '/DepartmentMaster',
    update: (id: number) => `/DepartmentMaster/${id}`,
  },
  moduleMaster: {
    getAll: '/ModuleMaster',
    update: (id: number) => `/ModuleMaster/${id}`,
  }
};

class DepartmentActivationService {
  async getDepartments(pageNumber = 1, pageSize = 10): Promise<ApiResponse<Department[]>> {
    try {
      const response = await apiClient.get<DepartmentListResponse>(
        `${API_ENDPOINTS.departmentMaster.getAll}?PageNumber=${pageNumber}&PageSize=${pageSize}`
      );

      if (response.success && response.data) {
        const items = response.data.items || [];
        const normalized = items.map(normalizeDepartment);

        // Deduplicate departments by departmentId to prevent UI issues and duplicate keys
        const uniqueDepartments: Department[] = [];
        const seenIds = new Set<number>();
        
        normalized.forEach((dept: Department) => {
          if (dept.departmentId > 0 && !seenIds.has(dept.departmentId)) {
            seenIds.add(dept.departmentId);
            uniqueDepartments.push(dept);
          }
        });

        return { success: true, data: uniqueDepartments };
      }

      return {
        success: false,
        error: response.error || 'Failed to fetch departments',
        message: response.message,
      };
    } catch (error: unknown) {
      return {
        success: false,
        error: 'Network error',
        message: error instanceof Error ? error.message : 'Failed to fetch departments',
      };
    }
  }

  async updateDepartmentStatus(
    data: DepartmentUpdateRequest,
    userId: number
  ): Promise<ApiResponse<Department>> {
    try {
      const payload = { ...data, updatedBy: userId };
      const response = await apiClient.put<Department>(
        API_ENDPOINTS.departmentMaster.update(data.departmentId),
        payload
      );

      if (response.success) {
        return { success: true, data: response.data };
      }

      return {
        success: false,
        error: response.error || 'Failed to update department',
        message: response.message,
      };
    } catch (error: unknown) {
      return {
        success: false,
        error: 'Network error',
        message: error instanceof Error ? error.message : 'Failed to update department',
      };
    }
  }

  async getModulesByDepartment(departmentId: number): Promise<ApiResponse<Module[]>> {
    try {
      const baseUrl = `${API_ENDPOINTS.moduleMaster.getAll}?departmentId=${departmentId}&PageNumber=1&PageSize=1000`;
      const [activeResponse, inactiveResponse] = await Promise.all([
        apiClient.get<ModuleListResponse>(`${baseUrl}&isActive=true`),
        apiClient.get<ModuleListResponse>(`${baseUrl}&isActive=false`),
      ]);

      const mapModule = (mod: Record<string, unknown>): Module => normalizeModule(mod);

      const allItems: Module[] = [];
      const seenIds = new Set<number>();

      const addItems = (response: ApiResponse<ModuleListResponse>) => {
        if (response.success && response.data) {
          const raw = response.data.items || [];
          raw.forEach((mod: Record<string, unknown>) => {
            const mapped = mapModule(mod);
            if (!seenIds.has(mapped.moduleId)) {
              seenIds.add(mapped.moduleId);
              allItems.push(mapped);
            }
          });
        }
      };

      addItems(activeResponse);
      addItems(inactiveResponse);

      return { success: true, data: allItems };
    } catch (error: unknown) {
      return {
        success: false,
        error: 'Network error',
        message: error instanceof Error ? error.message : 'Failed to fetch modules',
      };
    }
  }

  async updateModuleStatus(
    data: ModuleUpdateRequest,
    userId: number
  ): Promise<ApiResponse<Module>> {
    try {
      const payload = { ...data, updatedBy: userId };
      const response = await apiClient.put<Module>(
        API_ENDPOINTS.moduleMaster.update(data.moduleId),
        payload
      );

      if (response.success) {
        return { success: true, data: response.data };
      }

      return {
        success: false,
        error: response.error || 'Failed to update module',
        message: response.message,
      };
    } catch (error: unknown) {
      return {
        success: false,
        error: 'Network error',
        message: error instanceof Error ? error.message : 'Failed to update module',
      };
    }
  }
}

export const departmentActivationService = new DepartmentActivationService();
