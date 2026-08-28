"use client";

import { useMemo, useState, useTransition } from "react";
import {
  Award,
  CheckCircle2,
  Eye,
  FileCheck2,
  Layers,
  Palette,
  Plus,
  Search,
  Settings2,
  Shield,
  ShieldCheck,
  Tag,
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
  type CertificateUlbInfo,
} from "@/app/[locale]/rts/configuration-settings/rts-certificates/actions";
import type { RTSCertificateTemplate } from "@/types/rts/certificate.types";
import RtsCertificateTemplateBuilderModal from "./RtsCertificateTemplateBuilderModal";

interface RtsCertificateTemplateListProps {
  initialTemplates: RTSCertificateTemplate[];
  services: { id: string; name: string; departmentName?: string }[];
  ulbInfo?: CertificateUlbInfo;
  locale?: string;
}

export default function RtsCertificateTemplateList({
  initialTemplates,
  services,
  ulbInfo,
}: RtsCertificateTemplateListProps) {
  const [templates, setTemplates] = useState<RTSCertificateTemplate[]>(initialTemplates);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedServiceId, setSelectedServiceId] = useState<string>("ALL");
  const [selectedStatus, setSelectedStatus] = useState<string>("ALL");

  const [isBuilderModalOpen, setIsBuilderModalOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<RTSCertificateTemplate | null>(null);

  // Full A4 Preview Modal State
  const [previewTemplate, setPreviewTemplate] = useState<RTSCertificateTemplate | null>(null);
  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false);

  const [isPending, startTransition] = useTransition();

  // Statistics counters
  const stats = useMemo(() => {
    const total = templates.length;
    const active = templates.filter((t) => t.isActive).length;
    const serviceSet = new Set(templates.map((t) => t.serviceId));
    return {
      total,
      active,
      servicesCount: serviceSet.size,
    };
  }, [templates]);

  const filteredTemplates = useMemo(() => {
    return templates.filter((t) => {
      const matchesSearch =
        t.templateName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.templateCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (t.serviceName && t.serviceName.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (t.departmentName && t.departmentName.toLowerCase().includes(searchTerm.toLowerCase()));

      const matchesService =
        selectedServiceId === "ALL" || String(t.serviceId) === selectedServiceId;

      const matchesStatus =
        selectedStatus === "ALL" ||
        (selectedStatus === "ACTIVE" && t.isActive) ||
        (selectedStatus === "INACTIVE" && !t.isActive);

      return matchesSearch && matchesService && matchesStatus;
    });
  }, [templates, searchTerm, selectedServiceId, selectedStatus]);

  const handleOpenCreate = () => {
    setEditingTemplate(null);
    setIsBuilderModalOpen(true);
  };

  const handleOpenEdit = (t: RTSCertificateTemplate) => {
    setEditingTemplate(t);
    setIsBuilderModalOpen(true);
  };

  const handleOpenPreview = (t: RTSCertificateTemplate) => {
    setPreviewTemplate(t);
    setIsPreviewModalOpen(true);
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

  const handleSaved = () => {
    window.location.reload();
  };

  return (
    <div className="space-y-6">
      {/* Top Header Banner matching RTS Application Details & Dashboard */}
      <div className="bg-[#4b70a6] text-white p-6 rounded-2xl shadow-md border border-[#3d5a8a] relative overflow-hidden">
        <div className="absolute right-0 top-0 w-96 h-full bg-white/5 transform skew-x-12 pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <div className="flex items-center gap-2 text-blue-100 text-xs font-semibold uppercase tracking-wider mb-1">
              <ShieldCheck className="w-4 h-4 text-emerald-300" />
              महाराष्ट्र लोकसेवा हक्क अधिनियम २०१५ (RTS Master System)
            </div>
            <h1 className="text-2xl font-bold text-white flex items-center gap-2.5">
              <Award className="w-7 h-7 text-amber-300" />
              शासकीय प्रमाणपत्र डिझाईन व व्यवस्थापन (Official Certificate Studio)
            </h1>
            <p className="text-xs md:text-sm text-blue-100 mt-1 max-w-2xl leading-relaxed">
              विविध नागरिक सेवांसाठी अधिकृत शासकीय दाखल्यांचे स्वरूप (Templates), डिजिटल स्वाक्षरी, QR कोड, मनपा लोगो आणि अधिकाऱ्याने भरावयाची माहिती विना-कोड (No Code Drag & Drop) डिझाईन करा.
            </p>
          </div>

          <Button
            onClick={handleOpenCreate}
            className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs py-2.5 px-5 rounded-xl shadow-md shrink-0 flex items-center gap-2 transition-all hover:scale-[1.02]"
          >
            <Plus className="w-4 h-4" />
            नवीन प्रमाणपत्र डिझाईन करा (New Certificate Studio)
          </Button>
        </div>

        {/* 3 Metric Cards matching dashboard */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-6 pt-5 border-t border-white/15">
          <div className="bg-white/10 backdrop-blur-xs p-3 rounded-xl border border-white/10 flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-white/20 flex items-center justify-center text-white font-bold">
              <FileCheck2 className="w-5 h-5 text-emerald-300" />
            </div>
            <div>
              <div className="text-[11px] text-blue-100 font-medium">एकूण डिझाईन केलेले टेम्पलेट्स</div>
              <div className="text-xl font-extrabold text-white font-mono">{stats.total}</div>
            </div>
          </div>

          <div className="bg-white/10 backdrop-blur-xs p-3 rounded-xl border border-white/10 flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-white/20 flex items-center justify-center text-white font-bold">
              <CheckCircle2 className="w-5 h-5 text-amber-300" />
            </div>
            <div>
              <div className="text-[11px] text-blue-100 font-medium">सक्रिय प्रमाणपत्रे (Active)</div>
              <div className="text-xl font-extrabold text-white font-mono">{stats.active}</div>
            </div>
          </div>

          <div className="bg-white/10 backdrop-blur-xs p-3 rounded-xl border border-white/10 flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-white/20 flex items-center justify-center text-white font-bold">
              <Layers className="w-5 h-5 text-blue-200" />
            </div>
            <div>
              <div className="text-[11px] text-blue-100 font-medium">संलग्न RTS सेवा</div>
              <div className="text-xl font-extrabold text-white font-mono">{stats.servicesCount} सेवा</div>
            </div>
          </div>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <Card className="p-4 bg-white border border-slate-200 shadow-xs rounded-xl">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          <div className="relative md:col-span-2">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <Input
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="प्रमाणपत्राचे नाव, सेवेचे नाव किंवा टेम्पलेट कोड शोधा..."
              className="pl-9 text-xs rounded-xl"
            />
          </div>

          <div>
            <select
              value={selectedServiceId}
              onChange={(e) => setSelectedServiceId(e.target.value)}
              className="w-full h-10 px-3 rounded-xl border border-slate-300 text-xs bg-white focus:ring-1 focus:ring-[#4b70a6] font-medium text-slate-700"
            >
              <option value="ALL">-- सर्व सेवा (All Services) --</option>
              {services.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name} {s.departmentName ? `(${s.departmentName})` : ""}
                </option>
              ))}
            </select>
          </div>

          <div>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full h-10 px-3 rounded-xl border border-slate-300 text-xs bg-white focus:ring-1 focus:ring-[#4b70a6] font-medium text-slate-700"
            >
              <option value="ALL">-- सर्व स्थिती (All Status) --</option>
              <option value="ACTIVE">फक्त सक्रिय (Active Only)</option>
              <option value="INACTIVE">फक्त निष्क्रिय (Inactive Only)</option>
            </select>
          </div>
        </div>
      </Card>

      {/* Template Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredTemplates.map((item) => (
          <Card
            key={item.id}
            className="bg-white border border-slate-200 rounded-2xl shadow-xs hover:shadow-md transition-all flex flex-col justify-between overflow-hidden border-t-4 border-t-[#4b70a6]"
          >
            <div className="p-5 space-y-3">
              {/* Service & Status Badge */}
              <div className="flex items-start justify-between gap-2">
                <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-bold bg-blue-50 text-[#4b70a6] border border-blue-200">
                  {item.departmentName || "सामान्य प्रशासन"}
                </span>

                <Badge variant={item.isActive ? "success" : "secondary"} size="sm">
                  {item.isActive ? "सक्रिय (Active)" : "निष्क्रिय"}
                </Badge>
              </div>

              {/* Template Name & Code */}
              <div>
                <h3 className="text-base font-bold text-slate-900 line-clamp-1">
                  {item.templateName}
                </h3>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-[11px] font-mono text-slate-500 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                    {item.templateCode}
                  </span>
                  <span className="text-[11px] text-slate-600 font-medium truncate">
                    सेवा: {item.serviceName || "थेट संलग्न"}
                  </span>
                </div>
              </div>

              {/* Badges / Metrics for Features */}
              <div className="flex flex-wrap gap-1.5 pt-2 border-t border-slate-100">
                <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-emerald-50 text-emerald-800 text-[10px] font-semibold rounded border border-emerald-200">
                  <Shield className="w-3 h-3 text-emerald-600" />
                  डिजिटल स्वाक्षरी
                </span>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-indigo-50 text-indigo-800 text-[10px] font-semibold rounded border border-indigo-200">
                  <Settings2 className="w-3 h-3 text-indigo-600" />
                  {item.officerFields?.length || 0} अधिकारी इनपुट्स
                </span>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-amber-50 text-amber-800 text-[10px] font-semibold rounded border border-amber-200">
                  <Tag className="w-3 h-3 text-amber-600" />
                  {item.defaultConditions?.length || 0} मानक अटी
                </span>
              </div>
            </div>

            {/* Action Buttons Footer */}
            <div className="bg-slate-50 px-5 py-3 border-t border-slate-100 flex items-center justify-between gap-2">
              <Button
                onClick={() => handleOpenPreview(item)}
                className="bg-white hover:bg-slate-100 text-slate-700 text-xs border border-slate-300 flex items-center gap-1.5 rounded-xl px-3 py-1.5"
              >
                <Eye className="w-3.5 h-3.5" />
                A4 पूर्वदृश्य
              </Button>

              <div className="flex items-center gap-1.5">
                <Button
                  onClick={() => handleOpenEdit(item)}
                  className="bg-[#4b70a6] hover:bg-[#3d5a8a] text-white text-xs font-bold flex items-center gap-1.5 rounded-xl px-3 py-1.5 shadow-xs"
                >
                  <Palette className="w-3.5 h-3.5" />
                  डिझाईनर उघडा
                </Button>

                <button
                  type="button"
                  onClick={() => handleDelete(item.id, item.templateName)}
                  disabled={isPending}
                  className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors"
                  title="हटवा (Delete)"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {filteredTemplates.length === 0 && (
        <div className="text-center py-16 bg-white rounded-2xl border border-dashed border-slate-300 p-8">
          <div className="w-14 h-14 mx-auto mb-3 rounded-2xl bg-blue-50 flex items-center justify-center text-[#4b70a6]">
            <Award className="w-7 h-7" />
          </div>
          <h3 className="text-base font-bold text-slate-800">कोणतेही प्रमाणपत्र टेम्पलेट आढळले नाही</h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto mt-1 mb-4">
            निवडलेल्या सेवा किंवा फिल्टरसाठी टेम्पलेट उपलब्ध नाही. नवीन टेम्पलेट डिझाईन करण्यासाठी वरील बटणावर क्लिक करा.
          </p>
          <Button
            onClick={handleOpenCreate}
            className="bg-[#4b70a6] hover:bg-[#3d5a8a] text-white text-xs font-bold px-4 py-2 rounded-xl"
          >
            <Plus className="w-4 h-4 mr-1" />
            नवीन टेम्पलेट डिझाईन करा
          </Button>
        </div>
      )}

      {/* Visual Studio Builder Modal */}
      {isBuilderModalOpen && (
        <RtsCertificateTemplateBuilderModal
          isOpen={isBuilderModalOpen}
          onClose={() => setIsBuilderModalOpen(false)}
          template={editingTemplate}
          services={services}
          ulbInfo={ulbInfo}
          onSaved={handleSaved}
        />
      )}

      {/* A4 Preview Modal */}
      {isPreviewModalOpen && previewTemplate && (
        <Modal
          open={isPreviewModalOpen}
          onClose={() => setIsPreviewModalOpen(false)}
          title={`अधिकृत प्रमाणपत्र पूर्वदृश्य: ${previewTemplate.templateName}`}
          maxWidth="lg"
        >
          <div className="flex flex-col h-[78vh]">
            <div className="bg-slate-100 p-4 overflow-y-auto flex-1 flex justify-center items-start">
              <div
                className="bg-white p-6 rounded-lg shadow-md border border-slate-300 w-full max-w-2xl print:p-0 print:border-none"
                dangerouslySetInnerHTML={{ __html: previewTemplate.bodyContent }}
              />
            </div>
            <div className="p-3 bg-white border-t border-slate-200 flex justify-end gap-2 shrink-0">
              <Button
                onClick={() => {
                  setIsPreviewModalOpen(false);
                  handleOpenEdit(previewTemplate);
                }}
                className="bg-[#4b70a6] hover:bg-[#3d5a8a] text-white text-xs font-bold flex items-center gap-1.5 rounded-xl px-4 py-2"
              >
                <Palette className="w-4 h-4" />
                डिझाईनरमध्ये संपादन करा
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
