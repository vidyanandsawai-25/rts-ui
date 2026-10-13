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
  Calendar,
  Gavel,
  IndianRupee,
  BadgeAlert,
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
  const [orderType, setOrderType] = useState<string>('DirectionToDeliverService');
  const [serviceDeliveryDueDays, setServiceDeliveryDueDays] = useState<string>('7');
  const [customDueDate, setCustomDueDate] = useState<string>('');
  const [penaltyAmount, setPenaltyAmount] = useState<number>(0);
  const [penaltyRemarks, setPenaltyRemarks] = useState<string>('');
  const [hearingDate, setHearingDate] = useState<string>('');
  const [hearingNoticeRemarks, setHearingNoticeRemarks] = useState<string>('');
  const [orderRemarks, setOrderRemarks] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const isMr = locale === 'mr';
  const isHi = locale === 'hi';

  const t = {
    title: isMr ? 'अपील खटला तपासणी व न्यायनिर्णय' : isHi ? 'अपील मामला जांच एवं निर्णय' : 'Appeal Review & Adjudication',
    subtitle: isMr ? 'महाराष्ट्र लोकसेवा हक्क अधिनियम २०१५ अंतर्गत वैधानिक सुनावणी' : isHi ? 'महाराष्ट्र लोक सेवा अधिकार अधिनियम २०१५ के अंतर्गत सुनवाई' : 'Statutory Hearing under Maharashtra Right to Public Services Act 2015',
    tabGrounds: isMr ? 'तक्रारीची कारणे व अपील' : isHi ? 'अपील के आधार व विवरण' : 'Grievance & Grounds',
    tabApp: isMr ? 'मूळ अर्ज व कागदपत्रे' : isHi ? 'मूल आवेदन व दस्तावेज' : 'Original Dossier',
    tabTimeline: isMr ? 'कार्यवाही नोंदवही व इतिहास' : isHi ? 'कार्यवाही नोटशीट व इतिहास' : 'Procedural Trail',
    tabAction: isMr ? 'अपीलीय न्यायनिर्णय व आदेश' : isHi ? 'अपीलीय निर्णय एवं आदेश' : 'Adjudication Order',
    loading: isMr ? 'माहिती लोड होत आहे...' : isHi ? 'विवरण लोड हो रहा है...' : 'Loading appeal details...',
    noDetails: isMr ? 'अपील तपशील उपलब्ध नाही' : isHi ? 'अपील विवरण उपलब्ध नहीं' : 'No appeal details available',
    actionApprove: isMr ? 'अपील मंजूर करा (सेवा देण्याचे निर्देश)' : isHi ? 'अपील स्वीकृत करें' : 'Allow Appeal (Grant Relief)',
    actionReject: isMr ? 'अपील नामंजूर करा (खारिज)' : isHi ? 'अपील खारिज करें' : 'Dismiss Appeal (Reject)',
    actionReturn: isMr ? 'पुनर्विचारार्थ परत पाठवा' : isHi ? 'पुनः विचारार्थ वापस भेजें' : 'Return for Re-investigation',
    remarksPlaceholder: isMr ? 'अपीलीय प्राधिकरणाचे वैधानिक निष्कर्ष, निर्णय व निर्देश येथे सविस्तर नोंदवा...' : isHi ? 'अपीलीय प्राधिकारी के कानूनी निष्कर्ष व निर्देश यहाँ लिखें...' : 'Enter official statutory findings, reasoning, and directions...',
    submitBtn: isMr ? 'न्यायनिर्णय आदेश अंतिम करा' : isHi ? 'निर्णय आदेश अंतिम करें' : 'Submit Final Order',
    confirmText: isMr ? 'हा आदेश अंतिम स्वरूपात नोंदवला जाईल व अर्जदार तसेच पदनिर्देशित अधिकाऱ्यास सूचित केले जाईल.' : isHi ? 'यह निर्णय अंतिम रूप से दर्ज होगा तथा संबंधित पक्षों को सूचित किया जाएगा.' : 'This order will be officially recorded and communicated to all parties.',
  };

  const isPending = appealDetails?.appealStatus === 'Pending' || appealDetails?.appealStatus === 'Submitted';

  const handleActionSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!appealDetails) return;
    if (!orderRemarks.trim()) {
      toast.error(isMr ? 'कृपया न्यायनिर्णय आदेशाचे कारण अथवा शेरा नोंदवा' : 'Please provide remarks / statutory reasons for the decision');
      return;
    }

    let calculatedDueDate: string | null = null;
    if (selectedAction === 'Approve' || selectedAction === 'Return') {
      if (customDueDate) {
        calculatedDueDate = customDueDate;
      } else if (serviceDeliveryDueDays) {
        const days = parseInt(serviceDeliveryDueDays, 10);
        if (!isNaN(days) && days > 0) {
          const d = new Date();
          d.setDate(d.getDate() + days);
          calculatedDueDate = d.toISOString().split('T')[0];
        }
      }
    }

    setIsSubmitting(true);
    try {
      const payload: ProcessRTSAppealActionDto = {
        appealId: appealDetails.appealId,
        action: selectedAction,
        remark: orderRemarks.trim(),
        remarks: orderRemarks.trim(),
        orderType: selectedAction === 'Reject' ? 'Dismissed' : (selectedAction === 'Return' ? 'Remanded' : orderType),
        serviceDeliveryDueDate: calculatedDueDate,
        penaltyAmount: penaltyAmount > 0 ? penaltyAmount : 0,
        penaltyRemarks: penaltyRemarks.trim() || undefined,
        hearingDate: hearingDate ? new Date(hearingDate).toISOString() : undefined,
        hearingNoticeRemarks: hearingNoticeRemarks.trim() || undefined,
      };

      const result = await processAppealOfficerAction(payload);
      if (result.success) {
        toast.success(
          isMr
            ? `अपील #${appealDetails.appealNo} वरील न्यायनिर्णय आदेश यशस्वीरीत्या नोंदवला गेला!`
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
            {isMr ? 'नामंजूर / खारिज' : isHi ? 'खारिज' : 'Dismissed / Rejected'}
          </span>
        );
      case 'returned':
      case 'remanded':
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-xs font-black text-blue-800">
            <RotateCcw className="h-3.5 w-3.5 text-blue-600" />
            {isMr ? 'पुनर्विचारार्थ परत' : isHi ? 'वापस भेजा गया' : 'Returned / Remanded'}
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

  const getOrderTypeLabel = (type?: string | null) => {
    switch (type) {
      case 'DirectionToDeliverService':
        return isMr ? 'सेवा देण्याचे निर्देश' : 'Direction to Deliver Service';
      case 'DisposedWithoutPenalty':
        return isMr ? 'बिनदंडात्मक निकाली' : 'Disposed Without Penalty';
      case 'PenaltyImposed':
        return isMr ? 'शास्ती (दंड) आकारणी आदेश' : 'Penalty Imposed Order';
      case 'InquiryRecommended':
        return isMr ? 'विभागीय चौकशीची शिफारस' : 'Departmental Inquiry Recommended';
      case 'Dismissed':
        return isMr ? 'अपील फेटाळले (खारिज)' : 'Appeal Dismissed';
      case 'Remanded':
        return isMr ? 'पुनर्विचारार्थ परत' : 'Remanded with Directions';
      default:
        return type || (isMr ? 'वैधानिक आदेश' : 'Statutory Order');
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-slate-900/60 backdrop-blur-xs transition-opacity duration-300">
      <div className="fixed inset-y-0 right-0 flex max-w-full pl-10">
        <div className="w-screen max-w-4xl border-l border-slate-200 bg-white shadow-2xl flex flex-col">
          {/* Header */}
          <div className="relative border-b border-slate-200 bg-gradient-to-r from-slate-950 via-slate-900 to-blue-950 px-6 py-5 text-white">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-400">
                  <Scale className="h-6 w-6" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="rounded-md bg-amber-400/20 px-2 py-0.5 text-[10px] font-black uppercase tracking-wider text-amber-300 border border-amber-400/30">
                      {appealDetails?.appealLevelDisplay || (appealDetails?.appealLevel === 2 ? (isMr ? 'द्वितीय अपील' : '2nd Appeal') : (isMr ? 'प्रथम अपील' : '1st Appeal'))}
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
                  <span className="font-mono font-bold text-white">{appealDetails.application?.applicationNo || appealDetails.applicationNo || '-'}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">{isMr ? 'सेवा नाव' : 'RTS Service'}</span>
                  <span className="truncate block font-semibold text-white" title={appealDetails.application?.serviceName || appealDetails.serviceName}>
                    {appealDetails.application?.serviceName || appealDetails.serviceName || '-'}
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
                  <span className="font-semibold text-amber-300 truncate block">
                    {appealDetails.appealTypeNameLocal || appealDetails.appealTypeName || appealDetails.appealType || '-'}
                  </span>
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
              <Gavel className="h-4 w-4" />
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
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="text-xs font-black uppercase tracking-wider text-slate-400">
                          {isMr ? 'नागरिकाची तक्रार व अपीलाची वैधानिक कारणे' : 'Citizen Grievance & Appeal Grounds'}
                        </h3>
                        <span className="text-xs font-bold text-amber-800 bg-amber-50 px-2.5 py-0.5 rounded-full border border-amber-200">
                          {appealDetails.appealTypeNameLocal || appealDetails.appealTypeName || appealDetails.appealType || (isMr ? 'वैधानिक अपील' : 'Statutory Appeal')}
                        </span>
                      </div>
                      <p className="text-sm leading-relaxed font-semibold text-slate-800 whitespace-pre-wrap bg-slate-50 p-4 rounded-xl border border-slate-100">
                        {appealDetails.reasonForComplaint || (isMr ? 'कोणतेही कारण नमूद केलेले नाही' : 'No complaint description provided')}
                      </p>
                    </div>

                    {/* Statutory Personal Hearing Card if scheduled */}
                    {(appealDetails.hearingDate || appealDetails.hearingNoticeRemarks) && (
                      <div className="rounded-2xl border border-blue-200 bg-blue-50/70 p-5 shadow-xs">
                        <div className="flex items-center gap-2 mb-3 text-blue-950 font-black text-sm">
                          <Calendar className="h-5 w-5 text-blue-600" />
                          <span>{isMr ? 'नियोजित वैधानिक सुनावणी तपशील (कलम ८(२))' : 'Statutory Hearing Schedule (Section 8(2))'}</span>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs bg-white p-4 rounded-xl border border-blue-100">
                          {appealDetails.hearingDate && (
                            <div>
                              <span className="text-[10px] text-slate-400 block font-bold">{isMr ? 'सुनावणी दिनांक व वेळ' : 'Hearing Date & Time'}</span>
                              <span className="text-blue-950 font-black">{new Date(appealDetails.hearingDate).toLocaleString()}</span>
                            </div>
                          )}
                          {appealDetails.hearingNoticeRemarks && (
                            <div className="sm:col-span-2">
                              <span className="text-[10px] text-slate-400 block font-bold">{isMr ? 'सुनावणी सूचना व निर्देश' : 'Hearing Notice & Directions'}</span>
                              <span className="text-slate-800 font-semibold">{appealDetails.hearingNoticeRemarks}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

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
                            <span className="text-slate-800 font-black">{appealDetails.application?.applicantName || appealDetails.applicantName || '-'}</span>
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
                            <span className="text-slate-800 font-black">{appealDetails.application?.applicantEmail || appealDetails.applicantEmail || '-'}</span>
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
                        {isMr ? 'जोडलेली कागदपत्रे व पुरावे' : 'Attached Verification Documents'}
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
                      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-4">
                        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                          <div className="flex items-center gap-2">
                            <Scale className="h-5 w-5 text-blue-700" />
                            <h4 className="text-sm font-black text-slate-900">
                              {isMr ? 'अपीलीय प्राधिकरणाचा अंतिम न्यायनिर्णय आदेश' : 'Appellate Authority Final Order'}
                            </h4>
                          </div>
                          {getStatusBadge(appealDetails.appealStatus)}
                        </div>

                        {/* Order Attributes Grid */}
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs bg-slate-50 p-4 rounded-xl border border-slate-200">
                          <div>
                            <span className="block text-[10px] uppercase font-bold text-slate-400">
                              {isMr ? 'आदेश प्रकार' : 'Order Category'}
                            </span>
                            <span className="font-black text-slate-800">
                              {getOrderTypeLabel(appealDetails.orderType)}
                            </span>
                          </div>
                          <div>
                            <span className="block text-[10px] uppercase font-bold text-slate-400">
                              {isMr ? 'निर्णय दिनांक व अधिकारी' : 'Decided Date & Officer'}
                            </span>
                            <span className="font-semibold text-slate-800">
                              {appealDetails.actionDate ? new Date(appealDetails.actionDate).toLocaleDateString() : '-'}
                              {appealDetails.actionByName ? ` (${appealDetails.actionByName})` : ''}
                            </span>
                          </div>
                          <div>
                            <span className="block text-[10px] uppercase font-bold text-slate-400">
                              {isMr ? 'सेवा देण्याची मुदत' : 'Service Due Date'}
                            </span>
                            <span className="font-black text-blue-900">
                              {appealDetails.serviceDeliveryDueDate
                                ? new Date(appealDetails.serviceDeliveryDueDate).toLocaleDateString()
                                : (isMr ? 'लागू नाही' : 'Not Applicable')}
                            </span>
                          </div>
                        </div>

                        {/* Penalty Notice if Imposed */}
                        {appealDetails.penaltyAmount !== undefined && appealDetails.penaltyAmount !== null && appealDetails.penaltyAmount > 0 && (
                          <div className="flex items-start gap-3 rounded-xl border border-rose-200 bg-rose-50/90 p-4 text-xs">
                            <BadgeAlert className="h-5 w-5 text-rose-600 shrink-0 mt-0.5" />
                            <div className="space-y-1">
                              <span className="font-black text-rose-950 block">
                                {isMr ? `कलम ९ अंतर्गत शास्ती (दंड): ₹${appealDetails.penaltyAmount}` : `Section 9 Penalty Imposed: ₹${appealDetails.penaltyAmount}`}
                              </span>
                              {appealDetails.penaltyRemarks && (
                                <p className="text-rose-800 font-semibold">{appealDetails.penaltyRemarks}</p>
                              )}
                            </div>
                          </div>
                        )}

                        {/* Full Reasoned Order */}
                        {appealDetails.actionRemarks && (
                          <div className="text-left bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs font-semibold text-slate-800">
                            <span className="block text-[10px] uppercase font-bold text-slate-400 mb-1.5">
                              {isMr ? 'पारित आदेश, वैधानिक निष्कर्ष व निर्देश' : 'Official Order Findings & Directions'}
                            </span>
                            <p className="whitespace-pre-wrap leading-relaxed">{appealDetails.actionRemarks}</p>
                          </div>
                        )}
                      </div>
                    ) : (
                      /* Adjudication Action Form for Pending Appeals */
                      <form onSubmit={handleActionSubmit} className="rounded-2xl border border-blue-200 bg-white p-6 shadow-sm space-y-5">
                        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                          <div className="flex items-center gap-2 text-blue-950 font-black text-sm">
                            <ShieldCheck className="h-5 w-5 text-blue-600" />
                            <span>{isMr ? 'अपीलीय प्राधिकरणाचा न्यायनिर्णय आदेश' : 'Appellate Authority Adjudication Form'}</span>
                          </div>
                          <span className="text-[10px] font-bold text-blue-700 bg-blue-50 px-2.5 py-1 rounded-full border border-blue-200">
                            {isMr ? 'महाराष्ट्र लोकसेवा हक्क अधिनियम २०१५ (कलम ८, ९ व १०)' : 'MRTSA 2015 Statutory Powers'}
                          </span>
                        </div>

                        {/* Decision Radio Grid */}
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedAction('Approve');
                              setOrderType('DirectionToDeliverService');
                            }}
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
                              {isMr ? 'नागरिकास विहित मुदतीत सेवा देण्याचे निर्देश (कलम ८(२))' : 'Direct officer to grant public service'}
                            </span>
                          </button>

                          <button
                            type="button"
                            onClick={() => {
                              setSelectedAction('Reject');
                              setOrderType('Dismissed');
                            }}
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
                              {isMr ? 'अपील फेटाळा (अर्जात वैधानिक तथ्य नाही)' : 'Dismiss appeal as unsubstantiated'}
                            </span>
                          </button>

                          <button
                            type="button"
                            onClick={() => {
                              setSelectedAction('Return');
                              setOrderType('Remanded');
                            }}
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
                              {isMr ? 'त्रुटीपूर्तता व फेरतपासणीसाठी परत पाठवा' : 'Direct re-inquiry by designated officer'}
                            </span>
                          </button>
                        </div>

                        {/* Order Type & Prescribed Timeline (for Approve or Return) */}
                        {selectedAction === 'Approve' && (
                          <div className="rounded-xl border border-slate-200 bg-slate-50/80 p-4 space-y-4">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                              <div>
                                <label className="text-xs font-black text-slate-700 block mb-1.5">
                                  {isMr ? 'वैधानिक आदेश प्रकार *' : 'Statutory Order Type *'}
                                </label>
                                <select
                                  value={orderType}
                                  onChange={(e) => setOrderType(e.target.value)}
                                  className="w-full rounded-xl border border-slate-300 bg-white p-2.5 text-xs font-semibold text-slate-800 focus:border-blue-600 focus:outline-hidden"
                                >
                                  <option value="DirectionToDeliverService">
                                    {isMr ? 'सेवा विहित मुदतीत देण्याचे निर्देश (कलम ८(२))' : 'Direction to Deliver Service (Sec 8(2))'}
                                  </option>
                                  <option value="DisposedWithoutPenalty">
                                    {isMr ? 'विलंब अहेतुक असल्याने बिनदंडात्मक निकाली' : 'Disposed Without Penalty'}
                                  </option>
                                  <option value="PenaltyImposed">
                                    {isMr ? 'कसूरदार अधिकाऱ्यावर शास्ती/दंड आकारणी (कलम ९)' : 'Penalty Imposed (Section 9)'}
                                  </option>
                                  <option value="InquiryRecommended">
                                    {isMr ? 'विभागीय चौकशीची शिफारस (कलम १०)' : 'Departmental Inquiry (Section 10)'}
                                  </option>
                                </select>
                              </div>

                              <div>
                                <label className="text-xs font-black text-slate-700 block mb-1.5">
                                  {isMr ? 'सेवा देण्याची विहित मुदत (दिवस)' : 'Prescribed Delivery Timeline'}
                                </label>
                                <div className="flex gap-2">
                                  {['7', '15', '30'].map((days) => (
                                    <button
                                      key={days}
                                      type="button"
                                      onClick={() => {
                                        setServiceDeliveryDueDays(days);
                                        setCustomDueDate('');
                                      }}
                                      className={`flex-1 py-2 px-2 rounded-xl text-xs font-black border transition ${
                                        serviceDeliveryDueDays === days && !customDueDate
                                          ? 'border-blue-600 bg-blue-600 text-white'
                                          : 'border-slate-300 bg-white text-slate-700 hover:bg-slate-50'
                                      }`}
                                    >
                                      {days} {isMr ? 'दिवस' : 'Days'}
                                    </button>
                                  ))}
                                </div>
                              </div>
                            </div>

                            {/* Section 9 Penalty Imposition Box */}
                            <div className="rounded-xl border border-amber-200 bg-amber-50/60 p-3.5 space-y-3">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2 text-amber-900 font-black text-xs">
                                  <IndianRupee className="h-4 w-4 text-amber-700" />
                                  <span>{isMr ? 'कलम ९ अंतर्गत शास्ती (दंड) आकारणी (पर्यायी)' : 'Section 9 Penalty Imposition (Optional)'}</span>
                                </div>
                                <span className="text-[10px] font-bold text-amber-800">
                                  {isMr ? 'प्रतिदिवस ₹२५० कमाल ₹५,००० पर्यंत' : '₹250/day up to max ₹5,000'}
                                </span>
                              </div>

                              <div className="grid grid-cols-1 sm:grid-cols-4 gap-2">
                                {[0, 1000, 2500, 5000].map((amt) => (
                                  <button
                                    key={amt}
                                    type="button"
                                    onClick={() => setPenaltyAmount(amt)}
                                    className={`py-1.5 px-2 rounded-lg text-xs font-black border transition ${
                                      penaltyAmount === amt
                                        ? 'border-amber-600 bg-amber-600 text-white'
                                        : 'border-amber-200 bg-white text-amber-900 hover:bg-amber-100/50'
                                    }`}
                                  >
                                    {amt === 0 ? (isMr ? '₹० (निरंक)' : '₹0 (None)') : `₹${amt.toLocaleString()}`}
                                  </button>
                                ))}
                              </div>

                              {penaltyAmount > 0 && (
                                <div className="space-y-1">
                                  <label className="text-[11px] font-bold text-amber-950 block">
                                    {isMr ? 'शास्ती/दंडाचे कारण व तपशील *' : 'Reason / Default Grounds for Penalty *'}
                                  </label>
                                  <input
                                    type="text"
                                    value={penaltyRemarks}
                                    onChange={(e) => setPenaltyRemarks(e.target.value)}
                                    placeholder={isMr ? 'पदनिर्देशित अधिकाऱ्याने विनाकारण विलंब केल्याने शास्ती आकारण्यात येत आहे...' : 'Willful default / delay grounds...'}
                                    className="w-full rounded-xl border border-amber-300 bg-white p-2.5 text-xs font-semibold text-slate-800 focus:border-amber-600 focus:outline-hidden"
                                  />
                                </div>
                              )}
                            </div>
                          </div>
                        )}

                        {/* Personal Hearing Record (Section 8(2)) */}
                        <div className="rounded-xl border border-slate-200 bg-slate-50/60 p-3.5 space-y-2.5">
                          <div className="flex items-center gap-2 text-slate-800 font-black text-xs">
                            <Calendar className="h-4 w-4 text-blue-600" />
                            <span>{isMr ? 'वैधानिक सुनावणी तपशील (नोंद/नियोजन)' : 'Statutory Hearing Schedule / Record'}</span>
                          </div>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div>
                              <label className="text-[11px] font-bold text-slate-600 block mb-1">
                                {isMr ? 'सुनावणी दिनांक व वेळ (लागू असल्यास)' : 'Hearing Date & Time (If Applicable)'}
                              </label>
                              <input
                                type="datetime-local"
                                value={hearingDate}
                                onChange={(e) => setHearingDate(e.target.value)}
                                className="w-full rounded-xl border border-slate-300 bg-white p-2 text-xs font-semibold text-slate-800 focus:border-blue-600 focus:outline-hidden"
                              />
                            </div>
                            <div>
                              <label className="text-[11px] font-bold text-slate-600 block mb-1">
                                {isMr ? 'सुनावणी उपस्थिती सूचना / शेरा' : 'Hearing Notice / Summons Remark'}
                              </label>
                              <input
                                type="text"
                                value={hearingNoticeRemarks}
                                onChange={(e) => setHearingNoticeRemarks(e.target.value)}
                                placeholder={isMr ? 'दोन्ही पक्षांना प्रत्यक्ष हजर राहण्याची नोटीस बजावण्यात आली...' : 'Summons notice to both parties...'}
                                className="w-full rounded-xl border border-slate-300 bg-white p-2 text-xs font-semibold text-slate-800 focus:border-blue-600 focus:outline-hidden"
                              />
                            </div>
                          </div>
                        </div>

                        {/* Order Remarks Textarea */}
                        <div className="space-y-1.5">
                          <label className="text-xs font-black text-slate-800 block">
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
                            className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-700 via-indigo-700 to-blue-800 px-6 py-2.5 text-xs font-black text-white shadow-md hover:from-blue-800 hover:to-indigo-800 transition disabled:opacity-50 cursor-pointer"
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
