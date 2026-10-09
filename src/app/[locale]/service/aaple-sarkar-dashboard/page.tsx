import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import { cookies } from "next/headers";
import { CitizenLayout } from "@/components/layout";
import { fetchLoginBrandingAction } from "@/app/[locale]/login/actions";
import AapleSarkarDashboardClient from "./AapleSarkarDashboardClient";
import { fetchAapleSarkarDashboardAction } from "./actions";

interface AapleSarkarDashboardPageProps {
  params: Promise<{ locale: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export async function generateMetadata({ params }: AapleSarkarDashboardPageProps): Promise<Metadata> {
  const { locale } = await params;
  const { ulbData } = await fetchLoginBrandingAction();

  const ulbName =
    locale === "mr"
      ? ulbData?.ulbNameLocal || ulbData?.ulbName || "महानगरपालिका"
      : ulbData?.ulbName || "Municipal Corporation";

  const title =
    locale === "mr"
      ? `${ulbName} - आपले सरकार नागरिक डॅशबोर्ड`
      : `${ulbName} - Aaple Sarkar Citizen Dashboard`;

  return {
    title,
    icons: {
      icon: ulbData?.ulbLogo || "/favicon.ico",
    },
  };
}

export default async function AapleSarkarDashboardPage({
  params,
  searchParams,
}: AapleSarkarDashboardPageProps) {
  const { locale } = await params;
  const query = await searchParams;
  setRequestLocale(locale);

  const getQueryValue = (value: string | string[] | undefined) =>
    typeof value === "string" ? value : undefined;

  const cookieStore = await cookies();
  const cuidFromCookie = cookieStore.get("CUID")?.value;

  const cuid =
    getQueryValue(query.CUID) ||
    getQueryValue(query.cuid) ||
    cuidFromCookie ||
    getQueryValue(query.Appid) ||
    "";

  const { ulbData } = await fetchLoginBrandingAction();
  const ulbName =
    locale === "mr"
      ? ulbData?.ulbNameLocal || ulbData?.ulbName || "महानगरपालिका"
      : ulbData?.ulbName || "Municipal Corporation";

  const initialData = await fetchAapleSarkarDashboardAction(cuid, "", "All", 1, 10);

  return (
    <CitizenLayout>
      <AapleSarkarDashboardClient
        initialData={initialData}
        cuid={cuid}
        locale={locale}
        ulbName={ulbName}
      />
    </CitizenLayout>
  );
}
