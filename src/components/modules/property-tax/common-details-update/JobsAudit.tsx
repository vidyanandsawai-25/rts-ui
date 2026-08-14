"use client";
/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars, react-hooks/exhaustive-deps */
import { useMemo, useState, useEffect, useCallback } from "react";
import { Download, Loader2 } from "lucide-react";
import { MasterTable, Select, SearchInput, Label, useToast } from "@/components/common";
import { Modal } from "@/components/common/Modal";
import { useDebounce } from "@/hooks/useDebounce";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { getJobsAuditColumns } from "./JobsAuditConstants";
import { UpdateHistoryItem, UpdateHistoryFilterParams } from "@/types/common-details-update/common-details-update.types";
import { CommonDetailsUpdateActions } from "@/types/common-details-update/common-details-update.types";
import { PagedResponse } from "@/types/common.types";
import { useTranslations } from "next-intl";
import { format } from "date-fns";

interface JobsAuditProps {
  initialData?: PagedResponse<UpdateHistoryItem> | null;
  actions?: Partial<CommonDetailsUpdateActions>;
}

export const JobsAudit = ({ initialData, actions }: JobsAuditProps) => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const t = useTranslations("commonDetailsUpdate");
  const toast = useToast();

  const auditPage = Number(searchParams.get("auditPage")) || 1;
  const auditPageSize = Number(searchParams.get("auditPageSize")) || 5;
  const auditUser = searchParams.get("auditUser") || "all";
  const auditSearch = searchParams.get("auditSearch") || "";

  const [searchTerm, setSearchTerm] = useState(auditSearch);
  const [usersList, setUsersList] = useState<string[]>([]);
  const [isExporting, setIsExporting] = useState(false);
  const [selectedRow, setSelectedRow] = useState<UpdateHistoryItem | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleViewClick = useCallback((row: UpdateHistoryItem) => {
    setSelectedRow(row);
    setIsModalOpen(true);
  }, []);

  const columns = useMemo(() => getJobsAuditColumns(t, handleViewClick), [t, handleViewClick]);

  const modalColumns: import("@/components/common").Column<{ id: string; field: string; oldValue: string; newValue: string; }>[] = useMemo(() => [
    {
      key: "field",
      label: t("jobsAudit.modal.field"),
      headerClassName: "whitespace-nowrap",
      render: (_: unknown, row: { field: string }) => <span className="text-sm font-medium text-slate-700">{row.field}</span>
    },
    {
      key: "oldValue",
      label: t("jobsAudit.modal.oldValue"),
      headerClassName: "whitespace-nowrap",
      render: (_: unknown, row: { oldValue: string }) => <span className="text-sm text-slate-600 break-all">{row.oldValue}</span>
    },
    {
      key: "newValue",
      label: t("jobsAudit.modal.newValue"),
      headerClassName: "whitespace-nowrap",
      render: (_: unknown, row: { newValue: string }) => <span className="text-sm text-slate-600 break-all">{row.newValue}</span>
    }
  ], [t]);

  // Fetch users for dropdown on mount
  useEffect(() => {
    const fetchUsers = async () => {
      if (!actions?.getUpdateHistoryAction) return;
      try {
        // Fetch a large chunk to extract unique users
        const response = await actions.getUpdateHistoryAction({ PageSize: 1000 });
        if (response.success && response.data?.items) {
          const uniqueUsers = Array.from(new Set(response.data.items.map((item: any) => item.username))).filter(Boolean) as string[];
          setUsersList(uniqueUsers.sort());
        }
      } catch (e) {
        // Handle error silently
      }
    };
    fetchUsers();
  }, [actions?.getUpdateHistoryAction]);

  const updateUrlParams = useCallback((params: Record<string, string | number | null>) => {
    const newParams = new URLSearchParams(searchParams.toString());
    Object.entries(params).forEach(([key, value]) => {
      if (value === null || value === "" || (key === 'auditUser' && value === 'all')) {
        newParams.delete(key);
      } else {
        newParams.set(key, String(value));
      }
    });
    // Preserve tab
    newParams.set("tab", "auditMonitor");
    router.replace(`${pathname}?${newParams.toString()}`, { scroll: false });
  }, [searchParams, pathname, router]);

  const handlePageChange = (newPage: number) => {
    updateUrlParams({ auditPage: newPage });
  };

  const handlePageSizeChange = (newSize: number) => {
    updateUrlParams({ auditPage: 1, auditPageSize: newSize });
  };

  const handleUserChange = (user: string) => {
    updateUrlParams({ auditPage: 1, auditUser: user });
  };

  const debouncedSearchTerm = useDebounce(searchTerm, 500);

  useEffect(() => {
    // Only update url if value actually changed from URL
    if (debouncedSearchTerm !== auditSearch) {
      updateUrlParams({ auditPage: 1, auditSearch: debouncedSearchTerm });
    }
  }, [debouncedSearchTerm, auditSearch, updateUrlParams]);

  const handleSearchChange = (val: string) => {
    setSearchTerm(val);
  };

  const handleExport = async () => {
    if (!actions?.exportUpdateHistoryAction) return;
    setIsExporting(true);
    try {
      const params: UpdateHistoryFilterParams = {
        SearchTerm: auditSearch,
        Username: auditUser !== "all" ? auditUser : undefined,
      };
      const result = await actions.exportUpdateHistoryAction(params);
      if (result.success) {
        if (result.data) {
          const link = document.createElement("a");
          link.href = `data:application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;base64,${result.data}`;
          link.download = `Update_History_${new Date().getTime()}.xlsx`;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          toast.success(t("messages.exportSuccess"));
        } else {
          toast.error(t("messages.exportFailed"));
        }
      } else {
        toast.error(result.error || t("messages.exportFailed"));
      }
    } catch (error) {
      toast.error(t("messages.exportFailed"));
    } finally {
      setIsExporting(false);
    }
  };

  const userOptions = useMemo(() => {
    return [
      { label: t("jobsAudit.filters.allUsers"), value: "all" },
      ...usersList.map(u => ({ label: u, value: u }))
    ];
  }, [usersList, t]);

  const totalCount = initialData?.totalCount || 0;
  const data = (initialData?.items || []).slice(0, auditPageSize);

  return (
    <div className="flex flex-col space-y-2 h-full">
      {/* Top Section */}
      <div className="border border-blue-200 rounded-xl bg-white overflow-hidden">
        {/* Header Row */}
        <div className="bg-[#F8FAFF] px-4 py-3 border-b border-blue-200 flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div>
            <h3 className="text-sm font-semibold text-[#1E3A8A]">{t("jobsAudit.title")}</h3>
            <p className="text-xs text-gray-500 mt-0.5">
              {t("jobsAudit.description")}
            </p>
          </div>
          <button 
            onClick={handleExport}
            disabled={isExporting}
            className="flex items-center gap-2 px-4 py-2 border border-[#0F5FC2] text-[#0F5FC2] font-semibold rounded-lg hover:bg-blue-50 transition-colors whitespace-nowrap text-sm disabled:opacity-50"
          >
            {isExporting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
            {t("jobsAudit.exportAudit")}
          </button>
        </div>

        {/* <div className="p-4 bg-white">
          Stats Row
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
            <DashboardCard label={t("jobsAudit.stats.totalJobs") || "Total Jobs"} value={totalCount.toString()} valueColor="text-[#0F5FC2]" className="[&>div.absolute]:!bg-[#0F5FC2]" />
            <DashboardCard label={t("jobsAudit.stats.completed") || "Completed"} value="0" valueColor="text-[#10B981]" className="[&>div.absolute]:!bg-[#10B981]" />
            <DashboardCard label={t("jobsAudit.stats.running") || "Running"} value="0" valueColor="text-[#0F5FC2]" className="[&>div.absolute]:!bg-[#0F5FC2]" />
            <DashboardCard label={t("jobsAudit.stats.failed") || "Failed / Error"} value="0" valueColor="text-[#F59E0B]" className="[&>div.absolute]:!bg-[#F59E0B]" />
            <DashboardCard label={t("jobsAudit.stats.approvalPending") || "Approval Pending"} value="0" valueColor="text-[#F59E0B]" className="[&>div.absolute]:!bg-[#F59E0B]" />
          </div>
        </div> */}
      </div>

      {/* Bottom Section */}
      <div className="border border-blue-200 rounded-xl bg-white flex flex-col space-y-0 overflow-hidden">
        {/* Filters Row */}
        <div className="bg-[#F8FAFF] px-4 py-3 border-b border-blue-200">
          <div className="flex flex-col lg:flex-row gap-4 justify-between">
            <div className="flex flex-wrap items-center gap-3">
              <div className="w-full sm:w-48">
                <Label className="block text-xs font-bold text-[#1E3A8A] mb-1">{t("jobsAudit.filters.user")}</Label>
                <Select 
                  options={userOptions} 
                  value={auditUser} 
                  onChange={(e) => handleUserChange(e.target.value)} 
                  className="w-full"
                />
              </div>
            </div>
            
            <div className="w-full lg:w-72 self-end">
              <SearchInput
                placeholder={t("jobsAudit.filters.searchPlaceholder")}
                value={searchTerm}
                onChange={handleSearchChange}
                className="w-full"
              />
            </div>
          </div>
        </div>

        {/* Data Table */}
        <div className="overflow-auto bg-slate-50 p-2">
          <div className="rounded-lg border border-slate-200 bg-white overflow-hidden flex flex-col">
            <MasterTable
              columns={columns}
              data={data}
              loading={!initialData && auditPage === 1}
              containerClassName="w-full text-sm"
              tableClassName="min-w-[1200px]"
              maxBodyHeightClassName="h-[300px]"
              pageNumber={auditPage}
              pageSize={auditPageSize}
              totalCount={totalCount}
              totalPages={initialData?.totalPages || 1}
              onPageChange={handlePageChange}
              onPageSizeChange={handlePageSizeChange}
              paginationConfig={{
                enabled: true,
                showPageSizeSelector: true
              }}
            />
          </div>
        </div>
      </div>

      <Modal
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={`${t("jobsAudit.modal.updateDetailsPrefix")} : ${selectedRow?.wardNo || ''}${selectedRow?.propertyNo ? `-${selectedRow.propertyNo}` : ''}${selectedRow?.partitionNo ? `-${selectedRow.partitionNo}` : ''}`}
        maxWidth="2xl"
      >
        <div className="p-4 overflow-auto max-h-[80vh] flex flex-col gap-4">
          
          {/* Header Details */}
          {selectedRow && (
            <div className="flex flex-col gap-3">
              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center rounded-full bg-[#E5F0FF] px-2.5 py-1 text-xs font-semibold text-[#0057FF]">
                  {t("jobsAudit.modal.updateName")}: {selectedRow.updateName || "-"}
                </span>
                <span className="inline-flex items-center rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-700">
                  {t("jobsAudit.modal.updatedBy")}: {selectedRow.username || "-"}
                </span>
                <span className="inline-flex items-center rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-700">
                  {t("jobsAudit.modal.date")}: {selectedRow.updatedDate ? (() => {
                    try { return format(new Date(selectedRow.updatedDate), "dd MMM yyyy, hh:mm a"); }
                    catch { return selectedRow.updatedDate; }
                  })() : "-"}
                </span>
                <span className="inline-flex items-center rounded-full bg-yellow-50 px-2.5 py-1 text-xs font-semibold text-yellow-800 border border-yellow-200">
                  {t("jobsAudit.modal.ipDevice")}: {selectedRow.ipAddress || "-"}
                </span>
              </div>
              <div className="text-sm bg-slate-50 border border-slate-200 rounded-md px-3 py-2">
                <div className="text-slate-500 font-medium text-xs mb-1">{t("jobsAudit.modal.remarks")}</div>
                <div className="text-slate-800 break-words">{selectedRow.remarks || "-"}</div>
              </div>
            </div>
          )}

          {/* Master Table for Values */}
          <div className="border border-slate-200 rounded-lg overflow-hidden flex-1">
            {(() => {
              let oldValues: Record<string, any> = {};
              let newValues: Record<string, any> = {};
              try {
                if (selectedRow?.oldValue) oldValues = JSON.parse(selectedRow.oldValue);
                if (selectedRow?.newValue) newValues = JSON.parse(selectedRow.newValue);
              } catch (e) {}

              const allKeys = Array.from(new Set([...Object.keys(oldValues), ...Object.keys(newValues)]));

              const tableData = allKeys.map(key => ({
                id: key,
                field: key,
                oldValue: oldValues[key] !== undefined && oldValues[key] !== null ? String(oldValues[key]) : "-",
                newValue: newValues[key] !== undefined && newValues[key] !== null ? String(newValues[key]) : "-"
              }));

              return (
                <MasterTable
                  columns={modalColumns}
                  data={tableData}
                  loading={false}
                  containerClassName="w-full text-sm"
                  tableClassName="min-w-full"
                  paginationConfig={{ enabled: false }}
                />
              );
            })()}
          </div>
        </div>
      </Modal>
    </div>
  );
};
