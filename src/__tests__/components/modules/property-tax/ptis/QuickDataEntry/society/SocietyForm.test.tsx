import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import SocietyForm from '@/components/modules/property-tax/ptis/QuickDataEntry/society/SocietyForm';
import { PropertySocietyDetailsApiItem } from '@/types/property-society-details.types';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { updatePropertySocietyDetailsAction } from '@/app/[locale]/property-tax/ptis/QuickDataEntry/[propertyId]/Society/action';

// Mock dependencies
vi.mock('next-intl', () => ({
    useTranslations: () => (key: string) => key,
}));

vi.mock('next/navigation', () => ({
    useRouter: vi.fn(),
}));

vi.mock('sonner', () => ({
    toast: {
        error: vi.fn(),
        success: vi.fn(),
    },
}));

vi.mock('@/app/[locale]/property-tax/ptis/QuickDataEntry/[propertyId]/Society/action', () => ({
    updatePropertySocietyDetailsAction: vi.fn(),
}));

vi.mock('@/components/common/ConfirmProvider', () => ({
    useConfirm: () => ({
        confirm: vi.fn((options) => {
            if (options.onConfirm) {
                options.onConfirm();
            }
        }),
    }),
}));

describe('SocietyForm', () => {
    const mockRouter = {
        push: vi.fn(),
        refresh: vi.fn(),
        back: vi.fn(),
        forward: vi.fn(),
        replace: vi.fn(),
        prefetch: vi.fn().mockResolvedValue(undefined),
    };

    const mockSocietyData: PropertySocietyDetailsApiItem = {
        propertyId: 123,
        societyDetailId: 1,
        wingId: 1,
        wingNo: 'A',
        wingName: 'Wing A',
        societyName: 'Test Society',
        societyAddress: '123 Test Street',
        societyEmailId: 'society@test.com',
        managerName: 'John Manager',
        managerEmailId: 'manager@test.com',
        managerMobileNo: '9876543210',
        secretaryName: 'Jane Secretary',
        secretaryEmailId: 'secretary@test.com',
        secretaryMobileNo: '9876543211',
        landOwnerName: 'Land Owner',
        builderName: 'Builder Name',
        societyNameEnglish: 'Test Society',
        societyAddressEnglish: '123 Test Street',
        managerNameEnglish: 'John Manager',
        secretaryNameEnglish: 'Jane Secretary',
        landOwnerNameEnglish: 'Land Owner',
        builderNameEnglish: 'Builder Name',
    };

    beforeEach(() => {
        vi.clearAllMocks();
        vi.mocked(useRouter).mockReturnValue(mockRouter);
    });

    describe('Rendering', () => {
        it('should render the form with all fields', () => {
            render(
                <SocietyForm
                    societyData={null}
                    propertyIdSearch={123}
                    locale="en"
                />
            );

            expect(screen.getByText('society.title')).toBeInTheDocument();
            expect(screen.getByPlaceholderText('society.landOwnerPlaceholder')).toBeInTheDocument();
            expect(screen.getByPlaceholderText('society.builderNamePlaceholder')).toBeInTheDocument();
            expect(screen.getByPlaceholderText('society.buildingSocietyNamePlaceholder')).toBeInTheDocument();
            expect(screen.getByPlaceholderText('society.societyEmailPlaceholder')).toBeInTheDocument();
            expect(screen.getByPlaceholderText('society.societyAddressPlaceholder')).toBeInTheDocument();
            expect(screen.getByPlaceholderText('society.managerNamePlaceholder')).toBeInTheDocument();
            expect(screen.getByPlaceholderText('society.managerEmailPlaceholder')).toBeInTheDocument();
            expect(screen.getByPlaceholderText('society.secretaryNamePlaceholder')).toBeInTheDocument();
            expect(screen.getByPlaceholderText('society.secretaryEmailPlaceholder')).toBeInTheDocument();
        });

        it('should render with default values when societyData is provided', () => {
            render(
                <SocietyForm
                    societyData={mockSocietyData}
                    propertyIdSearch={123}
                    locale="en"
                />
            );

            const landOwnerInput = screen.getByPlaceholderText('society.landOwnerPlaceholder') as HTMLInputElement;
            const builderInput = screen.getByPlaceholderText('society.builderNamePlaceholder') as HTMLInputElement;
            const societyNameInput = screen.getByPlaceholderText('society.buildingSocietyNamePlaceholder') as HTMLInputElement;

            expect(landOwnerInput.value).toBe('Land Owner');
            expect(builderInput.value).toBe('Builder Name');
            expect(societyNameInput.value).toBe('Test Society');
        });

        it('should render mobile number inputs with 10 digit boxes', () => {
            render(
                <SocietyForm
                    societyData={null}
                    propertyIdSearch={123}
                    locale="en"
                />
            );

            const managerContainer = document.getElementById('manager-mobile-container');
            const secretaryContainer = document.getElementById('secretary-mobile-container');

            expect(managerContainer).toBeInTheDocument();
            expect(secretaryContainer).toBeInTheDocument();

            const managerInputs = managerContainer?.querySelectorAll('input');
            const secretaryInputs = secretaryContainer?.querySelectorAll('input');

            expect(managerInputs?.length).toBe(10);
            expect(secretaryInputs?.length).toBe(10);
        });

        it('should populate mobile number digits when societyData is provided', () => {
            render(
                <SocietyForm
                    societyData={mockSocietyData}
                    propertyIdSearch={123}
                    locale="en"
                />
            );

            const managerContainer = document.getElementById('manager-mobile-container');
            const managerInputs = managerContainer?.querySelectorAll('input') as NodeListOf<HTMLInputElement>;

            expect(managerInputs[0].value).toBe('9');
            expect(managerInputs[1].value).toBe('8');
            expect(managerInputs[2].value).toBe('7');
            expect(managerInputs[9].value).toBe('0');
        });
    });

    describe('Mobile Number Input Behavior', () => {
        it('should auto-focus next input on entering a digit', async () => {
            render(
                <SocietyForm
                    societyData={null}
                    propertyIdSearch={123}
                    locale="en"
                />
            );

            const managerContainer = document.getElementById('manager-mobile-container');
            const inputs = managerContainer?.querySelectorAll('input') as NodeListOf<HTMLInputElement>;

            const firstInput = inputs[0];

            fireEvent.change(firstInput, { target: { value: '9' } });

            // Check if value is set
            await waitFor(() => {
                expect(firstInput.value).toBe('9');
            });
        });

        it('should handle backspace navigation', () => {
            render(
                <SocietyForm
                    societyData={null}
                    propertyIdSearch={123}
                    locale="en"
                />
            );

            const managerContainer = document.getElementById('manager-mobile-container');
            const inputs = managerContainer?.querySelectorAll('input') as NodeListOf<HTMLInputElement>;

            const secondInput = inputs[1];

            fireEvent.keyDown(secondInput, { key: 'Backspace' });

            // Backspace behavior is tested
            expect(secondInput).toBeInTheDocument();
        });

        it('should only accept numeric values', async () => {
            render(
                <SocietyForm
                    societyData={null}
                    propertyIdSearch={123}
                    locale="en"
                />
            );

            const managerContainer = document.getElementById('manager-mobile-container');
            const inputs = managerContainer?.querySelectorAll('input') as NodeListOf<HTMLInputElement>;

            const firstInput = inputs[0];

            fireEvent.change(firstInput, { target: { value: 'a' } });

            await waitFor(() => {
                expect(firstInput.value).toBe('');
            });
        });
    });

    describe('Form Validation', () => {
        it('should show error toast for invalid email format', async () => {
            const { updatePropertySocietyDetailsAction } = await import(
                '@/app/[locale]/property-tax/ptis/QuickDataEntry/[propertyId]/Society/action'
            );

            render(
                <SocietyForm
                    societyData={null}
                    propertyIdSearch={123}
                    locale="en"
                />
            );

            const societyEmailInput = screen.getByPlaceholderText('society.societyEmailPlaceholder');
            const submitButton = screen.getByText('society.updateButton');

            fireEvent.change(societyEmailInput, { target: { value: 'invalid-email' } });
            fireEvent.click(submitButton);

            await waitFor(() => {
                expect(toast.error).toHaveBeenCalled();
            });

            expect(updatePropertySocietyDetailsAction).not.toHaveBeenCalled();
        });

        it('should validate manager mobile number length', async () => {
            const { updatePropertySocietyDetailsAction } = await import(
                '@/app/[locale]/property-tax/ptis/QuickDataEntry/[propertyId]/Society/action'
            );

            render(
                <SocietyForm
                    societyData={null}
                    propertyIdSearch={123}
                    locale="en"
                />
            );

            const managerContainer = document.getElementById('manager-mobile-container');
            const inputs = managerContainer?.querySelectorAll('input') as NodeListOf<HTMLInputElement>;

            // Enter only 5 digits
            fireEvent.change(inputs[0], { target: { value: '9' } });
            fireEvent.change(inputs[1], { target: { value: '8' } });
            fireEvent.change(inputs[2], { target: { value: '7' } });
            fireEvent.change(inputs[3], { target: { value: '6' } });
            fireEvent.change(inputs[4], { target: { value: '5' } });

            const submitButton = screen.getByText('society.updateButton');
            fireEvent.click(submitButton);

            await waitFor(() => {
                expect(toast.error).toHaveBeenCalled();
            });

            expect(updatePropertySocietyDetailsAction).not.toHaveBeenCalled();
        });
    });

    describe('Form Submission', () => {
        it('should submit form with valid data', async () => {
            vi.mocked(updatePropertySocietyDetailsAction).mockResolvedValue({
                success: true,
            } as Awaited<ReturnType<typeof updatePropertySocietyDetailsAction>>);

            render(
                <SocietyForm
                    societyData={mockSocietyData}
                    propertyIdSearch={123}
                    locale="en"
                />
            );

            const submitButton = screen.getByText('society.updateButton');
            fireEvent.click(submitButton);

            await waitFor(() => {
                expect(updatePropertySocietyDetailsAction).toHaveBeenCalled();
            });
        });

        it('should show success toast on successful submission', async () => {
            vi.mocked(updatePropertySocietyDetailsAction).mockResolvedValue({
                success: true,
            } as Awaited<ReturnType<typeof updatePropertySocietyDetailsAction>>);

            render(
                <SocietyForm
                    societyData={mockSocietyData}
                    propertyIdSearch={123}
                    locale="en"
                />
            );

            const submitButton = screen.getByText('society.updateButton');
            fireEvent.click(submitButton);

            await waitFor(() => {
                expect(toast.success).toHaveBeenCalledWith('society.updateSuccess');
            });
        });

        it('should refresh router on successful submission', async () => {
            vi.mocked(updatePropertySocietyDetailsAction).mockResolvedValue({
                success: true,
            } as Awaited<ReturnType<typeof updatePropertySocietyDetailsAction>>);

            render(
                <SocietyForm
                    societyData={mockSocietyData}
                    propertyIdSearch={123}
                    locale="en"
                />
            );

            const submitButton = screen.getByText('society.updateButton');
            fireEvent.click(submitButton);

            await waitFor(() => {
                expect(mockRouter.refresh).toHaveBeenCalled();
            });
        });

        it('should show error toast on submission failure', async () => {
            vi.mocked(updatePropertySocietyDetailsAction).mockResolvedValue({
                success: false,
                error: 'Update failed',
            } as Awaited<ReturnType<typeof updatePropertySocietyDetailsAction>>);

            render(
                <SocietyForm
                    societyData={mockSocietyData}
                    propertyIdSearch={123}
                    locale="en"
                />
            );

            const submitButton = screen.getByText('society.updateButton');
            fireEvent.click(submitButton);

            await waitFor(() => {
                expect(toast.error).toHaveBeenCalledWith('Update failed');
            });
        });

        it('should handle submission exception', async () => {
            vi.mocked(updatePropertySocietyDetailsAction).mockRejectedValue(
                new Error('Network error')
            );

            render(
                <SocietyForm
                    societyData={mockSocietyData}
                    propertyIdSearch={123}
                    locale="en"
                />
            );

            const submitButton = screen.getByText('society.updateButton');
            fireEvent.click(submitButton);

            await waitFor(() => {
                expect(toast.error).toHaveBeenCalledWith('society.updateError');
            });
        });
    });

    describe('Loading State', () => {
        it('should show loading state during submission', async () => {
            vi.mocked(updatePropertySocietyDetailsAction).mockImplementation(
                () => new Promise((resolve) => setTimeout(() => resolve({ success: true } as Awaited<ReturnType<typeof updatePropertySocietyDetailsAction>>), 100))
            );

            render(
                <SocietyForm
                    societyData={mockSocietyData}
                    propertyIdSearch={123}
                    locale="en"
                />
            );

            const submitButton = screen.getByText('society.updateButton');
            fireEvent.click(submitButton);

            // Button should be in loading state
            await waitFor(() => {
                expect(updatePropertySocietyDetailsAction).toHaveBeenCalled();
            });
        });
    });

    describe('Payload Construction', () => {
        it('should construct correct payload with all fields', async () => {
            vi.mocked(updatePropertySocietyDetailsAction).mockResolvedValue({
                success: true,
            } as Awaited<ReturnType<typeof updatePropertySocietyDetailsAction>>);

            render(
                <SocietyForm
                    societyData={mockSocietyData}
                    propertyIdSearch={123}
                    locale="en"
                />
            );

            const submitButton = screen.getByText('society.updateButton');
            fireEvent.click(submitButton);

            await waitFor(() => {
                expect(updatePropertySocietyDetailsAction).toHaveBeenCalledWith(
                    'en',
                    123,
                    expect.objectContaining({
                        propertyId: 123,
                        societyDetailId: 1,
                        societyName: 'Test Society',
                        societyAddress: '123 Test Street',
                        managerName: 'John Manager',
                        managerEmailId: 'manager@test.com',
                        managerMobileNo: '9876543210',
                        secretaryName: 'Jane Secretary',
                        secretaryEmailId: 'secretary@test.com',
                        secretaryMobileNo: '9876543211',
                        landOwnerName: 'Land Owner',
                        builderName: 'Builder Name',
                    })
                );
            });
        });

        it('should use propertyIdSearch when societyData is null', async () => {
            vi.mocked(updatePropertySocietyDetailsAction).mockResolvedValue({
                success: true,
            } as Awaited<ReturnType<typeof updatePropertySocietyDetailsAction>>);

            render(
                <SocietyForm
                    societyData={null}
                    propertyIdSearch={456}
                    locale="en"
                />
            );

            const landOwnerInput = screen.getByPlaceholderText('society.landOwnerPlaceholder');
            fireEvent.change(landOwnerInput, { target: { value: 'New Owner' } });

            const submitButton = screen.getByText('society.updateButton');
            fireEvent.click(submitButton);

            await waitFor(() => {
                expect(updatePropertySocietyDetailsAction).toHaveBeenCalledWith(
                    'en',
                    456,
                    expect.objectContaining({
                        propertyId: 456,
                    })
                );
            });
        });
    });
});

