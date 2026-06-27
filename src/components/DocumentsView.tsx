"use client";

import { useState } from "react";
import {
  X,
  FileText,
  Download,
  Eye,
  CheckCircle,
  Clock,
  Upload,
  Search,
  type LucideIcon,
} from "lucide-react";

import { Language } from "@/types/service.types";
import { AuthUserData } from "@/types/safe";
import { Button } from "@/components/common/Button";
import { Badge } from "@/components/common/Badge";

type DocumentStatus = "verified" | "pending";

type DocumentItem = {
  id: number;
  name: string;
  category: string;
  uploadDate: string;
  size: string;
  status: DocumentStatus;
  fileType: string;
};

type StatusBadgeConfig = {
  className: string;
  icon: LucideIcon;
  text: string;
};

interface DocumentsViewProps {
  language: Language;
  darkMode?: boolean;
  authUser?: {
    userType: "user" | "admin";
    userData: AuthUserData;
  } | null;
  onClose: () => void;
}

export function DocumentsView(props: DocumentsViewProps) {
  const { language, darkMode = false, onClose } = props;
  const [searchQuery, setSearchQuery] = useState("");

  // ✅ Dummy documents data
  const documents: DocumentItem[] = [
    {
      id: 1,
      name: language === "en" ? "Aadhaar Card" : language === "hi" ? "आधार कार्ड" : "आधार कार्ड",
      category: language === "en" ? "Identity Proof" : language === "hi" ? "पहचान प्रमाण" : "ओळख पुरावा",
      uploadDate: "15 Nov 2024",
      size: "245 KB",
      status: "verified",
      fileType: "PDF",
    },
    {
      id: 2,
      name: language === "en" ? "PAN Card" : language === "hi" ? "पैन कार्ड" : "पॅन कार्ड",
      category: language === "en" ? "Identity Proof" : language === "hi" ? "पहचान प्रमाण" : "ओळख पुरावा",
      uploadDate: "15 Nov 2024",
      size: "189 KB",
      status: "verified",
      fileType: "PDF",
    },
    {
      id: 3,
      name:
        language === "en"
          ? "Property Tax Receipt 2024"
          : language === "hi"
          ? "संपत्ति कर रसीद 2024"
          : "मालमत्ता कर पावती 2024",
      category: language === "en" ? "Tax Documents" : language === "hi" ? "कर दस्तावेज़" : "कर कागदपत्रे",
      uploadDate: "20 Apr 2024",
      size: "312 KB",
      status: "verified",
      fileType: "PDF",
    },
    {
      id: 4,
      name:
        language === "en"
          ? "Water Bill Oct-Dec 2024"
          : language === "hi"
          ? "जल बिल अक्टूबर-दिसंबर 2024"
          : "पाणी बिल ऑक्टोबर-डिसेंबर 2024",
      category: language === "en" ? "Utility Bills" : language === "hi" ? "उपयोगिता बिल" : "उपयुक्तता बिले",
      uploadDate: "05 Oct 2024",
      size: "198 KB",
      status: "verified",
      fileType: "PDF",
    },
    {
      id: 5,
      name:
        language === "en"
          ? "Trade License Certificate"
          : language === "hi"
          ? "व्यापार लाइसेंस प्रमाणपत्र"
          : "व्यापार परवाना प्रमाणपत्र",
      category: language === "en" ? "Business Documents" : language === "hi" ? "व्यापार दस्तावेज़" : "व्यवसाय कागदपत्रे",
      uploadDate: "01 Apr 2024",
      size: "425 KB",
      status: "verified",
      fileType: "PDF",
    },
    {
      id: 6,
      name:
        language === "en"
          ? "Address Proof - Electricity Bill"
          : language === "hi"
          ? "पता प्रमाण - बिजली बिल"
          : "पत्ता पुरावा - वीज बिल",
      category: language === "en" ? "Address Proof" : language === "hi" ? "पता प्रमाण" : "पत्ता पुरावा",
      uploadDate: "15 Nov 2024",
      size: "276 KB",
      status: "verified",
      fileType: "PDF",
    },
    {
      id: 7,
      name: language === "en" ? "Birth Certificate" : language === "hi" ? "जन्म प्रमाणपत्र" : "जन्म दाखला",
      category: language === "en" ? "Certificates" : language === "hi" ? "प्रमाणपत्र" : "प्रमाणपत्रे",
      uploadDate: "20 Nov 2024",
      size: "345 KB",
      status: "pending",
      fileType: "PDF",
    },
    {
      id: 8,
      name:
        language === "en"
          ? "Marriage Certificate Application"
          : language === "hi"
          ? "विवाह प्रमाणपत्र आवेदन"
          : "विवाह प्रमाणपत्र अर्ज",
      category: language === "en" ? "Applications" : language === "hi" ? "आवेदन" : "अर्ज",
      uploadDate: "01 Dec 2024",
      size: "512 KB",
      status: "pending",
      fileType: "PDF",
    },
  ];

  const filteredDocuments = documents.filter((doc) => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return true;
    return doc.name.toLowerCase().includes(q) || doc.category.toLowerCase().includes(q);
  });

  const getStatusBadge = (status: DocumentStatus) => {
    const config: Record<DocumentStatus, StatusBadgeConfig> = {
      verified: {
        className: "bg-emerald-100 text-emerald-700 border border-emerald-200",
        icon: CheckCircle,
        text: language === "en" ? "Verified" : language === "hi" ? "सत्यापित" : "सत्यापित",
      },
      pending: {
        className: "bg-amber-100 text-amber-700 border border-amber-200",
        icon: Clock,
        text: language === "en" ? "Pending" : language === "hi" ? "लंबित" : "प्रलंबित",
      },
    };

    const { className, icon: Icon, text } = config[status];

    return (
      <Badge className={className}>
        <Icon className="w-3 h-3 mr-1" />
        {text}
      </Badge>
    );
  };

  const groupedDocuments = filteredDocuments.reduce<Record<string, DocumentItem[]>>((acc, doc) => {
    (acc[doc.category] ||= []).push(doc);
    return acc;
  }, {});

  return (
    <div className={`w-full ${darkMode ? "text-white" : "text-gray-900"}`}>
      {/* Header */}
      <div
        className={`p-6 border-b rounded-t-2xl ${
          darkMode
            ? "bg-gray-800 border-gray-700"
            : "bg-gradient-to-r from-violet-100 via-purple-100 to-fuchsia-100 border-gray-200"
        }`}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className={`p-3 rounded-lg ${darkMode ? "bg-purple-500/20" : "bg-white/60 backdrop-blur-sm"}`}>
              <FileText className={`w-8 h-8 ${darkMode ? "text-purple-400" : "text-purple-600"}`} />
            </div>
            <div>
              <h2 className={`text-2xl font-bold ${darkMode ? "text-white" : "text-gray-900"}`}>
                {language === "en" ? "My Documents" : language === "hi" ? "मेरे दस्तावेज़" : "माझी कागदपत्रे"}
              </h2>
              <p className={`text-sm mt-1 ${darkMode ? "text-gray-300" : "text-gray-700"}`}>
                {language === "en"
                  ? `${documents.length} documents uploaded`
                  : language === "hi"
                  ? `${documents.length} दस्तावेज़ अपलोड किए गए`
                  : `${documents.length} कागदपत्रे अपलोड केली`}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              className={darkMode ? "text-white hover:bg-gray-700" : "text-gray-900 hover:bg-white/60"}
              onClick={() => alert("Upload action (dummy)")}
            >
              <Upload className="w-4 h-4 mr-2" />
              {language === "en" ? "Upload" : language === "hi" ? "अपलोड" : "अपलोड"}
            </Button>

            <Button
              onClick={onClose}
              variant="ghost"
              size="icon"
              className={`rounded-full ${darkMode ? "text-white hover:bg-gray-700" : "text-gray-900 hover:bg-white/60"}`}
            >
              <X className="w-6 h-6" />
            </Button>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className={`p-4 border-b ${darkMode ? "bg-gray-800/50 border-gray-700" : "bg-gray-50 border-gray-200"}`}>
        <div className="relative">
          <Search
            className={`absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 ${
              darkMode ? "text-gray-400" : "text-gray-500"
            }`}
          />
          <input
            type="text"
            placeholder={
              language === "en" ? "Search documents..." : language === "hi" ? "दस्तावेज़ खोजें..." : "कागदपत्रे शोधा..."
            }
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={`w-full pl-10 pr-4 py-2 rounded-lg border ${
              darkMode
                ? "bg-gray-700 border-gray-600 text-white placeholder-gray-400"
                : "bg-white border-gray-300 text-gray-900 placeholder-gray-500"
            } focus:outline-none focus:ring-2 focus:ring-purple-500`}
          />
        </div>
      </div>

      {/* List */}
      <div className="p-6 space-y-6">
        {Object.entries(groupedDocuments).map(([category, docs]) => (
          <div key={category}>
            <h3 className={`text-lg font-semibold mb-3 ${darkMode ? "text-white" : "text-gray-900"}`}>{category}</h3>

            <div className="space-y-2">
              {docs.map((doc) => (
                <div
                  key={doc.id}
                  className={`rounded-lg border p-4 transition-all hover:shadow-md ${
                    darkMode
                      ? "bg-gray-800 border-gray-700 hover:border-purple-500"
                      : "bg-white border-gray-200 hover:border-purple-400"
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3 flex-1 min-w-0">
                      <div className={`p-2 rounded-lg ${darkMode ? "bg-purple-500/20" : "bg-purple-50"}`}>
                        <FileText className={`w-5 h-5 ${darkMode ? "text-purple-400" : "text-purple-600"}`} />
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <div className="min-w-0">
                            <h4 className={`font-semibold ${darkMode ? "text-white" : "text-gray-900"} truncate`}>
                              {doc.name}
                            </h4>
                            <p className={`text-xs ${darkMode ? "text-gray-400" : "text-gray-600"} mt-1`}>
                              {doc.fileType} • {doc.size} •{" "}
                              {language === "en" ? "Uploaded on" : language === "hi" ? "अपलोड किया गया" : "अपलोड केले"}{" "}
                              {doc.uploadDate}
                            </p>
                          </div>
                          {getStatusBadge(doc.status)}
                        </div>

                        <div className="flex items-center gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            className={darkMode ? "border-gray-600 text-gray-300 hover:bg-gray-700" : ""}
                            onClick={() => alert(`View (dummy): ${doc.name}`)}
                          >
                            <Eye className="w-4 h-4 mr-2" />
                            {language === "en" ? "View" : language === "hi" ? "देखें" : "पहा"}
                          </Button>

                          <Button
                            size="sm"
                            variant="outline"
                            className={darkMode ? "border-gray-600 text-gray-300 hover:bg-gray-700" : ""}
                            onClick={() => alert(`Download (dummy): ${doc.name}`)}
                          >
                            <Download className="w-4 h-4 mr-2" />
                            {language === "en" ? "Download" : language === "hi" ? "डाउनलोड" : "डाउनलोड"}
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}

        {filteredDocuments.length === 0 && (
          <div className="text-center py-12">
            <FileText className={`w-16 h-16 mx-auto mb-4 ${darkMode ? "text-gray-600" : "text-gray-400"}`} />
            <p className={`text-lg ${darkMode ? "text-gray-400" : "text-gray-600"}`}>
              {language === "en"
                ? "No documents found"
                : language === "hi"
                ? "कोई दस्तावेज़ नहीं मिला"
                : "कोणतीही कागदपत्रे आढळली नाहीत"}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
