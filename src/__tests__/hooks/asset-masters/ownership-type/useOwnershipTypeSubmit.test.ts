/* eslint-disable @typescript-eslint/no-explicit-any */
import { renderHook } from '@testing-library/react';
import { vi, describe, it, expect } from 'vitest';
import { useOwnershipTypeSubmit } from '@/hooks/asset-masters/ownership-type/useOwnershipTypeSubmit';

vi.mock('@/app/[locale]/assets/configuration/master-data/ownership-type/actions', () => ({
  createOwnershipTypeAction: vi.fn(),
  updateOwnershipTypeAction: vi.fn(),
  saveOwnershipTypeAction: vi.fn()
}));
vi.mock('next/navigation', () => ({ useRouter: vi.fn() }));
vi.mock('react-hot-toast', () => ({ default: { success: vi.fn(), error: vi.fn() } }));
vi.mock('sonner', () => ({ toast: { success: vi.fn(), error: vi.fn() } }));
vi.mock('next-intl', () => ({ useTranslations: () => (key: string) => key }));

describe('useOwnershipTypeSubmit', () => {
  it('initializes', () => {
    const props = {} as any;
    const { result } = renderHook(() => useOwnershipTypeSubmit(props));
    expect(result.current.handleSubmit).toBeDefined();
  });
});
