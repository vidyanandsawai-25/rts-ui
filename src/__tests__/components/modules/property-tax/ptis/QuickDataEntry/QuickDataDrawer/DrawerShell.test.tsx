import DrawerShell from '@/components/modules/property-tax/ptis/QuickDataEntry/QuickDataDrawer/DrawerShell';
import { render, screen, fireEvent } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { usePathname } from 'next/navigation';

// Mock next/navigation
const mockPush = vi.fn();
vi.mock('next/navigation', () => ({
    usePathname: vi.fn(() => '/en/property-tax/ptis/QuickDataEntry/123/Society'),
    useSearchParams: vi.fn(() => new URLSearchParams({
        wardNo: 'W-10',
        propertyNo: 'P-101',
        partitionNo: '0',
        propertyId: '123'
    })),
    useRouter: () => ({
        push: mockPush
    }),
}));

// Mock next-intl
vi.mock('next-intl', () => {
    const translations: Record<string, string> = {
        'common.app.assessmentSystem': 'PTIS Assessment',
        'quickDataEntry.roomSubmission.info.ward': 'Ward',
        'quickDataEntry.roomSubmission.info.property': 'Property',
        'quickDataEntry.roomSubmission.info.partition': 'Partition',
        'quickDataEntry.tabs.Property': 'Property',
        'quickDataEntry.tabs.Kyc': 'KYC',
        'quickDataEntry.tabs.Society': 'Society',
        'quickDataEntry.tabs.BuildingPermission': 'Building Permission',
        'quickDataEntry.tabs.FloorSubmission': 'Floor',
        'quickDataEntry.tabs.Discount': 'Discount',
        'quickDataEntry.tabs.OldDetails': 'Old Details'
    };
    return {
        useTranslations: (namespace: string) => (key: string) => {
            const fullKey = namespace ? `${namespace}.${key}` : key;
            return translations[fullKey] || key;
        },
    };
});

// Mock icons
vi.mock('lucide-react', () => ({
    Home: () => <div data-testid="icon-home" />,
    User: () => <div data-testid="icon-user" />,
    Building2: () => <div data-testid="icon-building2" />,
    Building: () => <div data-testid="icon-building" />,
    Layers: () => <div data-testid="icon-layers" />,
    Percent: () => <div data-testid="icon-percent" />,
    FileText: () => <div data-testid="icon-filetext" />,
    X: () => <div data-testid="icon-x" />,
}));

describe('DrawerShell', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('renders the header title and breadcrumbs correctly', () => {
        render(
            <DrawerShell locale="en">
                <div data-testid="child-content">Content</div>
            </DrawerShell>
        );

        expect(screen.getByText('PTIS Assessment')).toBeInTheDocument();
        expect(screen.getByText((content) => content.includes('Ward') && content.includes('W-10'))).toBeInTheDocument();
        expect(screen.getByText((content) => content.includes('Property') && content.includes('P-101'))).toBeInTheDocument();
        expect(screen.getByText((content) => content.includes('Partition') && content.includes('0'))).toBeInTheDocument();
    });

    it('renders all 7 localized navigation tabs', () => {
        render(
            <DrawerShell locale="en">
                <div>Content</div>
            </DrawerShell>
        );

        const tabNames = ['Property', 'KYC', 'Society', 'Building Permission', 'Floor', 'Discount', 'Old Details'];
        tabNames.forEach(name => {
            expect(screen.getByText(name)).toBeInTheDocument();
        });
    });

    it('highlights the Society tab as active when pathname includes /Society', () => {
        // Path ends with /Society in mock
        render(
            <DrawerShell locale="en">
                <div>Content</div>
            </DrawerShell>
        );

        const societyTab = screen.getByRole('link', { name: /society/i });
        expect(societyTab).toHaveClass('bg-purple-600');
    });

    it('highlights the Kyc tab as active when pathname includes /Kyc', () => {
        vi.mocked(usePathname).mockReturnValueOnce('/en/property-tax/ptis/QuickDataEntry/123/Kyc');

        render(
            <DrawerShell locale="en">
                <div>Content</div>
            </DrawerShell>
        );

        const kycTab = screen.getByRole('link', { name: /kyc/i });
        expect(kycTab).toHaveClass('bg-green-600');
    });

    it('calls router.push when the close button is clicked', () => {
        render(
            <DrawerShell locale="en">
                <div>Content</div>
            </DrawerShell>
        );

        // Finding close button - in Drawer it's the button containing the X icon
        const closeButton = screen.getByTestId('icon-x').closest('button')!;
        fireEvent.click(closeButton);

        expect(mockPush).toHaveBeenCalledWith(expect.stringContaining('/en/property-tax/ptis'));
        expect(mockPush).toHaveBeenCalledWith(expect.stringContaining('wardNo=W-10'));
        expect(mockPush).toHaveBeenCalledWith(expect.stringContaining('propertyNo=P-101'));
    });

    it('hides header and tabs on Renter page', () => {
        vi.mocked(usePathname).mockReturnValueOnce('/en/property-tax/ptis/QuickDataEntry/123/Renter');

        render(
            <DrawerShell locale="en">
                <div data-testid="child-content">Content</div>
            </DrawerShell>
        );

        expect(screen.queryByText('PTIS Assessment')).not.toBeInTheDocument();
        expect(screen.queryByRole('navigation')).not.toBeInTheDocument();
        expect(screen.getByTestId('child-content')).toBeInTheDocument();
    });
});
