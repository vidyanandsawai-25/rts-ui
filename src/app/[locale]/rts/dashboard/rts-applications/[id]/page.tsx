import { notFound } from "next/navigation";
import {
  getApplicationDetailAction,
  submitApplicationActionAction,
} from "./actions";
import RtsApplicationDetails from "@/components/modules/rts/dashboard/RtsApplicationDetails";

type PageProps = {
  params: Promise<{
    locale: string;
    id: string;
  }>;
};

export default async function RtsApplicationDetailsPage({ params }: PageProps) {
  const { id, locale } = await params;
  const applicationId = Number(id);

  if (!Number.isInteger(applicationId) || applicationId <= 0) {
    notFound();
  }

  const data = await getApplicationDetailAction(applicationId);
  if (!data) {
    notFound();
  }

  return (
    <div className="w-full">
      <RtsApplicationDetails
        data={data}
        locale={locale}
        submitAction={submitApplicationActionAction}
      />
    </div>
  );
}
