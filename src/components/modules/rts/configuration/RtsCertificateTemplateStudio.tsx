"use client";
import { useTransition } from "react";
import { toast } from "sonner";

import {
  saveCertificateLibraryTemplateAction,
  type CertificateUlbInfo,
} from "@/app/[locale]/rts/configuration-settings/rts-certificates/actions";
import type { RTSCertificateLibraryTemplate } from "@/types/rts/certificate.types";

import CertificateCanvasEditor from "./certificate-studio/CertificateCanvasEditor";
import {
  createStarterCertificateDesign,
  migrateLegacyCertificateHtml,
} from "./certificate-studio/migration";
import {
  parseCertificateDesign,
  type CertificateDesignDocument,
} from "./certificate-studio/schema";

interface RtsCertificateTemplateStudioProps {
  template?: RTSCertificateLibraryTemplate;
  ulbInfo?: CertificateUlbInfo;
  locale?: string;
  onBack: () => void;
  onSaved: (template: RTSCertificateLibraryTemplate) => void;
}

function normalizeLanguage(locale: string): "en" | "hi" | "mr" {
  if (locale === "mr" || locale === "hi") return locale;
  return "en";
}

export default function RtsCertificateTemplateStudio({
  template,
  ulbInfo,
  locale = "en",
  onBack,
  onSaved,
}: RtsCertificateTemplateStudioProps) {
  const [isPending, startTransition] = useTransition();
  const language = normalizeLanguage(locale);

  const initialDocument: CertificateDesignDocument = (() => {
    const persisted = parseCertificateDesign(template?.designJson);
    if (persisted) return persisted;
    if (template?.bodyContent) return migrateLegacyCertificateHtml(template.bodyContent, language);
    return createStarterCertificateDesign(
      language,
      "Reusable Certificate",
      "Certificate Template Library",
      ulbInfo?.ulbLogo || "/images/logo.png",
      false
    );
  })();

  const handleSave = async (value: {
    design: CertificateDesignDocument;
    bodyContent: string;
    headerContent: string;
    footerContent: string;
    templateName: string;
    templateCode: string;
    description?: string;
    isActive: boolean;
  }): Promise<boolean> => {
    return await new Promise<boolean>((resolve) => {
      startTransition(async () => {
        const result = await saveCertificateLibraryTemplateAction({
          id: template?.id,
          templateName: value.templateName,
          templateCode: value.templateCode,
          description: value.description,
          headerContent: value.headerContent,
          footerContent: value.footerContent,
          bodyContent: value.bodyContent,
          designJson: JSON.stringify(value.design),
          isActive: value.isActive,
        });

        if (!result.success || !result.template) {
          toast.error(result.error || "Unable to save the reusable certificate template.");
          resolve(false);
          return;
        }

        onSaved(result.template);
        toast.success("Reusable certificate template saved successfully.");
        resolve(true);
      });
    });
  };

  return (
    <CertificateCanvasEditor
      key={`${template?.id || "new"}-${template?.updatedDate || template?.createdDate || "draft"}`}
      editorMode="template"
      initialDocument={initialDocument}
      templateName={template?.templateName || "New Certificate Template"}
      templateCode={template?.templateCode || "CERT_TEMPLATE"}
      description={template?.description || ""}
      isActive={template?.isActive ?? true}
      persistenceReady
      saving={isPending}
      onBack={onBack}
      onSave={handleSave}
    />
  );
}
