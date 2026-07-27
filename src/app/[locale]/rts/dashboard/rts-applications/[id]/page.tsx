import { notFound } from "next/navigation";
import {
  getApplicationDetailAction,
  submitApplicationActionAction,
} from "../actions";
import RtsApplicationDetails from "@/components/modules/rts/dashboard/RtsApplicationDetails";

type PageProps = {
  params: Promise<{
    locale: string;
    id: string;
  }>;
};

export default async function RtsApplicationDetailsPage({ params }: PageProps) {
  const { id: applicationNo, locale } = await params;

  const data = await getApplicationDetailAction(applicationNo);
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
