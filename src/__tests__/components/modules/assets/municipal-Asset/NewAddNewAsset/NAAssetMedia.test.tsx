import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { NAAssetMedia } from '@/components/modules/assets/municipal-Asset/NewAddNewAsset/components/NAAssetMedia';
import enTranslations from '@/i18n/locales/en/newAddNewAsset.json';

function getNestedValue(obj: Record<string, unknown>, path: string): string {
  const parts = path.split('.');
  let current: unknown = obj;
  for (const part of parts) {
    if (current && typeof current === 'object' && part in current) {
      current = (current as Record<string, unknown>)[part];
    } else {
      return path;
    }
  }
  return typeof current === 'string' ? current : path;
}

vi.mock('next-intl', () => ({
  useTranslations: () => (key: string, params?: Record<string, unknown>) => {
    let text = getNestedValue(enTranslations, key);
    if (params) {
      Object.entries(params).forEach(([k, v]) => {
        text = text.replace(`{${k}}`, String(v));
      });
    }
    return text;
  },
  useLocale: () => 'en',
}));

describe('NAAssetMedia Component', () => {
  it('renders localized card header and sections', () => {
    render(<NAAssetMedia currentStep={1} />);

    expect(screen.getByText('Asset Media')).toBeInTheDocument();
    expect(screen.getByText('Asset Photo')).toBeInTheDocument();
    expect(screen.getByText('Upload')).toBeInTheDocument();
    expect(screen.getByText('No image uploaded. Click to upload.')).toBeInTheDocument();

    expect(screen.getByText('Asset Photo Plan')).toBeInTheDocument();
    expect(screen.getByText('Upload Plan')).toBeInTheDocument();
    expect(screen.getByText('No plan uploaded. Click to upload.')).toBeInTheDocument();
  });
});
