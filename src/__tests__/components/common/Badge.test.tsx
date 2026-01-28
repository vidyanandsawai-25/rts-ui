import { render, screen } from '@testing-library/react';
import { createRef } from 'react';
import { describe, it, expect } from 'vitest';
import { Badge, BadgeVariant, BadgeSize } from '@/components/common/Badge';

// Mock icon component for testing
const MockIcon = ({ className }: { className?: string }) => (
  <svg data-testid="mock-icon" className={className} />
);

describe('Badge', () => {
  describe('Rendering', () => {
    it('renders children correctly', () => {
      render(<Badge>Test Badge</Badge>);
      expect(screen.getByText('Test Badge')).toBeInTheDocument();
    });

    it('renders with default props', () => {
      render(<Badge>Default</Badge>);
      const badge = screen.getByText('Default').parentElement;
      expect(badge).toHaveClass('bg-blue-100', 'text-blue-700'); // default variant
      expect(badge).toHaveClass('text-xs', 'px-2.5', 'h-6'); // md size
    });

    it('forwards ref correctly', () => {
      const ref = createRef<HTMLDivElement>();
      render(<Badge ref={ref}>Ref Test</Badge>);
      expect(ref.current).toBeInstanceOf(HTMLDivElement);
    });

    it('applies custom className', () => {
      render(<Badge className="custom-class">Custom</Badge>);
      const badge = screen.getByText('Custom').parentElement;
      expect(badge).toHaveClass('custom-class');
    });

    it('passes through additional HTML attributes', () => {
      render(
        <Badge data-testid="badge" aria-label="Status badge">
          Accessible
        </Badge>
      );
      const badge = screen.getByTestId('badge');
      expect(badge).toHaveAttribute('aria-label', 'Status badge');
    });
  });

  describe('Variants', () => {
    const variants: { variant: BadgeVariant; expectedClasses: string[] }[] = [
      { variant: 'default', expectedClasses: ['bg-blue-100', 'text-blue-700'] },
      { variant: 'secondary', expectedClasses: ['bg-gray-100', 'text-gray-700'] },
      { variant: 'outline', expectedClasses: ['text-gray-900', 'border-gray-200'] },
      { variant: 'destructive', expectedClasses: ['bg-red-100', 'text-red-700'] },
      { variant: 'success', expectedClasses: ['bg-green-100', 'text-green-700'] },
      { variant: 'warning', expectedClasses: ['bg-yellow-100', 'text-yellow-800'] },
    ];

    variants.forEach(({ variant, expectedClasses }) => {
      it(`renders ${variant} variant with correct styles`, () => {
        render(<Badge variant={variant}>{variant}</Badge>);
        const badge = screen.getByText(variant).parentElement;
        expectedClasses.forEach((cls) => {
          expect(badge).toHaveClass(cls);
        });
      });
    });
  });

  describe('Sizes', () => {
    const sizes: { size: BadgeSize; expectedClasses: string[] }[] = [
      { size: 'sm', expectedClasses: ['text-[10px]', 'px-2', 'h-5', 'gap-1'] },
      { size: 'md', expectedClasses: ['text-xs', 'px-2.5', 'h-6', 'gap-1.5'] },
      { size: 'lg', expectedClasses: ['text-sm', 'px-3', 'h-7', 'gap-2'] },
    ];

    sizes.forEach(({ size, expectedClasses }) => {
      it(`renders ${size} size with correct styles`, () => {
        render(<Badge size={size}>{size}</Badge>);
        const badge = screen.getByText(size).parentElement;
        expectedClasses.forEach((cls) => {
          expect(badge).toHaveClass(cls);
        });
      });
    });
  });

  describe('Icon', () => {
    it('renders icon when provided', () => {
      render(<Badge icon={MockIcon}>With Icon</Badge>);
      expect(screen.getByTestId('mock-icon')).toBeInTheDocument();
    });

    it('does not render icon when not provided', () => {
      render(<Badge>No Icon</Badge>);
      expect(screen.queryByTestId('mock-icon')).not.toBeInTheDocument();
    });

    it('applies correct icon size for sm badge', () => {
      render(
        <Badge size="sm" icon={MockIcon}>
          Small
        </Badge>
      );
      const icon = screen.getByTestId('mock-icon');
      expect(icon).toHaveClass('w-3', 'h-3');
    });

    it('applies correct icon size for md badge', () => {
      render(
        <Badge size="md" icon={MockIcon}>
          Medium
        </Badge>
      );
      const icon = screen.getByTestId('mock-icon');
      expect(icon).toHaveClass('w-3.5', 'h-3.5');
    });

    it('applies correct icon size for lg badge', () => {
      render(
        <Badge size="lg" icon={MockIcon}>
          Large
        </Badge>
      );
      const icon = screen.getByTestId('mock-icon');
      expect(icon).toHaveClass('w-4', 'h-4');
    });
  });

  describe('Status Dot', () => {
    it('renders dot when dot prop is true', () => {
      render(<Badge dot>With Dot</Badge>);
      const badge = screen.getByText('With Dot').parentElement;
      const dot = badge?.querySelector('span.rounded-full');
      expect(dot).toBeInTheDocument();
      expect(dot).toHaveAttribute('aria-hidden', 'true');
    });

    it('does not render dot when dot prop is false or not provided', () => {
      render(<Badge>No Dot</Badge>);
      const badge = screen.getByText('No Dot').parentElement;
      const dot = badge?.querySelector('span.rounded-full.bg-current');
      expect(dot).not.toBeInTheDocument();
    });

    it('applies smaller dot size for sm badge', () => {
      render(
        <Badge dot size="sm">
          Small Dot
        </Badge>
      );
      const badge = screen.getByText('Small Dot').parentElement;
      const dot = badge?.querySelector('span.rounded-full');
      expect(dot).toHaveClass('w-1', 'h-1');
    });

    it('applies larger dot size for md and lg badges', () => {
      render(
        <Badge dot size="md">
          Medium Dot
        </Badge>
      );
      const badge = screen.getByText('Medium Dot').parentElement;
      const dot = badge?.querySelector('span.rounded-full');
      expect(dot).toHaveClass('w-1.5', 'h-1.5');
    });
  });

  describe('Combined Props', () => {
    it('renders with icon and dot together', () => {
      render(
        <Badge icon={MockIcon} dot>
          Both
        </Badge>
      );
      expect(screen.getByTestId('mock-icon')).toBeInTheDocument();
      const badge = screen.getByText('Both').parentElement;
      const dot = badge?.querySelector('span.rounded-full');
      expect(dot).toBeInTheDocument();
    });

    it('renders with all props combined', () => {
      render(
        <Badge
          variant="success"
          size="lg"
          icon={MockIcon}
          dot
          className="extra-class"
          data-testid="full-badge"
        >
          Full Featured
        </Badge>
      );

      const badge = screen.getByTestId('full-badge');
      expect(badge).toHaveClass('bg-green-100', 'text-green-700'); // success variant
      expect(badge).toHaveClass('text-sm', 'px-3', 'h-7'); // lg size
      expect(badge).toHaveClass('extra-class');
      expect(screen.getByTestId('mock-icon')).toBeInTheDocument();
      const dot = badge.querySelector('span.rounded-full');
      expect(dot).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('has correct base classes for styling', () => {
      render(<Badge>Accessible</Badge>);
      const badge = screen.getByText('Accessible').parentElement;
      expect(badge).toHaveClass('inline-flex', 'items-center', 'rounded-full', 'font-semibold');
    });

    it('dot is hidden from screen readers', () => {
      render(<Badge dot>Dot Badge</Badge>);
      const badge = screen.getByText('Dot Badge').parentElement;
      const dot = badge?.querySelector('span.rounded-full');
      expect(dot).toHaveAttribute('aria-hidden', 'true');
    });
  });
});
