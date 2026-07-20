/**
 * Inventory Condition Service
 *
 * Provides CRUD operations for inventory conditions.
 *
 * All methods wrap API calls in try/catch and throw typed ApiErrors.
 *
 * @module inventory-condition.service
 */

import { apiClient } from '@/services/api.service';
import { ApiError } from '@/lib/utils/api';
import type {
  InventoryConditionItem,
  InventoryConditionListParams,
  InventoryConditionListResponse,
  InventoryConditionPayload,
} from '@/types/asset-masters/inventory-model.types';

function createInventoryApiError(statusCode?: number, errorMessage?: string, defaultMessage = 'Operation failed'): ApiError {
  const msg = errorMessage ?? '';
  const isDuplicate = msg.toLowerCase().includes('already exists') || msg.toLowerCase().includes('duplicate');
  return new ApiError(statusCode ?? (isDuplicate ? 409 : 500), msg || defaultMessage, defaultMessage);
}

// Helper to map backend entity to UI entity
function mapToUIItem(item: Partial<InventoryConditionItem> & { categoryId?: number; conditionCategory?: string }): InventoryConditionItem {
  return {
    ...(item as unknown as InventoryConditionItem),
    inventoryItemCategoryId: (item.categoryId ?? item.inventoryItemCategoryId) as number,
    conditionType: (item.conditionCategory ?? item.conditionType ?? 'Inventory') as string,
    conditionName: item.conditionName as string
  };
}

export const inventoryConditionService = {
  /**
   * Fetches a paginated list of inventory conditions.
   *
   * @param params - Optional filter/pagination parameters
   * @returns Paginated response containing condition records
   */
  async getAll(params?: InventoryConditionListParams): Promise<InventoryConditionListResponse> {
    try {
      const q = new URLSearchParams();
      if (params?.PageNumber) q.set('PageNumber', params.PageNumber.toString());
      if (params?.PageSize) q.set('PageSize', params.PageSize.toString());
      if (params?.SearchTerm) q.set('SearchTerm', params.SearchTerm);
      if (params?.SortBy) q.set('SortBy', params.SortBy);

      if (params?.SortOrder) q.set('SortOrder', params.SortOrder);
      if (params?.ConditionName) q.set('ConditionName', params.ConditionName); // Pass conditionName properly
      if (params?.InventoryItemCategoryId)
        q.set('CategoryId', params.InventoryItemCategoryId.toString()); // Backend expects CategoryId
      
      q.set('MarkedForDeletion', String(params?.MarkedForDeletion ?? false));
      if (params?.IsActive !== undefined) q.set('IsActive', String(params.IsActive));

      const queryString = q.toString();
      const res = await apiClient.get<unknown>(
        queryString ? `/AssetConditionMaster?${queryString}` : '/AssetConditionMaster'
      );
      if (!res.success || !res.data) {
        if (res.statusCode === 404) {
          return {
            items: [],
            totalCount: 0,
            pageNumber: params?.PageNumber ?? 1,
            pageSize: params?.PageSize ?? 10,
            totalPages: 0,
          };
        }
        throw createInventoryApiError(
          res.statusCode,
          res.error,
          'Failed to fetch inventory conditions'
        );
      }
      
      const responseData = res.data as InventoryConditionListResponse;
      if (responseData.items) {
        responseData.items = responseData.items.map(mapToUIItem);
      }
      return responseData;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Fetches a single inventory condition by its ID.
   *
   * @param id - Numeric or string condition ID
   * @returns The matching InventoryConditionItem
   */
  async getById(id: number | string): Promise<InventoryConditionItem> {
    try {
      const res = await apiClient.get<unknown>(`/AssetConditionMaster/${id}`);
      if (!res.success) {
        throw createInventoryApiError(
          res.statusCode,
          res.error,
          `Failed to fetch inventory condition ${id}`
        );
      }
      return mapToUIItem(res.data as Parameters<typeof mapToUIItem>[0]);
    } catch (error) {
      throw error;
    }
  },

  /**
   * Creates a new inventory condition.
   *
   * @param payload - Condition data to persist
   * @returns The newly created InventoryConditionItem
   */
  async create(payload: InventoryConditionPayload): Promise<InventoryConditionItem> {
    try {
      const mappedPayload = {
        ...payload,
        categoryId: payload.inventoryItemCategoryId,
        conditionCategory: payload.conditionType ?? 'Inventory'
      };

      const res = await apiClient.post<unknown>(
        '/AssetConditionMaster',
        mappedPayload
      );
      if (!res.success) {
        throw createInventoryApiError(
          res.statusCode,
          res.error,
          'Create inventory condition failed'
        );
      }
      return mapToUIItem(res.data as Parameters<typeof mapToUIItem>[0]);
    } catch (error) {
      throw error;
    }
  },

  /**
   * Updates an existing inventory condition.
   *
   * @param id - ID of the condition to update
   * @param payload - Updated condition data
   * @returns The updated InventoryConditionItem
   */
  async update(
    id: number | string,
    payload: InventoryConditionPayload
  ): Promise<InventoryConditionItem> {
    try {
      const mappedPayload = {
        ...payload,
        categoryId: payload.inventoryItemCategoryId,
        conditionCategory: payload.conditionType ?? 'Inventory'
      };

      const res = await apiClient.put<unknown>(
        `/AssetConditionMaster/${id}`,
        mappedPayload
      );
      if (!res.success) {
        throw createInventoryApiError(
          res.statusCode,
          res.error,
          'Update inventory condition failed'
        );
      }
      return mapToUIItem(res.data as Parameters<typeof mapToUIItem>[0]);
    } catch (error) {
      throw error;
    }
  },

  /**
   * Soft-deletes an inventory condition by ID.
   *
   * @param id - ID of the condition to delete
   */
  async delete(id: number | string): Promise<void> {
    try {
      const res = await apiClient.delete<void>(`/AssetConditionMaster/${id}`);
      if (!res.success) {
        throw createInventoryApiError(
          res.statusCode,
          res.error,
          'Delete inventory condition failed'
        );
      }
    } catch (error) {
      throw error;
    }
  },
};
