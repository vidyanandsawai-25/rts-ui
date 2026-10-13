'use client';

import { useState } from 'react';
import {
  X,
  Scale,
  FileText,
  Clock,
  User,
  Phone,
  Mail,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  RotateCcw,
  Send,
  Loader2,
  ExternalLink,
  ShieldCheck,
  Layers,
} from 'lucide-react';
import { toast } from 'sonner';
import type {
  RTSAppealProcessDetailsDto,
  ProcessRTSAppealActionDto,
} from '@/types/rts/appeal.types';
import { processAppealOfficerAction } from '@/app/[locale]/rts/appeals/actions';

interface RtsAppealProcessDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  appealDetails: RTSAppealProcessDetailsDto | null;
  isLoading: boolean;
  onActionSuccess: () => void;
  locale: string;
}

type TabKey = 'grounds' | 'application' | 'timeline' | 'action';

export default function RtsAppealProcessDrawer({
  isOpen,
  onClose,
  appealDetails,
  isLoading,
  onActionSuccess,
  locale,
}: RtsAppealProcessDrawerProps) {
  const [activeTab, setActiveTab] = useState<TabKey>('grounds');
  const [selectedAction, setSelectedAction] = useState<'Approve' | 'Reject' | 'Return'>('Approve');
  const [orderRemarks, setOrderRemarks] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const isMr = locale === 'mr';
  const isHi = locale === 'hi';

  const t = {
    title: isMr ? 'अपील खटला तपासणी व न्यायनिर्णय' : isHi ? 'अपील मामला जांच एवं निर्णय' : 'Appeal Review & Adjudication',
    subtitle: isMr ? 'महाराष्ट्र लोकसेवा हक्क अधिनियम २०१५ अंतर्गत सुनावणी' : isHi ? 'महाराष्ट्र लोक सेवा अधिकार अधिनियम २०१५ के अंतर्गत सुनवाई' : 'Hearing under Maharashtra Right to Public Services Act 2015',
    tabGrounds: isMr ? 'तक्रारीची कारणे व अपील' : isHi ? 'अपील के आधार व विवरण' : 'Grievance & Grounds',
    tabApp: isMr ? 'मूळ अर्ज व कागदपत्रे' : isHi ? 'मूल आवेदन व दस्तावेज' : 'Original Dossier',
    tabTimeline: isMr ? 'कार्यवाही टिप्पणी व इतिहास' : isHi ? 'कार्यवाही नोटशीट व इतिहास' : 'Procedural Trail',
    tabAction: isMr ? 'अधिकारी निर्णय व आदेश' : isHi ? 'अधिकारी निर्णय व आदेश' : 'Adjudication Order',
    loading: isMr ? 'माहिती लोड होत आहे...' : isHi ? 'विवरण लोड हो रहा है...' : 'Loading appeal details...',
    noDetails: isMr ? 'अपील तपशील उपलब्ध नाही' : isHi ? 'अपील विवरण उपलब्ध नहीं' : 'No appeal details available',
    actionApprove: isMr ? 'अपील मंजूर करा (आदेश जारी)' : isHi ? 'अपील स्वीकृत करें' : 'Allow Appeal (Grant Relief)',
    actionReject: isMr ? 'अपील नामंजूर करा (खारिज)' : isHi ? 'अपील खारिज करें' : 'Dismiss Appeal (Reject)',
    actionReturn: isMr ? 'पुनर्तपासणीसाठी परत पाठवा' : isHi ? 'पुनः जांच हेतु वापस भेजें' : 'Return for Re-investigation',
    remarksPlaceholder: isMr ? 'अपीलीय प्राधिकरणाचे वैधानिक निष्कर्ष, निर्णय व निर्देश येथे नोंदवा...' : isHi ? 'अपीलीय प्राधिकारी के कानूनी निष्कर्ष व निर्देश यहाँ लिखें...' : 'Enter official statutory findings, reasoning, and directions...',
    submitBtn: isMr ? 'निर्णय आदेश अंतिम करा' : isHi ? 'निर्णय आदेश अंतिम करें' : 'Submit Final Order',
    confirmText: isMr ? 'हा आदेश अंतिम स्वरूपात नोंदवला जाईल व अर्जदारास सूचित केले जाईल.' : isHi ? 'यह निर्णय अंतिम रूप से दर्ज होगा तथा आवेदक को सूचित किया जाएगा.' : 'This order will be officially recorded and communicated to the citizen.',
  };

  const isPending = appealDetails?.appealStatus === 'Pending' || appealDetails?.appealStatus === 'Submitted';

  const handleActionSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!appealDetails) return;
    if (!orderRemarks.trim()) {
      toast.error(isMr ? 'कृपया निर्णय आदेशाचे कारण/शेरा नोंदवा' : 'Please provide remarks / statutory reasons for the decision');
      return;
    }

    setIsSubmitting(true);
    try {
      const payload: ProcessRTSAppealActionDto = {
        appealId: appealDetails.appealId,
        action: selectedAction,
        remark: orderRemarks.trim(),
        remarks: orderRemarks.trim(),
      };

      const result = await processAppealOfficerAction(payload);
      if (result.success) {
        toast.success(
          isMr
            ? `अपील #${appealDetails.appealNo} वरील निर्णय यशस्वीरीत्या नोंदवला गेला!`
            : `Appeal #${appealDetails.appealNo} adjudicated successfully!`
        );
        setOrderRemarks('');
        onActionSuccess();
        onClose();
      } else {
        toast.error(result.error || (isMr ? 'निर्णय नोंदवताना त्रुटी आली' : 'Failed to process appeal action'));
      }
    } catch (err: any) {
      toast.error(err?.message || (isMr ? 'सर्व्हर त्रुटी आली' : 'Server error occurred'));
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'approved':
      case 'allowed':
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-black text-emerald-800">
            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
            {isMr ? 'मंजूर' : isHi ? 'स्वीकृत' : 'Allowed / Relief Granted'}
          </span>
        );
      case 'rejected':
      case 'dismissed':
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full border border-rose-200 bg-rose-50 px-3 py-1 text-xs font-black text-rose-800">
            <XCircle className="h-3.5 w-3.5 text-rose-600" />
            {isMr ? 'नामंजूर' : isHi ? 'खारिज' : 'Dismissed / Rejected'}
          </span>
        );
      case 'returned':
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-xs font-black text-blue-800">
            <RotateCcw className="h-3.5 w-3.5 text-blue-600" />
            {isMr ? 'परत पाठवले' : isHi ? 'वापस भेजा गया' : 'Returned'}
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-xs font-black text-amber-800">
            <Clock className="h-3.5 w-3.5 text-amber-600" />
            {isMr ? 'सुनावणी प्रलंबित' : isHi ? 'सुनवाई लंबित' : 'Pending Adjudication'}
          </span>
        );
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-slate-900/60 backdrop-blur-xs transition-opacity duration-300">
      <div className="fixed inset-y-0 right-0 flex max-w-full pl-10">
        <div className="w-screen max-w-4xl border-l border-slate-200 bg-white shadow-2xl flex flex-col">
          {/* Header */}
          <div className="relative border-b border-slate-200 bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900 px-6 py-5 text-white">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-white/10 ring-1 ring-white/20">
                  <Scale className="h-6 w-6 text-amber-400" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="rounded-md bg-amber-400/20 px-2 py-0.5 text-[10px] font-black uppercase tracking-wider text-amber-300 border border-amber-400/30">
                      {appealDetails?.appealLevelDisplay || (appealDetails?.appealLevel === 2 ? '2nd Appeal' : '1st Appeal')}
                    </span>
                    <h2 className="text-lg font-black tracking-tight">{appealDetails?.appealNo || t.title}</h2>
                  </div>
                  <p className="mt-0.5 text-xs text-slate-300">{t.subtitle}</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {appealDetails && getStatusBadge(appealDetails.appealStatus)}
                <button
                  type="button"
                  onClick={onClose}
                  className="rounded-xl p-2 text-slate-400 hover:bg-white/10 hover:text-white transition"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            {/* Sub-header meta bar */}
            {appealDetails && (
              <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-3 border-t border-white/10 pt-3 text-xs">
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">{isMr ? 'मूळ अर्ज क्रमांक' : 'Original App No'}</span>
                  <span className="font-mono font-bold text-white">{appealDetails.application?.applicationNo || '-'}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">{isMr ? 'सेवा नाव' : 'RTS Service'}</span>
                  <span className="truncate block font-semibold text-white" title={appealDetails.application?.serviceName}>
                    {appealDetails.application?.serviceName || '-'}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">{isMr ? 'दाखल दिनांक' : 'Filing Date'}</span>
                  <span className="font-semibold text-white">
                    {appealDetails.filingDate ? new Date(appealDetails.filingDate).toLocaleDateString() : '-'}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">{isMr ? 'अपील प्रकार' : 'Statutory Ground'}</span>
                  <span className="font-semibold text-amber-300 truncate block">{appealDetails.appealType}</span>
                </div>
              </div>
            )}
          </div>

          {/* Navigation Tabs */}
          <div className="flex border-b border-slate-200 bg-slate-50 px-6 gap-2">
            <button
              type="button"
              onClick={() => setActiveTab('grounds')}
              className={`flex items-center gap-2 py-3 px-3 text-xs font-black border-b-2 transition ${
                activeTab === 'grounds'
                  ? 'border-blue-700 text-blue-900 bg-white'
                  : 'border-transparent text-slate-500 hover:text-slate-900'
              }`}
            >
              <FileText className="h-4 w-4" />
              {t.tabGrounds}
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('application')}
              className={`flex items-center gap-2 py-3 px-3 text-xs font-black border-b-2 transition ${
                activeTab === 'application'
                  ? 'border-blue-700 text-blue-900 bg-white'
                  : 'border-transparent text-slate-500 hover:text-slate-900'
              }`}
            >
              <Layers className="h-4 w-4" />
              {t.tabApp}
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('timeline')}
              className={`flex items-center gap-2 py-3 px-3 text-xs font-black border-b-2 transition ${
                activeTab === 'timeline'
                  ? 'border-blue-700 text-blue-900 bg-white'
                  : 'border-transparent text-slate-500 hover:text-slate-900'
              }`}
            >
              <Clock className="h-4 w-4" />
              {t.tabTimeline}
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('action')}
              className={`flex items-center gap-2 py-3 px-3 text-xs font-black border-b-2 transition ${
                activeTab === 'action'
                  ? 'border-blue-700 text-blue-900 bg-white'
                  : 'border-transparent text-slate-500 hover:text-slate-900'
              }`}
            >
              <Scale className="h-4 w-4" />
              {t.tabAction}
            </button>
          </div>

          {/* Drawer Body */}
          <div className="flex-1 overflow-y-auto p-6 bg-slate-50/50">
            {isLoading ? (
              <div className="flex flex-col items-center justify-center py-20 text-slate-400 gap-3">
                <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
                <p className="text-sm font-semibold">{t.loading}</p>
              </div>
            ) : !appealDetails ? (
              <div className="py-20 text-center text-slate-400 font-semibold">{t.noDetails}</div>
            ) : (
              <div className="space-y-6">
                {/* ── Tab 1: Grounds ────────────────────────────────────────── */}
                {activeTab === 'grounds' && (
                  <div className="space-y-5">
                    {/* Citizen Grievance Card */}
                    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
                      <h3 className="text-xs font-black uppercase tracking-wider text-slate-400 mb-2">
                        {isMr ? 'नागरिकाची तक्रार / अपीलाची कारणे' : 'Citizen Grievance & Appeal Statement'}
                      </h3>
                      <p className="text-sm leading-relaxed font-semibold text-slate-800 whitespace-pre-wrap bg-slate-50 p-4 rounded-xl border border-slate-100">
                        {appealDetails.reasonForComplaint || (isMr ? 'कोणतेही कारण नमूद केलेले नाही' : 'No complaint description provided')}
                      </p>
                    </div>

                    {/* Delay Condonation Alert if provided */}
                    {appealDetails.delayJustification && (
                      <div className="rounded-2xl border border-amber-200 bg-amber-50/80 p-5 shadow-xs">
                        <div className="flex items-center gap-2 mb-2 text-amber-900 font-black text-sm">
                          <AlertTriangle className="h-5 w-5 text-amber-600" />
                          <span>{isMr ? 'कलम १८ अंतर्गत विलंब माफीचे कारण (Delay Condonation)' : 'Application for Condonation of Delay (Section 18)'}</span>
                        </div>
                        <p className="text-xs font-semibold text-amber-950 bg-white/70 p-3 rounded-xl border border-amber-200">
                          {appealDetails.delayJustification}
                        </p>
                      </div>
                    )}

                    {/* Applicant & Contact Info */}
                    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
                      <h3 className="text-xs font-black uppercase tracking-wider text-slate-400 mb-3">
                        {isMr ? 'अर्जदाराची संपर्क माहिती' : 'Applicant Contact Details'}
                      </h3>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs font-semibold">
                        <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl">
                          <User className="h-4 w-4 text-slate-500" />
                          <div>
                            <span className="text-[10px] text-slate-400 block font-bold">{isMr ? 'नाव' : 'Name'}</span>
                            <span className="text-slate-800 font-black">{appealDetails.application?.applicantName || '-'}</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl">
                          <Phone className="h-4 w-4 text-slate-500" />
                          <div>
                            <span className="text-[10px] text-slate-400 block font-bold">{isMr ? 'मोबाईल' : 'Mobile'}</span>
                            <span className="text-slate-800 font-black">{appealDetails.application?.applicantMobile || appealDetails.applicantMobile || '-'}</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl">
                          <Mail className="h-4 w-4 text-slate-500" />
                          <div>
                            <span className="text-[10px] text-slate-400 block font-bold">{isMr ? 'ईमेल' : 'Email'}</span>
                            <span className="text-slate-800 font-black">{appealDetails.application?.applicantEmail || '-'}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* ── Tab 2: Application Dossier ────────────────────────────── */}
                {activeTab === 'application' && (
                  <div className="space-y-5">
                    {/* Rejection / Delay Summary */}
                    {appealDetails.application?.rejectionReason && (
                      <div className="rounded-2xl border border-rose-200 bg-rose-50/80 p-5 shadow-xs">
                        <div className="flex items-center gap-2 text-rose-900 font-black text-sm mb-2">
                          <XCircle className="h-5 w-5 text-rose-600" />
                          <span>{isMr ? 'मूळ अर्ज नामंजुरीचे कारण' : 'Original Rejection Reason'}</span>
                          {appealDetails.application.rejectionDate && (
                            <span className="text-xs text-rose-700 font-normal">
                              ({new Date(appealDetails.application.rejectionDate).toLocaleDateString()})
                            </span>
                          )}
                        </div>
                        <p className="text-xs font-semibold text-rose-950 bg-white/70 p-3 rounded-xl border border-rose-200">
                          {appealDetails.application.rejectionReason}
                        </p>
                      </div>
                    )}

                    {/* Dynamic Fields Grid */}
                    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
                      <h3 className="text-xs font-black uppercase tracking-wider text-slate-400 mb-3">
                        {isMr ? 'अर्जातील तपशील व माहिती' : 'Submitted Form Fields'}
                      </h3>
                      {appealDetails.application?.dynamicFields?.length ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          {appealDetails.application.dynamicFields.map((field) => (
                            <div key={field.fieldId} className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                                {field.fieldLabel}
                              </span>
                              <span className="text-xs font-black text-slate-800 mt-0.5 block">
                                {field.displayValue || field.fieldValue || '-'}
                              </span>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-xs text-slate-400 font-semibold">{isMr ? 'फील्ड्स माहिती उपलब्ध नाही' : 'No dynamic fields found'}</p>
                      )}
                    </div>

                    {/* Attached Documents */}
                    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
                      <h3 className="text-xs font-black uppercase tracking-wider text-slate-400 mb-3">
                        {isMr ? 'जोडलेली कागदपत्रे (दस्तावेज)' : 'Attached Verification Documents'}
                      </h3>
                      {appealDetails.application?.documents?.length ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          {appealDetails.application.documents.map((doc) => (
                            <div
                              key={doc.documentId}
                              className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-200/80"
                            >
                              <div className="flex items-center gap-2.5 min-w-0">
                                <FileText className="h-4 w-4 text-blue-600 shrink-0" />
                                <span className="text-xs font-bold text-slate-800 truncate" title={doc.documentName}>
                                  {doc.documentName}
                                </span>
                              </div>
                              {doc.documentPath && (
                                <a
                                  href={`/api/RTSApplicationDocument/view/${doc.documentPath}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center gap-1 text-[11px] font-black text-blue-700 hover:text-blue-900 bg-blue-50 px-2 py-1 rounded-md"
                                >
                                  <span>{isMr ? 'पहा' : 'View'}</span>
                                  <ExternalLink className="h-3 w-3" />
                                </a>
                              )}
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-xs text-slate-400 font-semibold">{isMr ? 'कागदपत्रे जोडलेली नाहीत' : 'No attached documents'}</p>
                      )}
                    </div>
                  </div>
                )}

                {/* ── Tab 3: Timeline & Note Sheet ──────────────────────────── */}
                {activeTab === 'timeline' && (
                  <div className="space-y-5">
                    {/* Previous Appeals trail if 2nd Appeal */}
                    {appealDetails.previousAppeals?.length ? (
                      <div className="rounded-2xl border border-indigo-200 bg-indigo-50/70 p-5 shadow-xs">
                        <h3 className="text-xs font-black uppercase tracking-wider text-indigo-900 mb-3">
                          {isMr ? 'मागील प्रथम अपील आदेश व निकाल' : 'First Appeal Ruling & Order'}
                        </h3>
                        {appealDetails.previousAppeals.map((prev) => (
                          <div key={prev.appealId} className="bg-white p-4 rounded-xl border border-indigo-200 mb-2">
                            <div className="flex items-center justify-between text-xs font-bold text-indigo-900">
                              <span>{prev.appealNo} ({prev.status})</span>
                              <span>{prev.decisionDate ? new Date(prev.decisionDate).toLocaleDateString() : '-'}</span>
                            </div>
                            {prev.actionRemarks && (
                              <p className="mt-2 text-xs font-semibold text-slate-700 bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                                {prev.actionRemarks}
                              </p>
                            )}
                          </div>
                        ))}
                      </div>
                    ) : null}

                    {/* Procedural History Timeline */}
                    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
                      <h3 className="text-xs font-black uppercase tracking-wider text-slate-400 mb-4">
                        {isMr ? 'अपील खटला नोंदवही व टप्पे' : 'Appeal Procedural Trail & Note Sheet'}
                      </h3>
                      {appealDetails.history?.length ? (
                        <div className="space-y-4 pl-3 border-l-2 border-blue-200 ml-2">
                          {appealDetails.history.map((step) => (
                            <div key={step.id} className="relative pl-5">
                              <span className="absolute -left-[19px] top-1 h-3.5 w-3.5 rounded-full bg-blue-600 border-2 border-white shadow-xs" />
                              <div className="flex items-center justify-between text-xs">
                                <span className="font-black text-slate-900">{step.action || step.status}</span>
                                <span className="text-[10px] text-slate-400 font-bold">
                                  {step.createdDate ? new Date(step.createdDate).toLocaleString() : ''}
                                </span>
                              </div>
                              <p className="mt-1 text-xs text-slate-600 font-semibold bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                                {step.remark || (isMr ? 'नोंद उपलब्ध नाही' : 'No remark recorded')}
                              </p>
                              {step.actionByName && (
                                <span className="mt-1 block text-[10px] text-slate-400 font-bold">
                                  {isMr ? 'अधिकारी:' : 'Officer:'} {step.actionByName}
                                </span>
                              )}
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-xs text-slate-400 font-semibold">{isMr ? 'इतिहास नोंद उपलब्ध नाही' : 'No history events found'}</p>
                      )}
                    </div>
                  </div>
                )}

                {/* ── Tab 4: Adjudication Form ──────────────────────────────── */}
                {activeTab === 'action' && (
                  <div className="space-y-5">
                    {/* If Already Decided */}
                    {!isPending ? (
                      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs text-center space-y-4">
                        <div className="flex justify-center">
                          {getStatusBadge(appealDetails.appealStatus)}
                        </div>
                        <div>
                          <h4 className="text-sm font-black text-slate-900">{isMr ? 'या अपीलावर अंतिम आदेश पारित करण्यात आला आहे' : 'Final Order has already been issued on this appeal'}</h4>
                          <p className="mt-1 text-xs text-slate-500">
                            {appealDetails.actionDate ? `${isMr ? 'दिनांक:' : 'Decided on:'} ${new Date(appealDetails.actionDate).toLocaleString()}` : ''}
                            {appealDetails.actionByName ? ` | ${isMr ? 'अधिकारी:' : 'By:'} ${appealDetails.actionByName}` : ''}
                          </p>
                        </div>
                        {appealDetails.actionRemarks && (
                          <div className="text-left bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs font-semibold text-slate-800">
                            <span className="block text-[10px] uppercase font-bold text-slate-400 mb-1">{isMr ? 'पारित आदेश व कारणे' : 'Official Order Remarks'}</span>
                            {appealDetails.actionRemarks}
                          </div>
                        )}
                      </div>
                    ) : (
                      /* Adjudication Action Form for Pending Appeals */
                      <form onSubmit={handleActionSubmit} className="rounded-2xl border border-blue-200 bg-white p-6 shadow-sm space-y-5">
                        <div className="flex items-center gap-2 text-blue-950 font-black text-sm pb-3 border-b border-slate-100">
                          <ShieldCheck className="h-5 w-5 text-blue-600" />
                          <span>{isMr ? 'अपीलीय प्राधिकरणाचा निर्णय आदेश' : 'Appellate Authority Decision Form'}</span>
                        </div>

                        {/* Decision Radio Grid */}
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                          <button
                            type="button"
                            onClick={() => setSelectedAction('Approve')}
                            className={`p-3.5 rounded-xl border text-left transition flex flex-col justify-between ${
                              selectedAction === 'Approve'
                                ? 'border-emerald-500 bg-emerald-50/80 ring-2 ring-emerald-500/20'
                                : 'border-slate-200 bg-slate-50 hover:bg-slate-100'
                            }`}
                          >
                            <div className="flex items-center justify-between w-full mb-1">
                              <span className="font-black text-xs text-emerald-900">{t.actionApprove}</span>
                              <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                            </div>
                            <span className="text-[10px] text-emerald-700 font-semibold">
                              {isMr ? 'नागरिकास सेवा देण्याचे निर्देश' : 'Direct officer to grant service'}
                            </span>
                          </button>

                          <button
                            type="button"
                            onClick={() => setSelectedAction('Reject')}
                            className={`p-3.5 rounded-xl border text-left transition flex flex-col justify-between ${
                              selectedAction === 'Reject'
                                ? 'border-rose-500 bg-rose-50/80 ring-2 ring-rose-500/20'
                                : 'border-slate-200 bg-slate-50 hover:bg-slate-100'
                            }`}
                          >
                            <div className="flex items-center justify-between w-full mb-1">
                              <span className="font-black text-xs text-rose-900">{t.actionReject}</span>
                              <XCircle className="h-4 w-4 text-rose-600" />
                            </div>
                            <span className="text-[10px] text-rose-700 font-semibold">
                              {isMr ? 'अपील फेटाळा (अर्जात तथ्य नाही)' : 'Dismiss appeal as unsubstantiated'}
                            </span>
                          </button>

                          <button
                            type="button"
                            onClick={() => setSelectedAction('Return')}
                            className={`p-3.5 rounded-xl border text-left transition flex flex-col justify-between ${
                              selectedAction === 'Return'
                                ? 'border-blue-500 bg-blue-50/80 ring-2 ring-blue-500/20'
                                : 'border-slate-200 bg-slate-50 hover:bg-slate-100'
                            }`}
                          >
                            <div className="flex items-center justify-between w-full mb-1">
                              <span className="font-black text-xs text-blue-900">{t.actionReturn}</span>
                              <RotateCcw className="h-4 w-4 text-blue-600" />
                            </div>
                            <span className="text-[10px] text-blue-700 font-semibold">
                              {isMr ? 'पुनर्तपासणी व स्पष्टीकरणासाठी' : 'Direct re-inquiry by officer'}
                            </span>
                          </button>
                        </div>

                        {/* Order Remarks Textarea */}
                        <div className="space-y-1.5">
                          <label className="text-xs font-black text-slate-700 block">
                            {isMr ? 'न्यायनिर्णय आदेश व वैधानिक शेरा *' : 'Statutory Order & Reasoned Findings *'}
                          </label>
                          <textarea
                            required
                            rows={5}
                            value={orderRemarks}
                            onChange={(e) => setOrderRemarks(e.target.value)}
                            placeholder={t.remarksPlaceholder}
                            className="w-full rounded-xl border border-slate-300 p-3.5 text-xs font-semibold text-slate-800 placeholder-slate-400 focus:border-blue-600 focus:outline-hidden focus:ring-2 focus:ring-blue-600/20 transition resize-none"
                          />
                        </div>

                        <div className="flex items-center justify-between pt-2">
                          <p className="text-[10px] text-slate-500 font-semibold max-w-sm">{t.confirmText}</p>
                          <button
                            type="submit"
                            disabled={isSubmitting}
                            className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-700 to-indigo-700 px-6 py-2.5 text-xs font-black text-white shadow-md hover:from-blue-800 hover:to-indigo-800 transition disabled:opacity-50"
                          >
                            {isSubmitting ? (
                              <>
                                <Loader2 className="h-4 w-4 animate-spin" />
                                <span>{isMr ? 'नोंदवत आहे...' : 'Submitting...'}</span>
                              </>
                            ) : (
                              <>
                                <Send className="h-4 w-4" />
                                <span>{t.submitBtn}</span>
                              </>
                            )}
                          </button>
                        </div>
                      </form>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
