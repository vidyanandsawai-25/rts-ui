"use client";

import { useEffect, useState } from "react";
import {
  Loader2,
  Printer,
  ShieldCheck,
} from "lucide-react";
import { Button, Modal } from "@/components/common";
import { getIssuedCertificateAction } from "@/app/[locale]/rts/dashboard/rts-applications/actions";
import type { RTSIssuedCertificate } from "@/types/rts/certificate.types";

interface PrintableCertificateModalProps {
  isOpen: boolean;
  onClose: () => void;
  applicationNo: string;
}

export default function PrintableCertificateModal({
  isOpen,
  onClose,
  applicationNo,
}: PrintableCertificateModalProps) {
  const [loading, setLoading] = useState(true);
  const [certificate, setCertificate] = useState<RTSIssuedCertificate | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && applicationNo) {
      loadCertificate();
    }
  }, [isOpen, applicationNo]);

  const loadCertificate = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await getIssuedCertificateAction(applicationNo);
      if (res.success && res.data) {
        setCertificate(res.data);
      } else {
        setError(res.error || "सदर अर्जासाठी अद्याप प्रमाणपत्र जारी करण्यात आलेले नाही.");
      }
    } catch {
      setError("प्रमाणपत्र लोड करताना त्रुटी आली.");
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    if (!certificate?.mergedHtmlContent) return;

    const printWindow = window.open("", "_blank");
    if (!printWindow) return;

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>${certificate.certificateNo} - ${certificate.serviceName}</title>
          <meta charset="utf-8" />
          <script src="https://cdn.tailwindcss.com"></script>
          <style>
            @media print {
              body { margin: 0; padding: 20px; background: #fff !important; }
              @page { size: A4; margin: 15mm; }
              .no-print { display: none !important; }
            }
          </style>
        </head>
        <body class="bg-white text-slate-900 font-sans p-6">
          ${certificate.mergedHtmlContent}
          <script>
            window.onload = () => {
              window.print();
            };
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
      title="अधिकृत प्रमाणपत्र (Official Issued Certificate)"
      maxWidth="xl"
    >
      <div className="flex flex-col h-[80vh]">
        {/* Actions Bar */}
        <div className="bg-slate-50 border-b border-slate-200 px-5 py-2.5 flex justify-between items-center shrink-0">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-emerald-100 text-emerald-800 text-xs font-bold rounded-full border border-emerald-300">
              <ShieldCheck className="w-3.5 h-3.5" />
              Digitally Verified Certificate
            </span>
            {certificate && (
              <span className="text-xs font-mono text-slate-600 font-semibold">
                क्र.: {certificate.certificateNo}
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <Button
              onClick={handlePrint}
              disabled={loading || !certificate}
              className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold flex items-center gap-1.5 shadow-sm"
            >
              <Printer className="w-3.5 h-3.5" />
              प्रिंट / PDF डाऊनलोड करा (Print / Save PDF)
            </Button>
          </div>
        </div>

        {/* Certificate Rendering Container */}
        <div className="flex-1 overflow-y-auto p-6 bg-slate-100 flex justify-center items-start">
          {loading ? (
            <div className="h-64 flex flex-col items-center justify-center text-slate-500">
              <Loader2 className="w-8 h-8 animate-spin text-blue-600 mb-2" />
              <span className="text-xs font-semibold">प्रमाणपत्र लोड होत आहे...</span>
            </div>
          ) : error ? (
            <div className="h-64 flex flex-col items-center justify-center text-center p-6 bg-white rounded-lg border border-slate-200 max-w-md my-auto">
              <ShieldCheck className="w-10 h-10 text-amber-500 mb-2" />
              <h4 className="text-sm font-bold text-slate-800 mb-1">प्रमाणपत्र उपलब्ध नाही</h4>
              <p className="text-xs text-slate-500">{error}</p>
            </div>
          ) : certificate?.mergedHtmlContent ? (
            <div
              className="bg-white p-8 rounded-lg shadow-md border border-slate-300 w-full max-w-3xl print:p-0 print:border-none print:shadow-none"
              dangerouslySetInnerHTML={{ __html: certificate.mergedHtmlContent }}
            />
          ) : null}
        </div>
      </div>
    </Modal>
  );
}
