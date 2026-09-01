"use client";
/* eslint-disable i18next/no-literal-string */

import { useEffect, useMemo, useState, useTransition } from "react";
import { toast } from "sonner";

import {
  fetchAvailableTagsAction,
  fetchCertificateServiceFieldsAction,
  saveCertificateTemplateAction,
  type CertificateTemplateFormData,
  type CertificateUlbInfo,
} from "@/app/[locale]/rts/configuration-settings/rts-certificates/actions";
import type {
  CertificateAvailableTag,
  RTSCertificateServiceOption,
  RTSCertificateLibraryTemplate,
  RTSCertificateTemplate,
} from "@/types/rts/certificate.types";

import CertificateCanvasEditor from "./certificate-studio/CertificateCanvasEditor";
import {
  createStarterCertificateDesign,
  migrateLegacyCertificateHtml,
} from "./certificate-studio/migration";
import {
  parseCertificateDesign,
  type CertificateDesignDocument,
} from "./certificate-studio/schema";

interface RtsCertificateMasterStudioProps {
  initialTemplates: RTSCertificateTemplate[];
  services: RTSCertificateServiceOption[];
  ulbInfo?: CertificateUlbInfo;
  locale?: string;
  initialServiceId?: string;
  onBack?: () => void;
  onTemplateSaved?: (template: RTSCertificateTemplate) => void;
  starterTemplate?: RTSCertificateLibraryTemplate;
}

function normalizeLanguage(locale: string): "en" | "hi" | "mr" {
  if (locale === "mr" || locale === "hi") return locale;
  return "en";
}

export default function RtsCertificateMasterStudio({
  initialTemplates,
  services,
  ulbInfo,
  locale = "en",
  initialServiceId,
  onBack,
  onTemplateSaved,
  starterTemplate,
}: RtsCertificateMasterStudioProps) {
  const [templates, setTemplates] = useState(initialTemplates);
  const [availableTags, setAvailableTags] = useState<CertificateAvailableTag[]>([]);
  const [isPending, startTransition] = useTransition();

  const service = useMemo(
    () => services.find((item) => item.id === initialServiceId) || services[0],
    [initialServiceId, services]
  );
  const template = useMemo(
    () => templates.find((item) => String(item.serviceId) === service?.id),
    [service?.id, templates]
  );
  const language = normalizeLanguage(locale);
  const serviceName = language === "en" ? service?.name : service?.nameLocal || service?.name;
  const departmentName =
    language === "en"
      ? service?.departmentName
      : service?.departmentNameLocal || service?.departmentName;

  const initialDocument: CertificateDesignDocument = (() => {
    const persisted = parseCertificateDesign(template?.designJson);
    if (persisted) return persisted;
    if (template?.bodyContent) return migrateLegacyCertificateHtml(template.bodyContent, language);
    const starterDesign = parseCertificateDesign(starterTemplate?.designJson);
    if (starterDesign) return starterDesign;
    if (starterTemplate?.bodyContent) return migrateLegacyCertificateHtml(starterTemplate.bodyContent, language);
    return createStarterCertificateDesign(
      language,
      serviceName || "RTS Service",
      departmentName || "Municipal Department",
      ulbInfo?.ulbLogo || "/images/logo.png"
    );
  })();

  useEffect(() => {
    if (!service?.id) {
      return;
    }
    let cancelled = false;
    const serviceId = Number(service.id);
    Promise.all([
      fetchAvailableTagsAction(serviceId),
      fetchCertificateServiceFieldsAction(serviceId, service.departmentId),
    ]).then(([apiTags, fields]) => {
      if (cancelled) return;
      const fieldTags: CertificateAvailableTag[] = fields
        .filter((field) => field.isActive && field.fieldCode)
        .map((field) => ({
          tagKey: `{{Field:${field.fieldCode}}}`,
          tagLabelEnglish: field.fieldLabel || field.fieldCode,
          tagLabelMarathi: field.fieldLabelLocal || field.fieldLabel || field.fieldCode,
          sourceType: "System",
        }));
      setAvailableTags([...apiTags, ...fieldTags]);
    });
    return () => {
      cancelled = true;
    };
  }, [service?.departmentId, service?.id]);

  if (!service) {
    return (
      <div className="flex min-h-[420px] items-center justify-center rounded-xl border border-slate-200 bg-white p-8 text-sm font-semibold text-slate-600">
        No certificate-eligible service is available.
      </div>
    );
  }

  const handleSave = async (value: {
    design: CertificateDesignDocument;
    bodyContent: string;
    headerContent: string;
    footerContent: string;
    templateName: string;
    templateCode: string;
    isActive: boolean;
    defaultConditions: string[];
    officerFields: RTSCertificateTemplate["officerFields"];
  }): Promise<boolean> => {
    return await new Promise<boolean>((resolve) => {
      startTransition(async () => {
        const isCreatingServiceCertificate = !template;
        const payload: CertificateTemplateFormData = {
          id: template?.id,
          serviceId: service.id,
          templateName: value.templateName || `${serviceName || service.name} Certificate Template`,
          templateCode: value.templateCode || `CERT_${service.id}`,
          headerContent: value.headerContent,
          footerContent: value.footerContent,
          bodyContent: value.bodyContent,
          designJson: JSON.stringify(value.design),
          defaultConditions: value.defaultConditions,
          officerFields: value.officerFields,
          isActive: value.isActive,
        };
        const result = await saveCertificateTemplateAction(payload);
        if (!result.success || !result.template) {
          toast.error(result.error || "Unable to publish the certificate template.");
          resolve(false);
          return;
        }
        setTemplates((current) => {
          const index = current.findIndex(
            (item) => item.id === result.template?.id || item.serviceId === result.template?.serviceId
          );
          if (index < 0) return [result.template!, ...current];
          const next = [...current];
          next[index] = result.template!;
          return next;
        });
        onTemplateSaved?.(result.template);
        toast.success(
          isCreatingServiceCertificate && starterTemplate
            ? `${starterTemplate.templateName} was copied to ${serviceName || service.name}.`
            : isCreatingServiceCertificate
              ? `Certificate created for ${serviceName || service.name}.`
              : "Certificate design updated successfully."
        );
        resolve(true);
      });
    });
  };

  return (
    <CertificateCanvasEditor
      key={`${service.id}-${template?.updatedDate || template?.createdDate || "new"}`}
      initialDocument={initialDocument}
      availableTags={availableTags}
      serviceName={serviceName || service.name}
      departmentName={departmentName || service.departmentName || "Municipal Department"}
      templateName={template?.templateName || starterTemplate?.templateName || `${serviceName || service.name} Certificate Template`}
      templateCode={template?.templateCode || `CERT_${service.id}`}
      isActive={template?.isActive ?? true}
      defaultConditions={template?.defaultConditions || []}
      officerFields={template?.officerFields || []}
      persistenceReady
      saving={isPending}
      onBack={onBack}
      onSave={handleSave}
    />
  );
}
