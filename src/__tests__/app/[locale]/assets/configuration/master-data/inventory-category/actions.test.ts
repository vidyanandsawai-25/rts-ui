/* eslint-disable @typescript-eslint/no-explicit-any */
import { vi, describe, it, expect, beforeEach } from 'vitest';

vi.mock('next/cache', () => ({ revalidatePath: vi.fn() }));
vi.mock('next/headers', () => ({
  cookies: vi.fn(() =>
    Promise.resolve({
      get: vi.fn(() => undefined),
      getAll: vi.fn(() => []),
    })
  ),
}));
vi.mock('@/lib/utils/cookie', () => ({
  getUserIdFromCookies: vi.fn(() => 1),
}));

vi.mock('@/lib/api/asset-masters/inventory-category.service', () => ({
  inventoryCategoryService: {
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
    getById: vi.fn(),
  }
}));

import { revalidatePath } from 'next/cache';
import {
  saveInventoryCategoryAction,
  deleteInventoryCategoryAction,
  getInventoryCategoryByIdAction
} from '@/app/[locale]/assets/configuration/master-data/inventory-category/actions';
import { inventoryCategoryService } from '@/lib/api/asset-masters/inventory-category.service';

describe('InventoryCategory Server Actions', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('saveInventoryCategoryAction', () => {
    it('creates a record successfully and revalidates paths', async () => {
      vi.mocked(inventoryCategoryService.create).mockResolvedValue({} as any);
      const formData = new FormData();
      formData.append('code', 'CODE1');
      formData.append('name', 'Name 1');
      formData.append('isActive', 'true');

      const result = await saveInventoryCategoryAction('', formData);
      expect(result.ok).toBe(true);
      expect(result.mode).toBe('create');
      expect(inventoryCategoryService.create).toHaveBeenCalled();
      expect(revalidatePath).toHaveBeenCalled();
    });

    it('updates a record successfully and revalidates paths', async () => {
      vi.mocked(inventoryCategoryService.update).mockResolvedValue({} as any);
      const formData = new FormData();
      formData.append('code', 'CODE2');
      formData.append('name', 'Name 2');
      formData.append('isActive', 'true');

      const result = await saveInventoryCategoryAction('10', formData);
      expect(result.ok).toBe(true);
      expect(result.mode).toBe('update');
      expect(inventoryCategoryService.update).toHaveBeenCalled();
      expect(revalidatePath).toHaveBeenCalled();
    });

    it('handles errors gracefully', async () => {
      vi.mocked(inventoryCategoryService.create).mockRejectedValue(new Error('Database error'));
      const formData = new FormData();
      const result = await saveInventoryCategoryAction('', formData);
      expect(result.ok).toBe(false);
      expect(result.error).toBeDefined();
    });
  });

  describe('deleteInventoryCategoryAction', () => {
    it('deletes a record successfully', async () => {
      vi.mocked(inventoryCategoryService.delete).mockResolvedValue(true as any);
      const formData = new FormData();
      formData.append('id', '5');

      const result = await deleteInventoryCategoryAction(formData);
      expect(result.ok).toBe(true);
      expect(inventoryCategoryService.delete).toHaveBeenCalled();
      expect(revalidatePath).toHaveBeenCalled();
    });

    it('handles deletion errors gracefully', async () => {
      vi.mocked(inventoryCategoryService.delete).mockRejectedValue(new Error('Cannot delete'));
      const formData = new FormData();
      formData.append('id', '5');

      const result = await deleteInventoryCategoryAction(formData);
      expect(result.ok).toBe(false);
      expect(result.error).toBeDefined();
    });
  });

  describe('getInventoryCategoryByIdAction', () => {
    it('fetches single record by ID', async () => {
      const mockItem = { id: 2, code: 'C2', name: 'N2', isActive: true };
      vi.mocked(inventoryCategoryService.getById).mockResolvedValue(mockItem as any);

      const result = await getInventoryCategoryByIdAction(2);
      expect(result).toBeDefined();
      expect(inventoryCategoryService.getById).toHaveBeenCalledWith('2');
    });

    it('returns null if record not found', async () => {
      vi.mocked(inventoryCategoryService.getById).mockResolvedValue(null as any);
      const result = await getInventoryCategoryByIdAction(999);
      expect(result).toBeNull();
    });
  });
});

