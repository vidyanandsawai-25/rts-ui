/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import CategoryListDrawer from '@/components/modules/property-tax/typeofusemaster/CategoryListDrawer';
import { deleteTypeOfUseCategory } from '@/app/[locale]/property-tax/typeofusemaster/actions';
import { toast } from 'sonner';

// Mock translations
vi.mock('next-intl', () => ({
  useTranslations: () => (key: string) => key,
  useLocale: () => 'en',
}));

const mockPush = vi.fn();
const mockRefresh = vi.fn();
const mockGetSearchParam = vi.fn().mockReturnValue('');
vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockPush, refresh: mockRefresh, back: vi.fn() }),
  useSearchParams: () => ({ get: mockGetSearchParam }),
}));

vi.mock('@/hooks/useSearchNavigation', () => ({
  useSearchNavigation: vi.fn(),
}));

// Mock ConfirmProvider
vi.mock('@/components/common/ConfirmProvider', () => ({
  useConfirm: () => ({
    confirm: ({ onConfirm }: any) => onConfirm(),
  }),
}));

// Mock actions
vi.mock('@/app/[locale]/property-tax/typeofusemaster/actions', () => ({
  deleteTypeOfUseCategory: vi.fn(),
}));

// Mock sonner
vi.mock('sonner', () => ({
  toast: { success: vi.fn(), error: vi.fn() },
}));

describe('CategoryListDrawer Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const categories = [
    { id: 1, typeOfUseCategoryCode: 'C01', typeOfUseCategoryName: 'Residential', isActive: true },
    { id: 2, typeOfUseCategoryCode: 'C02', typeOfUseCategoryName: 'Commercial', isActive: false },
  ] as any;

  it('renders categories in the table', () => {
    render(<CategoryListDrawer categories={categories} />);
    expect(screen.getByText('C01')).toBeInTheDocument();
    expect(screen.getByText('Residential')).toBeInTheDocument();
    expect(screen.getByText('C02')).toBeInTheDocument();
    expect(screen.getByText('Commercial')).toBeInTheDocument();
  });

  it('renders search input and allows typing', () => {
    render(<CategoryListDrawer categories={categories} />);
    const searchInput = screen.getByPlaceholderText('category.searchPlaceholder') as HTMLInputElement;
    
    fireEvent.change(searchInput, { target: { value: 'Residential' } });
    
    expect(searchInput.value).toBe('Residential');
  });

  it('navigates to add category page', () => {
    render(<CategoryListDrawer categories={categories} />);
    const addButton = screen.getByText('category.addNew');
    
    fireEvent.click(addButton);
    
    expect(mockPush).toHaveBeenCalledWith('/property-tax/typeofusemaster/category/add');
  });

  it('handles delete category correctly', async () => {
    (deleteTypeOfUseCategory as any).mockResolvedValue({ success: true });
    render(<CategoryListDrawer categories={categories} />);
    
    const deleteButtons = screen.getAllByTitle(/buttons.delete/i);
    
    fireEvent.click(deleteButtons[0]);
    
    await waitFor(() => {
      expect(deleteTypeOfUseCategory).toHaveBeenCalledWith(1);
      expect(toast.success).toHaveBeenCalledWith('category.messages.categoryDeleted');
      expect(mockRefresh).toHaveBeenCalled();
    });
  });
});
