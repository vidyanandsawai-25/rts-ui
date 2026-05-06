import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, Mock } from 'vitest';
import { QuickDataEntryClientWrapper } from '@/components/modules/property-tax/ptis/QuickDataEntry/QuickDataEntryClientWrapper';
import { usePathname, useSearchParams, useParams } from 'next/navigation';

// Mock next/navigation
const mockPush = vi.fn();
vi.mock('next/navigation', () => ({
    useRouter: () => ({
        push: mockPush,
    }),
    usePathname: vi.fn(),
    useSearchParams: vi.fn(),
    useParams: vi.fn(),
}));

// Mock next-intl
vi.mock('next-intl', () => ({
    useTranslations: () => (key: string) => {
        if (key === 'roomSubmission.quickDataEntry') return 'Quick Data Entry';
        if (key === 'roomSubmission.info.ward') return 'Ward';
        if (key === 'roomSubmission.info.property') return 'Property';
        if (key === 'roomSubmission.info.partition') return 'Partition';
        return key;
    },
}));

// Mock TabNavigation to simplify the test
vi.mock('@/components/modules/property-tax/ptis/QuickDataEntry/TabNavigation', () => ({
    TabNavigation: () => <div data-testid="tab-navigation">Tab Navigation</div>,
}));

// Mock Drawer component
interface MockDrawerProps {
    children: React.ReactNode;
    onClose: () => void;
    title: React.ReactNode;
}

vi.mock('@/components/common/Drawer', () => ({
    Drawer: ({ children, onClose, title }: MockDrawerProps) => (
        <div data-testid="drawer">
            <div data-testid="drawer-title">{title}</div>
            <button data-testid="drawer-close-btn" onClick={onClose}>Close</button>
            {children}
        </div>
    ),
}));

describe('QuickDataEntryClientWrapper', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('renders the drawer with information from search parameters', () => {
        (usePathname as Mock).mockReturnValue('/en/property-tax/ptis/QuickDataEntry/123/Property');
        (useParams as Mock).mockReturnValue({ locale: 'en', propertyId: '123' });
        
        const searchParams = new URLSearchParams();
        searchParams.set('wardNo', 'W01');
        searchParams.set('propertyNo', 'P01');
        searchParams.set('partitionNo', '0');
        (useSearchParams as Mock).mockReturnValue(searchParams);

        render(
            <QuickDataEntryClientWrapper>
                <div data-testid="child-content">Content</div>
            </QuickDataEntryClientWrapper>
        );

        expect(screen.getByText('Quick Data Entry')).toBeInTheDocument();
        expect(screen.getByText(/Ward: W01/)).toBeInTheDocument();
        expect(screen.getByText(/Property: P01/)).toBeInTheDocument();
        expect(screen.getByText(/Partition: 0/)).toBeInTheDocument();
        expect(screen.getByTestId('tab-navigation')).toBeInTheDocument();
        expect(screen.getByTestId('child-content')).toBeInTheDocument();
    });

    it('navigates back when logical close is triggered', () => {
        (usePathname as Mock).mockReturnValue('/en/property-tax/ptis/QuickDataEntry/123/Property');
        (useParams as Mock).mockReturnValue({ locale: 'en', propertyId: '123' });
        (useSearchParams as Mock).mockReturnValue(new URLSearchParams('wardNo=W01'));

        render(
            <QuickDataEntryClientWrapper>
                <div>Content</div>
            </QuickDataEntryClientWrapper>
        );

        const closeBtn = screen.getByTestId('drawer-close-btn');
        fireEvent.click(closeBtn);

        expect(mockPush).toHaveBeenCalledWith(expect.stringContaining('/en/property-tax/ptis?'));
        expect(mockPush).toHaveBeenCalledWith(expect.stringContaining('wardNo=W01'));
    });

    it('hides tab navigation on the Renter page', () => {
        (usePathname as Mock).mockReturnValue('/en/property-tax/ptis/QuickDataEntry/123/Renter');
        (useParams as Mock).mockReturnValue({ locale: 'en', propertyId: '123' });
        (useSearchParams as Mock).mockReturnValue(new URLSearchParams());

        render(
            <QuickDataEntryClientWrapper>
                <div>Content</div>
            </QuickDataEntryClientWrapper>
        );

        expect(screen.queryByTestId('tab-navigation')).not.toBeInTheDocument();
    });
});
