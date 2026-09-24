"use client";

import { PageContainer } from "@/components/common/PageContainer";
import { MasterTable } from "@/components/common/MasterTable";
import { EditButton, DeleteButton, AddButton } from "@/components/common/ActionButtons";
import { SearchInput } from "@/components/common/SearchInput";
import { Select } from "@/components/common/select";
import { useState } from "react";
import { Button } from "@/components/common/ActionButton";
import { BookOpen } from "lucide-react";
import { Modal } from "@/components/common/Modal";
import { OkButton } from "@/components/common/ActionButtons";

import type { ConnectionType, ConnectionTypeMasterProps } from "@/types/waterBill/connectionTypeMaster.types";
import { getConnectionTypeColumns } from "./connectionTypeColumns";
import { useConnectionTypeMaster } from "@/hooks/water-bill/connection-type-master";

export function ConnectionTypeMaster({ data }: Readonly<ConnectionTypeMasterProps>) {
  const [isUserManualOpen, setIsUserManualOpen] = useState(false);
  const {
    t,
    items,
    pageNumber,
    pageSize,
    totalCount,
    totalPages,
    search,
    handleSearchChange,
    statusFilter,
    handleStatusFilterChange,
    changePage,
    handlePageSizeChange,
    handleAdd,
    handleEdit,
    handleDelete,
  } = useConnectionTypeMaster(data);

  const columns = getConnectionTypeColumns((key) => {
    try {
      return t(key as Parameters<typeof t>[0]);
    } catch {
      return "";
    }
  });

  return (
    <PageContainer>
      <div className="w-full flex flex-col gap-4">
        {/* Header Section (Separated from table) */}
        <div className="w-full bg-white rounded-xl shadow-sm border border-blue-200">
          <div className="p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h2 className="text-[17px] font-bold text-[#1E3A8A]">
                {t("title")}
              </h2>
              <p className="text-sm text-gray-500 mt-1">
                {t("description")}
              </p>
            </div>
            <div className="flex flex-col md:flex-row items-center gap-3">
              <SearchInput
                value={search}
                onChange={handleSearchChange}
                placeholder={t("searchPlaceholder")}
                className="mb-0 w-full md:w-[280px] text-gray-900"
              />
              {/* Status Filter Dropdown */}
              <div className="w-full md:w-36">
                <Select
                  value={statusFilter}
                  onChange={(_e, val) => handleStatusFilterChange(val)}
                  options={[
                    { value: "all", label: t("filters.all") },
                    { value: "active", label: t("filters.active") },
                    { value: "inactive", label: t("filters.inactive") },
                  ]}
                  selectSize="sm"
                  className="w-full"
                  ariaLabel={t("filters.all")}
                />
              </div>
              <Button 
                variant="secondary" 
                size="sm" 
                icon={BookOpen} 
                onClick={() => setIsUserManualOpen(true)}
              >
                {t("userManualBtn")}
              </Button>
              <AddButton
                label={t("addButton")}
                onClick={handleAdd}
              />
            </div>
          </div>
        </div>

        {/* Table Section */}
        <MasterTable<ConnectionType>
          columns={columns}
          data={items}
          loading={false}
          height="lg"
          pageNumber={pageNumber}
          pageSize={pageSize}
          totalCount={totalCount}
          totalPages={totalPages}
          onPageChange={changePage}
          onPageSizeChange={handlePageSizeChange}
          paginationConfig={{ enabled: true, showPageSizeSelector: true }}
          renderActions={(row) => (
            <>
              <EditButton onClick={() => handleEdit(row)} />
              <DeleteButton onClick={() => handleDelete(row)} />
            </>
          )}
          getRowKey={(row) => String(row.id)}
        />
      </div>

      <Modal
        open={isUserManualOpen}
        onClose={() => setIsUserManualOpen(false)}
        title={t("userManual.title")}
        maxWidth="md"
      >
        <div className="flex flex-col gap-6">
          <div className="space-y-3 text-slate-700 text-sm font-medium leading-relaxed">
            <p>{t("userManual.desc1")}</p>
            <p>{t("userManual.desc2")}</p>
            <p>{t("userManual.desc3")}</p>
            <p>{t("userManual.desc4")}</p>
            
            <div className="bg-orange-50 text-orange-600 border border-orange-200 p-3 rounded-md mt-4">
              {t("userManual.warning")}
            </div>
          </div>

          <div className="flex justify-end gap-3 border-t border-slate-100 pt-4">
            <OkButton onClick={() => setIsUserManualOpen(false)} />
          </div>
        </div>
      </Modal>
    </PageContainer>
  );
}
