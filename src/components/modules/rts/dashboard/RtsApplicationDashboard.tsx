'use client';

import { useCallback, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import {
  AlertOctagon,
  CalendarClock,
  CheckCircle2,
  Clock3,
  FileText,
  Filter,
  LayoutDashboard,
  RotateCcw,
  TimerReset,
  TriangleAlert,
} from 'lucide-react';

import {
  Button,
  Card,
  Drawer,
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
} from '@/app/[locale]/rts/dashboard/rts-applications/actions';
import type { RtsDepartmentApiItem } from '@/types/rts/departments.types';
import type { RtsServiceApiItem } from '@/types/rts/service.types';

interface RtsApplicationDashboardProps {
  kpis: ApplicationsDashboardKpis | null;
  rows: AdminApplicationGridRow[];
  locale: string;
  error: string | null;
  departments: RtsDepartmentApiItem[];
  services: RtsServiceApiItem[];
}

type GridRow = AdminApplicationGridRow & Record<string, unknown> & { id: number };

const PAGE_SIZE_OPTIONS = [5, 10, 20, 50];

export default function RtsApplicationDashboard({
  kpis,
  rows = [],
  locale,
  error,
  departments,
  services,
}: RtsApplicationDashboardProps) {
  const t = useTranslations('rts');
  const tCommon = useTranslations('common');
  const router = useRouter();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDept, setSelectedDept] = useState('all');
  const [selectedService, setSelectedService] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [pageNumber, setPageNumber] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [selectedRow, setSelectedRow] = useState<GridRow | null>(null);

  const numberFormatter = useMemo(
    () => new Intl.NumberFormat(locale === 'mr' ? 'mr-IN' : locale === 'hi' ? 'hi-IN' : 'en-IN'),
    [locale]
  );

  const gridRows = useMemo<GridRow[]>(
    () => rows.map((row) => ({ ...row, id: row.applicationId })),
    [rows]
  );

  const deptOptions = useMemo(() => {
    return [
      { label: 'All Departments', value: 'all' },
      ...departments.map((department) => ({
        label: department.departmentName,
        value: String(department.id),
      })),
    ];
  }, [departments]);

  const serviceOptions = useMemo(() => {
    const unique = Array.from(
      new Set(
        services
          .filter((service) => selectedDept === 'all' || service.departmentId === Number(selectedDept))
          .map((service) => service)
      )
    ).sort((first, second) => first.serviceName.localeCompare(second.serviceName));
    return [
      { label: 'All Services', value: 'all' },
      ...unique.map((service) => ({
        label: service.serviceName,
        value: String(service.id),
      })),
    ];
  }, [selectedDept, services]);

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

  const filteredRows = useMemo(() => {
    const query = searchTerm.toLocaleLowerCase(locale).trim();

    return gridRows.filter((row) => {
      const matchesSearch =
        !query ||
        row.applicationNo.toLocaleLowerCase(locale).includes(query) ||
        row.applicantName?.toLocaleLowerCase(locale).includes(query) ||
        row.serviceName?.toLocaleLowerCase(locale).includes(query);
      const matchesDept = selectedDept === 'all' || row.departmentId === Number(selectedDept);
      const matchesService = selectedService === 'all' || row.serviceId === Number(selectedService);
      const matchesStatus = selectedStatus === 'all' || row.currentStatus === selectedStatus;

      return matchesSearch && matchesDept && matchesService && matchesStatus;
    });
  }, [gridRows, locale, searchTerm, selectedDept, selectedService, selectedStatus]);

  const totalPages = Math.max(1, Math.ceil(filteredRows.length / pageSize));

  const paginatedRows = useMemo(() => {
    const start = (pageNumber - 1) * pageSize;
    return filteredRows.slice(start, start + pageSize);
  }, [filteredRows, pageNumber, pageSize]);

  const handleFilterChange = (setter: (value: string) => void) => (value: string) => {
    setter(value);
    setPageNumber(1);
  };

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
                value={selectedDept}
                onChange={(_, value) => {
                  handleFilterChange(setSelectedDept)(value);
                  handleFilterChange(setSelectedService)('all');
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
                value={selectedService}
                onChange={(_, value) => handleFilterChange(setSelectedService)(value)}
              />
            </div>

            <div className="w-full sm:w-32 space-y-1">
              <Label className="text-[10px] font-bold uppercase text-[#3d3d3d]">
                {tCommon('status.label')}
              </Label>
              <Select
                selectSize="sm"
                options={statusOptions}
                value={selectedStatus}
                onChange={(_, value) => handleFilterChange(setSelectedStatus)(value)}
              />
            </div>

            <div className="w-full sm:w-56 space-y-1">
              <Label className="text-[10px] font-bold uppercase text-[#3d3d3d]">
                {tCommon('actions.search')}
              </Label>
              <SearchInput
                value={searchTerm}
                onChange={(value) => handleFilterChange(setSearchTerm)(value)}
                placeholder={t('applicationDashboard.applications.searchPlaceholder')}
                className="mb-0 w-full font-medium"
              />
            </div>

            <div className="self-end pb-0.5">
              <button
                type="button"
                aria-label={t('applicationDashboard.actions.openFilters')}
                className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-300 bg-white transition hover:bg-slate-50"
              >
                <Filter className="h-4.5 w-4.5 text-slate-500" />
              </button>
            </div>
          </div>
        </div>

        <MasterTable<GridRow>
          columns={columns}
          data={paginatedRows}
          emptyText={t('applicationDashboard.applications.empty')}
          getRowKey={(row) => row.id}
          renderActions={(row) => (
            <div className="flex justify-center gap-2">
              <ViewButton
                onClick={() => setSelectedRow(row)}
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
          pageNumber={pageNumber}
          pageSize={pageSize}
          totalCount={filteredRows.length}
          totalPages={totalPages}
          onPageChange={setPageNumber}
          onPageSizeChange={setPageSize}
          pageSizeOptions={PAGE_SIZE_OPTIONS}
          paginationConfig={{
            enabled: true,
            showPageSizeSelector: true,
          }}
          maxBodyHeightClassName="max-h-auto"
          containerClassName="gap-0 [&>div]:!border-0 [&>div]:!shadow-none [&>div]:!rounded-none"
          theadClassName="!bg-[#143D7D] [&_tr]:!bg-[#143D7D] [&_th]:!bg-[#143D7D] [&_th]:!text-white [&_th]:font-semibold [&_th]:uppercase [&_th]:tracking-wide [&_th]:text-xs [&_th]:border-none"
          tableClassName="[&_tbody_tr]:hover:bg-blue-50 [&_tbody_tr]:h-[64px] [&_tbody_td]:py-3 [&_tbody_td]:text-sm [&_tbody_td]:align-middle [&_thead_tr]:border-none [&_tbody_tr]:border-b [&_tbody_tr]:border-slate-100"
          footerLeftContent={
            <span className="text-[12px] text-slate-400">
              {t('applicationDashboard.pagination.showing', {
                shown: numberFormatter.format(paginatedRows.length),
                total: numberFormatter.format(filteredRows.length),
              })}
            </span>
          }
          footerClassName="!border-slate-100 !bg-white !shadow-none"
          footerLeftClassName="text-slate-400"
        />
      </Card>

      {selectedRow && (
        <Drawer
          open={!!selectedRow}
          onClose={() => setSelectedRow(null)}
          width="md"
          title={
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-blue-100 bg-blue-50">
                <FileText className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <div className="text-[11px] font-bold uppercase tracking-wide text-slate-700">
                  {selectedRow.applicationNo}
                </div>
                <div className="text-lg font-bold text-slate-800">
                  {selectedRow.serviceName ?? t('applicationDashboard.table.na')}
                </div>
              </div>
            </div>
          }
        >
          <ApplicationDrawerContent
            record={{
              applicationId: selectedRow.applicationId,
              citizenName: selectedRow.applicantName,
              submittedDate: formatDate(selectedRow.applicationDate),
              slaLimit: selectedRow.sla,
            }}
            onClose={() => setSelectedRow(null)}
          />
        </Drawer>
      )}
    </div>
  );
}
