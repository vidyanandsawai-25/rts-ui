/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useTranslations } from 'next-intl';
import { InitOperationsResponse, ScopeOptionItem } from '@/types/addTaxes.types';
import { Tabs } from '@/components/common/Tabs';
import { Button } from '@/components/common/ActionButton';
import { Select } from '@/components/common/select';
import { DashboardCard } from '@/components/common/DashboardCard';
import { CheckCircle, FileText, BookOpen } from 'lucide-react';
import { cn } from '@/lib/utils/cn';

import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { logger } from '@/lib/utils/logger';
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

const DEFAULT_SCOPE_OPTIONS: ScopeOptionItem[] = [
  { id: 1, name: 'ZoneNode', displayName: 'Zone / Node', description: 'Zone-wise selection', scopeType: 'zone', options: ['Zone', 'Property Type', 'Assessment Status'] },
  { id: 2, name: 'WardSector', displayName: 'Ward / Sector', description: 'Multi ward selection', scopeType: 'ward', options: ['Zone', 'Ward', 'Property Type', 'Assessment Status'] },
  { id: 3, name: 'BuildingWise', displayName: 'Building Wise', description: 'Building level', scopeType: 'building', options: ['Zone', 'Ward', 'Property No'] },
  { id: 4, name: 'PropertyWise', displayName: 'Property Wise', description: 'Property level', scopeType: 'property', options: ['UPIC Id', 'Mobile No'] },
  { id: 5, name: 'PropertyRange', displayName: 'Property Range', description: 'From-to property range', scopeType: 'range', options: ['Ward', 'Property Type', 'Assessment Status', 'From Property', 'To Property'] }
];

export interface AddTaxesActionsProps {
  initOperationsAction: (financeYearId?: string | number) => Promise<any>;
  getScopeOptionsAction: () => Promise<any>;
  fetchAllZonesAction: () => Promise<any>;
  fetchAllWardsAction: () => Promise<any>;
  fetchAllPropertyTypesAction: () => Promise<any>;
  searchPropertiesAction: (zoneId: string | number | null, wardId: string | number) => Promise<any>;
  searchPropertiesByCategoryAction: (searchCategory?: number, wardId?: string | number, pageNumber?: number, pageSize?: number, propertyFrom?: string, propertyTo?: string, zoneId?: string | number) => Promise<any>;
  getEligibleCountAction: (payload: any) => Promise<any>;
  executeOperationAction: (payload: any) => Promise<any>;
  previewOperationAction: (payload: any) => Promise<any>;
  fetchAssessmentStatusesAction: () => Promise<any>;
  getAuditListAction: (payload: any) => Promise<any>;
  getAuditDetailAction: (jobId: string) => Promise<any>;
  getJobPropertiesAction: (jobId: string, pageNumber: number, pageSize: number, status?: string) => Promise<any>;
  getImportTemplateAction: () => Promise<any>;
  getServerTimeAction: () => Promise<any>;
}

interface AddTaxesConsoleProps {
  initData: InitOperationsResponse | null;
  scopeOptions?: ScopeOptionItem[];
  actions: AddTaxesActionsProps;
}

export default function AddTaxesConsole({
  initData,
  scopeOptions = [],
  actions: actionsProp,
}: AddTaxesConsoleProps) {
  const rawScopeOptions = (scopeOptions && scopeOptions.length > 0) ? scopeOptions : DEFAULT_SCOPE_OPTIONS;
  const effectiveScopeOptions = rawScopeOptions.map(s => {
    if (s.scopeType === 'range') {
      const opts = s.options || [];
      const hasPt = opts.some(o => o.toLowerCase().includes('property type'));
      const hasAs = opts.some(o => o.toLowerCase().includes('assessment status'));
      if (!hasPt || !hasAs) {
        return {
          ...s,
          options: ['Ward', 'Property Type', 'Assessment Status', 'From Property', 'To Property']
        };
      }
    }
    return s;
  });

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
    actions: eligibilityActions,
    isInitialized,
    isFinanceYearActive,
    refreshStats,
    clearSelectionData,
  } = useAddTaxesState(initData, effectiveScopeOptions, actionsProp);

  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [activeJob, setActiveJob] = useState<{ jobId: string; total: number; scheduledTime?: string } | null>(null);
  const [showProgress, setShowProgress] = useState(false);

  const [currentTab, setCurrentTab] = useState(searchParams.get('tab') || 'manual');

  const handleTabChange = (val: string | number) => {
    const nextTab = String(val);
    setCurrentTab(nextTab);
    const params = new URLSearchParams(window.location.search);
    params.set('tab', nextTab);

    const selectionParamsToClear = [
      'zoneid', 'wardid', 'propertyid', 'propertyno', 'PropertyTypeId',
      'propertyTypeId', 'propertytypeid', 'TypeOfUseGroupId', 'PropertyTypeCode',
      'propertyTypeCode', 'typeOfUseGroupCode', 'assessmentStatusIds',
      'fromPropertyId', 'fromPropertyNo', 'toPropertyId', 'toPropertyNo',
      'searchText', 'SearchText', 'wardno'
    ];

    if (nextTab !== 'manual') {
      for (const key of selectionParamsToClear) {
        params.delete(key);
      }
      clearSelectionData(true);
    }

    if (nextTab !== 'excel') {
      params.delete('excelPage');
      params.delete('excelPageSize');
    }
    if (nextTab !== 'manual') {
      params.delete('previewPage');
      params.delete('previewPageSize');
    }
    // Ensure `scope` is removed when switching tabs
    params.delete('scope');

    window.history.pushState(null, '', `${window.location.pathname}?${params.toString()}`);
  };

  useEffect(() => {
    const fetchSkew = async () => {
      try {
        const clientRequestTime = Date.now();
        const serverTimeStr = await actionsProp.getServerTimeAction();
        if (serverTimeStr) {
          const oneWayLatency = (Date.now() - clientRequestTime) / 2;
          const serverTime = new Date(new Date(serverTimeStr).getTime() + oneWayLatency);
          const clientTime = new Date();
          const skewMs = clientTime.getTime() - serverTime.getTime();
          window.sessionStorage.setItem('ntis_clock_skew_ms', String(skewMs));
        }
      } catch (err) {
        logger.error('Failed to fetch initial clock skew', { error: err as Error });
      }
    };
    void fetchSkew();
  }, [actionsProp]);

  useEffect(() => {
    const checkActiveJobs = async () => {
      try {
        const res = await actionsProp.getAuditListAction({ PageSize: 50 });
        if (res?.items) {
          const inProgressJob = res.items.find((j: any) =>
            ['inprogress', 'running', 'pending', 'started'].includes(j.status?.toLowerCase())
          );
          if (inProgressJob) {
            const parts = inProgressJob.records?.split('/') || [];
            const total = parts[1] ? Number(parts[1].trim()) : 0;
            setActiveJob({ jobId: inProgressJob.jobId, total });
            setShowProgress(true);
          } else {
            setActiveJob(null);
          }
          refreshStats();
        } else {
          setActiveJob(null);
        }
      } catch (err) {
        logger.error('Failed to check active jobs', { error: err as Error });
      }
    };

    checkActiveJobs();
    const interval = setInterval(checkActiveJobs, 10000);
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [actionsProp]);

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

  useEffect(() => {
    if (!isFinanceYearActive && currentTab !== 'audit') {
      const timer = setTimeout(() => {
        handleTabChange('audit');
      }, 0);
      return () => clearTimeout(timer);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isFinanceYearActive, currentTab]);

  const [exportingStatus, setExportingStatus] = useState<string | null>(null);

  const handleExportProperties = async (status: string) => {
    if (exportingStatus) return;

    if (!financeYearId) {
      toast.error(
        t('messages.financeYearRequiredForExport', { fallback: 'Please select a finance year before exporting.' })
      );
      return;
    }

    setExportingStatus(status);

    const toastId = toast.loading(
      t('messages.exportingDownloading', { fallback: 'Export downloading, please wait...' })
    );

    try {
      const downloadUrl = `${pathname}/export-excel?status=${encodeURIComponent(status)}&financeYearId=${encodeURIComponent(financeYearId)}`;
      const response = await fetch(downloadUrl);

      if (!response.ok) {
        throw new Error(`Export failed with status ${response.status}`);
      }

      const blob = await response.blob();
      const contentDisposition = response.headers.get('content-disposition');
      let fileName = `property_tax_properties_${status.toLowerCase()}.csv`;
      if (contentDisposition) {
        const match = contentDisposition.match(/filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/);
        if (match && match[1]) {
          fileName = match[1].replace(/['"]/g, '');
        }
      }

      const blobUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = blobUrl;
      link.setAttribute('download', fileName);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(blobUrl);

      toast.success(
        t('messages.exportCompleted', { fallback: 'Export download completed' }),
        { id: toastId }
      );
    } catch (_error) {
      toast.error(
        t('messages.exportFailed', { fallback: 'Failed to export properties' }),
        { id: toastId }
      );
    } finally {
      setExportingStatus(null);
    }
  };

  const mappedFinanceYearOptions = financeYearOptions.map(opt => ({
    value: String(opt.value),
    label: opt.label
  }));


  return (
    <div className={cn("relative w-full", !isFinanceYearActive && "min-h-[450px]")}>
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
            onExportExcel={() => handleExportProperties('all')}
            isExporting={exportingStatus === 'all'}
          />
          <DashboardCard
            label={t('stats.eligibleRecords')}
            value={stats.eligibleRecords}
            valueColor="text-blue-600"
            onExportExcel={() => handleExportProperties('Eligible')}
            isExporting={exportingStatus === 'Eligible'}
          />
          <DashboardCard
            label={t('stats.skippedLocked')}
            value={stats.skippedRecords}
            valueColor="text-orange-500"
            onExportExcel={() => handleExportProperties('Skipped')}
            isExporting={exportingStatus === 'Skipped'}
          />
          {isFinanceYearActive && (
            <DashboardCard
              label={t('stats.runningJobs')}
              value={Math.max(stats.runningJobs || 0, activeJob && showProgress ? 1 : 0)}
              valueColor="text-green-600"
            />
          )}

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
        {isFinanceYearActive && activeJob && showProgress && (
          <ExecutionProgressPanel
            jobId={activeJob.jobId}
            totalRecords={activeJob.total}
            onComplete={() => {
              toast.success(
                t('messages.executionCompleted', { jobId: activeJob.jobId }),
                { id: `job-complete-${activeJob.jobId}` }
              );
              refreshStats();
              setTimeout(() => {
                refreshStats();
              }, 1000);
            }}
          />
        )}

        {/* Main Tabs */}
        <Tabs value={currentTab} onChange={handleTabChange} className="w-full">
          <Tabs.TabList scrollable={false}>
            {isFinanceYearActive && (
              <>
                <Tabs.Tab value="manual">{t('tabs.manualSelection')}</Tabs.Tab>
                <Tabs.Tab value="excel">{t('tabs.excelImport')}</Tabs.Tab>
              </>
            )}
            <Tabs.Tab value="audit">{t('tabs.auditMonitor')}</Tabs.Tab>
          </Tabs.TabList>

          {isFinanceYearActive && (
            <Tabs.TabPanel value="manual">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left Panel - Scope Selection */}
                <ScopeSelectionPanel
                  scopes={scopes}
                  selectedScope={selectedScope}
                  handleScopeChange={handleScopeChange}
                  selectionData={selectionData}
                  handleSelectionChange={handleSelectionChange}
                  scopeOptions={effectiveScopeOptions}
                  onStartExecution={(jobId, total, scheduledTime) => {
                    setActiveJob({ jobId, total, scheduledTime });
                    refreshStats();
                    setTimeout(() => {
                      refreshStats();
                    }, 1000);
                    clearSelectionData();
                  }}
                  isInitialized={isInitialized}
                  financeYear={financeYearOptions.find(opt => String(opt.value) === String(financeYearId))?.label}
                  actions={actionsProp}
                />

                {/* Right Panel - Validate Eligibility */}
                <ValidateEligibilityPanel
                  actions={eligibilityActions}
                  selectedAction={selectedAction}
                  setSelectedAction={setSelectedAction}
                />
              </div>
            </Tabs.TabPanel>
          )}

          {isFinanceYearActive && (
            <Tabs.TabPanel value="excel">
              <ExcelImportTab
                onStartExecution={(jobId, total, scheduledTime) => {
                  setActiveJob({ jobId, total, scheduledTime });
                  refreshStats();
                  setTimeout(() => {
                    refreshStats();
                  }, 1000);
                  clearSelectionData();
                }}
                financeYearId={financeYearId}
                scopeOptions={scopeOptions}
                financeYear={financeYearOptions.find(opt => String(opt.value) === String(financeYearId))?.label}
                actions={actionsProp}
              />
            </Tabs.TabPanel>
          )}

          <Tabs.TabPanel value="audit">
            <AuditMonitorTab financeYearId={financeYearId} actions={actionsProp} />
          </Tabs.TabPanel>
        </Tabs>
      </div>

      <GuidelinesModal />
      <UserManualModal />
    </div>
  );
}
