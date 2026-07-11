import { fetchWithCertSupport, getErrorFormattedMessage } from '../tab/base-api';
import type { PropertyWorkflowStage, PropertyWorkflowDetail } from '@/types/propertyWorkflowStage.types';
import type { PagedResult } from '@/types/ptis.types';

export const propertyWorkflowStageService = {
  async getWorkflowStages(): Promise<{
    success: boolean;
    data?: PropertyWorkflowStage[];
    error?: string;
  }> {
    try {
      const response = await fetchWithCertSupport<PagedResult<PropertyWorkflowStage>>(
        '/PropertyWorkflowStageMaster?PageSize=-1'
      );

      if (!response.success) {
        return {
          success: false,
          error: getErrorFormattedMessage(response.error, 'Workflow stages not found'),
        };
      }

      const rawData = response.data;
      if (!rawData || !rawData.items) {
        return { success: false, error: 'Workflow stages not found' };
      }

      return { success: true, data: rawData.items };
    } catch (error: unknown) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch workflow stages',
      };
    }
  },

  async savePropertyWorkflowDetail(
    propertyId: number | string,
    workflowStageId: number,
    moduleId?: number | null,
    createdBy?: number | null
  ): Promise<{ success: boolean; data?: PropertyWorkflowDetail; error?: string }> {
    try {
      const response = await fetchWithCertSupport<PropertyWorkflowDetail>(
        `/Property/${propertyId}/workflow-details`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            isActive: true,
            createdBy: createdBy ? Number(createdBy) : 0,
            propertyId: Number(propertyId),
            workflowStageId: Number(workflowStageId),
            moduleId: moduleId ? Number(moduleId) : 0,
          }),
        }
      );

      if (!response.success) {
        return {
          success: false,
          error: getErrorFormattedMessage(response.error, 'Failed to update workflow details'),
        };
      }

      return { success: true, data: response.data };
    } catch (error: unknown) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to update workflow details',
      };
    }
  },
  async getCurrentWorkflowDetail(
    propertyId: number | string
  ): Promise<{ success: boolean; data?: PropertyWorkflowDetail; error?: string }> {
    try {
      const response = await fetchWithCertSupport<PagedResult<PropertyWorkflowDetail>>(
        `/Property/workflow-details/current?propertyid=${propertyId}`
      );

      if (!response.success) {
        return {
          success: false,
          error: getErrorFormattedMessage(response.error, 'Failed to fetch current workflow details'),
        };
      }

      const rawData = response.data;
      if (!rawData || !rawData.items) {
        return { success: false, error: 'Current workflow details not found' };
      }

      const item = Array.isArray(rawData.items) ? rawData.items[0] : rawData.items;
      return { success: true, data: item };
    } catch (error: unknown) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch current workflow details',
      };
    }
  },

  async getPropertyWorkflowDetails(
    propertyId: number | string
  ): Promise<{ success: boolean; data?: PropertyWorkflowDetail[]; error?: string }> {
    try {
      const response = await fetchWithCertSupport<PagedResult<PropertyWorkflowDetail>>(
        `/Property/${propertyId}/workflow-details`
      );

      if (!response.success) {
        return {
          success: false,
          error: getErrorFormattedMessage(response.error, 'Failed to fetch workflow details'),
        };
      }

      const rawData = response.data;
      if (!rawData || !rawData.items) {
        return { success: false, error: 'Workflow details not found' };
      }

      return { success: true, data: Array.isArray(rawData.items) ? rawData.items : [rawData.items] };
    } catch (error: unknown) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch workflow details',
      };
    }
  },
};
