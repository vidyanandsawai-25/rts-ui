"use client";

import { UploadCloud, Plus } from "lucide-react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/common";
import type { NAAssetMediaProps } from "@/types/asset/municipal-Asset/new-add-new-asset/new-add-new-asset-page.types";

/**
 * NAAssetMedia / NAAssetMediaSkeleton
 *
 * Lightweight visual placeholder skeleton box for the Asset Media card on Step 1.
 * Intentionally self-contained with no external upload/photo API dependencies for PR1.
 * Matches the exact original card height (max-h-[390px]) and layout.
 */
export function NAAssetMedia({ currentStep: _currentStep }: NAAssetMediaProps = {}) {
  const t = useTranslations("newAddNewAsset");

  return (
    <div
      id="na-asset-media-container"
      className="bg-[#FFF9F2] rounded-xl shadow-sm border border-orange-300 flex flex-col h-full max-h-[390px] overflow-hidden relative"
    >
      {/* Card header */}
      <div className="px-4 py-2 border-b border-orange-100 flex items-center gap-2 bg-[#FFF9F2] shrink-0">
        <svg
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="#EA580C"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
          <circle cx="8.5" cy="8.5" r="1.5" />
          <polyline points="21 15 16 10 5 21" />
        </svg>
        <h3 className="text-xs font-bold text-slate-800">{t("assetMedia.title")}</h3>
      </div>

      {/* Card content: 2 horizontal sections */}
      <div className="p-1 flex flex-col gap-1 flex-1 overflow-hidden min-h-0">
        {/* ── Section A: Asset Photo ── */}
        <div className="flex gap-1 h-[148px] shrink-0 w-full px-0.5 pt-0.5">
          {/* Main preview box */}
          <div className="flex-1 bg-white border border-slate-200 rounded-lg p-1 relative flex items-center justify-center overflow-hidden shadow-sm">
            <div className="w-full h-full flex flex-col items-center justify-center border-2 border-dashed border-slate-200 rounded-lg bg-slate-50/50 p-4">
              <UploadCloud className="w-7 h-7 text-slate-400" />
              <span className="text-[10px] font-bold text-slate-500 mt-2 text-center leading-tight">
                {t("assetMedia.noImageUploaded")}
              </span>
            </div>

            {/* Absolute overlay elements */}
            <div className="absolute top-2 left-2 bg-[#101b87]/80 text-white text-[9px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded shadow-sm pointer-events-none select-none">
              {t("assetMedia.assetPhoto")}
            </div>
            <Button
              variant="ghost"
              type="button"
              disabled
              aria-disabled="true"
              className="!absolute top-2 right-2 !bg-white/90 !text-slate-400 !text-[8.5px] !font-black !uppercase !px-2 !py-0.5 !rounded shadow-sm !border !border-slate-200 cursor-not-allowed select-none !h-auto !min-w-0 opacity-60"
            >
              {t("assetMedia.upload")}
            </Button>
          </div>

          {/* Vertical rail of placeholder thumbnails (72px wide) */}
          <div className="flex flex-col w-[72px] shrink-0 h-full overflow-hidden justify-between">
            <div className="flex-grow flex-1 flex flex-col gap-1.5 overflow-y-auto overflow-x-hidden scrollbar-thin scrollbar-thumb-slate-200 scrollbar-track-transparent pr-1 min-h-0">
              {Array.from({ length: 3 }).map((_, i) => (
                <div
                  key={i}
                  className="w-[60px] h-[46px] rounded border border-slate-100 bg-slate-50/30 shrink-0"
                />
              ))}
            </div>

            {/* Dotted Upload square tile fixed at the bottom */}
            <div className="w-[60px] h-[46px] rounded border-2 border-dashed border-slate-300 flex items-center justify-center shrink-0 mt-1.5 bg-white">
              <Plus className="w-4.5 h-4.5 text-slate-400" />
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="h-px bg-orange-200 shrink-0 mx-1" />

        {/* ── Section B: Asset Photo Plan ── */}
        <div className="flex-grow flex-1 flex flex-col gap-1 w-full px-0.5 pb-0.5 min-h-0">
          <div className="relative bg-white border border-slate-200 rounded-lg overflow-hidden flex flex-col shadow-sm flex-grow flex-1 min-h-0">
            <div className="w-full flex items-center justify-center bg-white p-1 relative flex-grow flex-1 min-h-0">
              <div className="w-full h-full flex flex-col items-center justify-center border-2 border-dashed border-slate-200 rounded-lg bg-slate-50/50 p-4">
                <UploadCloud className="w-7 h-7 text-slate-400" />
                <span className="text-[10px] font-bold text-slate-500 mt-2 text-center leading-tight">
                  {t("assetMedia.noPlanUploaded")}
                </span>
              </div>

              {/* Absolute overlay elements inside the drawing space */}
              <div className="absolute top-1.5 left-1.5 bg-[#101b87]/80 text-white text-[9px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded shadow-sm pointer-events-none select-none z-10">
                {t("assetMedia.assetPhotoPlan")}
              </div>
              <Button
                variant="ghost"
                type="button"
                disabled
                aria-disabled="true"
                className="!absolute top-1.5 right-1.5 !bg-white/90 !text-slate-400 !text-[8.5px] !font-black !uppercase !px-2 !py-0.5 !rounded shadow-sm !border !border-slate-200 cursor-not-allowed select-none z-10 !h-auto !min-w-0 opacity-60"
              >
                {t("assetMedia.uploadPlan")}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export const NAAssetMediaSkeleton = NAAssetMedia;
