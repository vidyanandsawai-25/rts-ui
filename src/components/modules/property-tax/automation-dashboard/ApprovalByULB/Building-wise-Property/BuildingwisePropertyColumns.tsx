
import { Column, HeaderCell } from '@/components/common/AutomationTable';
import { PropertyWiseItem } from '@/types/automation-dashboard/approval-by-ulb/approval-by-ulb.type';
import { Check, X } from 'lucide-react';
import { handleLocationClick } from '@/lib/utils/automation-dashboard/mapUtils';

export const getBuildingwisePropertyHeaderRows = (t: (key: string) => string): HeaderCell[][] => {
  return [
    [
      { label: t('approvalByULB.buildingWiseProperty.headers.wardNo').toUpperCase(), rowSpan: 2, headerClassName: 'p-2 text-sm text-center text-table-header text-slate-700 border border-slate-300 bg-slate-50 min-w-[70px]' },
      { label: t('approvalByULB.buildingWiseProperty.headers.newOldPropertyNo').toUpperCase(), rowSpan: 2, headerClassName: 'p-2 text-sm text-center text-table-header text-slate-700 border border-slate-300 bg-slate-50 whitespace-pre-line min-w-[120px]' },
      { label: t('approvalByULB.buildingWiseProperty.headers.description').toUpperCase(), rowSpan: 2, headerClassName: 'p-2 text-sm text-center text-table-header text-slate-700 border border-slate-300 bg-slate-50 min-w-[90px]' },
      { label: t('approvalByULB.buildingWiseProperty.headers.ownerOccupierName').toUpperCase(), rowSpan: 2, headerClassName: 'p-2 text-sm text-center text-table-header text-slate-700 border border-slate-300 bg-slate-50 whitespace-pre-line min-w-[140px]' },
      { label: t('approvalByULB.buildingWiseProperty.headers.address').toUpperCase(), rowSpan: 2, headerClassName: 'p-2 text-sm text-center text-table-header text-slate-700 border border-slate-300 bg-slate-50 min-w-[180px]' },
      { label: t('approvalByULB.buildingWiseProperty.headers.societyBuilderName').toUpperCase(), rowSpan: 2, headerClassName: 'p-2 text-sm text-center text-table-header text-slate-700 border border-slate-300 bg-slate-50 whitespace-pre-line min-w-[140px]' },
      { label: t('approvalByULB.buildingWiseProperty.headers.wingFlatNo').toUpperCase(), rowSpan: 2, headerClassName: 'p-2 text-sm text-center text-table-header text-slate-700 border border-slate-300 bg-slate-50 whitespace-pre-line min-w-[100px]' },
      { label: t('approvalByULB.buildingWiseProperty.headers.propertyDetails').toUpperCase(), colSpan: 2, headerClassName: 'p-2 text-center text-sm font-bold text-slate-700 border border-slate-300 bg-amber-50' },
      { label: t('approvalByULB.buildingWiseProperty.headers.propertyType').toUpperCase(), rowSpan: 2, headerClassName: 'p-2 text-sm text-center text-table-header text-slate-700 border border-slate-300 bg-slate-50 min-w-[80px]' },
      { label: t('approvalByULB.buildingWiseProperty.headers.totalDemand').toUpperCase(), rowSpan: 2, headerClassName: 'p-2 text-sm text-center text-table-header text-slate-700 border border-slate-300 bg-emerald-50 min-w-[80px]' },
      { label: t('approvalByULB.buildingWiseProperty.headers.documentsImage').toUpperCase(), rowSpan: 2, headerClassName: 'p-2 text-sm text-center text-table-header text-slate-700 border border-slate-300 bg-blue-50 whitespace-pre-line min-w-[80px]' },
      { label: t('approvalByULB.buildingWiseProperty.headers.actions').toUpperCase(), rowSpan: 2, headerClassName: 'p-2 text-sm text-center text-table-header text-slate-700 border border-slate-300 bg-slate-50 min-w-[80px]' },
      { label: t('approvalByULB.buildingWiseProperty.headers.clerkSign').toUpperCase(), rowSpan: 2, headerClassName: 'p-2 text-sm text-center text-table-header text-slate-700 border border-slate-300 bg-indigo-50 whitespace-pre-line min-w-[60px]' },
      { label: t('approvalByULB.buildingWiseProperty.headers.taxInsp').toUpperCase(), rowSpan: 2, headerClassName: 'p-2 text-sm text-center text-table-header text-slate-700 border border-slate-300 bg-cyan-50 whitespace-pre-line min-w-[60px]' },
      { label: t('approvalByULB.buildingWiseProperty.headers.asstComm').toUpperCase(), rowSpan: 2, headerClassName: 'p-2 text-sm text-center text-table-header text-slate-700 border border-slate-300 bg-purple-50 whitespace-pre-line min-w-[60px]' },
      { label: t('approvalByULB.buildingWiseProperty.headers.dyCommTax').toUpperCase(), rowSpan: 2, headerClassName: 'p-2 text-sm text-center text-table-header text-slate-700 border border-slate-300 bg-pink-50 whitespace-pre-line min-w-[60px]' },
      { label: t('approvalByULB.buildingWiseProperty.headers.addlComm').toUpperCase(), rowSpan: 2, headerClassName: 'p-2 text-sm text-center text-table-header text-slate-700 border border-slate-300 bg-teal-50 whitespace-pre-line min-w-[60px]' }
    ],
    [
      { label: t('approvalByULB.buildingWiseProperty.headers.oldRecord').toUpperCase(), headerClassName: 'p-2 text-sm text-center text-table-header text-slate-700 border border-slate-300 bg-red-50 min-w-[130px]' },
      { label: t('approvalByULB.buildingWiseProperty.headers.newRecord').toUpperCase(), headerClassName: 'p-2 text-sm text-center text-table-header text-slate-700 border border-slate-300 bg-emerald-50 min-w-[130px]' }
    ]
  ];
};

export const getBuildingwisePropertyColumns = (
  t: (key: string) => string,
  onTrackingClick?: (row: PropertyWiseItem) => void
): Column<PropertyWiseItem>[] => {
  return [
    {
      key: 'wardNo',
      label: t('approvalByULB.buildingWiseProperty.headers.wardNo'),
      cellClassName: 'align-center',
      render: (_, row) => <div className="text-center text-slate-700 text-xs font-medium">{row.wardNo || 'N/A'}</div>
    },
    {
      key: 'newPropertyNo',
      label: t('approvalByULB.buildingWiseProperty.headers.newOldPropertyNo'),
      cellClassName: 'align-center',
      render: (_, row) => (
        <div className="flex flex-col text-center">
          <div className="text-slate-800 font-semibold text-xs">{row.newPropertyNo || 'N/A'}</div>
          <div className="text-[11px] text-slate-600 font-medium mt-1">
            {t('approvalByULB.buildingWiseProperty.oldLabel')} {row.oldPropertyNo || t('approvalByULB.buildingWiseProperty.newLabel')}
          </div>
        </div>
      )
    },
    {
      key: 'description',
      label: t('approvalByULB.buildingWiseProperty.headers.description'),
      cellClassName: 'align-center',
      render: (_, row) => <div className="text-center text-slate-700 text-xs font-medium">{row.description || 'N/A'}</div>
    },
    {
      key: 'ownerName',
      label: t('approvalByULB.buildingWiseProperty.headers.ownerOccupierName'),
      cellClassName: 'align-center',
      render: (_, row) => (
        <div className="flex flex-col text-left text-xs leading-tight break-words gap-1">
          <div className="text-slate-800 font-medium">
            <span className="text-slate-900 font-extrabold">{t('approvalByULB.buildingWiseProperty.ownerLabel')}</span> {row.ownerName || 'N/A'}
          </div>
          <div className="text-slate-700 font-medium">
            <span className="text-slate-900 font-extrabold">{t('approvalByULB.buildingWiseProperty.occupierLabel')}</span> {row.occupierName || 'N/A'}
          </div>
        </div>
      )
    },
    {
      key: 'address',
      label: t('approvalByULB.buildingWiseProperty.headers.address'),
       cellClassName: 'align-middle uppercase',
      render: (_, row) => <div className="text-left text-slate-700 text-xs font-medium">{row.address || 'N/A'}</div>
    },
    {
      key: 'societyName',
      label: t('approvalByULB.buildingWiseProperty.headers.societyBuilderName'),
      cellClassName: 'align-center',
      render: (_, row) => (
        <div className="flex flex-col text-left text-xs leading-tight break-words gap-1">
          <div className="text-slate-800 font-medium">
            <span className="text-slate-900 font-extrabold">{t('approvalByULB.buildingWiseProperty.societyLabel')}</span> {row.societyName || 'N/A'}
          </div>
          <div className="text-slate-700 font-medium">
            <span className="text-slate-900 font-extrabold">{t('approvalByULB.buildingWiseProperty.builderLabel')}</span> {row.builderName || 'N/A'}
          </div>
        </div>
      )
    },
    {
      key: 'wingNo',
      label: t('approvalByULB.buildingWiseProperty.headers.wingFlatNo'),
      cellClassName: 'align-center',
      render: (_, row) => (
        <div className="flex flex-col text-left text-xs leading-tight break-words gap-1">
          <div className="text-slate-800 font-medium">
            <span className="text-slate-900 font-extrabold">{t('approvalByULB.buildingWiseProperty.wingLabel')}</span> {row.wingNo || 'N/A'}
          </div>
          <div className="text-slate-700 font-medium">
            <span className="text-slate-900 font-extrabold">{t('approvalByULB.buildingWiseProperty.flatLabel')}</span> {row.flatNo || 'N/A'}
          </div>
        </div>
      )
    },
    {
      key: 'oldRecord',
      label: t('approvalByULB.buildingWiseProperty.headers.oldRecord'),
      cellClassName: 'bg-red-50/30 align-center',
      render: (_, row) => (
        <div className="space-y-0.5 text-xs p-1">
          <div className="flex items-start justify-between gap-1">
            <span className="font-semibold text-gray-700">{t('approvalByULB.buildingWiseProperty.areaLabel')}</span>
            <span className="font-semibold text-gray-800 text-right">{row.oldRecord?.area || 'N/A'}</span>
          </div>
          <div className="flex items-start justify-between gap-1">
            <span className="font-semibold text-gray-700">{t('approvalByULB.buildingWiseProperty.useLabel')}</span>
            <span className="font-semibold text-gray-800 text-right truncate max-w-[80px]" title={row.oldRecord?.use}>{row.oldRecord?.use || 'N/A'}</span>
          </div>
          <div className="flex items-start justify-between gap-1">
            <span className="font-semibold text-gray-700">{t('approvalByULB.buildingWiseProperty.yearLabel')}</span>
            <span className="font-semibold text-gray-800 text-right">{row.oldRecord?.year || 'N/A'}</span>
          </div>
          <div className="flex items-start justify-between gap-1">
            <span className="font-semibold text-gray-700">{t('approvalByULB.buildingWiseProperty.rvLabel')}</span>
            <span className="font-semibold text-gray-800 text-right">{row.oldRecord?.rv || 'N/A'}</span>
          </div>
          <div className="flex items-start justify-between gap-1 pt-0.5 mt-0.5 border-t border-red-100">
            <span className="font-semibold text-gray-700">{t('approvalByULB.buildingWiseProperty.taxLabel')}</span>
            <span className="font-bold text-gray-700 text-right">{row.oldRecord?.tax || 'N/A'}</span>
          </div>
        </div>
      )
    },
    {
      key: 'newRecord',
      label: t('approvalByULB.buildingWiseProperty.headers.newRecord'),
      cellClassName: 'bg-emerald-50/30 align-center',
      render: (_, row) => (
        <div className="space-y-0.5 text-xs p-1">
          <div className="flex items-start justify-between gap-1">
            <span className="font-semibold text-gray-700">{t('approvalByULB.buildingWiseProperty.areaLabel')}</span>
            <span className="font-semibold text-gray-800 text-right">{row.newRecord?.area || 'N/A'}</span>
          </div>
          <div className="flex items-start justify-between gap-1">
            <span className="font-semibold text-gray-700">{t('approvalByULB.buildingWiseProperty.useLabel')}</span>
            <span className="font-semibold text-gray-800 text-right truncate max-w-[80px]" title={row.newRecord?.use}>{row.newRecord?.use || 'N/A'}</span>
          </div>
          <div className="flex items-start justify-between gap-1">
            <span className="font-semibold text-gray-700">{t('approvalByULB.buildingWiseProperty.yearLabel')}</span>
            <span className="font-semibold text-gray-800 text-right">{row.newRecord?.year || 'N/A'}</span>
          </div>
          <div className="flex items-start justify-between gap-1">
            <span className="font-semibold text-gray-700">{t('approvalByULB.buildingWiseProperty.rvLabel')}</span>
            <span className="font-semibold text-gray-800 text-right">{row.newRecord?.rv || 'N/A'}</span>
          </div>
          <div className="flex items-start justify-between gap-1 pt-0.5 mt-0.5 border-t border-emerald-100">
            <span className="font-semibold text-gray-700">{t('approvalByULB.buildingWiseProperty.taxLabel')}</span>
            <span className="font-bold text-gray-700 text-right">{row.newRecord?.tax || 'N/A'}</span>
          </div>
        </div>
      )
    },
    {
      key: 'propertyType',
      label: t('approvalByULB.buildingWiseProperty.headers.propertyType'),
      cellClassName: 'align-center',
      render: (_, row) => <div className="text-center text-slate-800 font-medium text-xs">{row.propertyType || 'N/A'}</div>
    },
    {
      key: 'totalDemand',
      label: t('approvalByULB.buildingWiseProperty.headers.totalDemand'),
      cellClassName: 'align-center',
      render: (_, row) => <div className="text-center font-bold text-green-700 text-xs">{t('approvalByULB.buildingWiseProperty.currencySymbol')}{row.totalDemand?.toLocaleString('en-IN') || 0}</div>
    },
    {
      key: 'documents',
      label: t('approvalByULB.buildingWiseProperty.headers.documentsImage'),
      cellClassName: 'align-middle',
      render: (_, _row) => {
        const imageUrl = 'df9f9f30-86c6-4da4-84e8-31e2faa2492e'

        return (
          <div className="flex justify-center">
            <div className="h-9 w-9 rounded overflow-hidden border border-slate-300 bg-slate-100 flex items-center justify-center">
              {imageUrl ? (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img
                  src={imageUrl}
                  alt="Document"
                  className="h-full w-full object-cover cursor-pointer hover:opacity-80 transition-opacity"
                  loading="lazy"
                  decoding="async"
                />
              ) : (
                <span className="text-slate-500 text-xs">{t('approvalByULB.buildingWiseProperty.na')}</span>
              )}
            </div>
          </div>
        );
      }
    },
    {
      key: 'actions',
      label: t('approvalByULB.buildingWiseProperty.headers.actions'),
      cellClassName: 'align-middle',
      render: (_, row) => (
        <div className="flex flex-col items-center justify-center gap-1.5 py-1 text-xs">
          <button
            className="inline-flex items-center justify-center whitespace-nowrap disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive hover:text-accent-foreground dark:hover:bg-accent/50 gap-1.5 px-3 has-[>svg]:px-2.5 h-6 w-[70px] rounded-full text-xs font-bold bg-purple-100 text-purple-700 border border-purple-200 hover:bg-purple-200 transition-colors"
          >
            {t('approvalByULB.buildingWiseProperty.report')}
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onTrackingClick?.(row);
            }}
            className="inline-flex items-center justify-center whitespace-nowrap disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive hover:text-accent-foreground dark:hover:bg-accent/50 gap-1.5 px-3 has-[>svg]:px-2.5 h-6 w-[70px] rounded-full text-xs font-bold bg-blue-100 text-blue-700 border border-blue-200 hover:bg-blue-200 transition-colors"
          >
            {t('approvalByULB.buildingWiseProperty.tracking')}
          </button>
          <div
            className="h-8 w-8 hover:bg-slate-100 transition-colors flex items-center justify-center rounded-full overflow-hidden mx-auto cursor-pointer mt-0.5"
            title="Location"
            onClick={() => handleLocationClick(row, row.wardNo, row.propertyId)}
          >           
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="https://thaneautomationdashboard.tabamc.in/_next/static/media/map%20icon.11lzpgxlb~sr1.png"
              alt="Location"
              className="h-7 w-7 object-contain scale-[1.8]"
            />
          </div>
        </div>
      )
    },
    {
      key: 'clerkSign',
      label: t('approvalByULB.buildingWiseProperty.headers.clerkSign'),
      cellClassName: 'align-middle bg-indigo-50/30',
      render: (_, row) => (
        <div className="flex justify-center items-center">
          {row.clerkSign ? <Check className="h-4 w-4 text-emerald-600 inline-block" /> : <X className="h-4 w-4 text-rose-600 inline-block" />}
        </div>
      )
    },
    {
      key: 'taxInspectorSign',
      label: t('approvalByULB.buildingWiseProperty.headers.taxInsp'),
      cellClassName: 'align-middle bg-cyan-50/30',
      render: (_, row) => (
        <div className="flex justify-center items-center">
          {row.taxInspectorSign ? <Check className="h-4 w-4 text-emerald-600 inline-block" /> : <X className="h-4 w-4 text-rose-600 inline-block" />}
        </div>
      )
    },
    {
      key: 'assistantCommissionerSign',
      label: t('approvalByULB.buildingWiseProperty.headers.asstComm'),
      cellClassName: 'align-middle bg-purple-50/30',
      render: (_, row) => (
        <div className="flex justify-center items-center">
          {row.assistantCommissionerSign ? <Check className="h-4 w-4 text-emerald-600 inline-block" /> : <X className="h-4 w-4 text-rose-600 inline-block" />}
        </div>
      )
    },
    {
      key: 'deputyCommissionerSign',
      label: t('approvalByULB.buildingWiseProperty.headers.dyCommTax'),
      cellClassName: 'align-middle bg-pink-50/30',
      render: (_, row) => (
        <div className="flex justify-center items-center">
          {row.deputyCommissionerSign ? <Check className="h-4 w-4 text-emerald-600 inline-block" /> : <X className="h-4 w-4 text-rose-600 inline-block" />}
        </div>
      )
    },
    {
      key: 'additionalCommissionerSign',
      label: t('approvalByULB.buildingWiseProperty.headers.addlComm'),
      cellClassName: 'align-middle bg-teal-50/30',
      render: (_, row) => (
        <div className="flex justify-center items-center">
          {row.additionalCommissionerSign ? <Check className="h-4 w-4 text-emerald-600 inline-block" /> : <X className="h-4 w-4 text-rose-600 inline-block" />}
        </div>
      )
    }
  ];
};
