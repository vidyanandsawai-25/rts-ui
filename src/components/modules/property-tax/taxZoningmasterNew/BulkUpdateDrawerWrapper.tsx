"use client";

import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { Drawer } from "@/components/common/Drawer";
import BulkUpdateDrawer from "./BulkUpdateDrawer";
import { useTaxZoningRangeFile } from "@/hooks/taxZoningRange/useTaxZoningRangeFile";
import { useTaxZoningRangeActions } from "@/hooks/taxZoningRange/useTaxZoningRangeActions";
import { TaxZone, Ward } from "@/types/taxZoningRange.types";

interface WrapperProps {
  wardsData: Ward[];
  taxZones: TaxZone[];
}

export default function BulkUpdateDrawerWrapper({ wardsData, taxZones }: WrapperProps) {
  const router = useRouter();
  const t = useTranslations("taxZoningRange");

  const {
    rows,
    fileName,
    importing,
    hasValidRows,
    hasInvalidRows,
    handleDownloadTemplate,
    handleImportFile,
    toCreatePayloads,
  } = useTaxZoningRangeFile(t, wardsData, taxZones, []);

  const { saving, handleBulkApply } = useTaxZoningRangeActions(t);

  const onApply = async () => {
    const payloads = toCreatePayloads();
    await handleBulkApply(payloads, () => router.back());
  };

  return (
    <Drawer
      open={true}
      onClose={() => router.back()}
      width="lg"
      hideHeader={true}
      bodyClassName="bg-[#f5f8fc] p-0 overflow-hidden"
    >
      <BulkUpdateDrawer
        onClose={() => router.back()}
        onDownloadTemplate={handleDownloadTemplate}
        onImportFile={handleImportFile}
        fileName={fileName}
        rows={rows}
        hasValidRows={hasValidRows}
        hasInvalidRows={hasInvalidRows}
        importing={importing}
        saving={saving}
        onApply={onApply}
      />
    </Drawer>
  );
}
