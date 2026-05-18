import { Column } from '@/components/common/MasterTable';
import { PropertyCombineDetails } from '@/types/combine-property.types';

export type PropertyRow = PropertyCombineDetails & Record<string, unknown>;

export const getCombinePropertyColumns = (
  t: (key: string) => string,
  reviewData: PropertyCombineDetails[]
): Column<PropertyRow>[] => [
  {
    key: 'propertyId',
    label: t('srNo'),
    align: 'center',
    width: '60px',
    render: (_val, _row, idx) => (
      <span className="text-gray-600 font-semibold text-[12px]">{idx + 1}</span>
    ),
  },
  {
    key: 'wardNo',
    label: t('ward'),
    align: 'center',
    width: '90px',
    render: (val) => (
      <span className="inline-flex items-center justify-center px-2 py-0.5 rounded-full bg-blue-600 text-white text-[10px] font-bold">
        {String(val ?? '-')}
      </span>
    ),
  },
  {
    key: 'propertyNo',
    label: t('propertyNo'),
    align: 'center',
    width: '100px',
    render: (val) => (
      <span className="inline-flex items-center justify-center w-9 h-9 rounded-full border-2 border-blue-400 text-blue-600 text-[11px] font-bold">
        {String(val ?? '-')}
      </span>
    ),
  },
  {
    key: 'partitionNo',
    label: t('partitionNo'),
    align: 'center',
    width: '100px',
    render: (val) => (
      <span className="inline-flex items-center justify-center px-2 py-0.5 rounded-full bg-slate-100 border border-slate-300 text-slate-600 text-[10px] font-bold">
        {String(val ?? '-')}
      </span>
    ),
  },
  {
    key: 'oldPropertyNo',
    label: t('oldPropertyNo'),
    align: 'center',
    width: '110px',
  },
  {
    key: 'ownerName',
    label: t('ownerName'),
    align: 'left',
    render: (val, _row, idx) => {
      // Highlight only if NOT same as first row
      const firstOwner = reviewData[0]?.ownerName;
      const isMismatch = idx > 0 && val !== firstOwner;
      return (
        <span className={isMismatch ? 'text-red-500 font-semibold' : 'text-gray-800 font-medium'}>
          {String(val ?? '-')}
        </span>
      );
    },
  },
  {
    key: 'occupierName',
    label: t('occupierName'),
    align: 'left',
    render: (val) => (
      <span className="text-gray-700">{String(val ?? '') || '—'}</span>
    ),
  },
  {
    key: 'taxAmount',
    label: t('currentTax'),
    align: 'right',
    width: '110px',
    render: (val) => (
      /* eslint-disable-next-line i18next/no-literal-string */
      <span className="font-semibold text-gray-800">
        ₹{Number(val ?? 0).toLocaleString('en-IN')}
      </span>
    ),
  },
  {
    key: 'pendingAmount',
    label: t('pendingTax'),
    align: 'right',
    width: '110px',
    render: (val) => (
      /* eslint-disable-next-line i18next/no-literal-string */
      <span className="font-semibold text-gray-800">
        ₹{Number(val ?? 0).toLocaleString('en-IN')}
      </span>
    ),
  },
];
