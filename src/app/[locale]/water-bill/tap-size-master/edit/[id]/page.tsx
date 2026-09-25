import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function EditTapSizeRedirect({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}) {
  const { locale, id } = await params;
  redirect(`/${locale}/water-bill/water-connection-master/tap-size/edit/${id}`);
}
