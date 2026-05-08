'use client';

import React from 'react';
import { useTranslations } from 'next-intl';
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

export const CapitalTaxTable: React.FC<Props> = ({ capitalData, searchParams, locale }) => {
  const t = useTranslations('ptis.modules.PtisTaxDetails');
  const rootT = useTranslations('ptis');
  const items = getCapitalItems(capitalData);
  const rows = items.map(mapCapitalRow);
  
  const expandedParam = Array.isArray(searchParams.capitalExpand) 
    ? searchParams.capitalExpand[searchParams.capitalExpand.length - 1] 
    : searchParams.capitalExpand;
    
  const expandedRowIds = parseExpandedRowIds(expandedParam);

  return (
    <div className={PTIS_TABLE_PRESETS.container}>
      <FloorDetailsTable
        data={rows}
        columns={getCapitalColumns(rootT as any)}
        emptyMessage={t('noCapitalRows')}
        expandedLabel={t('viewTaxBreakdown')}
        expandedRowIds={expandedRowIds}
        getExpandHref={(row) => buildExpandHref(searchParams as any, row.id, expandedRowIds)}
        tableClassName="w-full min-w-[1400px]"
        headerBadgeClassName={PTIS_TABLE_PRESETS.headerBadge}
        cellClassName={PTIS_TABLE_PRESETS.cellText}
        renderExpanded={(row: CapitalRow) => <ShowTaxOnExpand locale={locale} taxes={row.taxes} />}
      />
    </div>
  );
};
