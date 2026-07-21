"use client";

import { useMemo, useState, useTransition } from "react";
import { useTranslations } from "next-intl";
import { Landmark } from "lucide-react";
import {
  AddButton,
  Button,
  Card,
  DeleteButton,
  Drawer,
  EditButton,
  Input,
  Label,
  MasterTable,
  SearchInput,
  StatusBadge,
  useConfirm,
} from "@/components/common";
import type { Column } from "@/components/common/MasterTable";
import { toast } from "sonner";

interface Department {
  id: string;
  name: string;
}

interface SaveDepartmentResponse {
  success: boolean;
  department?: Department;
}

interface UpdateDepartmentResponse {
  success: boolean;
  department?: Department;
}

interface DeleteDepartmentResponse {
  success: boolean;
}

interface RtsDepartmentConfigProps {
  departments: Department[];

  saveDepartment: (
    name: string
  ) => Promise<SaveDepartmentResponse>;

  updateDepartment: (
    id: string,
    name: string
  ) => Promise<UpdateDepartmentResponse>;

  deleteDepartment: (
    id: string
  ) => Promise<DeleteDepartmentResponse>;
}

type DepartmentRow = Record<string, unknown> & {
  id: string;
  srNo: number;
  name: string;
  status: string;
};

export default function RtsDepartmentConfig({
  departments: initialDepartments,
  saveDepartment,
  updateDepartment,
  deleteDepartment,
}: RtsDepartmentConfigProps) {
  const t = useTranslations("common");
  const tRts = useTranslations("rts");
  const { confirm } = useConfirm();

  const [isPending, startTransition] = useTransition();

  /**
   * Department State
   */
  const [departments, setDepartments] =
    useState<Department[]>(initialDepartments);

  /**
   * Search
   */
  const [search, setSearch] = useState("");

  /**
   * Pagination
   */
  const [page, setPage] = useState(1);

  /**
   * Selected Row
   */
  const [selectedDepartmentId, setSelectedDepartmentId] =
    useState<string | null>(null);

  /**
   * Drawer
   */
  const [drawerOpen, setDrawerOpen] = useState(false);

  const [drawerMode, setDrawerMode] = useState<
    "add" | "edit"
  >("add");

  const [editingDepartment, setEditingDepartment] =
    useState<Department | null>(null);

  /**
   * Form
   */
  const [departmentName, setDepartmentName] =
    useState("");

  /**
   * Search Handler
   */
  const handleSearchChange = (value: string) => {
    setSearch(value);
    setPage(1);
  };

  /**
   * Row Selection
   */
  const handleRowSelect = (id: string | null) => {
    setSelectedDepartmentId(id);
  };

  /**
   * Add Department
   */
  const openAddDepartment = () => {
    setDrawerMode("add");
    setEditingDepartment(null);
    setDepartmentName("");
    setDrawerOpen(true);
  };

  /**
   * Edit Department
   */
  const openEditDepartment = (
    department: Department
  ) => {
    setDrawerMode("edit");
    setEditingDepartment(department);
    setDepartmentName(department.name);
    setDrawerOpen(true);
  };

  /**
   * Save Department
   */
  const handleSubmit = (
    e: React.FormEvent<HTMLFormElement>
  ) => {
    e.preventDefault();

    if (!departmentName.trim()) {
      toast.error(tRts("masters.emptyNameError"));
      return;
    }

    startTransition(async () => {
      try {
        if (drawerMode === "add") {
          const response =
            await saveDepartment(departmentName);

          if (
            response.success &&
            response.department
          ) {
            setDepartments((previous) => [
              ...previous,
              response.department!,
            ]);

            toast.success(
              tRts("masters.departmentAdded")
            );
          } else {
            toast.error(
              tRts("masters.departmentAddFailed")
            );
          }
        } else {
          if (!editingDepartment) return;

          const response =
            await updateDepartment(
              editingDepartment.id,
              departmentName
            );

          if (
            response.success &&
            response.department
          ) {
            setDepartments((previous) =>
              previous.map((department) =>
                department.id ===
                  editingDepartment.id
                  ? response.department!
                  : department
              )
            );

            toast.success(
              tRts("masters.departmentUpdated")
            );
          } else {
            toast.error(
              tRts("masters.departmentUpdateFailed")
            );
          }
        }

        setDrawerOpen(false);
      } catch (error) {
        toast.error(
          error instanceof Error
            ? error.message
            : tRts("masters.unexpectedError")
        );
      }
    });
  };

  /**
   * Delete Department
   */
  const handleDeleteDepartment = (
    id: string,
    name: string
  ) => {
    confirm({
      variant: "delete",
      title: tRts("masters.deleteDepartment"),
      description: tRts(
        "masters.confirmDeleteDept",
        {
          name,
        }
      ),

      onConfirm: () => {
        startTransition(async () => {
          try {
            const response =
              await deleteDepartment(id);

            if (response.success) {
              setDepartments((previous) =>
                previous.filter(
                  (department) =>
                    department.id !== id
                )
              );

              toast.success(
                tRts("masters.departmentDeleted")
              );
            } else {
              toast.error(
                tRts(
                  "masters.departmentDeleteFailed"
                )
              );
            }
          } catch (error) {
            toast.error(
              error instanceof Error
                ? error.message
                : tRts(
                  "masters.departmentDeleteFailed"
                )
            );
          }
        });
      },
    });
  };

  /**
   * Filtered Departments
   */
  const filteredDepartments =
    useMemo(() => {
      const query = search
        .toLowerCase()
        .trim();

      return departments.filter(
        (department) =>
          department.name
            .toLowerCase()
            .includes(query)
      );
    }, [departments, search]);

  /**
   * Pagination
   */
  const totalPages =
    Math.ceil(filteredDepartments.length / 12) ||
    1;

  const paginatedDepartments =
    useMemo(() => {
      const start = (page - 1) * 12;

      return filteredDepartments.slice(
        start,
        start + 12
      );
    }, [filteredDepartments, page]);

  /**
   * Table Rows
   */
  const departmentRows: DepartmentRow[] =
    paginatedDepartments.map(
      (department, index) => ({
        id: department.id,
        srNo: (page - 1) * 12 + index + 1,
        name: department.name,
        status: "active",
      })
    );

  /**
* Table Columns
*/
  const departmentColumns: Column<DepartmentRow>[] = [
    {
      key: "srNo",
      label: tRts("masters.srNo"),
      width: "64px",
      align: "center",
      headerClassName:
        "border-r border-blue-300/60 text-white",
      cellClassName:
        "font-bold text-slate-500 border-r border-slate-100",
    },
    {
      key: "name",
      label: tRts("masters.deptName"),
      headerClassName:
        "border-r border-blue-300/60 text-white",
      cellClassName:
        "font-semibold text-slate-800 border-r border-slate-100",
    },
    {
      key: "status",
      label: tRts("masters.status"),
      width: "112px",
      align: "center",
      headerClassName:
        "border-r border-blue-300/60 text-white",
      cellClassName:
        "border-r border-slate-100",
      render: () => (
        <StatusBadge
          value="active"
          activeLabel={tRts("masters.active")}
          className="px-2 py-0.5 text-[10px]"
        />
      ),
    },
  ];

  const tableHeaderClass =
    "!bg-[#4b70a6] !from-[#4b70a6] !via-[#4b70a6] !to-[#4b70a6] hover:!from-[#4b70a6] hover:!via-[#4b70a6] hover:!to-[#4b70a6] [&_th]:!text-white";

  const tableClass =
    "border-collapse text-left text-sm [&_th:last-child]:border-l [&_th:last-child]:border-blue-300/60 [&_td:last-child]:border-l [&_td:last-child]:border-slate-100";

  const actionButtons = (
    onEdit: () => void,
    onDelete: () => void
  ) => (
    <div
      className="flex justify-center gap-1.5"
      onClick={(event) => event.stopPropagation()}
    >
      <EditButton
        type="button"
        className="size-10 px-0"
        aria-label={tRts("masters.edit")}
        title={tRts("masters.edit")}
        onClick={onEdit}
      />

      <DeleteButton
        type="button"
        className="size-10 px-0"
        aria-label={tRts("masters.delete")}
        title={tRts("masters.delete")}
        onClick={onDelete}
      />
    </div>
  );

  return (
    <>
      <div className="space-y-4">
        <Card className="flex flex-col justify-between rounded-2xl gap-4 border border-slate-200 bg-white p-4 shadow-sm sm:flex-row sm:items-center">
          <div className="flex flex-row items-center gap-4">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-blue-100 bg-blue-50 text-blue-600">
              <Landmark className="h-5 w-5" />
            </div>
            <h1 className="flex items-center gap-2 text-xl font-bold tracking-tight text-slate-800">
              {tRts("masters.registeredDepartmentsMaster")}
            </h1>
          </div>

          <AddButton
            type="button"
            onClick={openAddDepartment}
            label={tRts("masters.addDept")}
          />
        </Card>

        <Card className="border border-slate-200 bg-white p-3 shadow-sm">
          <div className="max-w-md space-y-1">
            <Label className="text-[10px] font-bold uppercase text-[#3d3d3d]">
              {t("actions.search")}
            </Label>
            <SearchInput
              value={search}
              onChange={handleSearchChange}
              placeholder={tRts("masters.searchDepartments")}
              className="mb-0 [&_input]:py-1.5 [&_input]:text-xs"
            />
          </div>
        </Card>

        <MasterTable
          columns={departmentColumns}
          data={departmentRows}
          getRowKey={(row) => row.id}
          emptyText={tRts("masters.noDepartmentsRegistered")}
          actionLabel={tRts("masters.actions")}
          pageNumber={page}
          pageSize={12}
          totalCount={filteredDepartments.length}
          totalPages={totalPages}
          onPageChange={setPage}
          paginationConfig={{
            enabled: totalPages > 1,
            showPageSizeSelector: false,
          }}
          maxBodyHeightClassName="max-h-auto"
          theadClassName={tableHeaderClass}
          tableClassName={tableClass}
          containerClassName="gap-0"
          onRowClick={(row) =>
            handleRowSelect(
              selectedDepartmentId === row.id
                ? null
                : row.id
            )
          }
          rowClassName={(row) =>
            selectedDepartmentId === row.id
              ? "bg-blue-50/70"
              : ""
          }
          renderActions={(row) =>
            actionButtons(
              () =>
                openEditDepartment({
                  id: row.id,
                  name: row.name,
                }),
              () =>
                handleDeleteDepartment(
                  row.id,
                  row.name
                )
            )
          }
        />
      </div>

      <Drawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        width="sm"
        title={
          <div className="flex items-center gap-2">
            <Landmark className="h-5 w-5 text-[#4b70a6]" />

            <span
              id="drawer-title"
              className="text-sm font-extrabold text-slate-800"
            >
              {drawerMode === "add"
                ? tRts("masters.registerNewDepartment")
                : tRts("masters.editDepartmentProfile")}
            </span>
          </div>
        }
      >
        <form
          onSubmit={handleSubmit}
          className="p-5 space-y-4 text-[13px] text-slate-700"
        >
          <div className="space-y-1">
            <Label className="text-[10px] font-bold uppercase text-slate-500">
              {tRts("masters.deptName")}
            </Label>

            <Input
              type="text"
              required
              value={departmentName}
              placeholder={tRts(
                "masters.departmentNamePlaceholder"
              )}
              onChange={(e) =>
                setDepartmentName(e.target.value)
              }
              fullWidth
            />
          </div>

          <div className="flex justify-end gap-2 pt-4 mt-4 border-t border-slate-100">
            <Button
              type="button"
              variant="secondary"
              onClick={() => setDrawerOpen(false)}
            >
              {tRts("masters.cancel")}
            </Button>

            <Button
              type="submit"
              isLoading={isPending}
            >
              {drawerMode === "add"
                ? t("buttons.save")
                : tRts("masters.update")}
            </Button>
          </div>
        </form>
      </Drawer>
    </>
  );
}
