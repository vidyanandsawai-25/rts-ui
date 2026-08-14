"use client";

import { Modal } from "@/components/common/Modal";
import { Button, Input } from "@/components/common";
import { useState } from "react";

interface RemarksConfirmationModalProps {
  open: boolean;
  onClose: () => void;
  onConfirm: (remarks: string) => void;
  title?: string;
  t: (key: string) => string;
}

export function RemarksConfirmationModal({
  open,
  onClose,
  onConfirm,
  title,
  t,
}: RemarksConfirmationModalProps) {
  const [remarks, setRemarks] = useState("");

  const handleConfirm = () => {
    onConfirm(remarks);
    setRemarks(""); // Reset for next time
  };

  const handleSkip = () => {
    onConfirm("");
    setRemarks(""); // Reset for next time
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={title || t("excelUpload.remarksModal.title")}
    >
      <div className="p-5 space-y-4">
        <div>
          <Input
            label={t("excelUpload.remarksModal.remarkLabel")}
            value={remarks}
            onChange={(e) => setRemarks(e.target.value)}
            placeholder={t("excelUpload.remarksModal.remarkPlaceholder")}
            className="w-full"
          />
        </div>
        <div className="flex justify-end gap-3 mt-6">
          <Button onClick={handleSkip} className="px-4 py-2 text-sm font-medium">
            {t("excelUpload.remarksModal.skipBtn")}
          </Button>
          <Button variant="primary" onClick={handleConfirm} className="px-4 py-2 text-sm font-medium">
            {t("excelUpload.remarksModal.confirmBtn")}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
