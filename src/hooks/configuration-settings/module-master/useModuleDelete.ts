'use client';

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { useConfirm } from '@/components/common/ConfirmProvider';
import { deleteModuleMasterAction } from '@/app/[locale]/configuration-settings/module-master/actions';
import type { ModuleMaster } from '@/types/moduleMaster.types';

interface UseModuleDeleteProps {
  t: (key: string, values?: Record<string, string | number>) => string;
  startTransition: React.TransitionStartFunction;
}

export function useModuleDelete({ t, startTransition }: UseModuleDeleteProps) {
  const router = useRouter();
  const { confirm } = useConfirm();
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = useCallback(
    (row: ModuleMaster) => {
      confirm({
        variant: 'delete',
        title: t('confirm.deleteTitle', { moduleName: row.moduleName ?? '' }),
        description: t('confirm.deleteDescription'),
        onConfirm: async () => {
          setIsDeleting(true);

          try {
            const response = await deleteModuleMasterAction(row.moduleId);

            if (response.success) {
              toast.success(t('messages.deleteSuccess'));

              startTransition(() => {
                router.refresh();
              });

              return;
            }

            const errorKey = response.error || 'messages.deleteFailed';
            const isTranslationKey =
              errorKey.includes('.') &&
              !errorKey.trim().startsWith('{') &&
              !errorKey.includes(' ') &&
              !errorKey.includes('"');
            toast.error(isTranslationKey ? t(errorKey) : errorKey);
          } catch {
            toast.error(t('messages.deleteFailed'));
          } finally {
            setIsDeleting(false);
          }
        },
      });
    },
    [confirm, router, startTransition, t]
  );

  return { handleDelete, isDeleting };
}
