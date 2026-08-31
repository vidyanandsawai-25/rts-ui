'use client';

import { ArrowLeft } from 'lucide-react';
import { usePathname, useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/common';

export function LoginBackButton() {
  const router = useRouter();
  const pathname = usePathname();
  const t = useTranslations('login');

  const handleBack = () => {
    if (window.history.length > 1) {
      router.back();
      return;
    }

    const locale = pathname.split('/').filter(Boolean)[0] || 'en';
    router.push(`/${locale}/home`);
  };

  return (
    <Button
      type="button"
      variant="ghost"
      size="sm"
      icon={ArrowLeft}
      onClick={handleBack}
      aria-label="Go back"
      className="rounded-xl border border-slate-200 bg-white text-slate-700 shadow-md hover:bg-cyan-50 hover:text-cyan-700"
    >
      {t('back')}
    </Button>
  );
}
