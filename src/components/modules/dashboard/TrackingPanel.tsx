"use client";

import { useState, useEffect, useMemo } from "react";
import {
  Search,
  CheckCircle2,
  Clock,
  XCircle,
  Calendar,
  MessageSquare,
  User,
} from "lucide-react";
import { Button } from "@/components/common/Button";
import { Input } from "@/components/common/Input";
import { Progress } from "@/components/common/progress";
import { useLanguage } from "@/components/Providers/LanguageProvider";

interface TrackingPanelProps {
  authUser?: any;
}

type Lang = "en" | "hi" | "mr";
const safeLang = (v: unknown): Lang => (v === "hi" || v === "mr" || v === "en" ? (v as Lang) : "en");

const TXT: Record<
  Lang,
  {
    yourApplications: string;
    showingOf: (shown: number, total: number) => string;

    placeholder: string;
    tryLabel: string;

    pleaseEnter: string;
    notFound: string;

    applicant: string;
    submitted: string;

    applicationIdLabel: string;
    overallProgress: string;

    approvalStages: string;
    officer: string;
    remark: string;

    approved: string;
    pending: string;
    rejected: string;

    approvedTitle: string;
    approvedMsg: string;

    trackAria: string;
  }
> = {
  en: {
    yourApplications: "Your Applications",
    showingOf: (shown, total) => `Showing ${shown} of ${total} applications`,
    placeholder: "Enter Application ID",
    tryLabel: "Try:",
    pleaseEnter: "Please enter Application ID.",
    notFound: "Application not found. Please check your Application ID.",
    applicant: "Applicant",
    submitted: "Submitted",
    applicationIdLabel: "Application ID",
    overallProgress: "Overall Progress",
    approvalStages: "Approval Stages",
    officer: "Officer",
    remark: "Remark",
    approved: "Approved",
    pending: "Pending",
    rejected: "Rejected",
    approvedTitle: "🎉 Application Approved!",
    approvedMsg: "Your application has been successfully processed.",
    trackAria: "Track application",
  },
  hi: {
    yourApplications: "आपके आवेदन",
    showingOf: (shown, total) => `${total} में से ${shown} आवेदन दिखाए जा रहे हैं`,
    placeholder: "आवेदन आईडी दर्ज करें",
    tryLabel: "ट्राय करें:",
    pleaseEnter: "कृपया आवेदन आईडी दर्ज करें।",
    notFound: "आवेदन नहीं मिला। कृपया आवेदन आईडी जाँचें।",
    applicant: "आवेदक",
    submitted: "जमा",
    applicationIdLabel: "आवेदन आईडी",
    overallProgress: "कुल प्रगति",
    approvalStages: "स्वीकृति चरण",
    officer: "अधिकारी",
    remark: "टिप्पणी",
    approved: "स्वीकृत",
    pending: "लंबित",
    rejected: "अस्वीकृत",
    approvedTitle: "🎉 आवेदन स्वीकृत!",
    approvedMsg: "आपका आवेदन सफलतापूर्वक प्रोसेस हो गया है।",
    trackAria: "आवेदन ट्रैक करें",
  },
  mr: {
    yourApplications: "तुमचे अर्ज",
    showingOf: (shown, total) => `${total} पैकी ${shown} अर्ज दाखवत आहे`,
    placeholder: "अर्ज आयडी टाका",
    tryLabel: "ट्राय करा:",
    pleaseEnter: "कृपया अर्ज आयडी प्रविष्ट करा.",
    notFound: "अर्ज सापडला नाही. कृपया अर्ज आयडी तपासा.",
    applicant: "अर्जदार",
    submitted: "सादर",
    applicationIdLabel: "अर्ज आयडी",
    overallProgress: "एकूण प्रगती",
    approvalStages: "मंजुरी टप्पे",
    officer: "अधिकारी",
    remark: "टिप",
    approved: "मंजूर",
    pending: "प्रलंबित",
    rejected: "नामंजूर",
    approvedTitle: "🎉 अर्ज मंजूर!",
    approvedMsg: "तुमचा अर्ज यशस्वीरित्या प्रक्रिया झाला आहे.",
    trackAria: "अर्ज ट्रॅक करा",
  },
};

// Mock tracking data for demo (base EN)
const mockTrackingData: Record<string, any> = {
  APP2024001: {
    id: "APP2024001",
    type: "Birth Certificate",
    applicantName: "Rajesh Kumar",
    submittedDate: "2024-11-10 10:30 AM",
    currentStage: 3,
    progress: 100,
    status: "approved",
    stages: [
      {
        stage: 1,
        name: "Document Verification",
        officer: "Priya Sharma",
        status: "approved",
        date: "2024-11-10",
        time: "02:15 PM",
        remark: "All documents verified successfully. Birth hospital records matched.",
      },
      {
        stage: 2,
        name: "Department Review",
        officer: "Anil Deshmukh",
        status: "approved",
        date: "2024-11-12",
        time: "11:45 AM",
        remark: "Application approved by department head. All details are correct.",
      },
      {
        stage: 3,
        name: "Final Approval",
        officer: "Dr. Sunita Patil",
        status: "approved",
        date: "2024-11-14",
        time: "04:30 PM",
        remark: "Certificate approved and ready for download. Visit office or download online.",
      },
    ],
  },
  APP2024002: {
    id: "APP2024002",
    type: "Property Tax Payment",
    applicantName: "Meena Joshi",
    submittedDate: "2024-11-15 09:15 AM",
    currentStage: 2,
    progress: 66,
    status: "pending",
    stages: [
      {
        stage: 1,
        name: "Payment Verification",
        officer: "Ramesh Pawar",
        status: "approved",
        date: "2024-11-15",
        time: "03:20 PM",
        remark: "Payment of ₹15,000 verified successfully through online portal.",
      },
      {
        stage: 2,
        name: "Records Update",
        officer: "Kavita Rane",
        status: "pending",
        date: "-",
        time: "-",
        remark: "Under review. Tax records being updated in municipal database.",
      },
      {
        stage: 3,
        name: "Receipt Generation",
        officer: "-",
        status: "pending",
        date: "-",
        time: "-",
        remark: "Awaiting completion of previous stage.",
      },
    ],
  },
};

// Optional i18n for mock-only strings (service/stage/remark)
const MOCK_I18N: Record<
  string,
  {
    type: Record<Lang, string>;
    stages: Array<{
      name: Record<Lang, string>;
      remark: Record<Lang, string>;
    }>;
  }
> = {
  APP2024001: {
    type: { en: "Birth Certificate", hi: "जन्म प्रमाणपत्र", mr: "जन्म प्रमाणपत्र" },
    stages: [
      {
        name: { en: "Document Verification", hi: "दस्तावेज़ सत्यापन", mr: "कागदपत्र पडताळणी" },
        remark: {
          en: "All documents verified successfully. Birth hospital records matched.",
          hi: "सभी दस्तावेज़ सफलतापूर्वक सत्यापित हो गए। अस्पताल रिकॉर्ड मिलान हो गया।",
          mr: "सर्व कागदपत्रे यशस्वीरित्या पडताळली. रुग्णालय नोंदी जुळल्या.",
        },
      },
      {
        name: { en: "Department Review", hi: "विभागीय समीक्षा", mr: "विभागीय परीक्षण" },
        remark: {
          en: "Application approved by department head. All details are correct.",
          hi: "विभाग प्रमुख द्वारा आवेदन स्वीकृत। सभी विवरण सही हैं।",
          mr: "विभाग प्रमुखांनी अर्ज मंजूर केला. सर्व तपशील बरोबर आहेत.",
        },
      },
      {
        name: { en: "Final Approval", hi: "अंतिम स्वीकृति", mr: "अंतिम मंजुरी" },
        remark: {
          en: "Certificate approved and ready for download. Visit office or download online.",
          hi: "प्रमाणपत्र स्वीकृत है और डाउनलोड के लिए तैयार है। कार्यालय जाएँ या ऑनलाइन डाउनलोड करें।",
          mr: "प्रमाणपत्र मंजूर असून डाउनलोडसाठी तयार आहे. कार्यालयात भेट द्या किंवा ऑनलाइन डाउनलोड करा.",
        },
      },
    ],
  },
  APP2024002: {
    type: { en: "Property Tax Payment", hi: "संपत्ति कर भुगतान", mr: "मालमत्ता कर भरणा" },
    stages: [
      {
        name: { en: "Payment Verification", hi: "भुगतान सत्यापन", mr: "भरणा पडताळणी" },
        remark: {
          en: "Payment of ₹15,000 verified successfully through online portal.",
          hi: "₹15,000 का भुगतान ऑनलाइन पोर्टल के माध्यम से सफलतापूर्वक सत्यापित हुआ।",
          mr: "₹15,000 चा भरणा ऑनलाइन पोर्टलद्वारे यशस्वीरित्या पडताळला.",
        },
      },
      {
        name: { en: "Records Update", hi: "रिकॉर्ड अपडेट", mr: "नोंदी अद्ययावत" },
        remark: {
          en: "Under review. Tax records being updated in municipal database.",
          hi: "समीक्षा में। नगर निगम डेटाबेस में कर रिकॉर्ड अपडेट हो रहे हैं।",
          mr: "परीक्षण सुरू आहे. महानगरपालिका डेटाबेसमध्ये कर नोंदी अद्ययावत होत आहेत.",
        },
      },
      {
        name: { en: "Receipt Generation", hi: "रसीद निर्माण", mr: "पावती निर्मिती" },
        remark: {
          en: "Awaiting completion of previous stage.",
          hi: "पिछले चरण के पूर्ण होने की प्रतीक्षा है।",
          mr: "मागील टप्पा पूर्ण होण्याची प्रतीक्षा आहे.",
        },
      },
    ],
  },
};

export function TrackingPanel({ authUser }: TrackingPanelProps) {
  const { language } = useLanguage();
  const lang = safeLang(language);
  const t = TXT[lang];

  const [applicationId, setApplicationId] = useState("");
  const [trackingData, setTrackingData] = useState<any>(null);
  const [searchError, setSearchError] = useState("");
  const [userApplications, setUserApplications] = useState<any[]>([]);

  // Load user's applications from localStorage (client-side safe)
  useEffect(() => {
    if (!authUser) return;
    if (typeof window === "undefined") return;

    try {
      const stored = JSON.parse(window.localStorage.getItem("rtsApplications") || "{}");
      const userUpicId = authUser?.userData?.upicId;
      const apps = Object.values(stored).filter((app: any) => app.userUpicId === userUpicId);
      setUserApplications(apps as any[]);
    } catch (err) {
      console.error("Error reading applications from localStorage", err);
    }
  }, [authUser]);

  const displayTrackingData = useMemo(() => {
    if (!trackingData) return null;
    if (trackingData.__source !== "mock") return trackingData;

    const i18n = MOCK_I18N[trackingData.id];
    if (!i18n) return trackingData;

    return {
      ...trackingData,
      type: i18n.type[lang] ?? trackingData.type,
      stages: (trackingData.stages ?? []).map((s: any, idx: number) => ({
        ...s,
        name: i18n.stages[idx]?.name?.[lang] ?? s.name,
        remark: i18n.stages[idx]?.remark?.[lang] ?? s.remark,
      })),
    };
  }, [trackingData, lang]);

  const handleTrackApplication = () => {
    setSearchError("");

    if (!applicationId.trim()) {
      setSearchError(t.pleaseEnter);
      setTrackingData(null);
      return;
    }

    const id = applicationId.toUpperCase();

    // Read from localStorage safely
    let realData: any = null;
    if (typeof window !== "undefined") {
      try {
        const stored = JSON.parse(window.localStorage.getItem("rtsApplications") || "{}");
        realData = stored[id];
      } catch (err) {
        console.error("Error parsing localStorage", err);
      }
    }

    if (realData) {
      setTrackingData({
        id: realData.id,
        type: realData.serviceName,
        applicantName: realData.applicantName,
        submittedDate: realData.submittedDate,
        currentStage: realData.currentStage,
        progress: realData.progress,
        status: realData.status,
        stages: realData.stages,
        __source: "local",
      });
      return;
    }

    // Fallback: mock data
    const data = mockTrackingData[id];
    if (data) {
      setTrackingData({ ...data, __source: "mock" });
    } else {
      setTrackingData(null);
      setSearchError(t.notFound);
    }
  };

  const getStatusIcon = (status: string) => {
    if (status === "approved") return <CheckCircle2 className="w-4 h-4 text-green-600 flex-shrink-0" />;
    if (status === "pending") return <Clock className="w-4 h-4 text-orange-500 flex-shrink-0" />;
    return <XCircle className="w-4 h-4 text-red-500 flex-shrink-0" />;
  };


  const getStatusBadge = (status: string) => {
    if (status === "approved") {
      return (
        <span className="px-2 py-0.5 bg-green-100 text-green-700 rounded-full text-xs whitespace-nowrap">
          {t.approved}
        </span>
      );
    }
    if (status === "pending") {
      return (
        <span className="px-2 py-0.5 bg-orange-100 text-orange-700 rounded-full text-xs whitespace-nowrap">
          {t.pending}
        </span>
      );
    }
    return (
      <span className="px-2 py-0.5 bg-red-100 text-red-700 rounded-full text-xs whitespace-nowrap">
        {t.rejected}
      </span>
    );
  };

  const handleClickYourApplication = (app: any) => {
    setApplicationId(app.id);
    setTrackingData({
      id: app.id,
      type: app.serviceName,
      applicantName: app.applicantName,
      submittedDate: app.submittedDate,
      currentStage: app.currentStage,
      progress: app.progress,
      status: app.status,
      stages: app.stages,
      __source: "local",
    });
    setSearchError("");
  };

  const td = displayTrackingData;

  return (
    <div className="w-full">
      <div className="space-y-3">
        {/* Your Applications (if any) */}
        {authUser && userApplications.length > 0 && (
          <div className="bg-gradient-to-r from-teal-50 to-blue-50 border-2 border-teal-300 rounded-lg p-3 mb-4">
            <div className="flex items-center gap-2 mb-3">
              <User className="w-5 h-5 text-teal-600" />
              <h3 className="text-sm font-semibold text-gray-800">{t.yourApplications}</h3>
            </div>

            <div className="space-y-2">
              {userApplications.slice(0, 5).map((app: any) => (
                <div
                  key={app.id}
                  onClick={() => handleClickYourApplication(app)}
                  className="bg-white rounded-lg p-2.5 border border-teal-200 hover:border-teal-400 hover:shadow-md transition-all cursor-pointer"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="text-xs font-semibold text-gray-900 font-mono truncate">{app.id}</p>
                        {getStatusBadge(app.status)}
                      </div>
                      <p className="text-xs text-gray-700 truncate">{app.serviceName}</p>
                      <p className="text-[10px] text-gray-500 mt-0.5">{app.submittedDate}</p>
                    </div>
                    <div className="flex-shrink-0">
                      <div className="text-xs font-semibold text-teal-600">{app.progress}%</div>
                    </div>
                  </div>
                </div>
              ))}

              {userApplications.length > 5 && (
                <p className="text-[10px] text-gray-500 text-center pt-1">
                  {t.showingOf(5, userApplications.length)}
                </p>
              )}
            </div>
          </div>
        )}

        {/* Search Section */}
        <div className="flex gap-2">
          <Input
            type="text"
            placeholder={t.placeholder}
            value={applicationId}
            onChange={(e) => setApplicationId(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleTrackApplication()}
            className="flex-1 h-10 text-sm border-2 border-purple-300 focus:border-purple-500"
          />
          <Button
            onClick={handleTrackApplication}
            aria-label={t.trackAria}
            className="h-10 px-4 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-xs flex-shrink-0"
            type="button"
          >
            <Search className="w-4 h-4" />
          </Button>
        </div>

        {/* Sample IDs */}
        <div className="bg-gradient-to-r from-blue-50 to-cyan-50 border-l-4 border-blue-500 p-2.5 rounded">
          <p className="text-xs text-blue-800 break-words">
            <strong>{t.tryLabel}</strong> APP2024001, APP2024002
          </p>
        </div>

        {/* Error */}
        {searchError && (
          <div className="bg-red-50 border-l-4 border-red-500 p-2.5 rounded">
            <p className="text-xs text-red-800 break-words">{searchError}</p>
          </div>
        )}

        {/* Tracking Result */}
        {td && (
          <div className="space-y-3">
            {/* Application Header */}
            <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg p-3 border-2 border-purple-200">
              <div className="space-y-3">
                <div>
                  <h3 className="text-sm text-gray-800 mb-1 break-words">{td.type}</h3>
                  <p className="text-xs text-gray-600 break-words">
                    {t.applicant}: <strong>{td.applicantName}</strong>
                  </p>
                  <p className="text-xs text-gray-500 mt-0.5 break-words">
                    {t.submitted}: {td.submittedDate}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-600 mb-1">{t.applicationIdLabel}</p>
                  <div className="bg-white px-2.5 py-1.5 rounded border-2 border-purple-300 font-mono text-xs break-all">
                    {td.id}
                  </div>
                </div>
              </div>

              {/* Progress */}
              <div className="space-y-1.5 mt-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-gray-700">{t.overallProgress}</span>
                  <span className="font-bold text-purple-700">{td.progress}%</span>
                </div>
                <Progress value={td.progress} className="h-2" />
              </div>
            </div>

            {/* Stages */}
            <div className="space-y-2.5 px-0.5">
              <h4 className="text-sm text-gray-800 flex items-center gap-1.5 px-1">
                <span className="w-4 sm:w-6 h-0.5 bg-gradient-to-r from-purple-400 to-pink-400 rounded flex-shrink-0" />
                <span className="whitespace-nowrap text-xs sm:text-sm">{t.approvalStages}</span>
                <span className="flex-1 h-0.5 bg-gradient-to-r from-purple-400 to-pink-400 rounded" />
              </h4>

              {td.stages.map((stage: any, index: number) => (
                <div
                  key={stage.stage}
                  className={`relative bg-white rounded-lg p-2.5 sm:p-3 border-2 transition-all ${
                    stage.status === "approved"
                      ? "border-green-300 shadow-md"
                      : stage.status === "pending"
                      ? "border-orange-300 shadow-md"
                      : "border-gray-200"
                  }`}
                >
                  {/* Stage badge */}
                  <div className="absolute -top-2 -left-2 w-6 h-6 sm:w-7 sm:h-7 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white text-xs shadow-lg">
                    {stage.stage}
                  </div>

                  <div className="ml-4 sm:ml-5 mr-0.5">
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5 mb-1">
                          {getStatusIcon(stage.status)}
                          <h5 className="text-xs text-gray-900 break-words leading-tight">{stage.name}</h5>
                        </div>
                        <p className="text-xs text-gray-600 break-words leading-tight">
                          {t.officer}: <strong>{stage.officer}</strong>
                        </p>
                      </div>
                      <div className="flex-shrink-0">{getStatusBadge(stage.status)}</div>
                    </div>

                    {/* Date & time */}
                    <div className="flex items-center gap-2 sm:gap-3 mb-2 text-xs text-gray-600 flex-wrap">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5 text-purple-500 flex-shrink-0" />
                        <span className="text-xs">{stage.date}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-pink-500 flex-shrink-0" />
                        <span className="text-xs">{stage.time}</span>
                      </div>
                    </div>

                    {/* Remark */}
                    <div className="bg-gradient-to-r from-gray-50 to-purple-50 rounded-lg p-2 sm:p-2.5 border border-purple-100">
                      <div className="flex items-start gap-1.5 sm:gap-2">
                        <MessageSquare className="w-3.5 h-3.5 text-purple-600 mt-0.5 flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="text-xs text-gray-600 mb-0.5">{t.remark}:</p>
                          <p className="text-xs text-gray-800 leading-relaxed break-words">{stage.remark}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* connector line */}
                  {index < td.stages.length - 1 && (
                    <div className="absolute left-3 sm:left-3.5 bottom-0 w-0.5 h-2.5 bg-gradient-to-b from-purple-300 to-transparent translate-y-full" />
                  )}
                </div>
              ))}
            </div>

            {/* Final message */}
            {td.status === "approved" && (
              <div className="bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-300 rounded-lg p-3">
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="w-6 h-6 text-green-600 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <h5 className="text-sm text-green-800 mb-0.5 break-words">{t.approvedTitle}</h5>
                    <p className="text-xs text-green-700 leading-relaxed break-words">{t.approvedMsg}</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
