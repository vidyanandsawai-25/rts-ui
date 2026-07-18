/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useTranslations } from 'next-intl';
import { InitOperationsResponse, ScopeOptionItem } from '@/types/addTaxes.types';
import { Tabs } from '@/components/common/Tabs';
import { Button } from '@/components/common/ActionButton';
import { Select } from '@/components/common/select';
import { DashboardCard } from '@/components/common/DashboardCard';
import { CheckCircle, FileText, BookOpen, Loader2 } from 'lucide-react';

import { useState, useEffect, useTransition } from 'react';
import { toast } from 'sonner';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { useAddTaxesState } from '@/hooks/add-taxes/useAddTaxesState';
import { ScopeSelectionPanel } from './ManualSelectionTab/ScopeSelectionPanel';
import { ValidateEligibilityPanel } from './ManualSelectionTab/ValidateEligibilityPanel';
import { ExecutionProgressPanel } from './ManualSelectionTab/ExecutionProgressPanel';
import { AuditMonitorTab } from './auditMonitorTab/AuditMonitorTab';
import { GuidelinesModal } from './GuidelinesModal';
import { UserManualModal } from './UserManualModal';
import ExcelImportTab from './excelImportTab/ExcelImportTab';

export function AddTaxesActions() {
  const t = useTranslations('addTaxes');
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const openModal = (param: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set(param, 'true');
    router.push(`${pathname}?${params.toString()}`);
  };

  return (
    <div className="flex gap-2">
      <Button variant="secondary" size='sm' icon={FileText} onClick={() => openModal('showGuidelines')}>
        {t('buttons.guidelines')}
      </Button>
      <Button variant="secondary" size='sm' icon={BookOpen} onClick={() => openModal('showUserManual')}>
        {t('buttons.userManual')}
      </Button>
    </div>
  );
}

interface AddTaxesConsoleProps {
  initData: InitOperationsResponse | null;
  scopeOptions?: ScopeOptionItem[];
  zoneOptions?: { value: string; label: string }[];
  propertyTypeOptions?: { value: string; label: string }[];
  allJobCodes?: string[];
  filteredJobs?: any[];
  totalCount?: number;
  totalPages?: number;
  pageNumber?: number;
  pageSize?: number;
  auditStats?: {
    total: number;
    completed: number;
    running: number;
    failed: number;
  };
  selectedJobDetails?: any | null;
  detailProperties?: any[];
}

export default function AddTaxesConsole({
  initData,
  scopeOptions = [],
  zoneOptions = [],
  propertyTypeOptions = [],
  allJobCodes = [],
  filteredJobs = [],
  totalCount = 0,
  totalPages = 0,
  pageNumber = 1,
  pageSize = 10,
  auditStats,
  selectedJobDetails = null,
  detailProperties = [],
}: AddTaxesConsoleProps) {
  const {
    t,
    selectedScope,
    selectedAction,
    setSelectedAction,
    selectionData,
    handleSelectionChange,
    financeYearId,
    handleFinanceYearChange,
    handleScopeChange,
    stats,
    financeYearOptions,
    scopes,
    actions,
    isInitialized,
  } = useAddTaxesState(initData, scopeOptions);

  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const [activeJob, setActiveJob] = useState<{ jobId: string; total: number; scheduledTime?: string } | null>(null);
  const [showProgress, setShowProgress] = useState(false);

  useEffect(() => {
    if (!activeJob) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setShowProgress(false);
      return;
    }
    if (!activeJob.scheduledTime) {
      setShowProgress(true);
      return;
    }
    const scheduledDate = new Date(activeJob.scheduledTime);
    setShowProgress(scheduledDate.getTime() <= Date.now());
  }, [activeJob]);

  useEffect(() => {
    if (!activeJob || !activeJob.scheduledTime) return;

    const scheduledDate = new Date(activeJob.scheduledTime);
    const now = new Date();
    const delay = scheduledDate.getTime() - now.getTime();

    if (delay <= 0) return;

    const timer = setTimeout(() => {
      setShowProgress(true);
      toast.info(t('messages.scheduledJobStarted', { jobId: activeJob.jobId }));
    }, delay);

    return () => clearTimeout(timer);
  }, [activeJob, t]);

  const currentTab = searchParams.get('tab') || 'manual';

  const handleTabChange = (val: any) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('tab', String(val));
    if (val !== 'excel') {
      params.delete('excelPage');
      params.delete('excelPageSize');
    }
    if (val !== 'manual') {
      params.delete('previewPage');
      params.delete('previewPageSize');
    }
    startTransition(() => {
      router.push(`${pathname}?${params.toString()}`, { scroll: false });
    });
  };

  const mappedFinanceYearOptions = financeYearOptions.map(opt => ({
    value: String(opt.value),
    label: opt.label
  }));


  return (
    <div className="relative w-full">
      <div className="flex flex-col gap-4">
        {/* Stats Row */}
        <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
          {/* Finance Year */}
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <Select
              label={t('stats.financeYear')}
              required
              options={mappedFinanceYearOptions}
              value={financeYearId}
              onChange={(e) => handleFinanceYearChange(e.target.value)}
              selectSize="sm"
            />
          </div>

          {/* Stats */}
          <DashboardCard
            label={t('stats.totalProperties')}
            value={stats.totalProperties}
            valueColor="text-gray-900"
          />
          <DashboardCard
            label={t('stats.eligibleRecords')}
            value={stats.eligibleRecords}
            valueColor="text-blue-600"
          />
          <DashboardCard
            label={t('stats.skippedLocked')}
            value={stats.skippedRecords}
            valueColor="text-orange-500"
          />
          <DashboardCard
            label={t('stats.runningJobs')}
            value={stats.runningJobs}
            valueColor="text-green-600"
          />

          {/* User Permission */}
          <div className="bg-green-50 rounded-lg border border-green-200 p-4">
            <div className="flex items-center gap-2 mb-1 text-green-700 font-medium text-sm">
              <CheckCircle className="h-4 w-4" />
              {t('permissions.title')}
            </div>
            <div className="text-xs text-green-600 leading-tight">
              {t('permissions.allowedMessage')}
            </div>
          </div>
        </div>

        {/* Processing Job */}
        {activeJob && showProgress && (
          <ExecutionProgressPanel
            jobId={activeJob.jobId}
            totalRecords={activeJob.total}
            onComplete={() => setActiveJob(null)}
          />
        )}

        {/* Main Tabs */}
        <Tabs value={currentTab} onChange={handleTabChange} className="w-full">
          <Tabs.TabList scrollable={false}>
            <Tabs.Tab value="manual">{t('tabs.manualSelection')}</Tabs.Tab>
            <Tabs.Tab value="excel">{t('tabs.excelImport')}</Tabs.Tab>
            <Tabs.Tab value="audit">{t('tabs.auditMonitor')}</Tabs.Tab>
          </Tabs.TabList>

          {isPending ? (
            <div className="flex items-center justify-center min-h-[40vh] bg-white rounded-lg border border-gray-200 mt-6 shadow-sm">
              <div className="flex flex-col items-center space-y-4">
                <Loader2 className="h-12 w-12 animate-spin text-blue-600" />
                <h2 className="text-lg font-semibold text-gray-900">{t('loading.message')}</h2>
                <p className="text-gray-500 text-xs">{t('loading.description')}</p>
              </div>
            </div>
          ) : (
            <>
              <Tabs.TabPanel value="manual">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-0">
                  {/* Left Panel - Scope Selection */}
                  <ScopeSelectionPanel
                    scopes={scopes}
                    selectedScope={selectedScope}
                    handleScopeChange={handleScopeChange}
                    selectionData={selectionData}
                    handleSelectionChange={handleSelectionChange}
                    scopeOptions={scopeOptions}
                    zoneOptions={zoneOptions}
                    propertyTypeOptions={propertyTypeOptions}
                    onStartExecution={(jobId, total, scheduledTime) => setActiveJob({ jobId, total, scheduledTime })}
                    isInitialized={isInitialized}
                    financeYear={financeYearOptions.find(opt => String(opt.value) === String(financeYearId))?.label}
                  />

                  {/* Right Panel - Validate Eligibility */}
                  <ValidateEligibilityPanel
                    actions={actions}
                    selectedAction={selectedAction}
                    setSelectedAction={setSelectedAction}
                  />
                </div>
              </Tabs.TabPanel>

              <Tabs.TabPanel value="excel">
                <ExcelImportTab
                  onStartExecution={(jobId, total, scheduledTime) => setActiveJob({ jobId, total, scheduledTime })}
                  financeYearId={financeYearId}
                  zoneOptions={zoneOptions}
                  scopeOptions={scopeOptions}
                  financeYear={financeYearOptions.find(opt => String(opt.value) === String(financeYearId))?.label}
                />
              </Tabs.TabPanel>

              <Tabs.TabPanel value="audit">
                <AuditMonitorTab
                  allJobCodes={allJobCodes}
                  filteredJobs={filteredJobs}
                  totalCount={totalCount}
                  totalPages={totalPages}
                  pageNumber={pageNumber}
                  pageSize={pageSize}
                  stats={auditStats || { total: 0, completed: 0, running: 0, failed: 0 }}
                  selectedJobDetails={selectedJobDetails}
                  detailProperties={detailProperties}
                />
              </Tabs.TabPanel>
            </>
          )}
        </Tabs>
      </div>

      <GuidelinesModal />
      <UserManualModal />
    </div>
  );
}
