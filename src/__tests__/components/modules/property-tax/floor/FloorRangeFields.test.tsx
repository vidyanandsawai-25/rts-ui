import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextIntlClientProvider } from 'next-intl';

import { FloorRangeFields } from '@/components/modules/property-tax/Floormaster/floor/FloorRangeFields';
import type { FloorRangeFormModel } from '@/types/floor.types';

// ── i18n messages ─────────────────────────────────────────────────────────────
const messages = {
  floor: {
    floor: {
      form: {
        status: 'Status',
        activeStatusTitle: 'Floor Status',
        activeStatusOn: 'Active',
        activeStatusOff: 'Inactive',
        floorCode: 'Floor Code',
        floorCodePlaceholder: 'Enter floor code',
        range: {
          title: 'Floor Range',
          start: 'Start',
          end: 'End',
          startPlaceholder: '1',
          endPlaceholder: '10',
        },
        englishName: {
          title: 'English Name',
          prefix: 'Prefix',
          prefixPlaceholder: 'FL',
        },
      
        autoGenerateSubFloor: 'Auto-Generate SubFloor',
        autoGenerateSubFloorDesc: 'Creates a subfloor for every floor in the range',
        rangeExample: 'Example: Range 1-5 creates 1F, 2F, 3F, 4F, 5F',
        validation: {
          rangeStartMinValue: 'Start value must be at least 1',
          rangeEndMinValue: 'End value must be at least 1',
          rangeStartLessThanEnd: 'Start must be less than or equal to End',
          rangeMaxValue: 'Value cannot exceed {count}',
        },
      },
    },
  },
};

// ── Default form data ─────────────────────────────────────────────────────────
const defaultFormData: FloorRangeFormModel = {
  rangeFrom: 1,
  rangeTo: 10,
  prefix: '',
  suffix: '',
  isActive: true,
  autoGenerateSubFloor: false,
};

// ── Render helper ─────────────────────────────────────────────────────────────
function renderFloorRangeFields(
  props: Partial<{
    formData: FloorRangeFormModel;
    errors: Partial<Record<keyof FloorRangeFormModel, string>>;
    showError: (field: keyof FloorRangeFormModel) => boolean;
    onChange: (field: keyof FloorRangeFormModel, value: string | number | boolean) => void;
    onBlur: (field: keyof FloorRangeFormModel) => void;
  }> = {}
) {
  const defaultProps = {
    formData: defaultFormData,
    errors: {},
    showError: () => false,
    onChange: vi.fn(),
    onBlur: vi.fn(),
  };

  return render(
    <NextIntlClientProvider locale="en" messages={messages}>
      <FloorRangeFields {...defaultProps} {...props} />
    </NextIntlClientProvider>
  );
}

// ── Tests ─────────────────────────────────────────────────────────────────────
describe('FloorRangeFields', () => {
  beforeEach(() => vi.clearAllMocks());


  it('renders Start and End fields', () => {
    renderFloorRangeFields();
    expect(screen.getByLabelText(/Start/)).toBeInTheDocument();
    expect(screen.getByLabelText(/End/)).toBeInTheDocument();
  });

  it('renders Prefix field', () => {
    renderFloorRangeFields();
    expect(screen.getByLabelText('Prefix')).toBeInTheDocument();
  });

  it('renders example info message', () => {
    renderFloorRangeFields();
    expect(screen.getByText(/Example: Range 1-5 creates 1F, 2F, 3F, 4F, 5F/)).toBeInTheDocument();
  });

  it('calls onChange when Start value is changed', () => {
    const onChangeMock = vi.fn();
    renderFloorRangeFields({ onChange: onChangeMock });
    
    const startInput = screen.getByLabelText(/Start/);
    fireEvent.change(startInput, { target: { value: '5' } });
    
    expect(onChangeMock).toHaveBeenCalledWith('rangeFrom', 5);
  });

  it('calls onChange when End value is changed', () => {
    const onChangeMock = vi.fn();
    renderFloorRangeFields({ onChange: onChangeMock });
    
    const endInput = screen.getByLabelText(/End/);
    fireEvent.change(endInput, { target: { value: '20' } });
    
    expect(onChangeMock).toHaveBeenCalledWith('rangeTo', 20);
  });

  it('calls onBlur when Start input loses focus', () => {
    const onBlurMock = vi.fn();
    renderFloorRangeFields({ onBlur: onBlurMock });
    
    const startInput = screen.getByLabelText(/Start/);
    fireEvent.blur(startInput);
    
    expect(onBlurMock).toHaveBeenCalledWith('rangeFrom');
  });

  it('calls onBlur when End input loses focus', () => {
    const onBlurMock = vi.fn();
    renderFloorRangeFields({ onBlur: onBlurMock });
    
    const endInput = screen.getByLabelText(/End/);
    fireEvent.blur(endInput);
    
    expect(onBlurMock).toHaveBeenCalledWith('rangeTo');
  });

  it('displays validation error when showError returns true', () => {
    renderFloorRangeFields({
      errors: { rangeFrom: 'Start value must be at least 1' },
      showError: (field) => field === 'rangeFrom',
    });
    
    expect(screen.getByText('Start value must be at least 1')).toBeInTheDocument();
  });

  it('calls onChange when prefix is changed with valid length', () => {
    const onChangeMock = vi.fn();
    renderFloorRangeFields({ onChange: onChangeMock });
    const prefixInput = screen.getByLabelText('Prefix');
    fireEvent.change(prefixInput, { target: { value: 'FL' } });
    expect(onChangeMock).toHaveBeenCalledWith('prefix', 'FL');
  });

  it('restricts Prefix field to 2 characters maximum', () => {
    const onChangeMock = vi.fn();
    renderFloorRangeFields({ onChange: onChangeMock });
    const prefixInput = screen.getByLabelText('Prefix');
    fireEvent.change(prefixInput, { target: { value: 'ABC' } });
    expect(onChangeMock).not.toHaveBeenCalledWith('prefix', 'ABC');
    fireEvent.change(prefixInput, { target: { value: 'FL' } });
    expect(onChangeMock).toHaveBeenCalledWith('prefix', 'FL');
  });





  it('displays initial form values correctly', () => {
    renderFloorRangeFields();
    
    const startInput = screen.getByLabelText(/Start/) as HTMLInputElement;
    const endInput = screen.getByLabelText(/End/) as HTMLInputElement;
    
    expect(startInput.value).toBe('1');
    expect(endInput.value).toBe('10');
  });

  // ── 4-Digit Limit Tests ──────────────────────────────────────────────────────
  it('restricts Start field to 3 digits maximum', () => {
    const onChangeMock = vi.fn();
    renderFloorRangeFields({ onChange: onChangeMock });
    
    const startInput = screen.getByLabelText(/Start/);
    
    // Try to enter 4 digits - should only accept first 3
    fireEvent.change(startInput, { target: { value: '1234' } });
    
    // onChange should not be called for 4-digit input
    expect(onChangeMock).not.toHaveBeenCalledWith('rangeFrom', 1234);
    
    // Try to enter 3 digits - should work
    fireEvent.change(startInput, { target: { value: '123' } });
    expect(onChangeMock).toHaveBeenCalledWith('rangeFrom', 123);
  });

  it('restricts End field to 3 digits maximum', () => {
    const onChangeMock = vi.fn();
    renderFloorRangeFields({ onChange: onChangeMock });
    
    const endInput = screen.getByLabelText(/End/);
    
    // Try to enter 4 digits - should only accept first 3
    fireEvent.change(endInput, { target: { value: '9876' } });
    
    // onChange should not be called for 4-digit input
    expect(onChangeMock).not.toHaveBeenCalledWith('rangeTo', 9876);
    
    // Try to enter 3 digits - should work
    fireEvent.change(endInput, { target: { value: '987' } });
    expect(onChangeMock).toHaveBeenCalledWith('rangeTo', 987);
  });

  it('accepts valid 3-digit values for Start and End fields', () => {
    const onChangeMock = vi.fn();
    renderFloorRangeFields({ onChange: onChangeMock });
    
    const startInput = screen.getByLabelText(/Start/);
    const endInput = screen.getByLabelText(/End/);
    
    // Test boundary values (max 999)
    fireEvent.change(startInput, { target: { value: '999' } });
    fireEvent.change(endInput, { target: { value: '999' } });
    
    expect(onChangeMock).toHaveBeenCalledWith('rangeFrom', 999);
    expect(onChangeMock).toHaveBeenCalledWith('rangeTo', 999);
  });

});
