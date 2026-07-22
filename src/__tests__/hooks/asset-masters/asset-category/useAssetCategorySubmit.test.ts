/* eslint-disable @typescript-eslint/no-explicit-any */
import { renderHook } from '@testing-library/react';
import { vi, describe, it, expect } from 'vitest';
import { useAssetCategorySubmit } from '@/hooks/asset-masters/asset-category/useAssetCategorySubmit';

vi.mock('@/app/[locale]/assets/configuration/master-data/asset-category/actions', () => ({
  createAssetCategoryAction: vi.fn(),
  updateAssetCategoryAction: vi.fn(),
  saveAssetCategoryAction: vi.fn()
}));
vi.mock('next/navigation', () => ({ useRouter: vi.fn() }));
vi.mock('react-hot-toast', () => ({ default: { success: vi.fn(), error: vi.fn() } }));
vi.mock('sonner', () => ({ toast: { success: vi.fn(), error: vi.fn() } }));
vi.mock('next-intl', () => ({ useTranslations: () => (key: string) => key }));

describe('useAssetCategorySubmit', () => {
  it('initializes', () => {
    const props = {} as any;
    const { result } = renderHook(() => useAssetCategorySubmit(props));
    expect(result.current.handleSubmit).toBeDefined();
  });
});
