"use client";

import { useState, useTransition } from "react";
import {
  Edit2,
  Eye,
  FileCheck2,
  FileCode2,
  Plus,
  Search,
  Sparkles,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";
import {
  Badge,
  Button,
  Card,
  Input,
  Modal,
} from "@/components/common";
import {
  deleteCertificateTemplateAction,
} from "@/app/[locale]/rts/configuration-settings/rts-certificates/actions";
import type { RTSCertificateTemplate } from "@/types/rts/certificate.types";
import RtsCertificateTemplateBuilderModal from "./RtsCertificateTemplateBuilderModal";

interface RtsCertificateTemplateListProps {
  initialTemplates: RTSCertificateTemplate[];
  services: { id: string; name: string; departmentName?: string }[];
  locale?: string;
}

export default function RtsCertificateTemplateList({
  initialTemplates,
  services,
}: RtsCertificateTemplateListProps) {
  const [templates, setTemplates] = useState<RTSCertificateTemplate[]>(initialTemplates);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedServiceId, setSelectedServiceId] = useState<string>("ALL");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<RTSCertificateTemplate | null>(null);

  // Preview Modal
  const [previewHtml, setPreviewHtml] = useState<string | null>(null);
  const [previewTitle, setPreviewTitle] = useState("");

  const [, startTransition] = useTransition();

  const filteredTemplates = templates.filter((t) => {
    const matchesSearch =
      t.templateName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.templateCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (t.serviceName && t.serviceName.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesService =
      selectedServiceId === "ALL" || String(t.serviceId) === selectedServiceId;

    return matchesSearch && matchesService;
  });

  const handleOpenCreate = () => {
    setEditingTemplate(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (t: RTSCertificateTemplate) => {
    setEditingTemplate(t);
    setIsModalOpen(true);
  };

  const handleOpenPreview = (t: RTSCertificateTemplate) => {
    setPreviewTitle(t.templateName);
    let sample = t.bodyContent || "<div class='text-slate-400 p-4 text-center'>कोणताही टेम्पलेट मजकूर उपलब्ध नाही.</div>";
    sample = sample.replace(/{{ApplicantName}}/gi, "<span class='bg-blue-50 text-blue-700 px-1.5 py-0.5 rounded border border-blue-200 font-medium'>{{ApplicantName}}</span>");
    sample = sample.replace(/{{ApplicantMobile}}/gi, "<span class='bg-blue-50 text-blue-700 px-1.5 py-0.5 rounded border border-blue-200 font-medium'>{{ApplicantMobile}}</span>");
    sample = sample.replace(/{{ApplicationNo}}/gi, "<span class='bg-blue-50 text-blue-700 px-1.5 py-0.5 rounded border border-blue-200 font-mono'>{{ApplicationNo}}</span>");
    sample = sample.replace(/{{AppliedDate}}/gi, "<span class='bg-blue-50 text-blue-700 px-1.5 py-0.5 rounded border border-blue-200'>{{AppliedDate}}</span>");
    sample = sample.replace(/{{ServiceNameMarathi}}/gi, t.serviceName ? `<span class='font-bold text-slate-800'>${t.serviceName}</span>` : "<span class='bg-blue-50 text-blue-700 px-1.5 py-0.5 rounded border border-blue-200'>{{ServiceName}}</span>");
    sample = sample.replace(/{{CertificateNo}}/gi, "<span class='bg-emerald-50 text-emerald-800 px-1.5 py-0.5 rounded border border-emerald-200 font-mono'>{{CertificateNo}}</span>");
    sample = sample.replace(/{{ULBNameMarathi}}/gi, "<span class='bg-blue-50 text-blue-700 px-1.5 py-0.5 rounded border border-blue-200 font-bold'>{{ULBName}}</span>");
    sample = sample.replace(/\[\[(\w+)\]\]/gi, "<span class='bg-amber-50 text-amber-800 px-1.5 py-0.5 rounded border border-amber-200 font-medium'>[भरावयाची माहिती: $1]</span>");
    setPreviewHtml(sample);
  };

  const handleDelete = (id: number, name: string) => {
    if (!confirm(`तुम्हाला नक्की '${name}' टेम्पलेट डिलीट करायचे आहे का?`)) return;

    startTransition(async () => {
      const res = await deleteCertificateTemplateAction(id);
      if (res.success) {
        toast.success("टेम्पलेट यशस्वीरीत्या हटवले!");
        setTemplates((prev) => prev.filter((t) => t.id !== id));
      } else {
        toast.error(res.error || "हटवताना त्रुटी आली.");
      }
    });
  };

  const refreshList = () => {
    window.location.reload();
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-blue-700 via-indigo-700 to-slate-800 p-6 rounded-2xl text-white shadow-lg flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-2 text-blue-200 text-xs font-semibold uppercase tracking-wider mb-1">
            <FileCheck2 className="w-4 h-4 text-emerald-400" />
            RTS Master Configuration
          </div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            प्रमाणपत्र टेम्पलेट्स व्यवस्थापन (Certificate Templates)
          </h1>
          <p className="text-sm text-blue-100 mt-1 max-w-2xl">
            विविध सेवांसाठी डायनॅमिक प्रमाणपत्र फॉरमॅट्स, अधिकाऱ्याने भरावयाचे इनपुट पॅरामीटर्स आणि अटी-शर्ती कॉन्फिगर करा.
          </p>
        </div>

        <Button
          onClick={handleOpenCreate}
          className="bg-emerald-500 hover:bg-emerald-600 text-white font-semibold shadow-md shrink-0 flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          नवीन टेम्पलेट तयार करा
        </Button>
      </div>

      {/* Filter & Search Bar */}
      <Card className="p-4 bg-white border border-slate-200 shadow-xs">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <Input
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="टेम्पलेट किंवा सेवेचे नाव शोधा..."
              className="pl-9 text-xs"
            />
          </div>

          <div>
            <select
              value={selectedServiceId}
              onChange={(e) => setSelectedServiceId(e.target.value)}
              className="w-full h-9 px-3 rounded-md border border-slate-300 text-xs bg-white focus:ring-1 focus:ring-blue-500"
            >
              <option value="ALL">-- सर्व सेवा (All Services) --</option>
              {services.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name} {s.departmentName ? `(${s.departmentName})` : ""}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center justify-end text-xs font-semibold text-slate-500">
            एकूण टेम्पलेट्स: <span className="ml-1 text-slate-900 font-bold">{filteredTemplates.length}</span>
          </div>
        </div>
      </Card>

      {/* Templates Grid / Table */}
      {filteredTemplates.length === 0 ? (
        <Card className="p-12 text-center bg-slate-50 border-dashed border-2 border-slate-300">
          <FileCode2 className="w-12 h-12 text-slate-400 mx-auto mb-3" />
          <h3 className="text-base font-semibold text-slate-700">कोणतेही प्रमाणपत्र टेम्पलेट सापडले नाही</h3>
          <p className="text-xs text-slate-500 mt-1">नवीन सेवेसाठी प्रमाणपत्र टेम्पलेट जोडण्यासाठी वरील बटणावर क्लिक करा.</p>
          <Button onClick={handleOpenCreate} className="mt-4 bg-blue-600 hover:bg-blue-700 text-white text-xs">
            <Plus className="w-4 h-4 mr-1" /> पहिले टेम्पलेट तयार करा
          </Button>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredTemplates.map((t) => (
            <Card key={t.id} className="p-5 bg-white border border-slate-200 hover:border-blue-400 transition-all shadow-xs hover:shadow-md flex flex-col justify-between">
              <div>
                <div className="flex justify-between items-start mb-3">
                  <Badge variant={t.isActive ? "success" : "secondary"}>
                    {t.isActive ? "सक्रिय (Active)" : "निष्क्रिय (Inactive)"}
                  </Badge>
                  <span className="text-[11px] font-mono font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                    {t.templateCode}
                  </span>
                </div>

                <h3 className="text-base font-bold text-slate-900 mb-1 line-clamp-1">{t.templateName}</h3>
                <div className="text-xs text-blue-700 font-medium mb-3 flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                  {t.serviceName || `Service #${t.serviceId}`}
                </div>

                <div className="space-y-1.5 text-xs text-slate-600 bg-slate-50 p-2.5 rounded-lg border border-slate-100 mb-4">
                  <div className="flex justify-between">
                    <span>अधिकाऱ्याचे इनपुट्स:</span>
                    <span className="font-bold text-slate-900">{t.officerFields?.length || 0} फील्ड्स</span>
                  </div>
                  <div className="flex justify-between">
                    <span>मानक अटी-शर्ती:</span>
                    <span className="font-bold text-slate-900">{t.defaultConditions?.length || 0} अटी</span>
                  </div>
                  <div className="flex justify-between text-[11px] text-slate-500 pt-1 border-t border-slate-200">
                    <span>तयार केले:</span>
                    <span>{new Date(t.createdDate).toLocaleDateString("en-GB")}</span>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() => handleOpenPreview(t)}
                  className="text-xs text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                >
                  <Eye className="w-3.5 h-3.5 mr-1" /> पूर्वदृश्य (Preview)
                </Button>

                <div className="flex items-center gap-1">
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => handleOpenEdit(t)}
                    className="text-xs hover:bg-slate-100"
                    title="संपादन करा"
                  >
                    <Edit2 className="w-3.5 h-3.5 text-slate-600" />
                  </Button>

                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => handleDelete(t.id, t.templateName)}
                    className="text-xs text-red-600 hover:bg-red-50 hover:text-red-700"
                    title="हटवा"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Template Builder Modal */}
      {isModalOpen && (
        <RtsCertificateTemplateBuilderModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          template={editingTemplate}
          services={services}
          onSaved={refreshList}
        />
      )}

      {/* Live Sample Preview Modal */}
      {previewHtml && (
        <Modal
          open={!!previewHtml}
          onClose={() => setPreviewHtml(null)}
          title={`नमुना प्रमाणपत्र पूर्वदृश्य: ${previewTitle}`}
          maxWidth="xl"
        >
          <div className="p-6 bg-slate-100 max-h-[75vh] overflow-y-auto">
            <div
              className="bg-white p-8 rounded-lg shadow-md border border-slate-300 max-w-2xl mx-auto"
              dangerouslySetInnerHTML={{ __html: previewHtml }}
            />
          </div>
        </Modal>
      )}
    </div>
  );
}
