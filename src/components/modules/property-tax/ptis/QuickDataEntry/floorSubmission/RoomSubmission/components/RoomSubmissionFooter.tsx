import React from "react";
import { useTranslations } from "next-intl";
import { SaveButton, CancelButton } from "@/components/common";

interface RoomSubmissionFooterProps {
  onSave: () => void;
  onClose: () => void;
  isSaving: boolean;
  canSave: boolean;
}

export const RoomSubmissionFooter: React.FC<RoomSubmissionFooterProps> = ({
  onSave, onClose, isSaving, canSave
}) => {
  const t = useTranslations("quickDataEntry");

  return (
    <div className="flex justify-center gap-3 p-4 border-t border-gray-200 bg-white rounded-b-2xl">
      <SaveButton
        onClick={onSave}
        disabled={!canSave || isSaving}
        isLoading={isSaving}
        label={isSaving ? t("roomSubmission.updating") : t("roomSubmission.saveData")}
        className="px-10 h-10 font-bold"
      />
      <CancelButton
        onClick={onClose}
        label={t("roomSubmission.close")}
        className="px-8 h-10 font-semibold"
      />
    </div>
  );
};
