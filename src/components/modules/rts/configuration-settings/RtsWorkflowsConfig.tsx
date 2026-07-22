"use client";

import { useState, useTransition } from "react";
import { Plus, Search, GitMerge, Edit2, Trash2, CheckCircle2, XCircle } from "lucide-react";
import { Card, Drawer, MasterTable, useConfirm } from "@/components/common";
import type { Column } from "@/components/common/MasterTable";
import { toast } from "sonner";
import { useTranslations } from "next-intl";
interface WorkflowItem {
  id: number;
  serviceId: number;
  flowName: string;
  isActive: boolean;
  stagesCount?: number;
  [key: string]: unknown;
}

interface RtsWorkflowsConfigProps {
  data: {
    workflows: WorkflowItem[];
    departments: { id: string; name: string }[];
    services: { id: string; name: string; departmentId: string }[];
  };
  locale: string;
}

type WorkflowTableRow = Record<string, unknown> & WorkflowItem;

export default function RtsWorkflowsConfig({ data }: RtsWorkflowsConfigProps) {
  const t = useTranslations("rts");
  const { confirm } = useConfirm();
  const [isPending, startTransition] = useTransition();

  const [workflowsList, setWorkflowsList] = useState<WorkflowItem[]>(data.workflows);
  const [selectedDeptId, setSelectedDeptId] = useState<string>("All");
  const [selectedServiceId, setSelectedServiceId] = useState<string>("All");
  const [searchTerm, setSearchTerm] = useState("");
  const [pageNumber, setPageNumber] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Drawer states
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [editingWorkflow, setEditingWorkflow] = useState<WorkflowItem | null>(null);

  // Form states
  const [formServiceId, setFormServiceId] = useState<string>("");
  const [formFlowName, setFormFlowName] = useState<string>("");
  const [formIsActive, setFormIsActive] = useState<boolean>(true);

  // Stages for the active form
  const [stages, setStages] = useState<Array<{
    stageOrder: number;
    stageName: string;
    employeeTypeId: number;
    slaDays: number;
    canVerifyDocument: boolean;
    canApprove: boolean;
    canReject: boolean;
    canReturn: boolean;
    canPay: boolean;
    isFinalStage: boolean;
  }>>([
    {
      stageOrder: 1,
      stageName: "Document Verification (Clerk)",
      employeeTypeId: 1,
      slaDays: 2,
      canVerifyDocument: true,
      canApprove: false,
      canReject: false,
      canReturn: true,
      canPay: false,
      isFinalStage: false,
    },
    {
      stageOrder: 2,
      stageName: "Final Approval (Senior Officer)",
      employeeTypeId: 3,
      slaDays: 3,
      canVerifyDocument: false,
      canApprove: true,
      canReject: true,
      canReturn: true,
      canPay: false,
      isFinalStage: true,
    }
  ]);

  const filteredServicesForFilter = data.services.filter(
    s => selectedDeptId === "All" || s.departmentId === selectedDeptId
  );

  const filteredWorkflows = workflowsList.filter(w => {
    const serviceObj = data.services.find(s => String(s.id) === String(w.serviceId));
    const deptMatch = selectedDeptId === "All" || (serviceObj && serviceObj.departmentId === selectedDeptId);
    const serviceMatch = selectedServiceId === "All" || String(w.serviceId) === selectedServiceId;
    const searchMatch = !searchTerm || w.flowName.toLowerCase().includes(searchTerm.toLowerCase());
    return deptMatch && serviceMatch && searchMatch;
  });

  const totalPages = Math.ceil(filteredWorkflows.length / pageSize) || 1;
  const paginatedWorkflows = filteredWorkflows.slice((pageNumber - 1) * pageSize, pageNumber * pageSize);

  const handleOpenAddDrawer = () => {
    setEditingWorkflow(null);
    setFormServiceId(data.services[0]?.id || "");
    setFormFlowName("");
    setFormIsActive(true);
    setIsDrawerOpen(true);
  };

  const handleOpenEditDrawer = (item: WorkflowItem) => {
    setEditingWorkflow(item);
    setFormServiceId(String(item.serviceId));
    setFormFlowName(item.flowName);
    setFormIsActive(item.isActive);
    setIsDrawerOpen(true);
  };

  const handleDeleteWorkflow = (id: number) => {
    confirm({
      variant: "delete",
      title: t("workflowMaster.title"),
      description: "Are you sure you want to delete this approval workflow?",
      onConfirm: async () => {
        startTransition(() => {
          setWorkflowsList(prev => prev.filter(w => w.id !== id));
          toast.success("Approval workflow deleted successfully.");
        });
      }
    });
  };

  const handleAddStage = () => {
    setStages(prev => [
      ...prev,
      {
        stageOrder: prev.length + 1,
        stageName: `Stage ${prev.length + 1}`,
        employeeTypeId: 2,
        slaDays: 3,
        canVerifyDocument: false,
        canApprove: false,
        canReject: false,
        canReturn: true,
        canPay: false,
        isFinalStage: false,
      }
    ]);
  };

  const handleRemoveStage = (index: number) => {
    if (stages.length <= 1) {
      toast.error("At least one stage is required.");
      return;
    }
    setStages(prev => prev.filter((_, i) => i !== index).map((s, idx) => ({ ...s, stageOrder: idx + 1 })));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formFlowName.trim()) {
      toast.error("Flow name is required.");
      return;
    }

    startTransition(() => {
      if (editingWorkflow) {
        setWorkflowsList(prev => prev.map(w => w.id === editingWorkflow.id ? {
          ...w,
          serviceId: Number(formServiceId),
          flowName: formFlowName,
          isActive: formIsActive
        } : w));
        toast.success("Workflow updated successfully.");
      } else {
        const newId = Date.now();
        setWorkflowsList(prev => [
          {
            id: newId,
            serviceId: Number(formServiceId),
            flowName: formFlowName,
            isActive: formIsActive,
            stagesCount: stages.length
          },
          ...prev
        ]);
        toast.success("New approval workflow created successfully.");
      }
      setIsDrawerOpen(false);
    });
  };

  const columns: Column<WorkflowTableRow>[] = [
    {
      key: "id",
      label: t("workflowMaster.colSrNo"),
      width: "80px",
      align: "center",
      render: (_, __, index) => (pageNumber - 1) * pageSize + index + 1,
    },
    {
      key: "flowName",
      label: t("workflowMaster.colFlowName"),
      render: (_, row) => (
        <div>
          <div className="font-bold text-slate-800">{row.flowName}</div>
          <div className="text-[11px] text-slate-400 font-medium">Flow ID: #{row.id}</div>
        </div>
      ),
    },
    {
      key: "serviceId",
      label: t("workflowMaster.colService"),
      render: (_, row) => {
        const serviceObj = data.services.find(s => String(s.id) === String(row.serviceId));
        return (
          <span className="font-semibold text-blue-700 bg-blue-50 px-2.5 py-1 rounded-md text-xs">
            {serviceObj ? serviceObj.name : `Service #${row.serviceId}`}
          </span>
        );
      },
    },
    {
      key: "isActive",
      label: t("workflowMaster.colStatus"),
      align: "center",
      render: (_, row) => (
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold ${
          row.isActive ? "bg-emerald-50 text-emerald-700 border border-emerald-200" : "bg-slate-100 text-slate-500"
        }`}>
          {row.isActive ? <CheckCircle2 className="h-3 w-3" /> : <XCircle className="h-3 w-3" />}
          {row.isActive ? t("workflowMaster.active") : t("workflowMaster.inactive")}
        </span>
      ),
    },
  ];

  return (
    <div className="p-6 space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 bg-gradient-to-r from-[#173B73] to-[#4b70a6] p-6 rounded-2xl text-white shadow-lg">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-white/10 rounded-xl backdrop-blur-sm">
            <GitMerge className="h-8 w-8 text-amber-300" />
          </div>
          <div>
            <h1 className="text-xl font-extrabold tracking-tight">{t("workflowMaster.title")}</h1>
            <p className="text-xs text-slate-200 mt-1">{t("workflowMaster.subtitle")}</p>
          </div>
        </div>
        <button
          onClick={handleOpenAddDrawer}
          className="inline-flex items-center gap-2 bg-amber-400 hover:bg-amber-500 text-slate-950 font-bold px-4 py-2.5 rounded-xl shadow-md transition text-xs"
        >
          <Plus className="h-4 w-4" />
          {t("workflowMaster.addBtn")}
        </button>
      </div>

      {/* Filter Bar */}
      <Card className="p-4 bg-white border border-slate-200 rounded-xl shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="text-xs font-bold text-slate-700 mb-1 block">{t("workflowMaster.filterDept")}</label>
            <select
              value={selectedDeptId}
              onChange={(e) => {
                setSelectedDeptId(e.target.value);
                setSelectedServiceId("All");
                setPageNumber(1);
              }}
              className="w-full text-xs font-semibold text-slate-900 bg-white border border-slate-300 rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500 outline-none"
            >
              <option value="All" className="text-slate-900 font-semibold">{t("workflowMaster.allDepts")}</option>
              {data.departments.map(d => (
                <option key={d.id} value={d.id} className="text-slate-900 font-semibold">{d.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700 mb-1 block">{t("workflowMaster.filterService")}</label>
            <select
              value={selectedServiceId}
              onChange={(e) => {
                setSelectedServiceId(e.target.value);
                setPageNumber(1);
              }}
              className="w-full text-xs font-semibold text-slate-900 bg-white border border-slate-300 rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500 outline-none"
            >
              <option value="All" className="text-slate-900 font-semibold">{t("workflowMaster.allServices")}</option>
              {filteredServicesForFilter.map(s => (
                <option key={s.id} value={s.id} className="text-slate-900 font-semibold">{s.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700 mb-1 block">{t("workflowMaster.searchLabel")}</label>
            <div className="relative">
              <input
                type="text"
                placeholder={t("workflowMaster.searchPh")}
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setPageNumber(1);
                }}
                className="w-full text-xs font-semibold text-slate-900 bg-white border border-slate-300 rounded-lg p-2.5 pl-8 focus:ring-2 focus:ring-blue-500 outline-none placeholder:text-slate-400"
              />
              <Search className="h-4 w-4 text-slate-500 absolute left-2.5 top-2.5" />
            </div>
          </div>
        </div>
      </Card>

      {/* Workflows Table */}
      <Card className="overflow-hidden border border-slate-200 rounded-xl shadow-sm">
        <MasterTable<WorkflowTableRow>
          columns={columns}
          data={paginatedWorkflows}
          loading={isPending}
          emptyText={t("workflowMaster.empty")}
          getRowKey={(row) => String(row.id)}
          renderActions={(row) => (
            <div className="flex items-center justify-center gap-2">
              <button
                onClick={() => handleOpenEditDrawer(row)}
                className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                title="Edit Workflow"
              >
                <Edit2 className="h-4 w-4" />
              </button>
              <button
                onClick={() => handleDeleteWorkflow(row.id)}
                className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg transition"
                title="Delete Workflow"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          )}
          actionLabel={t("workflowMaster.colActions")}
          pageNumber={pageNumber}
          pageSize={pageSize}
          totalCount={filteredWorkflows.length}
          totalPages={totalPages}
          onPageChange={setPageNumber}
          onPageSizeChange={setPageSize}
          paginationConfig={{
            enabled: true,
            showPageSizeSelector: true,
          }}
          pageSizeOptions={[5, 10, 20, 50]}
        />
      </Card>

      {/* Add / Edit Drawer */}
      <Drawer
        open={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        title={editingWorkflow ? t("workflowMaster.editTitle") : t("workflowMaster.createTitle")}
        width="md"
      >
        <form onSubmit={handleSubmit} className="space-y-6 p-2">
          <div className="space-y-4">
            <div>
              <label className="text-xs font-bold text-slate-800 mb-1 block">{t("workflowMaster.rtsServiceLabel")}</label>
              <select
                value={formServiceId}
                onChange={(e) => setFormServiceId(e.target.value)}
                className="w-full text-xs font-semibold text-slate-900 bg-white border border-slate-300 rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-blue-500"
                required
              >
                {data.services.map(s => (
                  <option key={s.id} value={s.id} className="text-slate-900 font-semibold">{s.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-800 mb-1 block">{t("workflowMaster.flowNameLabel")}</label>
              <input
                type="text"
                placeholder={t("workflowMaster.flowNamePh")}
                value={formFlowName}
                onChange={(e) => setFormFlowName(e.target.value)}
                className="w-full text-xs font-semibold text-slate-900 bg-white border border-slate-300 rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-blue-500 placeholder:text-slate-400"
                required
              />
            </div>

            <div className="flex items-center gap-2 pt-2">
              <input
                type="checkbox"
                id="formIsActive"
                checked={formIsActive}
                onChange={(e) => setFormIsActive(e.target.checked)}
                className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
              />
              <label htmlFor="formIsActive" className="text-xs font-bold text-slate-800 cursor-pointer">
                {t("workflowMaster.isActiveLabel")}
              </label>
            </div>
          </div>

          {/* Dynamic Stages Section */}
          <div className="border-t border-slate-200 pt-4 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-extrabold uppercase text-slate-800 flex items-center gap-1.5">
                <GitMerge className="h-4 w-4 text-blue-600" />
                {t("workflowMaster.pipelineTitle")} ({stages.length})
              </h3>
              <button
                type="button"
                onClick={handleAddStage}
                className="text-[11px] font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1"
              >
                <Plus className="h-3.5 w-3.5" />
                {t("workflowMaster.addStage")}
              </button>
            </div>

            <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1">
              {stages.map((stage, idx) => (
                <div key={idx} className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
                  <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                    <span className="text-xs font-extrabold text-blue-950">Stage #{stage.stageOrder}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveStage(idx)}
                      className="text-rose-600 hover:text-rose-800 text-xs font-bold"
                    >
                      {t("workflowMaster.removeStage")}
                    </button>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-[10px] font-bold text-slate-700 block">{t("workflowMaster.stageNameLabel")}</label>
                      <input
                        type="text"
                        value={stage.stageName}
                        onChange={(e) => {
                          const val = e.target.value;
                          setStages(prev => prev.map((s, i) => i === idx ? { ...s, stageName: val } : s));
                        }}
                        className="w-full text-xs font-semibold text-slate-900 border border-slate-300 rounded p-1.5 bg-white placeholder:text-slate-400"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-slate-700 block">{t("workflowMaster.slaDaysLabel")}</label>
                      <input
                        type="number"
                        min={1}
                        value={stage.slaDays}
                        onChange={(e) => {
                          const val = Number(e.target.value);
                          setStages(prev => prev.map((s, i) => i === idx ? { ...s, slaDays: val } : s));
                        }}
                        className="w-full text-xs font-semibold text-slate-900 border border-slate-300 rounded p-1.5 bg-white"
                      />
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-3 pt-1 text-[11px] font-bold text-slate-800">
                    <label className="flex items-center gap-1 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={stage.canVerifyDocument}
                        onChange={(e) => {
                          const checked = e.target.checked;
                          setStages(prev => prev.map((s, i) => i === idx ? { ...s, canVerifyDocument: checked } : s));
                        }}
                      />
                      {t("workflowMaster.verifyDocs")}
                    </label>
                    <label className="flex items-center gap-1 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={stage.canApprove}
                        onChange={(e) => {
                          const checked = e.target.checked;
                          setStages(prev => prev.map((s, i) => i === idx ? { ...s, canApprove: checked } : s));
                        }}
                      />
                      {t("workflowMaster.approve")}
                    </label>
                    <label className="flex items-center gap-1 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={stage.canReject}
                        onChange={(e) => {
                          const checked = e.target.checked;
                          setStages(prev => prev.map((s, i) => i === idx ? { ...s, canReject: checked } : s));
                        }}
                      />
                      {t("workflowMaster.reject")}
                    </label>
                    <label className="flex items-center gap-1 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={stage.isFinalStage}
                        onChange={(e) => {
                          const checked = e.target.checked;
                          setStages(prev => prev.map((s, i) => i === idx ? { ...s, isFinalStage: checked } : s));
                        }}
                      />
                      {t("workflowMaster.finalStage")}
                    </label>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t border-slate-200">
            <button
              type="button"
              onClick={() => setIsDrawerOpen(false)}
              className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-lg"
            >
              {t("workflowMaster.cancel")}
            </button>
            <button
              type="submit"
              disabled={isPending}
              className="px-5 py-2 text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white rounded-lg shadow-sm"
            >
              {editingWorkflow ? t("workflowMaster.update") : t("workflowMaster.save")}
            </button>
          </div>
        </form>
      </Drawer>
    </div>
  );
}
