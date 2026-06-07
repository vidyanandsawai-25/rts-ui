"use client";

import { AlertTriangle } from "lucide-react";

interface RateFrequencyMismatchBannerProps {
  configuredFrequency: "Monthly" | "Yearly";
  existingFrequency: "Monthly" | "Yearly";
  t: ReturnType<typeof import("next-intl").useTranslations>;
}

export function RateFrequencyMismatchBanner({
  configuredFrequency,
  existingFrequency,
  t,
}: RateFrequencyMismatchBannerProps) {
  return (
    <div className="bg-orange-50 border border-orange-300 rounded-lg px-4 py-3 flex items-start gap-3 mb-3">
      <AlertTriangle className="w-5 h-5 text-orange-600 shrink-0 mt-0.5" />
      <div className="flex-1">
        <p className="text-sm text-orange-800 leading-relaxed">
          {t('messages.rateFrequencyMismatch', {
            configured: configuredFrequency,
            existing: existingFrequency,
          })}
        </p>
      </div>
    </div>
  );
}
