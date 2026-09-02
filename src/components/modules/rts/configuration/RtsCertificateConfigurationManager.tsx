"use client";

import { useCallback, useMemo, useRef, useState } from "react";
import {
  Award,
  ChevronDown,
  ChevronUp,
  CopyPlus,
  FileCheck2,
  FilePlus2,
  Eye,
  LayoutTemplate,
  Pencil,
  Printer,
  RotateCcw,
  Trash2,
  ZoomIn,
  ZoomOut,
} from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { toast } from "sonner";

import {
  AddButton,
  Button,
  Card,
  Drawer,
  EditButton,
  Label,
  MasterTable,
  Modal,
  SearchSelect,
  Select,
} from "@/components/common";
import type { Column } from "@/components/common/MasterTable";
import {
  deleteCertificateLibraryTemplateAction,
  type CertificateUlbInfo,
} from "@/app/[locale]/rts/configuration-settings/rts-certificates/actions";
import {
  RTS_DASHBOARD_TABLE_CLASS,
  RTS_DASHBOARD_TABLE_CONTAINER_CLASS,
  RTS_DASHBOARD_TABLE_HEAD_CLASS,
} from "@/lib/utils/rts/dashboard-table-styles";
import type {
  RTSCertificateDepartmentOption,
  RTSCertificateLibraryTemplate,
  RTSCertificateServiceOption,
  RTSCertificateTemplate,
} from "@/types/rts/certificate.types";

import RtsCertificateMasterStudio from "./RtsCertificateMasterStudio";
import RtsCertificateTemplateStudio from "./RtsCertificateTemplateStudio";
import { sanitizeCertificateHtml } from "./certificate-studio/compiler";

interface RtsCertificateConfigurationManagerProps {
  initialTemplates: RTSCertificateTemplate[];
  initialLibraryTemplates: RTSCertificateLibraryTemplate[];
  departments: RTSCertificateDepartmentOption[];
  services: RTSCertificateServiceOption[];
  ulbInfo?: CertificateUlbInfo;
  locale?: string;
}

type CertificateRegistryRow = Record<string, unknown> & {
  id: string;
  srNo: number;
  departmentName: string;
  serviceName: string;
  templateName: string;
  templateCode: string;
  isConfigured: boolean;
  isActive: boolean;
  updatedDate: string;
  template?: RTSCertificateTemplate;
};

const PAGE_SIZE = 10;
const PREVIEW_ZOOM_MIN = 40;
const PREVIEW_ZOOM_MAX = 150;
const PREVIEW_ZOOM_STEP = 10;
const PREVIEW_ZOOM_DEFAULT = 80;
const A4_PREVIEW_WIDTH_PX = 794;
const A4_PREVIEW_HEIGHT_PX = 1123;

function escapeHtmlText(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function getCertificatePreviewPageCount(template: RTSCertificateLibraryTemplate | null): number {
  if (!template?.designJson) return 1;
  try {
    const design = JSON.parse(template.designJson) as { page?: { pageCount?: unknown } };
    const pageCount = Number(design.page?.pageCount);
    return Number.isInteger(pageCount) && pageCount > 0 ? Math.min(pageCount, 50) : 1;
  } catch {
    return 1;
  }
}

export default function RtsCertificateConfigurationManager({
  initialTemplates,
  initialLibraryTemplates,
  departments,
  services,
  ulbInfo,
  locale: pageLocale,
}: RtsCertificateConfigurationManagerProps) {
  const activeLocale = useLocale() || pageLocale || "en";
  const t = useTranslations("rts.certificateRegistry");
  const numberFormatter = new Intl.NumberFormat(
    activeLocale === "mr" ? "mr-IN" : activeLocale === "hi" ? "hi-IN" : "en-IN"
  );
  const dateFormatter = new Intl.DateTimeFormat(
    activeLocale === "mr" ? "mr-IN" : activeLocale === "hi" ? "hi-IN" : "en-IN",
    { day: "2-digit", month: "long", year: "numeric" }
  );

  const [templates, setTemplates] = useState(initialTemplates);
  const [libraryTemplates, setLibraryTemplates] = useState(initialLibraryTemplates);
  const [departmentId, setDepartmentId] = useState("");
  const [serviceId, setServiceId] = useState("");
  const [page, setPage] = useState(1);
  const [editorServiceId, setEditorServiceId] = useState<string | null>(null);
  const [editorStarterTemplate, setEditorStarterTemplate] = useState<RTSCertificateLibraryTemplate | undefined>();
  const [templateEditorId, setTemplateEditorId] = useState<number | "new" | null>(null);
  const [showAllTemplates, setShowAllTemplates] = useState(false);
  const [selectedLibraryTemplate, setSelectedLibraryTemplate] = useState<RTSCertificateLibraryTemplate | undefined>();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newDepartmentId, setNewDepartmentId] = useState("");
  const [newServiceId, setNewServiceId] = useState("");
  const [previewTemplate, setPreviewTemplate] = useState<RTSCertificateLibraryTemplate | null>(null);
  const [previewZoom, setPreviewZoom] = useState(PREVIEW_ZOOM_DEFAULT);
  const [isPreviewPanning, setIsPreviewPanning] = useState(false);
  const previewViewportRef = useRef<HTMLDivElement>(null);
  const previewPanRef = useRef({
    pointerId: -1,
    startX: 0,
    startY: 0,
    scrollLeft: 0,
    scrollTop: 0,
  });

  const templateByService = useMemo(() => {
    const map = new Map<string, RTSCertificateTemplate>();
    templates.forEach((template) => map.set(String(template.serviceId), template));
    return map;
  }, [templates]);

  const localizedServiceName = useCallback(
    (service: RTSCertificateServiceOption) =>
      activeLocale === "mr" ? service.nameLocal || service.name : service.name,
    [activeLocale]
  );

  const localizedServiceDepartmentName = useCallback(
    (service: RTSCertificateServiceOption) =>
      activeLocale === "mr"
        ? service.departmentNameLocal || service.departmentName || t("unknownDepartment")
        : service.departmentName || t("unknownDepartment"),
    [activeLocale, t]
  );

  const localizedDepartmentName = useCallback(
    (department: RTSCertificateDepartmentOption) =>
      activeLocale === "mr" ? department.nameLocal || department.name : department.name,
    [activeLocale]
  );

  const unconfiguredServices = useMemo(
    () => services.filter((service) => !templateByService.has(service.id)),
    [services, templateByService]
  );
  const configuredServices = useMemo(
    () => services.filter((service) => templateByService.has(service.id)),
    [services, templateByService]
  );
  const configuredServiceCount = configuredServices.length;
  const visibleLibraryTemplates = showAllTemplates ? libraryTemplates : libraryTemplates.slice(0, 5);

  const modalDepartments = useMemo(() => {
    const departmentIds = new Set(
      unconfiguredServices
        .map((service) => String(service.departmentId ?? ""))
        .filter(Boolean)
    );
    return departments.filter((department) => departmentIds.has(String(department.id)));
  }, [departments, unconfiguredServices]);

  const modalServices = useMemo(
    () =>
      newDepartmentId
        ? unconfiguredServices.filter(
            (service) => String(service.departmentId ?? "") === newDepartmentId
          )
        : [],
    [newDepartmentId, unconfiguredServices]
  );

  const previewHtml = useMemo(
    () => (previewTemplate ? sanitizeCertificateHtml(previewTemplate.bodyContent) : ""),
    [previewTemplate]
  );

  const previewPageCount = useMemo(
    () => getCertificatePreviewPageCount(previewTemplate),
    [previewTemplate]
  );

  const previewHeight = A4_PREVIEW_HEIGHT_PX * previewPageCount;

  const previewDocument = useMemo(
    () =>
      previewTemplate
        ? `<!doctype html><html><head><meta charset="utf-8"><title>${escapeHtmlText(previewTemplate.templateName)}</title><style>@page{size:A4 portrait;margin:0}html,body{margin:0;width:210mm;min-height:297mm;background:#fff}*{box-sizing:border-box}@media screen{html,body{overflow:hidden}}@media print{html,body{overflow:visible}}</style></head><body>${previewHtml}</body></html>`
        : "",
    [previewHtml, previewTemplate]
  );

  const serviceFilterOptions = useMemo(
    () =>
      configuredServices.filter(
        (service) => !departmentId || String(service.departmentId ?? "") === departmentId
      ),
    [configuredServices, departmentId]
  );

  const filteredServices = useMemo(
    () =>
      configuredServices.filter((service) => {
        const matchesDepartment =
          !departmentId || String(service.departmentId ?? "") === departmentId;
        const matchesService = !serviceId || service.id === serviceId;
        return matchesDepartment && matchesService;
      }),
    [configuredServices, departmentId, serviceId]
  );

  const totalPages = Math.max(1, Math.ceil(filteredServices.length / PAGE_SIZE));
  const paginatedServices = filteredServices.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const rows: CertificateRegistryRow[] = paginatedServices.map((service, index) => {
    const template = templateByService.get(service.id);
    const rawDate = template?.updatedDate || template?.createdDate;
    let updatedDate = t("notAvailable");
    if (rawDate) {
      const date = new Date(rawDate);
      if (!Number.isNaN(date.getTime())) updatedDate = dateFormatter.format(date);
    }

    return {
      id: service.id,
      srNo: (page - 1) * PAGE_SIZE + index + 1,
      departmentName: localizedServiceDepartmentName(service),
      serviceName: localizedServiceName(service),
      templateName: template?.templateName || t("notCreated"),
      templateCode: template?.templateCode || t("notAvailable"),
      isConfigured: Boolean(template),
      isActive: template?.isActive ?? false,
      updatedDate,
      template,
    };
  });

  const columns: Column<CertificateRegistryRow>[] = [
    {
      key: "srNo",
      label: t("srNo"),
      width: "64px",
      align: "center",
      headerClassName: "border-r border-blue-300/60 text-white",
      cellClassName: "border-r border-slate-100 font-bold text-slate-500",
      render: (value) => numberFormatter.format(Number(value)),
    },
    {
      key: "departmentName",
      label: t("department"),
      headerClassName: "border-r border-blue-300/60 text-white",
      cellClassName: "border-r border-slate-100 font-medium text-slate-700",
    },
    {
      key: "serviceName",
      label: t("service"),
      headerClassName: "border-r border-blue-300/60 text-white",
      cellClassName: "border-r border-slate-100 font-semibold text-slate-950",
    },
    {
      key: "templateName",
      label: t("template"),
      headerClassName: "border-r border-blue-300/60 text-white",
      cellClassName: "border-r border-slate-100",
      render: (_value, row) => (
        <div className="space-y-0.5">
          <div className={row.isConfigured ? "font-semibold text-slate-900" : "font-medium italic text-slate-400"}>
            {row.templateName}
          </div>
          <div className="font-mono text-[10px] font-semibold text-slate-500">{row.templateCode}</div>
        </div>
      ),
    },
    {
      key: "isConfigured",
      label: t("status"),
      width: "130px",
      align: "center",
      headerClassName: "border-r border-blue-300/60 text-white",
      cellClassName: "border-r border-slate-100",
      render: (_value, row) => (
        <span
          className={`inline-flex rounded-full border px-2.5 py-1 text-[10px] font-extrabold ${
            !row.isConfigured
              ? "border-amber-200 bg-amber-50 text-amber-700"
              : row.isActive
                ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                : "border-slate-200 bg-slate-100 text-slate-600"
          }`}
        >
          {!row.isConfigured ? t("notConfigured") : row.isActive ? t("active") : t("inactive")}
        </span>
      ),
    },
    {
      key: "updatedDate",
      label: t("lastUpdated"),
      width: "130px",
      align: "center",
      headerClassName: "border-r border-blue-300/60 text-white",
      cellClassName: "border-r border-slate-100 whitespace-nowrap text-xs text-slate-600",
    },
  ];

  const handleTemplateSaved = (savedTemplate: RTSCertificateTemplate) => {
    setTemplates((current) => {
      const index = current.findIndex(
        (template) => template.id === savedTemplate.id || template.serviceId === savedTemplate.serviceId
      );
      if (index < 0) return [savedTemplate, ...current];
      const next = [...current];
      next[index] = savedTemplate;
      return next;
    });
  };

  const openServiceCertificateEditor = (
    targetServiceId: string,
    starterTemplate?: RTSCertificateLibraryTemplate
  ) => {
    if (!targetServiceId) return;
    // Existing service certificates always reopen their persisted service copy.
    // Reusable templates are passed only when creating a previously unconfigured service.
    setEditorStarterTemplate(templateByService.has(targetServiceId) ? undefined : starterTemplate);
    setEditorServiceId(targetServiceId);
  };

  const openAddModal = (starterTemplate?: RTSCertificateLibraryTemplate) => {
    setSelectedLibraryTemplate(starterTemplate);
    setNewDepartmentId("");
    setNewServiceId("");
    setIsAddModalOpen(true);
  };

  const handleLibraryTemplateSaved = (savedTemplate: RTSCertificateLibraryTemplate) => {
    setLibraryTemplates((current) => {
      const index = current.findIndex((template) => template.id === savedTemplate.id);
      if (index < 0) return [savedTemplate, ...current];
      const next = [...current];
      next[index] = savedTemplate;
      return next;
    });
    setTemplateEditorId(null);
  };

  const openTemplatePreview = (template: RTSCertificateLibraryTemplate) => {
    setPreviewZoom(PREVIEW_ZOOM_DEFAULT);
    setIsPreviewPanning(false);
    setPreviewTemplate(template);
    window.requestAnimationFrame(() => {
      window.requestAnimationFrame(() => previewViewportRef.current?.scrollTo({ top: 0, left: 0 }));
    });
  };

  const handlePreviewPointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    if (event.button !== 0) return;
    const viewport = previewViewportRef.current;
    if (!viewport) return;
    previewPanRef.current = {
      pointerId: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
      scrollLeft: viewport.scrollLeft,
      scrollTop: viewport.scrollTop,
    };
    event.currentTarget.setPointerCapture(event.pointerId);
    setIsPreviewPanning(true);
  };

  const handlePreviewPointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    const viewport = previewViewportRef.current;
    const pan = previewPanRef.current;
    if (!viewport || pan.pointerId !== event.pointerId) return;
    viewport.scrollLeft = pan.scrollLeft - (event.clientX - pan.startX);
    viewport.scrollTop = pan.scrollTop - (event.clientY - pan.startY);
  };

  const stopPreviewPanning = (event: React.PointerEvent<HTMLDivElement>) => {
    if (previewPanRef.current.pointerId !== event.pointerId) return;
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
    previewPanRef.current.pointerId = -1;
    setIsPreviewPanning(false);
  };

  const handleDeleteLibraryTemplate = async (template: RTSCertificateLibraryTemplate) => {
    if (!window.confirm(t("deleteTemplateConfirm", { name: template.templateName }))) return;
    const result = await deleteCertificateLibraryTemplateAction(template.id);
    if (!result.success) {
      toast.error(result.error || t("deleteTemplateFailed"));
      return;
    }
    setLibraryTemplates((current) => current.filter((item) => item.id !== template.id));
    setPreviewTemplate(null);
    toast.success(t("deleteTemplateSuccess"));
  };

  const printTemplatePreview = () => {
    if (!previewTemplate || !previewDocument) return;
    const existingPrintRoot = document.getElementById("certificate-template-print-root");
    existingPrintRoot?.remove();

    const printRoot = document.createElement("div");
    printRoot.id = "certificate-template-print-root";
    printRoot.setAttribute("aria-hidden", "true");
    printRoot.innerHTML = previewHtml;

    const printStyles = document.createElement("style");
    printStyles.id = "certificate-template-print-styles";
    printStyles.textContent = `
      #certificate-template-print-root { display: none; }
      @media print {
        @page { size: A4 portrait; margin: 0; }
        html, body { margin: 0 !important; background: #fff !important; }
        body > *:not(#certificate-template-print-root) { display: none !important; }
        body > #certificate-template-print-root {
          display: block !important;
          width: 210mm !important;
          min-height: 297mm !important;
          margin: 0 !important;
          background: #fff !important;
          print-color-adjust: exact;
          -webkit-print-color-adjust: exact;
        }
      }
    `;

    document.getElementById("certificate-template-print-styles")?.remove();
    document.head.appendChild(printStyles);
    document.body.appendChild(printRoot);

    let cleanupTimer = 0;
    const cleanup = () => {
      if (cleanupTimer) window.clearTimeout(cleanupTimer);
      printRoot.remove();
      printStyles.remove();
      window.removeEventListener("afterprint", cleanup);
    };

    window.addEventListener("afterprint", cleanup, { once: true });
    cleanupTimer = window.setTimeout(cleanup, 60_000);

    // This stays in the original click call stack, preserving the user
    // activation Edge requires for the main document's native print preview.
    window.print();
  };

  if (templateEditorId) {
    return (
      <RtsCertificateTemplateStudio
        key={templateEditorId}
        template={
          templateEditorId === "new"
            ? undefined
            : libraryTemplates.find((template) => template.id === templateEditorId)
        }
        ulbInfo={ulbInfo}
        locale={activeLocale}
        onBack={() => setTemplateEditorId(null)}
        onSaved={handleLibraryTemplateSaved}
      />
    );
  }

  if (editorServiceId) {
    return (
      <RtsCertificateMasterStudio
        key={editorServiceId}
        initialTemplates={templates}
        services={services}
        ulbInfo={ulbInfo}
        locale={activeLocale}
        initialServiceId={editorServiceId}
        starterTemplate={editorStarterTemplate}
        onBack={() => {
          setEditorServiceId(null);
          setEditorStarterTemplate(undefined);
        }}
        onTemplateSaved={handleTemplateSaved}
      />
    );
  }

  return (
    <div className="space-y-4 p-4">
      <Card className="flex flex-col justify-between gap-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:flex-row sm:items-center">
        <div className="flex min-w-0 items-center gap-4">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-blue-100 bg-blue-50 text-blue-600">
            <Award className="h-5 w-5" />
          </div>
          <div className="min-w-0">
            <h1 className="text-xl font-bold tracking-tight text-slate-800">{t("title")}</h1>
            <p className="mt-0.5 text-xs font-medium text-slate-500">{t("subtitle")}</p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs font-bold text-emerald-700">
            <FileCheck2 className="h-4 w-4" />
            {t("configuredCount", { count: numberFormatter.format(configuredServiceCount) })}
          </span>
          <AddButton
            type="button"
            onClick={() => setTemplateEditorId("new")}
            label={t("addTemplate")}
          />
          <AddButton
            type="button"
            onClick={() => openAddModal()}
            disabled={unconfiguredServices.length === 0}
            label={t("addCertificate")}
          />
        </div>
      </Card>

      <Card className="border border-slate-200 bg-white p-4 shadow-sm">
        <div className="mb-3 flex items-center justify-between gap-3">
          <div>
            <h2 className="flex items-center gap-2 text-sm font-extrabold text-slate-800">
              <LayoutTemplate className="h-4 w-4 text-blue-700" />
              {t("templateLibrary")}
            </h2>
            <p className="mt-0.5 text-xs text-slate-500">{t("templateLibraryHint")}</p>
          </div>
          {libraryTemplates.length > 5 && (
            <Button
              type="button"
              size="xs"
              variant="secondary"
              icon={showAllTemplates ? ChevronUp : ChevronDown}
              onClick={() => setShowAllTemplates((current) => !current)}
            >
              {showAllTemplates ? t("showLess") : t("seeMore")}
            </Button>
          )}
        </div>

        {visibleLibraryTemplates.length > 0 ? (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-5">
            {visibleLibraryTemplates.map((template) => (
              <article key={template.id} className="group overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm transition hover:border-blue-300 hover:shadow-md">
                <div className="relative h-48 overflow-hidden border-b border-slate-200 bg-slate-100">
                  <iframe
                    title={template.templateName}
                    srcDoc={template.bodyContent}
                    sandbox=""
                    tabIndex={-1}
                    className="pointer-events-none absolute left-0 top-0 h-[1120px] w-[794px] origin-top-left scale-[0.235] border-0 bg-white"
                  />
                  {!template.isActive && (
                    <span className="absolute right-2 top-2 rounded-full bg-slate-800 px-2 py-1 text-[9px] font-bold text-white">
                      {t("inactive")}
                    </span>
                  )}
                </div>
                <div className="space-y-2 p-3">
                  <div className="min-w-0">
                    <h3 className="truncate text-xs font-extrabold text-slate-900" title={template.templateName}>{template.templateName}</h3>
                    <p className="truncate font-mono text-[9px] font-semibold text-slate-500">{template.templateCode}</p>
                    <p className="mt-1 line-clamp-2 min-h-7 text-[10px] leading-3.5 text-slate-500">{template.description || t("noTemplateDescription")}</p>
                  </div>
                  <div className="grid grid-cols-3 gap-1">
                    <Button type="button" size="xs" variant="primary" icon={CopyPlus} disabled={!template.isActive || unconfiguredServices.length === 0} onClick={() => openAddModal(template)} className="px-1 text-[9px]">{t("useTemplate")}</Button>
                    <Button type="button" size="xs" variant="secondary" icon={Pencil} onClick={() => setTemplateEditorId(template.id)} className="px-1 text-[9px]">{t("edit")}</Button>
                    <Button type="button" size="xs" variant="secondary" icon={Eye} onClick={() => openTemplatePreview(template)} className="px-1 text-[9px]">{t("preview")}</Button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <button type="button" onClick={() => setTemplateEditorId("new")} className="flex min-h-40 w-full flex-col items-center justify-center rounded-xl border border-dashed border-blue-300 bg-blue-50/50 p-6 text-center hover:bg-blue-50">
            <LayoutTemplate className="mb-2 h-8 w-8 text-blue-600" />
            <span className="text-sm font-extrabold text-blue-900">{t("createFirstTemplate")}</span>
            <span className="mt-1 text-xs text-blue-700">{t("createFirstTemplateHint")}</span>
          </button>
        )}
      </Card>

      <Drawer
        open={Boolean(previewTemplate)}
        onClose={() => setPreviewTemplate(null)}
        width="lg"
        hideHeader
        bodyClassName="min-h-0 overflow-hidden bg-slate-200 [&>div]:h-full [&>div]:min-h-0"
        footer={
          <div className="flex w-full flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex w-fit items-center gap-1 rounded-lg border border-slate-200 bg-white p-1">
              <button
                type="button"
                aria-label={t("zoomOut")}
                title={t("zoomOut")}
                disabled={previewZoom <= PREVIEW_ZOOM_MIN}
                onClick={() => setPreviewZoom((value) => Math.max(PREVIEW_ZOOM_MIN, value - PREVIEW_ZOOM_STEP))}
                className="rounded-md p-1.5 text-slate-600 hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-40"
              >
                <ZoomOut className="h-4 w-4" />
              </button>
              <span className="min-w-12 text-center text-xs font-bold tabular-nums text-slate-700">
                {previewZoom}%
              </span>
              <button
                type="button"
                aria-label={t("zoomIn")}
                title={t("zoomIn")}
                disabled={previewZoom >= PREVIEW_ZOOM_MAX}
                onClick={() => setPreviewZoom((value) => Math.min(PREVIEW_ZOOM_MAX, value + PREVIEW_ZOOM_STEP))}
                className="rounded-md p-1.5 text-slate-600 hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-40"
              >
                <ZoomIn className="h-4 w-4" />
              </button>
              <button
                type="button"
                aria-label={t("resetZoom")}
                title={t("resetZoom")}
                onClick={() => setPreviewZoom(PREVIEW_ZOOM_DEFAULT)}
                className="rounded-md p-1.5 text-slate-600 hover:bg-slate-100"
              >
                <RotateCcw className="h-4 w-4" />
              </button>
            </div>
            <div className="flex flex-wrap justify-end gap-2">
              <Button type="button" variant="secondary" onClick={() => setPreviewTemplate(null)}>
                {t("close")}
              </Button>
              <Button type="button" variant="primary" icon={Printer} onClick={printTemplatePreview}>
                {t("printPdf")}
              </Button>
            </div>
          </div>
        }
      >
        <div className="flex h-full min-h-0 flex-col">
          <div className="flex shrink-0 items-center justify-between gap-4 border-b-2 border-blue-200 bg-[#F8FAFF] px-5 py-3">
            <div className="min-w-0">
              <h2 id="drawer-title" className="truncate text-base font-extrabold text-slate-800">
                {t("certificatePreview")}
              </h2>
              <p className="truncate text-[11px] font-medium text-slate-500">
                {previewTemplate?.templateName}
              </p>
            </div>
            <Button
              type="button"
              size="sm"
              variant="secondary"
              icon={Trash2}
              onClick={() => previewTemplate && void handleDeleteLibraryTemplate(previewTemplate)}
              className="shrink-0 text-red-600 hover:border-red-200 hover:bg-red-50"
            >
              {t("delete")}
            </Button>
          </div>
          <div
            ref={previewViewportRef}
            role="region"
            aria-label={t("previewViewport")}
            tabIndex={0}
            onPointerDown={handlePreviewPointerDown}
            onPointerMove={handlePreviewPointerMove}
            onPointerUp={stopPreviewPanning}
            onPointerCancel={stopPreviewPanning}
            className={`min-h-0 flex-1 select-none overflow-auto p-6 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-400 ${
              isPreviewPanning ? "cursor-grabbing" : "cursor-grab"
            }`}
            style={{ touchAction: "none" }}
          >
            <div
              className="mx-auto origin-top-left shadow-2xl"
              style={{
                width: `${A4_PREVIEW_WIDTH_PX * (previewZoom / 100)}px`,
                height: `${previewHeight * (previewZoom / 100)}px`,
              }}
            >
              <iframe
                key={previewTemplate?.id}
                title={previewTemplate?.templateName || t("certificatePreview")}
                srcDoc={previewDocument}
                sandbox=""
                className="block border-0 bg-white"
                style={{
                  width: `${A4_PREVIEW_WIDTH_PX}px`,
                  height: `${previewHeight}px`,
                  minWidth: `${A4_PREVIEW_WIDTH_PX}px`,
                  minHeight: `${previewHeight}px`,
                  transform: `scale(${previewZoom / 100})`,
                  transformOrigin: "top left",
                  overflow: "hidden",
                  pointerEvents: "none",
                }}
              />
            </div>
          </div>
        </div>
      </Drawer>

      <Card className="border border-slate-200 bg-white p-3 shadow-sm">
        <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 lg:grid-cols-5">
          <div className="space-y-1 sm:col-span-2">
            <Label className="text-[10px] font-bold uppercase text-[#3d3d3d]">{t("department")}</Label>
            <Select
              value={departmentId}
              selectSize="sm"
              ariaLabel={t("department")}
              options={[
                { label: t("allDepartments"), value: "" },
                ...departments.map((department) => ({
                  label: localizedDepartmentName(department),
                  value: department.id,
                })),
              ]}
              onChange={(_event, value) => {
                setDepartmentId(value);
                setServiceId("");
                setPage(1);
              }}
              className="w-full"
            />
          </div>
          <div className="space-y-1 sm:col-span-2">
            <Label className="text-[10px] font-bold uppercase text-[#3d3d3d]">{t("service")}</Label>
            <Select
              value={serviceId}
              selectSize="sm"
              ariaLabel={t("service")}
              options={[
                { label: t("allServices"), value: "" },
                ...serviceFilterOptions.map((service) => ({
                  label: localizedServiceName(service),
                  value: service.id,
                })),
              ]}
              onChange={(_event, value) => {
                setServiceId(value);
                setPage(1);
              }}
              className="w-full"
            />
          </div>
        </div>
      </Card>

      <div className="flex items-center gap-2 px-1">
        <FileCheck2 className="h-4 w-4 text-blue-700" />
        <h2 className="text-sm font-extrabold text-slate-800">{t("configuredCertificates")}</h2>
      </div>

      <MasterTable
        columns={columns}
        data={rows}
        getRowKey={(row) => row.id}
        emptyText={t("noServices")}
        actionLabel={t("actions")}
        pageNumber={page}
        pageSize={PAGE_SIZE}
        totalCount={filteredServices.length}
        totalPages={totalPages}
        onPageChange={setPage}
        paginationConfig={{ enabled: totalPages > 1, showPageSizeSelector: false }}
        maxBodyHeightClassName="max-h-none"
        theadClassName={RTS_DASHBOARD_TABLE_HEAD_CLASS}
        tableClassName={`${RTS_DASHBOARD_TABLE_CLASS} border-collapse text-left text-sm`}
        containerClassName={RTS_DASHBOARD_TABLE_CONTAINER_CLASS}
        rowClassName={(row) => (row.isConfigured ? "hover:bg-blue-50" : "bg-amber-50/30 hover:bg-amber-50/60")}
        renderActions={(row) =>
          row.isConfigured ? (
            <EditButton
              type="button"
              className="size-10 px-0"
              aria-label={t("editCertificate")}
              title={t("editCertificate")}
              onClick={() => openServiceCertificateEditor(row.id)}
            />
          ) : (
            <Button
              type="button"
              size="xs"
              variant="primary"
              icon={FilePlus2}
              onClick={() => openServiceCertificateEditor(row.id)}
              className="whitespace-nowrap rounded-lg px-3 text-xs font-bold"
            >
              {t("create")}
            </Button>
          )
        }
      />

      <Modal
        open={isAddModalOpen}
        onClose={() => {
          setIsAddModalOpen(false);
          setNewDepartmentId("");
          setNewServiceId("");
        }}
        title={selectedLibraryTemplate ? t("useTemplateTitle") : t("chooseServiceTitle")}
        maxWidth="lg"
      >
        <div className="space-y-5 p-1 sm:p-2">
          {unconfiguredServices.length > 0 ? (
            <>
              <div className="grid gap-5 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="certificate-department-search" className="text-xs font-bold text-slate-700">
                    {t("department")}
                  </Label>
                  <SearchSelect
                    id="certificate-department-search"
                    name="certificateDepartmentId"
                    value={newDepartmentId}
                    options={modalDepartments.map((department) => ({
                      label: localizedDepartmentName(department),
                      value: String(department.id),
                    }))}
                    placeholder={t("searchDepartments")}
                    emptyMessage={t("noDepartmentsAvailable")}
                    onChange={(_name, value) => {
                      setNewDepartmentId(value);
                      setNewServiceId("");
                    }}
                    className="w-full"
                    autoFocus
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="certificate-service-search" className="text-xs font-bold text-slate-700">
                    {t("service")}
                  </Label>
                  <SearchSelect
                    id="certificate-service-search"
                    name="certificateServiceId"
                    value={newServiceId}
                    options={modalServices.map((service) => ({
                      label: localizedServiceName(service),
                      value: service.id,
                    }))}
                    placeholder={
                      newDepartmentId ? t("searchServices") : t("selectDepartmentFirst")
                    }
                    noOptionsPlaceholder={
                      newDepartmentId ? t("noServicesForDepartment") : t("selectDepartmentFirst")
                    }
                    emptyMessage={t("noServicesForDepartment")}
                    disabled={!newDepartmentId}
                    onChange={(_name, value) => setNewServiceId(value)}
                    className="w-full"
                  />
                </div>
              </div>

              <p className="rounded-lg border border-blue-100 bg-blue-50 px-3 py-2.5 text-xs leading-5 text-slate-600">
                {selectedLibraryTemplate
                  ? t("useTemplateHint", { name: selectedLibraryTemplate.templateName })
                  : t("chooseServiceHint")}
              </p>
              <div className="flex justify-end gap-2 border-t border-slate-100 pt-3">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => {
                    setIsAddModalOpen(false);
                    setNewDepartmentId("");
                    setNewServiceId("");
                  }}
                >
                  {t("cancel")}
                </Button>
                <Button
                  type="button"
                  variant="primary"
                  icon={Pencil}
                  disabled={!newServiceId}
                  onClick={() => {
                    setIsAddModalOpen(false);
                    openServiceCertificateEditor(newServiceId, selectedLibraryTemplate);
                  }}
                >
                  {selectedLibraryTemplate ? t("useAndCustomize") : t("openStudio")}
                </Button>
              </div>
            </>
          ) : (
            <p className="py-6 text-center text-sm font-semibold text-slate-600">{t("allConfigured")}</p>
          )}
        </div>
      </Modal>
    </div>
  );
}
