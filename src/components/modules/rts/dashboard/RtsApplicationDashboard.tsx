'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import {
  AlertOctagon,
  ArrowDown,
  ArrowUp,
  ArrowUpDown,
  CalendarClock,
  CheckCircle2,
  Clock3,
  FileText,
  LayoutDashboard,
  RotateCcw,
  TimerReset,
  TriangleAlert,
} from 'lucide-react';

import {
  Badge,
  Card,
  Label,
  MasterTable,
  SearchInput,
  Select,
  ViewButton,
} from '@/components/common';
import type { Column } from '@/components/common/MasterTable';
import RtsApplicationViewDrawer from './RtsApplicationDrawerContext';
import RtsApplicationProcessDrawer from './RtsApplicationProcessDrawer';
import RtsApplicationFullDetailView from './RtsApplicationFullDetailView';
import RtsApplicationDocumentView from './RtsApplicationDocumentView';
import type {
  AdminApplicationGridRow,
  ApplicationsDashboardKpis,
  RtsApplicationProcessData,
  RtsApplicationFullDetailData,
} from '@/app/[locale]/rts/dashboard/rts-applications/actions';
import { toApplicationFilterSlug } from '@/lib/utils/rts/application-filter-slug';
import { getRtsApplicationStatusBadgeProps } from '@/lib/utils/rts/application-status-badge';
import {
  getAdminRtsDocumentDownloadUrl,
  getAdminRtsDocumentViewUrl,
} from '@/lib/api/rts/rtsdocument.client';
import type { RtsApplicationDocumentItem } from '@/types/rts/application-approval.types';
import type { RtsDepartmentApiItem } from '@/types/rts/departments.types';
import type { RtsServiceApiItem } from '@/types/rts/service.types';

interface RtsApplicationDashboardProps {
  kpis: ApplicationsDashboardKpis;
  rows: AdminApplicationGridRow[];
  pagination: { pageNumber: number; pageSize: number; totalCount: number; totalPages: number };
  departments: RtsDepartmentApiItem[];
  services: RtsServiceApiItem[];
  filters: {
    department: string;
    service: string;
    status: string;
    search: string;
    sortBy: string;
    sortOrder: string;
  };
  locale: string;
  drawer: {
    mode: 'view' | 'process';
    record: AdminApplicationGridRow;
    data: RtsApplicationProcessData;
  } | {
    mode: 'fullDetail';
    record: AdminApplicationGridRow;
    data: RtsApplicationFullDetailData;
  } | {
    mode: 'document';
    document: RtsApplicationDocumentItem;
  } | null;
}

type GridRow = AdminApplicationGridRow & Record<string, unknown> & { id: string };
type ApplicationSortKey = 'applicationNo' | 'CreatedDate' | 'ApplicantName' | 'ApplicationStatus' | 'UpdatedDate';
type SortDirection = 'asc' | 'desc';

const PAGE_SIZE_OPTIONS = [10];
const STATUS_OPTIONS = [
  'Pending',
  'Application Verified',
  'Document Verified',
  'Approved',
  'Rejected',
  'Reverted',
  'Overdue Applications',
  "Today's Applications",
  'DueToday',
];

function isPendingSlaOverdue(row: GridRow): boolean {
  return (
    row.currentStatus.trim().toLowerCase() === 'pending' &&
    typeof row.remainingDays === 'number' &&
    Number.isFinite(row.remainingDays) &&
    row.remainingDays <= 0
  );
}

export default function RtsApplicationDashboard({
  kpis,
  rows,
  pagination,
  departments,
  services,
  filters,
  locale,
  drawer,
}: RtsApplicationDashboardProps) {
  const t = useTranslations('rts');
  const tCommon = useTranslations('common');
  const router = useRouter();
  const pathname = usePathname();

  const [searchTerm, setSearchTerm] = useState(filters.search);

  const numberFormatter = useMemo(
    () => new Intl.NumberFormat(locale === 'mr' ? 'mr-IN' : locale === 'hi' ? 'hi-IN' : 'en-IN'),
    [locale]
  );

  const gridRows = useMemo<GridRow[]>(
    () => rows.map((row) => ({ ...row, id: row.applicationNo })),
    [rows]
  );

  const deptOptions = useMemo(() => {
    return [
      { label: t('applicationDashboard.filters.allDepartments'), value: '' },
      ...departments.map((department) => ({
        label: locale === 'mr' && department.departmentNameLocal?.trim()
          ? department.departmentNameLocal.trim()
          : department.departmentName,
        value: toApplicationFilterSlug(department.departmentName),
      })),
    ];
  }, [departments, locale, t]);

  const serviceOptions = useMemo(() => {
    const selectedDepartment = departments.find(
      (department) => toApplicationFilterSlug(department.departmentName) === filters.department
    );
    const availableServices = selectedDepartment
      ? services.filter((service) => service.departmentId === selectedDepartment.id)
      : [];
    return [
      { label: t('applicationDashboard.filters.allServices'), value: '' },
      ...availableServices.map((service) => ({
        label: locale === 'mr' && service.serviceNameLocal?.trim()
          ? service.serviceNameLocal.trim()
          : service.serviceName,
        value: toApplicationFilterSlug(service.serviceName),
      })),
    ];
  }, [departments, filters.department, locale, services, t]);

  const statusOptions = useMemo(() => {
    return [
      { label: t('applicationDashboard.filters.allStatuses'), value: '' },
      ...STATUS_OPTIONS.map((status) => ({
        label: status,
        value: status,
      })),
    ];
  }, [t]);

  const updateUrl = useCallback(
    (changes: Record<string, string>) => {
      const params = new URLSearchParams(window.location.search);
      ['Department', 'Service', 'Status', 'Search', 'PageSize', 'PageNumber', 'SortBy', 'SortOrder'].forEach((key) =>
        params.delete(key)
      );

      Object.entries(changes).forEach(([key, value]) => {
        if (value) params.set(key, value);
        else params.delete(key);
      });
      params.set('pageSize', '10');
      if (!params.get('pageNumber')) params.set('pageNumber', '1');
      router.push(`${pathname}?${params.toString()}`);
    },
    [pathname, router]
  );

  const sortableHeader = useCallback((key: ApplicationSortKey, label: string) => {
    const isActive = filters.sortBy === key;
    const direction = filters.sortOrder as SortDirection;
    const Icon = !isActive ? ArrowUpDown : direction === 'asc' ? ArrowUp : ArrowDown;

    return (
      <button
        type="button"
        onClick={() => updateUrl({
          sortBy: key,
          sortOrder: isActive && direction === 'asc' ? 'desc' : 'asc',
          pageNumber: '1',
        })}
        aria-label={label}
        aria-pressed={isActive}
        className="group inline-flex items-center gap-1 rounded px-0.5 py-0.5 text-inherit transition hover:bg-white/15 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/80"
      >
        <span>{label}</span>
        <Icon aria-hidden className={`size-3 shrink-0 ${isActive ? 'opacity-100' : 'opacity-60 group-hover:opacity-100'}`} />
      </button>
    );
  }, [filters.sortBy, filters.sortOrder, updateUrl]);

  const updateDrawerUrl = useCallback(
    (changes: Record<string, string>) => {
      const params = new URLSearchParams(window.location.search);
      Object.entries(changes).forEach(([key, value]) => {
        if (value) params.set(key, value);
        else params.delete(key);
      });
      const query = params.toString();
      router.push(query ? `${pathname}?${query}` : pathname, { scroll: false });
    },
    [pathname, router]
  );

  const openDocument = useCallback(
    (documentGuid: string) => {
      updateDrawerUrl({ view: '', process: '', doc: documentGuid });
    },
    [updateDrawerUrl]
  );

  const openProcess = useCallback(() => {
    if (drawer?.mode !== 'view') return;
    const stageName = drawer.data.verification?.stageName;
    if (!stageName) return;

    const parentUrl = `${pathname}?${new URLSearchParams(window.location.search).toString()}`;
    window.sessionStorage.setItem('rts-application-process-parent', parentUrl);
    updateDrawerUrl({
      view: '',
      process: `${drawer.record.applicationId}-${toApplicationFilterSlug(stageName)}`,
      doc: '',
    });
  }, [drawer, pathname, updateDrawerUrl]);

  const openFullDetails = useCallback(() => {
    if (drawer?.mode !== 'view') return;
    updateDrawerUrl({ view: '', process: '', fullDetail: String(drawer.record.applicationId), doc: '' });
  }, [drawer, updateDrawerUrl]);

  const closeProcess = useCallback(() => {
    const storedParent = window.sessionStorage.getItem('rts-application-process-parent');
    if (storedParent) {
      window.sessionStorage.removeItem('rts-application-process-parent');
      router.back();
      return;
    }

    updateDrawerUrl({ process: '', doc: '' });
  }, [router, updateDrawerUrl]);

  useEffect(() => {
    if (searchTerm === filters.search) return;
    const timeoutId = window.setTimeout(() => {
      updateUrl({ ...filters, search: searchTerm.trim(), pageNumber: '1' });
    }, 1000);
    return () => window.clearTimeout(timeoutId);
  }, [filters, searchTerm, updateUrl]);

  const hasActiveTableFilters = Boolean(
    filters.department || filters.service || filters.status || filters.search || filters.sortBy || filters.sortOrder
  );

  const clearTableFilters = useCallback(() => {
    setSearchTerm('');
    updateUrl({
      department: '',
      service: '',
      status: '',
      search: '',
      sortBy: '',
      sortOrder: '',
      pageNumber: '1',
    });
  }, [updateUrl]);

  const formatDate = useCallback(
    (value: string) => {
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

  interface KpiCardItem {
    key: string;
    icon: React.ElementType;
    label: string;
    value: number;
    percentage?: number;
    borderClassName: string;
    valueClassName: string;
    iconClassName: string;
    statusValue?: string;
  }

  const kpiCards: KpiCardItem[] = [
    {
      key: 'total',
      icon: FileText,
      label: t('applicationDashboard.cards.totalApplications'),
      value: kpis.total,
      percentage: undefined,
      borderClassName: 'border-l-[#2563EB]',
      valueClassName: 'text-slate-900',
      iconClassName: 'bg-blue-50 border-blue-100 text-[#2563EB]',
    },
    {
      key: 'pending',
      icon: Clock3,
      label: t('applicationDashboard.cards.pending'),
      value: kpis.pending,
      percentage: kpis.pendingPercentage ?? (kpis.total > 0 ? Math.round((kpis.pending / kpis.total) * 100) : 0),
      borderClassName: 'border-l-[#F59E0B]',
      valueClassName: 'text-[#F59E0B]',
      iconClassName: 'bg-amber-50 border-amber-100 text-[#F59E0B]',
      statusValue: 'Pending',
    },
    {
      key: 'approved',
      icon: CheckCircle2,
      label: t('applicationDashboard.cards.approved'),
      value: kpis.approved,
      percentage: kpis.approvedPercentage ?? (kpis.total > 0 ? Math.round((kpis.approved / kpis.total) * 100) : 0),
      borderClassName: 'border-l-[#10B981]',
      valueClassName: 'text-[#10B981]',
      iconClassName: 'bg-emerald-50 border-emerald-100 text-[#10B981]',
      statusValue: 'Approved',
    },
    {
      key: 'reverted',
      icon: RotateCcw,
      label: t('applicationDashboard.cards.reverted'),
      value: kpis.reverted,
      percentage: kpis.revertedPercentage ?? (kpis.total > 0 ? Math.round((kpis.reverted / kpis.total) * 100) : 0),
      borderClassName: 'border-l-violet-500',
      valueClassName: 'text-violet-600',
      iconClassName: 'bg-violet-50 border-violet-100 text-violet-600',
      statusValue: 'Reverted',
    },
    {
      key: 'rejected',
      icon: TriangleAlert,
      label: t('applicationDashboard.cards.rejected'),
      value: kpis.rejected,
      percentage: kpis.rejectedPercentage ?? (kpis.total > 0 ? Math.round((kpis.rejected / kpis.total) * 100) : 0),
      borderClassName: 'border-l-[#EF4444]',
      valueClassName: 'text-[#EF4444]',
      iconClassName: 'bg-rose-50 border-rose-100 text-[#EF4444]',
      statusValue: 'Rejected',
    },
    {
      key: 'overdue',
      icon: AlertOctagon,
      label: t('applicationDashboard.cards.overdueApplications'),
      value: kpis.overdue,
      percentage: kpis.overduePercentage ?? (kpis.total > 0 ? Math.round((kpis.overdue / kpis.total) * 100) : 0),
      borderClassName: 'border-l-[#DC2626]',
      valueClassName: 'text-[#DC2626]',
      iconClassName: 'bg-red-50 border-red-100 text-[#DC2626]',
      statusValue: 'Overdue Applications',
    },
    {
      key: 'today',
      icon: CalendarClock,
      label: t('applicationDashboard.cards.todaysApplications'),
      value: kpis.today,
      percentage: kpis.todayPercentage ?? (kpis.total > 0 ? Math.round((kpis.today / kpis.total) * 100) : 0),
      borderClassName: 'border-l-cyan-500',
      valueClassName: 'text-cyan-600',
      iconClassName: 'bg-cyan-50 border-cyan-100 text-cyan-600',
      statusValue: "Today's Applications",
    },
    {
      key: 'dueToday',
      icon: TimerReset,
      label: t('applicationDashboard.cards.dueToday'),
      value: kpis.dueToday,
      percentage: kpis.dueTodayPercentage ?? (kpis.total > 0 ? Math.round((kpis.dueToday / kpis.total) * 100) : 0),
      borderClassName: 'border-l-orange-500',
      valueClassName: 'text-orange-600',
      iconClassName: 'bg-orange-50 border-orange-100 text-orange-600',
      statusValue: 'DueToday',
    },
  ];

  const columns = useMemo<Column<GridRow>[]>(
    () => [
      {
        key: 'applicationNo',
        label: sortableHeader('applicationNo', t('applicationDashboard.table.applicationNo')),
        align: 'center',
        render: (_value, row) => (
          <span className="font-semibold text-[#173B73]">{row.applicationNo}</span>
        ),
      },
      {
        key: 'applicationDate',
        label: sortableHeader('CreatedDate', t('applicationDashboard.table.applicationDate')),
        align: 'center',
        render: (_value, row) => (
          <span className="font-medium text-slate-700">{formatDate(row.applicationDate)}</span>
        ),
      },
      {
        key: 'applicantName',
        label: sortableHeader('ApplicantName', t('applicationDashboard.table.applicantName')),
        render: (_value, row) => (
          <span className="font-medium text-slate-800">{row.applicantName}</span>
        ),
      },
      {
        key: 'serviceName',
        label: t('applicationDashboard.table.serviceName'),
        render: (_value, row) => {
          const serviceName = locale === 'mr' && row.serviceNameLocal
            ? row.serviceNameLocal
            : row.serviceName;
          const departmentName = locale === 'mr' && row.departmentNameLocal
            ? row.departmentNameLocal
            : row.departmentName;

          return (
            <div className="flex flex-col">
              <span className="font-[#173B73] text-[15px] font-bold tracking-tight text-[#173B73]">
                {serviceName}
              </span>
              <span className="text-[12px] font-bold uppercase tracking-wider text-teal-600">
                {departmentName}
              </span>
            </div>
          );
        },
      },
      {
        key: 'assignedTo',
        label: t('applicationDashboard.table.assignedTo'),
        render: (_value, row) => (
          <div className="flex flex-col">
            <span className="font-medium text-slate-800 text-[13px]">
              {row.assignedToName || row.assignedTo || t('applicationDashboard.table.na')}
            </span>
            {row.assignedToRole && (
              <span className="text-[11px] font-bold text-teal-600 uppercase tracking-wider mt-0.5">
                {row.assignedToRole}
              </span>
            )}
          </div>
        ),
      },
      {
        key: 'currentStatus',
        label: sortableHeader('ApplicationStatus', t('applicationDashboard.table.status')),
        align: 'center',
        render: (_value, row) => (
          <Badge {...getRtsApplicationStatusBadgeProps(row.currentStatus)}>
            {row.currentStatus.charAt(0).toUpperCase() + row.currentStatus.slice(1)}
          </Badge>
        ),
      },
      {
        key: 'lastUpdatedDate',
        label: sortableHeader('UpdatedDate', t('applicationDashboard.table.lastUpdatedDate')),
        align: 'center',
        render: (_value, row) => (
          <span className="font-medium text-slate-700">
            {formatDate(row.lastUpdatedDate)}
          </span>
        ),
      },
      {
        key: 'remainingDays',
        label: t('applicationDashboard.table.remainingDays'),
        align: 'center',
        render: (_value, row) => (
          <span
            className={`font-semibold ${
              row.remainingDays === 0 ? 'text-red-600 font-extrabold' : 'text-slate-700'
            }`}
          >
            {formatDays(row.remainingDays)}
          </span>
        ),
      },
      // {
      //   key: 'currentStageName',
      //   label: t('applicationDashboard.table.stage'),
      //   render: (_value, row) => (
      //     <span className="font-semibold text-slate-800 text-[13px]">
      //       {row.currentStageName || t('applicationDashboard.table.na')}
      //     </span>
      //   ),
      // },

      {
        key: 'remarks',
        label: t('applicationDashboard.table.remarks'),
        render: (_value, row) => (
          <span
            className="font-medium text-slate-600 text-[12px] italic max-w-[200px] truncate block"
            title={row.remarks || t('applicationDashboard.table.na')}
          >
            {row.remarks || t('applicationDashboard.table.na')}
          </span>
        ),
      },
    ],
    [locale, t, formatDate, formatDays, sortableHeader]
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
          return (
            <Card
              key={metric.key}
              padding="none"
              className={`relative overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm transition-all duration-200 hover:shadow-md hover:-translate-y-0.5 border-l-[4px] ${metric.borderClassName}`}
            >
              <button
                type="button"
                disabled={!metric.statusValue}
                onClick={() => metric.statusValue && updateUrl({ status: metric.statusValue, pageNumber: '1' })}
                className="flex w-full items-center justify-between px-3.5 py-4 text-left disabled:cursor-default"
              >
                <div className="flex flex-col min-w-0">
                  <span className="flex items-center gap-1 text-[11px] font-bold text-slate-500 uppercase tracking-wider truncate" title={metric.label}>
                    {metric.label}
                  </span>

                  <div className="mt-2.5 flex items-baseline gap-1">
                    <span className={`text-xl font-extrabold leading-none ${metric.valueClassName}`}>
                      {numberFormatter.format(metric.value)}
                    </span>
                    {metric.key !== 'total' && metric.percentage !== undefined && (
                      <span className="text-[13px] font-bold text-slate-400">
                        (
                        {typeof metric.percentage === 'number'
                          ? Number.isInteger(metric.percentage)
                            ? metric.percentage
                            : parseFloat(metric.percentage.toFixed(2))
                          : metric.percentage}
                        %)
                      </span>
                    )}
                  </div>
                </div>

                <div
                  className={`flex size-9 shrink-0 items-center justify-center rounded-xl border ${metric.iconClassName}`}
                >
                  <metric.icon className="size-5" strokeWidth={2.5} />
                </div>
              </button>
            </Card>
          );
        })}
      </div>

      {!kpis.isLive && (
        <p className="text-[11px] font-semibold text-red-500">
          {t('applicationDashboard.cards.liveUnavailable')}
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
                value={filters.department}
                onChange={(_, value) => {
                  updateUrl({ ...filters, department: value, service: '', pageNumber: '1' });
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
                value={filters.service}
                disabled={!filters.department}
                onChange={(_, value) => updateUrl({ ...filters, service: value, pageNumber: '1' })}
              />
            </div>

            <div className="w-full sm:w-32 space-y-1">
              <Label className="text-[10px] font-bold uppercase text-[#3d3d3d]">
                {tCommon('status.label')}
              </Label>
              <Select
                selectSize="sm"
                options={statusOptions}
                value={filters.status}
                onChange={(_, value) => updateUrl({ ...filters, status: value, pageNumber: '1' })}
              />
            </div>

            <div className="w-full sm:w-56 space-y-1">
              <Label className="text-[10px] font-bold uppercase text-[#3d3d3d]">
                {tCommon('actions.search')}
              </Label>
              <SearchInput
                value={searchTerm}
                onChange={setSearchTerm}
                placeholder={t('applicationDashboard.applications.searchPlaceholder')}
                className="mb-0 w-full font-medium"
              />
            </div>

            {hasActiveTableFilters && (
              <button
                type="button"
                onClick={clearTableFilters}
                className="mt-5 inline-flex h-8 items-center rounded-md border border-slate-300 bg-white px-3 text-xs font-semibold text-slate-600 transition hover:border-slate-400 hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
              >
                {t('applicationDashboard.filters.clearFilters')}
              </button>
            )}

          </div>
        </div>

        <MasterTable<GridRow>
          columns={columns}
          data={gridRows}
          emptyText={t('applicationDashboard.applications.empty')}
          getRowKey={(row) => row.id}
          renderActions={(row) => (
            <div className="flex justify-center">
              <ViewButton
                onClick={() => updateDrawerUrl({ view: String(row.applicationId), process: '', doc: '' })}
                aria-label={t('applicationDashboard.actions.viewDetailsAria', {
                  appId: row.applicationNo,
                })}
                title={t('applicationDashboard.actions.viewDetailsAria', {
                  appId: row.applicationNo,
                })}
                className="rounded-full px-3 text-xs font-semibold"
                size="xs"
              >
                {t('applicationDashboard.actions.viewDetails')}
              </ViewButton>
            </div>
          )}
          actionLabel={t('applicationDashboard.table.actions')}
          pageNumber={pagination.pageNumber}
          pageSize={10}
          totalCount={pagination.totalCount}
          totalPages={pagination.totalPages}
          onPageChange={(pageNumber) => updateUrl({ ...filters, pageNumber: String(pageNumber) })}
          onPageSizeChange={() => updateUrl({ ...filters, pageNumber: '1' })}
          pageSizeOptions={PAGE_SIZE_OPTIONS}
          paginationConfig={{
            enabled: true,
            showPageSizeSelector: true,
          }}
          maxBodyHeightClassName="min-h-[200px] max-h-auto"
          containerClassName="gap-0 [&>div]:!border-0 [&>div]:!shadow-none [&>div]:!rounded-none"
          theadClassName="!bg-[#143D7D] [&_tr]:!bg-[#143D7D] [&_th]:!bg-[#143D7D] [&_th]:!text-white [&_th]:font-semibold [&_th]:uppercase [&_th]:tracking-wide [&_th]:text-xs [&_th]:border-none"
          tableClassName="[&_tbody_tr]:hover:bg-blue-50 [&_tbody_tr]:h-[64px] [&_tbody_td]:py-3 [&_tbody_td]:text-sm [&_tbody_td]:align-middle [&_tbody_td[colspan]]:h-[160px] [&_tbody_td[colspan]]:align-middle [&_thead_tr]:border-none [&_tbody_tr]:border-b [&_tbody_tr]:border-slate-100"
          rowClassName={(row) =>
            isPendingSlaOverdue(row)
              ? '!border-rose-200 !bg-rose-50/70 hover:!bg-rose-100/80 border-l-[3px] border-l-rose-400'
              : ''
          }
          footerLeftContent={
            <span className="text-[12px] text-slate-400">
              {t('applicationDashboard.pagination.showing', {
                shown: numberFormatter.format(gridRows.length),
                total: numberFormatter.format(pagination.totalCount),
              })}
            </span>
          }
          footerClassName="!border-slate-100 !bg-white !shadow-none"
          footerLeftClassName="text-slate-400"
        />
      </Card>

      <RtsApplicationViewDrawer
        open={drawer?.mode === 'view'}
        record={
          drawer?.mode === 'view'
            ? {
                appId: drawer.record.applicationNo,
                citizenName: drawer.record.applicantName,
                submittedDate: formatDate(drawer.record.applicationDate),
                slaLimit: drawer.record.expectedSlaDays,
                serviceName: locale === 'mr' && drawer.record.serviceNameLocal
                  ? drawer.record.serviceNameLocal
                  : drawer.record.serviceName,
                departmentName: locale === 'mr' && drawer.record.departmentNameLocal
                  ? drawer.record.departmentNameLocal
                  : drawer.record.departmentName,
                applicationStatus: drawer.record.currentStatus || 'Pending',
              }
            : null
        }
        data={drawer?.mode === 'view' ? drawer.data : null}
        onClose={() => updateDrawerUrl({ view: '', process: '', doc: '' })}
        onOpenFullDetails={openProcess}
        onOpenReadOnlyDetails={openFullDetails}
        onOpenDocument={openDocument}
      />

      <RtsApplicationFullDetailView
        key={drawer?.mode === 'fullDetail' ? drawer.record.applicationId : 'no-full-detail-drawer'}
        open={drawer?.mode === 'fullDetail'}
        record={
          drawer?.mode === 'fullDetail'
            ? {
                applicationId: drawer.record.applicationId,
                appId: drawer.record.applicationNo,
                citizenName: drawer.record.applicantName,
                submittedDate: formatDate(drawer.record.applicationDate),
                serviceName: drawer.record.serviceName,
                departmentName: drawer.record.departmentName,
                applicationStatus: drawer.record.currentStatus || 'Pending',
              }
            : null
        }
        data={drawer?.mode === 'fullDetail' ? drawer.data : null}
        onClose={() => updateDrawerUrl({ fullDetail: '', doc: '' })}
        onOpenDocument={openDocument}
      />

      <RtsApplicationProcessDrawer
        key={drawer?.mode === 'process' ? drawer.record.applicationId : 'no-process-drawer'}
        open={drawer?.mode === 'process'}
        record={
          drawer?.mode === 'process'
            ? {
                applicationId: drawer.record.applicationId,
                appId: drawer.record.applicationNo,
                citizenName: drawer.record.applicantName,
                submittedDate: formatDate(drawer.record.applicationDate),
                slaLimit: drawer.record.expectedSlaDays,
                serviceName: drawer.record.serviceName,
                departmentName: drawer.record.departmentName,
                applicationStatus: drawer.record.currentStatus || 'Pending',
              }
            : null
        }
        data={drawer?.mode === 'process' ? drawer.data : null}
        onClose={closeProcess}
        onOpenDocument={openDocument}
        onSuccess={() => router.refresh()}
      />

      {drawer?.mode === 'document' && drawer.document.documentGuid && (
        <RtsApplicationDocumentView
          open
          fileUrl={getAdminRtsDocumentViewUrl(drawer.document.documentGuid)}
          downloadUrl={getAdminRtsDocumentDownloadUrl(drawer.document.documentGuid)}
          fileName={drawer.document.documentName || 'Document'}
          label={drawer.document.documentName || undefined}
        />
      )}
    </div>
  );
}
