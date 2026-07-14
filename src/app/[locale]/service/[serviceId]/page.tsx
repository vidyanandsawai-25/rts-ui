import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { setRequestLocale } from "next-intl/server";
import { cookies } from "next/headers";

import { fetchLoginBrandingAction } from "@/app/[locale]/login/actions";
import { CitizenLayout } from "@/components/layout";
import DynamicServiceFormClient from "@/components/modules/forms/DynamicServiceFormClient";
import { getRtsFieldDefinitionsByServiceId } from "@/lib/api/rts/rtsfielddefinition.service";
import { getAllRtsDepartments } from "@/lib/api/rts/rtsdepartment.service";
import { getRtsServiceByIdSSR, submitRtsApplicationAction } from "./actions";

interface ServicePageProps {
  params: Promise<{
    locale: string;
    serviceId: string;
  }>;
  searchParams?: Promise<{
    deptId?: string;
    submit?: string;
    applicationNo?: string;
    status?: string;
  }>;
}

function pickNumber(...values: unknown[]): number | undefined {
  for (const value of values) {
    const parsed = Number(value);

    if (Number.isFinite(parsed) && parsed > 0) {
      return parsed;
    }
  }

  return undefined;
}

export async function generateMetadata({ params }: ServicePageProps): Promise<Metadata> {
  const { locale, serviceId } = await params;
  const { ulbData } = await fetchLoginBrandingAction();
  const routeServiceId = pickNumber(serviceId);
  const rtsService = routeServiceId ? await getRtsServiceByIdSSR(routeServiceId) : null;

  const ulbName =
    locale === "mr"
      ? ulbData?.ulbNameLocal || ulbData?.ulbName || "महानगरपालिका"
      : ulbData?.ulbName || "Municipal Corporation";

  const serviceName =
    locale !== "en" && rtsService?.serviceNameLocal?.trim()
      ? rtsService.serviceNameLocal.trim()
      : rtsService?.serviceName || `Service ${serviceId}`;

  return {
    title: `${serviceName} - ${ulbName}`,
    description:
      locale === "mr"
        ? `${ulbName} - ${serviceName} साठी ऑनलाइन अर्ज करा`
        : locale === "hi"
          ? `${ulbName} - ${serviceName} के लिए ऑनलाइन आवेदन करें`
          : `${ulbName} - Apply online for ${serviceName}`,
    icons: {
      icon: ulbData?.ulbLogo || "/favicon.ico",
    },
  };
}

export default async function ServiceFormPage({ params, searchParams }: ServicePageProps) {
  const { locale, serviceId } = await params;
  const resolvedSearchParams = searchParams ? await searchParams : undefined;
  setRequestLocale(locale);

  const routeServiceId = pickNumber(serviceId);

  if (!routeServiceId) {
    notFound();
  }

  const rtsService = await getRtsServiceByIdSSR(routeServiceId);
  const canonicalServiceId = pickNumber(rtsService?.id, serviceId);

  if (!canonicalServiceId) {
    notFound();
  }

  const departmentId = pickNumber(rtsService?.departmentId, resolvedSearchParams?.deptId);
  const fieldDefinitions = await getRtsFieldDefinitionsByServiceId(canonicalServiceId, departmentId);
  const submitState = resolvedSearchParams?.submit === "success" ? "success" : "form";
  const successTrackingId = resolvedSearchParams?.applicationNo?.trim() || "";
  const successApplicationStatus = resolvedSearchParams?.status?.trim() || "";

  const serviceTitle =
    locale !== "en" && rtsService?.serviceNameLocal?.trim()
      ? rtsService.serviceNameLocal.trim()
      : rtsService?.serviceName || `Service ${serviceId}`;

  let departmentTitle = "RTS Department";
  if (departmentId) {
    try {
      const departments = await getAllRtsDepartments();
      const dept = departments.find((d) => d.id === departmentId);
      if (dept) {
        departmentTitle =
          locale !== "en" && dept.departmentNameLocal?.trim()
            ? dept.departmentNameLocal.trim()
            : dept.departmentName;
      }
    } catch {
      // Fallback
    }
  }

  // Check login requirement server-side
  const cookieStore = await cookies();
  const isLoggedIn = cookieStore.has("rts_session");

  const s = serviceTitle.toLowerCase();
  const d = departmentTitle.toLowerCase();

  const isPropertyTax = s.includes("property") || s.includes("tax") || d.includes("property") || d.includes("tax") ||
                        s.includes("मालमत्ता") || s.includes("कर") || d.includes("मालमत्ता") || d.includes("कर");
                        
  const isTrade = s.includes("trade") || s.includes("license") || d.includes("trade") || d.includes("license") ||
                  s.includes("व्यवसाय") || s.includes("व्यापार") || d.includes("व्यवसाय") || d.includes("व्यापार");
                  
  const isWater = s.includes("water") || d.includes("water") ||
                  s.includes("पाणी") || s.includes("जल") || d.includes("पाणी") || d.includes("जल");

  const requiresLogin = isPropertyTax || isTrade || isWater;

  if (requiresLogin && !isLoggedIn) {
    redirect(`/${locale}/service/login?redirect=/${locale}/service/${serviceId}`);
  }

  const hasFieldDefinitions = Array.isArray(fieldDefinitions) && fieldDefinitions.length > 0;

  return (
    <CitizenLayout>
      {hasFieldDefinitions ? (
        <DynamicServiceFormClient
          locale={locale}
          serviceId={serviceId}
          govtServiceCode={canonicalServiceId}
          departmentId={departmentId}
          serviceTitle={serviceTitle}
          initialGroups={fieldDefinitions}
          submitApplicationAction={submitRtsApplicationAction}
          submitState={submitState}
          successTrackingId={successTrackingId}
          successApplicationStatus={successApplicationStatus}
          isLoggedIn={isLoggedIn}
        />
      ) : (
        <div className="mx-auto flex w-full max-w-[960px] flex-1 items-center justify-center px-4 py-10">
          <div className="w-full rounded-[28px] border border-[#dfe7ef] bg-white p-8 text-center shadow-[0_12px_32px_rgba(15,23,42,0.05)]">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#647792]">
              RTS Service Form
            </p>
            <h1 className="mt-3 text-3xl font-semibold text-[#102b55]">{serviceTitle}</h1>
            <p className="mt-2 text-sm text-[#5f7290]">{departmentTitle}</p>
            <div className="mx-auto mt-6 max-w-[560px] rounded-2xl border border-[#e6edf6] bg-[#f8fbff] px-6 py-8">
              <h2 className="text-xl font-semibold text-[#102b55]">Form Not Available Yet</h2>
              <p className="mt-3 text-sm leading-6 text-[#5f7290]">
                Form for this Service is Still not Created or Still in Development Stage
              </p>
            </div>
          </div>
        </div>
      )}
    </CitizenLayout>
  );
}
