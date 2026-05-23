import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { CommonDetailsUpdateMenu } from '@/components/modules/property-tax/common-details-update/CommonDetailsUpdateMenu';
import { BulkUpdateMaster } from '@/types/common-details-update/common-details-update.types';

vi.mock('next-intl', () => ({
  useLocale: () => 'en',
}));

describe('CommonDetailsUpdateMenu', () => {
  const mockT = (key: string) => key;
  const mockMenuItems: BulkUpdateMaster[] = [
    {
      id: 1,
      updateCode: 'CODE1',
      updateName: 'Update 1',
      updateNameMarathi: 'अपडेट 1',
      iconName: 'person',
      targetTable: 'Table',
      isActive: true,
      displaySequence: 1,
      apiRoute: '/api/1',
    },
    {
      id: 2,
      updateCode: 'CODE2',
      updateName: 'Update 2',
      updateNameMarathi: 'अपडेट 2',
      iconName: 'location_on',
      targetTable: 'Table',
      isActive: true,
      displaySequence: 2,
      apiRoute: '/api/2',
    },
  ];

  const defaultProps = {
    menuItems: mockMenuItems,
    selectedCode: 'CODE1',
    menuSearch: '',
    setMenuSearch: vi.fn(),
    onSelect: vi.fn(),
    t: mockT,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render menu title', () => {
    render(<CommonDetailsUpdateMenu {...defaultProps} />);
    expect(screen.getByText('menu.title')).toBeInTheDocument();
  });

  it('should render all menu items', () => {
    render(<CommonDetailsUpdateMenu {...defaultProps} />);
    expect(screen.getByText('Update 1')).toBeInTheDocument();
    expect(screen.getByText('Update 2')).toBeInTheDocument();
  });

  it('should call setMenuSearch on input change', async () => {
    const user = userEvent.setup();
    render(<CommonDetailsUpdateMenu {...defaultProps} />);
    
    const input = screen.getByPlaceholderText('menu.searchPlaceholder');
    await user.type(input, 'test');
    
    expect(defaultProps.setMenuSearch).toHaveBeenCalledWith('t');
  });

  it('should call onSelect when a menu item is clicked', async () => {
    const user = userEvent.setup();
    render(<CommonDetailsUpdateMenu {...defaultProps} />);
    
    const button = screen.getByText('Update 2');
    await user.click(button);
    
    expect(defaultProps.onSelect).toHaveBeenCalledWith('CODE2');
  });

  it('should apply active class to selected item', () => {
    render(<CommonDetailsUpdateMenu {...defaultProps} selectedCode="CODE2" />);
    
    const activeButton = screen.getByText('Update 2').closest('button');
    expect(activeButton).toHaveClass('bg-[#1E3A8A]');
  });
});
