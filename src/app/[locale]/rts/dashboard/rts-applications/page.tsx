import RtsApplicationDashboard from "@/components/modules/rts/dashboard/RtsApplicationDashboard";
import {
  getRtsApplicationApprovalDetailsAction,
  getRtsApplicationFilterOptionsAction,
  getRtsApplicationsDashboardAction,
} from "./actions";
import { toApplicationFilterSlug } from "@/lib/utils/rts/application-filter-slug";

type SearchParams = Record<string, string | string[] | undefined>;

function getFirstValue(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

function getPositiveInteger(value: string | undefined): number | undefined {
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : undefined;
}

function findUniqueMasterBySlug<T extends { id: number }>(
  items: T[],
  slug: string | undefined,
  getName: (item: T) => string
): T | undefined {
  if (!slug) return undefined;

  const matches = items.filter((item) => toApplicationFilterSlug(getName(item)) === slug);
  return matches.length === 1 ? matches[0] : undefined;
}

export default async function RtsApplicationsPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<SearchParams>;
}) {
  const { locale } = await params;
  const query = await searchParams;
  const pageNumber = getPositiveInteger(getFirstValue(query.PageNumber)) ?? 1;
  const applicationId = getPositiveInteger(getFirstValue(query.ApplicationId));
  const departmentSlug = getFirstValue(query.Department)?.trim().toLowerCase() || undefined;
  const serviceSlug = getFirstValue(query.Service)?.trim().toLowerCase() || undefined;
  const applicationStatus = getFirstValue(query.Status)?.trim() || undefined;
  const search = getFirstValue(query.Search)?.trim() || undefined;

  const filterOptions = await getRtsApplicationFilterOptionsAction();
  const selectedDepartment = findUniqueMasterBySlug(
    filterOptions.departments,
    departmentSlug,
    (department) => department.departmentName
  );
  const serviceCandidates = selectedDepartment
    ? filterOptions.services.filter((service) => service.departmentId === selectedDepartment.id)
    : filterOptions.services;
  const selectedService = findUniqueMasterBySlug(
    serviceCandidates,
    serviceSlug,
    (service) => service.serviceName
  );
  const dashboardData = await getRtsApplicationsDashboardAction({
    pageNumber,
    departmentId: selectedDepartment?.id,
    serviceId: selectedService?.id,
    applicationStatus,
    search,
  });
  const selectedApplication = applicationId
    ? dashboardData.rows.find((row) => row.applicationId === applicationId)
    : undefined;
  const approvalDetails = selectedApplication
    ? await getRtsApplicationApprovalDetailsAction(selectedApplication.applicationId)
    : null;

  return (
    <div className="w-full">
      <RtsApplicationDashboard
        kpis={dashboardData.kpis}
        rows={dashboardData.rows}
        locale={locale}
        error={dashboardData.error}
        departments={filterOptions.departments}
        services={filterOptions.services}
        filters={{
          pageNumber,
          pageSize: 10,
          departmentId: selectedDepartment?.id ?? null,
          serviceId: selectedService?.id ?? null,
          departmentSlug: selectedDepartment ? toApplicationFilterSlug(selectedDepartment.departmentName) : '',
          serviceSlug: selectedService ? toApplicationFilterSlug(selectedService.serviceName) : '',
          status: applicationStatus ?? "",
          search: search ?? "",
          applicationId: selectedApplication?.applicationId ?? null,
        }}
        pagination={dashboardData.pagination}
        approvalDetails={approvalDetails}
      />
    </div>
  );
}
