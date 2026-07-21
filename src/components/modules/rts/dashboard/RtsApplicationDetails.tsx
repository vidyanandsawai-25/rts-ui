"use client";

import React, { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  CheckCircle,
  FileCheck,
  FileText,
  Clock,
  History,
  Lock,
  MapPin,
  Shield,
  User,
  AlertCircle
} from "lucide-react";
import { Card, Badge } from "@/components/common";
import { toast } from "sonner";
import { pickLangText } from "@/lib/utils/rts/lang";
import { submitCmsAction } from "@/app/[locale]/rts/actions";
import type { CmsApplication, CmsOfficer } from "@/lib/mock/rts/cms";
import type { GeneratedDynamicFormSchema } from "@/components/modules/rts/admin/service-builder/types";
import type { WorkflowDetails, WorkflowStage } from "@/lib/api/rts/rts-workflow.service";

interface CmsApplicationDetailsProps {
  application: CmsApplication;
  formSchema: GeneratedDynamicFormSchema | null;
  officers: CmsOfficer[];
  locale: string;
  workflowDetails?: WorkflowDetails | null;
}

type TabId = "profile" | "form" | "documents" | "timeline";

export default function CmsApplicationDetails({
  application,
  formSchema,
  officers,
  locale,
  workflowDetails
}: CmsApplicationDetailsProps) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<TabId>("profile");
  const [isPending, startTransition] = useTransition();

  const [documentStates, setDocumentStates] = useState(application.documents);

  // Dynamic workflow stage calculation
  const completedStepsCount = application.timeline.filter(t => t.status === "completed").length;
  const currentStageIndex = workflowDetails && workflowDetails.stages.length > 0
    ? Math.min(completedStepsCount, workflowDetails.stages.length - 1)
    : -1;
  const currentStage: WorkflowStage | undefined = workflowDetails && currentStageIndex !== -1
    ? workflowDetails.stages[currentStageIndex]
    : undefined;

  // Set default action type depending on stage permissions
  const defaultAction = currentStage
    ? currentStage.canApprove ? "Approve"
      : currentStage.canVerifyDocument ? "RequestDocuments"
      : currentStage.canReturn ? "Return"
      : !currentStage.isFinalStage ? "Forward"
      : currentStage.canReject ? "Reject"
      : "Hold"
    : "Approve";

  const [actionType, setActionType] = useState<"Approve" | "Reject" | "Forward" | "Return" | "Hold" | "RequestDocuments">(defaultAction);
  const [remarks, setRemarks] = useState("");
  const [forwardOfficerId, setForwardOfficerId] = useState("");

  const toggleDocumentVerify = (docId: string) => {
    setDocumentStates(prev =>
      prev.map(doc => (doc.id === docId ? { ...doc, verified: !doc.verified } : doc))
    );
    toast.success("Document verification state toggled locally.");
  };

  const handleActionSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!remarks.trim()) {
      toast.error("Please enter mandatory remarks before submitting official decisions.");
      return;
    }

    if (actionType === "Forward" && !forwardOfficerId) {
      toast.error("Please select a target officer to forward this application to.");
      return;
    }

    startTransition(async () => {
      try {
        const res = await submitCmsAction(application.id, actionType, remarks, forwardOfficerId);
        if (res.success) {
          toast.success(`Application decision [${actionType}] recorded successfully!`);
          router.push(`/${locale}/rts-cms/inbox`);
        }
      } catch (err) {
        toast.error("An error occurred while recording the action. Please try again.");
      }
    });
  };

  const maskAadhaar = (val: string) => {
    const clean = val.replace(/\D/g, "");
    if (clean.length !== 12) return val;
    return `XXXX-XXXX-${clean.slice(-4)}`;
  };

  return (
    <div className="space-y-6">
      {/* Back Button & Details Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-slate-200 pb-5">
        <div className="flex items-center gap-3">
          <Link
            href={`/${locale}/rts-cms/inbox`}
            className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 transition"
          >
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-slate-800">{application.applicationNo}</h1>
              <span className="rounded-md bg-amber-50 px-2 py-0.5 text-[10px] font-bold text-amber-700 border border-amber-200">
                {application.status}
              </span>
            </div>
            <p className="text-xs text-slate-500">
              {application.serviceName} • Submitted on {application.submissionDate}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
          <Clock className="h-4 w-4 text-slate-400" />
          SLA Remaining:{" "}
          <span className={`font-bold ${application.remainingDays <= 2 ? "text-red-600" : "text-green-600"}`}>
            {application.remainingDays} of {application.slaDays} days
          </span>
        </div>
      </div>

      {/* Tabs list navigation */}
      <div className="flex border-b border-slate-200 gap-1 overflow-x-auto pb-px">
        {[
          { id: "profile", label: "Citizen Profile", icon: User },
          { id: "form", label: "Submitted Application", icon: FileText },
          { id: "documents", label: "Attachments & Documents", icon: FileCheck },
          { id: "timeline", label: "Movement Timeline", icon: History }
        ].map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as TabId)}
              className={`flex items-center gap-2 px-4 py-3 text-xs font-bold border-b-2 transition whitespace-nowrap -mb-px ${
                isActive
                  ? "border-b-2 border-[#4b70a6] text-[#4b70a6]"
                  : "border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300"
              }`}
            >
              <Icon className="h-4 w-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Core Workspace & Side Decision Panel Grid */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Left Side: Active Workspace content */}
        <div className="col-span-1 lg:col-span-2">
          {/* TAB 1: Citizen Profile */}
          {activeTab === "profile" && (
            <Card className="p-6 space-y-6">
              <div>
                <h3 className="text-sm font-bold text-slate-800 border-b border-slate-100 pb-2 mb-4">Citizen Information</h3>
                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 text-xs">
                  <div>
                    <p className="text-slate-400 font-semibold uppercase">Full Name</p>
                    <p className="font-bold text-slate-800 mt-1">{application.citizenName}</p>
                  </div>
                  <div>
                    <p className="text-slate-400 font-semibold uppercase">Mobile Number</p>
                    <p className="font-bold text-slate-800 mt-1">{application.mobile}</p>
                  </div>
                  <div>
                    <p className="text-slate-400 font-semibold uppercase">Email Address</p>
                    <p className="font-bold text-slate-800 mt-1">{application.email}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <div>
                      <p className="text-slate-400 font-semibold uppercase flex items-center gap-1">
                        Aadhaar ID
                        <Lock className="h-3 w-3 text-slate-400" />
                      </p>
                      <p className="font-bold text-slate-700 mt-1">{maskAadhaar(application.aadhaar)}</p>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-sm font-bold text-slate-800 border-b border-slate-100 pb-2 mb-4">Residential Address</h3>
                <div className="flex items-start gap-2 text-xs">
                  <MapPin className="h-4 w-4 text-slate-400 mt-0.5 shrink-0" />
                  <div>
                    <p className="font-bold text-slate-700">Primary Residence</p>
                    <p className="text-slate-500 mt-1">Plot 24, Cyber City, Phase 2, Pune, Maharashtra - 411028</p>
                  </div>
                </div>
              </div>
            </Card>
          )}

          {/* TAB 2: Dynamic Form Reconstruction */}
          {activeTab === "form" && (
            <Card className="p-6">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-6">
                <div>
                  <h3 className="text-sm font-bold text-slate-800">Dynamic EAV Form Reconstruction</h3>
                  <p className="text-[11px] text-slate-400 mt-0.5">Rendered dynamically from schema definitions.</p>
                </div>
                <Badge variant="secondary" className="bg-[#4b70a6]/10 text-[#4b70a6]">
                  Service ID: {application.serviceId}
                </Badge>
              </div>

              {!formSchema ? (
                <div className="flex flex-col items-center justify-center py-12 text-center text-slate-400 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                  <AlertCircle className="h-8 w-8 text-slate-300 mb-2" />
                  <p className="text-xs font-semibold">EAV Form layout metadata not configured in systems.</p>
                  <p className="text-[10px] mt-1">No generated steps were found inside the services registry.</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {formSchema.steps.map((section, idx) => (
                    <div key={section.id} className="rounded-xl border border-slate-100 bg-slate-50/50 p-4">
                      <h4 className="text-xs font-bold text-[#4b70a6] uppercase tracking-wider mb-3 pb-1 border-b border-slate-100">
                        {idx + 1}. {pickLangText(section.title, "en") || "Section Details"}
                      </h4>
                      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                        {section.fields.map(field => {
                          const val = application.fieldValues[field.id] || "—";
                          const label = pickLangText(field.label, "en") || "Field";

                          return (
                            <div key={field.id} className="text-xs">
                              <p className="text-slate-400 font-semibold">{label}</p>
                              <p className="font-bold text-slate-800 mt-0.5 whitespace-pre-wrap truncate">
                                {field.type === "select"
                                  ? field.options?.find(o => o.value === val)?.label?.en || val
                                  : val}
                              </p>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          )}

          {/* TAB 3: Attachments & Documents */}
          {activeTab === "documents" && (
            <Card className="p-6">
              <h3 className="text-sm font-bold text-slate-800 border-b border-slate-100 pb-2 mb-4">Verification Checklists</h3>
              <div className="space-y-4">
                {documentStates.map(doc => (
                  <div
                    key={doc.id}
                    className="flex flex-col justify-between gap-4 rounded-xl border border-slate-100 p-4 sm:flex-row sm:items-center hover:bg-slate-50/50 transition"
                  >
                    <div className="flex items-center gap-3">
                      <div className="rounded-lg bg-teal-50 p-2 text-teal-600">
                        <FileText className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-slate-700">{doc.label}</p>
                        <p className="text-[10px] text-slate-400 mt-0.5">{doc.fileName}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        onClick={() => window.alert(`Previewing file: ${doc.fileName}`)}
                        className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-[11px] font-semibold text-slate-600 hover:bg-slate-50 transition"
                      >
                        Preview File
                      </button>
                      <button
                        onClick={() => toggleDocumentVerify(doc.id)}
                        className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-[11px] font-bold transition border ${
                          doc.verified
                            ? "bg-green-50 border-green-200 text-green-700"
                            : "bg-slate-50 border-slate-200 text-slate-500"
                        }`}
                      >
                        <CheckCircle className="h-3.5 w-3.5" />
                        {doc.verified ? "Verified" : "Mark Verified"}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {/* TAB 4: Timeline */}
          {activeTab === "timeline" && (
            <div className="space-y-6">
              {/* Dynamic Workflow Stages Pipeline */}
              {workflowDetails && workflowDetails.stages.length > 0 && (
                <Card className="p-6">
                  <h3 className="text-sm font-bold text-[#4b70a6] border-b border-slate-100 pb-2 mb-6 flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    Approval Workflow Pipeline ({workflowDetails.flowName})
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {workflowDetails.stages.map((stage, idx) => {
                      const isCompleted = idx < currentStageIndex;
                      const isActive = idx === currentStageIndex;
                      const isPending = idx > currentStageIndex;

                      return (
                        <div
                          key={stage.id}
                          className={`p-4 rounded-xl border-2 transition ${
                            isActive
                              ? "bg-blue-50/50 border-blue-500 shadow-sm"
                              : isCompleted
                                ? "bg-green-50/30 border-green-200"
                                : "bg-white border-slate-200/60"
                          }`}
                        >
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-[10px] uppercase font-bold text-slate-400">Stage {stage.stageOrder}</span>
                            <Badge
                              variant={isActive ? "primary" : isCompleted ? "success" : "secondary"}
                              className="text-[9px] font-bold py-0.5 px-1.5"
                            >
                              {isActive ? "Active" : isCompleted ? "Completed" : "Pending"}
                            </Badge>
                          </div>
                          <h4 className="text-xs font-extrabold text-slate-800">{stage.stageName}</h4>
                          <div className="mt-2 space-y-1 text-[10px] text-slate-500 font-semibold">
                            <p>SLA Limit: {stage.slaDays} Days</p>
                            <div className="flex flex-wrap gap-1 mt-1">
                              {stage.canVerifyDocument && <span className="bg-slate-100 text-slate-600 px-1 rounded">Verify</span>}
                              {stage.canApprove && <span className="bg-emerald-100 text-emerald-700 px-1 rounded">Approve</span>}
                              {stage.canReject && <span className="bg-rose-100 text-rose-700 px-1 rounded">Reject</span>}
                              {stage.canReturn && <span className="bg-amber-100 text-amber-700 px-1 rounded">Return</span>}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </Card>
              )}

              {/* Movement History */}
              <Card className="p-6">
                <h3 className="text-sm font-bold text-slate-800 border-b border-slate-100 pb-2 mb-6">Movement History</h3>
                <div className="relative border-l border-slate-200 ml-4 space-y-6">
                  {application.timeline.map((step, idx) => (
                    <div key={idx} className="relative pl-6">
                      <span
                        className={`absolute left-0 top-1.5 h-3.5 w-3.5 -translate-x-1/2 rounded-full border-2 bg-white ${
                          step.status === "completed"
                            ? "border-green-500 bg-green-500"
                            : step.status === "current"
                              ? "border-amber-500"
                              : "border-slate-200"
                        }`}
                      />
                      <div>
                        <div className="flex items-center gap-2 text-xs font-bold text-slate-700">
                          <h4>{step.title}</h4>
                          {step.timestamp && (
                            <span className="text-[10px] text-slate-400 font-semibold">{step.timestamp}</span>
                          )}
                        </div>
                        <p className="text-[10px] text-slate-500 mt-0.5">
                          By {step.officerName} ({step.role})
                        </p>
                        {step.remarks && (
                          <div className="mt-1.5 rounded-lg bg-slate-50 p-2 text-xs text-slate-600 border border-slate-100 italic">
                            "{step.remarks}"
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            </div>
          )}
        </div>

        {/* Right Side: Decision Actions Panel */}
        <div className="col-span-1">
          <Card className="p-5 border border-[#4b70a6]/20 bg-slate-50/50 shadow-md sticky top-24">
            <div className="flex items-center gap-2 border-b border-slate-200 pb-3 mb-4 text-[#4b70a6]">
              <Shield className="h-5 w-5" />
              <h3 className="text-sm font-bold uppercase tracking-wider">Decision Control</h3>
            </div>

            {/* Display active workflow stage details */}
            {currentStage && (
              <div className="mb-4 rounded-xl bg-blue-50/60 border border-blue-100 p-3 text-[11px] text-slate-700 space-y-1">
                <p className="font-extrabold text-[#4b70a6] uppercase tracking-wider text-[9px]">Active Workflow Stage</p>
                <p className="font-bold text-slate-800">{currentStage.stageName}</p>
                <p className="text-slate-500">Authorized Role ID: {currentStage.employeeTypeId}</p>
                <p className="text-slate-500">Stage SLA Limit: {currentStage.slaDays} Days</p>
              </div>
            )}

            {["Approved", "Rejected"].includes(application.status) ? (
              <div className="text-center py-6 text-slate-400 bg-slate-100/50 rounded-xl">
                <CheckCircle className="h-8 w-8 text-green-500 mx-auto mb-2" />
                <p className="text-xs font-bold text-slate-600">Application Closed</p>
                <p className="text-[10px] mt-1 px-4">No additional actions are allowed. Stored files are archived.</p>
              </div>
            ) : (
              <form onSubmit={handleActionSubmit} className="space-y-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-500">Official Decision</label>
                  <select
                    value={actionType}
                    onChange={e => setActionType(e.target.value as any)}
                    className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-700 focus:border-teal-500 focus:outline-none"
                  >
                    {!currentStage || currentStage.canApprove ? <option value="Approve">Approve & Issue Certificate</option> : null}
                    {!currentStage || !currentStage.isFinalStage ? <option value="Forward">Forward to Next Official</option> : null}
                    {!currentStage || currentStage.canReturn ? <option value="Return">Return to Citizen for Corrections</option> : null}
                    <option value="Hold">Put Application on Hold</option>
                    {!currentStage || currentStage.canVerifyDocument ? <option value="RequestDocuments">Request Additional Documents</option> : null}
                    {!currentStage || currentStage.canReject ? <option value="Reject">Reject Request</option> : null}
                  </select>
                </div>

                {actionType === "Forward" && (
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-500">Forward to Officer</label>
                    <select
                      value={forwardOfficerId}
                      onChange={e => setForwardOfficerId(e.target.value)}
                      className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-700 focus:border-teal-500 focus:outline-none"
                    >
                      <option value="">Select Officer...</option>
                      {officers
                        .filter(o => o.departmentId === application.departmentId)
                        .map(officer => (
                          <option key={officer.id} value={officer.id}>
                            {officer.name} ({officer.designation})
                          </option>
                        ))}
                    </select>
                  </div>
                )}

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-500 flex justify-between">
                    Remarks
                    <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    rows={4}
                    placeholder="Enter official remarks, reason, or verification details..."
                    value={remarks}
                    onChange={e => setRemarks(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-white p-3 text-xs text-slate-700 placeholder-slate-400 focus:border-[#4b70a6] focus:outline-none"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isPending}
                  className="w-full rounded-xl bg-gradient-to-r from-[#4b70a6] to-[#3d5a8a] py-2.5 text-xs font-bold text-white shadow-md hover:shadow-lg transition disabled:opacity-50 flex items-center justify-center gap-1.5"
                >
                  {isPending ? "Recording Action..." : "Confirm & Submit Decision"}
                </button>
              </form>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}
