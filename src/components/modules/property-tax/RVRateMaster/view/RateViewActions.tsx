"use client";

import { DownloadButton, EditLabelButton, DeleteLabelButton, AddButton } from "@/components/common/ActionButtons";

interface RateViewActionsProps {
  onGenerateRate: () => void;
  onEditRate: () => void;
  onDeleteRate: () => void;
  onDownloadRates: () => void;
  isDownloadDisabled: boolean;
  isActionDisabled?: boolean;
  t: ReturnType<typeof import("next-intl").useTranslations>;
}

export function RateViewActions({
  onGenerateRate,
  onEditRate,
  onDeleteRate,
  onDownloadRates,
  isDownloadDisabled,
  isActionDisabled,
  t,
}: RateViewActionsProps) {
  return (
    <div className="flex flex-col md:flex-row gap-2 w-full md:w-auto md:shrink-0">
      {/* Download Rates Button */}
      <DownloadButton
        label={t('buttons.downloadRates')}
        onClick={onDownloadRates}
        disabled={isDownloadDisabled}
        size="sm"
        className="border border-green-400 text-green-600 bg-transparent hover:bg-green-50 w-full md:w-auto disabled:opacity-50 disabled:cursor-not-allowed"
      />
      <AddButton
        onClick={onGenerateRate}
        size="sm"
        label={t('buttons.generateRate')}
        disabled={isActionDisabled}
      />
      <EditLabelButton
        onClick={onEditRate}
        size="sm"
        label={t('buttons.editRates')}
        disabled={isActionDisabled}
      />
      <DeleteLabelButton
        onClick={onDeleteRate}
        size="sm"
        label={t('buttons.deleteRate')}
      />
    </div>
  );
}
