import { getTranslations } from 'next-intl/server';
import { FloorDetailsTable } from '@/components/common';
import { ShowTaxOnExpand } from '@/components/modules/property-tax/ptis/ShowTaxOnExpand';
import {
  buildExpandHref,
  getCapitalColumns,
  getCapitalItems,
  mapCapitalRow,
} from '@/components/modules/property-tax/ptis/capital/CapitalColumns';
import type { CapitalValueResponse, CapitalRow } from '@/types/capitalValue.types';
import { parseExpandedRowIds } from '@/lib/utils/ptis';
import { PTIS_TABLE_PRESETS } from '@/components/modules/property-tax/ptis/constants';

interface Props {
  capitalData: CapitalValueResponse | null;
  searchParams: Record<string, string | string[] | undefined>;
  locale: string;
}

export async function CapitalTaxTable({ capitalData, searchParams, locale }: Props) {
  const t = await getTranslations({ locale, namespace: 'ptis.modules.PtisTaxDetails' });
  const rootT = await getTranslations({ locale, namespace: 'ptis' });
  const items = getCapitalItems(capitalData);
  const rows = items.map(mapCapitalRow);
  const expandedRowIds = parseExpandedRowIds(searchParams.capitalExpand);

  return (
    <div className={PTIS_TABLE_PRESETS.container}>
      <FloorDetailsTable
        data={rows}
        columns={getCapitalColumns(rootT)}
        emptyMessage={t('noCapitalRows')}
        expandedLabel={t('viewTaxBreakdown')}
        expandedRowIds={expandedRowIds}
        getExpandHref={(row) => buildExpandHref(searchParams, row.id, expandedRowIds)}
        tableClassName="w-full min-w-[1400px]"
        headerBadgeClassName={PTIS_TABLE_PRESETS.headerBadge}
        cellClassName={PTIS_TABLE_PRESETS.cellText}
        renderExpanded={(row: CapitalRow) => <ShowTaxOnExpand locale={locale} taxes={row.taxes} />}
      />
    </div>
  );
}
