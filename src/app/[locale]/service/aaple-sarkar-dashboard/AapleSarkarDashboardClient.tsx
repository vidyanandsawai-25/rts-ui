"use client";

import React, { useState, useTransition } from "react";
import Link from "next/link";
import {
  FileText,
  Search,
  RefreshCw,
  CheckCircle2,
  Clock,
  XCircle,
  Copy,
  Check,
  Download,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
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
}: AapleSarkarDashboardClientProps) {
  const isMr = locale === "mr";
  const [data, setData] = useState<AapleSarkarDashboardData>(initialData);
  const [searchText, setSearchText] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [pageSize, setPageSize] = useState<number>(initialData.pageSize || 10);
  const [isPending, startTransition] = useTransition();

  // Copied track ID state
  const [copiedTrackId, setCopiedTrackId] = useState<string | null>(null);

  const applications = data.applications || [];

  // Summary counts across all citizen's applications
  const totalCount = data.totalCount ?? 0;
  const pendingCount = data.pendingCount ?? 0;
  const approvedCount = data.approvedCount ?? 0;
  const rejectedCount = data.rejectedCount ?? 0;

  const currentPage = data.pageNumber || 1;
  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));

  const handleRefresh = (
    search = searchText,
    filter = statusFilter,
    page = currentPage,
    size = pageSize
  ) => {
    startTransition(async () => {
      const res = await fetchAapleSarkarDashboardAction(cuid, search, filter, page, size);
      setData(res);
    });
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleRefresh(searchText, statusFilter, 1, pageSize);
  };

  const handleFilterChange = (filter: string) => {
    setStatusFilter(filter);
    handleRefresh(searchText, filter, 1, pageSize);
  };

  const handlePageChange = (newPage: number) => {
    if (newPage < 1 || newPage > totalPages || newPage === currentPage) return;
    handleRefresh(searchText, statusFilter, newPage, pageSize);
  };

  const handlePageSizeChange = (newSize: number) => {
    setPageSize(newSize);
    handleRefresh(searchText, statusFilter, 1, newSize);
  };

  const copyToClipboard = (text: string) => {
    if (navigator?.clipboard) {
      navigator.clipboard.writeText(text);
      setCopiedTrackId(text);
      setTimeout(() => setCopiedTrackId(null), 2000);
    }
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

  const startRecord = totalCount === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const endRecord = Math.min(currentPage * pageSize, totalCount);

  return (
    <div className="max-w-7xl mx-auto py-4 sm:py-6 space-y-6">
      {/* KPI Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total */}
        <div className="bg-white rounded-xl border border-slate-200 p-4 sm:p-5 shadow-sm hover:shadow transition-shadow">
          <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
            <span>{isMr ? "एकूण अर्ज" : "Total Applications"}</span>
            <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600">
              <FileText className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-bold text-slate-900 mt-2">{totalCount}</div>
          <div className="text-[11px] text-slate-400 mt-1">{isMr ? "सर्व सेवांचे अर्ज" : "All RTS services"}</div>
        </div>

        {/* Pending */}
        <div className="bg-white rounded-xl border border-amber-200/80 p-4 sm:p-5 shadow-sm hover:shadow transition-shadow bg-amber-50/20">
          <div className="flex items-center justify-between text-amber-700 text-xs font-medium">
            <span>{isMr ? "प्रलंबित / प्रक्रियेत" : "In Process"}</span>
            <div className="w-8 h-8 rounded-lg bg-amber-100 flex items-center justify-center text-amber-600">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-bold text-amber-900 mt-2">{pendingCount}</div>
          <div className="text-[11px] text-amber-600/80 mt-1">{isMr ? "विभागीय स्तरावर प्रलंबित" : "Under review"}</div>
        </div>

        {/* Approved */}
        <div className="bg-white rounded-xl border border-emerald-200/80 p-4 sm:p-5 shadow-sm hover:shadow transition-shadow bg-emerald-50/20">
          <div className="flex items-center justify-between text-emerald-700 text-xs font-medium">
            <span>{isMr ? "मंजूर झालेले" : "Approved"}</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-100 flex items-center justify-center text-emerald-600">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-bold text-emerald-900 mt-2">{approvedCount}</div>
          <div className="text-[11px] text-emerald-600/80 mt-1">{isMr ? "प्रमाणपत्र जारी झाले" : "Certificates issued"}</div>
        </div>

        {/* Rejected */}
        <div className="bg-white rounded-xl border border-rose-200/80 p-4 sm:p-5 shadow-sm hover:shadow transition-shadow bg-rose-50/20">
          <div className="flex items-center justify-between text-rose-700 text-xs font-medium">
            <span>{isMr ? "नामंजूर अर्ज" : "Rejected"}</span>
            <div className="w-8 h-8 rounded-lg bg-rose-100 flex items-center justify-center text-rose-600">
              <XCircle className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-bold text-rose-900 mt-2">{rejectedCount}</div>
          <div className="text-[11px] text-rose-600/80 mt-1">{isMr ? "अपात्र ठरलेले अर्ज" : "Disapproved"}</div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
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
              className="px-3.5 py-2 bg-[#0a3275] text-white rounded-lg text-xs font-semibold hover:bg-blue-800 transition-colors disabled:opacity-50"
            >
              {isMr ? "शोधा" : "Search"}
            </button>

            <button
              type="button"
              onClick={() => handleRefresh(searchText, statusFilter, currentPage, pageSize)}
              disabled={isPending}
              title={isMr ? "रिफ्रेश करा" : "Refresh"}
              className="p-2 border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-100 transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${isPending ? "animate-spin text-blue-600" : ""}`} />
            </button>
          </form>
        </div>
      </div>

      {/* Applications Table */}
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
                ? "आपले सरकारवरून सादर केलेले आपले अर्ज येथे दिसतील."
                : "Applications submitted from Aaple Sarkar will appear here."}
            </p>
            <div className="mt-4">
              <button
                type="button"
                onClick={() => {
                  setSearchText("");
                  setStatusFilter("All");
                  handleRefresh("", "All", 1, pageSize);
                }}
                className="px-4 py-2 rounded-lg bg-blue-50 text-blue-700 text-xs font-semibold hover:bg-blue-100 transition-colors"
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
                  <th className="py-3 px-4 text-center">{isMr ? "कृती" : "Action"}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {applications.map((item, index) => {
                  return (
                    <tr
                      key={item.applicationNo || item.aapleSarkarTrackId || index}
                      className="hover:bg-slate-50/70 transition-colors"
                    >
                      <td className="py-3.5 px-4 text-center font-medium text-slate-400">
                        {(currentPage - 1) * pageSize + index + 1}
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

                      {/* Service Name (WITHOUT MahaIT ID) */}
                      <td className="py-3.5 px-4 max-w-xs">
                        <div className="font-medium text-slate-900 leading-snug">
                          {isMr ? item.serviceNameMr || item.serviceName : item.serviceName}
                        </div>
                      </td>

                      {/* Applied Date */}
                      <td className="py-3.5 px-4 text-slate-600 whitespace-nowrap">
                        {formatDate(item.createdDate)}
                      </td>

                      {/* Status Badge */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        {getStatusBadge(item)}
                      </td>

                      {/* Action Links */}
                      <td className="py-3.5 px-4 text-center whitespace-nowrap">
                        <div className="flex items-center justify-center gap-2">
                          {item.certificateUrl && (
                            <a
                              href={item.certificateUrl}
                              target="_blank"
                              rel="noreferrer"
                              title={isMr ? "प्रमाणपत्र डाउनलोड करा" : "Download Certificate"}
                              className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-emerald-50 text-emerald-700 hover:bg-emerald-100 text-xs font-medium border border-emerald-200 transition-colors"
                            >
                              <Download className="w-3.5 h-3.5" />
                              {isMr ? "प्रमाणपत्र" : "Certificate"}
                            </a>
                          )}

                          {item.trackingUrl && (
                            <Link
                              href={item.trackingUrl}
                              title={isMr ? "अर्ज ट्रॅक करा" : "Track Application"}
                              className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium transition-colors"
                            >
                              <ExternalLink className="w-3.5 h-3.5" />
                              {isMr ? "तपशील" : "Track"}
                            </Link>
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
        {totalCount > 0 && (
          <div className="py-3 px-4 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-600">
            {/* Count Info & Page Size */}
            <div className="flex items-center gap-3">
              <div>
                {isMr
                  ? `एकूण ${totalCount} पैकी ${startRecord} ते ${endRecord} दाखवत आहे`
                  : `Showing ${startRecord} to ${endRecord} of ${totalCount}`}
              </div>

              <div className="flex items-center gap-1.5">
                <span className="text-slate-400">|</span>
                <span className="text-slate-500">{isMr ? "प्रति पृष्ठ:" : "Rows:"}</span>
                <select
                  value={pageSize}
                  onChange={(e) => handlePageSizeChange(Number(e.target.value))}
                  disabled={isPending}
                  className="bg-white border border-slate-200 rounded px-2 py-0.5 text-xs text-slate-700 focus:outline-none focus:ring-1 focus:ring-blue-500"
                >
                  <option value={5}>5</option>
                  <option value={10}>10</option>
                  <option value={20}>20</option>
                  <option value={50}>50</option>
                </select>
              </div>
            </div>

            {/* Page Navigation */}
            <div className="flex items-center gap-1">
              <button
                type="button"
                disabled={currentPage <= 1 || isPending}
                onClick={() => handlePageChange(currentPage - 1)}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 disabled:opacity-40 disabled:hover:bg-white transition-colors"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
                {isMr ? "मागे" : "Prev"}
              </button>

              {/* Page Number Buttons */}
              {Array.from({ length: totalPages }, (_, i) => i + 1)
                .filter((p) => p === 1 || p === totalPages || Math.abs(p - currentPage) <= 1)
                .reduce<(number | string)[]>((acc, p, idx, arr) => {
                  if (idx > 0 && p - (arr[idx - 1] as number) > 1) {
                    acc.push("...");
                  }
                  acc.push(p);
                  return acc;
                }, [])
                .map((p, idx) => {
                  if (typeof p === "string") {
                    return (
                      <span key={`ellipsis-${idx}`} className="px-1 text-slate-400">
                        ...
                      </span>
                    );
                  }

                  const isActive = p === currentPage;
                  return (
                    <button
                      key={p}
                      type="button"
                      disabled={isPending}
                      onClick={() => handlePageChange(p)}
                      className={`min-w-7 h-7 px-2 rounded text-xs font-medium transition-colors ${
                        isActive
                          ? "bg-[#0a3275] text-white font-semibold"
                          : "bg-white border border-slate-200 hover:bg-slate-50 text-slate-700"
                      }`}
                    >
                      {p}
                    </button>
                  );
                })}

              <button
                type="button"
                disabled={currentPage >= totalPages || isPending}
                onClick={() => handlePageChange(currentPage + 1)}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 disabled:opacity-40 disabled:hover:bg-white transition-colors"
              >
                {isMr ? "पुढे" : "Next"}
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
