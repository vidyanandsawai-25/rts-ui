"use client";

import { useMemo, useState } from "react";
import {
  Download,
  Eye,
  Receipt,
  TrendingUp,
  CheckCircle,
  Clock,
  AlertCircle,
  Droplet,
  Home,
  BadgeCheck,
  ArrowLeft,
} from "lucide-react";
import { Language } from "@/types/service.types";
import { Badge } from "@/components/common/Badge";
import { Button } from "@/components/common/Button";
import { ScrollArea } from "@/components/common/scroll-area";
import { AuthUserData } from "@/types/safe";
import { getPropertyById, getPropertyText, propertyRecords } from "@/data/properties";


interface DetailedDashboardViewProps {
  serviceType: "propertyTax" | "waterConnection" | "tradeLicense";
  language: Language;
  darkMode?: boolean;
  authUser?: {
    userType: "user" | "admin";
    userData: AuthUserData; 
  } | null;
  onClose: () => void;
  propertyId?: number;
  connectionId?: number;
  licenseId?: number;
  onBack?: () => void;
}

type Status = "paid" | "pending" | "active" | "expired";

type PaymentBase = {
  year: string;
  period: string;
  amount: number;
  paid: number;
  pending: number;
  status: Status;
  paidDate: string;
  receiptNo: string;
  paymentMode: string;
};

type WaterPayment = PaymentBase & { consumption: string };
type TradePayment = PaymentBase & { licenseType: string };
type Payment = PaymentBase | WaterPayment | TradePayment;

function statusBadgeConfig(language: Language) {
  return {
    paid: {
      cls: "bg-emerald-100 text-emerald-700 border border-emerald-200",
      Icon: CheckCircle,
      text: language === "en" ? "Paid" : language === "hi" ? "भुगतान" : "भरलेले",
    },
    pending: {
      cls: "bg-amber-100 text-amber-700 border border-amber-200",
      Icon: Clock,
      text: language === "en" ? "Pending" : language === "hi" ? "लंबित" : "प्रलंबित",
    },
    active: {
      cls: "bg-emerald-100 text-emerald-700 border border-emerald-200",
      Icon: CheckCircle,
      text: language === "en" ? "Active" : language === "hi" ? "सक्रिय" : "सक्रिय",
    },
    expired: {
      cls: "bg-gray-100 text-gray-700 border border-gray-200",
      Icon: AlertCircle,
      text: language === "en" ? "Expired" : language === "hi" ? "समाप्त" : "समाप्त",
    },
  } as const;
}

export function DetailedDashboardView({
  serviceType,
  language,
  darkMode = false,
  authUser,
  onClose,
  propertyId,
  connectionId,
  licenseId,
  onBack,
}: DetailedDashboardViewProps) {
  const [selectedYear, setSelectedYear] = useState<string>("all");

const data = useMemo(() => {
  const upicId = authUser?.userData?.upicId || "UP12345678";

  // ✅ Property dummy data by propertyId
  if (serviceType === "propertyTax") {
    const id = propertyId ?? 1;

    const propertyMap = {
      1: {
        propertyNo: "PTX-2024-001234",
        type: language === "en" ? "Residential" : language === "hi" ? "आवासीय" : "निवासी",
        address:
          language === "en"
            ? "Plot 123, Sector 15, Akola"
            : language === "hi"
            ? "प्लॉट 123, सेक्टर 15, अकोला"
            : "प्लॉट 123, सेक्टर 15, अकोला",
        area: "1,500 sq ft",
        totalYears: 4,
        status: "paid" as const,
        totalAmount: 12500,
        paidAmount: 12500,
        pendingAmount: 0,
        dueDate: "31 Mar 2024",
      },
      2: {
        propertyNo: "PTX-2024-002456",
        type: language === "en" ? "Commercial" : language === "hi" ? "व्यावसायिक" : "व्यावसायिक",
        address:
          language === "en"
            ? "Shop 45, Market Road, Akola"
            : language === "hi"
            ? "दुकान 45, मार्केट रोड, अकोला"
            : "दुकान 45, मार्केट रोड, अकोला",
        area: "800 sq ft",
        totalYears: 3,
        status: "paid" as const,
        totalAmount: 8500,
        paidAmount: 8500,
        pendingAmount: 0,
        dueDate: "31 Mar 2024",
      },
      3: {
        propertyNo: "PTX-2024-003789",
        type: language === "en" ? "Residential" : language === "hi" ? "आवासीय" : "निवासी",
        address:
          language === "en"
            ? "Plot 456, Sector 22, Akola"
            : language === "hi"
            ? "प्लॉट 456, सेक्टर 22, अकोला"
            : "प्लॉट 456, सेक्टर 22, अकोला",
        area: "2,000 sq ft",
        totalYears: 5,
        status: "pending" as const,
        totalAmount: 15000,
        paidAmount: 5000,
        pendingAmount: 10000,
        dueDate: "31 Mar 2024",
      },
    } as const;

    const fallbackProperty = propertyMap[id as 1 | 2 | 3] ?? propertyMap[1];

    // ✅ map numeric id -> propertyNo, then fetch real record
    const propertyNo = fallbackProperty.propertyNo;
    const propertyRecord = getPropertyById(propertyNo) ?? propertyRecords[0];

    const p = {
      propertyNo: propertyRecord.propertyNo,
      type: getPropertyText(propertyRecord.type, language),
      address: getPropertyText(propertyRecord.address, language),
      area: propertyRecord.area ?? "",
      totalYears: propertyRecord.totalYears ?? 0,
      status: (propertyRecord.status ?? "pending") as Status,
      totalAmount: propertyRecord.totalAmount ?? 0,
      paidAmount: propertyRecord.paidAmount ?? 0,
      pendingAmount: propertyRecord.pendingAmount ?? 0,
      dueDate: propertyRecord.dueDate ?? "",
    };


    const paymentHistory: Payment[] = [
      {
        year: "2024",
        period:
          language === "en"
            ? "April 2024 - March 2025"
            : language === "hi"
            ? "अप्रैल 2024 - मार्च 2025"
            : "एप्रिल 2024 - मार्च 2025",
        amount: p.totalAmount,
        paid: p.paidAmount,
        pending: p.pendingAmount,
        status: p.status,
        paidDate: p.status === "paid" ? "15 Apr 2024" : "—",
        receiptNo: "PTX-RCP-2024-001",
        paymentMode: language === "en" ? "Online" : language === "hi" ? "ऑनलाइन" : "ऑनलाइन",
      },
      {
        year: "2023",
        period:
          language === "en"
            ? "April 2023 - March 2024"
            : language === "hi"
            ? "अप्रैल 2023 - मार्च 2024"
            : "एप्रिल 2023 - मार्च 2024",
        amount: 11800,
        paid: 11800,
        pending: 0,
        status: "paid",
        paidDate: "20 Apr 2023",
        receiptNo: "PTX-RCP-2023-089",
        paymentMode: language === "en" ? "Cash" : language === "hi" ? "नकद" : "रोख",
      },
      {
        year: "2022",
        period:
          language === "en"
            ? "April 2022 - March 2023"
            : language === "hi"
            ? "अप्रैल 2022 - मार्च 2023"
            : "एप्रिल 2022 - मार्च 2023",
        amount: 11200,
        paid: 11200,
        pending: 0,
        status: "paid",
        paidDate: "25 Apr 2022",
        receiptNo: "PTX-RCP-2022-156",
        paymentMode: language === "en" ? "Online" : language === "hi" ? "ऑनलाइन" : "ऑनलाइन",
      },
    ];

    const totalPaid = paymentHistory.reduce((sum, x) => sum + x.paid, 0);

    return {
      title:
        language === "en"
          ? "Property Tax Details"
          : language === "hi"
          ? "संपत्ति कर विवरण"
          : "मालमत्ता कर तपशील",
      themeHeader: darkMode ? "bg-gray-800" : "bg-gradient-to-r from-rose-500 to-fuchsia-600",
      accentText: darkMode ? "text-pink-300" : "text-pink-600",
      currentYear: {
        year: "2024",
        totalAmount: p.totalAmount,
        paidAmount: p.paidAmount,
        pendingAmount: p.pendingAmount,
        status: p.status,
        dueDate: p.dueDate,
        upicId,
        propertyId: p.propertyNo,
        propertyType: p.type,
        propertyAddress: p.address,
        area: p.area,
        totalYears: p.totalYears,
      },
      paymentHistory,
      statistics: {
        totalPaid,
        totalYears: p.totalYears,
        onTimePayments: paymentHistory.filter((x) => x.status === "paid").length,
        averageAmount: Math.round(paymentHistory.reduce((s, x) => s + x.amount, 0) / paymentHistory.length),
      },
    };
  }

  // ✅ Water dummy
  if (serviceType === "waterConnection") {
    const id = connectionId ?? 1;

    return {
      title:
        language === "en"
          ? "Water Connection Details"
          : language === "hi"
          ? "जल कनेक्शन विवरण"
          : "पाणी कनेक्शन तपशील",
      themeHeader: darkMode ? "bg-gray-800" : "bg-gradient-to-r from-cyan-500 to-sky-600",
      accentText: darkMode ? "text-cyan-300" : "text-cyan-600",
      currentYear: {
        year: "2024",
        totalAmount: 2550,
        paidAmount: 2550,
        pendingAmount: 0,
        status: "paid" as const,
        connectionId: `WTR-2024-${String(78910 + id).padStart(5, "0")}`,
        connectionType: language === "en" ? "Domestic" : language === "hi" ? "घरेलू" : "घरगुती",
        meterNumber: `MTR-${String(45678 + id).padStart(5, "0")}`,
        averageConsumption: "12,000 L/month",
      },
      paymentHistory: [
        {
          year: "2024",
          period:
            language === "en"
              ? "Oct - Dec 2024"
              : language === "hi"
              ? "अक्टूबर - दिसंबर 2024"
              : "ऑक्टोबर - डिसेंबर 2024",
          amount: 850,
          paid: 850,
          pending: 0,
          status: "paid",
          paidDate: "05 Oct 2024",
          receiptNo: "WTR-RCP-2024-456",
          consumption: "11,500 L",
          paymentMode: language === "en" ? "Online" : language === "hi" ? "ऑनलाइन" : "ऑनलाइन",
        } as WaterPayment,
        {
          year: "2024",
          period:
            language === "en"
              ? "Jul - Sep 2024"
              : language === "hi"
              ? "जुलाई - सितंबर 2024"
              : "जुलै - सप्टेंबर 2024",
          amount: 900,
          paid: 900,
          pending: 0,
          status: "paid",
          paidDate: "08 Jul 2024",
          receiptNo: "WTR-RCP-2024-234",
          consumption: "12,800 L",
          paymentMode: language === "en" ? "Online" : language === "hi" ? "ऑनलाइन" : "ऑनलाइन",
        } as WaterPayment,
      ],
      statistics: {
        totalPaid: 1750,
        totalBills: 2,
        averageConsumption: "12,150 L",
        totalConsumption: "24,300 L",
      },
    };
  }

  // ✅ Trade dummy
  const id = licenseId ?? 1;

  return {
    title:
      language === "en"
        ? "Trade License Details"
        : language === "hi"
        ? "व्यापार लाइसेंस विवरण"
        : "व्यापार परवाना तपशील",
    themeHeader: darkMode ? "bg-gray-800" : "bg-gradient-to-r from-amber-500 to-orange-600",
    accentText: darkMode ? "text-amber-300" : "text-amber-600",
    currentYear: {
      year: "2024",
      totalAmount: 5000,
      paidAmount: 5000,
      pendingAmount: 0,
      status: "active" as const,
      licenseNo: `TRD-2024-${String(45678 + id).padStart(5, "0")}`,
      businessName:
        language === "en"
          ? "Sharma General Store"
          : language === "hi"
          ? "शर्मा जनरल स्टोर"
          : "शर्मा जनरल स्टोअर",
      businessType: language === "en" ? "Retail Shop" : language === "hi" ? "खुदरा दुकान" : "किरकोळ दुकान",
      issueDate: "01 Apr 2024",
      expiryDate: "31 Mar 2025",
    },
    paymentHistory: [
      {
        year: "2024",
        period:
          language === "en"
            ? "April 2024 - March 2025"
            : language === "hi"
            ? "अप्रैल 2024 - मार्च 2025"
            : "एप्रिल 2024 - मार्च 2025",
        amount: 5000,
        paid: 5000,
        pending: 0,
        status: "active",
        paidDate: "01 Apr 2024",
        receiptNo: "TRD-RCP-2024-789",
        licenseType: language === "en" ? "Annual Renewal" : language === "hi" ? "वार्षिक नवीनीकरण" : "वार्षिक नूतनीकरण",
        paymentMode: language === "en" ? "Online" : language === "hi" ? "ऑनलाइन" : "ऑनलाइन",
      } as TradePayment,
      {
        year: "2023",
        period:
          language === "en"
            ? "April 2023 - March 2024"
            : language === "hi"
            ? "अप्रैल 2023 - मार्च 2024"
            : "एप्रिल 2023 - मार्च 2024",
        amount: 4800,
        paid: 4800,
        pending: 0,
        status: "expired",
        paidDate: "05 Apr 2023",
        receiptNo: "TRD-RCP-2023-456",
        licenseType: language === "en" ? "Annual Renewal" : language === "hi" ? "वार्षिक नवीनीकरण" : "वार्षिक नूतनीकरण",
        paymentMode: language === "en" ? "Cash" : language === "hi" ? "नकद" : "रोख",
      } as TradePayment,
    ],
    statistics: {
      totalPaid: 9800,
      totalYears: 2,
      currentStatus: "Active",
    },
  };
}, [serviceType, language, darkMode, authUser, propertyId, connectionId, licenseId]);

  const years = useMemo(() => {
    const set = new Set<string>();
    data.paymentHistory.forEach((p: Payment) => set.add(p.year));
    return ["all", ...Array.from(set).sort((a, b) => Number(b) - Number(a))];
  }, [data.paymentHistory]);

  const filteredHistory = useMemo(() => {
    if (selectedYear === "all") return data.paymentHistory;
    return data.paymentHistory.filter((p: Payment) => p.year === selectedYear);
  }, [data.paymentHistory, selectedYear]);

  const badgeCfg = statusBadgeConfig(language);

  const getStatusBadge = (status: Status) => {
    const cfg = badgeCfg[status] ?? badgeCfg.pending;
    const Icon = cfg.Icon;
    return (
      <Badge className={`${cfg.cls} inline-flex items-center gap-1`}>
        <Icon className="w-3 h-3" />
        {cfg.text}
      </Badge>
    );
  };

  const ServiceIcon = serviceType === "propertyTax" ? Home : serviceType === "waterConnection" ? Droplet : BadgeCheck;

  return (
    <div className={`w-full ${darkMode ? "text-white" : "text-gray-900"}`}>
      {/* Header */}
      <div className={`p-6 border-b ${darkMode ? "border-gray-700" : "border-gray-200"} ${data.themeHeader}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            {onBack ? (
              <Button
                onClick={onBack}
                variant="ghost"
                className={`text-white hover:bg-white/10`}
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                {language === "en" ? "Back" : language === "hi" ? "वापस" : "मागे"}
              </Button>
            ) : null}

            <div className={`p-3 rounded-lg ${darkMode ? "bg-white/10" : "bg-white/20"}`}>
              <ServiceIcon className={`w-8 h-8 ${darkMode ? "text-white" : "text-white"}`} />
            </div>

            <div>
              <h2 className="text-2xl font-bold text-white">{data.title}</h2>
              <p className={`text-sm mt-1 ${darkMode ? "text-white/80" : "text-white/80"}`}>
                {language === "en"
                  ? "Complete payment history and details"
                  : language === "hi"
                  ? "संपूर्ण भुगतान इतिहास और विवरण"
                  : "संपूर्ण देयक इतिहास आणि तपशील"}
              </p>
            </div>
          </div>

          <Button
            onClick={onClose}
            variant="ghost"
            size="icon"
            className={`rounded-full text-white hover:bg-white/10`}
          >
            ✕
          </Button>
        </div>
      </div>

      {/* Body */}
      <ScrollArea className="h-[70vh]">
        <div className="p-6 space-y-6">
          {/* Current Year Summary */}
          <div
            className={`rounded-xl p-6 ${
              darkMode ? "bg-gradient-to-br from-gray-800 to-gray-800/50" : "bg-gradient-to-br from-teal-50 to-blue-50"
            }`}
          >
            <div className="flex items-center justify-between gap-3 mb-4">
              <h3 className={`text-lg font-semibold ${darkMode ? "text-white" : "text-gray-900"}`}>
                {language === "en" ? `Current Year Summary (${data.currentYear.year})` : language === "hi" ? `वर्तमान वर्ष सारांश (${data.currentYear.year})` : `वर्तमान वर्ष सारांश (${data.currentYear.year})`}
              </h3>

              <div className="flex items-center gap-2">
                <span className={`text-sm ${darkMode ? "text-gray-300" : "text-gray-600"}`}>
                  {language === "en" ? "Year" : language === "hi" ? "वर्ष" : "वर्ष"}
                </span>
                <select
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(e.target.value)}
                  className={`rounded-md border px-2 py-1 text-sm ${
                    darkMode ? "bg-gray-800 border-gray-700 text-white" : "bg-white border-gray-200"
                  }`}
                >
                  {years.map((y) => (
                    <option key={y} value={y}>
                      {y === "all" ? (language === "en" ? "All" : language === "hi" ? "सभी" : "सर्व") : y}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className={`p-4 rounded-lg ${darkMode ? "bg-gray-700/50" : "bg-white/80"}`}>
                <p className={`text-sm ${darkMode ? "text-gray-400" : "text-gray-600"} mb-1`}>
                  {language === "en" ? "Total Amount" : language === "hi" ? "कुल राशि" : "एकूण रक्कम"}
                </p>
                <p className={`text-2xl font-bold ${darkMode ? "text-white" : "text-gray-900"}`}>
                  ₹{data.currentYear.totalAmount.toLocaleString()}
                </p>
              </div>

              <div className={`p-4 rounded-lg ${darkMode ? "bg-gray-700/50" : "bg-white/80"}`}>
                <p className={`text-sm ${darkMode ? "text-gray-400" : "text-gray-600"} mb-1`}>
                  {language === "en" ? "Paid Amount" : language === "hi" ? "भुगतान राशि" : "भरलेली रक्कम"}
                </p>
                <p className="text-2xl font-bold text-emerald-600">
                  ₹{data.currentYear.paidAmount.toLocaleString()}
                </p>
              </div>

              <div className={`p-4 rounded-lg ${darkMode ? "bg-gray-700/50" : "bg-white/80"}`}>
                <p className={`text-sm ${darkMode ? "text-gray-400" : "text-gray-600"} mb-1`}>
                  {language === "en" ? "Pending Amount" : language === "hi" ? "लंबित राशि" : "प्रलंबित रक्कम"}
                </p>
                <p className={`text-2xl font-bold ${data.currentYear.pendingAmount > 0 ? "text-red-600" : "text-emerald-600"}`}>
                  ₹{data.currentYear.pendingAmount.toLocaleString()}
                </p>
              </div>

              <div className={`p-4 rounded-lg ${darkMode ? "bg-gray-700/50" : "bg-white/80"}`}>
                <p className={`text-sm ${darkMode ? "text-gray-400" : "text-gray-600"} mb-1`}>
                  {language === "en" ? "Status" : language === "hi" ? "स्थिति" : "स्थिती"}
                </p>
                <div className="mt-2">{getStatusBadge(data.currentYear.status)}</div>
              </div>
            </div>

            {/* Additional Info */}
            <div className={`mt-4 pt-4 border-t ${darkMode ? "border-gray-700" : "border-gray-200"} grid grid-cols-1 md:grid-cols-2 gap-3`}>
              {Object.entries(data.currentYear)
                .filter(([key]) => !["year", "totalAmount", "paidAmount", "pendingAmount", "status"].includes(key))
                .map(([key, value]) => (
                  <div key={key} className="flex justify-between items-center gap-3">
                    <span className={`text-sm ${darkMode ? "text-gray-400" : "text-gray-600"}`}>
                      {key.replace(/([A-Z])/g, " $1").replace(/^./, (s) => s.toUpperCase())}:
                    </span>
                    <span className={`text-sm font-medium ${darkMode ? "text-white" : "text-gray-900"} text-right`}>
                      {String(value)}
                    </span>
                  </div>
                ))}
            </div>
          </div>

          {/* Statistics */}
          <div className={`rounded-xl p-6 ${darkMode ? "bg-gray-800" : "bg-gray-50"}`}>
            <h3 className={`text-lg font-semibold mb-4 flex items-center gap-2 ${darkMode ? "text-white" : "text-gray-900"}`}>
              <TrendingUp className="w-5 h-5 text-teal-600" />
              {language === "en" ? "Statistics" : language === "hi" ? "सांख्यिकी" : "सांख्यिकी"}
            </h3>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {Object.entries(data.statistics).map(([key, value]) => {
                const k = key.toLowerCase();
                const isMoney = k.includes("paid") || k.includes("amount");
                return (
                  <div key={key} className={`p-4 rounded-lg ${darkMode ? "bg-gray-700" : "bg-white"} text-center`}>
                    <p className={`text-2xl font-bold ${darkMode ? "text-teal-400" : "text-teal-600"} mb-1`}>
                      {typeof value === "number" && isMoney ? `₹${value.toLocaleString()}` : String(value)}
                    </p>
                    <p className={`text-xs ${darkMode ? "text-gray-400" : "text-gray-600"}`}>
                      {key.replace(/([A-Z])/g, " $1").replace(/^./, (s) => s.toUpperCase())}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Payment History */}
          <div>
            <h3 className={`text-lg font-semibold mb-4 ${darkMode ? "text-white" : "text-gray-900"}`}>
              {language === "en" ? "Payment History" : language === "hi" ? "भुगतान इतिहास" : "देयक इतिहास"}
            </h3>

            <div className="space-y-3">
              {filteredHistory.map((payment: Payment, index: number) => (
                <div
                  key={index}
                  className={`rounded-lg border p-4 transition-all hover:shadow-md ${
                    darkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200 hover:border-teal-300"
                  }`}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg ${darkMode ? "bg-teal-500/20" : "bg-teal-50"}`}>
                        <Receipt className={`w-5 h-5 ${darkMode ? "text-teal-400" : "text-teal-600"}`} />
                      </div>
                      <div>
                        <h4 className={`font-semibold ${darkMode ? "text-white" : "text-gray-900"}`}>
                          {payment.period}
                        </h4>
                        <p className={`text-sm ${darkMode ? "text-gray-400" : "text-gray-600"}`}>
                          {language === "en" ? "Receipt:" : language === "hi" ? "रसीद:" : "पावती:"} {payment.receiptNo}
                        </p>
                      </div>
                    </div>

                    {getStatusBadge(payment.status)}
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div>
                      <p className={`text-xs ${darkMode ? "text-gray-400" : "text-gray-600"} mb-1`}>
                        {language === "en" ? "Amount" : language === "hi" ? "राशि" : "रक्कम"}
                      </p>
                      <p className={`font-semibold ${darkMode ? "text-white" : "text-gray-900"}`}>
                        ₹{payment.amount.toLocaleString()}
                      </p>
                    </div>

                    <div>
                      <p className={`text-xs ${darkMode ? "text-gray-400" : "text-gray-600"} mb-1`}>
                        {language === "en" ? "Paid" : language === "hi" ? "भुगतान" : "भरलेले"}
                      </p>
                      <p className="font-semibold text-emerald-600">
                        ₹{payment.paid.toLocaleString()}
                      </p>
                    </div>

                    <div>
                      <p className={`text-xs ${darkMode ? "text-gray-400" : "text-gray-600"} mb-1`}>
                        {language === "en" ? "Payment Date" : language === "hi" ? "भुगतान तिथि" : "देयक तारीख"}
                      </p>
                      <p className={`font-semibold ${darkMode ? "text-white" : "text-gray-900"}`}>
                        {payment.paidDate}
                      </p>
                    </div>

                    <div>
                      <p className={`text-xs ${darkMode ? "text-gray-400" : "text-gray-600"} mb-1`}>
                        {language === "en" ? "Mode" : language === "hi" ? "मोड" : "पद्धत"}
                      </p>
                      <p className={`font-semibold ${darkMode ? "text-white" : "text-gray-900"}`}>
                        {payment.paymentMode}
                      </p>
                    </div>
                  </div>

                  {"consumption" in payment && (
                    <div className={`mt-3 pt-3 border-t ${darkMode ? "border-gray-700" : "border-gray-200"}`}>
                      <div className="flex items-center gap-2">
                        <Droplet className="w-4 h-4 text-blue-500" />
                        <span className={`text-sm ${darkMode ? "text-gray-400" : "text-gray-600"}`}>
                          {language === "en" ? "Consumption:" : language === "hi" ? "खपत:" : "वापर:"}
                        </span>
                        <span className={`text-sm font-semibold ${darkMode ? "text-white" : "text-gray-900"}`}>
                          {payment.consumption}
                        </span>
                      </div>
                    </div>
                  )}

                  {"licenseType" in payment && (
                    <div className={`mt-3 pt-3 border-t ${darkMode ? "border-gray-700" : "border-gray-200"}`}>
                      <div className="flex items-center gap-2">
                        <BadgeCheck className="w-4 h-4 text-amber-500" />
                        <span className={`text-sm ${darkMode ? "text-gray-400" : "text-gray-600"}`}>
                          {language === "en" ? "Type:" : language === "hi" ? "प्रकार:" : "प्रकार:"}
                        </span>
                        <span className={`text-sm font-semibold ${darkMode ? "text-white" : "text-gray-900"}`}>
                          {payment.licenseType}
                        </span>
                      </div>
                    </div>
                  )}

                  <div className="mt-3 flex gap-2">
                    <Button size="sm" variant="outline" className={darkMode ? "border-gray-600 text-gray-300 hover:bg-gray-700" : ""}>
                      <Eye className="w-4 h-4 mr-2" />
                      {language === "en" ? "View Details" : language === "hi" ? "विवरण देखें" : "तपशील पहा"}
                    </Button>
                    <Button size="sm" variant="outline" className={darkMode ? "border-gray-600 text-gray-300 hover:bg-gray-700" : ""}>
                      <Download className="w-4 h-4 mr-2" />
                      {language === "en" ? "Download Receipt" : language === "hi" ? "रसीद डाउनलोड करें" : "पावती डाउनलोड करा"}
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </ScrollArea>
    </div>
  );
}
