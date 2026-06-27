"use client";

import { useMemo, useState } from "react";
import { BadgeCheck, MapPin, ChevronRight, Store } from "lucide-react";
import { Language } from"@/types/service.types";
import { Badge } from "@/components/common/Badge";
import { Button } from "@/components/common/Button";
import { DetailedDashboardView } from "./DetailedDashboardView";

interface TradeLicenseListViewProps {
  language: Language;
  darkMode?: boolean;
  authUser?: {
    userType: "user" | "admin";
    userData: any;
  } | null;
  onClose: () => void;
}

type LicenseStatus = "active" | "expired" | "pending";

type LicenseRow = {
  id: number;
  licenseNo: string;
  businessName: string;
  businessType: string;
  address: string;
  currentYearFee: number;
  status: LicenseStatus;
  issueDate: string;
  expiryDate: string;
  totalYears: number;
};

export function TradeLicenseListView({
  language,
  darkMode = false,
  authUser,
  onClose,
}: TradeLicenseListViewProps) {
  const [selectedLicense, setSelectedLicense] = useState<number | null>(null);

  // ✅ Dummy data
  const licenses: LicenseRow[] = useMemo(
    () => [
      {
        id: 1,
        licenseNo: "TRD-2024-45678",
        businessName:
          language === "en"
            ? "Sharma General Store"
            : language === "hi"
            ? "शर्मा जनरल स्टोर"
            : "शर्मा जनरल स्टोअर",
        businessType:
          language === "en"
            ? "Retail Shop"
            : language === "hi"
            ? "खुदरा दुकान"
            : "किरकोळ दुकान",
        address:
          language === "en"
            ? "Shop 12, Main Market, Akola"
            : language === "hi"
            ? "दुकान 12, मुख्य बाजार, अकोला"
            : "दुकान 12, मुख्य बाजार, अकोला",
        currentYearFee: 5000,
        status: "active",
        issueDate: "01 Apr 2024",
        expiryDate: "31 Mar 2025",
        totalYears: 3,
      },
      {
        id: 2,
        licenseNo: "TRD-2024-45679",
        businessName:
          language === "en"
            ? "Patil Restaurant"
            : language === "hi"
            ? "पाटिल रेस्टोरेंट"
            : "पाटील रेस्टॉरंट",
        businessType:
          language === "en"
            ? "Restaurant"
            : language === "hi"
            ? "रेस्टोरेंट"
            : "रेस्टॉरंट",
        address:
          language === "en"
            ? "Plot 45, Civil Lines, Akola"
            : language === "hi"
            ? "प्लॉट 45, सिविल लाइन्स, अकोला"
            : "प्लॉट 45, सिविल लाइन्स, अकोला",
        currentYearFee: 7500,
        status: "active",
        issueDate: "15 Apr 2024",
        expiryDate: "14 Apr 2025",
        totalYears: 5,
      },
      {
        id: 3,
        licenseNo: "TRD-2023-34567",
        businessName:
          language === "en"
            ? "Tech Solutions Ltd"
            : language === "hi"
            ? "टेक सॉल्यूशंस लि."
            : "टेक सोल्यूशन्स लि.",
        businessType:
          language === "en"
            ? "IT Services"
            : language === "hi"
            ? "आईटी सेवाएं"
            : "आयटी सेवा",
        address:
          language === "en"
            ? "Office 201, IT Park, Akola"
            : language === "hi"
            ? "कार्यालय 201, आईटी पार्क, अकोला"
            : "कार्यालय 201, आयटी पार्क, अकोला",
        currentYearFee: 10000,
        status: "expired",
        issueDate: "01 Apr 2023",
        expiryDate: "31 Mar 2024",
        totalYears: 2,
      },
    ],
    [language]
  );

  const getStatusBadge = (status: LicenseStatus) => {
    const config = {
      active: {
        className:
          "bg-emerald-100 text-emerald-700 border border-emerald-200",
        text: language === "en" ? "Active" : language === "hi" ? "सक्रिय" : "सक्रिय",
      },
      expired: {
        className: "bg-red-100 text-red-700 border border-red-200",
        text: language === "en" ? "Expired" : language === "hi" ? "समाप्त" : "समाप्त",
      },
      pending: {
        className:
          "bg-amber-100 text-amber-700 border border-amber-200",
        text: language === "en" ? "Pending" : language === "hi" ? "लंबित" : "प्रलंबित",
      },
    };

    return config[status] ?? config.pending;
  };

  // ✅ Details screen inside same modal
  if (selectedLicense !== null) {
    return (
      <DetailedDashboardView
        serviceType="tradeLicense"
        language={language}
        darkMode={darkMode}
        authUser={authUser}
        licenseId={selectedLicense}
        onClose={onClose} // closes the whole modal
        onBack={() => setSelectedLicense(null)} // back to list
      />
    );
  }

  return (
    <div className={`w-full ${darkMode ? "text-white" : "text-gray-900"}`}>
      {/* Header */}
      <div
        className={`p-6 border-b rounded-t-2xl ${
          darkMode
            ? "bg-gray-800 border-gray-700"
            : "bg-gradient-to-r from-yellow-100 via-amber-100 to-orange-100 border-gray-200"
        }`}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div
              className={`p-3 rounded-lg ${
                darkMode ? "bg-amber-500/20" : "bg-white/60 backdrop-blur-sm"
              }`}
            >
              <BadgeCheck
                className={`w-8 h-8 ${
                  darkMode ? "text-amber-400" : "text-amber-600"
                }`}
              />
            </div>

            <div>
              <h2
                className={`text-2xl font-bold ${
                  darkMode ? "text-white" : "text-gray-900"
                }`}
              >
                {language === "en"
                  ? "My Trade Licenses"
                  : language === "hi"
                  ? "मेरे व्यापार लाइसेंस"
                  : "माझे व्यापार परवाने"}
              </h2>
              <p
                className={`text-sm mt-1 ${
                  darkMode ? "text-gray-300" : "text-gray-700"
                }`}
              >
                {language === "en"
                  ? `${licenses.length} licenses found`
                  : language === "hi"
                  ? `${licenses.length} लाइसेंस मिले`
                  : `${licenses.length} परवाने सापडले`}
              </p>
            </div>
          </div>

          <Button
            onClick={onClose}
            variant="ghost"
            size="icon"
            className={`rounded-full ${
              darkMode
                ? "text-white hover:bg-gray-700"
                : "text-gray-900 hover:bg-white/60"
            }`}
          >
            ✕
          </Button>
        </div>
      </div>

      {/* List */}
      <div className="p-6 space-y-4 overflow-y-auto">
        {licenses.map((license) => {
          const status = getStatusBadge(license.status);

          return (
            <div
              key={license.id}
              className={`rounded-xl border p-6 transition-all hover:shadow-lg ${
                darkMode
                  ? "bg-gray-800 border-gray-700 hover:border-amber-500"
                  : "bg-gradient-to-br from-amber-50 to-orange-50 border-gray-200 hover:border-amber-400"
              }`}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div
                    className={`p-3 rounded-lg ${
                      darkMode ? "bg-amber-500/20" : "bg-white"
                    }`}
                  >
                    <Store
                      className={`w-6 h-6 ${
                        darkMode ? "text-amber-400" : "text-amber-600"
                      }`}
                    />
                  </div>

                  <div>
                    <h3
                      className={`text-lg font-semibold ${
                        darkMode ? "text-white" : "text-gray-900"
                      }`}
                    >
                      {license.businessName}
                    </h3>
                    <p
                      className={`text-sm ${
                        darkMode ? "text-gray-400" : "text-gray-600"
                      }`}
                    >
                      {language === "en"
                        ? "License No:"
                        : language === "hi"
                        ? "लाइसेंस नं:"
                        : "परवाना क्र:"}{" "}
                      {license.licenseNo}
                    </p>
                  </div>
                </div>

                <Badge className={status.className}>{status.text}</Badge>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div className="flex items-start gap-2">
                  <Store
                    className={`w-4 h-4 mt-1 ${
                      darkMode ? "text-gray-400" : "text-gray-600"
                    }`}
                  />
                  <div>
                    <p
                      className={`text-xs ${
                        darkMode ? "text-gray-400" : "text-gray-600"
                      } mb-1`}
                    >
                      {language === "en"
                        ? "Business Type"
                        : language === "hi"
                        ? "व्यापार प्रकार"
                        : "व्यवसाय प्रकार"}
                    </p>
                    <p
                      className={`text-sm font-medium ${
                        darkMode ? "text-white" : "text-gray-900"
                      }`}
                    >
                      {license.businessType}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-2">
                  <MapPin
                    className={`w-4 h-4 mt-1 ${
                      darkMode ? "text-gray-400" : "text-gray-600"
                    }`}
                  />
                  <div>
                    <p
                      className={`text-xs ${
                        darkMode ? "text-gray-400" : "text-gray-600"
                      } mb-1`}
                    >
                      {language === "en"
                        ? "Address"
                        : language === "hi"
                        ? "पता"
                        : "पत्ता"}
                    </p>
                    <p
                      className={`text-sm font-medium ${
                        darkMode ? "text-white" : "text-gray-900"
                      }`}
                    >
                      {license.address}
                    </p>
                  </div>
                </div>
              </div>

              <div
                className={`grid grid-cols-3 gap-4 pt-4 border-t ${
                  darkMode ? "border-gray-700" : "border-gray-200"
                }`}
              >
                <div>
                  <p
                    className={`text-xs ${
                      darkMode ? "text-gray-400" : "text-gray-600"
                    } mb-1`}
                  >
                    {language === "en"
                      ? "Annual Fee"
                      : language === "hi"
                      ? "वार्षिक शुल्क"
                      : "वार्षिक शुल्क"}
                  </p>
                  <p
                    className={`text-lg font-bold ${
                      darkMode ? "text-amber-400" : "text-amber-600"
                    }`}
                  >
                    ₹{license.currentYearFee.toLocaleString()}
                  </p>
                </div>

                <div>
                  <p
                    className={`text-xs ${
                      darkMode ? "text-gray-400" : "text-gray-600"
                    } mb-1`}
                  >
                    {language === "en"
                      ? "Expiry Date"
                      : language === "hi"
                      ? "समाप्ति तिथि"
                      : "समाप्ती तारीख"}
                  </p>
                  <p
                    className={`text-sm font-medium ${
                      darkMode ? "text-white" : "text-gray-900"
                    }`}
                  >
                    {license.expiryDate}
                  </p>
                </div>

                <div>
                  <p
                    className={`text-xs ${
                      darkMode ? "text-gray-400" : "text-gray-600"
                    } mb-1`}
                  >
                    {language === "en"
                      ? "Total Years"
                      : language === "hi"
                      ? "कुल वर्ष"
                      : "एकूण वर्षे"}
                  </p>
                  <p
                    className={`text-sm font-medium ${
                      darkMode ? "text-white" : "text-gray-900"
                    }`}
                  >
                    {license.totalYears}{" "}
                    {language === "en" ? "years" : language === "hi" ? "वर्ष" : "वर्षे"}
                  </p>
                </div>
              </div>

              {/* ✅ ONLY View Details opens */}
              <div className="mt-4 flex items-center justify-end">
                <button
                  type="button"
                  onClick={() => setSelectedLicense(license.id)}
                  className={`flex items-center gap-2 text-sm font-medium ${
                    darkMode
                      ? "text-amber-300 hover:text-amber-200"
                      : "text-amber-600 hover:text-amber-700"
                  }`}
                >
                  {language === "en"
                    ? "View Details"
                    : language === "hi"
                    ? "विवरण देखें"
                    : "तपशील पहा"}
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
