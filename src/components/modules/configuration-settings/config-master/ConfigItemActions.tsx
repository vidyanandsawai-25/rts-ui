'use client';

import { useTransition, useState } from 'react';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { Pencil, Menu } from 'lucide-react';
import { Button } from '@/components/common';
import { useTranslations } from 'next-intl';
import { cn } from '@/lib/utils/cn';
import { useActivePagePermissions } from '@/hooks/useActivePagePermissions';

interface ConfigItemActionsProps {
  id: string;
  configKeyId: number;
  isEnabled: boolean;
}

export function ConfigItemActions({ id, configKeyId, isEnabled }: ConfigItemActionsProps) {
  const t = useTranslations('configMaster');
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const [isPending, startTransition] = useTransition();
  const [activeAction, setActiveAction] = useState<'edit' | 'delete' | 'config' | null>(null);
  
  const { canEdit, haveFullAccess } = useActivePagePermissions();
  const showEdit = canEdit || haveFullAccess;

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
      {showEdit && (
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
