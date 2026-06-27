"use client";

import type { ReactNode } from "react";
import {
  User,
  Phone,
  Mail,
  MapPin,
  Calendar,
  CreditCard,
  CheckCircle2,
  ShieldCheck,
} from "lucide-react";

import { Badge } from "@/components/common/Badge";
import type { Language } from "@/types/language.type";
import type { AuthUser } from "@/types/safe";

type Address = {
  houseNo?: string;
  building?: string;
  street?: string;
  area?: string;
  landmark?: string;
  ward?: string;
  pincode?: string;
};

type UserDataShape = {
  name?: string;
  phone?: string;
  email?: string;
  dateOfBirth?: string;
  upicId?: string;
  aadhaar?: string;
  isVerified?: boolean;
  address?: Address;
};

const UI: Record<
  Language,
  {
    citizen: string;
    admin: string;
    verified: string;
    upic: string;

    personalInfo: string;
    email: string;
    phone: string;
    address: string;
    dob: string;
    aadhaar: string;

    // fallbacks (demo)
    demoName: string;
    demoDob: string;
  }
> = {
  en: {
    citizen: "Citizen",
    admin: "Admin",
    verified: "Verified",
    upic: "UPIC",

    personalInfo: "Personal Information",
    email: "Email",
    phone: "Phone",
    address: "Address",
    dob: "Date of Birth",
    aadhaar: "Aadhaar",

    demoName: "Rajesh Kumar",
    demoDob: "May 14, 1998",
  },
  hi: {
    citizen: "नागरिक",
    admin: "प्रशासक",
    verified: "सत्यापित",
    upic: "यूपीआईसी",

    personalInfo: "व्यक्तिगत जानकारी",
    email: "ईमेल",
    phone: "फ़ोन",
    address: "पता",
    dob: "जन्म तिथि",
    aadhaar: "आधार",

    demoName: "राजेश कुमार",
    demoDob: "14 मई, 1998",
  },
  mr: {
    citizen: "नागरिक",
    admin: "प्रशासक",
    verified: "सत्यापित",
    upic: "यूपीआयसी",

    personalInfo: "वैयक्तिक माहिती",
    email: "ईमेल",
    phone: "फोन",
    address: "पत्ता",
    dob: "जन्मतारीख",
    aadhaar: "आधार",

    demoName: "राजेश कुमार",
    demoDob: "14 मे, 1998",
  },
};

interface UserInfoPanelProps {
  language: Language;
  translations?: any; // keep for compatibility
  authUser?: AuthUser | null;
  darkMode?: boolean;
}

export function UserInfoPanel({ language, authUser }: UserInfoPanelProps) {
  const t = UI[language] ?? UI.en;

  const ud = authUser?.userData as UserDataShape | undefined;

  const address: Address = {
    houseNo: ud?.address?.houseNo ?? "42",
    building: ud?.address?.building ?? "Sunrise Residency",
    street: ud?.address?.street ?? "MG Road",
    area: ud?.address?.area ?? "Civil Lines",
    landmark: ud?.address?.landmark ?? "Near City Hospital",
    ward: ud?.address?.ward ?? "Ward 12",
    pincode: ud?.address?.pincode ?? "444001",
  };

  const displayAddress = `${address.area ?? ""}${address.pincode ? `, ${address.pincode}` : ""}`.trim();

  const name =
    ud?.name ||
    (language === "en" ? t.demoName : language === "hi" ? t.demoName : t.demoName);

  const phoneRaw = String(ud?.phone ?? "9876543210").replace(/\D/g, "").slice(0, 10);
  const phone = `+91 ${phoneRaw.replace(/(\d{5})(\d{5})/, "$1 $2")}`;

  const email = String(ud?.email ?? "rajesh.kumar@email.com");

  const dob =
    ud?.dateOfBirth ||
    (language === "en" ? t.demoDob : language === "hi" ? t.demoDob : t.demoDob);

  const upicId = String(ud?.upicId ?? "RTS2024001234");

  const aadhaar = String(ud?.aadhaar ?? "XXXX-XXXX-1234");

  const isVerified = Boolean(ud?.isVerified ?? true);

  const userTypeLabel =
    authUser?.userType === "admin" ? t.admin : t.citizen;

  const getInitials = (fullName: string) => {
    const parts = fullName.trim().split(/\s+/);
    if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
    return fullName.substring(0, 2).toUpperCase();
  };

  return (
    <div className="w-full h-full flex flex-col px-4 py-4 md:px-6 md:py-6">
      {/* TOP PROFILE HEADER */}
      <div className="flex items-center gap-4 mb-6">
        {/* Avatar */}
        <div className="relative flex-shrink-0">
          <div className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-gradient-to-br from-purple-500 via-pink-500 to-amber-500 p-0.5 shadow-lg">
            <div className="w-full h-full bg-white rounded-full flex items-center justify-center">
              <span className="text-xl md:text-2xl bg-gradient-to-br from-purple-600 via-pink-600 to-amber-600 bg-clip-text text-transparent">
                {getInitials(name)}
              </span>
            </div>
          </div>

          {isVerified && (
            <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-full flex items-center justify-center border-2 border-white shadow-lg">
              <CheckCircle2 className="w-4 h-4 text-white" />
            </div>
          )}
        </div>

        {/* Name + UPIC + Badges */}
        <div className="flex-1">
          <h3 className="text-xl md:text-2xl bg-gradient-to-r from-purple-700 via-pink-700 to-amber-700 bg-clip-text text-transparent">
            {name}
          </h3>

          <div className="flex flex-wrap gap-2 mt-1">
            <Badge className="bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow px-2 py-1 flex items-center gap-1 text-xs">
              <User className="w-3 h-3" />
              {userTypeLabel}
            </Badge>

            {isVerified && (
              <Badge className="bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow px-2 py-1 flex items-center gap-1 text-xs">
                <ShieldCheck className="w-3 h-3" />
                {t.verified}
              </Badge>
            )}
          </div>

          <div className="inline-flex items-center mt-2 bg-gradient-to-r from-indigo-50 to-purple-50 px-3 py-1 rounded-lg border border-purple-200 shadow-sm">
            <span className="text-xs text-purple-700 font-semibold">
              {t.upic}:
            </span>
            <span className="text-xs text-purple-900 font-mono ml-1">
              {upicId}
            </span>
          </div>
        </div>
      </div>

      {/* PERSONAL INFORMATION */}
      <h4 className="text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
        <div className="w-1 h-6 bg-gradient-to-b from-purple-500 to-pink-500 rounded-full" />
        {t.personalInfo}
      </h4>

      <div className="space-y-4">
        <InfoRow
          icon={<Mail className="w-5 h-5 text-purple-600" />}
          label={t.email}
          value={email}
          bg="from-pink-100 to-purple-100"
        />

        <InfoRow
          icon={<Phone className="w-5 h-5 text-blue-600" />}
          label={t.phone}
          value={phone}
          bg="from-blue-100 to-cyan-100"
        />

        <InfoRow
          icon={<MapPin className="w-5 h-5 text-green-600" />}
          label={t.address}
          value={displayAddress || "-"}
          bg="from-green-100 to-emerald-100"
        />

        <InfoRow
          icon={<Calendar className="w-5 h-5 text-amber-600" />}
          label={t.dob}
          value={dob}
          bg="from-amber-100 to-orange-100"
        />

        <InfoRow
          icon={<CreditCard className="w-5 h-5 text-indigo-600" />}
          label={t.aadhaar}
          value={aadhaar}
          bg="from-indigo-100 to-violet-100"
        />
      </div>
    </div>
  );
}

function InfoRow({
  icon,
  label,
  value,
  bg,
}: {
  icon: ReactNode;
  label: string;
  value: string;
  bg: string;
}) {
  return (
    <div className="flex items-center gap-4">
      <div
        className={`w-12 h-12 rounded-lg bg-gradient-to-br ${bg} flex items-center justify-center shadow`}
      >
        {icon}
      </div>

      <div>
        <p className="text-xs text-gray-500 uppercase">{label}</p>
        <p className="text-sm text-gray-900">{value}</p>
      </div>
    </div>
  );
}