import RtsApplicationDashboard from '@/components/modules/rts/dashboard/RtsApplicationDashboard';
import { toApplicationFilterSlug } from '@/lib/utils/rts/application-filter-slug';
import {
  getApprovalApplicationRowAction,
  getRtsApplicationFilterOptionsAction,
  getRtsApplicationFullDetailDataAction,
  getRtsApplicationsDashboardAction,
  getRtsApplicationProcessDataAction,
} from './actions';

type QueryValue = string | string[] | undefined;
type SearchParams = Record<string, QueryValue>;
type ApprovalSortBy = 'applicationNo' | 'CreatedDate' | 'ApplicantName' | 'ApplicationStatus' | 'UpdatedDate' | 'RemainingDays';

const SORT_BY_VALUES = new Set<ApprovalSortBy>([
  'applicationNo',
  'CreatedDate',
  'ApplicantName',
  'ApplicationStatus',
  'UpdatedDate',
  'RemainingDays',
]);

function readQuery(query: SearchParams, canonical: string, legacy: string): string | undefined {
  const value = query[canonical] ?? query[legacy];
  return Array.isArray(value) ? value[0] : value;
}

function getPositivePage(value: string | undefined): number {
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : 1;
}

function getPositiveApplicationId(value: string | undefined): number | null {
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : null;
}

function getIsoDate(value: string | undefined): string | undefined {
  const date = value?.trim();
  if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) return undefined;

  const [year, month, day] = date.split('-').map(Number);
  const parsed = new Date(Date.UTC(year, month - 1, day));
  return parsed.getUTCFullYear() === year &&
    parsed.getUTCMonth() === month - 1 &&
    parsed.getUTCDate() === day
    ? date
    : undefined;
}

function parseProcessRoute(value: string | undefined): {
  applicationId: number;
  stageSlug?: string;
} | null {
  const match = value?.trim().toLowerCase().match(/^(\d+)(?:-(.+))?$/);
  if (!match) return null;

  const applicationId = getPositiveApplicationId(match[1]);
  return applicationId
    ? { applicationId, ...(match[2] ? { stageSlug: match[2] } : {}) }
    : null;
}

export default async function RtsApplicationDashboardPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<SearchParams>;
}) {
  const [{ locale }, query] = await Promise.all([params, searchParams]);
  const { departments, services } = await getRtsApplicationFilterOptionsAction();

  const departmentSlug = readQuery(query, 'department', 'Department')?.trim().toLowerCase() ?? '';
  const requestedServiceSlug = readQuery(query, 'service', 'Service')?.trim().toLowerCase() ?? '';
  const rawStatus = readQuery(query, 'status', 'Status')?.trim();
  const statusByNormalizedValue: Record<string, string> = {
    all: '',
    pending: 'Pending',
    'application verified': 'Application Verified',
    'document verified': 'Document Verified',
    approved: 'Approved',
    rejected: 'Rejected',
    reverted: 'Reverted',
    'overdue applications': 'Overdue Applications',
    "today's applications": "Today's Applications",
    'todays applications': "Today's Applications",
    duetoday: 'DueToday',
  };
  const status = rawStatus
    ? statusByNormalizedValue[rawStatus.toLowerCase()] ?? rawStatus
    : undefined;
  const search = readQuery(query, 'search', 'Search')?.trim() ?? '';
  const fromDate = getIsoDate(readQuery(query, 'fromDate', 'FromDate'));
  const requestedToDate = getIsoDate(readQuery(query, 'toDate', 'ToDate'));
  const toDate = fromDate && requestedToDate && requestedToDate < fromDate
    ? fromDate
    : requestedToDate;
  const pageNumber = getPositivePage(readQuery(query, 'pageNumber', 'PageNumber'));
  const requestedSortBy = readQuery(query, 'sortBy', 'SortBy')?.trim();
  const sortBy = requestedSortBy && SORT_BY_VALUES.has(requestedSortBy as ApprovalSortBy)
    ? requestedSortBy as ApprovalSortBy
    : undefined;
  const requestedSortOrder = readQuery(query, 'sortOrder', 'SortOrder')?.trim().toLowerCase();
  const sortOrder = requestedSortOrder === 'asc' || requestedSortOrder === 'desc'
    ? requestedSortOrder
    : undefined;
  const myApplicationsValue = readQuery(query, 'myApplications', 'MyApplications')
    ?.trim()
    .toLowerCase();
  const myApplications = myApplicationsValue === 'true' || myApplicationsValue === '1';

  const department = departmentSlug
    ? departments.find(
        (item) =>
          item.id.toString() === departmentSlug ||
          toApplicationFilterSlug(item.departmentName) === departmentSlug
      )
    : undefined;

  const service = requestedServiceSlug
    ? services.find(
        (item) =>
          (!department || item.departmentId === department.id) &&
          (item.id.toString() === requestedServiceSlug ||
            toApplicationFilterSlug(item.serviceName) === requestedServiceSlug)
      )
    : undefined;

  const effectiveDepartment = department || (service ? departments.find((d) => d.id === service.departmentId) : undefined);

  const requestedDocumentGuid = readQuery(query, 'doc', 'Doc')?.trim() ?? '';
  const requestedProcess = parseProcessRoute(readQuery(query, 'process', 'Process'));
  const requestedFullDetailId = getPositiveApplicationId(readQuery(query, 'fullDetail', 'FullDetail'));
  const requestedViewId = getPositiveApplicationId(readQuery(query, 'view', 'View'));
  const drawerApplicationId = requestedProcess?.applicationId ?? requestedFullDetailId ?? requestedViewId;

  // Run dashboard query and drawer queries concurrently in parallel for instant response
  const [result, processDrawerData, fullDetailDrawerData] = await Promise.all([
    getRtsApplicationsDashboardAction({
      pageNumber,
      departmentId: effectiveDepartment?.id,
      departmentName: effectiveDepartment?.departmentName,
      serviceId: service?.id,
      applicationNo: search || undefined,
      search: search || undefined,
      status,
      fromDate,
      toDate,
      sortBy,
      sortOrder,
      myApplications,
    }),
    drawerApplicationId && (requestedProcess || requestedViewId)
      ? getRtsApplicationProcessDataAction(drawerApplicationId)
      : Promise.resolve(null),
    drawerApplicationId && requestedFullDetailId
      ? getRtsApplicationFullDetailDataAction(drawerApplicationId)
      : Promise.resolve(null),
  ]);

  let drawerRow = drawerApplicationId
    ? result.rows.find((row) => row.applicationId === drawerApplicationId) ?? null
    : null;

  if (!drawerRow && drawerApplicationId) {
    const details = processDrawerData?.details || fullDetailDrawerData?.details;
    if (details) {
      drawerRow = {
        source: 'approval',
        applicationId: details.applicationId ?? drawerApplicationId,
        applicationNo: details.applicationNo || `RTS${drawerApplicationId}`,
        propertyNo: null,
        upicId: null,
        applicationDate: '',
        applicantName: '—',
        serviceName: details.serviceName || 'Unknown Service',
        serviceNameLocal: null,
        departmentName: details.departmentName || 'Unknown Department',
        departmentNameLocal: null,
        currentStatus: details.applicationStatus || 'Pending',
        currentStageName: details.applicationStatus || 'Pending',
        remarks: details.remark || '—',
        expectedSlaDays: 7,
        remainingDays: null,
        dueDays: null,
        overdueDays: null,
        lastUpdatedDate: '',
        assignedTo: '—',
        assignedToName: '—',
        assignedToRole: '',
        assignedUserId: null,
      };
    } else {
      drawerRow = await getApprovalApplicationRowAction(drawerApplicationId);
    }
  }

  const drawer = requestedDocumentGuid
    ? {
        mode: 'document' as const,
        document: {
          documentGuid: requestedDocumentGuid,
          documentName: 'Application document',
        },
      }
    : requestedProcess &&
        drawerRow &&
        processDrawerData &&
        processDrawerData.verification
      ? {
          mode: 'process' as const,
          record: drawerRow,
          data: processDrawerData,
        }
      : requestedFullDetailId && drawerRow && fullDetailDrawerData
        ? {
            mode: 'fullDetail' as const,
            record: drawerRow,
            data: fullDetailDrawerData,
          }
      : requestedViewId && drawerRow && processDrawerData
        ? {
            mode: 'view' as const,
            record: drawerRow,
            data: processDrawerData,
          }
        : null;

  return (
    <div className="w-full">
      <RtsApplicationDashboard
        kpis={result.kpis}
        rows={result.rows}
        pagination={result.pagination}
        departments={departments}
        services={services}
        filters={{
          department: effectiveDepartment ? toApplicationFilterSlug(effectiveDepartment.departmentName) : '',
          service: service ? toApplicationFilterSlug(service.serviceName) : '',
          status: status ?? '',
          search,
          fromDate: fromDate ?? '',
          toDate: toDate ?? '',
          sortBy: sortBy ?? '',
          sortOrder: sortOrder ?? '',
          myApplications,
        }}
        locale={locale}
        drawer={drawer}
      />
    </div>
  );
}
