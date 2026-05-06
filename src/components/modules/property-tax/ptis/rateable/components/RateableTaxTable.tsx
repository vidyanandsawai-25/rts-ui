import { getTranslations } from 'next-intl/server';
import { FloorDetailsTable } from '@/components/common';
import { ShowTaxOnExpand } from '@/components/modules/property-tax/ptis/ShowTaxOnExpand';
import {
  buildExpandHref,
  getRateableColumns,
  getRateableDetails,
  mapRateableRow,
} from '@/components/modules/property-tax/ptis/rateable/RateableColumns';
import type { RateableValueResponse, RateableRow } from '@/types/rateableValue.types';
import { parseExpandedRowIds } from '@/lib/utils/ptis';
import { PTIS_TABLE_PRESETS } from '@/components/modules/property-tax/ptis/constants';

interface RateableTaxTableProps {
  rateableData: RateableValueResponse | null;
  searchParams: Record<string, string | string[] | undefined>;
  locale: string;
}

export async function RateableTaxTable({ rateableData, searchParams, locale }: RateableTaxTableProps) {
  const t = await getTranslations({ locale, namespace: 'ptis.modules.PtisTaxDetails' });
  const rootT = await getTranslations({ locale, namespace: 'ptis' });
  const details = getRateableDetails(rateableData);
  const rows = details.map(mapRateableRow);
  const expandedRowIds = parseExpandedRowIds(searchParams.rateableExpand);

  return (
    <div className={PTIS_TABLE_PRESETS.container}>
      <FloorDetailsTable
        data={rows}
        columns={getRateableColumns(rootT)}
        emptyMessage={t('noRateableRows')}
        expandedLabel={t('viewTaxBreakdown')}
        expandedRowIds={expandedRowIds}
        getExpandHref={(row) => buildExpandHref(searchParams, row.id, expandedRowIds)}
        tableClassName="w-full min-w-[1500px]"
        headerBadgeClassName={PTIS_TABLE_PRESETS.headerBadge}
        cellClassName={PTIS_TABLE_PRESETS.cellText}
        renderExpanded={(row: RateableRow) => <ShowTaxOnExpand locale={locale} taxes={row.taxes} />}
      />
    </div>
  );
}
