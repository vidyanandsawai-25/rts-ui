import { fireEvent, render, screen } from '@testing-library/react';
import { NextIntlClientProvider } from 'next-intl';
import { afterEach, describe, expect, it } from 'vitest';

import DynamicFieldRenderer from '@/components/modules/rts/forms/DynamicFieldRenderer';

const messages = {
  rts: {
    serviceForm: {
      map: {
        placeholder: 'Paste Google Maps link',
        helper: 'Use your device location or paste a Google Maps link.',
        useDeviceLocation: 'Use device location',
        validation: 'Enter a valid HTTPS Google Maps link.',
        errors: {
          geolocationUnavailable: 'Current location is not supported by this browser.',
          geolocationDenied: 'Location access was unavailable or denied.',
          invalidCoordinates: 'A valid device location could not be obtained.',
        },
      },
    },
  },
};

const mapField = {
  id: 'treeLocation',
  type: 'map' as const,
  label: { en: 'Tree location' },
  required: true,
};

function renderMapField(value = '') {
  const onChange = (id: string, nextValue: string) => {
    expect(id).toBe('treeLocation');
    renderedValues.treeLocation = nextValue;
  };
  const renderedValues: Record<string, string> = { treeLocation: value };

  render(
    <NextIntlClientProvider locale="en" messages={messages}>
      <DynamicFieldRenderer field={mapField} lang="en" values={renderedValues} onChange={onChange} />
    </NextIntlClientProvider>
  );

  return renderedValues;
}

afterEach(() => {
  Object.defineProperty(navigator, 'geolocation', { configurable: true, value: undefined });
});

describe('DynamicFieldRenderer map field', () => {
  it('fills a Google Maps URL from successful device geolocation', () => {
    Object.defineProperty(navigator, 'geolocation', {
      configurable: true,
      value: {
        getCurrentPosition: (success: PositionCallback) =>
          success({ coords: { latitude: 20.7002, longitude: 77.0082 } } as GeolocationPosition),
      },
    });

    const values = renderMapField();
    fireEvent.click(screen.getByRole('button', { name: 'Use device location' }));

    expect(values.treeLocation).toBe(
      'https://www.google.com/maps/search/?api=1&query=20.7002%2C77.0082'
    );
  });

  it('preserves a manually entered link when geolocation fails', () => {
    Object.defineProperty(navigator, 'geolocation', {
      configurable: true,
      value: {
        getCurrentPosition: (_success: PositionCallback, failure: PositionErrorCallback) =>
          failure({ code: 1, message: 'Permission denied' } as GeolocationPositionError),
      },
    });

    const manualLink = 'https://www.google.com/maps/place/Akola';
    const values = renderMapField(manualLink);
    fireEvent.click(screen.getByRole('button', { name: 'Use device location' }));

    expect(values.treeLocation).toBe(manualLink);
    expect(screen.getByText('Location access was unavailable or denied.')).toBeInTheDocument();
  });
});
