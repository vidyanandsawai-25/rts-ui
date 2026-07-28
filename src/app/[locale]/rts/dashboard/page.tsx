import { redirect } from "next/navigation";

export default async function RtsDashboardPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  redirect(`/${locale}/rts/dashboard/rts-mis`);
}
