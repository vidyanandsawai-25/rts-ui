'use client';

import { Check } from 'lucide-react';
import { Button } from '@/components/common';
import { useTranslations } from 'next-intl';

interface FixedFooterProps {
  onConfirm: () => void;
}

export const FixedFooter = ({ onConfirm }: FixedFooterProps) => {
  const t = useTranslations('applicableTaxes');

  return (
    <div className="absolute bottom-0 left-0 right-0 bg-white border-t border-[#DCEAFF] px-6 py-4 flex items-center justify-between shadow-2xl z-20">
      <span className="text-xs font-semibold text-slate-500 leading-normal max-w-[520px]">
        {t('footerNote')}
      </span>
      <Button
        variant="primary"
        icon={Check}
        onClick={onConfirm}
      >
        {t('confirmReturn')}
      </Button>
    </div>
  );
};

export default FixedFooter;