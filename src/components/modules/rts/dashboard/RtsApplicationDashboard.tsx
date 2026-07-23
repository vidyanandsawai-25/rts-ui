'use client';

import { useEffect, useMemo, useState } from 'react';
import { getUserMisDashboardAction } from '@/app/[locale]/rts/dashboard/rts-applications/actions';
import type { CmsMisDashboardUserApplicationItem } from '@/types/rts/rtsmisdashboard.types';
import { Drawer } from '@/components/common/Drawer';
import { useTranslations } from 'next-intl';
import {
  AlertCircle,
  CheckCircle2,
  ChevronRight,
  Clock3,
  Download,
  FileText,
  Filter,
  LayoutDashboard,
  TriangleAlert,
} from 'lucide-react';

import {
  Button,
  Card,
  Label,
  MasterTable,
  SearchInput,
  Select,
  ViewButton,
} from '@/components/common';
import type { Column } from '@/components/common/MasterTable';
import ApplicationDrawerContent from './RtsApplicationDrawerContext';

interface RtsApplicationDashboardProps {
  // data: RtsApplication[];
  data: any[];
  masters: {
    departments: Array<{ id: string; name: string }>;
    services: Array<{ id: string; name: string; departmentId: string }>;
  };
  locale: string;
}

interface SlaRecord extends Record<string, unknown> {
  id: string;
  appId: string;
  citizenName: string;
  serviceName: string;
  departmentId: string;
  submittedDate: string;
  slaLimit: number;
  pendingDays: number;
  inProgressDays: number;
  needsInfoDays: number;
  verificationDays: number;
  totalTat: number;
  outcome: 'Within SLA' | 'SLA breached' | 'At risk';
  applicationStatus: 'Approved' | 'Pending' | 'Reverted' | 'Rejected';
}

const PAGE_SIZE_OPTIONS = [5, 10, 20, 50];

function normalizeApplicationStatus(
  value: unknown
): 'Approved' | 'Pending' | 'Reverted' | 'Rejected' {
  const normalized = String(value ?? '')
    .trim()
    .toLowerCase();

  if (
    normalized.includes('approve') ||
    normalized.includes('complete') ||
    normalized.includes('success')
  ) {
    return 'Approved';
  }

  if (
    normalized.includes('reject') ||
    normalized.includes('cancel') ||
    normalized.includes('decline')
  ) {
    return 'Rejected';
  }

  if (
    normalized.includes('revert') ||
    normalized.includes('return') ||
    normalized.includes('sent back')
  ) {
    return 'Reverted';
  }

  return 'Pending';
}

export default function RtsApplicationDashboard({
  data: _data,
  masters: _masters,
  locale,
}: RtsApplicationDashboardProps) {
  const t = useTranslations('rts');
  const tCommon = useTranslations('common');

  const [dashboardData, setDashboardData] = useState<CmsMisDashboardUserApplicationItem[]>([]);

  const [loading, setLoading] = useState(true);

  const [applicationType, setApplicationType] = useState('all');

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRecord, setSelectedRecord] = useState<SlaRecord | null>(null);
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [pageNumber, setPageNumber] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  useEffect(() => {
    async function loadDashboard() {
      try {
        setLoading(true);

        const response = await getUserMisDashboardAction();

        if (response.status) {
          setDashboardData(response.data.userApplicationDashboardData ?? []);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    loadDashboard();
  }, []);

  const numberFormatter = useMemo(
    () => new Intl.NumberFormat(locale === 'mr' ? 'mr-IN' : locale === 'hi' ? 'hi-IN' : 'en-IN'),
    [locale]
  );

  const slaRecords = useMemo<SlaRecord[]>(() => {
    return dashboardData.map((application, index) => {
      const applicationStatus = normalizeApplicationStatus(application.status);

      const pendingDays = application.sla;
      const inProgressDays = 0;
      const needsInfoDays = 0;
      const verificationDays = 0;

      const totalTat = pendingDays + inProgressDays + needsInfoDays + verificationDays;

      const slaLimit = application.sla;

      let outcome: SlaRecord['outcome'] = 'Within SLA';

      if (totalTat > slaLimit) {
        outcome = 'SLA breached';
      } else if (slaLimit - totalTat <= 2) {
        outcome = 'At risk';
      }

      return {
        id: String(index + 1),
        appId: application.applicationNo,
        citizenName: '-',
        serviceName: application.serviceName,
        departmentId: '',
        submittedDate: application.submittedDate,
        slaLimit,
        pendingDays,
        inProgressDays,
        needsInfoDays,
        verificationDays,
        totalTat,
        outcome,
        applicationStatus,
      };
    });
  }, [dashboardData, t]);

  const filteredRecords = useMemo(() => {
    const query = searchTerm.toLocaleLowerCase(locale).trim();

    return slaRecords.filter((record) => {
      const matchesSearch =
        !query ||
        record.appId.toLocaleLowerCase(locale).includes(query) ||
        record.citizenName.toLocaleLowerCase(locale).includes(query) ||
        record.serviceName.toLocaleLowerCase(locale).includes(query);
      const matchesService = applicationType === 'all' || record.serviceName === applicationType;
      const matchesStatus = selectedStatus === 'all' || record.applicationStatus === selectedStatus;

      return matchesSearch && matchesService && matchesStatus;
    });
  }, [applicationType, locale, searchTerm, selectedStatus, slaRecords]);

  const statusSummary = useMemo(() => {
    return slaRecords.reduce(
      (summary, record) => {
        summary.total += 1;

        if (record.applicationStatus === 'Approved') {
          summary.approved += 1;
        } else if (record.applicationStatus === 'Rejected') {
          summary.rejected += 1;
        } else if (record.applicationStatus === 'Reverted') {
          summary.reverted += 1;
        } else {
          summary.pending += 1;
        }

        return summary;
      },
      {
        total: 0,
        approved: 0,
        pending: 0,
        reverted: 0,
        rejected: 0,
      }
    );
  }, [slaRecords]);

  const totalPages = Math.max(1, Math.ceil(filteredRecords.length / pageSize));

  const paginatedRecords = useMemo(() => {
    const startIndex = (pageNumber - 1) * pageSize;
    return filteredRecords.slice(startIndex, startIndex + pageSize);
  }, [filteredRecords, pageNumber, pageSize]);

  useEffect(() => {
    setPageNumber(1);
  }, [searchTerm, pageSize]);

  useEffect(() => {
    if (pageNumber > totalPages) {
      setPageNumber(totalPages);
    }
  }, [pageNumber, totalPages]);

  const getStatusLabel = (status: SlaRecord['applicationStatus']) => {
    switch (status) {
      case 'Approved':
        return t('applicationDashboard.status.approved');
      case 'Rejected':
        return t('applicationDashboard.status.rejected');
      case 'Reverted':
        return t('applicationDashboard.status.reverted');
      default:
        return t('applicationDashboard.status.pending');
    }
  };

  const columns = useMemo<Column<SlaRecord>[]>(
    () => [
      {
        key: 'appId',
        label: t('applicationDashboard.table.applicationNo'),
        align: 'center',
        width: '16%',
        render: (_value, row) => (
          <div className="space-y-1">
            <div className="font-semibold text-[#173B73] text-sm">{row.appId}</div>
          </div>
        ),
      },

      {
        key: 'submittedDate',
        label: t('applicationDashboard.table.submittedDate'),
        width: '12%',
        align: 'center',
        render: (value) => {
          const date = new Date(String(value));

          return (
            <div className="space-y-1">
              <div className="font-medium text-slate-800 text-sm">{date.toLocaleDateString()}</div>

              <div className="text-[11px] text-slate-400">
                {date.toLocaleTimeString([], {
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </div>
            </div>
          );
        },
      },

      {
        key: 'citizenName',
        label: t('applicationDashboard.table.applicantOwner'),
        align: 'center',
        width: '18%',
        render: (_value, row) => (
          <div>
            <div className="font-semibold text-slate-800 text-sm">{row.citizenName}</div>

            <div className="text-[11px] text-slate-500">Plot No. 12, Shivaji Nagar</div>
          </div>
        ),
      },

      {
        key: 'serviceName',
        label: t('applicationDashboard.table.applicationTypeWork'),
        width: '18%',
        render: (_value, row) => (
          <div>
            <div className="font-semibold text-slate-800 text-sm">{row.serviceName}</div>
          </div>
        ),
      },

      {
        key: 'applicationStatus',
        label: t('applicationDashboard.table.statusAndStage'),
        width: '16%',
        align: 'center',
        render: (_value, row) => (
          <div className="flex flex-col items-center gap-1">
            <span
              className={`inline-flex items-center gap-1 rounded-md border px-2 py-0.5 text-[11px] font-semibold
                ${
                  row.applicationStatus === 'Approved'
                    ? 'border-green-200 bg-green-50 text-green-700'
                    : row.applicationStatus === 'Rejected'
                      ? 'border-red-200 bg-red-50 text-red-700'
                      : row.applicationStatus === 'Reverted'
                        ? 'border-violet-200 bg-violet-50 text-violet-700'
                        : 'border-amber-200 bg-amber-50 text-amber-700'
                }
            `}
            >
              <span
                className={`
                h-2
                w-2
                rounded-full
                ${
                  row.applicationStatus === 'Approved'
                    ? 'bg-green-500'
                    : row.applicationStatus === 'Rejected'
                      ? 'bg-red-500'
                      : row.applicationStatus === 'Reverted'
                        ? 'bg-violet-500'
                        : 'bg-amber-500'
                }
              `}
              />

              {getStatusLabel(row.applicationStatus)}
            </span>

            <span className="text-[11px] text-slate-500">Junior Engineer</span>
          </div>
        ),
      },

      {
        key: 'pendingDays',
        label: t('applicationDashboard.table.daysPending'),
        width: '10%',
        align: 'center',
        render: (_, row) => (
          <div className="inline-flex h-7 min-w-[30px] items-center justify-center rounded-lg bg-red-50 px-2 text-xs font-bold text-red-600">
            {row.pendingDays}
          </div>
        ),
      },
    ],
    [t]
  );

  const metricCards = [
    {
      key: 'total',
      icon: FileText,
      label: t('applicationDashboard.cards.totalApplications'),
      value: statusSummary.total,
      borderClassName: 'border-l-[#2563EB]',
      valueClassName: 'text-slate-900',
      iconClassName: 'bg-blue-50 border-blue-100 text-[#2563EB]',
    },
    {
      key: 'approved',
      icon: CheckCircle2,
      label: t('applicationDashboard.cards.approved'),
      value: statusSummary.approved,
      borderClassName: 'border-l-[#10B981]',
      valueClassName: 'text-[#10B981]',
      iconClassName: 'bg-emerald-50 border-emerald-100 text-[#10B981]',
    },
    {
      key: 'pending',
      icon: Clock3,
      label: t('applicationDashboard.cards.pending'),
      value: statusSummary.pending,
      borderClassName: 'border-l-[#F59E0B]',
      valueClassName: 'text-[#F59E0B]',
      iconClassName: 'bg-amber-50 border-amber-100 text-[#F59E0B]',
    },
    {
      key: 'reverted',
      icon: AlertCircle,
      label: t('applicationDashboard.cards.reverted'),
      value: statusSummary.reverted,
      borderClassName: 'border-l-violet-500',
      valueClassName: 'text-violet-600',
      iconClassName: 'bg-violet-50 border-violet-100 text-violet-600',
    },
    {
      key: 'rejected',
      icon: TriangleAlert,
      label: t('applicationDashboard.cards.rejected'),
      value: statusSummary.rejected,
      borderClassName: 'border-l-[#EF4444]',
      valueClassName: 'text-[#EF4444]',
      iconClassName: 'bg-rose-50 border-rose-100 text-[#EF4444]',
    },
  ];

  const applicationTypeOptions = useMemo(
    () => [
      { label: t('applicationDashboard.filters.allTypes'), value: 'all' },
      ...Array.from(
        new Map(slaRecords.map((record) => [record.serviceName, record.serviceName])).values()
      ).map((serviceName) => ({
        label: serviceName,
        value: serviceName,
      })),
    ],
    [slaRecords, t]
  );

  const statusOptions = useMemo(
    () => [
      { label: t('applicationDashboard.filters.allStatuses'), value: 'all' },
      ...Array.from(new Set(slaRecords.map((record) => record.applicationStatus))).map(
        (status) => ({
          label: getStatusLabel(status),
          value: status,
        })
      ),
    ],
    [slaRecords, t]
  );

  if (loading) {
    return (
      <Card className="p-10 text-center">{t('applicationDashboard.applications.loading')}</Card>
    );
  }

  return (
    <div className="space-y-4">
      <Card
        padding="sm"
        className="flex items-center gap-4 rounded-2xl border-slate-200 bg-white shadow-sm"
      >
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-blue-100 bg-blue-50 text-blue-600">
          <LayoutDashboard className="h-5 w-5" />
        </div>
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-800">
            {t('applicationDashboard.title')}
          </h1>
          <p className="mt-0.5 text-[13px] text-slate-500">{t('applicationDashboard.subtitle')}</p>
        </div>
      </Card>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-5">
        {metricCards.map((metric) => (
          <Card
            key={metric.key}
            padding="none"
            className={`relative overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm transition-all duration-200 hover:shadow-md hover:-translate-y-0.5 border-l-[4px] ${metric.borderClassName}`}
          >
            <div className="flex items-center justify-between px-5 py-4">
              {/* Left */}
              <div className="flex flex-col">
                <span className="text-[13px] font-semibold text-slate-600">{metric.label}</span>

                <span className={`mt-2 text-2xl font-bold leading-none ${metric.valueClassName}`}>
                  {numberFormatter.format(metric.value)}
                </span>
              </div>

              {/* Right Icon */}
              <div
                className={`flex h-14 w-14 items-center justify-center rounded-xl border ${metric.iconClassName}`}
              >
                <metric.icon className="size-5" strokeWidth={2} />
              </div>
            </div>
          </Card>
        ))}
      </div>

      <Card
        padding="none"
        className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"
      >
        {/* ================= Header ================= */}
        <div className="border-b border-slate-200 px-6 py-5">
          {/* Row 1 */}
          <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
            {/* Left */}
            <div>
              <h2 className="flex items-center gap-2 text-lg font-bold text-[#183B6B]">
                <FileText className="h-5 w-5 text-[#183B6B]" />
                {t('applicationDashboard.applications.title')}
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                {t('applicationDashboard.applications.description')}
              </p>
            </div>

            {/* Right */}
            <div className="flex flex-wrap items-center gap-2">
              <Button size="sm" icon={FileText} variant="primary" className="rounded-lg px-4">
                {t('applicationDashboard.actions.registerApplication')}
              </Button>

              <Button
                size="sm"
                icon={Download}
                className="rounded-lg bg-[#C89317] px-4 text-white hover:bg-[#AF7F10]"
              >
                {t('applicationDashboard.actions.downloadRegister')}
              </Button>
            </div>
          </div>

          <div className="mt-5 flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
              <div className="w-full space-y-1 sm:w-44">
                <Label className="text-[10px] font-bold uppercase text-[#3d3d3d]">
                  {t('applicationDashboard.filters.applicationType')}
                </Label>
                <Select
                  className="w-44"
                  options={applicationTypeOptions}
                  value={applicationType}
                  onChange={(_, value) => setApplicationType(value)}
                />
              </div>

              <div className="w-full space-y-1 sm:w-36">
                <Label className="text-[10px] font-bold uppercase text-[#3d3d3d]">
                  {tCommon('status.label')}
                </Label>
                <Select
                  className="w-36"
                  options={statusOptions}
                  value={selectedStatus}
                  onChange={(_, value) => setSelectedStatus(value)}
                />
              </div>
            </div>

            <div className="flex items-end gap-3 xl:w-[460px]">
              <div className="min-w-0 flex-1 space-y-1 xl:w-[460px]">
                <Label className="text-[10px] font-bold uppercase text-[#3d3d3d]">
                  {tCommon('actions.search')}
                </Label>
                <SearchInput
                  value={searchTerm}
                  onChange={setSearchTerm}
                  placeholder={t('applicationDashboard.applications.searchPlaceholder')}
                  className="mb-0 w-full"
                />
              </div>

              <button
                type="button"
                aria-label={t('applicationDashboard.actions.openFilters')}
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-slate-300 bg-white transition hover:bg-slate-50"
              >
                <Filter className="h-5 w-5 text-slate-500" />
              </button>
            </div>
          </div>
        </div>

        <MasterTable<SlaRecord>
          columns={columns}
          data={paginatedRecords}
          loading={loading}
          emptyText={t('applicationDashboard.applications.empty')}
          getRowKey={(row) => row.id}
          renderActions={(row) => (
            <div className="flex justify-center gap-2">
              <ViewButton
                onClick={() => setSelectedRecord(row)}
                aria-label={t('applicationDashboard.actions.viewDetailsAria', {
                  appId: row.appId,
                })}
                title={t('applicationDashboard.actions.viewDetailsAria', {
                  appId: row.appId,
                })}
                className="rounded-full px-2.5 text-[10px]"
                size="xs"
              >
                {t('applicationDashboard.actions.viewDetails')}
              </ViewButton>
              <Button
                type="button"
                variant="primary"
                size="xs"
                // onClick={() => setSelectedRecord(row)}
                icon={ChevronRight}
                title={t('applicationDashboard.actions.processAria', {
                  appId: row.appId,
                })}
              >
                {t('applicationDashboard.actions.process')}
              </Button>
            </div>
          )}
          actionLabel={t('applicationDashboard.table.actions')}
          pageNumber={pageNumber}
          pageSize={pageSize}
          totalCount={filteredRecords.length}
          totalPages={totalPages}
          onPageChange={setPageNumber}
          onPageSizeChange={setPageSize}
          pageSizeOptions={PAGE_SIZE_OPTIONS}
          paginationConfig={{
            enabled: true,
            showPageSizeSelector: true,
          }}
          maxBodyHeightClassName="max-h-[520px]"
          containerClassName="gap-0 [&>div]:!border-0 [&>div]:!shadow-none [&>div]:!rounded-none"
          // theadClassName="!bg-slate-50 !from-slate-50 !via-slate-50 !to-slate-50 hover:!from-slate-50 hover:!via-slate-50 hover:!to-slate-50 [&_th]:!text-slate-700"
          theadClassName="
  !bg-[#143D7D]
  [&_tr]:!bg-[#143D7D]
  [&_th]:!bg-[#143D7D]
  [&_th]:!text-white
  [&_th]:font-semibold
  [&_th]:uppercase
  [&_th]:tracking-wide
  [&_th]:text-xs
  [&_th]:border-none"
          // tableClassName="[&_thead_tr]:border-b [&_thead_tr]:border-slate-200 [&_tbody_tr]:border-b [&_tbody_tr]:border-slate-100 [&_tbody_tr]:bg-white [&_tbody_tr:hover]:bg-slate-50/70 [&_th]:uppercase"
          tableClassName="[&_tbody_tr]:hover:bg-blue-50 [&_tbody_tr]:h-[74px] [&_tbody_td]:py-3 [&_tbody_td]:text-sm [&_tbody_td]:align-middle [&_thead_tr]:border-none [&_tbody_tr]:border-b [&_tbody_tr]:border-slate-100"
          footerLeftContent={
            <span className="text-[12px] text-slate-400">
              {t('applicationDashboard.pagination.showing', {
                shown: numberFormatter.format(paginatedRecords.length),
                total: numberFormatter.format(filteredRecords.length),
              })}
            </span>
          }
          footerClassName="!border-slate-100 !bg-white !shadow-none"
          footerLeftClassName="text-slate-400"
        />
      </Card>

      {selectedRecord && (
        <Drawer
          open={!!selectedRecord}
          onClose={() => setSelectedRecord(null)}
          width="md"
          title={
            selectedRecord && (
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-blue-100 bg-blue-50">
                  <FileText className="h-5 w-5 text-blue-600" />
                </div>

                <div>
                  <div className="text-[11px] font-bold uppercase tracking-wide text-slate-700">
                    {selectedRecord.appId}
                  </div>

                  <div className="text-lg font-bold text-slate-800">
                    {selectedRecord.serviceName}
                  </div>
                </div>
              </div>
            )
          }
        >
          {selectedRecord && (
            <ApplicationDrawerContent
              record={selectedRecord}
              onClose={() => setSelectedRecord(null)}
            />
          )}
        </Drawer>
      )}
    </div>
  );
}
