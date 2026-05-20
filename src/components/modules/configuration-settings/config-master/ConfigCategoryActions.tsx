'use client';

import { useTransition, useState } from 'react';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { Pencil, Trash2, CheckCircle2, XCircle } from 'lucide-react';
import { Button, useConfirm, useToast } from '@/components/common';
import { useTranslations } from 'next-intl';
import {
  deleteConfigCategoryAction,
  updateAllConfigKeysStatusByCategoryIdAction,
} from '@/app/[locale]/configuration-settings/config-master/actions';

interface CategoryContextProps {
  categoryId: string;
  categoryName: string;
}

export function CategoryEditDeleteActions({ categoryId, categoryName }: CategoryContextProps) {
  const t = useTranslations('configMaster');
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const { confirm: confirmAction } = useConfirm();
  const { success, error: toastError } = useToast();
  const [isPending, startTransition] = useTransition();
  const [activeAction, setActiveAction] = useState<'edit' | 'delete' | null>(null);

  const handleEditCategory = () => {
    setActiveAction('edit');
    startTransition(async () => {
      const params = new URLSearchParams(searchParams.toString());
      params.set('editCategory', categoryId);
      router.push(`${pathname}?${params.toString()}`, { scroll: false });
      setActiveAction(null);
    });
  };

  const handleDeleteCategory = () => {
    confirmAction({
      variant: 'delete',
      title: t('modals.deleteCategory.title'),
      description: t('modals.deleteCategory.desc', { name: categoryName }),
      onConfirm: () => {
        setActiveAction('delete');
        startTransition(async () => {
          const res = await deleteConfigCategoryAction(parseInt(categoryId));
          if (res.success) {
            success(res.message || t('messages.categoryDeleted') || 'Category deleted');
            // Clear active category so it defaults to next available
            const params = new URLSearchParams(searchParams.toString());
            if (params.get('categoryId') === categoryId) {
              params.delete('categoryId');
            }
            router.push(`${pathname}?${params.toString()}`, { scroll: false });
          } else {
            toastError(res.message || res.error || t('messages.deleteFailed') || 'Delete failed');
          }
          setActiveAction(null);
        });
      },
    });
  };

  return (
    <div className="flex items-center gap-0.5 sm:gap-1 pl-1.5 sm:pl-2 ml-1.5 sm:ml-2 border-l border-slate-200 dark:border-slate-800">
      <Button
        variant="ghost"
        size="xs"
        icon={isPending && activeAction === 'edit' ? undefined : Pencil}
        disabled={isPending}
        isLoading={isPending && activeAction === 'edit'}
        className="h-8 w-8 sm:h-9 sm:w-9 p-0 text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 cursor-pointer"
        onClick={handleEditCategory}
        title="Edit Category"
      />
      <Button
        variant="ghost"
        size="xs"
        icon={isPending && activeAction === 'delete' ? undefined : Trash2}
        disabled={isPending}
        isLoading={isPending && activeAction === 'delete'}
        className="h-8 w-8 sm:h-9 sm:w-9 p-0 text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/20 cursor-pointer"
        onClick={handleDeleteCategory}
        title="Delete Category"
      />
    </div>
  );
}

export function CategoryBulkActions({ categoryId, categoryName }: CategoryContextProps) {
  const t = useTranslations('configMaster');
  const router = useRouter();
  const { confirm: confirmAction } = useConfirm();
  const { success, error: toastError, info: toastInfo } = useToast();
  const [isPending, startTransition] = useTransition();
  const [activeAction, setActiveAction] = useState<'enable' | 'disable' | null>(null);

  const handleBulkToggle = (enable: boolean): void => {
    confirmAction({
      title: enable ? t('list.enableAllTitle') : t('list.disableAllTitle'),
      description: enable
        ? t('list.enableAllDesc', { category: categoryName })
        : t('list.disableAllDesc', { category: categoryName }),
      confirmText: enable ? t('list.confirmEnable') : t('list.confirmDisable'),
      cancelText: t('modals.departmentConfig.buttons.cancel'),
      variant: enable ? 'add' : 'delete',
      onConfirm: () => {
        toastInfo(
          enable
            ? t('messages.enablingCategory') || 'Enabling...'
            : t('messages.disablingCategory') || 'Disabling...'
        );

        setActiveAction(enable ? 'enable' : 'disable');
        startTransition(async () => {
          const result = await updateAllConfigKeysStatusByCategoryIdAction(
            parseInt(categoryId),
            enable
          );

          if (result.success) {
            success(result.message || '');
            router.refresh();
          } else {
            toastError(result.error || t('messages.saveFailed'));
          }
          setActiveAction(null);
        });
      },
    });
  };

  return (
    <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto no-scrollbar pb-1 sm:pb-0">
      <Button
        variant="secondary"
        size="xs"
        icon={isPending && activeAction === 'enable' ? undefined : CheckCircle2}
        disabled={isPending}
        isLoading={isPending && activeAction === 'enable'}
        className="h-8 text-[10px] sm:text-xs gap-1.5 text-emerald-600 border-emerald-500/30 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 bg-white dark:bg-slate-900 font-black uppercase tracking-widest px-3 rounded-lg border-2 shadow-sm shadow-emerald-100/50 cursor-pointer"
        onClick={() => handleBulkToggle(true)}
      >
        {t('list.enableAll') || 'Enable'}
      </Button>
      <Button
        variant="secondary"
        size="xs"
        icon={isPending && activeAction === 'disable' ? undefined : XCircle}
        disabled={isPending}
        isLoading={isPending && activeAction === 'disable'}
        className="h-8 text-[10px] sm:text-xs gap-1.5 text-rose-600 border-rose-500/30 hover:bg-rose-50 dark:hover:bg-rose-900/20 bg-white dark:bg-slate-900 font-black uppercase tracking-widest px-3 rounded-lg border-2 shadow-sm shadow-rose-100/50 cursor-pointer"
        onClick={() => handleBulkToggle(false)}
      >
        {t('list.disableAll') || 'Disable'}
      </Button>
    </div>
  );
}
