import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, Mock } from 'vitest';
import { TabNavigation } from '@/components/modules/property-tax/ptis/QuickDataEntry/TabNavigation';
import { usePathname, useSearchParams, useParams } from 'next/navigation';

// Mock next/navigation
vi.mock('next/navigation', () => ({
    useRouter: () => ({
        push: vi.fn(),
        replace: vi.fn(),
        refresh: vi.fn(),
        back: vi.fn(),
        forward: vi.fn(),
    }),
    usePathname: vi.fn(),
    useSearchParams: vi.fn(),
    useParams: vi.fn(),
}));

// Mock next-intl
vi.mock('next-intl', () => ({
    useTranslations: () => (key: string) => {
        if (key === 'tabs.Property') return 'Property Info';
        if (key === 'tabs.Kyc') return 'Kyc Info';
        if (key === 'tabs.Society') return 'Society Info';
        return key;
    },
}));

describe('TabNavigation', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('renders all tabs correctly', () => {
        (usePathname as Mock).mockReturnValue('/en/property-tax/ptis/QuickDataEntry/123/Property');
        (useSearchParams as Mock).mockReturnValue(new URLSearchParams());
        (useParams as Mock).mockReturnValue({ propertyId: '123' });

        render(<TabNavigation />);

        expect(screen.getByText('Property Info')).toBeInTheDocument();
        expect(screen.getByText('Society Info')).toBeInTheDocument();
    });

    it('highlights the active tab', () => {
        (usePathname as Mock).mockReturnValue('/en/property-tax/ptis/QuickDataEntry/123/Property');
        (useSearchParams as Mock).mockReturnValue(new URLSearchParams());
        (useParams as Mock).mockReturnValue({ propertyId: '123' });

        render(<TabNavigation />);

        const propertyTab = screen.getByText('Property Info').closest('button');
        expect(propertyTab).toHaveClass('from-blue-500'); // Based on the gradient class for Property
    });

    it('generates correct HREFs with existing search parameters', () => {
        (usePathname as Mock).mockReturnValue('/en/property-tax/ptis/QuickDataEntry/123/Property');
        (useParams as Mock).mockReturnValue({ propertyId: '123' });
        
        const searchParams = new URLSearchParams();
        searchParams.set('wardNo', '10');
        searchParams.set('wardId', '1');
        (useSearchParams as Mock).mockReturnValue(searchParams);

        render(<TabNavigation />);

        const societyTab = screen.getByText('Society Info').closest('button');
        expect(societyTab?.getAttribute('data-href')).toContain('wardNo=10');
        expect(societyTab?.getAttribute('data-href')).toContain('wardId=1');
        expect(societyTab?.getAttribute('data-href')).toContain('Society');
    });

    it('updates returnTab based on the selected quick data entry tab', () => {
        (usePathname as Mock).mockReturnValue('/en/property-tax/ptis/QuickDataEntry/123/Property');
        (useParams as Mock).mockReturnValue({ propertyId: '123' });

        const searchParams = new URLSearchParams();
        searchParams.set('returnTab', 'propertydetails');
        (useSearchParams as Mock).mockReturnValue(searchParams);

        render(<TabNavigation />);

        const kycTab = screen.getByText('Kyc Info').closest('button');
        expect(kycTab?.getAttribute('data-href')).toContain('returnTab=kycdetails');
    });
});
