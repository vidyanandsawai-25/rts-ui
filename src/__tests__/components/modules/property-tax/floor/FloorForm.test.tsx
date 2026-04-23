import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextIntlClientProvider } from 'next-intl';

// ── Hoisted spies (must be above vi.mock so the factory can close over them) ─
const pushSpy = vi.hoisted(() => vi.fn());

// ── Module mocks ──────────────────────────────────────────────────────────────
vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: pushSpy, refresh: vi.fn() }),
}));

vi.mock('next-intl', async (importOriginal) => {
  const actual = await importOriginal<typeof import('next-intl')>();
  return { ...actual, useLocale: () => 'en' };
});

vi.mock('@/app/[locale]/property-tax/floormaster/actions', () => ({
  createFloorAction: vi.fn(),
  updateFloorAction: vi.fn(),
}));

import FloorForm from '@/components/modules/property-tax/Floormaster/floor/FloorForm';
import { createFloorAction, updateFloorAction } from '@/app/[locale]/property-tax/floormaster/actions';
import type { Floor } from '@/types/floor.types';

// ── i18n messages ─────────────────────────────────────────────────────────────
const messages = {
  common: {
    buttons: { cancel: 'Cancel' },
    actions: { save: 'Save', update: 'Update' },
    note: { mandatory: 'Fields marked * are mandatory' },
    errors: { unauthorized: 'Unauthorized', serverError: 'Server error' },
  },
  floor: {
    floor: {
      form: {
        addTitle: 'Add Floor',
        editTitle: 'Edit Floor',
        addSubtitle: 'Create a new floor',
        editSubtitle: 'Update floor details',
        floorCode: 'Floor Code',
        floorCodePlaceholder: 'Enter floor code',
        description: 'Description',
        descriptionPlaceholder: 'Enter description',
        sequenceNo: 'Sequence No',
        activeStatusTitle: 'Active Status',
        activeStatusOn: 'Active',
        activeStatusOff: 'Inactive',
        validation: {
          codeRequired: 'Floor code is required',
          codeMaxLength: 'Max {count} characters',
          codeFormat: 'Only alphanumeric allowed',
          descriptionRequired: 'Description is required',
          descriptionMaxLength: 'Max {count} characters',
          descriptionFormat: 'Invalid format',
          mustBeActive: 'Must be active on create',
        },
      },
      validation: { mustBeNumber: 'Must be a valid number' },
      success: { created: 'Floor {code} created', updated: 'Floor {code} updated' },
      apiErrors: {
        duplicateRecord: 'Duplicate record',
        invalidData: 'Invalid data',
        notFound: 'Not found',
        operationFailed: 'Operation failed',
      },
      messages: {
        createSuccess: 'Floor {code} created',
        updateSuccess: 'Floor {code} updated',
        deleteSuccess: 'Deleted',
      },
    },
  },
};

// ── Fixtures ──────────────────────────────────────────────────────────────────
const existingFloor: Floor = {
  id: 10,
  floorCode: 'GF',
  description: 'Ground Floor',
  sequenceNo: 1,
  isActive: true,
  createdDate: '2024-01-01',
  updatedDate: null,
};

function renderAdd() {
  return render(
    <NextIntlClientProvider locale="en" messages={messages}>
      <FloorForm id={null} />
    </NextIntlClientProvider>
  );
}

function renderEdit(floor: Floor = existingFloor) {
  return render(
    <NextIntlClientProvider locale="en" messages={messages}>
      <FloorForm id={floor.id} initialData={floor} />
    </NextIntlClientProvider>
  );
}

/** Submit the form directly by id (bypasses button↔form attribute wiring in JSDOM) */
function submitForm(container: HTMLElement, formId = 'form') {
  const form = container.querySelector(`#${formId}`) as HTMLFormElement;
  expect(form).not.toBeNull();
  fireEvent.submit(form);
}

// ── Tests ─────────────────────────────────────────────────────────────────────
describe('FloorForm — Add Mode', () => {
  beforeEach(() => vi.clearAllMocks());

  it('renders Add Floor title', () => {
    renderAdd();
    expect(screen.getByText('Add Floor')).toBeInTheDocument();
  });

  it('renders Floor Code, Description and Sequence No fields', () => {
    renderAdd();
    expect(screen.getByPlaceholderText('Enter floor code')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Enter description')).toBeInTheDocument();
  });

  it('renders Save and Cancel buttons', () => {
    renderAdd();
    expect(screen.getByRole('button', { name: /save/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /cancel/i })).toBeInTheDocument();
  });

  it('shows validation error when form submitted empty', async () => {
    const { container } = renderAdd();
    submitForm(container);
    await waitFor(() => {
      expect(screen.getByText('Floor code is required')).toBeInTheDocument();
    });
  });

  it('shows description required error when code is filled but description is empty', async () => {
    const { container } = renderAdd();
    fireEvent.change(screen.getByPlaceholderText('Enter floor code'), {
      target: { name: 'floorCode', value: 'GF' },
    });
    submitForm(container);
    await waitFor(() => {
      expect(screen.getByText('Description is required')).toBeInTheDocument();
    });
  });

  it('calls createFloorAction with correct data on valid submit', async () => {
    vi.mocked(createFloorAction).mockResolvedValue({ success: true });
    const { container } = renderAdd();

    fireEvent.change(screen.getByPlaceholderText('Enter floor code'), {
      target: { name: 'floorCode', value: 'GF' },
    });
    fireEvent.change(screen.getByPlaceholderText('Enter description'), {
      target: { name: 'description', value: 'Ground Floor' },
    });
    submitForm(container);

    await waitFor(() => {
      expect(createFloorAction).toHaveBeenCalledWith(
        expect.objectContaining({ floorCode: 'GF', description: 'Ground Floor' })
      );
    });
  });

  it('does NOT call createFloorAction when validation fails', async () => {
    const { container } = renderAdd();
    submitForm(container);
    await waitFor(() => {
      expect(screen.getByText('Floor code is required')).toBeInTheDocument();
    });
    expect(createFloorAction).not.toHaveBeenCalled();
  });

  it('shows validation error on blur for floorCode', async () => {
    renderAdd();
    const codeInput = screen.getByPlaceholderText('Enter floor code');
    fireEvent.focus(codeInput);
    fireEvent.blur(codeInput);
    await waitFor(() => {
      expect(screen.getByText('Floor code is required')).toBeInTheDocument();
    });
  });

  it('does NOT show status toggle in add mode', () => {
    renderAdd();
    expect(screen.queryByText('Active Status')).not.toBeInTheDocument();
  });
});

describe('FloorForm — Edit Mode', () => {
  beforeEach(() => vi.clearAllMocks());

  it('renders Edit Floor title', () => {
    renderEdit();
    expect(screen.getByText('Edit Floor')).toBeInTheDocument();
  });

  it('pre-fills form with existing floor data', () => {
    renderEdit();
    expect(screen.getByDisplayValue('GF')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Ground Floor')).toBeInTheDocument();
  });

  it('shows status toggle in edit mode', () => {
    renderEdit();
    expect(screen.getByText('Active Status')).toBeInTheDocument();
  });

  it('calls updateFloorAction on valid submit in edit mode', async () => {
    vi.mocked(updateFloorAction).mockResolvedValue({ success: true });
    const { container } = renderEdit();
    submitForm(container);

    await waitFor(() => {
      expect(updateFloorAction).toHaveBeenCalledWith(
        expect.objectContaining({ id: 10, floorCode: 'GF' })
      );
    });
  });

  it('shows error toast on duplicate (409)', async () => {
    vi.mocked(updateFloorAction).mockResolvedValue({ success: false, statusCode: 409 });
    const { container } = renderEdit();
    submitForm(container);

    await waitFor(() => {
      expect(updateFloorAction).toHaveBeenCalled();
    });
  });
});
