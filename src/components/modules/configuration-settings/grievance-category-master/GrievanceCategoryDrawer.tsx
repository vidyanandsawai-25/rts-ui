'use client';

import type { ReactElement } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { MessageSquare } from 'lucide-react';
import { Drawer } from '@/components/common';
import type { GrievanceCategoryDrawerClientProps } from '@/types/grievance-category-master/grievanceCategory.types';

export function GrievanceCategoryDrawerClient({
  children,
  isEdit = false,
  returnPath,
}: GrievanceCategoryDrawerClientProps): ReactElement {
  const router = useRouter();
  const t = useTranslations('grievanceCategory.form');

  const handleClose = (): void => {
    router.replace(returnPath ?? '/configuration-settings/grievance-category-master');
  };

  return (
    <div className="[&_[role='dialog']]:dark:bg-slate-900 [&_[role='button']]:bg-black/[0.08]! [&_[role='button']]:backdrop-blur-[1px]! [&_[role='button']]:dark:bg-black/40! [&_[role='button']]:dark:backdrop-blur-[2px]! [&_.border-b-2]:dark:border-slate-800 [&_.border-blue-200]:dark:border-slate-800 [&_.bg-white]:dark:bg-slate-900 [&_.border-t]:dark:border-slate-800 [&_.text-gray-700]:dark:text-slate-300 [&_.text-gray-800]:dark:text-slate-100">
      <Drawer
        open={true}
        onClose={handleClose}
        width="md"
        title={
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-linear-to-br from-[#4b70a6] to-[#3d5a8a] rounded-lg shadow-sm">
                <MessageSquare className="w-5 h-5 text-white" aria-hidden="true" />
              </div>
              <span className="text-xl font-bold text-[#1e3a8a] dark:text-blue-400 tracking-tight">
                {isEdit ? t('editTitle') : t('addTitle')}
              </span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium pl-[56px] -mt-1">
              {isEdit ? t('editDesc') : t('addDesc')}
            </p>
          </div>
        }
      >
        {children}
      </Drawer>
    </div>
  );
}
