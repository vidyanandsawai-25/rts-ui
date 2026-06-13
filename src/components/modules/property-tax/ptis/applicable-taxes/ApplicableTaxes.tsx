'use client';

import { SearchSelect } from '@/components/common';
import { TaxesTableTemplate } from './TaxesTableTemplate';
import ApplicableTaxesTabNavigation from './ApplicableTaxesTabNavigation';
import FixedFooter from './FixedFooter';
import type { ApplicableTaxesProps } from '@/types/applicable-taxes.types';
import { useApplicableTaxes } from '@/hooks/ptis/applicableTaxes/useApplicableTaxes';

export const ApplicableTaxes = ({
  asseYearsResponse,
  useGroupsResponse,
  valuationTab,
  taxApplicabilityResponse,
  applicableCount,
  exemptedCount
}: ApplicableTaxesProps) => {
  const {
    wardNo,
    propertyNo,
    partitionNo,
    isValuationTab,
    asseYearOptions,
    useTypeOptions,
    selectedAsseYear,
    selectedFloorUse,
    pageNumber,
    setPageNumber,
    paginatedData,
    filteredTaxes,
    columns,
    handleClose,
    handleParamChange,
    t,
  } = useApplicableTaxes({
    asseYearsResponse,
    useGroupsResponse,
    valuationTab,
    taxApplicabilityResponse,
  });

  return (
    <div className="flex flex-col h-full bg-white relative overflow-hidden">
      {/* Non-scrollable Body */}
      <div className="flex-1 p-4 flex flex-col overflow-hidden pb-24">
        {/* Cards Grid */}
        <div className="grid grid-cols-3 gap-3 mb-4">
          <div className="bg-white border border-[#DCEAFF] rounded-xl p-2 flex flex-col justify-center min-h-[64px] shadow-sm">
            <span className="text-[11px] font-extrabold text-blue-900/60 uppercase tracking-wider">
              {t('property')}
            </span>
            <span className="text-xs font-extrabold text-slate-800 mt-1 truncate">
              {wardNo || '—'} {propertyNo ? `/ ${propertyNo}` : ''} {partitionNo && partitionNo !== '0' ? ` - ${partitionNo}` : ''}
            </span>
          </div>

          <div className="bg-white border border-[#DCEAFF] rounded-xl p-2 flex flex-col justify-center min-h-[64px] shadow-sm">
            <span className="text-[11px] font-extrabold text-blue-900/60 uppercase tracking-wider mb-0.5">
              {t('asseYear')}
            </span>
            <SearchSelect
              options={asseYearOptions}
              value={selectedAsseYear}
              onChange={(_, val) => handleParamChange('asseYear', val)}
              disableSearch={false}
              placeholder={t('selectAsseYear')}
            />
          </div>

          <div className="bg-white border border-[#DCEAFF] rounded-xl p-2 flex flex-col justify-center min-h-[64px] shadow-sm">
            <span className="text-[11px] font-extrabold text-blue-900/60 uppercase tracking-wider mb-0.5">
              {isValuationTab ? t('useType') : t('floorUse')}
            </span>
            <SearchSelect
              options={useTypeOptions}
              value={selectedFloorUse}
              onChange={(_, val) => handleParamChange('floorUse', val)}
              disableSearch={false}
              placeholder={t('selectFloorUse')}
            />
          </div>
        </div>

        {/* Tab Navigation header */}
        <ApplicableTaxesTabNavigation
          applicableCount={applicableCount}
          exemptedCount={exemptedCount}
        />

        {/* Custom Master Table Container */}
        <div className="flex-1 overflow-hidden min-h-0">
          <TaxesTableTemplate
            columns={columns}
            data={paginatedData}
            pageNumber={pageNumber}
            totalCount={filteredTaxes.length}
            onPageChange={(page) => setPageNumber(page)}
          />
        </div>
      </div>

      {/* Fixed Footer */}
      <FixedFooter onConfirm={handleClose} />
    </div>
  );
};

export default ApplicableTaxes;
