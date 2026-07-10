"use client";

import { useState, useMemo } from "react";
import { useParams } from "next/navigation";
import { toast } from "sonner";
import { Card, CardHeader, CardTitle, CardContent, Select, Input, Button, Table } from "@/components/common";
import { type CmsApplication, mockCmsOfficers } from "@/lib/mock/rts/cms";

interface ReportsProps {
  initialApplications: CmsApplication[];
  masters: {
    departments: Array<{ id: string; name: string }>;
    services: Array<{ id: string; name: string; departmentId: string }>;
  };
}

type ReportType = "sla_compliance" | "officer_tat" | "appeals_disposal" | "revenue_summary";

export default function CmsReports({ initialApplications, masters }: ReportsProps) {
  const params = useParams();
  const locale = params?.locale || "en";
  const lang = locale === "mr" ? "mr" : "en";

  const [selectedReportType, setSelectedReportType] = useState<ReportType>("sla_compliance");
  const [reportGenerated, setReportGenerated] = useState(false);

  // Common filters
  const [filterDept, setFilterDept] = useState("All");
  const [filterService, setFilterService] = useState("All");
  const [filterFY, setFilterFY] = useState("FY 2026-27");
  const [fromDate, setFromDate] = useState("2026-06-01");
  const [toDate, setToDate] = useState("2026-06-30");

  // SLA Compliance Report specific filters
  const [applicationStatus, setApplicationStatus] = useState("All");
  const [slaStatus, setSlaStatus] = useState("All");

  // Officer TAT Report specific filters
  const [assignedOfficer, setAssignedOfficer] = useState("All");
  const [tatThreshold, setTatThreshold] = useState("");

  // Appeals Disposal Report specific filters
  const [appealStage, setAppealStage] = useState("All");
  const [appealStatus, setAppealStatus] = useState("All");

  // Revenue Report specific filters
  const [paymentMode, setPaymentMode] = useState("All");
  const [minAmount, setMinAmount] = useState("");

  // Cancel / Reset function
  const handleCancel = () => {
    setFilterDept("All");
    setFilterService("All");
    setFilterFY("FY 2026-27");
    setFromDate("2026-06-01");
    setToDate("2026-06-30");
    setSlaStatus("All");
    setApplicationStatus("All");
    setAssignedOfficer("All");
    setTatThreshold("");
    setAppealStage("All");
    setAppealStatus("All");
    setPaymentMode("All");
    setMinAmount("");
    setReportGenerated(false);
    toast.info("Report query filters reset.");
  };

  // Generate Report
  const handleShowReport = () => {
    setReportGenerated(true);
    toast.success("Operational query executed. Report generated successfully.");
  };

  // Filtered applications mapping and calculation
  const reportResults = useMemo(() => {
    if (!reportGenerated) return [];

    return initialApplications.map((app) => {
      const appNum = parseInt(app.id, 10) || 1000;
      
      // Determine SLA compliance and TAT
      const resolvedInDays = Math.max(1, (appNum % 8) + 2); // 2 to 9 days
      const slaCompliance = resolvedInDays <= app.slaDays ? "Within SLA" : "Beyond SLA";

      // Fee Paid and Payment Mode mapping
      const feePaid = appNum % 3 === 0 ? 150 : appNum % 3 === 1 ? 300 : 500;
      const paymentModeVal = appNum % 4 === 0 ? "UPI" : appNum % 4 === 1 ? "Card" : appNum % 4 === 2 ? "Net Banking" : "Cash";

      // Appeal mapping (for simulated appeals)
      const hasAppeal = appNum % 3 === 0;
      const appealStageVal = appNum % 6 === 0 ? "Second Appeal (SAA)" : "First Appeal (FAA)";
      const appealStatusVal = appNum % 4 === 0 ? "Disposed - Allowed" : appNum % 4 === 1 ? "Disposed - Rejected" : appNum % 4 === 2 ? "Hearing Scheduled" : "Pending Verification";
      const appealCaseNo = `APL/2026/${app.id}`;
      const appealSubmissionDate = new Date(new Date(app.submissionDate).getTime() + 10 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

      return {
        ...app,
        resolvedInDays,
        slaCompliance,
        feePaid,
        paymentMode: paymentModeVal,
        hasAppeal,
        appealStage: appealStageVal,
        appealStatus: appealStatusVal,
        appealCaseNo,
        appealSubmissionDate
      };
    }).filter(row => {
      // 1. Department Filter
      const deptMatch = filterDept === "All" || row.departmentId === filterDept;
      
      // 2. Service Filter
      const serviceMatch = filterService === "All" || row.serviceId === filterService;
      
      // 3. Date Range Filter
      const dateMatch = (!fromDate || row.submissionDate >= fromDate) &&
                        (!toDate || row.submissionDate <= toDate);

      if (!deptMatch || !serviceMatch || !dateMatch) return false;

      // 4. Report Type Specific Filters
      if (selectedReportType === "sla_compliance") {
        const statusMatch = applicationStatus === "All" || row.status === applicationStatus;
        const complianceMatch = slaStatus === "All" || row.slaCompliance === slaStatus;
        return statusMatch && complianceMatch;
      }
      
      if (selectedReportType === "officer_tat") {
        const officerMatch = assignedOfficer === "All" || row.assignedOfficerName === assignedOfficer;
        const tatMatch = !tatThreshold || row.resolvedInDays >= parseInt(tatThreshold, 10);
        return officerMatch && tatMatch;
      }

      if (selectedReportType === "appeals_disposal") {
        if (!row.hasAppeal) return false;
        const stageMatch = appealStage === "All" || row.appealStage === appealStage;
        const statusMatch = appealStatus === "All" || row.appealStatus === appealStatus;
        return stageMatch && statusMatch;
      }

      if (selectedReportType === "revenue_summary") {
        const modeMatch = paymentMode === "All" || row.paymentMode === paymentMode;
        const amountMatch = !minAmount || row.feePaid >= parseInt(minAmount, 10);
        return modeMatch && amountMatch;
      }

      return true;
    });
  }, [
    reportGenerated,
    selectedReportType,
    filterDept,
    filterService,
    fromDate,
    toDate,
    slaStatus,
    applicationStatus,
    assignedOfficer,
    tatThreshold,
    appealStage,
    appealStatus,
    paymentMode,
    minAmount,
    initialApplications
  ]);

  // Compute stats
  const reportStats = useMemo(() => {
    const len = reportResults.length;
    if (len === 0) {
      return { 
        card1Label: lang === "en" ? "Total Records" : "एकूण नोंदी", 
        card1Val: "0", 
        card2Label: lang === "en" ? "Primary Indicator" : "प्राथमिक सूचक", 
        card2Val: "0", 
        card3Label: lang === "en" ? "Compliance / Status" : "अनुपालन / स्थिती", 
        card3Val: "0%" 
      };
    }

    if (selectedReportType === "sla_compliance") {
      const withinSla = reportResults.filter(r => r.slaCompliance === "Within SLA").length;
      const rate = ((withinSla / len) * 100).toFixed(0);
      return {
        card1Label: lang === "en" ? "Total Applications Received" : "प्राप्त एकूण अर्ज",
        card1Val: lang === "en" ? `${len} Applications` : `${len} अर्ज`,
        card2Label: lang === "en" ? "SLA Compliant" : "SLA चे पालन केलेले",
        card2Val: lang === "en" ? `${withinSla} Applications` : `${withinSla} अर्ज`,
        card3Label: lang === "en" ? "Overall SLA Compliance Rate" : "एकूण SLA अनुपालन दर",
        card3Val: `${rate}%`
      };
    }

    if (selectedReportType === "officer_tat") {
      const totalTat = reportResults.reduce((sum, r) => sum + r.resolvedInDays, 0);
      const avgTat = (totalTat / len).toFixed(1);
      const delayed = reportResults.filter(r => r.resolvedInDays > r.slaDays).length;
      return {
        card1Label: lang === "en" ? "Total Cases Audited" : "एकूण मूल्यांकन केलेली प्रकरणे",
        card1Val: lang === "en" ? `${len} Cases` : `${len} प्रकरणे`,
        card2Label: lang === "en" ? "Average Action Turnaround Time" : "सरासरी प्रक्रिया वेळ",
        card2Val: lang === "en" ? `${avgTat} Days` : `${avgTat} दिवस`,
        card3Label: lang === "en" ? "Delayed Actions Tracked" : "विलंब झालेली प्रकरणे",
        card3Val: lang === "en" ? `${delayed} Cases` : `${delayed} प्रकरणे`
      };
    }

    if (selectedReportType === "appeals_disposal") {
      const disposed = reportResults.filter(r => r.appealStatus.startsWith("Disposed")).length;
      const disposalRate = ((disposed / len) * 100).toFixed(0);
      return {
        card1Label: lang === "en" ? "Total Appeals Filed" : "दाखल एकूण अपीले",
        card1Val: lang === "en" ? `${len} Appeal Cases` : `${len} अपील प्रकरणे`,
        card2Label: lang === "en" ? "Disposed Appeals" : "निकाल लावलेली अपीले",
        card2Val: lang === "en" ? `${disposed} Disposed` : `${disposed} निकाल लावलेली`,
        card3Label: lang === "en" ? "Disposal Rate" : "अपील निकाल दर",
        card3Val: `${disposalRate}%`
      };
    }

    // Default to revenue_summary
    const totalRev = reportResults.reduce((sum, r) => sum + r.feePaid, 0);
    const upiCount = reportResults.filter(r => r.paymentMode === "UPI").length;
    return {
      card1Label: lang === "en" ? "Transactions Logged" : "नोंदणीकृत व्यवहार",
      card1Val: lang === "en" ? `${len} Payments` : `${len} व्यवहार`,
      card2Label: lang === "en" ? "Total Fees Collected" : "एकूण जमा शुल्क",
      card2Val: `₹${totalRev.toLocaleString()}`,
      card3Label: lang === "en" ? "UPI Transactions" : "UPI व्यवहार",
      card3Val: `${upiCount} UPI`
    };
  }, [reportResults, selectedReportType, lang]);

  const handleExport = (format: "Excel" | "PDF") => {
    if (reportResults.length === 0) {
      toast.error(lang === "en" ? "No data available to export." : "निर्यात करण्यासाठी डेटा उपलब्ध नाही.");
      return;
    }
    toast.success(lang === "en" 
      ? `Exporting ${selectedReportType.toUpperCase()} report in ${format} format...` 
      : `${selectedReportType.toUpperCase()} अहवाल ${format} स्वरूपात निर्यात करत आहे...`);
  };

  // Options lists
  const reportTypeOptions = [
    { label: lang === "en" ? "RTS Pendency & SLA Compliance" : "SLA प्रलंबितता आणि अनुपालन अहवाल", value: "sla_compliance" },
    { label: lang === "en" ? "Officer Performance & TAT Audit" : "अधिकारी कामगिरी आणि सरासरी वेळ अहवाल", value: "officer_tat" },
    { label: lang === "en" ? "Appeals disposal & Status Report" : "अपील निकाल आणि स्थिती अहवाल", value: "appeals_disposal" },
    { label: lang === "en" ? "Service Fees & Revenue Summary" : "सेवा शुल्क आणि एकूण महसूल गोषवारा", value: "revenue_summary" }
  ];

  const deptOptions = [
    { label: lang === "en" ? "All Departments" : "सर्व विभाग", value: "All" },
    ...masters.departments.map(d => ({ label: d.name, value: d.id }))
  ];

  const serviceOptions = [
    { label: lang === "en" ? "All Services" : "सर्व सेवा", value: "All" },
    ...masters.services
      .filter(s => filterDept === "All" || s.departmentId === filterDept)
      .map(s => ({ label: s.name, value: s.id }))
  ];

  const fyOptions = [
    { label: "FY 2026-27", value: "FY 2026-27" },
    { label: "FY 2025-26", value: "FY 2025-26" }
  ];

  const applicationStatusOptions = [
    { label: lang === "en" ? "All Statuses" : "सर्व स्थिती", value: "All" },
    { label: lang === "en" ? "Approved" : "मंजूर", value: "Approved" },
    { label: lang === "en" ? "Rejected" : "नाकारलेले", value: "Rejected" },
    { label: lang === "en" ? "Pending Allocation" : "प्रलंबित वाटप", value: "Pending Allocation" },
    { label: lang === "en" ? "Verification In-Progress" : "पडताळणी प्रगतीपथावर", value: "Verification In-Progress" }
  ];

  const slaStatusOptions = [
    { label: lang === "en" ? "All Statuses" : "सर्व स्थिती", value: "All" },
    { label: lang === "en" ? "Within SLA Targets" : "SLA लक्ष्यामध्ये", value: "Within SLA" },
    { label: lang === "en" ? "Beyond SLA (Delayed)" : "SLA उल्लंघन (विलंब)", value: "Beyond SLA" }
  ];

  const officerOptions = useMemo(() => {
    return [
      { label: lang === "en" ? "All Officers" : "सर्व नियुक्त अधिकारी", value: "All" },
      ...mockCmsOfficers.map(o => ({ label: o.name, value: o.name }))
    ];
  }, [lang]);

  const appealStageOptions = [
    { label: lang === "en" ? "All Stages" : "सर्व टप्पे", value: "All" },
    { label: lang === "en" ? "First Appeal (FAA)" : "प्रथम अपील (FAA)", value: "First Appeal (FAA)" },
    { label: lang === "en" ? "Second Appeal (SAA)" : "द्वितीय अपील (SAA)", value: "Second Appeal (SAA)" }
  ];

  const appealStatusOptions = [
    { label: lang === "en" ? "All Statuses" : "सर्व स्थिती", value: "All" },
    { label: lang === "en" ? "Pending Verification" : "पडताळणी प्रलंबित", value: "Pending Verification" },
    { label: lang === "en" ? "Hearing Scheduled" : "सुनावणी नियोजित", value: "Hearing Scheduled" },
    { label: lang === "en" ? "Disposed - Allowed" : "निकाल - मंजूर", value: "Disposed - Allowed" },
    { label: lang === "en" ? "Disposed - Rejected" : "निकाल - नाकारलेले", value: "Disposed - Rejected" }
  ];

  const paymentModeOptions = [
    { label: lang === "en" ? "All Payment Modes" : "सर्व पेमेंट प्रकार", value: "All" },
    { label: "UPI", value: "UPI" },
    { label: "Card", value: "Card" },
    { label: "Net Banking", value: "Net Banking" },
    { label: "Cash", value: "Cash" }
  ];

  // Table Columns
  const reportTableColumns = useMemo(() => {
    const baseCols = [
      { label: lang === "en" ? "Application No" : "अर्ज क्रमांक", key: "applicationNo" },
      { label: lang === "en" ? "Citizen Name" : "नागरिकाचे नाव", key: "citizenName" },
      { label: lang === "en" ? "Service Profile" : "सेवा प्रकार", key: "serviceName" },
      { label: lang === "en" ? "Submission Date" : "अर्ज सादर दिनांक", key: "submissionDate" }
    ];

    if (selectedReportType === "sla_compliance") {
      return [
        ...baseCols,
        { label: lang === "en" ? "SLA Limit" : "SLA मर्यादा", key: "slaDays", render: (val: any) => lang === "en" ? `${val} Days` : `${val} दिवस` },
        {
          label: lang === "en" ? "SLA Compliance" : "SLA अनुपालन",
          key: "slaCompliance",
          render: (val: any) => (
            <span className={`rounded px-1.5 py-0.5 text-[11px] font-bold border ${
              val === "Within SLA" ? "bg-green-50 text-green-700 border-green-200" : "bg-rose-50 text-rose-700 border-rose-200"
            }`}>
              {lang === "en" ? val : (val === "Within SLA" ? "SLA अंतर्गत" : "SLA पलीकडे")}
            </span>
          )
        },
        { label: lang === "en" ? "Current Status" : "सध्याची स्थिती", key: "status" }
      ];
    }

    if (selectedReportType === "officer_tat") {
      return [
        ...baseCols,
        { label: lang === "en" ? "Assigned Officer" : "नियुक्त अधिकारी", key: "assignedOfficerName" },
        { label: lang === "en" ? "SLA Days" : "SLA दिवस", key: "slaDays", render: (val: any) => lang === "en" ? `${val} Days` : `${val} दिवस` },
        { label: lang === "en" ? "Actual TAT" : "वास्तविक प्रक्रिया वेळ", key: "resolvedInDays", render: (val: any) => lang === "en" ? `${val} Days` : `${val} दिवस` }
      ];
    }

    if (selectedReportType === "appeals_disposal") {
      return [
        { label: lang === "en" ? "Appeal Case No" : "अपील केस क्र.", key: "appealCaseNo" },
        { label: lang === "en" ? "Original App No" : "मूळ अर्ज क्र.", key: "applicationNo" },
        { label: lang === "en" ? "Citizen Name" : "नागरिकाचे नाव", key: "citizenName" },
        { label: lang === "en" ? "Appeal Stage" : "अपील टप्पा", key: "appealStage" },
        { label: lang === "en" ? "Appeal Date" : "अपील दिनांक", key: "appealSubmissionDate" },
        {
          label: lang === "en" ? "Appeal Status" : "अपील स्थिती",
          key: "appealStatus",
          render: (val: any) => (
            <span className={`rounded px-1.5 py-0.5 text-[11px] font-bold border ${
              val.includes("Allowed") ? "bg-green-50 text-green-700 border-green-200" :
              val.includes("Rejected") ? "bg-rose-50 text-rose-700 border-rose-200" :
              "bg-amber-50 text-amber-700 border-amber-200"
            }`}>
              {lang === "en" ? val : (
                val.includes("Allowed") ? "निकाल - मंजूर" :
                val.includes("Rejected") ? "निकाल - नाकारलेले" :
                val.includes("Hearing") ? "सुनावणी नियोजित" : "पडताळणी प्रलंबित"
              )}
            </span>
          )
        }
      ];
    }

    // Default to revenue_summary
    return [
      ...baseCols,
      { label: lang === "en" ? "Payment Mode" : "पेमेंट प्रकार", key: "paymentMode" },
      {
        label: lang === "en" ? "Amount Paid" : "जमा शुल्क",
        key: "feePaid",
        render: (val: any) => `₹${val}`
      }
    ];
  }, [selectedReportType, lang]);

  return (
    <div className="space-y-4">
      {/* Search Filter Box */}
      <Card className="border border-slate-200 bg-white shadow-sm overflow-hidden p-0">
        <CardHeader className="bg-slate-50 border-b border-slate-100 py-3 px-4">
          <CardTitle className="text-base font-bold text-slate-800">
            {lang === "en" ? "Operational Report Engine" : "परिचालन अहवाल प्रणाली"}
          </CardTitle>
        </CardHeader>
        
        <CardContent className="p-5 space-y-6">
          {/* Main 2 Masters & Report Selection */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Select
              label={lang === "en" ? "Select Report Type" : "अहवाल प्रकार निवडा"}
              value={selectedReportType}
              onChange={(_, val) => {
                setSelectedReportType(val as ReportType);
                setReportGenerated(false);
              }}
              options={reportTypeOptions}
            />

            <Select
              label={lang === "en" ? "Department" : "विभाग"}
              value={filterDept}
              onChange={(_, val) => {
                setFilterDept(val);
                setFilterService("All");
                setReportGenerated(false);
              }}
              options={deptOptions}
            />

            <Select
              label={lang === "en" ? "Service Profile" : "सेवा प्रकार"}
              value={filterService}
              onChange={(_, val) => {
                setFilterService(val);
                setReportGenerated(false);
              }}
              options={serviceOptions}
            />
          </div>

          {/* Dynamic Filters Section */}
          <div className="border-t border-slate-100 pt-4">
            <h3 className="text-xs font-bold text-slate-450 uppercase tracking-wider mb-4">
              {lang === "en" ? "Report Filter Parameters" : "अहवाल फिल्टर पॅरामीटर्स"}
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Select
                label={lang === "en" ? "Financial Year" : "आर्थिक वर्ष"}
                value={filterFY}
                onChange={(_, val) => {
                  setFilterFY(val);
                  setReportGenerated(false);
                }}
                options={fyOptions}
              />

              <Input
                label={lang === "en" ? "From Date" : "या तारखेपासून"}
                type="date"
                value={fromDate}
                onChange={e => {
                  setFromDate(e.target.value);
                  setReportGenerated(false);
                }}
              />

              <Input
                label={lang === "en" ? "To Date" : "या तारखेपर्यंत"}
                type="date"
                value={toDate}
                onChange={e => {
                  setToDate(e.target.value);
                  setReportGenerated(false);
                }}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              {selectedReportType === "sla_compliance" && (
                <>
                  <Select
                    label={lang === "en" ? "Application Status" : "अर्ज स्थिती"}
                    value={applicationStatus}
                    onChange={(_, val) => {
                      setApplicationStatus(val);
                      setReportGenerated(false);
                    }}
                    options={applicationStatusOptions}
                  />

                  <Select
                    label={lang === "en" ? "SLA Compliance Status" : "SLA अनुपालन स्थिती"}
                    value={slaStatus}
                    onChange={(_, val) => {
                      setSlaStatus(val);
                      setReportGenerated(false);
                    }}
                    options={slaStatusOptions}
                  />
                </>
              )}

              {selectedReportType === "officer_tat" && (
                <>
                  <Select
                    label={lang === "en" ? "Assigned Officer" : "नियुक्त अधिकारी"}
                    value={assignedOfficer}
                    onChange={(_, val) => {
                      setAssignedOfficer(val);
                      setReportGenerated(false);
                    }}
                    options={officerOptions}
                  />

                  <Input
                    label={lang === "en" ? "Turnaround Time Greater Than (Days)" : "यापेक्षा जास्त प्रक्रिया वेळ (दिवस)"}
                    type="number"
                    placeholder="e.g. 5"
                    value={tatThreshold}
                    onChange={e => {
                      setTatThreshold(e.target.value);
                      setReportGenerated(false);
                    }}
                  />
                </>
              )}

              {selectedReportType === "appeals_disposal" && (
                <>
                  <Select
                    label={lang === "en" ? "Appeal Stage" : "अपील टप्पा"}
                    value={appealStage}
                    onChange={(_, val) => {
                      setAppealStage(val);
                      setReportGenerated(false);
                    }}
                    options={appealStageOptions}
                  />

                  <Select
                    label={lang === "en" ? "Appeal Status" : "अपील स्थिती"}
                    value={appealStatus}
                    onChange={(_, val) => {
                      setAppealStatus(val);
                      setReportGenerated(false);
                    }}
                    options={appealStatusOptions}
                  />
                </>
              )}

              {selectedReportType === "revenue_summary" && (
                <>
                  <Select
                    label={lang === "en" ? "Payment Mode" : "पेमेंट प्रकार"}
                    value={paymentMode}
                    onChange={(_, val) => {
                      setPaymentMode(val);
                      setReportGenerated(false);
                    }}
                    options={paymentModeOptions}
                  />

                  <Input
                    label={lang === "en" ? "Minimum Amount (₹)" : "किमान रक्कम (₹)"}
                    type="number"
                    placeholder="e.g. 100"
                    value={minAmount}
                    onChange={e => {
                      setMinAmount(e.target.value);
                      setReportGenerated(false);
                    }}
                  />
                </>
              )}
            </div>
          </div>

          {/* Action Row */}
          <div className="flex justify-center items-center gap-3 pt-4 border-t border-slate-100">
            <Button variant="success" onClick={handleShowReport}>
              {lang === "en" ? "Show ▦" : "अहवाल पहा ▦"}
            </Button>
            <Button variant="success" onClick={() => handleExport("Excel")}>
              {lang === "en" ? "Report Search 📥" : "अहवाल डाउनलोड 📥"}
            </Button>
            <Button variant="danger" onClick={handleCancel}>
              {lang === "en" ? "Cancel ✕" : "रद्द करा ✕"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Generated Report Section */}
      {reportGenerated && (
        <div className="space-y-4 pt-2">
          {/* Summary KPIs */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <Card className="p-4 flex flex-col justify-between border border-slate-200 bg-white shadow-sm">
              <span className="text-[10px] font-bold text-slate-400 uppercase">{reportStats.card1Label}</span>
              <span className="text-xl font-extrabold text-slate-800 mt-2">{reportStats.card1Val}</span>
            </Card>

            <Card className="p-4 flex flex-col justify-between border border-slate-200 bg-white shadow-sm">
              <span className="text-[10px] font-bold text-slate-400 uppercase">{reportStats.card2Label}</span>
              <span className="text-xl font-extrabold text-green-700 mt-2">{reportStats.card2Val}</span>
            </Card>

            <Card className="p-4 flex flex-col justify-between border border-slate-200 bg-white shadow-sm">
              <span className="text-[10px] font-bold text-slate-400 uppercase">{reportStats.card3Label}</span>
              <span className="text-xl font-extrabold text-rose-700 mt-2">{reportStats.card3Val}</span>
            </Card>
          </div>

          {/* Results Table */}
          <Card className="border border-slate-200 bg-white shadow-sm overflow-hidden p-0">
            <Table
              data={reportResults as any}
              columns={reportTableColumns}
              emptyMessage={lang === "en" 
                ? "No records match the selected operational filters." 
                : "निवडलेल्या फिल्टर निकषांशी जुळणाऱ्या कोणत्याही नोंदी आढळल्या नाहीत."}
            />
          </Card>
        </div>
      )}
    </div>
  );
}
