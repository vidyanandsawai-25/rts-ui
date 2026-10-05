'use client';
import type { NASubUnitMediaProps } from "@/types/asset/municipal-Asset/new-add-new-asset";

import { useTranslations } from "next-intl";



export function NASubUnitMedia(_props: NASubUnitMediaProps) {
  const t = useTranslations("addAssetForm");
  return (
    <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-500">
      {t("subUnits.mediaAttachments") || "Sub-unit media attachments are managed during configuration."}
    </div>
  );
}
