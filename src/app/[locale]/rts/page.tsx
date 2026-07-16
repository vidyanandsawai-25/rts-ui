import { redirect } from "next/navigation";

export default async function CmsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  redirect(`/${locale}/rts/misdashboard`);
}
