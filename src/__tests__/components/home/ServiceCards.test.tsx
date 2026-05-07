import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import type { ReactNode } from 'react';
import ServiceCards from '@/components/modules/home/ServiceCards';
import { Service } from '@/types/home/home.types';
import { toast } from 'sonner';

// Mock next/link
vi.mock('next/link', () => ({
  default: ({ children, href }: { children: ReactNode; href: string }) => (
    <a href={href}>{children}</a>
  ),
}));

// Mock sonner toast
vi.mock('sonner', () => ({
  toast: {
    error: vi.fn(),
  },
}));

// Mock next-intl
vi.mock('next-intl', () => ({
  useTranslations: () => (key: string) => {
    const translations: Record<string, string> = {
      'errors.generic': 'Something went wrong',
      'error.tryAgain': 'Try Again',
    };
    return translations[key] || key;
  },
}));

const mockServices: Service[] = [
  {
    id: 1,
    link: '/property-tax',
    icon: 'property-tax',
    title: 'Property Tax',
    subtext: 'Pay your property tax online',
    stats: [{ label: 'Due', value: '₹5000' }],
  },
  {
    id: 2,
    link: '/water-tax',
    icon: 'water-tax',
    title: 'Water Tax',
    subtext: 'Pay your water tax online',
    stats: [{ label: 'Due', value: '₹1000' }],
  },
  {
    id: 3,
    link: '/garbage-collection',
    icon: 'garbage-collection',
    title: 'Garbage Collection',
    subtext: 'Schedule garbage collection',
  },
];

describe('ServiceCards Component', () => {
  beforeEach(() => {
    vi.mocked(toast.error).mockClear();
  });

  it('renders service cards for provided services', () => {
    render(<ServiceCards services={mockServices} />);
    expect(screen.getByText('Property Tax')).toBeInTheDocument();
    expect(screen.getByText('Water Tax')).toBeInTheDocument();
    expect(screen.getByText('Garbage Collection')).toBeInTheDocument();
  });

  it('renders nothing when services array is empty', () => {
    const { container } = render(<ServiceCards services={[]} />);
    expect(container.firstChild).toBeNull();
  });

  it('renders nothing when services is undefined', () => {
    const { container } = render(<ServiceCards />);
    expect(container.firstChild).toBeNull();
  });

  it('renders correct links for each service', () => {
    render(<ServiceCards services={mockServices} />);
    const propertyTaxLink = screen.getByText('Property Tax').closest('a');
    const waterTaxLink = screen.getByText('Water Tax').closest('a');
    expect(propertyTaxLink).toHaveAttribute('href', '/property-tax');
    expect(waterTaxLink).toHaveAttribute('href', '/water-tax');
  });

  it('renders subtext for each service', () => {
    render(<ServiceCards services={mockServices} />);
    expect(screen.getByText('Pay your property tax online')).toBeInTheDocument();
    expect(screen.getByText('Pay your water tax online')).toBeInTheDocument();
  });

  it('renders stats badges when provided', () => {
    render(<ServiceCards services={mockServices} />);
    expect(screen.getByText('Due: ₹5000')).toBeInTheDocument();
    expect(screen.getByText('Due: ₹1000')).toBeInTheDocument();
  });

  it('renders correct number of service cards', () => {
    render(<ServiceCards services={mockServices} />);
    const links = screen.getAllByRole('link');
    expect(links).toHaveLength(3);
  });

  it('applies responsive grid classes', () => {
    const { container } = render(<ServiceCards services={mockServices} />);
    const grid = container.querySelector('.grid');
    expect(grid).toHaveClass(
      'grid-cols-1',
      'sm:grid-cols-2',
      'md:grid-cols-2',
      'lg:grid-cols-3',
      'xl:grid-cols-3'
    );
  });

  it('renders section with correct styling', () => {
    const { container } = render(<ServiceCards services={mockServices} />);
    const section = container.querySelector('section');
    expect(section).toHaveClass('w-full', 'min-h-[400px]');
  });

  it('displays error toast when error prop is provided', () => {
    render(<ServiceCards services={mockServices} error="Failed to load services" />);
    expect(toast.error).toHaveBeenCalledWith('Failed to load services', expect.objectContaining({
      duration: 5000,
      id: 'services-load-error',
    }));
  });

  it('does not display error toast when no error prop', () => {
    render(<ServiceCards services={mockServices} />);
    expect(toast.error).not.toHaveBeenCalled();
  });

  it('renders section with correct accessibility attributes', () => {
    const { container } = render(<ServiceCards services={mockServices} />);
    const section = container.querySelector('section');
    expect(section).toHaveAttribute('aria-label', 'Available Services');
  });

  it('renders cards with left border styling', () => {
    const { container } = render(<ServiceCards services={mockServices} />);
    const cards = container.querySelectorAll('.border-l-\\[6px\\]');
    expect(cards).toHaveLength(3);
  });
});

describe('ServiceCards Icon Mapping', () => {
  const iconTestCases = [
    { icon: 'property-tax', title: 'Property Tax' },
    { icon: 'water-tax', title: 'Water Tax' },
    { icon: 'bajar-parwana', title: 'Bajar Parwana' },
    { icon: 'birth-death', title: 'Birth Death' },
    { icon: 'garbage-collection', title: 'Garbage Collection' },
    { icon: 'building-permission', title: 'Building Permission' },
    { icon: 'grievance', title: 'Grievance' },
    { icon: 'rts', title: 'RTS' },
    { icon: 'assets', title: 'Assets' },
    { icon: 'unknown', title: 'Unknown Service' },
  ];

  iconTestCases.forEach(({ icon, title }) => {
    it(`renders icon for ${icon}`, () => {
      const service: Service[] = [
        {
          id: 1,
          link: '/test',
          icon,
          title,
          subtext: 'Test subtext',
        },
      ];
      render(<ServiceCards services={service} />);
      expect(screen.getByText(title)).toBeInTheDocument();
    });
  });
});

describe('ServiceCards Inline Error', () => {
  beforeEach(() => {
    vi.mocked(toast.error).mockClear();
  });

  it('displays inline error when services array is empty and error prop provided', () => {
    render(<ServiceCards services={[]} error="Failed to load services" />);
    expect(screen.getByText('Something went wrong')).toBeInTheDocument();
    expect(screen.getByText('Failed to load services')).toBeInTheDocument();
  });

  it('displays inline error when services is undefined and error prop provided', () => {
    render(<ServiceCards error="Network error" />);
    expect(screen.getByText('Something went wrong')).toBeInTheDocument();
    expect(screen.getByText('Network error')).toBeInTheDocument();
  });

  it('displays Try Again button in error state', () => {
    render(<ServiceCards services={[]} error="Failed to load" />);
    expect(screen.getByRole('button', { name: /try again/i })).toBeInTheDocument();
  });

  it('still displays services when error and services are both provided', () => {
    const mockServices: Service[] = [
      {
        id: 1,
        link: '/property-tax',
        icon: 'property-tax',
        title: 'Property Tax',
        subtext: 'Pay your property tax online',
      },
    ];
    render(<ServiceCards services={mockServices} error="Some warning" />);
    // Services should still render, error is shown as toast
    expect(screen.getByText('Property Tax')).toBeInTheDocument();
    expect(toast.error).toHaveBeenCalled();
  });

  it('renders error section with correct accessibility label', () => {
    const { container } = render(<ServiceCards services={[]} error="Error" />);
    const section = container.querySelector('section');
    expect(section).toHaveAttribute('aria-label', 'Service Load Error');
  });
});
