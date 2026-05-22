'use client';

import { useState } from 'react';
import { FooterSelect } from './FooterSelect';

import { useTranslations } from 'next-intl';

export function PtisFooterControls() {
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
    <div className="flex items-center gap-2 shrink-0 h-full">
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
    </div>
  );
}
