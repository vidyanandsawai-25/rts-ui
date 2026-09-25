import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function EditConnectionTypeRedirect({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}) {
  const { locale, id } = await params;
  redirect(`/${locale}/water-bill/water-connection-master/connection-type/edit/${id}`);
}
