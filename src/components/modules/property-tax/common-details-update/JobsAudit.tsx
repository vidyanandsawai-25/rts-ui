"use client";
import { useMemo } from "react";
import { MasterTable, Select, SearchInput, Badge, TruncatedText } from "@/components/common";
import { Modal } from "@/components/common/Modal";
import { getJobsAuditColumns } from "./JobsAuditConstants";
import { UpdateHistoryItem, CommonDetailsUpdateActions } from "@/types/common-details-update/common-details-update.types";
import { PagedResponse } from "@/types/common.types";
import { useTranslations } from "next-intl";
import { format } from "date-fns";
import { DownloadButton } from "@/components/common/ActionButtons";
import { useJobsAudit } from "@/hooks/commonDetailsUpdate/useJobsAudit";

interface JobsAuditProps {
  initialData?: PagedResponse<UpdateHistoryItem> | null;
  initialUpdateHistoryDetail?: PagedResponse<import("@/types/common-details-update/common-details-update.types").UpdateHistoryDetailItem> | null;
  actions?: Partial<CommonDetailsUpdateActions>;
}

export const JobsAudit = ({ initialData, initialUpdateHistoryDetail, actions }: JobsAuditProps) => {
  const t = useTranslations("commonDetailsUpdate");

  const auditState = useJobsAudit({
    initialData,
    initialUpdateHistoryDetail,
    actions,
    t,
  });

  const {
    auditPage,
    auditPageSize,
    auditUser,
    searchTerm,
    handleSearchChange,
    handleUserChange,
    handlePageChange,
    handlePageSizeChange,
    userOptions,
    totalCount,
    data,
    selectedRow,
    isModalOpen,
    setIsModalOpen,
    modalPage,
    modalPageSize,
    modalTotalCount,
    modalTotalPages,
    modalSearchTerm,
    setModalSearchTerm,
    isLoadingDetails,
    isExporting,
    isModalExporting,
    handleExport,
    onModalExportClick,
    modalTableData,
    handleModalPageChange,
    handleModalPageSizeChange,
    updateUrlParams,
    handleViewClick,
  } = auditState;

  const columns = useMemo(() => getJobsAuditColumns(t, handleViewClick), [t, handleViewClick]);

  const modalColumns: import("@/components/common").Column<{ id: string; property: string; field: string; oldValue: string; newValue: string; }>[] = useMemo(() => [
    {
      key: "property",
      label: t("jobsAudit.modal.property") || "Property",
      headerClassName: "whitespace-nowrap",
      render: (_: unknown, row: { property: string }) => <TruncatedText text={row.property} className="text-sm font-medium text-slate-700 block truncate" />
    },
    {
      key: "field",
      label: t("jobsAudit.modal.field"),
      headerClassName: "whitespace-nowrap",
      render: (_: unknown, row: { field: string }) => <TruncatedText text={row.field} className="text-sm font-medium text-slate-700 block truncate" />
    },
    {
      key: "oldValue",
      label: t("jobsAudit.modal.oldValue"),
      headerClassName: "whitespace-nowrap",
      render: (_: unknown, row: { oldValue: string }) => <TruncatedText text={row.oldValue} className="text-sm text-slate-600 block truncate" />
    },
    {
      key: "newValue",
      label: t("jobsAudit.modal.newValue"),
      headerClassName: "whitespace-nowrap",
      render: (_: unknown, row: { newValue: string }) => <TruncatedText text={row.newValue} className="text-sm text-slate-600 block truncate" />
    }
  ], [t]);

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
          <DownloadButton 
            onClick={handleExport}
            isLoading={isExporting}
            label={t("jobsAudit.exportAudit")}
            className="flex items-center gap-2 px-4 py-2 border border-[#0F5FC2] text-[#0F5FC2] font-semibold rounded-lg hover:bg-blue-50 transition-colors whitespace-nowrap text-sm disabled:opacity-50"
          />
        </div>
      </div>

      {/* Bottom Section */}
      <div className="border border-blue-200 rounded-xl bg-white flex flex-col space-y-0 overflow-hidden">
        {/* Filters Row */}
        <div className="bg-[#F8FAFF] px-4 py-3 border-b border-blue-200">
          <div className="flex flex-col lg:flex-row gap-4 justify-between">
            <div className="flex flex-wrap items-center gap-3">
              <div className="w-full sm:w-48">
                <Select 
                  label={t("jobsAudit.filters.user")}
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
        onClose={() => {
          setIsModalOpen(false);
          updateUrlParams({ activityId: null });
        }}
        title={`${t("jobsAudit.modal.updateDetailsPrefix")}`}
        maxWidth="2xl"
      >
        <div className="flex flex-col gap-2">
          
          {/* Header Details */}
          {selectedRow && (
            <div className="flex flex-col gap-2">
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant="default" className="bg-[#E5F0FF] text-[#0057FF] border-transparent font-semibold">
                  {t("jobsAudit.modal.updateName")}: {selectedRow.updateName || "-"}
                </Badge>
                <Badge variant="secondary" className="font-semibold">
                  {t("jobsAudit.modal.updatedBy")}: {selectedRow.doneBy || "-"}
                </Badge>
                <Badge variant="secondary" className="font-semibold">
                  {t("jobsAudit.modal.date")}: {selectedRow.createdDate ? (() => {
                    try { return format(new Date(selectedRow.createdDate), "dd MMM yyyy, hh:mm a"); }
                    catch { return selectedRow.createdDate; }
                  })() : "-"}
                </Badge>
                <Badge variant="warning" className="font-semibold">
                  {t("jobsAudit.modal.ipDevice")}: {selectedRow.ipAddress || "-"}
                </Badge>
              </div>
              <div className="text-sm bg-slate-50 border border-slate-200 rounded-md px-3 py-2">
                <div className="text-slate-500 font-medium text-xs mb-1">{t("jobsAudit.modal.remarks")}</div>
                <div className="text-slate-800 break-words">{selectedRow.remarks || selectedRow.activityRemark || "-"}</div>
              </div>
            </div>
          )}

          {/* Master Table for Values */}
          <div className="rounded-lg overflow-hidden flex-1">
            <MasterTable
              columns={modalColumns}
              data={modalTableData}
              loading={isLoadingDetails}
              containerClassName="w-full text-sm"
              tableClassName="min-w-full"
              maxBodyHeightClassName="h-[300px]"
              pageNumber={modalPage}
              pageSize={modalPageSize}
              totalCount={modalTotalCount}
              totalPages={modalTotalPages}
              onPageChange={handleModalPageChange}
              onPageSizeChange={handleModalPageSizeChange}
              isPagination={true}
              isPageSize={true}
              pageSizeOptions={[5, 10, 20, 50]}
              paginationConfig={{
                enabled: true,
                showPageSizeSelector: true
              }}
              headerExtra={
                <div className="flex flex-wrap items-center justify-between gap-3 w-full">
                  <div className="w-full sm:w-64">
                    <SearchInput
                      placeholder={t("jobsAudit.modal.searchPlaceholder")}
                      value={modalSearchTerm}
                      onChange={setModalSearchTerm}
                      className="w-full !mb-0"
                    />
                  </div>
                  <DownloadButton
                    onClick={onModalExportClick}
                    isLoading={isModalExporting}
                    label={t("jobsAudit.modal.exportExcel")}
                    className="flex items-center gap-2 px-3 py-1.5 border border-[#0F5FC2] text-[#0F5FC2] font-semibold rounded-lg hover:bg-blue-50 transition-colors whitespace-nowrap text-xs disabled:opacity-50"
                  />
                </div>
              }
            />
          </div>
        </div>
      </Modal>
    </div>
  );
};
