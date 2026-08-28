"use client";

import { useEffect, useState } from "react";
import {
  Loader2,
  Printer,
  ShieldCheck,
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

  const lookupKey = applicationNo || (applicationId ? String(applicationId) : "") || certificateNo || "";

  useEffect(() => {
    if (!isOpen || !lookupKey) return;

    const fetchCertificate = async () => {
      setLoading(true);
      setError(null);
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
      title={isMr ? "अधिकृत प्रमाणपत्र" : "Official Issued Certificate"}
      maxWidth="xl"
    >
      <div className="flex flex-col h-[80vh]">
        {/* Actions Bar */}
        <div className="bg-white border-b border-slate-200 px-5 py-3 flex flex-wrap justify-between items-center gap-3 shrink-0">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-50 text-emerald-800 text-xs font-bold rounded-full border border-emerald-300">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              {isMr ? "डिजिटल स्वाक्षरीने प्रमाणित अधिकृत प्रमाणपत्र" : "Digitally Verified Official Certificate"}
            </span>
            {certificate && (
              <span className="text-xs font-mono text-slate-700 font-bold bg-slate-100 px-2.5 py-1 rounded-md border border-slate-200">
                {isMr ? "क्र." : "No."}: {certificate.certificateNo}
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <Button
              onClick={handlePrint}
              disabled={loading || !certificate}
              className="bg-[#4b70a6] hover:bg-[#3d5a8a] text-white text-xs font-bold flex items-center gap-1.5 shadow-sm rounded-xl px-4 py-2"
            >
              <Printer className="w-4 h-4" />
              {isMr ? "प्रिंट / PDF डाऊनलोड करा" : "Print / Download PDF"}
            </Button>
          </div>
        </div>

        {/* Certificate Rendering Container */}
        <div className="flex-1 overflow-y-auto p-4 md:p-6 bg-slate-100 flex justify-center items-start">
          {loading ? (
            <div className="h-64 flex flex-col items-center justify-center text-slate-500">
              <Loader2 className="w-8 h-8 animate-spin text-blue-600 mb-2" />
              <span className="text-xs font-semibold">{isMr ? "प्रमाणपत्र लोड होत आहे..." : "Loading certificate..."}</span>
            </div>
          ) : error ? (
            <div className="h-64 flex flex-col items-center justify-center text-center p-6 bg-white rounded-lg border border-slate-200 max-w-md my-auto">
              <ShieldCheck className="w-10 h-10 text-amber-500 mb-2" />
              <h4 className="text-sm font-bold text-slate-800 mb-1">{isMr ? "प्रमाणपत्र उपलब्ध नाही" : "Certificate Not Available"}</h4>
              <p className="text-xs text-slate-500">{error}</p>
            </div>
          ) : certificate?.mergedHtmlContent ? (
            <OfficialCertificateSheet htmlContent={certificate.mergedHtmlContent} />
          ) : null}
        </div>
      </div>
    </Modal>
  );
}
