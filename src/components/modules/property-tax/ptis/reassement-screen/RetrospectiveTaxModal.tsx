'use client';

import { useTranslations } from 'next-intl';
import { Modal } from '@/components/common/Modal';
import { MasterTable } from '@/components/common';
import type { Column } from '@/components/common/MasterTable';
import type {
  MappedRetrospectiveColumn,
  MappedRetrospectiveRow,
} from '@/types/reassessment.types';
import { cn } from '@/lib/utils/cn';

interface RetrospectiveTaxModalProps {
  open: boolean;
  onClose: () => void;
  columns?: MappedRetrospectiveColumn[];
  rows?: MappedRetrospectiveRow[];
  error?: string;
}

const formatAmount = (value: unknown): string => {
    const numberValue = typeof value === 'number' ? value : Number(value ?? 0);
    return numberValue.toLocaleString('en-IN');
};

export function RetrospectiveTaxModal({ 
  open, 
  onClose, 
  columns = [],
  rows = [],
  error,
}: RetrospectiveTaxModalProps) {
  // Translations
  const t = useTranslations('reassessment');
  
  const dynamicTaxColumns: Column<MappedRetrospectiveRow>[] = columns.map((column) => ({
    key: column.key,
    label: column.label,
    width: '110px',
    align: 'center',
    render: (value) => formatAmount(value),
  }));

  const retroTaxColumns: Column<MappedRetrospectiveRow>[] = [
    {
      key: 'financeYear',
      label: t('retrospectiveModal.columns.financeYear'),
      width: '110px',
      align: 'center',
      cellClassName: 'font-bold text-slate-800',
    },
    {
      key: 'days',
      label: t('retrospectiveModal.columns.days'),
      width: '70px',
      align: 'center',
    },
    ...dynamicTaxColumns,
    {
      key: 'total',
      label: t('retrospectiveModal.columns.total'),
      width: '100px',
      align: 'right',
      headerClassName: 'bg-sky-50/50 font-extrabold text-sky-950 pr-3',
      cellClassName: 'bg-sky-50/20 font-black text-sky-900 pr-3',
      render: (value) => formatAmount(value),
    },
  ];

  const modalFooter = (
    <button
      onClick={onClose}
      className="px-4 py-2 text-sm font-medium text-gray-600 bg-gray-100 rounded-lg border border-gray-200 hover:bg-gray-200 transition-colors"
    >
      {t('buttons.close')}
    </button>
  );

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={t('retrospectiveModal.title')}
      subtitle={t('retrospectiveModal.subtitle')}
      maxWidth="2xl"
      footer={modalFooter}
    >
      <div className="border border-sky-100 rounded-xl overflow-hidden shadow-sm">
        <div className="min-w-0">
          {error ? (
            <div className="px-4 py-8 text-center text-sm text-red-600">
              {error}
            </div>
          ) : rows.length === 0 ? (
            <div className="px-4 py-8 text-center text-sm text-slate-500">
              {t('retrospectiveModal.noData')}
            </div>
          ) : (
            <MasterTable
              columns={retroTaxColumns}
              data={rows}
              paginationConfig={{ enabled: false }}
              tableClassName="w-full border-collapse text-xs text-center font-mono"
              theadClassName="bg-slate-50 font-bold text-slate-800 border-b border-sky-100 [&_th]:p-2 [&_th]:border-r [&_th]:border-sky-100"
              rowClassName={(row) => cn(
                'hover:bg-slate-50/50 [&_td]:p-2 [&_td]:border-r [&_td]:border-sky-100',
                Number(row.total ?? 0) > 0 ? 'text-slate-800' : 'text-slate-500'
              )}
              height="xl"
            />
          )}
        </div>
      </div>
    </Modal>
  );
}