import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { CombinePropertyHistory } from '@/components/modules/property-tax/ptis/combineproperty/combinePropetryHistory';
import { useRouter } from 'next/navigation';

vi.mock('next-intl', () => ({
  useTranslations: () => (key: string) => key,
}));

vi.mock('next/navigation', () => ({
  useRouter: vi.fn(),
}));

vi.mock('@/components/common/Drawer', () => ({
  Drawer: ({ children, title, onClose }: { children: React.ReactNode, title: React.ReactNode, onClose: () => void }) => (
    <div data-testid="mock-drawer">
      <div data-testid="drawer-title">{title}</div>
      <button onClick={onClose} data-testid="drawer-close">Close</button>
      <div>{children}</div>
    </div>
  ),
}));

vi.mock('@/components/common/MasterTable', () => ({
  MasterTable: ({ data, emptyText }: { data: unknown[], emptyText: string }) => (
    <div data-testid="master-table">
      <div data-testid="table-rows">Rows: {data?.length || 0}</div>
      {data?.length === 0 && <div data-testid="empty-text">{emptyText}</div>}
    </div>
  ),
}));

vi.mock('lucide-react', () => ({
  Merge: () => <svg data-testid="merge-icon" />,
}));

describe('CombinePropertyHistory', () => {
  const mockBack = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useRouter).mockReturnValue({
      back: mockBack,
      push: vi.fn(),
      replace: vi.fn(),
      refresh: vi.fn(),
      prefetch: vi.fn(),
      forward: vi.fn(),
    } as unknown as ReturnType<typeof useRouter>);
  });

  it('renders correctly with empty history details', () => {
    render(<CombinePropertyHistory historyDetails={[]} />);
    
    expect(screen.getByTestId('mock-drawer')).toBeDefined();
    expect(screen.getByTestId('drawer-title')).toHaveTextContent('combinePropertyHistory');
    expect(screen.getByTestId('merge-icon')).toBeDefined();
    
    expect(screen.getByTestId('master-table')).toBeDefined();
    expect(screen.getByTestId('table-rows')).toHaveTextContent('Rows: 0');
    expect(screen.getByTestId('empty-text')).toHaveTextContent('emptyTableText');
  });

  it('renders correctly with history details', () => {
    const mockHistoryDetails = [
      { propertyId: 1, wardNo: 'W1', propertyNo: 'P1', ownerName: 'John Doe' },
      { propertyId: 2, wardNo: 'W2', propertyNo: 'P2', ownerName: 'Jane Smith' },
    ];
    
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    render(<CombinePropertyHistory historyDetails={mockHistoryDetails as any} />);
    
    expect(screen.getByTestId('master-table')).toBeDefined();
    expect(screen.getByTestId('table-rows')).toHaveTextContent('Rows: 2');
    expect(screen.queryByTestId('empty-text')).toBeNull();
  });

  it('calls router.back() when drawer is closed', () => {
    render(<CombinePropertyHistory historyDetails={[]} />);
    
    const closeBtn = screen.getByTestId('drawer-close');
    fireEvent.click(closeBtn);
    
    expect(mockBack).toHaveBeenCalledTimes(1);
  });
});
