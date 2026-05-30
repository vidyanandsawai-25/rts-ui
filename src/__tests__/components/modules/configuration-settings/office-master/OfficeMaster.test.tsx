import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { OfficeMaster } from '@/components/modules/configuration-settings/office-master/OfficeMaster';
import { Office } from '@/types/office.types';
import { ConfirmProvider } from '@/components/common/ConfirmProvider';

// Mock next/navigation
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
    refresh: vi.fn(),
  }),
  usePathname: () => '/',
  useSearchParams: () => ({
    get: vi.fn(() => null),
  }),
}));

// Mock next-intl
vi.mock('next-intl', () => ({
  useTranslations: () => (key: string) => key,
  useLocale: () => 'en',
}));

const mockPermissions = {
  canView: true,
  canEdit: true,
  canDelete: true,
  haveFullAccess: true,
  hasAccess: true,
};

vi.mock('@/hooks/usePermissions', () => ({
  usePermissions: () => mockPermissions,
}));

const mockData: Office[] = [
  {
    officeId: 1,
    officeCode: 'OFF01',
    officeName: 'Main Office',
    isActive: true,
    type: 'Head Office',
    address: '123 Street',
    city: 'City',
    pincode: '123456',
    phone: '1234567890',
    emailId: 'test@test.com',
    establishedDate: '2024-01-01',
    createdDate: '2024-01-01',
    updatedDate: '2024-01-01',
  },
];

describe('OfficeMaster', () => {
  beforeEach(() => {
    mockPermissions.canView = true;
    mockPermissions.canEdit = true;
    mockPermissions.canDelete = true;
    mockPermissions.haveFullAccess = true;
    mockPermissions.hasAccess = true;
  });

  it('renders the office list title', () => {
    render(
      <ConfirmProvider>
        <OfficeMaster
          data={mockData}
          pageNumber={1}
          pageSize={10}
          totalCount={1}
          totalPages={1}
          sortBy=""
          sortOrder="asc"
          headOfficesCount={0}
          activeOfficesCount={0}
          inactiveOfficesCount={0}
        />
      </ConfirmProvider>
    );
    expect(screen.getByText('list.title')).toBeInTheDocument();
  });

  it('renders data in the table', () => {
    render(
      <ConfirmProvider>
        <OfficeMaster
          data={mockData}
          pageNumber={1}
          pageSize={10}
          totalCount={1}
          totalPages={1}
          sortBy=""
          sortOrder="asc"
          headOfficesCount={0}
          activeOfficesCount={0}
          inactiveOfficesCount={0}
        />
      </ConfirmProvider>
    );
    expect(screen.getByText('Main Office')).toBeInTheDocument();
    expect(screen.getByText('OFF01')).toBeInTheDocument();
  });

  it('renders errors.noAccess when user has no access permission', () => {
    mockPermissions.canView = false;
    mockPermissions.haveFullAccess = false;
    render(
      <ConfirmProvider>
        <OfficeMaster
          data={mockData}
          pageNumber={1}
          pageSize={10}
          totalCount={1}
          totalPages={1}
          sortBy=""
          sortOrder="asc"
          headOfficesCount={0}
          activeOfficesCount={0}
          inactiveOfficesCount={0}
        />
      </ConfirmProvider>
    );
    expect(screen.getByText('errors.noAccess')).toBeInTheDocument();
  });

  it('renders errors.unauthorized when user is unauthorized', () => {
    mockPermissions.canView = false;
    mockPermissions.haveFullAccess = false;
    render(
      <ConfirmProvider>
        <OfficeMaster
          data={[]}
          pageNumber={1}
          pageSize={10}
          totalCount={0}
          totalPages={0}
          sortBy=""
          sortOrder="asc"
          headOfficesCount={0}
          activeOfficesCount={0}
          inactiveOfficesCount={0}
          statusCode={401}
        />
      </ConfirmProvider>
    );
    expect(screen.getByText('errors.unauthorized')).toBeInTheDocument();
  });

  it('renders fetch error when fetchError is provided', () => {
    render(
      <ConfirmProvider>
        <OfficeMaster
          data={[]}
          pageNumber={1}
          pageSize={10}
          totalCount={0}
          totalPages={0}
          sortBy=""
          sortOrder="asc"
          headOfficesCount={0}
          activeOfficesCount={0}
          inactiveOfficesCount={0}
          fetchError="Database connection refused"
        />
      </ConfirmProvider>
    );
    expect(screen.getByText('errors.fetchFailed')).toBeInTheDocument();
    expect(screen.getByText('Database connection refused')).toBeInTheDocument();
  });

  it('gates add, edit, and delete buttons based on permissions', () => {
    const { rerender } = render(
      <ConfirmProvider>
        <OfficeMaster
          data={mockData}
          pageNumber={1}
          pageSize={10}
          totalCount={1}
          totalPages={1}
          sortBy=""
          sortOrder="asc"
          headOfficesCount={0}
          activeOfficesCount={0}
          inactiveOfficesCount={0}
        />
      </ConfirmProvider>
    );
    expect(screen.getByText('list.buttons.add')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /edit/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /delete/i })).toBeInTheDocument();

    mockPermissions.haveFullAccess = false;
    mockPermissions.canView = true;
    mockPermissions.canEdit = true;
    mockPermissions.canDelete = false;

    rerender(
      <ConfirmProvider>
        <OfficeMaster
          data={mockData}
          pageNumber={1}
          pageSize={10}
          totalCount={1}
          totalPages={1}
          sortBy=""
          sortOrder="asc"
          headOfficesCount={0}
          activeOfficesCount={0}
          inactiveOfficesCount={0}
        />
      </ConfirmProvider>
    );
    expect(screen.queryByText('list.buttons.add')).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: /edit/i })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /delete/i })).not.toBeInTheDocument();
  });
});
