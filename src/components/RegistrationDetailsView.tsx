"use client";

import { X, User, Mail, Phone, Calendar, MapPin, CheckCircle, Edit } from "lucide-react";
import { Language } from "@/types/service.types";
import { Badge } from "@/components/common/Badge";
import { Button } from "@/components/common/Button";

interface RegistrationDetailsViewProps {
  language: Language;
  darkMode?: boolean;
  authUser?: {
    userType: "user" | "admin";
    userData: any;
  } | null;
  onClose: () => void;
}

export function RegistrationDetailsView({
  language,
  darkMode = false,
  authUser,
  onClose,
}: RegistrationDetailsViewProps) {
  // ✅ Dummy user registration details
  const userDetails = {
    upicId: authUser?.userData?.upicId || "UP12345678",
    fullName:
      authUser?.userData?.name ||
      (language === "en"
        ? "Rajesh Kumar Sharma"
        : language === "hi"
        ? "राजेश कुमार शर्मा"
        : "राजेश कुमार शर्मा"),
    email: authUser?.userData?.email || "rajesh.sharma@email.com",
    mobile: authUser?.userData?.mobile || "+91 9876543210",
    alternatePhone: "+91 9876543211",
    dateOfBirth: "15 Jan 1985",
    address: {
      street:
        language === "en"
          ? "Plot 123, Sector 15"
          : language === "hi"
          ? "प्लॉट 123, सेक्टर 15"
          : "प्लॉट 123, सेक्टर 15",
      city: language === "en" ? "Akola" : language === "hi" ? "अकोला" : "अकोला",
      state:
        language === "en"
          ? "Maharashtra"
          : language === "hi"
          ? "महाराष्ट्र"
          : "महाराष्ट्र",
      pincode: "444001",
    },
    registrationDate: "15 Nov 2024",
    lastUpdated: "12 Dec 2024",
    accountStatus: "active",
    verificationStatus: {
      email: true,
      mobile: true,
      address: true,
      identity: true,
    },
    linkedServices: {
      properties: 3,
      waterConnections: 2,
      tradeLicenses: 3,
      applications: 8,
    },
  };

  return (
    <div className={`w-full ${darkMode ? "text-white" : "text-gray-900"}`}>
      {/* Header */}
      <div
        className={`p-6 border-b rounded-t-2xl ${
          darkMode
            ? "bg-gray-800 border-gray-700"
            : "bg-gradient-to-r from-emerald-100 via-teal-100 to-cyan-100 border-gray-200"
        }`}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div
              className={`p-3 rounded-lg ${
                darkMode ? "bg-green-500/20" : "bg-white/60 backdrop-blur-sm"
              }`}
            >
              <User className={`w-8 h-8 ${darkMode ? "text-green-400" : "text-teal-600"}`} />
            </div>
            <div>
              <h2 className={`text-2xl font-bold ${darkMode ? "text-white" : "text-gray-900"}`}>
                {language === "en"
                  ? "Registration Details"
                  : language === "hi"
                  ? "पंजीकरण विवरण"
                  : "नोंदणी तपशील"}
              </h2>
              <p className={`text-sm mt-1 ${darkMode ? "text-gray-300" : "text-gray-700"}`}>
                {language === "en"
                  ? "Your account information"
                  : language === "hi"
                  ? "आपकी खाता जानकारी"
                  : "तुमची खाते माहिती"}
              </p>
            </div>
          </div>

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

      {/* Content */}
      <div className="p-6 space-y-6">
        {/* Profile Summary */}
        <div
          className={`rounded-xl p-6 ${
            darkMode
              ? "bg-gradient-to-br from-gray-800 to-gray-800/50"
              : "bg-gradient-to-br from-green-50 to-emerald-50"
          }`}
        >
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-4">
              <div
                className={`w-20 h-20 rounded-full flex items-center justify-center text-2xl font-bold ${
                  darkMode ? "bg-green-500/20 text-green-400" : "bg-green-600 text-white"
                }`}
              >
                {userDetails.fullName.charAt(0)}
              </div>

              <div>
                <h3 className={`text-2xl font-bold ${darkMode ? "text-white" : "text-gray-900"}`}>
                  {userDetails.fullName}
                </h3>
                <p className={`text-sm ${darkMode ? "text-gray-400" : "text-gray-600"} mt-1`}>
                  {language === "en"
                    ? "UPIC ID:"
                    : language === "hi"
                    ? "यूपीआईसी आईडी:"
                    : "यूपीआयसी आयडी:"}{" "}
                  {userDetails.upicId}
                </p>

                <div className="flex items-center gap-2 mt-2">
                  <Badge className="bg-emerald-100 text-emerald-700 border border-emerald-200">
                    <CheckCircle className="w-3 h-3 mr-1" />
                    {language === "en" ? "Verified" : language === "hi" ? "सत्यापित" : "सत्यापित"}
                  </Badge>
                </div>
              </div>
            </div>

            <Button variant="outline" size="sm" className={darkMode ? "border-gray-600 text-gray-300" : ""}>
              <Edit className="w-4 h-4 mr-2" />
              {language === "en"
                ? "Edit Profile"
                : language === "hi"
                ? "प्रोफ़ाइल संपादित करें"
                : "प्रोफाइल संपादित करा"}
            </Button>
          </div>
        </div>

        {/* Contact Information */}
        <div className={`rounded-xl border p-6 ${darkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"}`}>
          <h3 className={`text-lg font-semibold mb-4 ${darkMode ? "text-white" : "text-gray-900"}`}>
            {language === "en" ? "Contact Information" : language === "hi" ? "संपर्क जानकारी" : "संपर्क माहिती"}
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Email */}
            <div className="flex items-start gap-3">
              <div className={`p-2 rounded-lg ${darkMode ? "bg-blue-500/20" : "bg-blue-50"}`}>
                <Mail className={`w-5 h-5 ${darkMode ? "text-blue-400" : "text-blue-600"}`} />
              </div>
              <div className="flex-1">
                <p className={`text-xs ${darkMode ? "text-gray-400" : "text-gray-600"} mb-1`}>
                  {language === "en" ? "Email Address" : language === "hi" ? "ईमेल पता" : "ईमेल पत्ता"}
                </p>
                <p className={`text-sm font-medium ${darkMode ? "text-white" : "text-gray-900"}`}>
                  {userDetails.email}
                </p>
                {userDetails.verificationStatus.email && (
                  <Badge className="bg-emerald-100 text-emerald-700 border border-emerald-200 text-xs mt-1">
                    <CheckCircle className="w-3 h-3 mr-1" />
                    {language === "en" ? "Verified" : language === "hi" ? "सत्यापित" : "सत्यापित"}
                  </Badge>
                )}
              </div>
            </div>

            {/* Mobile */}
            <div className="flex items-start gap-3">
              <div className={`p-2 rounded-lg ${darkMode ? "bg-green-500/20" : "bg-green-50"}`}>
                <Phone className={`w-5 h-5 ${darkMode ? "text-green-400" : "text-green-600"}`} />
              </div>
              <div className="flex-1">
                <p className={`text-xs ${darkMode ? "text-gray-400" : "text-gray-600"} mb-1`}>
                  {language === "en" ? "Mobile Number" : language === "hi" ? "मोबाइल नंबर" : "मोबाइल नंबर"}
                </p>
                <p className={`text-sm font-medium ${darkMode ? "text-white" : "text-gray-900"}`}>
                  {userDetails.mobile}
                </p>
                {userDetails.verificationStatus.mobile && (
                  <Badge className="bg-emerald-100 text-emerald-700 border border-emerald-200 text-xs mt-1">
                    <CheckCircle className="w-3 h-3 mr-1" />
                    {language === "en" ? "Verified" : language === "hi" ? "सत्यापित" : "सत्यापित"}
                  </Badge>
                )}
              </div>
            </div>

            {/* Alternate */}
            <div className="flex items-start gap-3">
              <div className={`p-2 rounded-lg ${darkMode ? "bg-purple-500/20" : "bg-purple-50"}`}>
                <Phone className={`w-5 h-5 ${darkMode ? "text-purple-400" : "text-purple-600"}`} />
              </div>
              <div className="flex-1">
                <p className={`text-xs ${darkMode ? "text-gray-400" : "text-gray-600"} mb-1`}>
                  {language === "en" ? "Alternate Phone" : language === "hi" ? "वैकल्पिक फोन" : "पर्यायी फोन"}
                </p>
                <p className={`text-sm font-medium ${darkMode ? "text-white" : "text-gray-900"}`}>
                  {userDetails.alternatePhone}
                </p>
              </div>
            </div>

            {/* DOB */}
            <div className="flex items-start gap-3">
              <div className={`p-2 rounded-lg ${darkMode ? "bg-orange-500/20" : "bg-orange-50"}`}>
                <Calendar className={`w-5 h-5 ${darkMode ? "text-orange-400" : "text-orange-600"}`} />
              </div>
              <div className="flex-1">
                <p className={`text-xs ${darkMode ? "text-gray-400" : "text-gray-600"} mb-1`}>
                  {language === "en" ? "Date of Birth" : language === "hi" ? "जन्म तिथि" : "जन्म तारीख"}
                </p>
                <p className={`text-sm font-medium ${darkMode ? "text-white" : "text-gray-900"}`}>
                  {userDetails.dateOfBirth}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Address */}
        <div className={`rounded-xl border p-6 ${darkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"}`}>
          <h3 className={`text-lg font-semibold mb-4 ${darkMode ? "text-white" : "text-gray-900"}`}>
            {language === "en" ? "Address" : language === "hi" ? "पता" : "पत्ता"}
          </h3>

          <div className="flex items-start gap-3">
            <div className={`p-2 rounded-lg ${darkMode ? "bg-red-500/20" : "bg-red-50"}`}>
              <MapPin className={`w-5 h-5 ${darkMode ? "text-red-400" : "text-red-600"}`} />
            </div>

            <div className="flex-1">
              <p className={`text-sm font-medium ${darkMode ? "text-white" : "text-gray-900"} mb-1`}>
                {userDetails.address.street}
              </p>
              <p className={`text-sm ${darkMode ? "text-gray-400" : "text-gray-600"}`}>
                {userDetails.address.city}, {userDetails.address.state} - {userDetails.address.pincode}
              </p>

              {userDetails.verificationStatus.address && (
                <Badge className="bg-emerald-100 text-emerald-700 border border-emerald-200 text-xs mt-2">
                  <CheckCircle className="w-3 h-3 mr-1" />
                  {language === "en"
                    ? "Address Verified"
                    : language === "hi"
                    ? "पता सत्यापित"
                    : "पत्ता सत्यापित"}
                </Badge>
              )}
            </div>
          </div>
        </div>

        {/* Account Information */}
        <div className={`rounded-xl border p-6 ${darkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"}`}>
          <h3 className={`text-lg font-semibold mb-4 ${darkMode ? "text-white" : "text-gray-900"}`}>
            {language === "en" ? "Account Information" : language === "hi" ? "खाता जानकारी" : "खाते माहिती"}
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className={`text-xs ${darkMode ? "text-gray-400" : "text-gray-600"} mb-1`}>
                {language === "en"
                  ? "Registration Date"
                  : language === "hi"
                  ? "पंजीकरण तिथि"
                  : "नोंदणी तारीख"}
              </p>
              <p className={`text-sm font-medium ${darkMode ? "text-white" : "text-gray-900"}`}>
                {userDetails.registrationDate}
              </p>
            </div>

            <div>
              <p className={`text-xs ${darkMode ? "text-gray-400" : "text-gray-600"} mb-1`}>
                {language === "en" ? "Last Updated" : language === "hi" ? "अंतिम अपडेट" : "शेवटचे अद्यतनित"}
              </p>
              <p className={`text-sm font-medium ${darkMode ? "text-white" : "text-gray-900"}`}>
                {userDetails.lastUpdated}
              </p>
            </div>

            <div>
              <p className={`text-xs ${darkMode ? "text-gray-400" : "text-gray-600"} mb-1`}>
                {language === "en" ? "Account Status" : language === "hi" ? "खाता स्थिति" : "खाते स्थिती"}
              </p>
              <Badge className="bg-emerald-100 text-emerald-700 border border-emerald-200">
                {language === "en" ? "Active" : language === "hi" ? "सक्रिय" : "सक्रिय"}
              </Badge>
            </div>

            <div>
              <p className={`text-xs ${darkMode ? "text-gray-400" : "text-gray-600"} mb-1`}>
                {language === "en"
                  ? "Identity Verification"
                  : language === "hi"
                  ? "पहचान सत्यापन"
                  : "ओळख सत्यापन"}
              </p>
              {userDetails.verificationStatus.identity && (
                <Badge className="bg-emerald-100 text-emerald-700 border border-emerald-200">
                  <CheckCircle className="w-3 h-3 mr-1" />
                  {language === "en" ? "Verified" : language === "hi" ? "सत्यापित" : "सत्यापित"}
                </Badge>
              )}
            </div>
          </div>
        </div>

        {/* Linked Services */}
        <div className={`rounded-xl border p-6 ${darkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"}`}>
          <h3 className={`text-lg font-semibold mb-4 ${darkMode ? "text-white" : "text-gray-900"}`}>
            {language === "en" ? "Linked Services" : language === "hi" ? "लिंक की गई सेवाएं" : "जोडलेल्या सेवा"}
          </h3>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { key: "properties", color: "pink", labelEn: "Properties", labelHi: "संपत्तियां", labelMr: "मालमत्ता" },
              { key: "waterConnections", color: "cyan", labelEn: "Water Connections", labelHi: "जल कनेक्शन", labelMr: "पाणी कनेक्शन" },
              { key: "tradeLicenses", color: "amber", labelEn: "Trade Licenses", labelHi: "व्यापार लाइसेंस", labelMr: "व्यापार परवाने" },
              { key: "applications", color: "purple", labelEn: "Applications", labelHi: "आवेदन", labelMr: "अर्ज" },
            ].map((item) => (
              <div
                key={item.key}
                className={`p-4 rounded-lg text-center ${darkMode ? "bg-gray-700" : "bg-gray-50"}`}
              >
                <p className={`text-2xl font-bold ${
                  item.color === "pink"
                    ? darkMode ? "text-pink-400" : "text-pink-600"
                    : item.color === "cyan"
                    ? darkMode ? "text-cyan-400" : "text-cyan-600"
                    : item.color === "amber"
                    ? darkMode ? "text-amber-400" : "text-amber-600"
                    : darkMode ? "text-purple-400" : "text-purple-600"
                }`}>
                  {
                    // @ts-ignore
                    userDetails.linkedServices[item.key]
                  }
                </p>

                <p className={`text-xs ${darkMode ? "text-gray-400" : "text-gray-600"} mt-1`}>
                  {language === "en" ? item.labelEn : language === "hi" ? item.labelHi : item.labelMr}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
