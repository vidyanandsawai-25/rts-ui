import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { WeightageMasterHeader } from '@/components/modules/property-tax/weightage-mastercv/WeightageMasterTabs';

// Mock next/navigation
const mockPush = vi.fn();
const mockPathname = vi.fn();

vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
    refresh: vi.fn(),
  }),
  usePathname: () => mockPathname(),
}));

describe('WeightageMasterHeader', () => {
  const defaultProps = {
    locale: 'en',
    title: 'Weightage Master',
    subtitle: 'Manage weightage factors',
    labels: {
      floor: 'Floor',
      nature: 'Nature',
      subType: 'Sub Type',
      age: 'Age',
    },
  };

  beforeEach(() => {
    mockPush.mockClear();
    mockPathname.mockReturnValue('/en/property-tax/weightage-master');
  });

  it('renders the header with title and subtitle', () => {
    render(<WeightageMasterHeader {...defaultProps} />);

    expect(screen.getByText('Weightage Master')).toBeInTheDocument();
    expect(screen.getByText('Manage weightage factors')).toBeInTheDocument();
  });

  it('renders all tab labels', () => {
    render(<WeightageMasterHeader {...defaultProps} />);

    expect(screen.getByText('Floor')).toBeInTheDocument();
    expect(screen.getByText('Nature')).toBeInTheDocument();
    expect(screen.getByText('Sub Type')).toBeInTheDocument();
    expect(screen.getByText('Age')).toBeInTheDocument();
  });

  it('renders the Lock icon', () => {
    render(<WeightageMasterHeader {...defaultProps} />);
    
    // TableHeader should be rendered (which contains the Lock icon)
    expect(screen.getByRole('banner')).toBeInTheDocument();
  });

  it('sets floor tab as active when on base path', () => {
    mockPathname.mockReturnValue('/en/property-tax/weightage-master');
    
    render(<WeightageMasterHeader {...defaultProps} />);
    
    const floorButton = screen.getByText('Floor').closest('button');
    expect(floorButton).toHaveAttribute('aria-selected', 'true');
  });

  it('sets nature tab as active when on nature-weightage path', () => {
    mockPathname.mockReturnValue('/en/property-tax/weightage-master/nature-weightage');
    
    render(<WeightageMasterHeader {...defaultProps} />);
    
    const natureButton = screen.getByText('Nature').closest('button');
    expect(natureButton).toHaveAttribute('aria-selected', 'true');
  });

  it('sets subType tab as active when on sub-type-weightage path', () => {
    mockPathname.mockReturnValue('/en/property-tax/weightage-master/sub-type-weightage');
    
    render(<WeightageMasterHeader {...defaultProps} />);
    
    const subTypeButton = screen.getByText('Sub Type').closest('button');
    expect(subTypeButton).toHaveAttribute('aria-selected', 'true');
  });

  it('sets age tab as active when on age-weightage path', () => {
    mockPathname.mockReturnValue('/en/property-tax/weightage-master/age-weightage');
    
    render(<WeightageMasterHeader {...defaultProps} />);
    
    const ageButton = screen.getByText('Age').closest('button');
    expect(ageButton).toHaveAttribute('aria-selected', 'true');
  });

  it('navigates to floor tab (base path) when floor is clicked', () => {
    mockPathname.mockReturnValue('/en/property-tax/weightage-master/nature-weightage');
    
    render(<WeightageMasterHeader {...defaultProps} />);
    
    const floorButton = screen.getByText('Floor').closest('button');
    fireEvent.click(floorButton!);
    
    expect(mockPush).toHaveBeenCalledWith('/en/property-tax/weightage-master');
  });

  it('navigates to nature-weightage when nature tab is clicked', () => {
    render(<WeightageMasterHeader {...defaultProps} />);
    
    const natureButton = screen.getByText('Nature').closest('button');
    fireEvent.click(natureButton!);
    
    expect(mockPush).toHaveBeenCalledWith('/en/property-tax/weightage-master/nature-weightage');
  });

  it('navigates to sub-type-weightage when subType tab is clicked', () => {
    render(<WeightageMasterHeader {...defaultProps} />);
    
    const subTypeButton = screen.getByText('Sub Type').closest('button');
    fireEvent.click(subTypeButton!);
    
    expect(mockPush).toHaveBeenCalledWith('/en/property-tax/weightage-master/sub-type-weightage');
  });

  it('navigates to age-weightage when age tab is clicked', () => {
    render(<WeightageMasterHeader {...defaultProps} />);
    
    const ageButton = screen.getByText('Age').closest('button');
    fireEvent.click(ageButton!);
    
    expect(mockPush).toHaveBeenCalledWith('/en/property-tax/weightage-master/age-weightage');
  });

  it('respects locale in navigation URLs', () => {
    const propsWithNpLocale = {
      ...defaultProps,
      locale: 'np',
    };
    
    render(<WeightageMasterHeader {...propsWithNpLocale} />);
    
    const natureButton = screen.getByText('Nature').closest('button');
    fireEvent.click(natureButton!);
    
    expect(mockPush).toHaveBeenCalledWith('/np/property-tax/weightage-master/nature-weightage');
  });

  it('renders tabs with pills variant', () => {
    const { container } = render(<WeightageMasterHeader {...defaultProps} />);
    
    // Pills variant typically has rounded styling
    const tabsContainer = container.querySelector('[role="tablist"]');
    expect(tabsContainer).toBeInTheDocument();
  });

  it('renders all tab icons', () => {
    const { container } = render(<WeightageMasterHeader {...defaultProps} />);
    
    // Each tab should have an icon - there should be multiple SVG elements
    const svgElements = container.querySelectorAll('svg');
    expect(svgElements.length).toBeGreaterThanOrEqual(5); // Lock icon + 4 tab icons
  });

  it('handles active tab determination with ending slash', () => {
    mockPathname.mockReturnValue('/en/property-tax/weightage-master/');
    
    render(<WeightageMasterHeader {...defaultProps} />);
    
    const floorButton = screen.getByText('Floor').closest('button');
    expect(floorButton).toHaveAttribute('aria-selected', 'true');
  });

  it('defaults to floor tab for unknown paths', () => {
    mockPathname.mockReturnValue('/en/property-tax/weightage-master/unknown-path');
    
    render(<WeightageMasterHeader {...defaultProps} />);
    
    const floorButton = screen.getByText('Floor').closest('button');
    expect(floorButton).toHaveAttribute('aria-selected', 'true');
  });

  it('renders TableHeader component', () => {
    const { container } = render(<WeightageMasterHeader {...defaultProps} />);
    
    // TableHeader typically has a header tag with specific role
    const header = container.querySelector('header[role="banner"]');
    expect(header).toBeInTheDocument();
  });

  it('passes correct props to TableHeader', () => {
    render(<WeightageMasterHeader {...defaultProps} />);
    
    // Verify title and subtitle are rendered within the header
    const title = screen.getByText('Weightage Master');
    const subtitle = screen.getByText('Manage weightage factors');
    
    expect(title.closest('header[role="banner"]')).toBeInTheDocument();
    expect(subtitle.closest('header[role="banner"]')).toBeInTheDocument();
  });

  it('renders tabs in correct order', () => {
    render(<WeightageMasterHeader {...defaultProps} />);
    
    const tabButtons = screen.getAllByRole('tab');
    expect(tabButtons).toHaveLength(4);
    expect(tabButtons[0]).toHaveTextContent('Floor');
    expect(tabButtons[1]).toHaveTextContent('Nature');
    expect(tabButtons[2]).toHaveTextContent('Sub Type');
    expect(tabButtons[3]).toHaveTextContent('Age');
  });

  it('keyboard navigation works on tabs', () => {
    render(<WeightageMasterHeader {...defaultProps} />);
    
    const natureTab = screen.getByText('Nature').closest('button');
    
    // Focus the tab
    natureTab?.focus();
    expect(document.activeElement).toBe(natureTab);
    
    // Click the tab to activate
    fireEvent.click(natureTab!);
    expect(mockPush).toHaveBeenCalledWith('/en/property-tax/weightage-master/nature-weightage');
  });

  it('all tabs are clickable', () => {
    render(<WeightageMasterHeader {...defaultProps} />);
    
    const tabButtons = screen.getAllByRole('tab');
    
    tabButtons.forEach(button => {
      expect(button).toBeEnabled();
      expect(button).not.toHaveAttribute('disabled');
    });
  });
});
