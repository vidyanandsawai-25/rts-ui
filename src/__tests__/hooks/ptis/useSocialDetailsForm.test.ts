import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useSocialDetailsForm } from '@/hooks/useSocialDetailsForm';
import { toast } from 'sonner';
import { deletePropertySocialDetailAction } from '@/app/[locale]/property-tax/ptis/QuickDataEntry/[propertyId]/Discount/social-actions';

vi.mock('next/navigation', () => ({
  useParams: () => ({ locale: 'en' }),
  useRouter: () => ({ push: vi.fn(), refresh: vi.fn() }),
}));

vi.mock('next-intl', () => ({
  useTranslations: () => (key: string) => key,
}));

vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

vi.mock('@/hooks/useLoading', () => ({
  useLoading: () => ({
    isLoading: false,
    startLoading: vi.fn(),
    stopLoading: vi.fn(),
  }),
}));

vi.mock('@/components/common/ConfirmProvider', () => ({
  useConfirm: () => ({
    confirm: vi.fn((options) => options.onConfirm()),
  }),
}));

vi.mock('@/app/[locale]/property-tax/ptis/QuickDataEntry/[propertyId]/Discount/social-actions', () => ({
  upsertPropertySocialInfoAction: vi.fn(),
  deletePropertySocialDetailAction: vi.fn(),
}));

const mockSocialData = {
  propertyId: 123,
  socialAttributes: [
    {
      id: 1,
      socialAttributeCode: "SOC1",
      socialAttributeName: "Social 1",
      dataType: "BIT",
      isRequiredWhenParentTrue: false,
      isDiscountApplicable: true,
      propertySocialDetailId: 20,
      bitValue: true,
      children: []
    }
  ]
};

describe('useSocialDetailsForm', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should initialize with mapped social details state', () => {
    const { result } = renderHook(() => useSocialDetailsForm(mockSocialData, "123"));
    expect(result.current.socialData[1]).toBeDefined();
    expect(result.current.socialData[1].bitValue).toBe(true);
  });

  it('should call deletePropertySocialDetailAction and clear local state recursively on handleDeleteSocialDetail', async () => {
    vi.mocked(deletePropertySocialDetailAction).mockResolvedValue({ success: true });

    const { result } = renderHook(() => useSocialDetailsForm(mockSocialData, "123"));

    await act(async () => {
      await result.current.handleDeleteSocialDetail(1);
    });

    expect(deletePropertySocialDetailAction).toHaveBeenCalledWith("123", 1, "en");
    expect(result.current.socialData[1].bitValue).toBe(false);
    expect(result.current.socialData[1].documentGuid).toBeNull();
    expect(toast.success).toHaveBeenCalledWith("discount.deleteSuccess");
  });
});
