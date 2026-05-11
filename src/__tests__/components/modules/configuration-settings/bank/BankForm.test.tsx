import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { BankForm } from '@/components/modules/configuration-settings/bank/BankForm';
import * as bankActions from '@/app/[locale]/configuration-settings/bank-master/actions';
import { toast } from 'sonner';

vi.mock('next-intl', () => ({
  useTranslations: () => (key: string) => key,
  useLocale: () => 'en',
}));

vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

const mockPush = vi.fn();
const mockRefresh = vi.fn();

vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
    refresh: mockRefresh,
  }),
}));

vi.mock('@/app/[locale]/configuration-settings/bank-master/actions', () => ({
  createBankAction: vi.fn(),
  updateBankAction: vi.fn(),
}));

describe('BankForm', () => {
  const user = userEvent.setup();

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(bankActions.createBankAction).mockResolvedValue({ success: true });
    vi.mocked(bankActions.updateBankAction).mockResolvedValue({ success: true });
  });

  it('renders add bank form correctly', () => {
    render(<BankForm id={null} />);

    expect(screen.getByText('drawer.addTitle')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('drawer.placeholders.bankName')).toBeInTheDocument();
  });

  it('renders edit bank form with initial data', () => {
    const initialData = {
      id: '1',
      bankCode: 'SBI001',
      bankName: 'State Bank of India',
      branchName: 'Main',
      ifscCode: 'SBIN0000001',
      address: 'Mumbai',
      city: 'Mumbai',
      state: 'Maharashtra',
      pincode: '400001',
      isActive: true,
    };

    render(<BankForm id="1" initialData={initialData} />);

    expect(screen.getByText('drawer.editTitle')).toBeInTheDocument();
    expect(screen.getByDisplayValue('State Bank of India')).toBeInTheDocument();
  });

  it('shows validation errors for empty required fields on submit', async () => {
    render(<BankForm id={null} />);

    const submitButton = screen.getByText('drawer.buttons.save');
    await user.click(submitButton);

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('messages.validationError');
    });
  });

  it('handles successful bank creation', async () => {
    render(<BankForm id={null} />);

    await user.type(screen.getByPlaceholderText('drawer.placeholders.bankCode'), 'HDFC01');
    await user.type(screen.getByPlaceholderText('drawer.placeholders.bankName'), 'HDFC Bank');
    await user.type(screen.getByPlaceholderText('drawer.placeholders.ifscCode'), 'HDFC0000001');
    await user.type(screen.getByPlaceholderText('drawer.placeholders.branchName'), 'Downtown');
    await user.type(screen.getByPlaceholderText('drawer.placeholders.streetAddress'), 'Street 1');
    await user.type(screen.getByPlaceholderText('drawer.placeholders.city'), 'Mumbai');
    await user.type(screen.getByPlaceholderText('drawer.placeholders.state'), 'Maharashtra');
    await user.type(screen.getByPlaceholderText('drawer.placeholders.pincode'), '400001');

    const submitButton = screen.getByText('drawer.buttons.save');
    await user.click(submitButton);

    await waitFor(() => {
      expect(bankActions.createBankAction).toHaveBeenCalled();
      expect(toast.success).toHaveBeenCalledWith('messages.createSuccess');
    }, { timeout: 10000 });
  }, 15000);

  it('validates IFSC code format', async () => {
    render(<BankForm id={null} />);

    const ifscInput = screen.getByPlaceholderText('drawer.placeholders.ifscCode');
    await user.type(ifscInput, 'INVALID');
    fireEvent.blur(ifscInput);

    await waitFor(() => {
      expect(screen.getByText('validation.ifscFormat')).toBeInTheDocument();
    });
  });

  it('validates pincode length and format', async () => {
    render(<BankForm id={null} />);

    const pincodeInput = screen.getByPlaceholderText('drawer.placeholders.pincode');

    // Too short
    await user.type(pincodeInput, '1234');
    fireEvent.blur(pincodeInput);
    await waitFor(() => {
      expect(screen.getByText('validation.pincodeFormat')).toBeInTheDocument();
    });

    // Too long
    await user.clear(pincodeInput);
    await user.type(pincodeInput, '1234567');
    fireEvent.blur(pincodeInput);
    await waitFor(() => {
      expect(screen.getByText('validation.pincodeFormat')).toBeInTheDocument();
    });
  });

  it('handles API failure during bank creation', async () => {
    vi.mocked(bankActions.createBankAction).mockResolvedValue({
      success: false,
      error: 'messages.errorOccurred',
    });

    render(<BankForm id={null} />);

    // Fill minimal required fields
    await user.type(screen.getByPlaceholderText('drawer.placeholders.bankCode'), 'FAIL01');
    await user.type(screen.getByPlaceholderText('drawer.placeholders.bankName'), 'Fail Bank');
    await user.type(screen.getByPlaceholderText('drawer.placeholders.ifscCode'), 'FAIL0000001');
    await user.type(screen.getByPlaceholderText('drawer.placeholders.branchName'), 'Branch');
    await user.type(screen.getByPlaceholderText('drawer.placeholders.streetAddress'), 'Address');
    await user.type(screen.getByPlaceholderText('drawer.placeholders.city'), 'City');
    await user.type(screen.getByPlaceholderText('drawer.placeholders.state'), 'State');
    await user.type(screen.getByPlaceholderText('drawer.placeholders.pincode'), '123456');

    await user.click(screen.getByText('drawer.buttons.save'));

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('messages.errorOccurred');
    }, { timeout: 10000 });
  }, 15000);
});
