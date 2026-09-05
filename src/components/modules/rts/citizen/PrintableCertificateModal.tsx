"use client";

import { useEffect, useState } from "react";
import {
  AlertCircle,
  Download,
  ExternalLink,
  FileText,
  Loader2,
  Printer,
  ShieldCheck,
  User,
  Calendar,
  Layers,
} from "lucide-react";
import { Button, Modal, OfficialCertificateSheet } from "@/components/common";
import { getIssuedCertificateAction } from "@/app/[locale]/rts/dashboard/rts-applications/actions";
import type { RTSIssuedCertificate } from "@/types/rts/certificate.types";
import { useLocale } from "next-intl";

interface PrintableCertificateModalProps {
  isOpen: boolean;
  onClose: () => void;
  applicationNo?: string;
  applicationId?: number;
  certificateNo?: string;
}

export default function PrintableCertificateModal({
  isOpen,
  onClose,
  applicationNo,
  applicationId,
  certificateNo,
}: PrintableCertificateModalProps) {
  const currentLocale = useLocale();
  const isMr = currentLocale === "mr";

  const [loading, setLoading] = useState(false);
  const [certificate, setCertificate] = useState<RTSIssuedCertificate | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isImage, setIsImage] = useState<boolean>(true);

  const isManual = certificate?.certificateType === 2;
  const lookupKey = applicationNo || (applicationId ? String(applicationId) : "") || certificateNo || "";

  const docViewUrl = certificate?.documentGuid
    ? `/api/rts/documents/${certificate.documentGuid}/view`
    : certificate?.documentDownloadUrl || "";

  const docDownloadUrl = certificate?.documentDownloadUrl ||
    (certificate?.documentGuid ? `/api/rts/documents/${certificate.documentGuid}/download` : "#");

  useEffect(() => {
    if (!isOpen || !lookupKey) return;

    const fetchCertificate = async () => {
      setLoading(true);
      setError(null);
      setIsImage(true);
      try {
        const res = await getIssuedCertificateAction(lookupKey);

        if (res && res.success && res.data) {
          setCertificate(res.data);
        } else {
          setError(res?.error || (isMr ? "प्रमाणपत्र सापडले नाही किंवा अद्याप जारी झालेले नाही." : "Certificate not found or not yet issued."));
        }
      } catch (err: any) {
        setError(err.message || (isMr ? "प्रमाणपत्र लोड करण्यात अडचण आली." : "Failed to load certificate."));
      } finally {
        setLoading(false);
      }
    };

    fetchCertificate();
  }, [isOpen, lookupKey, isMr]);

  const handlePrint = () => {
    if (isManual && docViewUrl) {
      const printWindow = window.open("", "_blank");
      if (!printWindow) return;
      printWindow.document.write(`
        <!DOCTYPE html>
        <html>
          <head>
            <title>${certificate?.certificateNo || "Certificate"}</title>
            <meta charset="utf-8" />
            <style>
              @page { size: A4 portrait; margin: 8mm; }
              body { margin: 0; display: flex; flex-direction: column; align-items: center; justify-content: center; font-family: 'Segoe UI', Arial, sans-serif; background: #fff; text-align: center; }
              .header { font-size: 13px; font-weight: bold; margin-bottom: 6px; color: #1e293b; }
              img { max-width: 100%; max-height: 92vh; object-fit: contain; }
            </style>
          </head>
          <body>
            <div class="header">${certificate?.serviceName || "Official Certificate"} | ${certificate?.certificateNo || ""}</div>
            <img src="${docViewUrl}" alt="Certificate" onload="setTimeout(() => window.print(), 500)" />
          </body>
        </html>
      `);
      printWindow.document.close();
      return;
    }

    if (!certificate?.mergedHtmlContent) return;

    const printWindow = window.open("", "_blank");
    if (!printWindow) return;

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>${certificate.certificateNo}</title>
          <meta charset="utf-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1.0" />
          <link rel="preconnect" href="https://fonts.googleapis.com">
          <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
          <link href="https://fonts.googleapis.com/css2?family=Noto+Sans+Devanagari:wght@400;500;600;700;800;900&display=swap" rel="stylesheet">
          <script src="https://cdn.tailwindcss.com"></script>
          <style>
            * {
              font-family: 'Noto Sans Devanagari', 'Segoe UI', Arial, sans-serif;
              box-sizing: border-box;
            }
            @page {
              size: A4 portrait;
              margin: 10mm;
            }
            @media print {
              html, body {
                margin: 0 !important;
                padding: 0 !important;
                background: #fff !important;
                -webkit-print-color-adjust: exact !important;
                print-color-adjust: exact !important;
              }
              .no-print { display: none !important; }
            }
            .official-certificate-sheet {
              border: 5px double #0f172a !important;
              box-shadow: none !important;
            }
          </style>
        </head>
        <body class="bg-white text-slate-900 p-2 md:p-4">
          ${certificate.mergedHtmlContent}
          <script>
            setTimeout(() => {
              window.print();
            }, 600);
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  return (
    <Modal
      open={isOpen}
      onClose={onClose}
      title={
        isManual
          ? (isMr ? "अधिकृत मॅन्युअल प्रमाणपत्र" : "Official Manual Certificate")
          : (isMr ? "अधिकृत प्रमाणपत्र" : "Official Issued Certificate")
      }
      maxWidth="xl"
    >
      <div className="flex flex-col max-h-[82vh] overflow-hidden">
        {/* Actions Bar */}
        <div className="bg-white border-b border-slate-200 px-4 sm:px-6 py-2.5 flex flex-wrap justify-between items-center gap-2 shrink-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className={`inline-flex items-center gap-1.5 px-3 py-1 text-xs font-bold rounded-full border ${
              isManual
                ? "bg-amber-50 text-amber-900 border-amber-300"
                : "bg-emerald-50 text-emerald-800 border-emerald-300"
            }`}>
              <ShieldCheck className={`w-3.5 h-3.5 ${isManual ? "text-amber-600" : "text-emerald-600"}`} />
              {isManual
                ? (isMr ? "विभागीय मॅन्युअल प्रमाणपत्र" : "Department Manual Certificate")
                : (isMr ? "डिजिटल स्वाक्षरीने प्रमाणित अधिकृत प्रमाणपत्र" : "Digitally Verified Official Certificate")}
            </span>
            {certificate && (
              <span className="text-xs font-mono text-slate-700 font-bold bg-slate-100 px-2.5 py-1 rounded-md border border-slate-200">
                {isMr ? "क्र." : "No."}: {certificate.certificateNo}
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            {isManual && certificate && docViewUrl && (
              <a
                href={docViewUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold flex items-center gap-1.5 border border-slate-300 rounded-xl px-3 py-1.5 transition-all shadow-sm"
              >
                <ExternalLink className="w-3.5 h-3.5 text-slate-600" />
                {isMr ? "नवीन टॅबमध्ये उघडा" : "Open in New Tab"}
              </a>
            )}

            {isManual && certificate && docDownloadUrl && (
              <a
                href={docDownloadUrl}
                target="_blank"
                rel="noopener noreferrer"
                download
                className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm rounded-xl px-3.5 py-1.5 transition-all"
              >
                <Download className="w-3.5 h-3.5" />
                {isMr ? "डाऊनलोड करा" : "Download"}
              </a>
            )}

            {(certificate?.mergedHtmlContent || (isManual && docViewUrl)) && (
              <Button
                onClick={handlePrint}
                disabled={loading || !certificate}
                className="bg-[#4b70a6] hover:bg-[#3d5a8a] text-white text-xs font-bold flex items-center gap-1.5 shadow-sm rounded-xl px-3.5 py-1.5"
              >
                <Printer className="w-3.5 h-3.5" />
                {isMr ? "प्रिंट" : "Print"}
              </Button>
            )}
          </div>
        </div>

        {/* Compact Statutory Notice Bar for Manual Certificate */}
        {isManual && (
          <div className="bg-amber-50/90 border-b border-amber-300 px-4 sm:px-6 py-2 flex items-center gap-2.5 text-amber-950 shrink-0">
            <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
            <p className="text-xs font-bold text-amber-900 leading-tight">
              {certificate?.departmentCollectionNotice ||
                (isMr
                  ? "महत्त्वाची वैधानिक सूचना: सदर मूळ अधिकृत प्रमाणपत्र अर्जदाराने संबंधित विभागामधून जमा (collect) करून घ्यावे."
                  : "Statutory Notice: The original official certificate must be collected from the respective department.")}
            </p>
          </div>
        )}

        {/* Certificate Display Body - Fully Responsive, No Double Scrollers */}
        <div className="flex-1 min-h-0 overflow-y-auto p-3 sm:p-4 bg-slate-100 flex flex-col items-center justify-start">
          {loading ? (
            <div className="h-64 flex flex-col items-center justify-center text-slate-500 m-auto">
              <Loader2 className="w-8 h-8 animate-spin text-blue-600 mb-2" />
              <span className="text-xs font-semibold">{isMr ? "प्रमाणपत्र लोड होत आहे..." : "Loading certificate..."}</span>
            </div>
          ) : error ? (
            <div className="h-64 flex flex-col items-center justify-center text-center p-6 bg-white rounded-lg border border-slate-200 max-w-md m-auto">
              <ShieldCheck className="w-10 h-10 text-amber-500 mb-2" />
              <h4 className="text-sm font-bold text-slate-800 mb-1">{isMr ? "प्रमाणपत्र उपलब्ध नाही" : "Certificate Not Available"}</h4>
              <p className="text-xs text-slate-500">{error}</p>
            </div>
          ) : isManual && certificate ? (
            <div className="w-full max-w-4xl flex flex-col gap-3">
              {/* Responsive Document Viewer: Image or PDF */}
              {docViewUrl ? (
                <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
                  <div className="p-2 sm:p-3 bg-slate-50 border-b border-slate-200 flex items-center justify-between text-xs">
                    <span className="font-bold text-slate-700 flex items-center gap-1.5">
                      <FileText className="w-4 h-4 text-emerald-600" />
                      {isMr ? "विभागाने जारी केलेले अधिकृत प्रमाणपत्र" : "Official Uploaded Certificate"}
                    </span>
                    <a
                      href={docViewUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-bold text-[#4b70a6] hover:underline flex items-center gap-1"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      {isMr ? "पूर्ण आकारात पहा" : "View Full Size"}
                    </a>
                  </div>

                  <div className="flex items-center justify-center bg-slate-900/5 p-2 sm:p-4 min-h-[380px] max-h-[62vh] overflow-auto">
                    {isImage ? (
                      /* eslint-disable-next-line @next/next/no-img-element */
                      <img
                        src={docViewUrl}
                        alt={certificate.certificateNo || "Certificate"}
                        className="max-h-[58vh] max-w-full w-auto object-contain rounded-lg shadow-md border border-slate-200 bg-white"
                        onError={() => setIsImage(false)}
                      />
                    ) : (
                      <iframe
                        src={docViewUrl}
                        className="w-full h-[58vh] border-none rounded-lg bg-white shadow-sm"
                        title="Manual Certificate Document"
                      />
                    )}
                  </div>
                </div>
              ) : null}

              {/* Compact Verification Metadata Strip */}
              <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-3 grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs">
                <div>
                  <span className="text-[11px] text-slate-500 font-semibold flex items-center gap-1">
                    <Layers className="w-3 h-3 text-indigo-600" /> {isMr ? "सेवा" : "Service"}
                  </span>
                  <p className="font-bold text-slate-800 truncate" title={certificate.serviceName}>
                    {certificate.serviceName || "—"}
                  </p>
                </div>
                <div>
                  <span className="text-[11px] text-slate-500 font-semibold flex items-center gap-1">
                    <User className="w-3 h-3 text-emerald-600" /> {isMr ? "अर्जदार" : "Applicant"}
                  </span>
                  <p className="font-bold text-slate-800 truncate" title={certificate.applicantName}>
                    {certificate.applicantName || "—"}
                  </p>
                </div>
                <div>
                  <span className="text-[11px] text-slate-500 font-semibold flex items-center gap-1">
                    <Calendar className="w-3 h-3 text-purple-600" /> {isMr ? "जारी दिनांक" : "Issued Date"}
                  </span>
                  <p className="font-bold text-slate-800">
                    {certificate.issuedAt ? new Date(certificate.issuedAt).toLocaleDateString(isMr ? "mr-IN" : "en-IN") : "—"}
                  </p>
                </div>
                <div>
                  <span className="text-[11px] text-slate-500 font-semibold flex items-center gap-1">
                    <ShieldCheck className="w-3 h-3 text-amber-600" /> {isMr ? "पडताळणी स्थिती" : "Status"}
                  </span>
                  <span className="inline-flex items-center gap-1 font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 text-[11px]">
                    ✓ {isMr ? "वैध जारी प्रमाणपत्र" : "Officially Issued"}
                  </span>
                </div>
              </div>
            </div>
          ) : certificate?.mergedHtmlContent ? (
            <div className="w-full max-w-4xl">
              <OfficialCertificateSheet htmlContent={certificate.mergedHtmlContent} />
            </div>
          ) : null}
        </div>
      </div>
    </Modal>
  );
}
