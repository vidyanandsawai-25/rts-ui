"use client";

import { useState, useEffect, useTransition, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Eye, Download, Search, Sparkles } from "lucide-react";
import { Card } from "@/components/common";
import type { CmsApplication } from "@/lib/mock/rts/cms";

interface CmsInboxProps {
  data: CmsApplication[];
  pageNumber: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
  masters: {
    departments: Array<{ id: string; name: string }>;
    services: Array<{ id: string; name: string; departmentId: string }>;
  };
  locale: string;
  filters: {
    q: string;
    status: string;
    deptId: string;
    serviceId: string;
    priority: string; // repurposed as Category
    officerId: string; // repurposed as Document Status
  };
}

export default function CmsInbox({
  data,
  pageNumber,
  pageSize: _pageSize,
  totalCount,
  totalPages,
  masters,
  locale,
  filters
}: CmsInboxProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const lang = locale === "mr" ? "mr" : "en";

  const [localSearch, setLocalSearch] = useState(filters.q);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [showFilters, setShowFilters] = useState(false);

  // 1. From-To Date filter states
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  useEffect(() => {
    const handler = setTimeout(() => {
      if (localSearch !== filters.q) {
        updateQueryParam("q", localSearch);
      }
    }, 500);

    return () => clearTimeout(handler);
  }, [localSearch]);

  useEffect(() => {
    setLocalSearch(filters.q);
  }, [filters.q]);

  const updateQueryParam = (key: string, value: string) => {
    const nextParams = new URLSearchParams(searchParams.toString());
    if (value && value !== "All") {
      nextParams.set(key, value);
    } else {
      nextParams.delete(key);
    }
    nextParams.set("page", "1");

    startTransition(() => {
      router.push(`/${locale}/cms/inbox?${nextParams.toString()}`);
    });
  };

  const handleClearFilters = () => {
    setLocalSearch("");
    setSelectedIds([]);
    setFromDate("");
    setToDate("");
    startTransition(() => {
      router.push(`/${locale}/cms/inbox`);
    });
  };

  const handlePageChange = (page: number) => {
    const nextParams = new URLSearchParams(searchParams.toString());
    nextParams.set("page", String(page));
    startTransition(() => {
      router.push(`/${locale}/cms/inbox?${nextParams.toString()}`);
    });
  };

  const filteredServicesList = masters.services.filter(
    s => filters.deptId === "All" || s.departmentId === filters.deptId
  );

  // Compute practical columns locally to avoid schema mismatch
  const computedData = useMemo(() => {
    return data.map(row => {
      // Deterministic mock calculations based on application id
      const appNum = parseInt(row.id, 10) || 1000;
      
      const category = appNum % 3 === 0 ? "Residential" : appNum % 3 === 1 ? "Commercial" : "Industrial";
      const categoryMr = appNum % 3 === 0 ? "निवासी" : appNum % 3 === 1 ? "व्यावसायिक" : "औद्योगिक";

      const documentStatus = appNum % 4 === 0 ? "Pending Correction" : appNum % 4 === 1 ? "In Review" : "All Verified";
      const documentStatusMr = appNum % 4 === 0 ? "त्रुटी दुरुस्ती प्रलंबित" : appNum % 4 === 1 ? "पुनरावलोकनात" : "सर्व दस्तऐवज पडताळणीकृत";

      let scrutinyStage = "Clerk Scrutiny";
      if (row.status === "Approved") scrutinyStage = "Final Approval Sign-off";
      else if (row.status === "Rejected") scrutinyStage = "Returned/Rejected";
      else if (row.status === "Verification In-Progress") scrutinyStage = "Field Inspection Phase";
      else if (row.status === "Pending Allocation") scrutinyStage = "Document Verification";

      // Calculate Last Date (due date) based on submission date and SLA days
      const subDate = new Date(row.submissionDate);
      subDate.setDate(subDate.getDate() + row.slaDays);
      const lastDate = subDate.toISOString().split("T")[0];

      return {
        ...row,
        category,
        categoryMr,
        documentStatus,
        documentStatusMr,
        scrutinyStage,
        lastDate,
        source: row.source || (appNum % 2 === 0 ? "RTS" : "Aaple Sarkar"),
        assignedOfficer: row.assignedOfficerName || "Unassigned"
      };
    });
  }, [data]);

  const stats = useMemo(() => {
    const list = computedData;
    const total = list.length;
    
    const online = list.filter(app => (parseInt(app.id, 10) || 0) % 3 === 0).length;
    const office = total - online;
    
    const pending = list.filter(app => app.status !== "Approved" && app.status !== "Rejected").length;
    const rejected = list.filter(app => app.status === "Rejected").length;
    const approved = list.filter(app => app.status === "Approved").length;
    
    const clerkCorrection = list.filter(app => app.documentStatus === "Pending Correction").length;
    
    const asstSuperintendent = list.filter(app => app.assignedOfficerId === "emp-103").length;
    const superintendent = list.filter(app => app.assignedOfficerId === "emp-104").length;
    
    return {
      total,
      office,
      online,
      pending,
      rejected,
      approved,
      clerkCorrection,
      asstSuperintendent,
      superintendent
    };
  }, [computedData]);

  // Clientside sub-filtering for priority (rep. Source), officerId (rep. Document Status), and Date Range
  const filteredData = useMemo(() => {
    return computedData.filter(row => {
      const source = parseInt(row.id, 10) % 2 === 0 ? "RTS" : "Aaple Sarkar";
      const sourceMatch =
        filters.priority === "All" ||
        source.toLowerCase() === filters.priority.toLowerCase();
      
      const docMatch =
        filters.officerId === "All" ||
        row.documentStatus.toLowerCase() === filters.officerId.toLowerCase();

      // Date Range Match
      const dateVal = row.submissionDate; // "2026-06-25"
      const fromMatch = !fromDate || dateVal >= fromDate;
      const toMatch = !toDate || dateVal <= toDate;

      return sourceMatch && docMatch && fromMatch && toMatch;
    });
  }, [computedData, filters.priority, filters.officerId, fromDate, toDate]);

  const getStatusColor = (status: string) => {
    if (status === "Approved") return "bg-green-50 text-green-700 border border-green-200";
    if (status === "Rejected") return "bg-rose-50 text-rose-700 border border-rose-200";
    if (status === "Pending Allocation") return "bg-cyan-50 text-cyan-700 border border-cyan-200";
    return "bg-amber-50 text-amber-700 border border-amber-200";
  };



  return (
    <div className="space-y-4">
      {/* Title Header with Export Action */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-800">
            {lang === "en" ? "Application queue" : "अर्ज रांग"}
          </h1>
          <p className="text-[13px] text-slate-400 mt-0.5">
            {lang === "en" ? "All incoming applications from RTS portal" : "आरटीएस पोर्टलवरून आलेले सर्व अर्ज"}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowFilters(prev => !prev)}
            className={`inline-flex items-center gap-1.5 rounded-xl border px-3 py-1.5 text-[13px] font-bold shadow-sm transition ${
              showFilters
                ? "bg-[#4b70a6] text-white border-[#4b70a6] hover:bg-[#3d5a8a]"
                : "bg-white text-slate-650 border-slate-200 hover:bg-slate-50"
            }`}
          >
            <Search className="h-3.5 w-3.5" />
            {showFilters 
              ? (lang === "en" ? "Hide More Filters" : "अधिक फिल्टर्स लपवा")
              : (lang === "en" ? "Show More Filters" : "अधिक फिल्टर्स दाखवा")}
          </button>
          
          <button
            onClick={() => window.alert("Exporting application records queue...")}
            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-[13px] font-bold text-slate-600 shadow-sm transition hover:bg-slate-50"
          >
            <Download className="h-3.5 w-3.5" />
            {lang === "en" ? "Export" : "निर्यात करा"}
          </button>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="flex gap-3 overflow-x-auto pb-2 items-stretch">
        <div className="flex flex-col justify-between rounded-xl border-l-4 p-3 shadow-sm bg-white border-l-slate-400 bg-slate-50/50 min-w-[130px] flex-1">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
            {lang === "en" ? "Total applications" : "एकूण अर्ज"}
          </span>
          <span className="text-lg font-extrabold text-slate-800 mt-1">{stats.total}</span>
        </div>

        <div className="flex flex-col justify-between rounded-xl border-l-4 p-3 shadow-sm bg-white border-l-pink-400 bg-pink-50/50 min-w-[150px] flex-1">
          <span className="text-[10px] font-bold text-pink-750 uppercase tracking-wider">
            {lang === "en" ? "Applications received in office" : "कार्यालयात प्राप्त झालेले अर्ज"}
          </span>
          <span className="text-lg font-extrabold text-pink-700 mt-1">{stats.office}</span>
        </div>

        <div className="flex flex-col justify-between rounded-xl border-l-4 p-3 shadow-sm bg-white border-l-blue-400 bg-blue-50/50 min-w-[150px] flex-1">
          <span className="text-[10px] font-bold text-blue-700 uppercase tracking-wider">
            {lang === "en" ? "Applications received online" : "ऑनलाईन प्राप्त झालेले अर्ज"}
          </span>
          <span className="text-lg font-extrabold text-blue-700 mt-1">{stats.online}</span>
        </div>

        <div className="flex flex-col justify-between rounded-xl border-l-4 p-3 shadow-sm bg-white border-l-amber-500 bg-amber-50/50 min-w-[130px] flex-1">
          <span className="text-[10px] font-bold text-amber-600 uppercase tracking-wider">
            {lang === "en" ? "Pending applications" : "प्रलंबित अर्ज"}
          </span>
          <span className="text-lg font-extrabold text-amber-600 mt-1">{stats.pending}</span>
        </div>

        <div className="flex flex-col justify-between rounded-xl border-l-4 p-3 shadow-sm bg-white border-l-rose-500 bg-rose-50/50 min-w-[130px] flex-1">
          <span className="text-[10px] font-bold text-rose-600 uppercase tracking-wider">
            {lang === "en" ? "Applications rejected" : "नाकारलेले अर्ज"}
          </span>
          <span className="text-lg font-extrabold text-rose-600 mt-1">{stats.rejected}</span>
        </div>

        <div className="flex flex-col justify-between rounded-xl border-l-4 p-3 shadow-sm bg-white border-l-emerald-500 bg-emerald-50/50 min-w-[130px] flex-1">
          <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider">
            {lang === "en" ? "Approved Application" : "मंजूर अर्ज"}
          </span>
          <span className="text-lg font-extrabold text-emerald-600 mt-1">{stats.approved}</span>
        </div>

        <div className="flex flex-col justify-between rounded-xl border-l-4 p-3 shadow-sm bg-white border-l-amber-500 bg-amber-50/50 min-w-[150px] flex-1">
          <span className="text-[10px] font-bold text-amber-600 uppercase tracking-wider">
            {lang === "en" ? "Clerk Correction Pending" : "लिपिक दुरुस्ती प्रलंबित अर्ज"}
          </span>
          <span className="text-lg font-extrabold text-amber-600 mt-1">{stats.clerkCorrection}</span>
        </div>

        {/* Thick blue vertical line */}
        <div className="border-r-4 border-blue-600 self-stretch mx-1 rounded"></div>

        <div className="flex flex-col justify-between rounded-xl border-l-4 p-3 shadow-sm bg-white border-l-indigo-500 bg-indigo-50/50 min-w-[180px] flex-1">
          <span className="text-[10px] font-bold text-indigo-700 uppercase tracking-wider">
            {lang === "en" ? "Assistant Superintendent Pending" : "सहाय्यक अधीक्षक प्रलंबित अर्ज"}
          </span>
          <span className="text-lg font-extrabold text-indigo-700 mt-1">{stats.asstSuperintendent}</span>
        </div>

        <div className="flex flex-col justify-between rounded-xl border-l-4 p-3 shadow-sm bg-white border-l-cyan-500 bg-cyan-50/50 min-w-[180px] flex-1">
          <span className="text-[10px] font-bold text-cyan-700 uppercase tracking-wider">
            {lang === "en" ? "Superintendent of Tax Pending" : "कर अधीक्षक प्रलंबित अर्ज"}
          </span>
          <span className="text-lg font-extrabold text-cyan-700 mt-1">{stats.superintendent}</span>
        </div>
      </div>

      {/* Main Table Grid wrapped in Common Card Component */}
      <Card className="p-4 border border-slate-200 bg-white shadow-sm space-y-4">
        {/* Mandatory Filters (Always Shown) */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 items-end">
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">{lang === "en" ? "Search" : "शोधा"}</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                <Search className="h-3.5 w-3.5" />
              </span>
              <input
                type="text"
                placeholder={lang === "en" ? "Search by ID, name..." : "आयडी, नावाने शोधा..."}
                value={localSearch}
                onChange={e => setLocalSearch(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 py-1.5 pl-9 pr-3 text-[13px] font-semibold text-slate-800 placeholder-slate-400 focus:border-teal-500 focus:bg-white focus:outline-none"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">{lang === "en" ? "Department" : "विभाग"}</label>
            <select
              value={filters.deptId}
              onChange={e => updateQueryParam("deptId", e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-1.5 text-[13px] font-semibold text-slate-800 focus:border-teal-500 focus:bg-white focus:outline-none"
            >
              <option value="All">{lang === "en" ? "All departments" : "सर्व विभाग"}</option>
              {masters.departments.map(d => (
                <option key={d.id} value={d.id}>
                  {d.name}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">{lang === "en" ? "Service" : "सेवा"}</label>
            <select
              value={filters.serviceId}
              onChange={e => updateQueryParam("serviceId", e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-1.5 text-[13px] font-semibold text-slate-800 focus:border-teal-500 focus:bg-white focus:outline-none"
            >
              <option value="All">{lang === "en" ? "All services" : "सर्व सेवा"}</option>
              {filteredServicesList.map(s => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">{lang === "en" ? "Status" : "अर्जाची स्थिती"}</label>
            <select
              value={filters.status}
              onChange={e => updateQueryParam("status", e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-1.5 text-[13px] font-semibold text-slate-800 focus:border-teal-500 focus:bg-white focus:outline-none"
            >
              <option value="All">{lang === "en" ? "All statuses" : "सर्व स्थिती"}</option>
              <option value="Pending Allocation">{lang === "en" ? "Pending Allocation" : "पडताळणी प्रलंबित"}</option>
              <option value="Verification In-Progress">{lang === "en" ? "Verification In-Progress" : "पडताळणी सुरू"}</option>
              <option value="Approved">{lang === "en" ? "Approved" : "मंजूर"}</option>
              <option value="Rejected">{lang === "en" ? "Rejected" : "नाकारलेले"}</option>
            </select>
          </div>
        </div>

        {/* Additional Collapsible Filters */}
        {showFilters && (
          <div className="pt-3 border-t border-slate-100 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 items-end animate-fadeIn">
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">{lang === "en" ? "Source" : "स्रोत"}</label>
              <select
                value={filters.priority}
                onChange={e => updateQueryParam("priority", e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-1.5 text-[13px] font-semibold text-slate-800 focus:border-teal-500 focus:bg-white focus:outline-none"
              >
                <option value="All">{lang === "en" ? "All Sources" : "सर्व स्रोत"}</option>
                <option value="RTS">{lang === "en" ? "RTS" : "आरटीएस"}</option>
                <option value="Aaple Sarkar">{lang === "en" ? "Aaple Sarkar" : "आपले सरकार"}</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">{lang === "en" ? "Documents" : "दस्तऐवज"}</label>
              <select
                value={filters.officerId}
                onChange={e => updateQueryParam("officerId", e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-1.5 text-[13px] font-semibold text-slate-800 focus:border-teal-500 focus:bg-white focus:outline-none"
              >
                <option value="All">{lang === "en" ? "All document statuses" : "सर्व दस्तऐवज स्थिती"}</option>
                <option value="All Verified">{lang === "en" ? "All Verified" : "सर्व पडताळणीकृत"}</option>
                <option value="Pending Correction">{lang === "en" ? "Pending Correction" : "त्रुटी दुरुस्ती प्रलंबित"}</option>
                <option value="In Review">{lang === "en" ? "In Review" : "पुनरावलोकनात"}</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">{lang === "en" ? "From Date" : "या तारखेपासून"}</label>
              <input
                type="date"
                value={fromDate}
                onChange={e => setFromDate(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-1.5 text-[13px] font-semibold text-slate-800 focus:border-teal-500 focus:bg-white focus:outline-none"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">{lang === "en" ? "To Date" : "या तारखेपर्यंत"}</label>
              <input
                type="date"
                value={toDate}
                onChange={e => setToDate(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-1.5 text-[13px] font-semibold text-slate-800 focus:border-teal-500 focus:bg-white focus:outline-none"
              />
            </div>

            <div className="pb-1.5 flex items-center justify-end">
              <button
                onClick={handleClearFilters}
                className="text-[13px] font-bold text-[#4b70a6] hover:underline"
              >
                {lang === "en" ? "Clear Filters" : "फिल्टर्स साफ करा"}
              </button>
            </div>
          </div>
        )}

        <div className="pt-2 border-t border-slate-100">
          {isPending ? (
            <div className="flex h-64 items-center justify-center bg-white/50 backdrop-blur-sm">
              <span className="text-[13px] font-semibold text-slate-500">Updating application queue...</span>
            </div>
          ) : filteredData.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center bg-white">
              <Sparkles className="h-10 w-10 text-slate-300 mb-3" />
              <h3 className="text-[13px] font-bold text-slate-700">No applications found</h3>
              <p className="text-[11px] text-slate-400 mt-1 max-w-[280px]">
                Try adjusting your search keywords or active filters.
              </p>
            </div>
          ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 text-left text-[13px] text-slate-600">
              <thead className="bg-[#4b70a6] text-white">
                <tr>
                  <th className="px-4 py-3 w-10 text-center border-r border-[#3d5a8a]">
                    <input
                      type="checkbox"
                      checked={selectedIds.length === filteredData.length && filteredData.length > 0}
                      onChange={e => {
                        if (e.target.checked) {
                          setSelectedIds(filteredData.map(d => d.id));
                        } else {
                          setSelectedIds([]);
                        }
                      }}
                      className="h-3.5 w-3.5 rounded border-slate-300 text-[#4b70a6] focus:ring-[#4b70a6]"
                    />
                  </th>
                  <th className="px-4 py-3 text-[12px] font-bold uppercase tracking-wider border-r border-[#3d5a8a]">{lang === "en" ? "App ID" : "अर्जाचा आयडी"}</th>
                  <th className="px-4 py-3 text-center text-[12px] font-bold uppercase tracking-wider border-r border-[#3d5a8a]">{lang === "en" ? "Source" : "स्रोत"}</th>
                  <th className="px-4 py-3 text-[12px] font-bold uppercase tracking-wider border-r border-[#3d5a8a]">{lang === "en" ? "Citizen" : "नागरिक"}</th>
                  <th className="px-4 py-3 text-[12px] font-bold uppercase tracking-wider border-r border-[#3d5a8a]">{lang === "en" ? "Service" : "सेवा"}</th>
                  <th className="px-4 py-3 text-[12px] font-bold uppercase tracking-wider border-r border-[#3d5a8a]">{lang === "en" ? "App Date" : "अर्ज दिनांक"}</th>
                  <th className="px-4 py-3 text-[12px] font-bold uppercase tracking-wider border-r border-[#3d5a8a]">{lang === "en" ? "Last Date" : "अंतिम तारीख"}</th>
                  <th className="px-4 py-3 text-center text-[12px] font-bold uppercase tracking-wider border-r border-[#3d5a8a]">{lang === "en" ? "Remaining Days" : "उर्वरित दिवस"}</th>
                  <th className="px-4 py-3 text-center text-[12px] font-bold uppercase tracking-wider border-r border-[#3d5a8a]">{lang === "en" ? "Status" : "स्थिती"}</th>
                  <th className="px-4 py-3 text-center text-[12px] font-bold uppercase tracking-wider">{lang === "en" ? "Actions" : "कृती"}</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredData.map(row => {
                  const isAapleSarkar = row.source === "Aaple Sarkar";
                  return (
                    <tr
                      key={row.id}
                      className={`transition-colors cursor-pointer ${
                        isAapleSarkar ? "bg-[#fdfaf5] hover:bg-[#faf2e6]" : "bg-white hover:bg-slate-50"
                      }`}
                      onClick={() => router.push(`/${locale}/cms/applications/${row.id}`)}
                    >
                      <td 
                        className={`px-4 py-3 text-center border-l-4 transition-colors ${
                          row.source === "RTS" ? "border-l-[#4b70a6]" : "border-l-orange-500"
                        }`} 
                        onClick={e => e.stopPropagation()}
                      >
                        <input
                          type="checkbox"
                          checked={selectedIds.includes(row.id)}
                          onChange={e => {
                            if (e.target.checked) {
                              setSelectedIds(prev => [...prev, row.id]);
                            } else {
                              setSelectedIds(prev => prev.filter(id => id !== row.id));
                            }
                          }}
                          className="h-3.5 w-3.5 rounded border-slate-300 text-[#4b70a6] focus:ring-[#4b70a6]"
                        />
                      </td>
                      <td className="px-4 py-3 font-extrabold text-slate-900">{row.applicationNo}</td>
                      <td className="px-4 py-3 text-center">
                        {row.source === "RTS" ? (
                          <span className="inline-flex items-center rounded-full bg-indigo-50 border border-indigo-200 px-2 py-0.5 text-[11px] font-bold text-indigo-700">
                            {lang === "en" ? "RTS" : "आरटीएस"}
                          </span>
                        ) : (
                          <span className="inline-flex items-center rounded-full bg-orange-50 border border-orange-200 px-2 py-0.5 text-[11px] font-bold text-orange-700">
                            {lang === "en" ? "Aaple Sarkar" : "आपले सरकार"}
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3 font-bold text-slate-800">{row.citizenName}</td>
                      <td className="px-4 py-3">
                        <div className="flex flex-col">
                          <span className="font-bold text-slate-900">{row.serviceName}</span>
                          <span className="text-[11px] font-bold text-slate-450">{row.departmentName}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 font-bold text-slate-750">{row.submissionDate}</td>
                      <td className="px-4 py-3 font-bold text-slate-750">{row.lastDate}</td>
                      <td className="px-4 py-3 text-center">
                        {row.remainingDays <= 3 ? (
                          <span className="inline-flex items-center rounded-lg bg-rose-50 border border-rose-200 px-2.5 py-0.5 text-[11px] font-extrabold text-rose-700">
                            {lang === "en" ? `${row.remainingDays} Days Left` : `${row.remainingDays} दिवस बाकी`}
                          </span>
                        ) : row.remainingDays <= 7 ? (
                          <span className="inline-flex items-center rounded-lg bg-amber-50 border border-amber-200 px-2.5 py-0.5 text-[11px] font-extrabold text-amber-700">
                            {lang === "en" ? `${row.remainingDays} Days Left` : `${row.remainingDays} दिवस बाकी`}
                          </span>
                        ) : (
                          <span className="inline-flex items-center rounded-lg bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 text-[11px] font-extrabold text-emerald-700">
                            {lang === "en" ? `${row.remainingDays} Days Left` : `${row.remainingDays} दिवस बाकी`}
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className={`rounded-full px-2 py-0.5 text-[11px] font-bold ${getStatusColor(row.status)}`}>
                          {row.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center" onClick={e => e.stopPropagation()}>
                        <button
                          onClick={() => router.push(`/${locale}/cms/applications/${row.id}`)}
                          className="inline-flex h-7 px-2.5 items-center gap-1 rounded-xl border border-slate-200 text-[#4b70a6] bg-slate-50/50 hover:bg-slate-50 transition text-[11px] font-bold"
                          title="View Details"
                        >
                          <Eye className="h-3.5 w-3.5" />
                          {lang === "en" ? "View" : "पहा"}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

        {/* Footer actions and pagination bar */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between px-4 py-3 border-t border-slate-100 bg-slate-50 text-[13px]">
          <div className="flex items-center gap-2">
            <span className="text-slate-400 font-medium">
              Showing {filteredData.length} of {totalCount} applications
            </span>
          </div>

          <div className="flex items-center gap-3">
            {/* Bulk actions */}
            {selectedIds.length > 0 && (
              <div className="flex items-center gap-2 mr-2">
                <span className="text-[13px] text-slate-500 font-bold">
                  {selectedIds.length} selected
                </span>
                <button
                  onClick={e => {
                    e.stopPropagation();
                    window.alert(`Escalating ${selectedIds.length} applications...`);
                    setSelectedIds([]);
                  }}
                  className="px-2.5 py-1 rounded-lg border border-red-200 bg-red-50 text-red-700 hover:bg-red-100 transition font-bold text-[11px]"
                >
                  Bulk escalate
                </button>
                <button
                  onClick={e => {
                    e.stopPropagation();
                    window.alert(`Assigning ${selectedIds.length} applications to officer...`);
                    setSelectedIds([]);
                  }}
                  className="px-2.5 py-1 rounded-lg border border-blue-200 bg-blue-50 text-[#4b70a6] hover:bg-blue-100 transition font-bold text-[11px]"
                >
                  Bulk assign
                </button>
              </div>
            )}

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="flex gap-1">
                <button
                  disabled={pageNumber === 1}
                  onClick={() => handlePageChange(pageNumber - 1)}
                  className="rounded-lg border border-slate-200 px-3 py-1 font-bold hover:bg-white transition disabled:opacity-50 text-[11px]"
                >
                  Previous
                </button>
                <button
                  disabled={pageNumber === totalPages}
                  onClick={() => handlePageChange(pageNumber + 1)}
                  className="rounded-lg border border-slate-200 px-3 py-1 font-bold hover:bg-white transition disabled:opacity-50 text-[11px]"
                >
                  Next
                </button>
              </div>
            )}
          </div>
        </div>
      </Card>
    </div>
  );
}
