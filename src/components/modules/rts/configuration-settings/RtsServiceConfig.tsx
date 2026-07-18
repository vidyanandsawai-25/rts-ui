"use client";

import { useMemo, useState, useTransition } from "react";
import { useTranslations } from "next-intl";
import { Folder, Pencil, Trash2 } from "lucide-react";
import {
  Badge,
  Button,
  Card,
  Drawer,
  MasterTable,
  SearchInput,
  Select,
  useConfirm,
} from "@/components/common";
import type { Column } from "@/components/common/MasterTable";
import { toast } from "sonner";

interface Department {
  id: string;
  name: string;
}

interface Service {
  id: string;
  name: string;
  departmentId: string;
}

interface SaveServiceResponse {
  success: boolean;
  service?: Service;
}

interface UpdateServiceResponse {
  success: boolean;
  service?: Service;
}

interface DeleteServiceResponse {
  success: boolean;
}

interface RtsServiceConfigProps {
  departments: Department[];
  services: Service[];

  saveService: (
    name: string,
    departmentId: string
  ) => Promise<SaveServiceResponse>;

  updateService: (
    id: string,
    name: string,
    departmentId: string
  ) => Promise<UpdateServiceResponse>;

  deleteService: (
    id: string
  ) => Promise<DeleteServiceResponse>;
}

type ServiceRow = Record<string, unknown> & {
  id: string;
  srNo: number;
  name: string;
  departmentName: string;
  status: string;
};

export default function RtsServiceConfig({
  departments,
  services: initialServices,
  saveService,
  updateService,
  deleteService,
}: RtsServiceConfigProps) {
  const t = useTranslations("common");
  const tRts = useTranslations("rts");
  const { confirm } = useConfirm();

  const [isPending, startTransition] = useTransition();

  /**
   * Services State
   */
  const [services, setServices] =
    useState<Service[]>(initialServices);

  /**
   * Search
   */
  const [search, setSearch] = useState("");

  /**
   * Department Filter
   */
  const [selectedDepartmentId, setSelectedDepartmentId] =
    useState<string | null>(null);

  /**
   * Pagination
   */
  const [page, setPage] = useState(1);

  /**
   * Selected Row
   */
  const [selectedServiceId, setSelectedServiceId] =
    useState<string | null>(null);

  /**
   * Drawer
   */
  const [drawerOpen, setDrawerOpen] = useState(false);

  const [drawerMode, setDrawerMode] =
    useState<"add" | "edit">("add");

  const [editingService, setEditingService] =
    useState<Service | null>(null);

  /**
   * Form
   */
  const [serviceName, setServiceName] =
    useState("");

  const [departmentId, setDepartmentId] =
    useState("");

  /**
   * Search
   */
  const handleSearchChange = (value: string) => {
    setSearch(value);
    setPage(1);
  };

  /**
   * Department Filter
   */
  const handleDepartmentFilter = (
    value: string | null
  ) => {
    setSelectedDepartmentId(value);
    setPage(1);
  };

  /**
   * Row Selection
   */
  const handleRowSelect = (
    id: string | null
  ) => {
    setSelectedServiceId(id);
  };

  /**
   * Add Service
   */
  const openAddService = () => {
    setDrawerMode("add");
    setEditingService(null);

    setServiceName("");
    setDepartmentId(
      departments[0]?.id ?? ""
    );

    setDrawerOpen(true);
  };

  /**
   * Edit Service
   */
  const openEditService = (
    service: Service
  ) => {
    setDrawerMode("edit");
    setEditingService(service);

    setServiceName(service.name);
    setDepartmentId(service.departmentId);

    setDrawerOpen(true);
  };

  /**
   * Save / Update
   */
  const handleSubmit = (
    e: React.FormEvent<HTMLFormElement>
  ) => {
    e.preventDefault();

    if (!serviceName.trim()) {
      toast.error(
        tRts("masters.emptyNameError")
      );
      return;
    }

    if (!departmentId) {
      toast.error(
        tRts("masters.selectDepartmentError")
      );
      return;
    }

    startTransition(async () => {
      try {
        if (drawerMode === "add") {
          const response =
            await saveService(
              serviceName,
              departmentId
            );

          if (
            response.success &&
            response.service
          ) {
            setServices((previous) => [
              ...previous,
              response.service!,
            ]);

            toast.success(
              tRts("masters.serviceAdded")
            );
          } else {
            toast.error(
              tRts("masters.serviceAddFailed")
            );
          }
        } else {
          if (!editingService) return;

          const response =
            await updateService(
              editingService.id,
              serviceName,
              departmentId
            );

          if (
            response.success &&
            response.service
          ) {
            setServices((previous) =>
              previous.map((service) =>
                service.id ===
                  editingService.id
                  ? response.service!
                  : service
              )
            );

            toast.success(
              tRts("masters.serviceUpdated")
            );
          } else {
            toast.error(
              tRts("masters.serviceUpdateFailed")
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
   * Delete Service
   */
  const handleDeleteService = (
    id: string,
    name: string
  ) => {
    confirm({
      variant: "delete",
      title: tRts("masters.deleteService"),
      description: tRts(
        "masters.confirmDeleteService",
        { name }
      ),

      onConfirm: () => {
        startTransition(async () => {
          try {
            const response =
              await deleteService(id);

            if (response.success) {
              setServices((previous) =>
                previous.filter(
                  (service) =>
                    service.id !== id
                )
              );

              toast.success(
                tRts("masters.serviceDeleted")
              );
            } else {
              toast.error(
                tRts(
                  "masters.serviceDeleteFailed"
                )
              );
            }
          } catch (error) {
            toast.error(
              error instanceof Error
                ? error.message
                : tRts(
                  "masters.serviceDeleteFailed"
                )
            );
          }
        });
      },
    });
  };

  /**
   * Department Map
   */
  const departmentMap = useMemo(() => {
    const map = new Map<string, string>();

    departments.forEach((department) => {
      map.set(
        department.id,
        department.name
      );
    });

    return map;
  }, [departments]);

  /**
   * Filter Services
   */
  const filteredServices = useMemo(() => {
    const query = search
      .toLowerCase()
      .trim();

    return services.filter((service) => {
      const matchesSearch =
        service.name
          .toLowerCase()
          .includes(query);

      const matchesDepartment =
        !selectedDepartmentId ||
        service.departmentId ===
        selectedDepartmentId;

      return (
        matchesSearch &&
        matchesDepartment
      );
    });
  }, [
    services,
    search,
    selectedDepartmentId,
  ]);

  /**
   * Pagination
   */
  const totalPages =
    Math.ceil(filteredServices.length / 12) ||
    1;

  const paginatedServices =
    useMemo(() => {
      const start = (page - 1) * 12;

      return filteredServices.slice(
        start,
        start + 12
      );
    }, [filteredServices, page]);

  /**
   * Table Rows
   */
  const serviceRows: ServiceRow[] =
    paginatedServices.map(
      (service, index) => ({
        id: service.id,
        srNo: (page - 1) * 12 + index + 1,
        name: service.name,
        departmentName:
          departmentMap.get(
            service.departmentId
          ) ??
          tRts(
            "masters.unknownDepartment"
          ),
        status: "active",
      })
    );

  /**
* Table Columns
*/
  const serviceColumns: Column<ServiceRow>[] = [
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
      key: "departmentName",
      label: tRts("masters.department"),
      headerClassName:
        "border-r border-blue-300/60 text-white",
      cellClassName:
        "font-medium border-r border-slate-100",
    },
    {
      key: "name",
      label: tRts("masters.serviceName"),
      headerClassName:
        "border-r border-blue-300/60 text-white",
      cellClassName:
        "font-semibold text-slate-800 border-r border-slate-100",
    },
    {
      key: "status",
      label: tRts("masters.status"),
      width: "110px",
      align: "center",
      headerClassName:
        "border-r border-blue-300/60 text-white",
      cellClassName:
        "border-r border-slate-100",
      render: () => (
        <Badge variant="success" size="sm">
          {tRts("masters.active")}
        </Badge>
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
      onClick={(e) => e.stopPropagation()}
    >
      <Button
        type="button"
        variant="edit"
        size="sm"
        icon={Pencil}
        className="size-10 px-0"
        aria-label={tRts("masters.edit")}
        title={tRts("masters.edit")}
        onClick={onEdit}
      />

      <Button
        type="button"
        variant="delete"
        size="sm"
        icon={Trash2}
        className="size-10 px-0"
        aria-label={tRts("masters.delete")}
        title={tRts("masters.delete")}
        onClick={onDelete}
      />
    </div>
  );

  return (
    <>
      <Card className="p-4 border rounded-2xl border-slate-200 bg-white shadow-sm space-y-4">
        <div className="flex flex-col gap-3 border-b border-slate-100 pb-3 md:flex-row md:items-center md:justify-between">
          <h2 className="flex items-center gap-2 text-[14px] font-extrabold text-[#3d3d3d]">
            <Folder className="h-4 w-4 text-[#4b70a6]" />
            {tRts("masters.registeredServicesMaster")}
          </h2>

          <div className="flex flex-wrap items-center gap-2">
            <Select
              value={selectedDepartmentId ?? ""}
              selectSize="sm"
              placeholder={tRts("users.selectDepartmentPlaceholder")}
              options={[
                {
                  label: tRts("users.allDepartments"),
                  value: "",
                },
                ...departments.map((department) => ({
                  label: department.name,
                  value: department.id,
                })),
              ]}
              onChange={(_, value) =>
                handleDepartmentFilter(value || null)
              }
            />

            <SearchInput
              value={search}
              onChange={handleSearchChange}
              placeholder={tRts("masters.searchServices")}
              className="mb-0 w-full sm:w-64 [&_input]:py-1.5 [&_input]:text-xs"
            />

            <Button
              type="button"
              icon={Folder}
              onClick={openAddService}
            >
              {tRts("masters.addService")}
            </Button>
          </div>
        </div>

        <MasterTable
          columns={serviceColumns}
          data={serviceRows}
          getRowKey={(row) => row.id}
          emptyText={tRts("masters.noServicesRegistered")}
          actionLabel={tRts("masters.actions")}
          pageNumber={page}
          pageSize={12}
          totalCount={filteredServices.length}
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
              selectedServiceId === row.id
                ? null
                : row.id
            )
          }
          rowClassName={(row) =>
            selectedServiceId === row.id
              ? "bg-blue-50/70"
              : ""
          }
          renderActions={(row) =>
            actionButtons(
              () =>
                openEditService({
                  id: row.id,
                  name: row.name,
                  departmentId:
                    departments.find(
                      (d) =>
                        d.name === row.departmentName
                    )?.id ?? "",
                }),
              () =>
                handleDeleteService(
                  row.id,
                  row.name
                )
            )
          }
        />
      </Card>

      <Drawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        width="sm"
        title={
          <div className="flex items-center gap-2">
            <Folder className="h-5 w-5 text-[#4b70a6]" />

            <span className="text-sm font-extrabold text-slate-800">
              {drawerMode === "add"
                ? tRts("masters.registerNewService")
                : tRts("masters.editService")}
            </span>
          </div>
        }
      >
        <form
          onSubmit={handleSubmit}
          className="space-y-4 p-5 text-[13px]"
        >
          <div className="space-y-1">
            <label className="text-[10px] font-bold uppercase text-slate-500">
              {tRts("masters.department")}
            </label>

            <Select
              required
              value={departmentId}
              placeholder={tRts("users.selectDepartmentPlaceholder")}
              options={departments.map((department) => ({
                label: department.name,
                value: department.id,
              }))}
              onChange={(_, value) =>
                setDepartmentId(value)
              }
            />
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-bold uppercase text-slate-500">
              {tRts("masters.serviceName")}
            </label>

            <input
              type="text"
              required
              value={serviceName}
              placeholder={tRts(
                "masters.serviceNamePlaceholder"
              )}
              onChange={(e) =>
                setServiceName(e.target.value)
              }
              className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3 py-2 focus:border-[#4b70a6] focus:bg-white focus:outline-none"
            />
          </div>

          <div className="flex justify-end gap-2 border-t border-slate-100 pt-4">
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