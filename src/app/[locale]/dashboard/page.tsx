import { redirect } from "next/navigation";

interface DashboardPageProps {
  params: Promise<{ locale: string }>;
}

export default async function DashboardPage({ params }: DashboardPageProps) {
  const { locale } = await params;
  redirect(`/${locale}/rts/dashboard`);
}
