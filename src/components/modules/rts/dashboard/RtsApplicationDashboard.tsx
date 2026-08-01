'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import {
  AlertOctagon,
  CalendarClock,
  CheckCircle2,
  ChevronRightIcon,
  Clock3,
  FileText,
  LayoutDashboard,
  RotateCcw,
  TimerReset,
  TriangleAlert,
} from 'lucide-react';

import {
  Button,
  Card,
  Label,
  MasterTable,
  SearchInput,
  Select,
  StatusBadge,
  ViewButton,
} from '@/components/common';
import type { Column } from '@/components/common/MasterTable';
import ApplicationDrawerContent from './RtsApplicationDrawerContext';
import type {
  AdminApplicationGridRow,
  ApplicationsDashboardKpis,
  RtsApplicationsDashboardResult,
} from '@/app/[locale]/rts/dashboard/rts-applications/actions';
import type { RtsDepartmentApiItem } from '@/types/rts/departments.types';
import type { RtsServiceApiItem } from '@/types/rts/service.types';
import type { RtsApplicationApprovalDetails } from '@/types/rts/rtsapplicationapprovel.types';
import { toApplicationFilterSlug } from '@/lib/utils/rts/application-filter-slug';

interface RtsApplicationDashboardProps {
  kpis: ApplicationsDashboardKpis | null;
  rows: AdminApplicationGridRow[];
  locale: string;
  error: string | null;
  departments: RtsDepartmentApiItem[];
  services: RtsServiceApiItem[];
  filters: {
    pageNumber: number;
    pageSize: 10;
    departmentId: number | null;
    serviceId: number | null;
    departmentSlug: string;
    serviceSlug: string;
    status: string;
    search: string;
    applicationId: number | null;
  };
  pagination: RtsApplicationsDashboardResult['pagination'];
  approvalDetails: RtsApplicationApprovalDetails | null;
}

type GridRow = AdminApplicationGridRow & Record<string, unknown> & { id: number };

const PAGE_SIZE_OPTIONS = [10];

export default function RtsApplicationDashboard({
  kpis,
  rows = [],
  locale,
  error,
  departments,
  services,
  filters,
  pagination,
  approvalDetails,
}: RtsApplicationDashboardProps) {
  const t = useTranslations('rts');
  const tCommon = useTranslations('common');
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [searchInput, setSearchInput] = useState(filters.search);
  const searchReloadTimerRef = useRef<number | null>(null);

  const updateQuery = useCallback(
    (changes: Record<string, string | null>, resetPage = false) => {
      const params = new URLSearchParams(searchParams.toString());
      params.set('PageSize', '10');

      for (const [key, value] of Object.entries(changes)) {
        if (value) params.set(key, value);
        else params.delete(key);
      }

      if (resetPage) params.set('PageNumber', '1');
      router.push(`${pathname}?${params.toString()}`, { scroll: false });
    },
    [pathname, router, searchParams]
  );

  const numberFormatter = useMemo(
    () => new Intl.NumberFormat(locale === 'mr' ? 'mr-IN' : locale === 'hi' ? 'hi-IN' : 'en-IN'),
    [locale]
  );

  const gridRows = useMemo<GridRow[]>(
    () => rows.map((row) => ({ ...row, id: row.applicationId })),
    [rows]
  );
  const selectedRow = useMemo(
    () => gridRows.find((row) => row.applicationId === filters.applicationId) ?? null,
    [filters.applicationId, gridRows]
  );

  useEffect(
    () => () => {
      if (searchReloadTimerRef.current) window.clearTimeout(searchReloadTimerRef.current);
    },
    []
  );

  const deptOptions = useMemo(() => {
    return [
      { label: 'All Departments', value: 'all' },
      ...departments.map((department) => ({
        label: department.departmentName,
        value: toApplicationFilterSlug(department.departmentName),
      })),
    ];
  }, [departments]);

  const serviceOptions = useMemo(() => {
    const matchingServices = services.filter(
      (service) => filters.departmentId === null || service.departmentId === filters.departmentId
    );
    const slugCounts = matchingServices.reduce((counts, service) => {
      const slug = toApplicationFilterSlug(service.serviceName);
      counts.set(slug, (counts.get(slug) ?? 0) + 1);
      return counts;
    }, new Map<string, number>());
    const unique = matchingServices
      .filter((service) => slugCounts.get(toApplicationFilterSlug(service.serviceName)) === 1)
      .sort((first, second) => first.serviceName.localeCompare(second.serviceName));
    return [
      { label: 'All Services', value: 'all' },
      ...unique.map((service) => ({
        label: service.serviceName,
        value: toApplicationFilterSlug(service.serviceName),
      })),
    ];
  }, [filters.departmentId, services]);

  const statusOptions = useMemo(() => {
    const unique = Array.from(new Set(gridRows.map((row) => row.currentStatus)));
    return [
      { label: t('applicationDashboard.filters.allStatuses'), value: 'all' },
      ...unique.map((status) => ({
        label: status.charAt(0).toUpperCase() + status.slice(1),
        value: status,
      })),
    ];
  }, [gridRows, t]);

  const formatDate = useCallback(
    (value: string | null) => {
      if (!value) return t('applicationDashboard.table.na');
      const date = new Date(value);
      if (Number.isNaN(date.getTime())) return t('applicationDashboard.table.na');
      return date.toLocaleDateString(locale === 'mr' ? 'mr-IN' : locale === 'hi' ? 'hi-IN' : 'en-IN');
    },
    [locale, t]
  );

  const formatDays = useCallback(
    (value: number | null) =>
      value === null ? t('applicationDashboard.table.na') : t('applicationDashboard.units.dayShort', { value }),
    [t]
  );

  const kpiCards = [
    {
      key: 'total',
      icon: FileText,
      label: t('applicationDashboard.cards.totalApplications'),
      value: kpis?.totalApplications ?? null,
      borderClassName: 'border-l-[#2563EB]',
      valueClassName: 'text-slate-900',
      iconClassName: 'bg-blue-50 border-blue-100 text-[#2563EB]',
    },
    {
      key: 'pending',
      icon: Clock3,
      label: t('applicationDashboard.cards.pending'),
      value: kpis?.pending ?? null,
      borderClassName: 'border-l-[#F59E0B]',
      valueClassName: 'text-[#F59E0B]',
      iconClassName: 'bg-amber-50 border-amber-100 text-[#F59E0B]',
    },
    {
      key: 'approved',
      icon: CheckCircle2,
      label: t('applicationDashboard.cards.approved'),
      value: kpis?.approved ?? null,
      borderClassName: 'border-l-[#10B981]',
      valueClassName: 'text-[#10B981]',
      iconClassName: 'bg-emerald-50 border-emerald-100 text-[#10B981]',
    },
    {
      key: 'rejected',
      icon: TriangleAlert,
      label: t('applicationDashboard.cards.rejected'),
      value: kpis?.rejected ?? null,
      borderClassName: 'border-l-[#EF4444]',
      valueClassName: 'text-[#EF4444]',
      iconClassName: 'bg-rose-50 border-rose-100 text-[#EF4444]',
    },
    {
      key: 'overdue',
      icon: AlertOctagon,
      label: t('applicationDashboard.cards.overdueApplications'),
      value: kpis?.overdueApplications ?? null,
      borderClassName: 'border-l-[#DC2626]',
      valueClassName: 'text-[#DC2626]',
      iconClassName: 'bg-red-50 border-red-100 text-[#DC2626]',
    },
    {
      key: 'reverted',
      icon: RotateCcw,
      label: t('applicationDashboard.cards.reverted'),
      value: kpis?.reverted ?? null,
      borderClassName: 'border-l-violet-500',
      valueClassName: 'text-violet-600',
      iconClassName: 'bg-violet-50 border-violet-100 text-violet-600',
    },
    {
      key: 'today',
      icon: CalendarClock,
      label: t('applicationDashboard.cards.todaysApplications'),
      value: kpis?.todayApplications ?? null,
      borderClassName: 'border-l-cyan-500',
      valueClassName: 'text-cyan-600',
      iconClassName: 'bg-cyan-50 border-cyan-100 text-cyan-600',
    },
    {
      key: 'dueToday',
      icon: TimerReset,
      label: t('applicationDashboard.cards.dueToday'),
      value: kpis?.dueToday ?? null,
      borderClassName: 'border-l-orange-500',
      valueClassName: 'text-orange-600',
      iconClassName: 'bg-orange-50 border-orange-100 text-orange-600',
    },
  ];

  const columns = useMemo<Column<GridRow>[]>(
    () => [
      {
        key: 'applicationNo',
        label: t('applicationDashboard.table.applicationNo'),
        align: 'center',
        render: (_value, row) => (
          <span className="font-semibold text-[#173B73]">{row.applicationNo}</span>
        ),
      },
      {
        key: 'applicationDate',
        label: t('applicationDashboard.table.applicationDate'),
        align: 'center',
        render: (_value, row) => formatDate(row.applicationDate),
      },
      {
        key: 'applicantName',
        label: t('applicationDashboard.table.applicantName'),
      },
      {
        key: 'serviceName',
        label: `${t('applicationDashboard.table.serviceName')} / ${t('applicationDashboard.table.department')}`,
        render: (_value, row) => (
          <div className="flex flex-col gap-0.5">
            <span className="font-semibold text-slate-800">{row.serviceName ?? t('applicationDashboard.table.na')}</span>
            <span className="text-[11px] font-bold text-teal-600 uppercase tracking-wider mt-0.5">{row.departmentName ?? t('applicationDashboard.table.na')}</span>
          </div>
        ),
      },
      {
        key: 'currentStatus',
        label: t('applicationDashboard.table.currentStatus'),
        align: 'center',
        render: (_value, row) => {
          const status = row.currentStatus.trim();
          const normalizedStatus = status.toLocaleLowerCase();

          return (
            <div className="flex items-center justify-center">
              <StatusBadge
                variant={normalizedStatus === 'pending' ? 'pending' : 'info'}
                label={status}
                className="px-2 py-0.5 text-[10px]"
              />
            </div>
          );
        },
      },
      {
        key: 'remainingDays',
        label: t('applicationDashboard.table.remainingDays'),
        align: 'center',
        render: (_value, row) => (
          <span className={row.remainingDays === 0 ? 'font-bold text-red-600' : ''}>
            {formatDays(row.remainingDays)}
          </span>
        ),
      },
      {
        key: 'lastUpdatedDate',
        label: t('applicationDashboard.table.lastUpdatedDate'),
        align: 'center',
        render: (_value, row) => formatDate(row.lastUpdatedDate ?? row.applicationDate),
      },
      {
        key: 'assignedTo',
        label: t('applicationDashboard.table.assignedTo'),
        align: 'center',
        render: (_value, row) => row.assignedTo ?? t('applicationDashboard.table.na'),
      },
      {
        key: 'remark',
        label: t('applicationDashboard.table.remark'),
        align: 'center',
        render: (_value, row) => row.remark?.trim() || '-',
      },
    ],
    [t, formatDate, formatDays]
  );

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

      <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 md:grid-cols-4 xl:grid-cols-8">
        {kpiCards.map((metric) => {
          const percentage =
            kpis && metric.value !== null && kpis.totalApplications > 0
              ? Math.round((metric.value / kpis.totalApplications) * 100)
              : null;

          return (
            <Card
              key={metric.key}
              padding="none"
              className={`relative overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm transition-all duration-200 hover:shadow-md hover:-translate-y-0.5 border-l-[4px] ${metric.borderClassName}`}
            >
              <div className="flex items-center justify-between px-3.5 py-4">
                <div className="flex flex-col min-w-0">
                  <span className="flex items-center gap-1 text-[11px] font-bold text-slate-500 uppercase tracking-wider truncate" title={metric.label}>
                    {metric.label}
                  </span>

                  <div className="mt-2.5 flex items-baseline gap-1">
                    <span className={`text-xl font-extrabold leading-none ${metric.valueClassName}`}>
                      {metric.value === null
                        ? t('applicationDashboard.table.na')
                        : numberFormatter.format(metric.value)}
                    </span>
                    {metric.key !== 'total' && (
                      <span className="text-[13px] font-bold text-slate-400">
                        {percentage === null ? t('applicationDashboard.table.na') : `(${percentage}%)`}
                      </span>
                    )}
                  </div>
                </div>

                <div
                  className={`flex size-9 shrink-0 items-center justify-center rounded-xl border ${metric.iconClassName}`}
                >
                  <metric.icon className="size-5" strokeWidth={2.5} />
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {error && (
        <p className="text-[11px] font-semibold text-red-500">
          {error}
        </p>
      )}

      <Card
        padding="none"
        className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"
      >
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between border-b border-slate-200 px-6 py-4">
          <div>
            <h2 className="flex items-center gap-2 text-md font-bold text-[#183B6B]">
              <FileText className="h-4.5 w-4.5 text-[#183B6B]" />
              {t('applicationDashboard.applications.title')}
            </h2>
            <p className="mt-0.5 text-[11px] text-slate-500">
              {t('applicationDashboard.applications.description')}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 lg:justify-end">
            <div className="w-full sm:w-44 space-y-1">
              <Label className="text-[10px] font-bold uppercase text-[#3d3d3d]">
                {t('applicationDashboard.table.department')}
              </Label>
              <Select
                selectSize="sm"
                options={deptOptions}
                value={filters.departmentSlug || 'all'}
                onChange={(_, value) => {
                  updateQuery(
                    {
                      Department: value === 'all' ? null : value,
                      Service: null,
                    },
                    true
                  );
                }}
              />
            </div>

            <div className="w-full sm:w-44 space-y-1">
              <Label className="text-[10px] font-bold uppercase text-[#3d3d3d]">
                {t('applicationDashboard.table.serviceName')}
              </Label>
              <Select
                selectSize="sm"
                options={serviceOptions}
                value={filters.serviceSlug || 'all'}
                onChange={(_, value) =>
                  updateQuery({ Service: value === 'all' ? null : value }, true)
                }
              />
            </div>

            <div className="w-full sm:w-32 space-y-1">
              <Label className="text-[10px] font-bold uppercase text-[#3d3d3d]">
                {tCommon('status.label')}
              </Label>
              <Select
                selectSize="sm"
                options={statusOptions}
                value={filters.status || 'all'}
                onChange={(_, value) =>
                  updateQuery({ Status: value === 'all' ? null : value }, true)
                }
              />
            </div>

            <div className="w-full sm:w-76 space-y-1">
              <Label className="text-[10px] font-bold uppercase text-[#3d3d3d]">
                {tCommon('actions.search')}
              </Label>
              <SearchInput
                value={searchInput}
                onChange={(value) => {
                  setSearchInput(value);
                  if (searchReloadTimerRef.current) window.clearTimeout(searchReloadTimerRef.current);

                  searchReloadTimerRef.current = window.setTimeout(() => {
                    const search = value.trim();
                    if (search !== filters.search) {
                      updateQuery({ Search: search || null }, true);
                    }
                  }, 1000);
                }}
                placeholder={t('applicationDashboard.applications.searchPlaceholder')}
                className="mb-0 w-full font-medium"
              />
            </div>
          </div>
        </div>

        <MasterTable<GridRow>
          columns={columns}
          data={gridRows}
          emptyText={t('applicationDashboard.applications.empty')}
          getRowKey={(row) => row.id}
          renderActions={(row) => (
            <div className="flex justify-center gap-2">
              <ViewButton
                onClick={() => updateQuery({ ApplicationId: String(row.applicationId) })}
                aria-label={t('applicationDashboard.actions.viewDetailsAria', {
                  appId: row.applicationNo,
                })}
                title={t('applicationDashboard.actions.viewDetailsAria', {
                  appId: row.applicationNo,
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
                icon={ChevronRightIcon}
                onClick={() =>
                  router.push(`/${locale}/rts/dashboard/rts-applications/${row.applicationId}`)
                }
                title={t('applicationDashboard.actions.processAria', {
                  appId: row.applicationNo,
                })}
              >
                {t('applicationDashboard.actions.process')}
              </Button>
            </div>
          )}
          actionLabel={t('applicationDashboard.table.actions')}
          pageNumber={pagination?.pageNumber ?? filters.pageNumber}
          pageSize={filters.pageSize}
          totalCount={pagination?.totalCount ?? 0}
          totalPages={pagination?.totalPages ?? 1}
          onPageChange={(page) => updateQuery({ PageNumber: String(page) })}
          pageSizeOptions={PAGE_SIZE_OPTIONS}
          paginationConfig={{
            enabled: true,
            showPageSizeSelector: false,
          }}
          maxBodyHeightClassName="min-h-50 max-h-auto"
          containerClassName="gap-0 [&>div]:!border-0 [&>div]:!shadow-none [&>div]:!rounded-none"
          theadClassName="!bg-[#143D7D] [&_tr]:!bg-[#143D7D] [&_th]:!bg-[#143D7D] [&_th]:!text-white [&_th]:font-semibold [&_th]:uppercase [&_th]:tracking-wide [&_th]:text-xs [&_th]:border-none"
          tableClassName="[&_tbody_tr]:hover:bg-blue-50 [&_tbody_tr]:h-[64px] [&_tbody_td]:py-3 [&_tbody_td]:text-sm [&_tbody_td]:align-middle [&_thead_tr]:border-none [&_tbody_tr]:border-b [&_tbody_tr]:border-slate-100"
          footerClassName="!border-slate-100 !bg-white !shadow-none"
          footerLeftClassName="text-slate-400"
        />
      </Card>

      {selectedRow && (
        <ApplicationDrawerContent
          open
          onClose={() => updateQuery({ ApplicationId: null })}
          detail={approvalDetails}
          record={{
            applicationId: selectedRow.applicationId,
            applicationNo: selectedRow.applicationNo,
            serviceName: selectedRow.serviceName,
            departmentName: selectedRow.departmentName,
            submittedDate: formatDate(selectedRow.applicationDate),
            slaLimit: selectedRow.sla,
            applicationStatus: selectedRow.currentStatus,
          }}
        />
      )}
    </div>
  );
}
