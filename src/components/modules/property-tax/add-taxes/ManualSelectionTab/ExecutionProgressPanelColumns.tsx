/* eslint-disable @typescript-eslint/no-explicit-any */
import { Column } from "@/components/common/MasterTable";

export const getProgressPanelColumns = (t: (key: string) => string): Column<any>[] => [
  { 
    key: 'propertyNo', 
    label: t('progressPanel.columns.propertyNo'), 
    width: '18%',
    render: (_, record) => {
      const ward = record.ward || '';
      const propNo = record.propertyNo || '';
      const partNo = record.partitionNo || '';
      return `${ward}-${propNo}${partNo ? `-${partNo}` : ''}`;
    }
  },
  { key: 'zone', label: t('progressPanel.columns.zone'), width: '12%' },
  { key: 'owner', label: t('progressPanel.columns.owner'), width: '15%' },
  { 
    key: 'taxHead', 
    label: t('progressPanel.columns.taxHead'), 
    width: '15%',
    render: (val) => <div className="text-[10px] leading-tight text-gray-500">{val || '-'}</div>
  },
  { 
    key: 'amount', 
    label: t('progressPanel.columns.amount'), 
    width: '8%',
    render: (val) => `₹${val ?? 0}`
  },
  { 
    key: 'status', 
    label: t('progressPanel.columns.status'), 
    width: '10%',
    render: (val) => (
      <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${val === 'Failed' ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-600'}`}>
        {val === 'Failed' ? t('progressPanel.status.failed') : t('progressPanel.status.added')}
      </span>
    )
  },
  { 
    key: 'message', 
    label: t('progressPanel.columns.message'), 
    width: '14%',
    render: (val) => <div className="text-xs text-gray-600">{val || '-'}</div>
  },
];
