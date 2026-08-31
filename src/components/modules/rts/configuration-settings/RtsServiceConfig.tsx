"use client";

import { useMemo, useState, useTransition } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Folder } from "lucide-react";
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
  Select,
  StatusBadge,
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
}

interface Service {
  id: string;
  name: string;
  departmentId: string;
  localName: string | null;
  serviceUrl: string | null;
  sla: string | number | null;
  fees: number | null;
  feesRequired: boolean;
  isCertificateRequired?: boolean;
  isSmsEnabled?: boolean;
  displayOrder: number;
  isActive: boolean;
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
  localName: string | null;
  serviceUrl: string | null;
  sla: string | number | null;
  fees: number | null;
  feesRequired: boolean;
  isCertificateRequired?: boolean;
  isSmsEnabled?: boolean;
  displayOrder: number;
  isActive: boolean;
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
  const locale = useLocale();
  const numberFormatter = new Intl.NumberFormat(locale === "mr" ? "mr-IN" : locale === "hi" ? "hi-IN" : "en-IN");
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
        localName: service.localName,
        serviceUrl: service.serviceUrl,
        sla: service.sla,
        fees: service.fees,
        feesRequired: service.feesRequired,
        isCertificateRequired: service.isCertificateRequired,
        isSmsEnabled: service.isSmsEnabled,
        displayOrder: service.displayOrder,
        isActive: service.isActive,
        departmentName:
          departmentMap.get(
            service.departmentId
          ) ??
          tRts(
            "masters.unknownDepartment"
          ),
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
      render: (value) => numberFormatter.format(Number(value)),
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
      render: (_value, row) => (
        <div className="space-y-0.5">
          <div className="font-semibold text-slate-950">{row.name}</div>
          <div className="break-all text-[10px] font-medium text-slate-400">{row.serviceUrl || "-"}</div>
        </div>
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
      key: "sla",
      label: tRts("masters.slaDays"),
      width: "96px",
      align: "center",
      headerClassName:
        "border-r border-blue-300/60 text-white",
      cellClassName: "border-r border-slate-100",
      render: (value) => {
        const sla = String(value ?? "").trim();
        const displaySla = sla
          ? /\bdays?\b/i.test(sla)
            ? sla
            : `${sla} ${tRts("masters.days")}`
          : "-";

        return (
          <span className="whitespace-nowrap rounded border border-slate-200 bg-slate-100 px-2 py-0.5 font-mono text-xs text-slate-700">
            {displaySla}
          </span>
        );
      },
    },
    {
      key: "fees",
      label: tRts("masters.fees"),
      headerClassName:
        "border-r border-blue-300/60 text-white",
      cellClassName:
        "border-r border-slate-100 font-mono text-xs text-slate-700",
      render: (_value, row) => row.feesRequired ? `₹${row.fees ?? 0}` : tRts("masters.free"),
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
      width: "110px",
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
      onClick={(e) => e.stopPropagation()}
    >
      <EditButton
        type="button"
        className="size-10 px-0"
        aria-label={t("buttons.edit")}
        title={t("buttons.edit")}
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
              <Folder className="h-5 w-5" />
            </div>
            <h1 className="flex items-center gap-2 text-xl font-bold tracking-tight text-slate-800">
              {tRts("masters.registeredServicesMaster")}
            </h1>
          </div>



          <AddButton
            type="button"
            onClick={openAddService}
            label={tRts("masters.addService")}
          />
        </Card>

        <Card className="border border-slate-200 bg-white p-3 shadow-sm">
          <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6">
            <div className="space-y-1">
              <Label className="text-[10px] font-bold uppercase text-[#3d3d3d]">
                {t("actions.search")}
              </Label>
              <SearchInput
                value={search}
                onChange={handleSearchChange}
                placeholder={tRts("masters.searchServices")}
                className="w-full mb-0 [&_input]:py-1.5 [&_input]:text-xs"
              />
            </div>

            <div className="space-y-1">
              <Label className="text-[10px] font-bold uppercase text-[#3d3d3d]">
                {tRts("masters.department")}
              </Label>
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
            </div>
          </div>
        </Card>

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
          maxBodyHeightClassName="min-h-[200px] max-h-auto"
          theadClassName={tableHeaderClass}
          tableClassName={tableClass}
          containerClassName={RTS_DASHBOARD_TABLE_CONTAINER_CLASS}
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
              : "hover:bg-blue-50"
          }
          renderActions={(row) =>
            actionButtons(
              () => {
                const service = services.find((item) => item.id === row.id);

                if (service) openEditService(service);
              },
              () =>
                handleDeleteService(
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
            <Folder className="h-5 w-5 text-[#4b70a6]" />

            <span className="text-sm font-extrabold text-slate-800">
              {drawerMode === "add"
                ? tRts("masters.registerNewService")
                : t("buttons.edit")}
            </span>
          </div>
        }
      >
        <form
          onSubmit={handleSubmit}
          className="space-y-4 p-5 text-[13px]"
        >
          <div className="space-y-1">
            <Label className="text-[10px] font-bold uppercase text-slate-500">
              {tRts("masters.department")}
            </Label>

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
            <Label className="text-[10px] font-bold uppercase text-slate-500">
              {tRts("masters.serviceName")}
            </Label>

            <Input
              type="text"
              required
              value={serviceName}
              placeholder={tRts(
                "masters.serviceNamePlaceholder"
              )}
              onChange={(e) =>
                setServiceName(e.target.value)
              }
              fullWidth
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
                : t("buttons.update")}
            </Button>
          </div>
        </form>
      </Drawer>
    </>
  );
}
