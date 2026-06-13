'use client';

import { ReactNode } from 'react';
import { useRouter, useSearchParams, useParams } from 'next/navigation';
import { Drawer } from '@/components/common/Drawer';
import { useTranslations } from 'next-intl';
import { CloseIconButton } from '@/components/common/ActionButtons';

export default function ApplicableTaxesClientWrapper({ children }: { children: ReactNode }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const params = useParams();
  const t = useTranslations('applicableTaxes');
  const locale = (params.locale as string) || 'en';

  const handleClose = () => {
    const newParams = new URLSearchParams(searchParams.toString());
    router.push(`/${locale}/property-tax/ptis?${newParams.toString()}`);
  };

  return (
    <Drawer
      open={true}
      onClose={handleClose}
      width="md"
      hideHeader={true}
    >
      <div className="flex h-screen flex-col bg-white">
        {/* Sticky Header */}
        <div className="sticky top-0 z-10 bg-[#3B6BB8] px-6 py-4 flex items-start justify-between text-white shadow-md">
          <div className="flex flex-col text-left">
            <span className="text-[10px] font-extrabold text-[#F1C40F] tracking-widest uppercase">
              {t('subscreen')}
            </span>
            <h2 className="text-xl font-black text-white mt-0.5 leading-tight tracking-wide">
              {t('title')}
            </h2>
            <p className="text-xs text-blue-100 opacity-90 mt-1 font-bold leading-relaxed max-w-[480px]">
              {t('description')}
            </p>
          </div>
          <CloseIconButton
            onClick={handleClose}
            className="bg-white/10 hover:bg-white/20 text-white rounded-lg p-2 transition duration-200 mt-1 focus:outline-none"
          />
        </div>

        {/* Page children */}
        <div className="flex-1 overflow-hidden">
          {children}
        </div>

      </div>
    </Drawer>
  );
}
