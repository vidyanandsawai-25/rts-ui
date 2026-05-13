import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import './test-setup';
import DepartmentMasterForm from '@/components/modules/configuration-settings/department-master/DepartmentMasterForm';
import { mockToastSuccess, mockToastError } from './test-setup';
import * as deptActions from '@/app/[locale]/configuration-settings/department-master/action';

describe('DepartmentMasterForm', () => {
  const user = userEvent.setup();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders add department form correctly', () => {
    render(<DepartmentMasterForm id={null} />);
    expect(screen.getByText('form.title.add')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('form.fields.departmentNamePlaceholder')).toBeInTheDocument();
  });

  it('renders edit department form with initial data', () => {
    const initialData = {
      departmentId: 1,
      departmentCode: 'IT01',
      departmentName: 'Information Technology',
      departmentNameLocal: 'आईटी',
      departmentIcon: 'it-icon',
      departmentDescription: 'IT Dept',
      isActive: true,
    };
    render(<DepartmentMasterForm id={1} editingDepartment={initialData} />);
    expect(screen.getByText('form.title.edit')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Information Technology')).toBeInTheDocument();
  });

  it('shows validation errors for empty required fields on submit', async () => {
    render(<DepartmentMasterForm id={null} />);
    const submitButton = screen.getByText('form.buttons.save');
    await user.click(submitButton);

    await waitFor(() => {
      // Assuming it uses standard HTML validation or Zod/React Hook Form
      // If it shows a toast on validation error:
      expect(mockToastError).toHaveBeenCalled();
    });
  });

  it('handles successful department creation', async () => {
    render(<DepartmentMasterForm id={null} />);

    fireEvent.change(screen.getByPlaceholderText('form.fields.departmentCodePlaceholder'), { target: { value: 'NEW01' } });
    fireEvent.change(screen.getByPlaceholderText('form.fields.departmentNamePlaceholder'), { target: { value: 'New Dept' } });
    fireEvent.change(screen.getByPlaceholderText('form.fields.departmentNameLocalPlaceholder'), { target: { value: 'नया विभाग' } });
    fireEvent.change(screen.getByPlaceholderText('form.fields.departmentDescriptionPlaceholder'), { target: { value: 'Description' } });

    const submitButton = screen.getByText('form.buttons.save');
    await user.click(submitButton);

    await waitFor(() => {
      expect(deptActions.saveDepartmentMasterAction).toHaveBeenCalled();
      expect(mockToastSuccess).toHaveBeenCalledWith('success.created');
    });
  });

  it('handles API failure during creation', async () => {
    vi.mocked(deptActions.saveDepartmentMasterAction).mockResolvedValueOnce({
      success: false,
      error: 'API Error',
    });

    render(<DepartmentMasterForm id={null} />);
    
    // Fill required fields
    fireEvent.change(screen.getByPlaceholderText('form.fields.departmentCodePlaceholder'), { target: { value: 'ERR01' } });
    fireEvent.change(screen.getByPlaceholderText('form.fields.departmentNamePlaceholder'), { target: { value: 'Error Dept' } });

    await user.click(screen.getByText('form.buttons.save'));

    await waitFor(() => {
      expect(mockToastError).toHaveBeenCalledWith('API Error');
    });
  });
});
