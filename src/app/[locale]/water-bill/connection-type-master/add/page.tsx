import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function AddConnectionTypeRedirect({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  redirect(`/${locale}/water-bill/water-connection-master/connection-type/add`);
}
