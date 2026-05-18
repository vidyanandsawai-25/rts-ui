'use client';

import { Key } from 'lucide-react';
import { Drawer } from '@/components/common';
import type { AddConfigKeyModalProps } from '@/types/configMaster.types';
import { useTranslations } from 'next-intl';
import { ConfigKeyForm } from './ConfigKeyForm';

export default function AddConfigKeyModal({
  isOpen,
  onClose,
  categoryId,
  categories = [],
  onSuccess,
  initialData,
}: AddConfigKeyModalProps) {
  const t = useTranslations('configMaster');
  const isEdit = !!initialData;

  return (
    <Drawer
      open={isOpen}
      onClose={onClose}
      width="md"
      title={
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-linear-to-br from-emerald-500 to-emerald-600 rounded-lg shadow-sm shrink-0">
            <Key className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-slate-800 tracking-tight">
              {isEdit ? t('modals.editKey.title') : t('modals.addKey.title')}
            </h2>
            <p className="text-slate-500 text-sm mt-0.5">
              {isEdit ? t('modals.editKey.subtitle') : t('modals.addKey.subtitle')}
            </p>
          </div>
        </div>
      }
    >
      {isOpen && (
        <ConfigKeyForm
          key={isOpen ? `open-${initialData?.configKeyId || 'new'}` : 'closed'}
          initialData={initialData}
          categoryId={categoryId}
          categories={categories}
          onSuccess={onSuccess}
          onClose={onClose}
          isEdit={isEdit}
        />
      )}
    </Drawer>
  );
}
