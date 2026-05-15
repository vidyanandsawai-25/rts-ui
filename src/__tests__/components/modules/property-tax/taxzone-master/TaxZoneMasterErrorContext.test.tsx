import { render, screen, act } from '@testing-library/react';
import { TaxZoneMasterErrorProvider, useTaxZoneMasterError } from '@/components/modules/property-tax/taxzonemaster/TaxZoneMasterErrorContext';
import { describe, it, expect, vi } from 'vitest';

const TestComponent = () => {
  const { hasError, setHasError } = useTaxZoneMasterError();
  return (
    <div>
      <span data-testid="error-state">{hasError.toString()}</span>
      <button onClick={() => setHasError(true)}>Set Error</button>
    </div>
  );
};

describe('TaxZoneMasterErrorContext', () => {
  it('should provide default error state as false', () => {
    render(
      <TaxZoneMasterErrorProvider>
        <TestComponent />
      </TaxZoneMasterErrorProvider>
    );
    expect(screen.getByTestId('error-state').textContent).toBe('false');
  });

  it('should update error state when setHasError is called', () => {
    render(
      <TaxZoneMasterErrorProvider>
        <TestComponent />
      </TaxZoneMasterErrorProvider>
    );
    
    act(() => {
      screen.getByText('Set Error').click();
    });
    
    expect(screen.getByTestId('error-state').textContent).toBe('true');
  });

  it('should throw error when used outside provider', () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    expect(() => render(<TestComponent />)).toThrow('useTaxZoneMasterError must be used within a TaxZoneMasterErrorProvider');
    consoleSpy.mockRestore();
  });
});
