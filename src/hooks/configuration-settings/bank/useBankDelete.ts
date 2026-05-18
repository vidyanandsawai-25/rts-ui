'use client';

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { useConfirm } from '@/components/common/ConfirmProvider';
import { deleteBankAction } from '@/app/[locale]/configuration-settings/bank-master/actions';
import type { BankMasterData } from '@/types/bank-master.types';

interface UseBankDeleteProps {
  t: (key: string, values?: Record<string, string | number>) => string;
  startTransition: React.TransitionStartFunction;
}

export function useBankDelete({ t, startTransition }: UseBankDeleteProps) {
  const router = useRouter();
  const { confirm } = useConfirm();
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = useCallback(
    (row: BankMasterData) => {
      confirm({
        variant: 'delete',
        title: t('confirm.deleteTitle', { bankName: row.bankName ?? '' }),
        description: t('confirm.deleteDescription'),
        onConfirm: async () => {
          setIsDeleting(true);

          try {
            const response = await deleteBankAction(row.id);

            if (response.success) {
              toast.success(t('messages.deleteSuccess'));

              startTransition(() => {
                router.refresh();
              });

              return;
            }

            toast.error(t(response.error || 'messages.deleteFailed'));
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
