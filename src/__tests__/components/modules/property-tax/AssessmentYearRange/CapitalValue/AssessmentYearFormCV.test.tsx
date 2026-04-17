import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useRouter } from 'next/navigation';
import AssessmentYearFormCV from '@/components/modules/property-tax/AssessmentYearRange/CapitalValue/AssessmentYearFormCV';
import * as actions from '@/app/[locale]/property-tax/assessment-year-range/capitalvalue/action';
import type { AssessmentYearCV } from '@/types/assessmentYearMaster.types';

// Mock dependencies
vi.mock('next/navigation', () => ({
  useRouter: vi.fn(),
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

vi.mock('@/app/[locale]/property-tax/assessment-year-range/capitalvalue/action', () => ({
  createAssessmentYearActionCV: vi.fn(),
  updateAssessmentYearActionCV: vi.fn(),
}));

describe('AssessmentYearFormCV', () => {
  const mockRouter = {
    push: vi.fn(),
    back: vi.fn(),
    refresh: vi.fn(),
  };

  const mockOnClose = vi.fn();
  const mockOnSuccess = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    (useRouter as unknown as ReturnType<typeof vi.fn>).mockReturnValue(mockRouter);
  });

  describe('Component Rendering', () => {
    it('should render form in add mode', () => {
      render(
        <AssessmentYearFormCV
          open={true}
          onClose={mockOnClose}
        />
      );

      expect(screen.getByText('formTitleAdd')).toBeInTheDocument();
      expect(screen.getByText('formSubtitleAdd')).toBeInTheDocument();
    });

    it('should render form in edit mode with initial data', () => {
      const initialData: AssessmentYearCV = {
        yearId: 1,
        yearRangeCVId: 1,
        fromYear: 2023,
        toYear: 2024,
        isActive: true,
        createdDate: new Date().toISOString(),
        updatedDate: new Date().toISOString(),
      };

      render(
        <AssessmentYearFormCV
          open={true}
          onClose={mockOnClose}
          initialData={initialData}
        />
      );

      expect(screen.getByText('formTitleEdit')).toBeInTheDocument();
      expect(screen.getByDisplayValue('2023')).toBeInTheDocument();
      expect(screen.getByDisplayValue('2024')).toBeInTheDocument();
    });

    it('should render active status toggle in edit mode', () => {
      const initialData: AssessmentYearCV = {
        yearId: 1,
        yearRangeCVId: 1,
        fromYear: 2023,
        toYear: 2024,
        isActive: true,
        createdDate: new Date().toISOString(),
        updatedDate: new Date().toISOString(),
      };

      render(
        <AssessmentYearFormCV
          open={true}
          initialData={initialData}
        />
      );

      expect(screen.getByText('activeStatusLabel')).toBeInTheDocument();
    });

    it('should not render active status toggle in add mode', () => {
      render(
        <AssessmentYearFormCV
          open={true}
          onClose={mockOnClose}
        />
      );

      expect(screen.queryByText('activeStatusLabel')).not.toBeInTheDocument();
    });
  });

  describe('Form Validation', () => {
    it('should show required field errors', async () => {
      const user = userEvent.setup();
      
      render(
        <AssessmentYearFormCV
          open={true}
          onClose={mockOnClose}
        />
      );

      const saveButton = screen.getByRole('button', { name: /save/i });
      await user.click(saveButton);

      await waitFor(() => {
        expect(screen.getByText('fromYearRequired')).toBeInTheDocument();
        expect(screen.getByText('toYearRequired')).toBeInTheDocument();
      });
    });

    it('should validate year format (4 digits)', async () => {
      const user = userEvent.setup();
      
      render(
        <AssessmentYearFormCV
          open={true}
          onClose={mockOnClose}
        />
      );

      const fromYearInput = screen.getByPlaceholderText('fromYearPlaceholder');
      const toYearInput = screen.getByPlaceholderText('toYearPlaceholder');

      await user.type(fromYearInput, '23');
      await user.type(toYearInput, '24');

      const saveButton = screen.getByRole('button', { name: /save/i });
      await user.click(saveButton);

      await waitFor(() => {
        expect(screen.getByText('fromYearFourDigits')).toBeInTheDocument();
        expect(screen.getByText('toYearFourDigits')).toBeInTheDocument();
      });
    });

    it('should validate toYear greater than fromYear', async () => {
      const user = userEvent.setup();
      
      render(
        <AssessmentYearFormCV
          open={true}
          onClose={mockOnClose}
        />
      );

      const fromYearInput = screen.getByPlaceholderText('fromYearPlaceholder');
      const toYearInput = screen.getByPlaceholderText('toYearPlaceholder');

      await user.type(fromYearInput, '2024');
      await user.type(toYearInput, '2023');

      const saveButton = screen.getByRole('button', { name: /save/i });
      await user.click(saveButton);

      await waitFor(() => {
        expect(screen.getByText('toYearGreater')).toBeInTheDocument();
      });
    });
  });

  describe('Form Submission', () => {
    it('should create new record successfully', async () => {
      const user = userEvent.setup();
      vi.spyOn(actions, 'createAssessmentYearActionCV').mockResolvedValue({ success: true, data: {} as AssessmentYearCV });
      
      render(
        <AssessmentYearFormCV
          open={true}
          onClose={mockOnClose}
          onSuccess={mockOnSuccess}
        />
      );

      const fromYearInput = screen.getByPlaceholderText('fromYearPlaceholder');
      const toYearInput = screen.getByPlaceholderText('toYearPlaceholder');

      await user.type(fromYearInput, '2023');
      await user.type(toYearInput, '2024');

      const saveButton = screen.getByRole('button', { name: /save/i });
      await user.click(saveButton);

      await waitFor(() => {
        expect(actions.createAssessmentYearActionCV).toHaveBeenCalledWith({
          fromYear: 2023,
          toYear: 2024,
          isActive: true,
        });
        expect(mockOnSuccess).toHaveBeenCalled();
        expect(mockOnClose).toHaveBeenCalled();
        expect(mockRouter.refresh).toHaveBeenCalled();
      });
    });

    it('should update existing record successfully', async () => {
      const user = userEvent.setup();
      const initialData: AssessmentYearCV = {
        yearId: 1,
        yearRangeCVId: 1,
        fromYear: 2023,
        toYear: 2024,
        isActive: true,
        createdDate: new Date().toISOString(),
        updatedDate: new Date().toISOString(),
      };

      vi.spyOn(actions, 'updateAssessmentYearActionCV').mockResolvedValue({ success: true, data: {} as AssessmentYearCV });
      
      render(
        <AssessmentYearFormCV
          open={true}
          onClose={mockOnClose}
          onSuccess={mockOnSuccess}
          initialData={initialData}
        />
      );

      const saveButton = screen.getByRole('button', { name: /update/i });
      await user.click(saveButton);

      await waitFor(() => {
        expect(actions.updateAssessmentYearActionCV).toHaveBeenCalled();
        expect(mockOnSuccess).toHaveBeenCalled();
      });
    });

    it('should handle submission error', async () => {
      const user = userEvent.setup();
      vi.spyOn(actions, 'createAssessmentYearActionCV').mockResolvedValue({ 
        success: false, 
        error: 'Test error message' 
      });
      
      render(
        <AssessmentYearFormCV
          open={true}
          onClose={mockOnClose}
        />
      );

      const fromYearInput = screen.getByPlaceholderText('fromYearPlaceholder');
      const toYearInput = screen.getByPlaceholderText('toYearPlaceholder');

      await user.type(fromYearInput, '2023');
      await user.type(toYearInput, '2024');

      const saveButton = screen.getByRole('button', { name: /save/i });
      await user.click(saveButton);

      await waitFor(() => {
        expect(actions.createAssessmentYearActionCV).toHaveBeenCalled();
        expect(mockOnSuccess).not.toHaveBeenCalled();
      });
    });
  });

  describe('User Interactions', () => {
    it('should toggle active status', async () => {
      const user = userEvent.setup();
      const initialData: AssessmentYearCV = {
        yearId: 1,
        yearRangeCVId: 1,
        fromYear: 2023,
        toYear: 2024,
        isActive: true,
        createdDate: new Date().toISOString(),
        updatedDate: new Date().toISOString(),
      };

      render(
        <AssessmentYearFormCV
          open={true}
          initialData={initialData}
        />
      );

      const toggle = screen.getByRole('switch');
      await user.click(toggle);

      expect(toggle).not.toBeChecked();
    });

    it('should call onClose when cancel button is clicked', async () => {
      const user = userEvent.setup();
      
      render(
        <AssessmentYearFormCV
          open={true}
          onClose={mockOnClose}
        />
      );

      const cancelButton = screen.getByText('cancel');
      await user.click(cancelButton);

      expect(mockOnClose).toHaveBeenCalled();
    });

    it('should call router.back when no onClose is provided', async () => {
      const user = userEvent.setup();
      
      render(
        <AssessmentYearFormCV
          open={true}
        />
      );

      const cancelButton = screen.getByText('cancel');
      await user.click(cancelButton);

      expect(mockRouter.back).toHaveBeenCalled();
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty string input correctly', async () => {
      const user = userEvent.setup();
      
      render(
        <AssessmentYearFormCV
          open={true}
          onClose={mockOnClose}
        />
      );

      const fromYearInput = screen.getByPlaceholderText('fromYearPlaceholder');
      await user.type(fromYearInput, '2023');
      await user.clear(fromYearInput);

      const saveButton = screen.getByRole('button', { name: /save/i });
      await user.click(saveButton);

      await waitFor(() => {
        expect(screen.getByText('fromYearRequired')).toBeInTheDocument();
      });
    });

    it('should disable submit button while submitting', async () => {
      const user = userEvent.setup();
      vi.spyOn(actions, 'createAssessmentYearActionCV').mockImplementation(
        () => new Promise(resolve => setTimeout(() => resolve({ success: true, data: {} as AssessmentYearCV }), 100))
      );
      
      render(
        <AssessmentYearFormCV
          open={true}
          onClose={mockOnClose}
        />
      );

      const fromYearInput = screen.getByPlaceholderText('fromYearPlaceholder');
      const toYearInput = screen.getByPlaceholderText('toYearPlaceholder');

      await user.type(fromYearInput, '2023');
      await user.type(toYearInput, '2024');

      const saveButton = screen.getByRole('button', { name: /save/i });
      await user.click(saveButton);

      expect(saveButton).toBeDisabled();
    });
  });
});
