import { redirect } from "next/navigation";

interface RtsRootPageProps {
  params: Promise<{ locale: string }>;
}

export default async function RtsRootPage({ params }: RtsRootPageProps) {
  const { locale } = await params;
  redirect(`/${locale}/rts/dashboard/rts-applications`);
}
