/* eslint-disable @typescript-eslint/no-explicit-any */
import { useTranslations } from 'next-intl';
import { Card } from '@/components/common/Card';
import { ScopeSelectionPanelProps } from './ScopeSelectionUtils';
import { ExecutionReviewModal } from './ExecutionReviewModal';
import { ScopeDynamicFields } from './ScopeDynamicFields';
import { ScopeValidation } from './ScopeValidation';
import { ScopeTabs } from './ScopeTabs';
import { useScopeSelection } from '../../../../../hooks/add-taxes/useScopeSelection';
import { Modal } from '@/components/common/Modal';
import { MasterTable, Column } from '@/components/common/MasterTable';
import { DashboardCard } from '@/components/common/DashboardCard';
import { CancelButton } from '@/components/common/ActionButtons';

export function ScopeSelectionPanel({
  scopes,
  selectedScope,
  handleScopeChange,
  selectionData,
  handleSelectionChange,
  scopeOptions,
  zoneOptions = [],
  propertyTypeOptions = [],
  onStartExecution,
  isInitialized,
  financeYear
}: ScopeSelectionPanelProps) {
  const t = useTranslations('addTaxes');
  const currentScopeData = scopeOptions.find(s => s.scopeType === selectedScope);
  const optionsToRender = selectedScope === 'property' ? ['Search Property'] : (currentScopeData?.options || []);

  const {
    isValidated,
    isModalOpen, setIsModalOpen,
    isCalculating,
    eligibleCount,
    fetchedWards, fetchWards,
    fetchedBuildings, fetchBuildings,
    handleCalculateEligible,
    executeJob,
    isPreviewModalOpen, setIsPreviewModalOpen,
    previewData,
    isPreviewLoading,
    handlePreview,
    previewPage, setPreviewPage,
    previewPageSize, setPreviewPageSize,
    fetchedAssessmentStatuses,
    fetchAssessmentStatuses
  } = useScopeSelection(selectedScope, selectionData, currentScopeData, propertyTypeOptions, isInitialized, onStartExecution);

  const previewColumns: Column<any>[] = [
    { key: 'zone', label: t('preview.columns.zone'), width: '15%' },
    {
      key: 'propertyNo',
      label: t('preview.columns.propertyNo'),
      width: '20%',
      render: (_, record) => {
        const ward = record.ward || '';
        const propNo = record.propertyNo || '';
        const partNo = record.partitionNo || '';
        return `${ward}-${propNo}${partNo ? `-${partNo}` : ''}`;
      }
    },
    { key: 'owner', label: t('preview.columns.owner'), width: '25%' },
    {
      key: 'isEligible',
      label: t('preview.columns.status'),
      width: '15%',
      render: (val) => (
        <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${val ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}`}>
          {val ? t('preview.status.eligible') : t('preview.status.skipped')}
        </span>
      )
    },
    {
      key: 'skipReason',
      label: t('preview.columns.skipReason'),
      width: '25%',
      render: (val) => <div className="text-xs text-gray-500">{val ? (t.has(val) ? t(val) : val) : '-'}</div>
    }
  ];

  return (
    <Card className="lg:col-span-2">
      <div className="mb-4">
        <h3 className="text-lg font-bold text-gray-900">{t('scopeSelection.title')}</h3>
        <p className="text-xs text-gray-500">{t('scopeSelection.subtitle')}</p>
      </div>

      <ScopeTabs
        scopes={scopes}
        selectedScope={selectedScope}
        handleScopeChange={handleScopeChange}
      />

      <ScopeDynamicFields
        key={selectedScope}
        selectedScope={selectedScope}
        currentScopeData={currentScopeData}
        optionsToRender={optionsToRender}
        selectionData={selectionData}
        handleSelectionChange={handleSelectionChange}
        zoneOptions={zoneOptions}
        fetchedWards={fetchedWards}
        fetchWards={fetchWards}
        propertyTypeOptions={propertyTypeOptions}
        fetchedBuildings={fetchedBuildings}
        fetchBuildings={fetchBuildings}
        isCalculating={isCalculating}
        isValidated={isValidated}
        eligibleCount={eligibleCount}
        handleCalculateEligible={handleCalculateEligible}
        assessmentStatusOptions={fetchedAssessmentStatuses}
        fetchAssessmentStatuses={fetchAssessmentStatuses}
      />

      <ScopeValidation
        isValidated={isValidated}
        eligibleCount={eligibleCount}
        setIsModalOpen={setIsModalOpen}
      />

      <ExecutionReviewModal
        isModalOpen={isModalOpen}
        setIsModalOpen={setIsModalOpen}
        currentScopeData={currentScopeData}
        eligibleCount={eligibleCount}
        onStartExecution={executeJob}
        onPreview={handlePreview}
        isPreviewLoading={isPreviewLoading}
        financeYear={financeYear}
      />

      <Modal
        open={isPreviewModalOpen}
        onClose={() => setIsPreviewModalOpen(false)}
        title={t('preview.title')}
        subtitle={t('preview.subtitle')}
        maxWidth="2xl"
        footer={
          <div className="flex justify-end w-full">
            <CancelButton label={t('preview.close')} onClick={() => setIsPreviewModalOpen(false)} />
          </div>
        }
      >
        {previewData && (
          <div className="flex flex-col gap-6">
            {/* Summary Cards */}
            <div className="grid grid-cols-4 gap-4">
              <DashboardCard
                label={t('preview.totalSelected')}
                value={previewData.totalSelected}
                valueColor="text-slate-800"
              />
              <DashboardCard
                label={t('preview.eligible')}
                value={previewData.eligible}
                valueColor="text-green-700"
              />
              <DashboardCard
                label={t('preview.skipped')}
                value={previewData.skipped}
                valueColor="text-red-700"
              />
              <DashboardCard
                label={t('preview.requiresApproval')}
                value={previewData.requiresApproval}
                valueColor="text-orange-700"
              />
            </div>

            {/* Records Table */}
            <div className="border border-slate-200 rounded-lg overflow-hidden bg-white">
              <MasterTable
                columns={previewColumns}
                data={previewData.records}
                totalCount={previewData.totalSelected}
                pageNumber={previewPage}
                pageSize={previewPageSize}
                totalPages={Math.ceil(previewData.totalSelected / previewPageSize)}
                onPageChange={setPreviewPage}
                onPageSizeChange={setPreviewPageSize}
                paginationConfig={{ enabled: true, showPageSizeSelector: true }}
                height="sm"
              />
            </div>
          </div>
        )}
      </Modal>
    </Card >
  );
}
