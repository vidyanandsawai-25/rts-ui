
import { Column, HeaderCell } from '@/components/common/AutomationTable';
import { PropertyWiseItem } from '@/types/automation-dashboard/approval-by-ulb/approval-by-ulb.type';
import { Check, X } from 'lucide-react';
import { handleLocationClick } from '@/lib/utils/automation-dashboard/mapUtils';

export const getBuildingwisePropertyHeaderRows = (): HeaderCell[][] => {
  return [
    [
      { label: 'Ward No', headerClassName: 'p-2 text-center text-table-header text-slate-700 min-w-[70px]' },
      { label: 'New Property No\n& Old Property No', headerClassName: 'p-2 text-center text-table-header text-slate-700 whitespace-pre-line min-w-[120px]' },
      { label: 'Description', headerClassName: 'p-2 text-center text-table-header text-slate-700 min-w-[90px]' },
      { label: 'Owner Name\n& Occupier Name', headerClassName: 'p-2 text-center text-table-header text-slate-700 whitespace-pre-line min-w-[140px]' },
      { label: 'Address', headerClassName: 'p-2 text-center text-table-header text-slate-700 min-w-[180px]' },
      { label: 'Society Name\n& Builder Name', headerClassName: 'p-2 text-center text-table-header text-slate-700 whitespace-pre-line min-w-[140px]' },
      { label: 'Wing No\n& Flat No', headerClassName: 'p-2 text-center text-table-header text-slate-700 whitespace-pre-line min-w-[100px]' },
      { label: 'Old Record', headerClassName: 'p-2 text-center text-table-header text-slate-700 min-w-[130px]' },
      { label: 'New Record', headerClassName: 'p-2 text-center text-table-header text-slate-700 min-w-[130px]' },
      { label: 'Property Type', headerClassName: 'p-2 text-center text-table-header text-slate-700 min-w-[80px]' },
      { label: 'Total Demand', headerClassName: 'p-2 text-center text-table-header text-slate-700 min-w-[80px]' },
      { label: 'DOCUMENTS\nImage', headerClassName: 'p-2 text-center text-table-header text-slate-700 whitespace-pre-line min-w-[80px]' },
      { label: 'ACTIONS', headerClassName: 'p-2 text-center text-table-header text-slate-700 min-w-[80px]' },
      { label: 'Clerk Sign', headerClassName: 'p-2 text-center text-table-header text-slate-700 whitespace-pre-line min-w-[60px]' },
      { label: 'Tax Insp.', headerClassName: 'p-2 text-center text-table-header text-slate-700 whitespace-pre-line min-w-[60px]' },
      { label: 'Asst. Comm.', headerClassName: 'p-2 text-center text-table-header text-slate-700 whitespace-pre-line min-w-[60px]' },
      { label: 'Dy. Comm.\n(Tax)', headerClassName: 'p-2 text-center text-table-header text-slate-700 whitespace-pre-line min-w-[60px]' },
      { label: 'Addl. Comm.', headerClassName: 'p-2 text-center text-table-header text-slate-700 whitespace-pre-line min-w-[60px]' }
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
      label: 'Ward No',
      render: (_, row) => <div className="text-center text-slate-700 text-sm">{row.wardNo || 'N/A'}</div>
    },
    {
      key: 'newPropertyNo',
      label: 'New Property No & Old Property No',
      render: (_, row) => (
        <div className="flex flex-col text-center">
          <div className="text-slate-800 font-medium text-sm">{row.newPropertyNo || 'N/A'}</div>
          <div className="text-xs text-slate-700 font-medium mt-0.5">
            {t('approvalByULB.buildingWiseProperty.oldLabel')} {row.oldPropertyNo || t('approvalByULB.buildingWiseProperty.newLabel')}
          </div>
        </div>
      )
    },
    {
      key: 'description',
      label: 'Description',
      render: (_, row) => <div className="text-center text-slate-700 text-sm">{row.description || 'N/A'}</div>
    },
    {
      key: 'ownerName',
      label: 'Owner Name & Occupier Name',
      render: (_, row) => (
        <div className="flex flex-col text-left text-xs leading-tight break-words">
          <div className="text-slate-800 font-medium">
            <span className="text-slate-500 font-normal">{t('approvalByULB.buildingWiseProperty.ownerLabel')}</span> {row.ownerName || 'N/A'}
          </div>
          <div className="text-slate-700 font-medium mt-1">
            <span className="text-slate-500 font-normal">{t('approvalByULB.buildingWiseProperty.occupierLabel')}</span> {row.occupierName || 'N/A'}
          </div>
        </div>
      )
    },
    {
      key: 'address',
      label: 'Address',
      render: (_, row) => <div className="text-left text-slate-700 text-sm">{row.address || 'N/A'}</div>
    },
    {
      key: 'societyName',
      label: 'Society Name & Builder Name',
      render: (_, row) => (
        <div className="flex flex-col text-left text-xs leading-tight break-words">
          <div className="text-slate-800 font-medium">
            <span className="text-slate-500 font-normal">{t('approvalByULB.buildingWiseProperty.societyLabel')}</span> {row.societyName || 'N/A'}
          </div>
          <div className="text-slate-700 font-medium mt-1">
            <span className="text-slate-500 font-normal">{t('approvalByULB.buildingWiseProperty.builderLabel')}</span> {row.builderName || 'N/A'}
          </div>
        </div>
      )
    },
    {
      key: 'wingNo',
      label: 'Wing No & Flat No',
      render: (_, row) => (
        <div className="flex flex-col text-left text-xs leading-tight break-words">
          <div className="text-slate-800 font-medium">
            <span className="text-slate-500 font-normal">{t('approvalByULB.buildingWiseProperty.wingLabel')}</span> {row.wingNo || 'N/A'}
          </div>
          <div className="text-slate-700 font-medium mt-1">
            <span className="text-slate-500 font-normal">{t('approvalByULB.buildingWiseProperty.flatLabel')}</span> {row.flatNo || 'N/A'}
          </div>
        </div>
      )
    },
    {
      key: 'oldRecord',
      label: 'Old Record',
      render: (_, row) => (
        <div className="flex flex-col text-left leading-tight gap-0.5 text-xs">
          <span>{t('approvalByULB.buildingWiseProperty.areaLabel')} <span className="text-black">{row.oldRecord?.area || 'N/A'}</span></span>
          <span>{t('approvalByULB.buildingWiseProperty.useLabel')} <span className="text-black">{row.oldRecord?.use || 'N/A'}</span></span>
          <span>{t('approvalByULB.buildingWiseProperty.yearLabel')} <span className="text-black">{row.oldRecord?.year || 'N/A'}</span></span>
          <span>{t('approvalByULB.buildingWiseProperty.rvLabel')} <span className="text-black">{row.oldRecord?.rv || 'N/A'}</span></span>
          <span>{t('approvalByULB.buildingWiseProperty.taxLabel')} <span className="text-black">{row.oldRecord?.tax || 'N/A'}</span></span>
        </div>
      )
    },
    {
      key: 'newRecord',
      label: 'New Record',
      render: (_, row) => (
        <div className="flex flex-col text-left leading-tight gap-0.5 text-xs">
          <span>{t('approvalByULB.buildingWiseProperty.areaLabel')} <span className="text-black">{row.newRecord?.area || 'N/A'}</span></span>
          <span>{t('approvalByULB.buildingWiseProperty.useLabel')} <span className="text-black">{row.newRecord?.use || 'N/A'}</span></span>
          <span>{t('approvalByULB.buildingWiseProperty.yearLabel')} <span className="text-black">{row.newRecord?.year || 'N/A'}</span></span>
          <span>{t('approvalByULB.buildingWiseProperty.rvLabel')} <span className="text-black">{row.newRecord?.rv || 'N/A'}</span></span>
          <span>{t('approvalByULB.buildingWiseProperty.taxLabel')} <span className="text-black">{row.newRecord?.tax || 'N/A'}</span></span>
        </div>
      )
    },
    {
      key: 'propertyType',
      label: 'Property Type',
      render: (_, row) => <div className="text-center text-slate-700 text-sm">{row.propertyType || 'N/A'}</div>
    },
    {
      key: 'totalDemand',
      label: 'Total Demand',
      render: (_, row) => <div className="text-center text-slate-700 text-sm">{t('approvalByULB.buildingWiseProperty.currencySymbol')}{row.totalDemand?.toLocaleString('en-IN') || 0}</div>
    },
    {
      key: 'documents',
      label: 'DOCUMENTS Image',
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
      label: 'ACTIONS',
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
            className="h-12 w-12 hover:bg-slate-100 transition-colors flex items-center justify-center rounded-full overflow-hidden mx-auto"
            title="Location"
            onClick={() => handleLocationClick(row, row.wardNo, row.propertyId)}
          >           
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="https://thaneautomationdashboard.tabamc.in/_next/static/media/map%20icon.11lzpgxlb~sr1.png"
              alt="Location"
              className="h-8 w-8 object-contain scale-[2]"
            />
          </div>
        </div>
      )
    },
    {
      key: 'clerkSign',
      label: 'Clerk Sign',
      render: (_, row) => (
        <div className="flex justify-center items-center">
          {row.clerkSign ? <Check className="h-4 w-4 text-emerald-600 inline-block" /> : <X className="h-4 w-4 text-rose-600 inline-block" />}
        </div>
      )
    },
    {
      key: 'taxInspectorSign',
      label: 'Tax Insp.',
      render: (_, row) => (
        <div className="flex justify-center items-center">
          {row.taxInspectorSign ? <Check className="h-4 w-4 text-emerald-600 inline-block" /> : <X className="h-4 w-4 text-rose-600 inline-block" />}
        </div>
      )
    },
    {
      key: 'assistantCommissionerSign',
      label: 'Asst. Comm.',
      render: (_, row) => (
        <div className="flex justify-center items-center">
          {row.assistantCommissionerSign ? <Check className="h-4 w-4 text-emerald-600 inline-block" /> : <X className="h-4 w-4 text-rose-600 inline-block" />}
        </div>
      )
    },
    {
      key: 'deputyCommissionerSign',
      label: 'Dy. Comm. (Tax)',
      render: (_, row) => (
        <div className="flex justify-center items-center">
          {row.deputyCommissionerSign ? <Check className="h-4 w-4 text-emerald-600 inline-block" /> : <X className="h-4 w-4 text-rose-600 inline-block" />}
        </div>
      )
    },
    {
      key: 'additionalCommissionerSign',
      label: 'Addl. Comm.',
      render: (_, row) => (
        <div className="flex justify-center items-center">
          {row.additionalCommissionerSign ? <Check className="h-4 w-4 text-emerald-600 inline-block" /> : <X className="h-4 w-4 text-rose-600 inline-block" />}
        </div>
      )
    }
  ];
};
