import { Building2 } from "lucide-react";

interface RateMasterFormHeaderProps {
  id?: string | null;
  t: ReturnType<typeof import("next-intl").useTranslations>;
}

/**
 * Form header component for rate master form
 */
export function RateMasterFormHeader({ id, t }: RateMasterFormHeaderProps) {
  return (
    <div className="mb-3 bg-[#f5f8fd] rounded-t-xl border-b-4 border-blue-500">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-start gap-3">
          <div className="h-8 w-8 rounded-lg bg-[#d1d9e4] text-white flex items-center justify-center">
            <Building2 size={24} />
          </div>
          <div>
            <h1 className="text-xl font-bold text-blue-700">
              {id ? t('messages.editRateDetails') : t('messages.generateNewRateDetails')}
            </h1>
            <p className="text-xs text-gray-600 mt-0.5">
              {id ? t('messages.updateRateDetails') : t('messages.fillRateDetails')}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
