
"use client";

import { useMemo, useState } from "react";
import { Droplet, MapPin, ChevronRight, Activity } from "lucide-react";
import { Language } from "@/types/service.types";
import { Badge } from "@/components/common/Badge";
import { Button } from "@/components/common/Button";
import { DetailedDashboardView } from "@/components/DetailedDashboardView";

interface WaterConnectionListViewProps {
  language: Language;
  darkMode?: boolean;
  authUser?: {
    userType: "user" | "admin";
    userData: any;
  } | null;
  onClose: () => void;
}

type ConnectionStatus = "active" | "inactive";

type ConnectionRow = {
  id: number;
  connectionId: string;
  connectionType: string;
  address: string;
  meterNumber: string;
  currentBill: number;
  status: ConnectionStatus;
  averageConsumption: string;
  lastPayment: string;
  totalBills: number;
};

export function WaterConnectionListView({
  language,
  darkMode = false,
  authUser,
  onClose,
}: WaterConnectionListViewProps) {
  const [selectedConnection, setSelectedConnection] = useState<number | null>(
    null
  );

  // ✅ Dummy data
  const connections: ConnectionRow[] = useMemo(
    () => [
      {
        id: 1,
        connectionId: "WTR-2024-78910",
        connectionType:
          language === "en"
            ? "Domestic"
            : language === "hi"
            ? "घरेलू"
            : "घरगुती",
        address:
          language === "en"
            ? "Plot 123, Sector 15, Akola"
            : language === "hi"
            ? "प्लॉट 123, सेक्टर 15, अकोला"
            : "प्लॉट 123, सेक्टर 15, अकोला",
        meterNumber: "MTR-45678",
        currentBill: 850,
        status: "active",
        averageConsumption: "12,000 L/month",
        lastPayment: "05 Oct 2024",
        totalBills: 5,
      },
      {
        id: 2,
        connectionId: "WTR-2024-78911",
        connectionType:
          language === "en"
            ? "Commercial"
            : language === "hi"
            ? "व्यावसायिक"
            : "व्यावसायिक",
        address:
          language === "en"
            ? "Shop 45, Market Road, Akola"
            : language === "hi"
            ? "दुकान 45, मार्केट रोड, अकोला"
            : "दुकान 45, मार्केट रोड, अकोला",
        meterNumber: "MTR-45679",
        currentBill: 1200,
        status: "active",
        averageConsumption: "18,000 L/month",
        lastPayment: "08 Oct 2024",
        totalBills: 8,
      },
      {
        id: 3,
        connectionId: "WTR-2024-78912",
        connectionType:
          language === "en"
            ? "Domestic"
            : language === "hi"
            ? "घरेलू"
            : "घरगुती",
        address:
          language === "en"
            ? "Plot 456, Sector 22, Akola"
            : language === "hi"
            ? "प्लॉट 456, सेक्टर 22, अकोला"
            : "प्लॉट 456, सेक्टर 22, अकोला",
        meterNumber: "MTR-45680",
        currentBill: 640,
        status: "inactive",
        averageConsumption: "—",
        lastPayment: "12 Jul 2024",
        totalBills: 3,
      },
    ],
    [language]
  );

  const getStatusBadge = (status: ConnectionStatus) => {
    if (status === "active") {
      return {
        className: "bg-emerald-100 text-emerald-700 border border-emerald-200",
        text: language === "en" ? "Active" : language === "hi" ? "सक्रिय" : "सक्रिय",
      };
    }
    return {
      className: "bg-gray-100 text-gray-700 border border-gray-200",
      text:
        language === "en" ? "Inactive" : language === "hi" ? "निष्क्रिय" : "निष्क्रिय",
    };
  };

  // ✅ Details screen inside same modal
  if (selectedConnection !== null) {
    return (
      <DetailedDashboardView
        serviceType="waterConnection"
        language={language}
        darkMode={darkMode}
        authUser={authUser}
        connectionId={selectedConnection}
        onClose={onClose}                 // closes the whole modal
        onBack={() => setSelectedConnection(null)} // goes back to list
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
            : "bg-gradient-to-r from-sky-100 via-blue-100 to-indigo-100 border-gray-200"
        }`}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div
              className={`p-3 rounded-lg ${
                darkMode ? "bg-cyan-500/20" : "bg-white/60 backdrop-blur-sm"
              }`}
            >
              <Droplet
                className={`w-8 h-8 ${
                  darkMode ? "text-cyan-400" : "text-cyan-600"
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
                  ? "My Water Connections"
                  : language === "hi"
                  ? "मेरे जल कनेक्शन"
                  : "माझे पाणी कनेक्शन"}
              </h2>
              <p
                className={`text-sm mt-1 ${
                  darkMode ? "text-gray-300" : "text-gray-700"
                }`}
              >
                {language === "en"
                  ? `${connections.length} connections found`
                  : language === "hi"
                  ? `${connections.length} कनेक्शन मिले`
                  : `${connections.length} कनेक्शन सापडले`}
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
        {connections.map((connection) => {
          const status = getStatusBadge(connection.status);

          return (
            <div
              key={connection.id}
              className={`rounded-xl border p-6 transition-all hover:shadow-lg ${
                darkMode
                  ? "bg-gray-800 border-gray-700 hover:border-cyan-500"
                  : "bg-gradient-to-br from-cyan-50 to-blue-50 border-gray-200 hover:border-cyan-400"
              }`}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div
                    className={`p-3 rounded-lg ${
                      darkMode ? "bg-cyan-500/20" : "bg-white"
                    }`}
                  >
                    <Droplet
                      className={`w-6 h-6 ${
                        darkMode ? "text-cyan-400" : "text-cyan-600"
                      }`}
                    />
                  </div>

                  <div>
                    <h3
                      className={`text-lg font-semibold ${
                        darkMode ? "text-white" : "text-gray-900"
                      }`}
                    >
                      {connection.connectionType}
                    </h3>
                    <p
                      className={`text-sm ${
                        darkMode ? "text-gray-400" : "text-gray-600"
                      }`}
                    >
                      {language === "en"
                        ? "Connection ID:"
                        : language === "hi"
                        ? "कनेक्शन आईडी:"
                        : "कनेक्शन आयडी:"}{" "}
                      {connection.connectionId}
                    </p>
                  </div>
                </div>

                <Badge className={status.className}>{status.text}</Badge>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
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
                      {connection.address}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-2">
                  <Activity
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
                        ? "Meter Number"
                        : language === "hi"
                        ? "मीटर नंबर"
                        : "मीटर क्रमांक"}
                    </p>
                    <p
                      className={`text-sm font-medium ${
                        darkMode ? "text-white" : "text-gray-900"
                      }`}
                    >
                      {connection.meterNumber}
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
                      ? "Current Bill"
                      : language === "hi"
                      ? "वर्तमान बिल"
                      : "वर्तमान बिल"}
                  </p>
                  <p
                    className={`text-lg font-bold ${
                      darkMode ? "text-cyan-400" : "text-cyan-600"
                    }`}
                  >
                    ₹{connection.currentBill.toLocaleString()}
                  </p>
                </div>

                <div>
                  <p
                    className={`text-xs ${
                      darkMode ? "text-gray-400" : "text-gray-600"
                    } mb-1`}
                  >
                    {language === "en"
                      ? "Avg. Consumption"
                      : language === "hi"
                      ? "औसत खपत"
                      : "सरासरी वापर"}
                  </p>
                  <p
                    className={`text-sm font-medium ${
                      darkMode ? "text-white" : "text-gray-900"
                    }`}
                  >
                    {connection.averageConsumption}
                  </p>
                </div>

                <div>
                  <p
                    className={`text-xs ${
                      darkMode ? "text-gray-400" : "text-gray-600"
                    } mb-1`}
                  >
                    {language === "en"
                      ? "Total Bills"
                      : language === "hi"
                      ? "कुल बिल"
                      : "एकूण बिले"}
                  </p>
                  <p
                    className={`text-sm font-medium ${
                      darkMode ? "text-white" : "text-gray-900"
                    }`}
                  >
                    {connection.totalBills}
                  </p>
                </div>
              </div>

              {/* ✅ ONLY View Details opens */}
              <div className="mt-4 flex items-center justify-end">
                <button
                  type="button"
                  onClick={() => setSelectedConnection(connection.id)}
                  className={`flex items-center gap-2 text-sm font-medium ${
                    darkMode
                      ? "text-cyan-300 hover:text-cyan-200"
                      : "text-cyan-600 hover:text-cyan-700"
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
