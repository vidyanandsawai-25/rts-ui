import { render, screen, fireEvent, waitFor, within } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { UserManagementClient } from '@/components/modules/configuration-settings/user-management/UserManagementClient';
import { NextIntlClientProvider } from 'next-intl';
import { ConfirmProvider } from '@/components/common/ConfirmProvider';
import { User } from '@/types/user-management';

// Mock server actions
vi.mock('@/app/[locale]/configuration-settings/user-management/actions.mutations', () => ({
  createUserAction: vi.fn(),
  updateUserAction: vi.fn(),
  deleteUserAction: vi.fn(),
}));

const mockPush = vi.fn();
vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockPush, back: vi.fn(), refresh: vi.fn() }),
  usePathname: () => '/en/configuration-settings/user-management',
  useParams: () => ({ locale: 'en' }),
  useSearchParams: () => ({
    get: vi.fn(() => null),
  }),
}));

vi.mock('@/app/[locale]/configuration-settings/user-management/actions', () => ({
  getUsersAction: vi.fn(),
}));

// Mock sonner
vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

const messages = {
  userManagement: {
    title: 'User Management',
    subtitle: 'Manage system users and their access levels',
    stats: {
      totalUsers: 'Total Users',
      activeUsers: 'Active Users',
      usersCount: '{count} Users',
    },
    filters: {
      search: 'Search',
      searchPlaceholder: 'Search by name, email, or role...',
      active: 'Active',
      inactive: 'Inactive',
      all: 'All Status',
      clearFilter: 'Clear Filter',
      filtering: 'Filtering by {name}',
    },
    actions: {
      add: 'Add User',
      edit: 'Edit',
      delete: 'Delete',
      cancel: 'Cancel',
      update: 'Update User',
      create: 'Create User',
      submit: 'Submit',
      title: 'Actions',
    },
    table: {
      user: 'User',
      contact: 'Contact',
      role: 'Role',
      departmentNames: 'Departments',
      moduleNames: 'Modules',
      status: 'Status',
    },
    messages: {
      deleteSuccess: 'User deleted successfully',
      deleteError: 'Failed to delete user',
    },
  },
  common: {
    confirm: {
      delete: {
        title: 'Delete User',
        description: 'Are you sure you want to delete this user?',
        confirm: 'Delete',
      },
      cancel: 'Cancel',
    },
  },
};

const mockUsers: User[] = [
  {
    id: '1',
    userId: 1,
    userName: 'johndoe',
    firstName: 'John',
    middleName: '',
    lastName: 'Doe',
    email: 'john@example.com',
    mobileNo: '1234567890',
    roles: ['Administrator'],
    userRoleIds: [1],
    isActive: true,
    status: 'Active',
    departmentNames: ['Property Tax'],
    departmentIds: ['1'],
    moduleNames: ['Assessment'],
    moduleIds: ['101'],
    moduleAccess: { '1': ['101'] },
  },
  {
    id: '2',
    userId: 2,
    userName: 'janesmith',
    firstName: 'Jane',
    middleName: '',
    lastName: 'Smith',
    email: 'jane@example.com',
    mobileNo: '0987654321',
    roles: ['Staff'],
    userRoleIds: [2],
    isActive: false,
    status: 'Inactive',
    departmentNames: [],
    departmentIds: [],
    moduleNames: [],
    moduleIds: [],
    moduleAccess: {},
  },
];

describe('UserManagementClient', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const setup = (props = {}) => {
    return render(
      <NextIntlClientProvider locale="en" messages={messages}>
        <ConfirmProvider>
          <UserManagementClient
            initialUsers={mockUsers}
            initialTotalCount={2}
            {...props}
          />
        </ConfirmProvider>
      </NextIntlClientProvider>
    );
  };

  it('renders correctly with initial users', () => {
    setup();
    expect(screen.getByText('User Management')).toBeInTheDocument();
    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText('Jane Smith')).toBeInTheDocument();
  });

  it('filters users by search term', async () => {
    setup();
    const searchInput = screen.getByPlaceholderText('Search by name, email, or role...');
    fireEvent.change(searchInput, { target: { value: 'John' } });

    // Target table to check filtering
    await waitFor(() => {
      const table = screen.getByRole('table');
      expect(within(table).getByText('John Doe')).toBeInTheDocument();
      expect(within(table).queryByText('Jane Smith')).not.toBeInTheDocument();
    });
  });

  it('navigates to add user page when clicking add button', () => {
    setup();
    const addButton = screen.getByRole('button', { name: /Add User/i });
    fireEvent.click(addButton);

    expect(mockPush).toHaveBeenCalledWith(expect.stringContaining('/users/add'));
  });

  it('navigates to edit user page when clicking edit button', () => {
    setup();
    const table = screen.getByRole('table');
    const editBtn = within(table).getAllByRole('button', { name: /Edit/i })[0];
    fireEvent.click(editBtn);

    expect(mockPush).toHaveBeenCalledWith(expect.stringContaining('/users/edit/1'));
  });

  it('calls deleteUserAction when deleting a user after confirmation', async () => {
    const { deleteUserAction } =
      await import('@/app/[locale]/configuration-settings/user-management/actions.mutations');
    vi.mocked(deleteUserAction).mockResolvedValue({ success: true, message: 'Deleted' });

    setup();

    const table = screen.getByRole('table');
    const deleteBtn = within(table).getAllByRole('button', { name: /Delete/i })[0];
    fireEvent.click(deleteBtn);

    // Confirmation dialog should appear
    expect(await screen.findByText(/Are you sure you want to delete/i)).toBeInTheDocument();

    // Click confirm button in dialog
    const dialog = screen.getByRole('dialog');
    const confirmBtn = within(dialog).getByRole('button', { name: /Delete/i });
    fireEvent.click(confirmBtn);

    await waitFor(() => {
      expect(deleteUserAction).toHaveBeenCalledWith('1');
    });
  });
});
