import React from 'react';
import { AddButton } from '@/components/common';

interface KycFormActionsProps {
  t: (key: string) => string;
  isUpdating: boolean;
  hasChanges: boolean;
  canSubmit: boolean;
}

export const KycFormActions: React.FC<KycFormActionsProps> = ({
  t,
  isUpdating,
  hasChanges,
  canSubmit,
}) => {
  return (
    <div className="flex justify-end space-x-2 mt-4">
      <AddButton
        label={isUpdating ? t('footer.saving') : t('commonbuttonmessages.UpdateChanges')}
        type="submit"
        isLoading={isUpdating}
        disabled={isUpdating || !hasChanges || !canSubmit}
      />
    </div>
  );
};
