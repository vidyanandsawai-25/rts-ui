import { getCmsApplicationsAction, getCmsMastersAction } from "../actions";
import CmsInbox from "@/components/modules/cms/CmsInbox";

interface InboxPageProps {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{
    page?: string;
    q?: string;
    status?: string;
    deptId?: string;
    serviceId?: string;
    priority?: string;
    officerId?: string;
  }>;
}

export default async function CmsInboxPage({ params, searchParams }: InboxPageProps) {
  const { locale } = await params;
  const sParams = await searchParams;

  const page = parseInt(sParams.page || "1", 10) || 1;
  const q = sParams.q || "";
  const status = sParams.status || "All";
  const deptId = sParams.deptId || "All";
  const serviceId = sParams.serviceId || "All";
  const priority = sParams.priority || "All";
  const officerId = sParams.officerId || "All";

  const [inboxResult, masters] = await Promise.all([
    getCmsApplicationsAction(page, 10, q, status, deptId, serviceId, priority, officerId),
    getCmsMastersAction()
  ]);

  return (
    <div className="w-full">
      <CmsInbox
        data={inboxResult.items}
        pageNumber={inboxResult.pageNumber}
        pageSize={inboxResult.pageSize}
        totalCount={inboxResult.totalCount}
        totalPages={inboxResult.totalPages}
        masters={masters}
        locale={locale}
        filters={{ q, status, deptId, serviceId, priority, officerId }}
      />
    </div>
  );
}
