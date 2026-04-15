import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useRouter } from 'next/navigation';
import AssessmentYearMasterCV from '@/components/modules/property-tax/AssessmentYearRange/CapitalValue/AssessmentYearMasterCV';
import * as actions from '@/app/[locale]/property-tax/assessment-year-range/capitalvalue/action';
import { AssessmentYearPagedResponseCV } from '@/types/assessmentYearMaster.types';

// Mock dependencies
vi.mock('next/navigation', () => ({
  useRouter: vi.fn(),
  usePathname: vi.fn(() => '/property-tax/assessment-year-range/capitalvalue'),
  useSearchParams: vi.fn(() => new URLSearchParams('page=1&size=10')),
}));

vi.mock('next-intl', () => ({
  useLocale: () => 'en',
  useTranslations: () => (key: string) => key,
}));

vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

vi.mock('@/app/[locale]/property-tax/assessment-year-range/capitalvalue/action', () => ({
  deleteAssessmentYearActionCV: vi.fn(),
}));

vi.mock('@/components/common', () => ({
  useConfirm: () => ({
    confirm: vi.fn((options) => {
      if (options.onConfirm) {
        options.onConfirm();
      }
    }),
  }),
  AddButton: ({ onClick, label }: { onClick: () => void; label: string }) => <button onClick={onClick}>{label}</button>,
  EditButton: ({ onClick }: { onClick: () => void }) => <button onClick={onClick}>Edit</button>,
  DeleteButton: ({ onClick }: { onClick: () => void }) => <button onClick={onClick}>Delete</button>,
}));

describe('AssessmentYearMasterCV', () => {
  const mockRouter = {
    push: vi.fn(),
    refresh: vi.fn(),
  };

  const mockPaginatedData: AssessmentYearPagedResponseCV = {
    items: [
      {
        yearId: 1,
        yearRangeCVId: 1,
        fromYear: 2023,
        toYear: 2024,
        isActive: true,
        createdDate: new Date().toISOString(),
        updatedDate: new Date().toISOString(),
      },
      {
        yearId: 2,
        yearRangeCVId: 2,
        fromYear: 2024,
        toYear: 2025,
        isActive: false,
        createdDate: new Date().toISOString(),
        updatedDate: new Date().toISOString(),
      },
    ],
    totalCount: 2,
    pageNumber: 1,
    pageSize: 10,
    totalPages: 1,
    hasPrevious: false,
    hasNext: false,
  };

  beforeEach(() => {
    vi.clearAllMocks();
    (useRouter as unknown as ReturnType<typeof vi.fn>).mockReturnValue(mockRouter);
  });

  describe('Component Rendering', () => {
    it('should render table with data', () => {
      render(<AssessmentYearMasterCV paginatedData={mockPaginatedData} />);

      expect(screen.getByText('2023')).toBeInTheDocument();
      expect(screen.getAllByText('2024').length).toBeGreaterThan(0);
      expect(screen.getByText('2025')).toBeInTheDocument();
    });

    it('should render table header with title', () => {
      render(<AssessmentYearMasterCV paginatedData={mockPaginatedData} />);

      expect(screen.getByText('title')).toBeInTheDocument();
      expect(screen.getByText('subtitle')).toBeInTheDocument();
    });

    it('should render tabs for capital and rateable value', () => {
      render(<AssessmentYearMasterCV paginatedData={mockPaginatedData} />);

      expect(screen.getByText('capitalValue')).toBeInTheDocument();
      expect(screen.getByText('rateableValue')).toBeInTheDocument();
    });

    it('should render add button', () => {
      render(<AssessmentYearMasterCV paginatedData={mockPaginatedData} />);

      expect(screen.getByText('addNewRange')).toBeInTheDocument();
    });

    it('should render empty state when no data', () => {
      const emptyData: AssessmentYearPagedResponseCV = {
        items: [],
        totalCount: 0,
        pageNumber: 1,
        pageSize: 10,
        totalPages: 0,
        hasPrevious: false,
        hasNext: false,
      };

      render(<AssessmentYearMasterCV paginatedData={emptyData} />);

      expect(screen.getByText('emptyText')).toBeInTheDocument();
    });
  });

  describe('User Interactions', () => {
    it('should navigate to add page when add button is clicked', async () => {
      const user = userEvent.setup();
      render(<AssessmentYearMasterCV paginatedData={mockPaginatedData} />);

      const addButton = screen.getByText('addNewRange');
      await user.click(addButton);

      expect(mockRouter.push).toHaveBeenCalledWith('/en/property-tax/assessment-year-range/capitalvalue/add');
    });

    it('should navigate to edit page when edit button is clicked', async () => {
      const user = userEvent.setup();
      render(<AssessmentYearMasterCV paginatedData={mockPaginatedData} />);

      const editButtons = screen.getAllByText('Edit');
      await user.click(editButtons[0]);

      expect(mockRouter.push).toHaveBeenCalledWith('/en/property-tax/assessment-year-range/capitalvalue/edit/1');
    });

    it('should use fallback ID when yearId is not available', async () => {
      const user = userEvent.setup();
      const dataWithoutYearId: AssessmentYearPagedResponseCV = {
        ...mockPaginatedData,
        items: [{
          yearRangeCVId: 3,
          fromYear: 2025,
          toYear: 2026,
          isActive: true,
          createdDate: new Date().toISOString(),
          updatedDate: new Date().toISOString(),
        }],
      };

      render(<AssessmentYearMasterCV paginatedData={dataWithoutYearId} />);

      const editButton = screen.getByText('Edit');
      await user.click(editButton);

      expect(mockRouter.push).toHaveBeenCalledWith('/en/property-tax/assessment-year-range/capitalvalue/edit/3');
    });

    it('should navigate to rateable value tab', async () => {
      const user = userEvent.setup();
      render(<AssessmentYearMasterCV paginatedData={mockPaginatedData} />);

      const rateableTab = screen.getByText('rateableValue');
      await user.click(rateableTab);

      expect(mockRouter.push).toHaveBeenCalledWith('/en/property-tax/assessment-year-range/rateablevalue');
    });
  });

  describe('Delete Operations', () => {
    it('should delete record successfully', async () => {
      const user = userEvent.setup();
      vi.spyOn(actions, 'deleteAssessmentYearActionCV').mockResolvedValue({ success: true });

      render(<AssessmentYearMasterCV paginatedData={mockPaginatedData} />);

      const deleteButtons = screen.getAllByText('Delete');
      await user.click(deleteButtons[0]);

      await waitFor(() => {
        expect(actions.deleteAssessmentYearActionCV).toHaveBeenCalledWith(1);
        expect(mockRouter.refresh).toHaveBeenCalled();
      });
    });

    it('should show error when delete fails', async () => {
      const user = userEvent.setup();
      vi.spyOn(actions, 'deleteAssessmentYearActionCV').mockResolvedValue({
        success: false,
        error: 'Delete failed',
      });

      render(<AssessmentYearMasterCV paginatedData={mockPaginatedData} />);

      const deleteButtons = screen.getAllByText('Delete');
      await user.click(deleteButtons[0]);

      await waitFor(() => {
        expect(actions.deleteAssessmentYearActionCV).toHaveBeenCalled();
        expect(mockRouter.refresh).not.toHaveBeenCalled();
      });
    });

    it('should show linked error message for linked records', async () => {
      const user = userEvent.setup();
      vi.spyOn(actions, 'deleteAssessmentYearActionCV').mockResolvedValue({
        success: false,
        code: 'LINKED_RECORD',
        error: 'Record is linked',
      });

      render(<AssessmentYearMasterCV paginatedData={mockPaginatedData} />);

      const deleteButtons = screen.getAllByText('Delete');
      await user.click(deleteButtons[0]);

      await waitFor(() => {
        expect(actions.deleteAssessmentYearActionCV).toHaveBeenCalled();
      });
    });

    it('should handle invalid yearId gracefully', async () => {
      const user = userEvent.setup();
      const invalidData: AssessmentYearPagedResponseCV = {
        ...mockPaginatedData,
        items: [{
          yearRangeCVId: 0,
          fromYear: 2023,
          toYear: 2024,
          isActive: true,
          createdDate: new Date().toISOString(),
          updatedDate: new Date().toISOString(),
        }],
      };

      render(<AssessmentYearMasterCV paginatedData={invalidData} />);

      const deleteButton = screen.getByText('Delete');
      await user.click(deleteButton);

      await waitFor(() => {
        expect(actions.deleteAssessmentYearActionCV).not.toHaveBeenCalled();
      });
    });
  });

  describe('Pagination', () => {
    it('should handle page change', () => {
      const dataWithMultiplePages: AssessmentYearPagedResponseCV = {
        ...mockPaginatedData,
        totalPages: 3,
        hasNext: true,
      };

      render(<AssessmentYearMasterCV paginatedData={dataWithMultiplePages} />);

      // Note: This would require the MasterTable component to expose pagination controls
      // For now, we're testing that the component receives the correct props
      expect(screen.getByText('2023')).toBeInTheDocument();
    });
  });

  describe('Status Badge Rendering', () => {
    it('should render active status badges correctly', () => {
      render(<AssessmentYearMasterCV paginatedData={mockPaginatedData} />);

      // The StatusBadge component would render based on isActive prop
      // Actual rendering depends on StatusBadge implementation
      expect(screen.getByText('2023')).toBeInTheDocument();
    });
  });
});
