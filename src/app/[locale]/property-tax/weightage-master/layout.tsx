'use client';

import { TableHeader, Tabs, type TabItem } from '@/components/common';
import { Lock, Layers, Hammer, Users, Calendar } from 'lucide-react';
import { usePathname, useRouter } from 'next/navigation';
import { useLocale, useTranslations } from 'next-intl';

const Layout = ({ children }: { children: React.ReactNode }) => {
    const router = useRouter();
    const pathname = usePathname();
    const locale = useLocale();
    const t = useTranslations('weightageMaster');

    const base = `/${locale}/property-tax/weightage-master`;

    const activeTab =
        pathname.includes('/nature-weightage')
            ? 'nature'
            : pathname.includes('/sub-type-weightage')
                ? 'subType'
                : pathname.includes('/age-weightage')
                    ? 'age'
                    : pathname.endsWith('/weightage-master')
                        ? 'floor'
                        : 'floor';

    const tabs: TabItem[] = [
        { value: 'floor', label: t('tabs.floor'), icon: Layers, content: null },
        { value: 'nature', label: t('tabs.nature'), icon: Hammer, content: null },
        { value: 'subType', label: t('tabs.subType'), icon: Users, content: null },
        { value: 'age', label: t('tabs.age'), icon: Calendar, content: null },
    ];

    // Determine the active weightage factor based on the URL
    const activeWeightageFactor = t(`tabs.${activeTab}`);

    return (
        <div className='text-gray-900'>
            <TableHeader
                title={`${t('title')} - ${activeWeightageFactor}`}
                subtitle={t('subtitle')}
                icon={Lock}
                rightContent={
                    <Tabs
                        value={activeTab}
                        variant="pills"
                        items={tabs}
                        onChange={(v) => {
                            if (v === 'floor') {
                                router.push(`${base}`);
                            } else {
                                router.push(`${base}/${v === 'subType' ? 'sub-type' : v}-weightage`);
                            }
                        }}
                    />
                }
            />
            <div className="mt-0">
                {children}
            </div>
        </div>
    );
};

export default Layout;