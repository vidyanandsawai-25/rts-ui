
import { Column, HeaderCell } from '@/components/common/AutomationTable';
import { PropertyWiseItem } from '@/types/automation-dashboard/approval-by-ulb/approval-by-ulb.type';
import { Check, X } from 'lucide-react';
import { handleLocationClick } from '@/lib/utils/automation-dashboard/mapUtils';

const COLUMN_TEXT_SIZE_CLASS = 'text-[11px]';

export const getBuildingwisePropertyHeaderRows = (): HeaderCell[][] => {
  return [
    [
      { label: 'Ward No', headerClassName: 'p-2 text-center font-semibold text-slate-900 border border-slate-300 bg-[#fbfbfe]' },
      { label: 'New Property No\n& Old Property No', headerClassName: 'p-2 text-center font-semibold text-slate-900 border border-slate-300 bg-[#fbfbfe] whitespace-pre-line' },
      { label: 'Description', headerClassName: 'p-2 text-center font-semibold text-slate-900 border border-slate-300 bg-[#fbfbfe]' },
      { label: 'Owner Name\n& Occupier Name', headerClassName: 'p-2 text-center font-semibold text-slate-900 border border-slate-300 bg-[#fbfbfe] whitespace-pre-line min-w-[160px]' },
      { label: 'Address', headerClassName: 'p-2 text-center font-semibold text-slate-900 border border-slate-300 bg-[#fbfbfe] min-w-[160px]' },
      { label: 'Society Name\n& Builder Name', headerClassName: 'p-2 text-center font-semibold text-slate-900 border border-slate-300 bg-[#fbfbfe] whitespace-pre-line min-w-[150px]' },
      { label: 'Wing No\n& Flat No', headerClassName: 'p-2 text-center font-semibold text-slate-900 border border-slate-300 bg-[#fbfbfe] whitespace-pre-line min-w-[120px]' },
      { label: 'Old Record', headerClassName: 'p-2 text-center font-semibold text-slate-900 border border-slate-300 bg-[#fbfbfe] min-w-[120px]' },
      { label: 'New Record', headerClassName: 'p-2 text-center font-semibold text-slate-900 border border-slate-300 bg-[#fbfbfe] min-w-[120px]' },
      { label: 'Property\nType', headerClassName: 'p-2 text-center font-semibold text-slate-900 border border-slate-300 bg-[#fbfbfe] whitespace-pre-line' },
      { label: 'Total\nDemand', headerClassName: 'p-2 text-center font-semibold text-slate-900 border border-slate-300 bg-[#fbfbfe] whitespace-pre-line' },
      { label: 'DOCUMENTS\nImage', headerClassName: 'p-2 text-center font-semibold text-slate-900 border border-slate-300 bg-[#fbfbfe] whitespace-pre-line' },
      { label: 'ACTIONS', headerClassName: 'p-2 text-center font-semibold text-slate-900 border border-slate-300 bg-[#fbfbfe]' },
      { label: 'Clerk', headerClassName: 'p-2 text-center font-semibold text-slate-900 border border-slate-300 bg-[#fbfbfe]' },
      { label: 'Tax\nInsp.', headerClassName: 'p-2 text-center font-semibold text-slate-900 border border-slate-300 bg-[#fbfbfe] whitespace-pre-line' },
      { label: 'Asst.\nComm.', headerClassName: 'p-2 text-center font-semibold text-slate-900 border border-slate-300 bg-[#fbfbfe] whitespace-pre-line' },
      { label: 'Dy.\nComm.\n(Tax)', headerClassName: 'p-2 text-center font-semibold text-slate-900 border border-slate-300 bg-[#fbfbfe] whitespace-pre-line' },
      { label: 'Addl.\nComm.', headerClassName: 'p-2 text-center font-semibold text-slate-900 border border-slate-300 bg-[#fbfbfe] whitespace-pre-line' }
    ]
  ];
};

export const getBuildingwisePropertyColumns = (t: (key: string) => string): Column<PropertyWiseItem>[] => {
  return [
    {
      key: 'wardNo',
      label: 'Ward No',
      render: (_, row) => <div className={`text-center ${COLUMN_TEXT_SIZE_CLASS}`}>{row.wardNo}</div>
    },
    {
      key: 'newPropertyNo',
      label: 'New Property No & Old Property No',
      render: (_, row) => (
        <div className={`flex flex-col text-center ${COLUMN_TEXT_SIZE_CLASS}`}>
          <span className="font-semibold text-black">{row.newPropertyNo}</span>
          <span className="text-slate-500 mt-0.5">{t('approvalByULB.buildingWiseProperty.oldLabel')}{row.oldPropertyNo || t('approvalByULB.buildingWiseProperty.newLabel')}</span>
        </div>
      )
    },
    {
      key: 'description',
      label: 'Description',
      render: (_, row) => <div className={`text-center ${COLUMN_TEXT_SIZE_CLASS}`}>{row.description}</div>
    },
    {
      key: 'ownerName',
      label: 'Owner Name & Occupier Name',
      render: (_, row) => (
        <div className={`flex flex-col text-left ${COLUMN_TEXT_SIZE_CLASS}`}>
          <span className="text-slate-500">{t('approvalByULB.buildingWiseProperty.ownerLabel')}<span className="text-black font-semibold">{row.ownerName}</span></span>
          <span className="text-slate-500 mt-1">{t('approvalByULB.buildingWiseProperty.occupierLabel')}<span className="text-black font-semibold">{row.occupierName}</span></span>
        </div>
      )
    },
    {
      key: 'address',
      label: 'Address',
      render: (_, row) => <div className={`text-left uppercase text-slate-700 ${COLUMN_TEXT_SIZE_CLASS}`}>{row.address}</div>
    },
    {
      key: 'societyName',
      label: 'Society Name & Builder Name',
      render: (_, row) => (
        <div className={`flex flex-col text-left ${COLUMN_TEXT_SIZE_CLASS}`}>
          <span className="text-slate-500">{t('approvalByULB.buildingWiseProperty.societyLabel')}<span className="text-black font-semibold">{row.societyName || t('approvalByULB.buildingWiseProperty.na')}</span></span>
          <span className="text-slate-500 mt-1">{t('approvalByULB.buildingWiseProperty.builderLabel')}<span className="text-black font-semibold">{row.builderName || t('approvalByULB.buildingWiseProperty.na')}</span></span>
        </div>
      )
    },
    {
      key: 'wingNo',
      label: 'Wing No & Flat No',
      render: (_, row) => (
        <div className={`flex flex-col text-left ${COLUMN_TEXT_SIZE_CLASS}`}>
          <span className="text-slate-500">{t('approvalByULB.buildingWiseProperty.wingLabel')}<span className="text-black font-semibold">{row.wingNo || t('approvalByULB.buildingWiseProperty.na')}</span></span>
          <span className="text-slate-500 mt-1">{t('approvalByULB.buildingWiseProperty.flatLabel')}<span className="text-black font-semibold">{row.flatNo || t('approvalByULB.buildingWiseProperty.na')}</span></span>
        </div>
      )
    },
    {
      key: 'oldRecord',
      label: 'Old Record',
      render: (_, row) => (
        <div className={`flex flex-col text-left leading-tight gap-0.5 ${COLUMN_TEXT_SIZE_CLASS}`}>
          <span>{t('approvalByULB.buildingWiseProperty.areaLabel')}<span className="text-black">{row.oldRecord?.area || t('approvalByULB.buildingWiseProperty.na')}</span></span>
          <span>{t('approvalByULB.buildingWiseProperty.useLabel')}<span className="text-black">{row.oldRecord?.use || t('approvalByULB.buildingWiseProperty.notAvailable')}</span></span>
          <span>{t('approvalByULB.buildingWiseProperty.yearLabel')}<span className="text-black">{row.oldRecord?.year || t('approvalByULB.buildingWiseProperty.na')}</span></span>
          <span>{t('approvalByULB.buildingWiseProperty.rvLabel')}<span className="text-black">{row.oldRecord?.rv || t('approvalByULB.buildingWiseProperty.na')}</span></span>
          <span>{t('approvalByULB.buildingWiseProperty.taxLabel')}<span className="text-black">{row.oldRecord?.tax || t('approvalByULB.buildingWiseProperty.na')}</span></span>
        </div>
      )
    },
    {
      key: 'newRecord',
      label: 'New Record',
      render: (_, row) => (
        <div className={`flex flex-col text-left leading-tight gap-0.5 ${COLUMN_TEXT_SIZE_CLASS}`}>
          <span>{t('approvalByULB.buildingWiseProperty.areaLabel')}<span className="text-black">{row.newRecord?.area || t('approvalByULB.buildingWiseProperty.na')}</span></span>
          <span>{t('approvalByULB.buildingWiseProperty.useLabel')}<span className="text-black">{row.newRecord?.use || t('approvalByULB.buildingWiseProperty.na')}</span></span>
          <span>{t('approvalByULB.buildingWiseProperty.yearLabel')}<span className="text-black">{row.newRecord?.year || t('approvalByULB.buildingWiseProperty.na')}</span></span>
          <span>{t('approvalByULB.buildingWiseProperty.rvLabel')}<span className="text-black">{row.newRecord?.rv || t('approvalByULB.buildingWiseProperty.na')}</span></span>
          <span>{t('approvalByULB.buildingWiseProperty.taxLabel')}<span className="text-black">{row.newRecord?.tax || t('approvalByULB.buildingWiseProperty.na')}</span></span>
        </div>
      )
    },
    {
      key: 'propertyType',
      label: 'Property Type',
      render: (_, row) => <div className={`text-center text-slate-700 ${COLUMN_TEXT_SIZE_CLASS}`}>{row.propertyType || t('approvalByULB.buildingWiseProperty.unassessed')}</div>
    },
    {
      key: 'totalDemand',
      label: 'Total Demand',
      render: (_, row) => <div className={`text-center font-semibold text-slate-700 ${COLUMN_TEXT_SIZE_CLASS}`}>{t('approvalByULB.buildingWiseProperty.currencySymbol')}{row.totalDemand?.toLocaleString('en-IN') || 0}</div>
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
              <span className={`text-slate-500 ${COLUMN_TEXT_SIZE_CLASS}`}>{t('approvalByULB.buildingWiseProperty.na')}</span>
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
        <div className={`flex flex-col items-center justify-center gap-1.5 py-1 ${COLUMN_TEXT_SIZE_CLASS}`}>
          <button className="h-5 w-15 rounded-full flex items-center justify-center font-bold bg-purple-100 text-purple-700 hover:bg-purple-200 transition-colors cursor-pointer select-none">
            {t('approvalByULB.buildingWiseProperty.report')}
          </button>
          <button className="h-5 w-15 rounded-full font-bold bg-blue-100 text-blue-700 hover:bg-blue-200 transition-colors flex items-center justify-center cursor-pointer select-none">
            {t('approvalByULB.buildingWiseProperty.tracking')}
          </button>
          <div
            className="h-6 w-6 hover:bg-slate-100 transition-colors flex items-center justify-center rounded-full cursor-pointer mt-0.5"
            title="Location"
            onClick={() => handleLocationClick(row)}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="https://upload.wikimedia.org/wikipedia/commons/3/39/Google_Maps_icon_%282015-2020%29.svg" alt="Location" className="h-4 w-4" />
          </div>
        </div>
      )
    },
    {
      key: 'clerkSign',
      label: 'Clerk',
      render: (_, row) => (
        <div className="flex justify-center items-center">
          {row.clerkSign ? <Check size={14} className="text-green-500" /> : <X size={14} className="text-red-500" />}
        </div>
      )
    },
    {
      key: 'taxInspectorSign',
      label: 'Tax Insp.',
      render: (_, row) => (
        <div className="flex justify-center items-center">
          {row.taxInspectorSign ? <Check size={14} className="text-green-500" /> : <X size={14} className="text-red-500" />}
        </div>
      )
    },
    {
      key: 'assistantCommissionerSign',
      label: 'Asst. Comm.',
      render: (_, row) => (
        <div className="flex justify-center items-center">
          {row.assistantCommissionerSign ? <Check size={14} className="text-green-500" /> : <X size={14} className="text-red-500" />}
        </div>
      )
    },
    {
      key: 'deputyCommissionerSign',
      label: 'Dy. Comm.',
      render: (_, row) => (
        <div className="flex justify-center items-center">
          {row.deputyCommissionerSign ? <Check size={14} className="text-green-500" /> : <X size={14} className="text-red-500" />}
        </div>
      )
    },
    {
      key: 'additionalCommissionerSign',
      label: 'Addl. Comm.',
      render: (_, row) => (
        <div className="flex justify-center items-center">
          {row.additionalCommissionerSign ? <Check size={14} className="text-green-500" /> : <X size={14} className="text-red-500" />}
        </div>
      )
    }
  ];
};
