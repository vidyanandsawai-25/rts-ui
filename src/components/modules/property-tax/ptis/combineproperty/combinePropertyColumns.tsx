import { Column } from '@/components/common/MasterTable';
import { PropertyCombineDetails } from '@/types/combine-property.types';
import { Checkbox } from '@/components/common/checkbox';
import { PreviewButton } from '@/components/common/ActionButtons';

export type PropertyRow = PropertyCombineDetails & Record<string, unknown>;

export const getCombinePropertyColumns = (
  t: (key: string) => string,
  reviewData: PropertyCombineDetails[],
  checkedPropertyIds?: Set<number>,
  onToggleCheck?: (propertyId: number) => void,
  onToggleAll?: () => void,
  selectedBasePropertyId?: string
): Column<PropertyRow>[] => [
  // Checkbox column — uses '_checkbox' key to avoid duplicate with 'propertyId' SR.NO. column
  {
    key: '_checkbox' as keyof PropertyRow,
    label: (
      <Checkbox
        checked={!!checkedPropertyIds && checkedPropertyIds.size === reviewData.length && reviewData.length > 0}
        onCheckedChange={() => onToggleAll?.()}
        aria-label="Select all properties"
      />
    ),
    align: 'center',
    width: '45px',
    render: (_val, row) => {
      if (String(row.propertyId) === selectedBasePropertyId) {
        return null;
      }
      const propertyId = row.propertyId as number;
      return (
        <Checkbox
          checked={checkedPropertyIds?.has(propertyId) ?? false}
          onCheckedChange={() => onToggleCheck?.(propertyId)}
          aria-label={`Select property ${propertyId}`}
        />
      );
    },
  },
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
      <span className="text-blue-600 font-semibold text-[12px]">
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
    key: 'propertyDescription',
    label: t('propertyType'),
    align: 'left',
    width: '120px',
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

export const getCombinePropertyHistoryColumns = (
  t: (key: string) => string,
  onPreviewClick?: (row: PropertyRow) => void
): Column<PropertyRow>[] => {
  const columns: Column<PropertyRow>[] = [
    { key: 'propertyNo', label: t('propertyNo'), align: 'center', width: '100px' },
    { key: 'wardNo', label: t('ward'), align: 'center', width: '100px' },
    { key: 'oldPropertyNo', label: t('oldPropertyNo'), align: 'center', width: '100px' },
    { key: 'propertyDescription', label: t('propertyType'), align: 'left' },
    { key: 'ownerName', label: t('ownerName'), align: 'left' },
    { key: 'occupierName', label: t('occupierName'), align: 'left' },
    {
      key: 'taxAmount',
      label: t('currentTax') || 'Tax Amount',
      align: 'right',
      width: '110px',
      render: (val) => (
        <span className="font-semibold text-gray-800">
          ₹{Number(val ?? 0).toLocaleString('en-IN')}
        </span>
      ),
    },
    {
      key: 'pendingAmount',
      label: t('pendingTax') || 'Pending Amount',
      align: 'right',
      width: '110px',
      render: (val) => (
        <span className="font-semibold text-gray-800">
          ₹{Number(val ?? 0).toLocaleString('en-IN')}
        </span>
      ),
    },
    { key: 'combineReason', label: t('remarkLabel') || 'Reason', align: 'left' },
  ];

  if (onPreviewClick) {
    columns.push({
      key: '_action' as any,
      label: t('action') || 'Action',
      align: 'center',
      width: '60px',
      render: (_val, row) => (
        <PreviewButton
          size="sm"
          aria-label="View Details"
          label={t('viewDetails')}
          onClick={() => onPreviewClick(row)}
        />
      ),
    });
  }

  return columns;
};

