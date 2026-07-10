/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import UseCategoryForm from '@/components/modules/property-tax/typeofusemaster/UseCategoryForm';
import { createTypeOfUseCategory, updateTypeOfUseCategory } from '@/app/[locale]/property-tax/typeofusemaster/actions';
import { toast } from 'sonner';

// Mock translations
vi.mock('next-intl', () => ({
  useTranslations: () => (key: string) => key,
}));

// Mock next/navigation
const mockBack = vi.fn();
vi.mock('next/navigation', () => ({
  useRouter: () => ({ back: mockBack }),
}));

// Mock sonner
vi.mock('sonner', () => ({
  toast: { success: vi.fn(), error: vi.fn() },
}));

// Mock actions
vi.mock('@/app/[locale]/property-tax/typeofusemaster/actions', () => ({
  createTypeOfUseCategory: vi.fn(),
  updateTypeOfUseCategory: vi.fn(),
}));

describe('UseCategoryForm Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const allCategories = [
    { id: 1, typeOfUseCategoryCode: 'C01', typeOfUseCategoryName: 'Residential' },
  ] as any;

  it('renders correctly for Add mode', () => {
    render(<UseCategoryForm id={null} allCategories={allCategories} />);
    expect(screen.getByText('category.add')).toBeInTheDocument();
    expect(screen.getByText('category.addSubtitle')).toBeInTheDocument();
  });

  it('renders correctly for Edit mode', () => {
    render(
      <UseCategoryForm 
        id="1" 
        initialData={{
          id: 1,
          typeOfUseCategoryCode: 'C02',
          typeOfUseCategoryName: 'Commercial',
          isActive: true
        } as any}
        allCategories={allCategories} 
      />
    );
    expect(screen.getByText('category.edit')).toBeInTheDocument();
    expect(screen.getByText('category.editSubtitle')).toBeInTheDocument();
  });

  it('submits successfully in Add mode', async () => {
    (createTypeOfUseCategory as any).mockResolvedValue({ success: true });
    const { container } = render(<UseCategoryForm id={null} allCategories={allCategories} />);
    
    // Fill form
    const codeInput = screen.getByLabelText(/category\.fields\.categoryCode/i);
    const nameInput = screen.getByLabelText(/category\.fields\.categoryName/i);
    
    fireEvent.change(codeInput, { target: { value: 'C03' } });
    fireEvent.change(nameInput, { target: { value: 'Industrial' } });
    
    // Submit
    // Submit using the form directly
    const form = container.querySelector('#use-category-form');
    fireEvent.submit(form!);
    
    await waitFor(() => {
      expect(createTypeOfUseCategory).toHaveBeenCalledWith({
        code: 'C03',
        name: 'Industrial',
        status: 'Active',
      });
      expect(toast.success).toHaveBeenCalledWith('category.messages.categoryCreated');
      expect(mockBack).toHaveBeenCalled();
    });
  });

  it('submits successfully in Edit mode', async () => {
    (updateTypeOfUseCategory as any).mockResolvedValue({ success: true });
    const { container } = render(
      <UseCategoryForm 
        id="1" 
        initialData={{
          id: 1,
          typeOfUseCategoryCode: 'C02',
          typeOfUseCategoryName: 'Commercial',
          isActive: true
        } as any}
        allCategories={allCategories} 
      />
    );
    
    // Change name
    const nameInput = screen.getByLabelText(/category\.fields\.categoryName/i);
    fireEvent.change(nameInput, { target: { value: 'Updated Commercial' } });
    
    // Submit using the form directly since JSDOM sometimes fails with form="" attribute
    const form = container.querySelector('#use-category-form');
    fireEvent.submit(form!);
    
    await waitFor(() => {
      expect(updateTypeOfUseCategory).toHaveBeenCalledWith({
        id: 1,
        code: 'C02',
        name: 'Updated Commercial',
        status: 'Active',
      });
      expect(toast.success).toHaveBeenCalledWith('category.messages.categoryUpdated');
      expect(mockBack).toHaveBeenCalled();
    });
  });
});
