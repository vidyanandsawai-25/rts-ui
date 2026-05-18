import { toast } from "sonner";
import { getDetailedRatesAction } from "@/app/[locale]/property-tax/rate-master/rvratemaster/action";
import type { ISelectOption } from "@/types/RVRateMaster";

/**
 * Escape CSV value for proper formatting
 */
function escapeCsvValue(value: unknown): string {
  if (value === null || value === undefined) return '';
  const str = String(value);
  if (str.includes(',') || str.includes('"') || str.includes('\n') || str.includes('\r')) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

/**
 * Download detailed rates as CSV file
 */
export async function downloadDetailedRates(
  selectedZone: string,
  zones: ISelectOption[],
  t: ReturnType<typeof import("next-intl").useTranslations>
) {
  if (!selectedZone || selectedZone === 'ALL') {
    toast.error(t('messages.selectRateSection'));
    return;
  }

  try {
    toast.loading(t('messages.downloadingRates'));
    const detailedRatesResponse = await getDetailedRatesAction(
      selectedZone, undefined, undefined, 1, -1
    );
    const allRates = ((detailedRatesResponse as { items?: unknown[] })?.items || []) as Array<{
      rateSection?: string;
      taxZone?: string;
      typeOfUseGroup?: string;
      yearRangeRV?: string;
      constructionType?: string;
      rateSquareMeter?: number;
      rateSquareFeet?: number;
      rateRemark?: string;
    }>;

    if (!allRates || allRates.length === 0) {
      toast.dismiss();
      toast.error(t('messages.noRatesAvailable'));
      return;
    }

    const headers = [
      t('downloadHeaders.rateSection'),
      t('downloadHeaders.taxZoneNo'),
      t('downloadHeaders.useGroup'),
      t('downloadHeaders.assessmentYearRange'),
      t('downloadHeaders.constructionType'),
      t('downloadHeaders.rateSqMtr'),
      t('downloadHeaders.rateSqFt'),
      t('downloadHeaders.rateRemark')
    ];

    const rows = allRates.map((rate) => [
      escapeCsvValue(rate.rateSection),
      escapeCsvValue(rate.taxZone),
      escapeCsvValue(rate.typeOfUseGroup),
      escapeCsvValue(rate.yearRangeRV),
      escapeCsvValue(rate.constructionType),
      escapeCsvValue(rate.rateSquareMeter),
      escapeCsvValue(rate.rateSquareFeet),
      escapeCsvValue(rate.rateRemark)
    ]);

    const csvContent = [
      headers.map((h) => escapeCsvValue(h)).join(','),
      ...rows.map((row) => row.join(','))
    ].join('\r\n');

    const BOM = '\uFEFF';
    const csvWithBOM = BOM + csvContent;

    const blob = new Blob([csvWithBOM], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    const zoneName = zones.find(z => z.value === selectedZone)?.label || selectedZone;
    const fileName = `Rate_Master_${zoneName}_AllUseGroups_AllYears_${new Date().toISOString().split('T')[0]}.csv`;

    link.setAttribute('href', url);
    link.setAttribute('download', fileName);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast.dismiss();
    toast.success(t('messages.ratesDownloaded'));
  } catch (_error) {
    toast.dismiss();
    toast.error(t('messages.downloadFailed'));
  }
}
