import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import PropertyDetailsEditForm from '@/components/modules/property-tax/ptis/appartmentQC/PropertyDetailsEditForm';
import type { ApartmentQCDetail } from '@/types/apartmentQC.types';
import type { PropertyEditFormCopy } from '@/types/propertyEdit.types';

vi.mock('next-intl', () => ({
  useTranslations: () => (key: string) => key,
}));

vi.mock('@/components/common/ActionButtons', () => ({
  EditLabelButton: ({ onClick, title }: { onClick: () => void, title: string }) => <button onClick={onClick} title={title}>Edit Floor QC</button>,
}));

vi.mock('@/components/common', () => ({
  SaveButton: ({ onClick, label }: { onClick: () => void, label: React.ReactNode }) => <button onClick={onClick} data-testid="save-button">{label}</button>,
  CancelButton: ({ onClick, label }: { onClick: () => void, label: React.ReactNode }) => <button onClick={onClick} data-testid="cancel-button">{label}</button>,
  Input: ({ label, value }: { label: string, value: string }) => <input aria-label={label} value={value || ''} readOnly />,
  Select: () => <select />,
  ValidationMessage: () => null,
  CollapsibleSectionHeader: ({ title, children }: { title: string, children: React.ReactNode }) => <div><div>{title}</div>{children}</div>,
  MasterTable: ({ columns, data, onRowClick }: { columns: { key: string, label: string, render?: (val: unknown, row: unknown) => React.ReactNode }[], data: Record<string, unknown>[], onRowClick?: (row: unknown) => void }) => (
    <table data-testid="master-table">
      <thead>
        <tr>
          {columns.map((col) => <th key={col.key}>{col.label}</th>)}
        </tr>
      </thead>
      <tbody>
        {data.map((row) => (
          <tr key={row.id as string} onClick={() => onRowClick?.(row)} data-testid={`row-${row.id}`}>
            {columns.map((col) => (
              <td key={col.key}>
                {col.render ? col.render(row[col.key], row) : (row[col.key] as React.ReactNode)}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  ),
  Tabs: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  TabList: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  Tab: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  Badge: () => null,
}));

vi.mock('@/components/modules/property-tax/ptis/appartmentQC/FloorQCEditDrawer', () => ({
  FloorQCEditDrawer: ({ open, onClose, onSave, row }: { open: boolean, onClose: () => void, onSave: (r: unknown) => void, row: Record<string, unknown> }) => open ? (
    <div data-testid="floor-qc-drawer">
      <button data-testid="drawer-close" onClick={onClose}>Close</button>
      <button data-testid="drawer-save" onClick={() => onSave({ ...row, conYear: '2025' })}>Save</button>
    </div>
  ) : null,
}));

vi.mock('@/components/modules/property-tax/ptis/appartmentQC/roomSubmission/RoomWiseSubmission', () => ({
  RoomWiseSubmission: ({ isOpen }: { isOpen: boolean }) => isOpen ? <div data-testid="room-sidebar">Room Sidebar</div> : null,
}));

vi.mock('@/components/modules/property-tax/ptis/appartmentQC/PropertyEditDrawerInputs', () => ({
  EditableInput: ({ label, value, onChange }: { label: string, value: string, onChange: (v: string) => void }) => (
    <input aria-label={label} value={value || ''} onChange={(e) => onChange(e.target.value)} />
  ),
  EditableSelect: () => <select />,
}));

const mockUpdateFloorRow = vi.fn();

vi.mock('@/hooks/apartmentQc', () => ({
  usePropertyEditForm: () => ({
    copy: {
      floorQC: { columns: { editFloorQC: 'Edit Floor QC' }, tooltips: {} },
      basicInfo: { fields: {} },
      buttons: { save: 'Save Changes' }
    },
    formData: {
      ownerName: 'Test Owner'
    },
    floorData: [
      { id: '1', floorId: '1', pdnId: 101, conYear: '2020' }
    ],
    isBasicInfoOpen: true,
    isFloorQCOpen: true,
    isSavingBasicDetails: false,
    isSavingFloorQC: false,
    errors: {},
    validateForm: vi.fn().mockReturnValue(true),
    showError: vi.fn().mockReturnValue(false),
    handleFieldChange: vi.fn(),
    handleBlur: vi.fn(),
    handlePropertyTypeChange: vi.fn(),
    toggleBasicInfo: vi.fn(),
    toggleFloorQC: vi.fn(),
    setDualMethodTab: vi.fn(),
    floorOptions: [{ value: '1', label: 'Ground Floor' }],
    conTypeOptions: [],
    useTypeOptions: [],
    subTypeOptions: [],
    propertyTypeOptions: [],
    getSubTypeOptions: vi.fn().mockReturnValue([]),
    updateFormField: vi.fn(),
    updateFloorRow: mockUpdateFloorRow,
    handleSave: vi.fn(),
    roomSidebar: {
      state: { isOpen: false, selectedFloorRow: null },
      handleOpen: vi.fn(),
      handleClose: vi.fn(),
      handleToggleUnit: vi.fn(),
    }
  }),
}));

describe('PropertyDetailsEditForm', () => {
  const fieldsProxy = new Proxy({}, {
    get: () => ({ label: 'Label', placeholder: 'Placeholder' })
  });

  const defaultProps = {
    propertyData: { id: 1 } as ApartmentQCDetail,
    floorQCData: [],
    floors: [],
    propertyTypes: [],
    constructionTypes: [],
    useTypes: [],
    subUseTypes: [],
    allSubTypes: [],
    roomTypes: [],
    dualMethodTab: 'rateable' as const,
    subTabProp: 'rateable',
    copy: {
      floorQC: { columns: { editFloorQC: 'Edit Floor QC' }, tooltips: {} },
      basicInfo: { fields: fieldsProxy, title: 'Basic Information' },
      buttons: { save: 'Save Changes' },
      badges: { ward: 'Ward', zone: 'Zone', prop: 'Prop', type: 'Type' },
    } as unknown as PropertyEditFormCopy,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders correctly', () => {
    render(<PropertyDetailsEditForm {...defaultProps} />);
    expect(screen.getByTestId('master-table')).toBeInTheDocument();
  });

  it('opens FloorQCEditDrawer when action button is clicked', async () => {
    render(<PropertyDetailsEditForm {...defaultProps} />);
    const user = userEvent.setup();
    
    expect(screen.queryByTestId('floor-qc-drawer')).not.toBeInTheDocument();
    
    const editBtn = screen.getByTitle('Edit Floor QC');
    await user.click(editBtn);
    
    expect(screen.getByTestId('floor-qc-drawer')).toBeInTheDocument();
  });

  it('handles closing the drawer', async () => {
    render(<PropertyDetailsEditForm {...defaultProps} />);
    const user = userEvent.setup();
    
    await user.click(screen.getByTitle('Edit Floor QC'));
    expect(screen.getByTestId('floor-qc-drawer')).toBeInTheDocument();
    
    await user.click(screen.getByTestId('drawer-close'));
    expect(screen.queryByTestId('floor-qc-drawer')).not.toBeInTheDocument();
  });

  it('updates floor row data when drawer is saved', async () => {
    render(<PropertyDetailsEditForm {...defaultProps} />);
    const user = userEvent.setup();
    
    await user.click(screen.getByTitle('Edit Floor QC'));
    await user.click(screen.getByTestId('drawer-save'));
    
    expect(mockUpdateFloorRow).toHaveBeenCalledWith('1', 'conYear', '2025');
    // It should close after saving
    expect(screen.queryByTestId('floor-qc-drawer')).not.toBeInTheDocument();
  });
});
