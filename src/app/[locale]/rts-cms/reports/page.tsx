import { getCmsApplicationsAction, getCmsMastersAction } from "../actions";
import CmsReports from "@/components/modules/cms/CmsReports";

export default async function CmsReportsPage() {
  const [inboxResult, masters] = await Promise.all([
    getCmsApplicationsAction(1, 10000), // Get all applications for reports
    getCmsMastersAction()
  ]);

  return (
    <div className="w-full">
      <CmsReports
        initialApplications={inboxResult.items}
        masters={masters}
      />
    </div>
  );
}
