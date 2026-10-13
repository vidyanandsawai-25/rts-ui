'use client';

import { useState, useEffect } from 'react';
import {
  X,
  Scale,
  Search,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Send,
  Loader2,
  AlertCircle,
  Copy,
  Check,
} from 'lucide-react';
import { toast } from 'sonner';
import type {
  RTSAppealTypeDto,
  RTSAppealLevelCheckResultDto,
  RTSAppealApplicationSummaryDto,
  CreateRTSAppealApplicationDto,
  RTSAppealApplicationResultDto,
} from '@/types/rts/appeal.types';
import {
  checkCitizenAppealEligibilityAction,
  getCitizenAppealApplicationSummaryAction,
  getAppealTypesAction,
  submitCitizenAppealAction,
} from '@/app/[locale]/rts/appeals/actions';

interface CitizenAppealModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialApplicationNo?: string;
  locale: string;
}

export default function CitizenAppealModal({
  isOpen,
  onClose,
  initialApplicationNo = '',
  locale,
}: CitizenAppealModalProps) {
  const isMr = locale === 'mr';
  const isHi = locale === 'hi';

  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [appNo, setAppNo] = useState(initialApplicationNo);
  const [isChecking, setIsChecking] = useState(false);
  const [checkResult, setCheckResult] = useState<RTSAppealLevelCheckResultDto | null>(null);
  const [appSummary, setAppSummary] = useState<RTSAppealApplicationSummaryDto | null>(null);
  const [appealTypes, setAppealTypes] = useState<RTSAppealTypeDto[]>([]);

  // Form Fields
  const [selectedTypeId, setSelectedTypeId] = useState<number>(1);
  const [reasonForAppeal, setReasonForAppeal] = useState('');
  const [delayJustification, setDelayJustification] = useState('');
  const [mobileNo, setMobileNo] = useState('');
  const [email, setEmail] = useState('');
  const [agreedDeclaration, setAgreedDeclaration] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Result
  const [submissionResult, setSubmissionResult] = useState<RTSAppealApplicationResultDto | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (initialApplicationNo) {
      setAppNo(initialApplicationNo);
    }
  }, [initialApplicationNo]);

  useEffect(() => {
    if (isOpen) {
      // Load appeal types
      getAppealTypesAction().then((types) => {
        setAppealTypes(types);
        if (types.length > 0) setSelectedTypeId(types[0].id);
      });
    } else {
      // Reset on close
      setStep(1);
      setCheckResult(null);
      setAppSummary(null);
      setReasonForAppeal('');
      setDelayJustification('');
      setSubmissionResult(null);
      setAgreedDeclaration(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const t = {
    title: isMr ? 'महाराष्ट्र लोकसेवा हक्क अपील नोंदणी' : isHi ? 'महाराष्ट्र लोक सेवा अधिकार अपील पंजीकरण' : 'RTS Statutory Appeal Filing',
    subtitle: isMr
      ? 'महाराष्ट्र लोकसेवा हक्क अधिनियम २०१५ अंतर्गत प्रथम / द्वितीय अपील दाखल करा'
      : isHi
      ? 'महाराष्ट्र लोक सेवा अधिकार अधिनियम २०१५ के अंतर्गत प्रथम / द्वितीय अपील दर्ज करें'
      : 'File First / Second Statutory Appeal under MRTSA 2015',
    step1Title: isMr ? '१. अर्जाची वैधता व पात्रता तपासा' : isHi ? '१. आवेदन पात्रता जांच' : '1. Check Eligibility',
    step2Title: isMr ? '२. अपीलाची कारणे व तपशील' : isHi ? '२. अपील कारण व विवरण' : '2. Grounds of Appeal',
    step3Title: isMr ? '३. अपील पोचपावती' : isHi ? '३. अपील पावती' : '3. Acknowledgment',
    inputAppNoLabel: isMr ? 'आपला आरटीएस अर्ज क्रमांक प्रविष्ट करा *' : isHi ? 'अपना आरटीएस आवेदन क्रमांक दर्ज करें *' : 'Enter RTS Application Number *',
    checkBtn: isMr ? 'पात्रता तपासा' : isHi ? 'पात्रता जांचें' : 'Verify Application',
    reasonLabel: isMr ? 'अपील दाखल करण्याचे सविस्तर कारण *' : isHi ? 'अपील दर्ज करने का विस्तृत कारण *' : 'Grievance / Grounds of Appeal *',
    reasonPlaceholder: isMr
      ? 'आपल्या अर्जावर निर्णय न होण्याचे किंवा अवाजवी नामंजूर होण्याबाबतचे वैधानिक मुद्दे नोंदवा...'
      : isHi
      ? 'आवेदन पर निर्णय न होने अथवा अनुचित अस्वीकृति से संबंधित बिंदु यहाँ लिखें...'
      : 'Explain why the service decision is aggrieved or SLA expired...',
    delayLabel: isMr ? 'कलम १८ अंतर्गत विलंब माफीचे कारण *' : isHi ? 'धारा १८ अंतर्गत विलंब माफी का कारण *' : 'Reason for Delay Justification (Section 18) *',
    delayPlaceholder: isMr
      ? '३० दिवसांपेक्षा जास्त कालावधी का झाला? याचे वाजवी कारण येथे स्पष्ट करा...'
      : isHi
      ? '३० दिन से अधिक समय होने का उचित कारण स्पष्ट करें...'
      : 'State sufficient cause why the appeal could not be filed within 30 days...',
    declarationText: isMr
      ? 'मी याद्वारे प्रमाणित करतो/करते की वर नमूद केलेली माहिती खरी व सत्य आहे. महाराष्ट्र लोकसेवा हक्क अधिनियम २०१५ अंतर्गत मी हे अपील दाखल करत आहे.'
      : isHi
      ? 'मैं प्रमाणित करता/करती हूँ कि ऊपर दी गई जानकारी सत्य है. महाराष्ट्र लोक सेवा अधिकार अधिनियम २०१५ अंतर्गत यह अपील दर्ज की जा रही है.'
      : 'I hereby declare that the information provided is true and correct under the Maharashtra Right to Public Services Act 2015.',
    submitBtn: isMr ? 'अपील दाखल करा' : isHi ? 'अपील दर्ज करें' : 'Submit Appeal Application',
    copySuccess: isMr ? 'अपील क्रमांक कॉपी केला!' : 'Appeal Number copied!',
  };

  const handleCheckEligibility = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!appNo.trim()) {
      toast.error(isMr ? 'कृपया अर्ज क्रमांक टाका' : 'Please enter application number');
      return;
    }

    setIsChecking(true);
    setCheckResult(null);
    setAppSummary(null);

    try {
      const [checkRes, summaryRes] = await Promise.all([
        checkCitizenAppealEligibilityAction(appNo.trim()),
        getCitizenAppealApplicationSummaryAction(appNo.trim()),
      ]);

      if (!checkRes.success || !checkRes.data) {
        toast.error(checkRes.error || (isMr ? 'अर्जाची तपासणी अयशस्वी' : 'Failed to verify application'));
        return;
      }

      setCheckResult(checkRes.data);

      if (summaryRes.success && summaryRes.data) {
        setAppSummary(summaryRes.data);
        if (summaryRes.data.applicantMobile) setMobileNo(summaryRes.data.applicantMobile);
        if (summaryRes.data.applicantEmail) setEmail(summaryRes.data.applicantEmail);
      }

      if (checkRes.data.canFileAppeal) {
        toast.success(
          isMr
            ? `आपण ${checkRes.data.appealLevel} दाखल करण्यास पात्र आहात!`
            : `Eligible to file ${checkRes.data.appealLevel}!`
        );
      }
    } catch (err: any) {
      toast.error(err?.message || (isMr ? 'त्रुटी आली' : 'An error occurred'));
    } finally {
      setIsChecking(false);
    }
  };

  const handleSubmitAppeal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!checkResult?.canFileAppeal) return;

    if (!reasonForAppeal.trim()) {
      toast.error(isMr ? 'कृपया अपीलाचे कारण नोंदवा' : 'Please provide grounds of appeal');
      return;
    }

    if (checkResult.requiresDelayJustification && !delayJustification.trim()) {
      toast.error(isMr ? 'कृपया विलंब माफीचे कारण नोंदवा' : 'Please provide delay justification');
      return;
    }

    if (!agreedDeclaration) {
      toast.error(isMr ? 'कृपया वैधानिक घोषणापत्रास सहमती द्या' : 'Please accept the declaration');
      return;
    }

    setIsSubmitting(true);
    try {
      const payload: CreateRTSAppealApplicationDto = {
        applicationNo: checkResult.applicationNo,
        appealTypeId: selectedTypeId,
        reasonForAppeal: reasonForAppeal.trim(),
        delayJustification: delayJustification.trim() || undefined,
        mobileNo: mobileNo.trim() || undefined,
        email: email.trim() || undefined,
      };

      const result = await submitCitizenAppealAction(payload);
      if (result.success && result.data) {
        setSubmissionResult(result.data);
        setStep(3);
        toast.success(
          isMr
            ? `अपील यशस्वीरीत्या दाखल झाले! अपील क्र: ${result.data.appealNo}`
            : `Appeal submitted successfully! Appeal No: ${result.data.appealNo}`
        );
      } else {
        toast.error(result.error || (isMr ? 'अपील दाखल करताना त्रुटी आली' : 'Failed to submit appeal'));
      }
    } catch (err: any) {
      toast.error(err?.message || (isMr ? 'सर्व्हर त्रुटी आली' : 'Server error occurred'));
    } finally {
      setIsSubmitting(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    toast.success(t.copySuccess);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-slate-900/60 p-4 backdrop-blur-xs">
      <div className="relative w-full max-w-2xl rounded-3xl border border-slate-200 bg-white shadow-2xl overflow-hidden transition-all duration-300">
        {/* Header */}
        <div className="border-b border-slate-100 bg-gradient-to-r from-blue-900 via-indigo-950 to-blue-900 px-6 py-5 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/10 ring-1 ring-white/20">
                <Scale className="h-6 w-6 text-amber-300" />
              </div>
              <div>
                <h2 className="text-base sm:text-lg font-black tracking-tight">{t.title}</h2>
                <p className="text-xs text-slate-300">{t.subtitle}</p>
              </div>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl p-2 text-slate-400 hover:bg-white/10 hover:text-white transition"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Stepper Progress */}
          <div className="mt-4 flex items-center justify-between border-t border-white/10 pt-3 text-[11px] font-black">
            <span className={step === 1 ? 'text-amber-300' : 'text-slate-400'}>{t.step1Title}</span>
            <span className="text-slate-500">→</span>
            <span className={step === 2 ? 'text-amber-300' : 'text-slate-400'}>{t.step2Title}</span>
            <span className="text-slate-500">→</span>
            <span className={step === 3 ? 'text-amber-300' : 'text-slate-400'}>{t.step3Title}</span>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6">
          {/* ── STEP 1: Verify Application & Check Eligibility ──────────────── */}
          {step === 1 && (
            <div className="space-y-5">
              <form onSubmit={handleCheckEligibility} className="space-y-3">
                <label className="block text-xs font-black text-slate-700">{t.inputAppNoLabel}</label>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <input
                      type="text"
                      required
                      value={appNo}
                      onChange={(e) => setAppNo(e.target.value.toUpperCase())}
                      placeholder="e.g. RTS00000001"
                      className="w-full rounded-xl border border-slate-300 py-2.5 pl-10 pr-4 text-xs font-mono font-bold text-slate-900 uppercase placeholder-slate-400 focus:border-blue-600 focus:outline-hidden focus:ring-2 focus:ring-blue-600/20"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={isChecking}
                    className="inline-flex items-center gap-1.5 rounded-xl bg-blue-700 px-5 py-2.5 text-xs font-black text-white hover:bg-blue-800 transition disabled:opacity-50 cursor-pointer"
                  >
                    {isChecking ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        <span>{isMr ? 'तपासत आहे...' : 'Checking...'}</span>
                      </>
                    ) : (
                      <>
                        <Search className="h-4 w-4" />
                        <span>{t.checkBtn}</span>
                      </>
                    )}
                  </button>
                </div>
              </form>

              {/* Eligibility Evaluation Feedback */}
              {checkResult && (
                <div className="space-y-4 pt-2">
                  {/* If NOT eligible to appeal */}
                  {!checkResult.canFileAppeal ? (
                    <div className="rounded-2xl border border-amber-300 bg-amber-50 p-5 space-y-3">
                      <div className="flex items-start gap-3">
                        <AlertCircle className="h-6 w-6 text-amber-600 shrink-0 mt-0.5" />
                        <div>
                          <h4 className="text-sm font-black text-amber-950">
                            {isMr ? 'सध्या अपील दाखल करता येत नाही' : 'Appeal Cannot Be Filed At This Time'}
                          </h4>
                          <p className="mt-1 text-xs font-semibold leading-relaxed text-amber-900">
                            {checkResult.blockReason}
                          </p>
                        </div>
                      </div>

                      {/* SLA Info Card if in active SLA */}
                      {checkResult.serviceSlaExpiryDate && (
                        <div className="grid grid-cols-2 gap-2 pt-2 text-xs border-t border-amber-200">
                          <div>
                            <span className="text-[10px] text-amber-700 uppercase font-bold block">
                              {isMr ? 'विहित मुदत (SLA)' : 'Service SLA'}
                            </span>
                            <span className="font-bold text-amber-950">
                              {checkResult.serviceSlaDays} {isMr ? 'दिवस' : 'Days'}
                            </span>
                          </div>
                          <div>
                            <span className="text-[10px] text-amber-700 uppercase font-bold block">
                              {isMr ? 'मुदत समाप्ती दिनांक' : 'SLA Expiry Date'}
                            </span>
                            <span className="font-bold text-amber-950">
                              {new Date(checkResult.serviceSlaExpiryDate).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    /* If Eligible! */
                    <div className="rounded-2xl border border-emerald-300 bg-emerald-50/80 p-5 space-y-4">
                      <div className="flex items-start gap-3">
                        <CheckCircle2 className="h-6 w-6 text-emerald-600 shrink-0 mt-0.5" />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="rounded-md bg-emerald-700 px-2 py-0.5 text-[10px] font-black uppercase text-white">
                              {checkResult.appealLevel}
                            </span>
                            <h4 className="text-sm font-black text-emerald-950">
                              {isMr ? 'आपण अपील दाखल करण्यास पात्र आहात' : 'Eligible for Statutory Appeal'}
                            </h4>
                          </div>
                          <p className="mt-1 text-xs font-semibold text-emerald-900">
                            {isMr
                              ? `अर्ज #${checkResult.applicationNo} करिता आपण ${checkResult.appealLevel} दाखल करू शकता.`
                              : `You are eligible to file ${checkResult.appealLevel} for application #${checkResult.applicationNo}.`}
                          </p>
                        </div>
                      </div>

                      {/* Application Meta details */}
                      {appSummary && (
                        <div className="grid grid-cols-2 gap-2 rounded-xl bg-white p-3.5 border border-emerald-200 text-xs font-semibold text-slate-700">
                          <div>
                            <span className="text-[10px] text-slate-400 uppercase font-bold block">{isMr ? 'अर्जदाराचे नाव' : 'Applicant'}</span>
                            <span className="font-black text-slate-900">{appSummary.applicantName}</span>
                          </div>
                          <div>
                            <span className="text-[10px] text-slate-400 uppercase font-bold block">{isMr ? 'सेवा' : 'Service'}</span>
                            <span className="truncate block font-bold text-slate-900" title={appSummary.serviceName}>
                              {appSummary.serviceName}
                            </span>
                          </div>
                        </div>
                      )}

                      {/* Delay Condonation Alert notice */}
                      {checkResult.requiresDelayJustification && (
                        <div className="flex items-center gap-2 rounded-xl bg-orange-100 p-3 text-xs font-bold text-orange-900 border border-orange-200">
                          <AlertTriangle className="h-4 w-4 text-orange-600 shrink-0" />
                          <span>
                            {isMr
                              ? '३० दिवसांची मुदत उलटल्यामुळे पुढील टप्प्यात विलंब माफीचे कारण (कलम १८) नोंदवणे आवश्यक आहे.'
                              : 'Statutory 30-day limit has passed. A delay condonation justification will be required in step 2.'}
                          </span>
                        </div>
                      )}

                      <div className="flex justify-end pt-2">
                        <button
                          type="button"
                          onClick={() => setStep(2)}
                          className="inline-flex items-center gap-2 rounded-xl bg-emerald-700 px-6 py-2.5 text-xs font-black text-white shadow-md hover:bg-emerald-800 transition cursor-pointer"
                        >
                          <span>{isMr ? 'पुढील टप्पा: अपीलाची कारणे' : 'Proceed to Appeal Grounds'}</span>
                          <ArrowRight className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* ── STEP 2: Appeal Form ─────────────────────────────────────────── */}
          {step === 2 && checkResult && (
            <form onSubmit={handleSubmitAppeal} className="space-y-4">
              <div className="rounded-xl bg-blue-50 p-3 border border-blue-200 flex items-center justify-between text-xs font-bold text-blue-900">
                <span>{checkResult.applicationNo} ({checkResult.appealLevel})</span>
                <span className="text-slate-500 font-mono">{appSummary?.serviceName}</span>
              </div>

              {/* Appeal Ground Category */}
              <div className="space-y-1">
                <label className="block text-xs font-black text-slate-700">
                  {isMr ? 'अपीलाचा वैधानिक प्रकार / आधार *' : 'Statutory Grounds / Appeal Category *'}
                </label>
                <select
                  value={selectedTypeId}
                  onChange={(e) => setSelectedTypeId(Number(e.target.value))}
                  className="w-full rounded-xl border border-slate-300 p-2.5 text-xs font-bold text-slate-800 focus:border-blue-600 focus:outline-hidden"
                >
                  {appealTypes.map((type) => (
                    <option key={type.id} value={type.id}>
                      {type.appealTypeName} ({type.code})
                    </option>
                  ))}
                </select>
              </div>

              {/* Reason For Appeal */}
              <div className="space-y-1">
                <label className="block text-xs font-black text-slate-700">{t.reasonLabel}</label>
                <textarea
                  required
                  rows={4}
                  value={reasonForAppeal}
                  onChange={(e) => setReasonForAppeal(e.target.value)}
                  placeholder={t.reasonPlaceholder}
                  className="w-full rounded-xl border border-slate-300 p-3 text-xs font-semibold text-slate-800 placeholder-slate-400 focus:border-blue-600 focus:outline-hidden focus:ring-2 focus:ring-blue-600/20 resize-none"
                />
              </div>

              {/* Delay Justification if required */}
              {checkResult.requiresDelayJustification && (
                <div className="space-y-1 rounded-xl bg-amber-50 p-3.5 border border-amber-200">
                  <label className="block text-xs font-black text-amber-950 flex items-center gap-1.5">
                    <AlertTriangle className="h-4 w-4 text-amber-600" />
                    <span>{t.delayLabel}</span>
                  </label>
                  <textarea
                    required
                    rows={3}
                    value={delayJustification}
                    onChange={(e) => setDelayJustification(e.target.value)}
                    placeholder={t.delayPlaceholder}
                    className="w-full rounded-xl border border-amber-300 p-3 text-xs font-semibold text-slate-800 placeholder-slate-400 focus:border-amber-600 focus:outline-hidden focus:ring-2 focus:ring-amber-600/20 resize-none bg-white"
                  />
                </div>
              )}

              {/* Contact Info */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="block text-xs font-bold text-slate-700">{isMr ? 'मोबाईल क्रमांक *' : 'Mobile Number *'}</label>
                  <input
                    type="tel"
                    required
                    maxLength={10}
                    value={mobileNo}
                    onChange={(e) => setMobileNo(e.target.value.replace(/\D/g, ''))}
                    className="w-full rounded-xl border border-slate-300 p-2.5 text-xs font-mono font-bold text-slate-800"
                  />
                </div>
                <div className="space-y-1">
                  <label className="block text-xs font-bold text-slate-700">{isMr ? 'ईमेल (ऐच्छिक)' : 'Email (Optional)'}</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full rounded-xl border border-slate-300 p-2.5 text-xs font-semibold text-slate-800"
                  />
                </div>
              </div>

              {/* Statutory Declaration */}
              <div className="pt-2">
                <label className="flex items-start gap-2.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={agreedDeclaration}
                    onChange={(e) => setAgreedDeclaration(e.target.checked)}
                    className="mt-0.5 h-4 w-4 rounded-md border-slate-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-[11px] font-semibold text-slate-600 leading-snug">
                    {t.declarationText}
                  </span>
                </label>
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 transition"
                >
                  {isMr ? 'मागे' : 'Back'}
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting || !agreedDeclaration}
                  className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-700 to-indigo-700 px-6 py-2.5 text-xs font-black text-white shadow-md hover:from-blue-800 hover:to-indigo-800 transition disabled:opacity-50 cursor-pointer"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>{isMr ? 'दाखल होत आहे...' : 'Submitting...'}</span>
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

          {/* ── STEP 3: Acknowledgment ──────────────────────────────────────── */}
          {step === 3 && submissionResult && (
            <div className="space-y-6 text-center py-4">
              <div className="flex justify-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-emerald-100 ring-8 ring-emerald-50">
                  <CheckCircle2 className="h-10 w-10 text-emerald-600" />
                </div>
              </div>

              <div>
                <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-black text-emerald-800">
                  {submissionResult.appealLevel} Filed
                </span>
                <h3 className="mt-3 text-lg font-black text-slate-900">
                  {isMr ? 'आपले अपील यशस्वीरीत्या नोंदवले गेले!' : 'Statutory Appeal Successfully Registered!'}
                </h3>
                <p className="mt-1 text-xs font-semibold text-slate-500">
                  {isMr
                    ? 'अपील खटला संबंधित अपीलीय प्राधिकाऱ्यांकडे सुनावणीसाठी सादर करण्यात आला आहे.'
                    : 'Your appeal has been officially placed before the Appellate Authority for adjudication.'}
                </p>
              </div>

              {/* Appeal Number Box */}
              <div className="mx-auto max-w-md rounded-2xl border border-blue-200 bg-blue-50/70 p-4">
                <span className="text-[10px] uppercase font-black tracking-wider text-blue-700 block">
                  {isMr ? 'अपील ट्रॅकिंग क्रमांक' : 'Appeal Tracking Number'}
                </span>
                <div className="mt-1 flex items-center justify-center gap-2">
                  <span className="font-mono text-base font-black text-blue-950">{submissionResult.appealNo}</span>
                  <button
                    type="button"
                    onClick={() => copyToClipboard(submissionResult.appealNo)}
                    className="rounded-lg p-1 text-blue-600 hover:bg-blue-100 transition"
                    title="Copy"
                  >
                    {copied ? <Check className="h-4 w-4 text-emerald-600" /> : <Copy className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="rounded-xl bg-blue-700 px-8 py-2.5 text-xs font-black text-white hover:bg-blue-800 transition cursor-pointer"
                >
                  {isMr ? 'बंद करा' : 'Done'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
