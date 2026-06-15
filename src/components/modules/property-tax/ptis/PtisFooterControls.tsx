'use client';

import { useState, useEffect } from 'react';
import { FooterSelect } from './FooterSelect';
import { useTranslations } from 'next-intl';
import { usePathname, useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { CircleArrowLeft } from 'lucide-react';
import { Tooltip } from '@/components/common';

export function PtisBackButton() {
  const t = useTranslations('ptis');
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const router = useRouter();
  const [resolvedSearchState, setResolvedSearchState] = useState<string | null>(null);

  useEffect(() => {
    const urlSearchState = searchParams.get('searchState');
    if (urlSearchState === 'clear') {
      sessionStorage.removeItem('ptis_search_state');
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setResolvedSearchState(null);
    } else if (urlSearchState) {
      sessionStorage.setItem('ptis_search_state', urlSearchState);
      setResolvedSearchState(urlSearchState);
    } else {
      const cached = sessionStorage.getItem('ptis_search_state');
      if (cached) {
        setResolvedSearchState(cached);
      }
    }
  }, [searchParams]);

  const segments = pathname.split('/').filter(Boolean);
  const locale = segments[0] || 'en';

  const handleBackClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    let cached: string | null = null;
    try {
      cached = sessionStorage.getItem('ptis_search_state');
    } catch (err) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Failed to read ptis_search_state from sessionStorage:', err);
      }
    }
    const target = `/${locale}/property-tax/search-property${
      cached ? `?${cached}` : ''
    }`;
    router.push(target);
  };

  const targetUrl = `/${locale}/property-tax/search-property${
    resolvedSearchState ? `?${resolvedSearchState}` : ''
  }`;

  return (
    <Tooltip content={t('buttons.backToSearch') || 'Back to Search Property'} placement="top">
      <Link
        href={targetUrl}
        onClick={handleBackClick}
        className="h-8.5 md:h-9 w-8.5 md:w-9 inline-flex items-center justify-center rounded-lg border border-blue-200 bg-blue-50/70 text-blue-600 hover:text-blue-700 hover:border-blue-300 hover:bg-blue-100 hover:shadow-md hover:scale-105 active:scale-95 transition-all duration-200 shrink-0 cursor-pointer focus:outline-none focus:ring-4 focus:ring-blue-100/50"
        aria-label={t('buttons.backToSearch') || 'Back to Search Property'}
      >
        <CircleArrowLeft className="w-4.5 h-4.5 stroke-[2.5]" />
      </Link>
    </Tooltip>
  );
}

export function PtisFooterDropdowns() {
  const t = useTranslations('ptis');
  const [selectedPolicy, setSelectedPolicy] = useState('');
  const [selectedAction, setSelectedAction] = useState('');

  const POLICY_OPTIONS = [
    { label: t('footerControls.policy.options.old'), value: 'old' },
    { label: t('footerControls.policy.options.min_rv'), value: 'min_rv' },
    { label: t('footerControls.policy.options.mix'), value: 'mix' },
  ];

  const ACTION_OPTIONS = [
    { label: t('footerControls.action.options.apply'), value: 'apply' },
    { label: t('footerControls.action.options.remove_retention'), value: 'remove_retention' },
    { label: t('footerControls.action.options.remove_hearing'), value: 'remove_hearing' },
    { label: t('footerControls.action.options.remove_appeal_committee'), value: 'remove_appeal_committee' },
    { label: t('footerControls.action.options.remove_remission'), value: 'remove_remission' },
    { label: t('footerControls.action.options.remove_all_appeals'), value: 'remove_all_appeals' },
  ];

  return (
    <>
      <FooterSelect
        label={t('footerControls.policy.label')}
        placeholder={t('footerControls.policy.placeholder')}
        value={selectedPolicy}
        onChange={setSelectedPolicy}
        options={POLICY_OPTIONS}
        className="w-[105px] sm:w-[130px] md:w-[145px] shrink-0"
      />

      <FooterSelect
        label={t('footerControls.action.label')}
        placeholder={t('footerControls.action.placeholder')}
        value={selectedAction}
        onChange={setSelectedAction}
        options={ACTION_OPTIONS}
        className="w-[115px] sm:w-[150px] md:w-[165px] shrink-0"
      />
    </>
  );
}
