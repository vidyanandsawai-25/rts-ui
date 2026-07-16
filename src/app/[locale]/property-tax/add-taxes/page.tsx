/* eslint-disable @typescript-eslint/no-explicit-any */
import { getTranslations } from 'next-intl/server';
import { PageContainer } from '@/components/common/PageContainer';
import AddTaxesConsole, { AddTaxesActions } from '@/components/modules/property-tax/add-taxes/AddTaxesConsole';
import TableHeader from '@/components/common/TableHeader';
import { fetchAllZonesAction, initOperationsAction, getScopeOptionsAction, fetchAllPropertyTypesAction } from './actions';
import type { PropertyType } from '@/types/property-type.types';
import { getAuditList, getAuditDetail, getJobProperties } from '@/lib/api/add-taxes/operations.service';

export default async function AddTaxesPage({
  searchParams,
}: {
  searchParams: Promise<{
    SearchJobId?: string;
    Status?: string;
    Date?: string;
    auditPage?: string;
    auditPageSize?: string;
    selectedJobId?: string;
  }>;
}) {
  const t = await getTranslations('addTaxes');
  const resolvedSearchParams = await searchParams;

  // Prepare audit filter parameters
  const auditJobId = resolvedSearchParams.SearchJobId || '';
  const auditStatus = resolvedSearchParams.Status || '';
  const auditDate = resolvedSearchParams.Date || '';
  const auditPage = Number(resolvedSearchParams.auditPage) || 1;
  const auditPageSize = Number(resolvedSearchParams.auditPageSize) || 10;
  const selectedJobId = resolvedSearchParams.selectedJobId || '';

  // Formulate queries
  const auditFilterQuery: Record<string, any> = {};
  if (auditJobId) auditFilterQuery.JobCode = auditJobId;
  if (auditStatus) auditFilterQuery.Status = auditStatus;
  if (auditDate) auditFilterQuery.StartTime = auditDate;

  const numericJobId = selectedJobId ? selectedJobId.split('-').pop() || '' : '';

  // Fetch initial base data and audit data concurrently
  const [
    initResponse,
    scopeResponse,
    zonesResponse,
    propertyTypesResponse,
    allJobsRes,
    filteredPageRes,
    filteredAllRes,
    selectedJobDetailObj,
    selectedJobProperties,
  ] = await Promise.all([
    initOperationsAction(),
    getScopeOptionsAction(),
    fetchAllZonesAction(),
    fetchAllPropertyTypesAction(),
    getAuditList({ PageSize: -1 }), // Suggestion list
    getAuditList({ ...auditFilterQuery, PageNumber: auditPage, PageSize: auditPageSize }), // Table items
    getAuditList({ ...auditFilterQuery, PageSize: -1 }), // Stats calculation
    numericJobId ? getAuditDetail(numericJobId) : Promise.resolve(null),
    numericJobId ? getJobProperties(numericJobId).catch(() => []) : Promise.resolve([]),
  ]);

  const initData = initResponse ? initResponse : null;
  const scopeOptions = scopeResponse ? scopeResponse.items : [];
  const zoneOptions = zonesResponse?.items
    ? zonesResponse.items.map((z: { id: number; description?: string | null; zoneNo?: string | null }) => ({
      value: z.id.toString(),
      label: z.description && z.zoneNo ? `${z.zoneNo} — ${z.description}` : (z.description || z.zoneNo || ''),
    }))
    : [];

  const propertyTypeOptions = propertyTypesResponse?.items
    ? propertyTypesResponse.items.map((pt: PropertyType) => ({
      value: pt.id.toString(),
      label: pt.propertyDescription,
      searchText: `${pt.type} — ${pt.propertyDescription}`,
    }))
    : [];

  // Compute all job codes
  const allJobCodes = allJobsRes?.items?.map((j: any) => j.jobId) || [];

  // Compute dynamic stats
  const tempJobs: any[] = filteredAllRes?.items || [];
  const stats = {
    total: tempJobs.length,
    completed: tempJobs.filter((j) => ['completed', 'success'].includes(j.status?.toLowerCase())).length,
    running: tempJobs.filter((j) => ['running', 'inprogress'].includes(j.status?.toLowerCase())).length,
    failed: tempJobs.filter((j) => ['failed', 'error'].includes(j.status?.toLowerCase())).length,
  };

  return (
    <PageContainer>
      <div className="flex flex-col gap-4">
        <TableHeader
          title={t('title')}
          subtitle={t('subtitle')}
          icon="database"
          rightContent={<AddTaxesActions />}
        />
        <AddTaxesConsole
          initData={initData}
          scopeOptions={scopeOptions}
          zoneOptions={zoneOptions}
          propertyTypeOptions={propertyTypeOptions}
          allJobCodes={allJobCodes}
          filteredJobs={filteredPageRes?.items || []}
          totalCount={filteredPageRes?.totalCount || 0}
          totalPages={filteredPageRes?.totalPages || 0}
          pageNumber={auditPage}
          pageSize={auditPageSize}
          auditStats={stats}
          selectedJobDetails={selectedJobDetailObj}
          detailProperties={selectedJobProperties || []}
        />
      </div>
    </PageContainer>
  );
}
