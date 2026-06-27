
"use client";

import { useMemo, useState } from "react";
import { Home, MapPin, ChevronRight } from "lucide-react";
import { Language } from "@/types/service.types";
import { Badge } from "@/components/common/Badge";
import { Button } from "@/components/common/Button";
import { DetailedDashboardView } from "@/components/DetailedDashboardView";
import { getPropertyText, propertyRecords, type PropertyStatus } from "@/data/properties";

interface PropertyListViewProps {
  language: Language;
  darkMode?: boolean;
  authUser?: {
    userType: "user" | "admin";
    userData: any;
  } | null;
  onClose: () => void;
}

type PropertyRow = {
  totalAmount: number;
  id: number;
  propertyId: string;
  propertyType: string;
  address: string;
  area: string;
  currentYearTax: number;
  status: PropertyStatus;
  lastPayment: string;
  totalYears: number;
};

export function PropertyListView({
  language,
  darkMode = false,
  authUser,
  onClose,
}: PropertyListViewProps) {
  const [selectedProperty, setSelectedProperty] = useState<number | null>(null);

  const fallbackProperties: PropertyRow[] = useMemo(
    () => [
      {
        id: 1,
        propertyId: "PTX-2024-001234",
        propertyType:
          language === "en" ? "Residential" : language === "hi" ? "आवासीय" : "निवासी",
        address:
          language === "en"
            ? "Plot 123, Sector 15, Akola"
            : language === "hi"
            ? "प्लॉट 123, सेक्टर 15, अकोला"
            : "प्लॉट 123, सेक्टर 15, अकोला",
        area: language === "en" ? "1,500 sq ft" : language === "hi" ? "1,500 वर्ग फुट" : "1,500 चौरस फूट",
        currentYearTax: 12500,
        status: "paid",
        lastPayment: language === "en" ? "15 Apr 2024" : language === "hi" ? "15 अप्रैल 2024" : "15 एप्रिल 2024",
        totalYears: 4,
        totalAmount: 12500,
      },
      {
        id: 2,
        propertyId: "PTX-2024-002456",
        propertyType:
          language === "en" ? "Commercial" : language === "hi" ? "व्यावसायिक" : "व्यावसायिक",
        address:
          language === "en"
            ? "Shop 45, Market Road, Akola"
            : language === "hi"
            ? "दुकान 45, मार्केट रोड, अकोला"
            : "दुकान 45, मार्केट रोड, अकोला",
        area: language === "en" ? "800 sq ft" : language === "hi" ? "800 वर्ग फुट" : "800 चौरस फूट",
        currentYearTax: 8500,
        status: "paid",
        lastPayment: language === "en" ? "20 Apr 2024" : language === "hi" ? "20 अप्रैल 2024" : "20 एप्रिल 2024",
        totalYears: 3,
        totalAmount: 12500,
      },
      {
        id: 3,
        propertyId: "PTX-2024-003789",
        propertyType:
          language === "en" ? "Residential" : language === "hi" ? "आवासीय" : "निवासी",
        address:
          language === "en"
            ? "Plot 456, Sector 22, Akola"
            : language === "hi"
            ? "प्लॉट 456, सेक्टर 22, अकोला"
            : "प्लॉट 456, सेक्टर 22, अकोला",
        area: language === "en" ? "2,000 sq ft" : language === "hi" ? "2,000 वर्ग फुट" : "2,000 चौरस फूट",
        currentYearTax: 15000,
        status: "pending",
        lastPayment: language === "en" ? "10 Mar 2024" : language === "hi" ? "10 मार्च 2024" : "10 मार्च 2024",
        totalYears: 5,
        totalAmount: 12500,
      },
    ],
    [language]
  );

 const properties: PropertyRow[] = useMemo(() => {
  if (!propertyRecords.length) return fallbackProperties;

  return propertyRecords.map((property, index) => ({
    // PropertyRecord has no id, so use index-based id for UI selection
    id: index + 1,

    // you’re using propertyNo as ID everywhere (matches your fallback propertyId)
    propertyId: property.propertyNo,

    // PropertyRecord uses `type` (multilingual), not `propertyType`
    propertyType: getPropertyText(property.type, language),

    // address is multilingual
    address: getPropertyText(property.address, language),

    // area is plain string (not multilingual)
    area: property.area ?? "",

    // no currentYearTax in your data; use totalAmount as current tax
    currentYearTax: property.totalAmount ?? 0,

    status: property.status ?? "pending",

    // no lastPayment in PropertyRecord; keep placeholder (or compute from your payments later)
    lastPayment: "—",

    totalYears: property.totalYears ?? 0,

    // required by PropertyRow
    totalAmount: property.totalAmount ?? 0,
  }));
}, [fallbackProperties, language]);


  const getStatusBadge = (status: PropertyStatus) => {
    if (status === "paid") {
      return {
        className: "bg-emerald-100 text-emerald-700 border border-emerald-200",
        text: language === "en" ? "Paid" : language === "hi" ? "भुगतान" : "भरलेले",
      };
    }
    return {
      className: "bg-amber-100 text-amber-700 border border-amber-200",
      text: language === "en" ? "Pending" : language === "hi" ? "लंबित" : "प्रलंबित",
    };
  };

  // ✅ When user clicks "View Details", show detailed view inside same modal
  if (selectedProperty !== null) {
    return (
      <DetailedDashboardView
        serviceType="propertyTax"
        language={language}
        darkMode={darkMode}
        authUser={authUser}
        propertyId={selectedProperty}
        onClose={onClose}
        onBack={() => setSelectedProperty(null)}
      />
    );
  }

  return (
    <div className={`w-full ${darkMode ? "text-white" : "text-gray-900"}`}>
      {/* Header (like Figma) */}
      <div
        className={`p-6 border-b rounded-t-2xl ${
          darkMode
            ? "bg-gray-800 border-gray-700"
            : "bg-gradient-to-r from-rose-100 via-pink-100 to-fuchsia-100 border-gray-200"
        }`}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className={`p-3 rounded-lg ${darkMode ? "bg-pink-500/20" : "bg-white/60 backdrop-blur-sm"}`}>
              <Home className={`w-8 h-8 ${darkMode ? "text-pink-400" : "text-pink-600"}`} />
            </div>

            <div>
              <h2 className={`text-2xl font-bold ${darkMode ? "text-white" : "text-gray-900"}`}>
                {language === "en" ? "My Properties" : language === "hi" ? "मेरी संपत्तियां" : "माझी मालमत्ता"}
              </h2>
              <p className={`text-sm mt-1 ${darkMode ? "text-gray-300" : "text-gray-700"}`}>
                {language === "en"
                  ? `${properties.length} properties registered`
                  : language === "hi"
                  ? `${properties.length} संपत्तियां पंजीकृत`
                  : `${properties.length} मालमत्ता नोंदणीकृत`}
              </p>
            </div>
          </div>

          <Button
            onClick={onClose}
            variant="ghost"
            size="icon"
            className={`rounded-full ${darkMode ? "text-white hover:bg-gray-700" : "text-gray-900 hover:bg-white/60"}`}
          >
            ✕
          </Button>
        </div>
      </div>

      {/* List */}
      <div className="p-6 space-y-4 overflow-y-auto">
        {properties.map((property) => {
          const status = getStatusBadge(property.status);

          return (
            <div
              key={property.id}
              className={`rounded-xl border p-6 transition-all hover:shadow-lg ${
                darkMode
                  ? "bg-gray-800 border-gray-700 hover:border-pink-500"
                  : "bg-gradient-to-br from-pink-50 to-purple-50 border-gray-200 hover:border-pink-400"
              }`}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className={`p-3 rounded-lg ${darkMode ? "bg-pink-500/20" : "bg-white"}`}>
                    <Home className={`w-6 h-6 ${darkMode ? "text-pink-400" : "text-pink-600"}`} />
                  </div>

                  <div>
                    <h3 className={`text-lg font-semibold ${darkMode ? "text-white" : "text-gray-900"}`}>
                      {property.propertyType}
                    </h3>
                    <p className={`text-sm ${darkMode ? "text-gray-400" : "text-gray-600"}`}>
                      {language === "en" ? "Property ID:" : language === "hi" ? "संपत्ति आईडी:" : "मालमत्ता आयडी:"}{" "}
                      {property.propertyId}
                    </p>
                  </div>
                </div>

                <Badge className={status.className}>{status.text}</Badge>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div className="flex items-start gap-2">
                  <MapPin className={`w-4 h-4 mt-1 ${darkMode ? "text-gray-400" : "text-gray-600"}`} />
                  <div>
                    <p className={`text-xs ${darkMode ? "text-gray-400" : "text-gray-600"} mb-1`}>
                      {language === "en" ? "Address" : language === "hi" ? "पता" : "पत्ता"}
                    </p>
                    <p className={`text-sm font-medium ${darkMode ? "text-white" : "text-gray-900"}`}>
                      {property.address}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-2">
                  <Home className={`w-4 h-4 mt-1 ${darkMode ? "text-gray-400" : "text-gray-600"}`} />
                  <div>
                    <p className={`text-xs ${darkMode ? "text-gray-400" : "text-gray-600"} mb-1`}>
                      {language === "en" ? "Area" : language === "hi" ? "क्षेत्रफल" : "क्षेत्रफळ"}
                    </p>
                    <p className={`text-sm font-medium ${darkMode ? "text-white" : "text-gray-900"}`}>
                      {property.area}
                    </p>
                  </div>
                </div>
              </div>

              <div className={`grid grid-cols-3 gap-4 pt-4 border-t ${darkMode ? "border-gray-700" : "border-gray-200"}`}>
                <div>
                  <p className={`text-xs ${darkMode ? "text-gray-400" : "text-gray-600"} mb-1`}>
                    {language === "en" ? "Current Year Tax" : language === "hi" ? "वर्तमान वर्ष कर" : "वर्तमान वर्ष कर"}
                  </p>
                  <p className={`text-lg font-bold ${darkMode ? "text-pink-400" : "text-pink-600"}`}>
                    ₹{Number(property.totalAmount ?? 0).toLocaleString("en-IN")}
                  </p>
                </div>

                <div>
                  <p className={`text-xs ${darkMode ? "text-gray-400" : "text-gray-600"} mb-1`}>
                    {language === "en" ? "Last Payment" : language === "hi" ? "अंतिम भुगतान" : "शेवटचे देयक"}
                  </p>
                  <p className={`text-sm font-medium ${darkMode ? "text-white" : "text-gray-900"}`}>
                    {property.lastPayment}
                  </p>
                </div>

                <div>
                  <p className={`text-xs ${darkMode ? "text-gray-400" : "text-gray-600"} mb-1`}>
                    {language === "en" ? "Total Years" : language === "hi" ? "कुल वर्ष" : "एकूण वर्षे"}
                  </p>
                  <p className={`text-sm font-medium ${darkMode ? "text-white" : "text-gray-900"}`}>
                    {property.totalYears} {language === "en" ? "years" : language === "hi" ? "वर्ष" : "वर्षे"}
                  </p>
                </div>
              </div>

              {/* ✅ Only this click opens details (like you asked) */}
              <div className="mt-4 flex items-center justify-end">
                <button
                  type="button"
                  onClick={() => setSelectedProperty(property.id)}
                  className={`flex items-center gap-2 text-sm font-medium ${
                    darkMode ? "text-pink-300 hover:text-pink-200" : "text-pink-600 hover:text-pink-700"
                  }`}
                >
                  {language === "en" ? "View Details" : language === "hi" ? "विवरण देखें" : "तपशील पहा"}
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
