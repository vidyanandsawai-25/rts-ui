import { describe, it, expect, vi } from 'vitest';
import MissingAddressPage from '@/app/[locale]/property-tax/automation-dashboard/missing-data-analysis/address/page';
import MissingMobileNoPage from '@/app/[locale]/property-tax/automation-dashboard/missing-data-analysis/mobile-no/page';
import MissingOwnerNamePage from '@/app/[locale]/property-tax/automation-dashboard/missing-data-analysis/owner-name/page';
import PhotoPlanPage from '@/app/[locale]/property-tax/automation-dashboard/missing-data-analysis/photo-plan/page';

vi.mock('@/app/[locale]/property-tax/automation-dashboard/missing-data-analysis/address/action', () => ({
  getMissingAddressAction: vi.fn(),
}));

vi.mock('@/app/[locale]/property-tax/automation-dashboard/missing-data-analysis/mobile-no/action', () => ({
  getMissingMobileNoAction: vi.fn(),
}));

vi.mock('@/app/[locale]/property-tax/automation-dashboard/missing-data-analysis/owner-name/action', () => ({
  getMissingOwnerNameAction: vi.fn(),
}));

vi.mock('@/app/[locale]/property-tax/automation-dashboard/missing-data-analysis/photo-plan/action', () => ({
  getMissingPhotoPlanAction: vi.fn(),
}));

vi.mock('@/components/modules/property-tax/automation-dashboard/missing-data-analysis/Address/AddressDetails', () => ({
  default: () => <div data-testid="address-details" />,
}));

vi.mock('@/components/modules/property-tax/automation-dashboard/missing-data-analysis/Mobile-No/MobileNoDetails', () => ({
  default: () => <div data-testid="mobile-no-details" />,
}));

vi.mock('@/components/modules/property-tax/automation-dashboard/missing-data-analysis/owner-name/OwnerNameDetails', () => ({
  default: () => <div data-testid="owner-name-details" />,
}));

vi.mock('@/components/modules/property-tax/automation-dashboard/missing-data-analysis/Photo-Plan/MissingPhotoPlanDetails', () => ({
  default: () => <div data-testid="photo-plan-details" />,
}));

import { getMissingAddressAction } from '@/app/[locale]/property-tax/automation-dashboard/missing-data-analysis/address/action';
import { getMissingMobileNoAction } from '@/app/[locale]/property-tax/automation-dashboard/missing-data-analysis/mobile-no/action';
import { getMissingOwnerNameAction } from '@/app/[locale]/property-tax/automation-dashboard/missing-data-analysis/owner-name/action';
import { getMissingPhotoPlanAction } from '@/app/[locale]/property-tax/automation-dashboard/missing-data-analysis/photo-plan/action';

describe('Missing Data Analysis Page Error Handling', () => {
  it('MissingAddressPage throws error when action fails', async () => {
    vi.mocked(getMissingAddressAction).mockResolvedValueOnce({
      success: false,
      error: 'Network failure',
    });

    await expect(MissingAddressPage()).rejects.toThrow('Network failure');
  });

  it('MissingMobileNoPage throws error when action fails', async () => {
    vi.mocked(getMissingMobileNoAction).mockResolvedValueOnce({
      success: false,
      error: 'API error',
    });

    await expect(MissingMobileNoPage()).rejects.toThrow('API error');
  });

  it('MissingOwnerNamePage throws error when action fails', async () => {
    vi.mocked(getMissingOwnerNameAction).mockResolvedValueOnce({
      success: false,
      error: 'Service unavailable',
    });

    await expect(MissingOwnerNamePage()).rejects.toThrow('Service unavailable');
  });

  it('PhotoPlanPage throws error when action fails', async () => {
    vi.mocked(getMissingPhotoPlanAction).mockResolvedValueOnce({
      success: false,
      error: 'Server error',
    });

    await expect(PhotoPlanPage()).rejects.toThrow('Server error');
  });
});
