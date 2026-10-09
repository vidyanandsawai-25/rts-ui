"use client";

import React, { useState, useTransition } from "react";
import {
  FileText,
  Search,
  RefreshCw,
  ExternalLink,
  CheckCircle2,
  Clock,
  XCircle,
  Download,
  Eye,
  ShieldCheck,
  Copy,
  Check,
} from "lucide-react";
import ApplicationAndTrackingDrawer from "@/components/modules/rts/citizen/ApplicationAndTrackingDrawer";
import {
  fetchAapleSarkarDashboardAction,
  type AapleSarkarApplicationItem,
  type AapleSarkarDashboardData,
} from "./actions";

interface AapleSarkarDashboardClientProps {
  initialData: AapleSarkarDashboardData;
  cuid: string;
  locale: string;
  ulbName: string;
}

export default function AapleSarkarDashboardClient({
  initialData,
  cuid,
  locale,
  ulbName,
}: AapleSarkarDashboardClientProps) {
  const isMr = locale === "mr";
  const [data, setData] = useState<AapleSarkarDashboardData>(initialData);
  const [searchText, setSearchText] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [isPending, startTransition] = useTransition();

  // Tracking drawer state
  const [trackingOpen, setTrackingOpen] = useState(false);
  const [selectedAppNo, setSelectedAppNo] = useState<string | undefined>(undefined);

  // Copied track ID toast/tooltip state
  const [copiedTrackId, setCopiedTrackId] = useState<string | null>(null);

  const applications = data.applications || [];

  // Summary counts
  const totalCount = data.totalCount || applications.length;
  const pendingCount = applications.filter(
    (a) => a.status === "Pending" || a.applicationStatus?.toLowerCase().includes("pending")
  ).length;
  const approvedCount = applications.filter(
    (a) => a.status === "Approved" || a.applicationStatus?.toLowerCase().includes("approved")
  ).length;
  const rejectedCount = applications.filter(
    (a) => a.status === "Rejected" || a.applicationStatus?.toLowerCase().includes("reject")
  ).length;

  const handleRefresh = (search = searchText, filter = statusFilter, page = 1) => {
    startTransition(async () => {
      const res = await fetchAapleSarkarDashboardAction(cuid, search, filter, page, 20);
      setData(res);
    });
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleRefresh(searchText, statusFilter, 1);
  };

  const handleFilterChange = (filter: string) => {
    setStatusFilter(filter);
    handleRefresh(searchText, filter, 1);
  };

  const copyToClipboard = (text: string) => {
    if (navigator?.clipboard) {
      navigator.clipboard.writeText(text);
      setCopiedTrackId(text);
      setTimeout(() => setCopiedTrackId(null), 2000);
    }
  };

  const openTracking = (appNo: string) => {
    setSelectedAppNo(appNo);
    setTrackingOpen(true);
  };

  const formatDate = (dateStr?: string | null) => {
    if (!dateStr) return "-";
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString(isMr ? "mr-IN" : "en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      });
    } catch {
      return dateStr;
    }
  };

  const getStatusBadge = (item: AapleSarkarApplicationItem) => {
    const rawStatus = (item.applicationStatus || item.status || "Pending").toLowerCase();

    if (rawStatus.includes("approved") || rawStatus.includes("certificate issued")) {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
          <CheckCircle2 className="w-3.5 h-3.5" />
          {isMr ? "मंजूर (Approved)" : "Approved"}
        </span>
      );
    }

    if (rawStatus.includes("reject") || rawStatus.includes("disapproved")) {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200">
          <XCircle className="w-3.5 h-3.5" />
          {isMr ? "नामंजूर (Rejected)" : "Rejected"}
        </span>
      );
    }

    if (rawStatus.includes("payment")) {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
          <Clock className="w-3.5 h-3.5" />
          {isMr ? "शुल्क प्रलंबित (Payment Pending)" : "Payment Pending"}
        </span>
      );
    }

    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">
        <Clock className="w-3.5 h-3.5" />
        {item.applicationStatus || (isMr ? "प्रक्रियेत (In Process)" : "In Process")}
      </span>
    );
  };

  return (
    <div className="min-h-screen bg-slate-50/60 pb-16">
      {/* Top Banner / Hero */}
      <div className="bg-gradient-to-r from-[#0a3275] via-[#104499] to-[#0c3982] text-white py-8 px-4 sm:px-6 lg:px-8 shadow-sm">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 text-blue-200 text-sm font-medium mb-1">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>{ulbName} • {isMr ? "आपले सरकार इंटिग्रेशन" : "Aaple Sarkar Integration"}</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
                {isMr ? "आपले सरकार - नागरिक सेवा डॅशबोर्ड" : "Aaple Sarkar - Citizen RTS Dashboard"}
              </h1>
              <p className="text-blue-100/90 text-sm mt-1">
                {isMr
                  ? "आपले सरकार पोर्टलवरून प्राप्त झालेल्या सर्व अर्जांची सद्यस्थिती व प्रमाणपत्रे येथे उपलब्ध आहेत."
                  : "View and track all Right to Service applications submitted via Aaple Sarkar portal."}
              </p>
            </div>

            {/* User ID & Portal Back Link */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
              <div className="bg-white/10 backdrop-blur-sm border border-white/20 px-3.5 py-2 rounded-lg text-xs">
                <div className="text-blue-200">{isMr ? "नागरिक आयडी (CUID)" : "Citizen ID"}</div>
                <div className="font-mono font-bold text-white tracking-wide truncate max-w-[200px]" title={cuid}>
                  {cuid || "-"}
                </div>
              </div>

              <a
                href="https://aaplesarkar.mahaonline.gov.in/"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-white text-[#0a3275] font-semibold text-xs shadow-sm hover:bg-blue-50 transition-colors"
              >
                <span>{isMr ? "आपले सरकार मुख्य पोर्टल" : "Aaple Sarkar Portal"}</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Main Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6">
        {/* KPI Counter Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm hover:shadow transition-shadow">
            <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
              <span>{isMr ? "एकूण अर्ज" : "Total Applications"}</span>
              <FileText className="w-4 h-4 text-blue-600" />
            </div>
            <div className="text-2xl font-bold text-slate-900 mt-2">{totalCount}</div>
            <div className="text-[11px] text-slate-400 mt-1">{isMr ? "सर्व सेवेचे अर्ज" : "All services"}</div>
          </div>

          <div className="bg-white rounded-xl border border-amber-200/80 p-4 shadow-sm hover:shadow transition-shadow bg-amber-50/20">
            <div className="flex items-center justify-between text-amber-700 text-xs font-medium">
              <span>{isMr ? "प्रलंबित / प्रक्रियेत" : "In Process"}</span>
              <Clock className="w-4 h-4 text-amber-600" />
            </div>
            <div className="text-2xl font-bold text-amber-900 mt-2">{pendingCount}</div>
            <div className="text-[11px] text-amber-600/80 mt-1">{isMr ? "विभागीय स्तरावर प्रलंबित" : "Under review"}</div>
          </div>

          <div className="bg-white rounded-xl border border-emerald-200/80 p-4 shadow-sm hover:shadow transition-shadow bg-emerald-50/20">
            <div className="flex items-center justify-between text-emerald-700 text-xs font-medium">
              <span>{isMr ? "मंजूर झालेले" : "Approved"}</span>
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            </div>
            <div className="text-2xl font-bold text-emerald-900 mt-2">{approvedCount}</div>
            <div className="text-[11px] text-emerald-600/80 mt-1">{isMr ? "प्रमाणपत्र जारी झाले" : "Certificates issued"}</div>
          </div>

          <div className="bg-white rounded-xl border border-rose-200/80 p-4 shadow-sm hover:shadow transition-shadow bg-rose-50/20">
            <div className="flex items-center justify-between text-rose-700 text-xs font-medium">
              <span>{isMr ? "नामंजूर" : "Rejected"}</span>
              <XCircle className="w-4 h-4 text-rose-600" />
            </div>
            <div className="text-2xl font-bold text-rose-900 mt-2">{rejectedCount}</div>
            <div className="text-[11px] text-rose-600/80 mt-1">{isMr ? "अपात्र अर्ज" : "Disapproved"}</div>
          </div>
        </div>

        {/* Filter and Search Bar */}
        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm mb-6">
          <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
            {/* Status Filter Tabs */}
            <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-lg overflow-x-auto">
              {[
                { key: "All", label: isMr ? "सर्व" : "All" },
                { key: "Pending", label: isMr ? "प्रलंबित" : "Pending" },
                { key: "Approved", label: isMr ? "मंजूर" : "Approved" },
                { key: "Rejected", label: isMr ? "नामंजूर" : "Rejected" },
              ].map((tab) => (
                <button
                  key={tab.key}
                  type="button"
                  onClick={() => handleFilterChange(tab.key)}
                  className={`px-3.5 py-1.5 rounded-md text-xs font-medium transition-all ${
                    statusFilter === tab.key
                      ? "bg-white text-slate-900 shadow-sm font-semibold"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Search Input & Refresh Button */}
            <form onSubmit={handleSearchSubmit} className="flex items-center gap-2">
              <div className="relative flex-1 sm:w-72">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={searchText}
                  onChange={(e) => setSearchText(e.target.value)}
                  placeholder={isMr ? "अर्ज क्र. किंवा सेवा शोधा..." : "Search App No, Track ID..."}
                  className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
                />
              </div>

              <button
                type="submit"
                disabled={isPending}
                className="px-3.5 py-2 bg-[#0a3275] text-white rounded-lg text-xs font-medium hover:bg-blue-800 transition-colors disabled:opacity-50"
              >
                {isMr ? "शोधा" : "Search"}
              </button>

              <button
                type="button"
                onClick={() => handleRefresh(searchText, statusFilter, data.pageNumber)}
                disabled={isPending}
                title={isMr ? "रिफ्रेश करा" : "Refresh"}
                className="p-2 border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-100 transition-colors disabled:opacity-50"
              >
                <RefreshCw className={`w-4 h-4 ${isPending ? "animate-spin text-blue-600" : ""}`} />
              </button>
            </form>
          </div>
        </div>

        {/* Applications List */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          {applications.length === 0 ? (
            <div className="py-16 px-4 text-center">
              <div className="w-14 h-14 mx-auto rounded-full bg-slate-100 flex items-center justify-center text-slate-400 mb-3">
                <FileText className="w-7 h-7" />
              </div>
              <h3 className="text-base font-semibold text-slate-800">
                {isMr ? "कोणतेही अर्ज आढळले नाहीत" : "No Applications Found"}
              </h3>
              <p className="text-xs text-slate-500 max-w-md mx-auto mt-1">
                {isMr
                  ? "आपले सरकारवरून सादर केलेले अर्ज येथे दिसतील. जर तुम्ही नुकताच अर्ज भरला असेल तर काही वेळात येथे अपडेट होईल."
                  : "Applications submitted from Aaple Sarkar will appear here. If you have recently applied, please refresh after a few moments."}
              </p>
              <div className="mt-4">
                <button
                  type="button"
                  onClick={() => {
                    setSearchText("");
                    setStatusFilter("All");
                    handleRefresh("", "All", 1);
                  }}
                  className="px-4 py-2 rounded-lg bg-blue-50 text-blue-700 text-xs font-medium hover:bg-blue-100 transition-colors"
                >
                  {isMr ? "सर्व फिल्टर रीसेट करा" : "Reset Filters"}
                </button>
              </div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50/80 text-slate-600 font-semibold border-b border-slate-200 uppercase tracking-wider text-[11px]">
                  <tr>
                    <th className="py-3 px-4 w-12 text-center">#</th>
                    <th className="py-3 px-4">{isMr ? "आपले सरकार ट्रॅक क्र." : "Aaple Sarkar Track ID"}</th>
                    <th className="py-3 px-4">{isMr ? "RTS अर्ज क्र." : "RTS Application No"}</th>
                    <th className="py-3 px-4">{isMr ? "सेवेचे नाव" : "Service Name"}</th>
                    <th className="py-3 px-4">{isMr ? "अर्ज दिनांक" : "Applied Date"}</th>
                    <th className="py-3 px-4">{isMr ? "सद्यस्थिती" : "Status"}</th>
                    <th className="py-3 px-4 text-right">{isMr ? "कृती" : "Action"}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {applications.map((item, index) => {
                    const isApproved =
                      item.status === "Approved" ||
                      item.applicationStatus?.toLowerCase().includes("approved");

                    return (
                      <tr key={item.applicationNo || item.aapleSarkarTrackId || index} className="hover:bg-slate-50/60 transition-colors">
                        <td className="py-3.5 px-4 text-center font-medium text-slate-400">
                          {(data.pageNumber - 1) * data.pageSize + index + 1}
                        </td>

                        {/* Aaple Sarkar Track ID */}
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-1.5">
                            <span className="font-mono font-semibold text-slate-900">
                              {item.aapleSarkarTrackId || "-"}
                            </span>
                            {item.aapleSarkarTrackId && (
                              <button
                                type="button"
                                onClick={() => copyToClipboard(item.aapleSarkarTrackId)}
                                title={isMr ? "कॉपी करा" : "Copy Track ID"}
                                className="text-slate-400 hover:text-slate-600 p-0.5 rounded transition-colors"
                              >
                                {copiedTrackId === item.aapleSarkarTrackId ? (
                                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                                ) : (
                                  <Copy className="w-3.5 h-3.5" />
                                )}
                              </button>
                            )}
                          </div>
                        </td>

                        {/* RTS Application No */}
                        <td className="py-3.5 px-4">
                          <span className="font-mono text-slate-800 font-medium">
                            {item.applicationNo || "-"}
                          </span>
                        </td>

                        {/* Service Name */}
                        <td className="py-3.5 px-4 max-w-xs">
                          <div className="font-medium text-slate-900 leading-snug">
                            {isMr ? item.serviceNameMr || item.serviceName : item.serviceName}
                          </div>
                          {item.mahaITServiceId > 0 && (
                            <div className="text-[10px] text-slate-400 mt-0.5">
                              ID: {item.mahaITServiceId}
                            </div>
                          )}
                        </td>

                        {/* Applied Date */}
                        <td className="py-3.5 px-4 text-slate-600 whitespace-nowrap">
                          {formatDate(item.createdDate)}
                        </td>

                        {/* Status Badge */}
                        <td className="py-3.5 px-4 whitespace-nowrap">
                          {getStatusBadge(item)}
                        </td>

                        {/* Action buttons */}
                        <td className="py-3.5 px-4 text-right whitespace-nowrap">
                          <div className="inline-flex items-center gap-1.5">
                            {/* Track / View Details */}
                            <button
                              type="button"
                              onClick={() => openTracking(item.applicationNo || item.aapleSarkarTrackId)}
                              className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-slate-200 text-slate-700 bg-white hover:bg-slate-50 text-xs font-medium shadow-2xs transition-colors"
                            >
                              <Eye className="w-3.5 h-3.5 text-blue-600" />
                              <span>{isMr ? "तपशील" : "Track"}</span>
                            </button>

                            {/* Download Certificate if Approved */}
                            {isApproved && (item.issuedCertificateGuid || item.certificateUrl) && (
                              <a
                                href={
                                  item.certificateUrl ||
                                  `/api/RtsCertificate/download/${item.issuedCertificateGuid}`
                                }
                                target="_blank"
                                rel="noreferrer"
                                className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 text-xs font-medium shadow-2xs transition-colors"
                              >
                                <Download className="w-3.5 h-3.5" />
                                <span>{isMr ? "प्रमाणपत्र" : "Certificate"}</span>
                              </a>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination bar */}
          {totalCount > data.pageSize && (
            <div className="py-3 px-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs text-slate-600">
              <div>
                {isMr
                  ? `एकूण ${totalCount} पैकी ${(data.pageNumber - 1) * data.pageSize + 1} ते ${Math.min(
                      data.pageNumber * data.pageSize,
                      totalCount
                    )} दाखवत आहे`
                  : `Showing ${(data.pageNumber - 1) * data.pageSize + 1} to ${Math.min(
                      data.pageNumber * data.pageSize,
                      totalCount
                    )} of ${totalCount}`}
              </div>

              <div className="flex items-center gap-1">
                <button
                  type="button"
                  disabled={data.pageNumber <= 1 || isPending}
                  onClick={() => handleRefresh(searchText, statusFilter, data.pageNumber - 1)}
                  className="px-2.5 py-1 rounded border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-50"
                >
                  {isMr ? "मागे" : "Previous"}
                </button>
                <span className="px-2 py-1 font-semibold text-slate-900">{data.pageNumber}</span>
                <button
                  type="button"
                  disabled={data.pageNumber * data.pageSize >= totalCount || isPending}
                  onClick={() => handleRefresh(searchText, statusFilter, data.pageNumber + 1)}
                  className="px-2.5 py-1 rounded border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-50"
                >
                  {isMr ? "पुढे" : "Next"}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Application Tracking Drawer */}
      {trackingOpen && (
        <ApplicationAndTrackingDrawer
          open={trackingOpen}
          onClose={() => {
            setTrackingOpen(false);
            setSelectedAppNo(undefined);
          }}
          initialSearchValue={selectedAppNo}
        />
      )}
    </div>
  );
}
