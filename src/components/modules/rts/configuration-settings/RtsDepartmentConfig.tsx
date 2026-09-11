"use client";

import { useMemo, useState, useTransition } from "react";
import { useLocale, useTranslations } from "next-intl";
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
  ToggleSwitch,
  useConfirm,
} from "@/components/common";
import type { Column } from "@/components/common/MasterTable";
import { toast } from "sonner";
import {
  RTS_DASHBOARD_TABLE_CLASS,
  RTS_DASHBOARD_TABLE_CONTAINER_CLASS,
  RTS_DASHBOARD_TABLE_HEAD_CLASS,
} from "@/lib/utils/rts/dashboard-table-styles";

interface Department {
  id: string;
  name: string;
  localName: string | null;
  icon: string | null;
  displayOrder: number;
  isActive: boolean;
}

export interface SaveDepartmentPayload {
  name: string;
  localName?: string | null;
  icon?: string | null;
  displayOrder?: number;
  isActive?: boolean;
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
    nameOrInput: string | SaveDepartmentPayload
  ) => Promise<SaveDepartmentResponse>;

  updateDepartment: (
    id: string,
    nameOrInput: string | SaveDepartmentPayload
  ) => Promise<UpdateDepartmentResponse>;

  deleteDepartment: (
    id: string
  ) => Promise<DeleteDepartmentResponse>;
}

type DepartmentRow = Record<string, unknown> & {
  id: string;
  srNo: number;
  name: string;
  localName: string | null;
  icon: string | null;
  displayOrder: number;
  isActive: boolean;
};

export default function RtsDepartmentConfig({
  departments: initialDepartments,
  saveDepartment,
  updateDepartment,
  deleteDepartment,
}: RtsDepartmentConfigProps) {
  const t = useTranslations("common");
  const tRts = useTranslations("rts");
  const locale = useLocale();
  const numberFormatter = new Intl.NumberFormat(locale === "mr" ? "mr-IN" : locale === "hi" ? "hi-IN" : "en-IN");
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
  const [departmentName, setDepartmentName] = useState("");
  const [departmentLocalName, setDepartmentLocalName] = useState("");
  const [departmentIcon, setDepartmentIcon] = useState("");
  const [displayOrder, setDisplayOrder] = useState<number>(0);
  const [isActive, setIsActive] = useState<boolean>(true);

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
    setDepartmentLocalName("");
    setDepartmentIcon("");
    setDisplayOrder(departments.length + 1);
    setIsActive(true);
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
    setDepartmentLocalName(department.localName || "");
    setDepartmentIcon(department.icon || "");
    setDisplayOrder(department.displayOrder || 0);
    setIsActive(department.isActive ?? true);
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
        const payload: SaveDepartmentPayload = {
          name: departmentName.trim(),
          localName: departmentLocalName.trim() || null,
          icon: departmentIcon.trim() || null,
          displayOrder: Number(displayOrder) || 0,
          isActive,
        };

        if (drawerMode === "add") {
          const response = await saveDepartment(payload);

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
              payload
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
            .includes(query) ||
          (department.localName &&
            department.localName.toLowerCase().includes(query))
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
        localName: department.localName,
        icon: department.icon,
        displayOrder: department.displayOrder,
        isActive: department.isActive,
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
      render: (value) => numberFormatter.format(Number(value)),
    },
    {
      key: "name",
      label: tRts("masters.deptName"),
      headerClassName:
        "border-r border-blue-300/60 text-white",
      cellClassName:
        "font-semibold text-slate-800 border-r border-slate-100",
      render: (_value, row) => (
        <span className="font-semibold text-slate-800">
          {locale === "mr" ? (row.localName ? `${row.localName} (${row.name})` : row.name) : row.name}
        </span>
      ),
    },
    {
      key: "localName",
      label: tRts("masters.localName"),
      headerClassName:
        "border-r border-blue-300/60 text-white",
      cellClassName:
        "border-r border-slate-100 text-slate-700",
      render: (value) => String(value || "-"),
    },
    {
      key: "icon",
      label: tRts("masters.icon"),
      headerClassName:
        "border-r border-blue-300/60 text-white",
      cellClassName:
        "border-r border-slate-100 font-mono text-xs text-slate-500",
      render: (value) => String(value || "-"),
    },
    {
      key: "displayOrder",
      label: tRts("masters.displayOrder"),
      align: "center",
      headerClassName:
        "border-r border-blue-300/60 text-white",
      cellClassName:
        "border-r border-slate-100 font-mono text-xs text-slate-600",
    },
    {
      key: "isActive",
      label: tRts("masters.status"),
      width: "112px",
      align: "center",
      headerClassName:
        "border-r border-blue-300/60 text-white",
      cellClassName:
        "border-r border-slate-100",
      render: (value) => (
        <StatusBadge
          value={Boolean(value)}
          activeLabel={tRts("masters.active")}
          inactiveLabel={t("status.inactive")}
          className="px-2 py-0.5 text-[10px]"
        />
      ),
    },
  ];

  const tableHeaderClass = RTS_DASHBOARD_TABLE_HEAD_CLASS;

  const tableClass =
    `${RTS_DASHBOARD_TABLE_CLASS} border-collapse text-left text-sm`;

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
          maxBodyHeightClassName="min-h-[200px] max-h-auto"
          theadClassName={tableHeaderClass}
          tableClassName={tableClass}
          containerClassName={RTS_DASHBOARD_TABLE_CONTAINER_CLASS}
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
              : "hover:bg-blue-50"
          }
          renderActions={(row) =>
            actionButtons(
              () => {
                const department = departments.find((item) => item.id === row.id);

                if (department) openEditDepartment(department);
              },
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
              {tRts("masters.deptName")} (English) <span className="text-red-500">*</span>
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

          <div className="space-y-1">
            <Label className="text-[10px] font-bold uppercase text-slate-500">
              {tRts("masters.localName")} (स्थानिक / मराठी)
            </Label>

            <Input
              type="text"
              value={departmentLocalName}
              placeholder="उदा. नगररचना विभाग"
              onChange={(e) =>
                setDepartmentLocalName(e.target.value)
              }
              fullWidth
            />
          </div>

          <div className="space-y-1">
            <Label className="text-[10px] font-bold uppercase text-slate-500">
              {tRts("masters.icon")} (Icon Name / Class)
            </Label>

            <Input
              type="text"
              value={departmentIcon}
              placeholder="उदा. Landmark, Building, FileText"
              onChange={(e) =>
                setDepartmentIcon(e.target.value)
              }
              fullWidth
            />
          </div>

          <div className="space-y-1">
            <Label className="text-[10px] font-bold uppercase text-slate-500">
              {tRts("masters.displayOrder")}
            </Label>

            <Input
              type="number"
              value={displayOrder}
              placeholder="0"
              onChange={(e) =>
                setDisplayOrder(parseInt(e.target.value, 10) || 0)
              }
              fullWidth
            />
          </div>

          <div className="pt-2 flex items-center justify-between border-t border-slate-100">
            <div>
              <Label className="text-[11px] font-bold text-slate-700 block">
                {tRts("masters.status")}
              </Label>
              <span className="text-[10px] text-slate-500">
                {isActive ? tRts("masters.active") : t("status.inactive")}
              </span>
            </div>
            <ToggleSwitch
              checked={isActive}
              onChange={setIsActive}
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
                : t("buttons.update")}
            </Button>
          </div>
        </form>
      </Drawer>
    </>
  );
}
