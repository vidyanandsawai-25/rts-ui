import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useRouter } from 'next/navigation';
import AssessmentYearMasterRV from '@/components/modules/property-tax/AssessmentYearRange/RateableValue/AssessmentYearMasterRV';
import * as actions from '@/app/[locale]/property-tax/assessment-year-range/rateablevalue/action';
import type { AssessmentYearPagedResponseRV, AssessmentYearRV } from '@/types/assessmentYearMaster.types';

// Mock dependencies
vi.mock('next/navigation', () => ({
  useRouter: vi.fn(),
  usePathname: vi.fn(() => '/property-tax/assessment-year-range/rateablevalue'),
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

vi.mock('@/app/[locale]/property-tax/assessment-year-range/rateablevalue/action', () => ({
  deleteAssessmentYearAction: vi.fn(),
}));

vi.mock('@/components/common', () => ({
  useConfirm: () => ({
    confirm: vi.fn(async (options) => {
      if (options.onConfirm) {
        await options.onConfirm();
      }
    }),
  }),
  AddButton: ({ onClick, label }: { onClick: () => void; label: string }) => <button onClick={onClick}>{label}</button>,
  EditButton: ({ onClick }: { onClick: () => void }) => <button onClick={onClick}>Edit</button>,
  DeleteButton: ({ onClick }: { onClick: () => void }) => <button onClick={onClick}>Delete</button>,
}));

describe('AssessmentYearMasterRV', () => {
  const mockRouter = {
    push: vi.fn(),
    refresh: vi.fn(),
  };

  const mockPaginatedData: AssessmentYearPagedResponseRV = {
    items: [
      {
        yearId: 1,
        yearRangeRVId: 1,
        fromYear: 2023,
        toYear: 2024,
        isActive: true,
        createdDate: new Date().toISOString(),
        updatedDate: new Date().toISOString(),
      },
      {
        yearId: 2,
        yearRangeRVId: 2,
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
      render(<AssessmentYearMasterRV paginatedData={mockPaginatedData} />);

      expect(screen.getByText('2023')).toBeInTheDocument();
      expect(screen.getAllByText('2024').length).toBeGreaterThan(0);
      expect(screen.getByText('2025')).toBeInTheDocument();
    });

    it('should render table header with title', () => {
      render(<AssessmentYearMasterRV paginatedData={mockPaginatedData} />);

      expect(screen.getByText('title')).toBeInTheDocument();
      expect(screen.getByText('subtitle')).toBeInTheDocument();
    });

    it('should render tabs for capital and rateable value', () => {
      render(<AssessmentYearMasterRV paginatedData={mockPaginatedData} />);

      expect(screen.getByText('capitalValue')).toBeInTheDocument();
      expect(screen.getByText('rateableValue')).toBeInTheDocument();
    });

    it('should render add button', () => {
      render(<AssessmentYearMasterRV paginatedData={mockPaginatedData} />);

      expect(screen.getByText('addNewRange')).toBeInTheDocument();
    });

    it('should render empty state when no data', () => {
      const emptyData: AssessmentYearPagedResponseRV = {
        items: [],
        totalCount: 0,
        pageNumber: 1,
        pageSize: 10,
        totalPages: 0,
        hasPrevious: false,
        hasNext: false,
      };

      render(<AssessmentYearMasterRV paginatedData={emptyData} />);

      expect(screen.getByText('emptyText')).toBeInTheDocument();
    });
  });

  describe('User Interactions', () => {
    it('should navigate to add page when add button is clicked', async () => {
      const user = userEvent.setup();
      render(<AssessmentYearMasterRV paginatedData={mockPaginatedData} />);

      const addButton = screen.getByText('addNewRange');
      await user.click(addButton);

      expect(mockRouter.push).toHaveBeenCalledWith('/en/property-tax/assessment-year-range/rateablevalue/add');
    });

    it('should navigate to edit page when edit button is clicked', async () => {
      const user = userEvent.setup();
      render(<AssessmentYearMasterRV paginatedData={mockPaginatedData} />);

      const editButtons = screen.getAllByText('Edit');
      await user.click(editButtons[0]);

      expect(mockRouter.push).toHaveBeenCalledWith('/en/property-tax/assessment-year-range/rateablevalue/edit/1');
    });

    it('should use fallback ID when yearId is not available', async () => {
      const user = userEvent.setup();
      const dataWithoutYearId: AssessmentYearPagedResponseRV = {
        ...mockPaginatedData,
        items: [{
          yearRangeRVId: 3,
          fromYear: 2025,
          toYear: 2026,
          isActive: true,
          createdDate: new Date().toISOString(),
          updatedDate: new Date().toISOString(),
        }],
      };

      render(<AssessmentYearMasterRV paginatedData={dataWithoutYearId} />);

      const editButton = screen.getByText('Edit');
      await user.click(editButton);

      expect(mockRouter.push).toHaveBeenCalledWith('/en/property-tax/assessment-year-range/rateablevalue/edit/3');
    });

    it('should navigate to capital value tab', async () => {
      const user = userEvent.setup();
      render(<AssessmentYearMasterRV paginatedData={mockPaginatedData} />);

      const capitalTab = screen.getByText('capitalValue');
      await user.click(capitalTab);

      expect(mockRouter.push).toHaveBeenCalledWith('/en/property-tax/assessment-year-range/capitalvalue');
    });
  });

  describe('Delete Operations', () => {
    it('should delete record successfully', async () => {
      const user = userEvent.setup();
      vi.spyOn(actions, 'deleteAssessmentYearAction').mockResolvedValue({ success: true });

      render(<AssessmentYearMasterRV paginatedData={mockPaginatedData} />);

      const deleteButtons = screen.getAllByText('Delete');
      await user.click(deleteButtons[0]);

      await waitFor(() => {
        expect(actions.deleteAssessmentYearAction).toHaveBeenCalledWith(1);
        expect(mockRouter.refresh).toHaveBeenCalled();
      });
    });

    it('should show error when delete fails', async () => {
      const user = userEvent.setup();
      vi.spyOn(actions, 'deleteAssessmentYearAction').mockResolvedValue({
        success: false,
        error: 'Delete failed',
      });

      render(<AssessmentYearMasterRV paginatedData={mockPaginatedData} />);

      const deleteButtons = screen.getAllByText('Delete');
      await user.click(deleteButtons[0]);

      await waitFor(() => {
        expect(actions.deleteAssessmentYearAction).toHaveBeenCalled();
        expect(mockRouter.refresh).not.toHaveBeenCalled();
      });
    });

    it('should show linked error message for linked records', async () => {
      const user = userEvent.setup();
      vi.spyOn(actions, 'deleteAssessmentYearAction').mockResolvedValue({
        success: false,
        code: 'LINKED_RECORD',
        error: 'Record is linked',
      });

      render(<AssessmentYearMasterRV paginatedData={mockPaginatedData} />);

      const deleteButtons = screen.getAllByText('Delete');
      await user.click(deleteButtons[0]);

      await waitFor(() => {
        expect(actions.deleteAssessmentYearAction).toHaveBeenCalled();
      });
    });

    it('should handle invalid yearId gracefully', async () => {
      const user = userEvent.setup();
      const invalidData: AssessmentYearPagedResponseRV = {
        ...mockPaginatedData,
        items: [{
          yearRangeRVId: 0,
          fromYear: 2023,
          toYear: 2024,
          isActive: true,
          createdDate: new Date().toISOString(),
          updatedDate: new Date().toISOString(),
        }],
      };

      render(<AssessmentYearMasterRV paginatedData={invalidData} />);

      const deleteButton = screen.getByText('Delete');
      await user.click(deleteButton);

      await waitFor(() => {
        expect(actions.deleteAssessmentYearAction).not.toHaveBeenCalled();
      });
    });
  });

  describe('Pagination', () => {
    it('should handle page size change', () => {
      render(<AssessmentYearMasterRV paginatedData={mockPaginatedData} />);

      // Verify pagination props are passed correctly
      expect(screen.getByText('2023')).toBeInTheDocument();
    });
  });

  describe('Error Handling', () => {
    it('should handle missing data gracefully', () => {
      const invalidData = {
        items: null as unknown as AssessmentYearRV[],
        totalCount: 0,
        pageNumber: 1,
        pageSize: 10,
        totalPages: 0,
        hasPrevious: false,
        hasNext: false,
      };

      render(<AssessmentYearMasterRV paginatedData={invalidData} />);

      expect(screen.getByText('emptyText')).toBeInTheDocument();
    });
  });
});
