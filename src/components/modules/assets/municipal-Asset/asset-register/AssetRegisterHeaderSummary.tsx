import { Building2Icon, Coins, CheckCircle2 } from 'lucide-react';
import { CardContent } from '@/components/common';
import type { AssetRegisterHeaderSummaryProps } from '@/types/asset/asset-register/municipal-asset-register.types';
import { cn } from '@/lib/utils/cn';
import { formatIndianCurrencyAbbreviated } from '@/lib/utils/asset-utils/currency-format';

interface CenteredSummaryCardProps {
  label: string;
  value: string | number;
  icon?: React.ReactNode;
  iconBg?: string;
  valueColor?: string;
}

function CenteredSummaryCard({
  label,
  value,
  icon,
  iconBg = "bg-slate-100 text-slate-700",
  valueColor = "text-slate-900",
}: CenteredSummaryCardProps) {
  return (
    <div className="relative flex items-center justify-center text-center rounded-md bg-white px-4 py-2.5 border border-slate-300 shadow-[0_1px_2px_rgba(0,0,0,0.05)]">
      {/* Accent bar */}
      <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#1A86E8] rounded-l-md" />

      {/* Row with Icon, Label, and Value */}
      <div className="flex items-center justify-center gap-2 w-full flex-wrap">
        {icon && (
          <div className={cn("h-7 w-7 rounded flex items-center justify-center border border-slate-300 flex-shrink-0 [&_svg]:h-4 [&_svg]:w-4", iconBg)}>
            {icon}
          </div>
        )}
        <span className="text-sm font-semibold text-slate-600">{label}:</span>
        <span className={cn("text-sm font-bold", valueColor)}>{value}</span>
      </div>
    </div>
  );
}

export function AssetRegisterHeaderSummary({
  totalCount,
  totalCapitalValue,
  activeAssetsCount,
  translate,
}: AssetRegisterHeaderSummaryProps) {
  return (
    <CardContent className="border-t border-slate-200 p-0 bg-slate-50/50">
      <div className="grid grid-cols-1 gap-4 px-4 py-4 sm:grid-cols-2 lg:grid-cols-3">
        <CenteredSummaryCard
          label={translate('Total_Assets') || 'Total Assets'}
          value={totalCount}
          icon={<Building2Icon className="h-5 w-5" />}
          iconBg="bg-blue-50 text-blue-600 border-blue-100"
        />
        <CenteredSummaryCard
          label={translate('Capital_Value') || 'Capital Value'}
          value={formatIndianCurrencyAbbreviated(totalCapitalValue)}
          valueColor="text-emerald-600"
          icon={<Coins className="h-5 w-5" />}
          iconBg="bg-emerald-50 text-emerald-600 border-emerald-100"
        />
        <CenteredSummaryCard
          label={translate('Active_Assets') || 'Active Assets'}
          value={activeAssetsCount}
          valueColor="text-blue-600"
          icon={<CheckCircle2 className="h-5 w-5" />}
          iconBg="bg-sky-50 text-sky-600 border-sky-100"
        />
      </div>
    </CardContent>
  );
}
