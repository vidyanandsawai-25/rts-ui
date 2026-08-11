import { useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { useLocale } from 'next-intl';

export function useDashboardSearch(searchTerm: string) {
    const [isPending, startTransition] = useTransition();
    const router = useRouter();
    const locale = useLocale();

    const handleSearch = () => {
        if (!searchTerm.trim()) return;
        const currentUrl = `${window.location.pathname}${window.location.search}`;
        const returnUrl = encodeURIComponent(currentUrl);
        startTransition(() => {
            router.push(`/${locale}/property-tax/automation-dashboard/property-details-dashboard/All?searchTerm=${encodeURIComponent(searchTerm.trim())}&returnUrl=${returnUrl}`);
        });
    };

    return {
        isPending,
        handleSearch
    };
}
