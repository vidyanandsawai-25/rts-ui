import RtsApplicationDashboard from '@/components/modules/rts/dashboard/RtsApplicationDashboard';
import { toApplicationFilterSlug } from '@/lib/utils/rts/application-filter-slug';
import {
  getRtsApplicationFilterOptionsAction,
  getRtsApplicationFullDetailDataAction,
  getRtsApplicationsDashboardAction,
  getRtsApplicationProcessDataAction,
} from './actions';

type QueryValue = string | string[] | undefined;
type SearchParams = Record<string, QueryValue>;
type ApprovalSortBy = 'applicationNo' | 'CreatedDate' | 'ApplicantName' | 'ApplicationStatus' | 'UpdatedDate';

const SORT_BY_VALUES = new Set<ApprovalSortBy>([
  'applicationNo',
  'CreatedDate',
  'ApplicantName',
  'ApplicationStatus',
  'UpdatedDate',
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

function parseProcessRoute(value: string | undefined): {
  applicationId: number;
  stageSlug: string;
} | null {
  const match = value?.trim().toLowerCase().match(/^(\d+)-(.+)$/);
  if (!match) return null;

  const applicationId = getPositiveApplicationId(match[1]);
  return applicationId && match[2]
    ? { applicationId, stageSlug: match[2] }
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
    ? statusByNormalizedValue[rawStatus.toLowerCase()]
    : undefined;
  const search = readQuery(query, 'search', 'Search')?.trim() ?? '';
  const pageNumber = getPositivePage(readQuery(query, 'pageNumber', 'PageNumber'));
  const requestedSortBy = readQuery(query, 'sortBy', 'SortBy')?.trim();
  const sortBy = requestedSortBy && SORT_BY_VALUES.has(requestedSortBy as ApprovalSortBy)
    ? requestedSortBy as ApprovalSortBy
    : undefined;
  const requestedSortOrder = readQuery(query, 'sortOrder', 'SortOrder')?.trim().toLowerCase();
  const sortOrder = requestedSortOrder === 'asc' || requestedSortOrder === 'desc'
    ? requestedSortOrder
    : undefined;

  const department = departments.find(
    (item) => toApplicationFilterSlug(item.departmentName) === departmentSlug
  );
  const service = department
    ? services.find(
        (item) =>
          item.departmentId === department.id &&
          toApplicationFilterSlug(item.serviceName) === requestedServiceSlug
      )
    : undefined;

  const result = await getRtsApplicationsDashboardAction({
    pageNumber,
    departmentId: department?.id,
    departmentName: department?.departmentName,
    serviceId: service?.id,
    serviceName: service?.serviceName,
    applicationNo: search || undefined,
    status,
    sortBy,
    sortOrder,
  });

  const requestedDocumentGuid = readQuery(query, 'doc', 'Doc')?.trim() ?? '';
  const requestedProcess = parseProcessRoute(readQuery(query, 'process', 'Process'));
  const requestedFullDetailId = getPositiveApplicationId(readQuery(query, 'fullDetail', 'FullDetail'));
  const requestedViewId = getPositiveApplicationId(readQuery(query, 'view', 'View'));
  const drawerApplicationId = requestedProcess?.applicationId ?? requestedFullDetailId ?? requestedViewId;
  const drawerRow = drawerApplicationId
    ? result.rows.find((row) => row.applicationId === drawerApplicationId) ?? null
    : null;
  const processDrawerData = drawerRow && (requestedProcess || requestedViewId)
    ? await getRtsApplicationProcessDataAction(drawerRow.applicationId)
    : null;
  const fullDetailDrawerData = drawerRow && requestedFullDetailId
    ? await getRtsApplicationFullDetailDataAction(drawerRow.applicationId)
    : null;
  const currentStageSlug = processDrawerData?.verification?.stageName
    ? toApplicationFilterSlug(processDrawerData.verification.stageName)
    : '';

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
        requestedProcess.stageSlug === currentStageSlug
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
          department: department ? departmentSlug : '',
          service: service ? requestedServiceSlug : '',
          status: status ?? '',
          search,
          sortBy: sortBy ?? '',
          sortOrder: sortOrder ?? '',
        }}
        locale={locale}
        drawer={drawer}
      />
    </div>
  );
}
