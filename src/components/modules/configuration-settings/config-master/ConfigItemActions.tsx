'use client';

import { useTransition, useState } from 'react';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { Pencil, Trash2, Menu } from 'lucide-react';
import { Button, useConfirm, useToast } from '@/components/common';
import { useTranslations } from 'next-intl';
import { deleteConfigKeyAction } from '@/app/[locale]/configuration-settings/config-master/actions';
import { cn } from '@/lib/utils/cn';
import { usePermissions } from '@/hooks/usePermissions';

interface ConfigItemActionsProps {
  id: string;
  configKeyId: number;
  name: string;
  isEnabled: boolean;
}

export function ConfigItemActions({ id, configKeyId, name, isEnabled }: ConfigItemActionsProps) {
  const t = useTranslations('configMaster');
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const { confirm: confirmAction } = useConfirm();
  const { success: toastSuccess, error: toastError } = useToast();
  const [isPending, startTransition] = useTransition();
  const [activeAction, setActiveAction] = useState<'edit' | 'delete' | 'config' | null>(null);

  const { canEdit, canDelete, haveFullAccess } = usePermissions('CONFIG_MASTER');
  const showEdit = canEdit || canDelete || haveFullAccess;
  const showDelete = canDelete || haveFullAccess;

  const handleEditKey = (e: React.MouseEvent) => {
    e.stopPropagation();
    setActiveAction('edit');
    startTransition(async () => {
      const params = new URLSearchParams(searchParams.toString());
      params.set('editKey', id);
      router.push(`${pathname}?${params.toString()}`, { scroll: false });
      setActiveAction(null);
    });
  };

  const handleDeleteKey = (e: React.MouseEvent) => {
    e.stopPropagation();
    confirmAction({
      variant: 'delete',
      title: t('modals.deleteKey.title'),
      description: t('modals.deleteKey.desc', { name }),
      onConfirm: () => {
        setActiveAction('delete');
        startTransition(async () => {
          const res = await deleteConfigKeyAction(configKeyId);
          if (res.success) {
            toastSuccess(t('messages.keyDeleted') || res.message || 'Key deleted');
            router.refresh();
          } else {
            toastError(res.error || res.message || t('messages.deleteFailed') || 'Delete failed');
          }
          setActiveAction(null);
        });
      },
    });
  };

  const handleConfigClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isEnabled) return;
    setActiveAction('config');
    startTransition(async () => {
      const params = new URLSearchParams(searchParams.toString());
      params.set('configKeyId', configKeyId.toString());
      router.push(`${pathname}?${params.toString()}`, { scroll: false });
      setActiveAction(null);
    });
  };

  return (
    <div className="flex flex-row items-center gap-2 sm:gap-4 md:gap-5 justify-between md:justify-end w-full md:w-auto mt-1 sm:mt-2 md:mt-0 pt-2 sm:pt-3 md:pt-0 border-t md:border-t-0 border-slate-100">
      {(showEdit || showDelete) && (
        <div className="flex items-center gap-0.5 sm:gap-1">
          {showEdit && (
            <Button
              variant="ghost"
              size="xs"
              icon={isPending && activeAction === 'edit' ? undefined : Pencil}
              disabled={isPending}
              isLoading={isPending && activeAction === 'edit'}
              className="h-9 w-9 sm:h-10 sm:w-10 p-0 text-slate-400 hover:text-blue-600 hover:bg-blue-50 cursor-pointer"
              onClick={handleEditKey}
              title="Edit Key"
            />
          )}
          {showDelete && (
            <Button
              variant="ghost"
              size="xs"
              icon={isPending && activeAction === 'delete' ? undefined : Trash2}
              disabled={isPending}
              isLoading={isPending && activeAction === 'delete'}
              className="h-9 w-9 sm:h-10 sm:w-10 p-0 text-slate-400 hover:text-rose-600 hover:bg-rose-50 cursor-pointer"
              onClick={handleDeleteKey}
              title="Delete Key"
            />
          )}
        </div>
      )}

      <div className="flex items-center gap-3 shrink-0">
        <Button
          variant="secondary"
          size="sm"
          icon={isPending && activeAction === 'config' ? undefined : Menu}
          onClick={handleConfigClick}
          disabled={!haveFullAccess || !isEnabled || isPending}
          isLoading={isPending && activeAction === 'config'}
          className={cn(
            'h-8 sm:h-9 min-w-0 sm:min-w-[90px] text-[10px] sm:text-xs font-semibold gap-1.5 sm:gap-2 px-2 sm:px-4 shadow-sm transition-all cursor-pointer',
            haveFullAccess && isEnabled
              ? 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
              : 'bg-slate-50 text-slate-400 border-slate-100'
          )}
        >
          <span className="hidden min-[450px]:inline">{t('list.config')}</span>
        </Button>
      </div>
    </div>
  );
}
