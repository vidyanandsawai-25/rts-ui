import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useDiscountForm } from '@/hooks/useDiscountForm';
import { toast } from 'sonner';
import { deletePropertySocialDetailAction } from '@/app/[locale]/property-tax/ptis/QuickDataEntry/[propertyId]/Discount/discount-actions';

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

vi.mock('@/app/[locale]/property-tax/ptis/QuickDataEntry/[propertyId]/Discount/discount-actions', () => ({
  updateDiscountDetailsAction: vi.fn(),
  deletePropertySocialDetailAction: vi.fn(),
}));

const mockDiscountData = {
  propertyId: 123,
  discountAttributes: [
    {
      id: 1,
      socialAttributeCode: "DISC1",
      socialAttributeName: "Discount 1",
      dataType: "BIT",
      isDiscountApplicable: true,
      propertySocialDetailId: 10,
      bitValue: true,
      isActive: true,
      documentGuid: "doc-guid",
      documentBindingId: 100
    }
  ]
};

describe('useDiscountForm', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should initialize with mapped discount state', () => {
    const { result } = renderHook(() => useDiscountForm(mockDiscountData, "123"));
    expect(result.current.discountData[1]).toBeDefined();
    expect(result.current.discountData[1].enabled).toBe(true);
  });

  it('should call deletePropertySocialDetailAction and clear local state on handleDeleteDiscount', async () => {
    vi.mocked(deletePropertySocialDetailAction).mockResolvedValue({ success: true });

    const { result } = renderHook(() => useDiscountForm(mockDiscountData, "123"));

    await act(async () => {
      await result.current.handleDeleteDiscount(1);
    });

    expect(deletePropertySocialDetailAction).toHaveBeenCalledWith("123", 1, "en");
    expect(result.current.discountData[1].bitValue).toBe(false);
    expect(result.current.discountData[1].enabled).toBe(false);
    expect(result.current.discountData[1].documentGuid).toBeNull();
    expect(toast.success).toHaveBeenCalledWith("discount.deleteSuccess");
  });
});
