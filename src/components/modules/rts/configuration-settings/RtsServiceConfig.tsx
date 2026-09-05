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
  nameLocal?: string | null;
}

export interface Service {
  id: string;
  name: string;
  departmentId: string;
  localName: string | null;
  govtServiceCode?: number | null;
  serviceCode?: string | null;
  description?: string | null;
  serviceUrl: string | null;
  serviceIcon?: string | null;
  sla: string | number | null;
  fees: number | null;
  feesRequired: boolean;
  certificateType: number;
  isCertificateRequired?: boolean;
  isSmsEnabled?: boolean;
  displayOrder: number;
  isActive: boolean;
}

export interface SaveServicePayload {
  name: string;
  departmentId: string;
  localName?: string | null;
  govtServiceCode?: number | null;
  serviceCode?: string | null;
  description?: string | null;
  serviceUrl?: string | null;
  serviceIcon?: string | null;
  sla?: string | number | null;
  fees?: number | null;
  feesRequired?: boolean;
  certificateType: number;
  isCertificateRequired?: boolean;
  isSmsEnabled?: boolean;
  displayOrder?: number;
  isActive?: boolean;
}

interface SaveServiceResponse {
  success: boolean;
  service?: Service;
  error?: string;
}

interface UpdateServiceResponse {
  success: boolean;
  service?: Service;
  error?: string;
}

interface DeleteServiceResponse {
  success: boolean;
  error?: string;
}

interface RtsServiceConfigProps {
  departments: Department[];
  services: Service[];

  saveService: (
    nameOrInput: string | SaveServicePayload,
    departmentId?: string,
    certificateType?: number
  ) => Promise<SaveServiceResponse>;

  updateService: (
    id: string,
    nameOrInput: string | SaveServicePayload,
    departmentId?: string,
    certificateType?: number
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
  govtServiceCode?: number | null;
  serviceCode?: string | null;
  serviceUrl: string | null;
  sla: string | number | null;
  fees: number | null;
  feesRequired: boolean;
  certificateType: number;
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
  const [services, setServices] = useState<Service[]>(initialServices);

  /**
   * Search & Filter
   */
  const [search, setSearch] = useState("");
  const [selectedDepartmentId, setSelectedDepartmentId] = useState<string | null>(null);

  /**
   * Pagination
   */
  const [page, setPage] = useState(1);

  /**
   * Selected Row
   */
  const [selectedServiceId, setSelectedServiceId] = useState<string | null>(null);

  /**
   * Drawer & Form State
   */
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [drawerMode, setDrawerMode] = useState<"add" | "edit">("add");
  const [editingService, setEditingService] = useState<Service | null>(null);

  // Form Fields
  const [departmentId, setDepartmentId] = useState("");
  const [serviceName, setServiceName] = useState("");
  const [localName, setLocalName] = useState("");
  const [govtServiceCode, setGovtServiceCode] = useState<string>("");
  const [serviceCode, setServiceCode] = useState("");
  const [sla, setSla] = useState<string>("");
  const [fees, setFees] = useState<string>("");
  const [feesRequired, setFeesRequired] = useState<boolean>(false);
  const [certificateType, setCertificateType] = useState<number>(0);
  const [isSmsEnabled, setIsSmsEnabled] = useState<boolean>(true);
  const [displayOrder, setDisplayOrder] = useState<number>(1);
  const [serviceUrl, setServiceUrl] = useState("");
  const [serviceIcon, setServiceIcon] = useState("");
  const [description, setDescription] = useState("");
  const [isActive, setIsActive] = useState<boolean>(true);

  const handleSearchChange = (value: string) => {
    setSearch(value);
    setPage(1);
  };

  const handleDepartmentFilter = (value: string | null) => {
    setSelectedDepartmentId(value);
    setPage(1);
  };

  const handleRowSelect = (id: string | null) => {
    setSelectedServiceId(id);
  };

  const openAddService = () => {
    setDrawerMode("add");
    setEditingService(null);

    setDepartmentId(departments[0]?.id ?? "");
    setServiceName("");
    setLocalName("");
    setGovtServiceCode("");
    setServiceCode("");
    setSla("15");
    setFees("0");
    setFeesRequired(false);
    setCertificateType(0);
    setIsSmsEnabled(true);
    setDisplayOrder(services.length + 1);
    setServiceUrl("");
    setServiceIcon("");
    setDescription("");
    setIsActive(true);

    setDrawerOpen(true);
  };

  const openEditService = (service: Service) => {
    setDrawerMode("edit");
    setEditingService(service);

    setDepartmentId(service.departmentId);
    setServiceName(service.name);
    setLocalName(service.localName ?? "");
    setGovtServiceCode(service.govtServiceCode != null ? String(service.govtServiceCode) : "");
    setServiceCode(service.serviceCode ?? "");
    setSla(service.sla != null ? String(service.sla) : "");
    setFees(service.fees != null ? String(service.fees) : "0");
    setFeesRequired(Boolean(service.feesRequired));
    setCertificateType(service.certificateType ?? (service.isCertificateRequired ? 1 : 0));
    setIsSmsEnabled(service.isSmsEnabled !== false);
    setDisplayOrder(service.displayOrder ?? 1);
    setServiceUrl(service.serviceUrl ?? "");
    setServiceIcon(service.serviceIcon ?? "");
    setDescription(service.description ?? "");
    setIsActive(service.isActive !== false);

    setDrawerOpen(true);
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!serviceName.trim()) {
      toast.error(tRts("masters.emptyNameError"));
      return;
    }

    if (!departmentId) {
      toast.error(tRts("masters.selectDepartmentError"));
      return;
    }

    const payload: SaveServicePayload = {
      departmentId,
      name: serviceName.trim(),
      localName: localName.trim() || null,
      govtServiceCode: govtServiceCode.trim() ? Number(govtServiceCode.trim()) : null,
      serviceCode: serviceCode.trim() || null,
      description: description.trim() || null,
      serviceUrl: serviceUrl.trim() || null,
      serviceIcon: serviceIcon.trim() || null,
      sla: sla.trim() || null,
      fees: fees.trim() ? Number(fees.trim()) : 0,
      feesRequired,
      certificateType,
      isCertificateRequired: certificateType > 0,
      isSmsEnabled,
      displayOrder: Number(displayOrder) || 1,
      isActive,
    };

    startTransition(async () => {
      try {
        if (drawerMode === "add") {
          const response = await saveService(payload);

          if (response.success && response.service) {
            setServices((previous) => [...previous, response.service!]);
            toast.success(tRts("masters.serviceAdded"));
            setDrawerOpen(false);
          } else {
            toast.error(response.error || tRts("masters.serviceAddFailed"));
          }
        } else {
          if (!editingService) return;

          const response = await updateService(editingService.id, payload);

          if (response.success && response.service) {
            setServices((previous) =>
              previous.map((service) =>
                service.id === editingService.id ? response.service! : service
              )
            );
            toast.success(tRts("masters.serviceUpdated"));
            setDrawerOpen(false);
          } else {
            toast.error(response.error || tRts("masters.serviceUpdateFailed"));
          }
        }
      } catch (error) {
        toast.error(
          error instanceof Error ? error.message : tRts("masters.unexpectedError")
        );
      }
    });
  };

  const handleDeleteService = (id: string, name: string) => {
    confirm({
      variant: "delete",
      title: tRts("masters.deleteService"),
      description: tRts("masters.confirmDeleteService", { name }),
      onConfirm: () => {
        startTransition(async () => {
          try {
            const response = await deleteService(id);

            if (response.success) {
              setServices((previous) => previous.filter((service) => service.id !== id));
              toast.success(tRts("masters.serviceDeleted"));
            } else {
              toast.error(response.error || tRts("masters.serviceDeleteFailed"));
            }
          } catch (error) {
            toast.error(
              error instanceof Error ? error.message : tRts("masters.serviceDeleteFailed")
            );
          }
        });
      },
    });
  };

  const departmentMap = useMemo(() => {
    const map = new Map<string, string>();
    departments.forEach((department) => {
      map.set(
        department.id,
        locale === "mr" ? department.nameLocal || department.name : department.name
      );
    });
    return map;
  }, [departments, locale]);

  const filteredServices = useMemo(() => {
    const query = search.toLowerCase().trim();

    return services.filter((service) => {
      const matchesSearch =
        service.name.toLowerCase().includes(query) ||
        (service.localName && service.localName.toLowerCase().includes(query)) ||
        (service.serviceCode && service.serviceCode.toLowerCase().includes(query)) ||
        (service.govtServiceCode && String(service.govtServiceCode).includes(query));

      const matchesDepartment =
        !selectedDepartmentId || service.departmentId === selectedDepartmentId;

      return matchesSearch && matchesDepartment;
    });
  }, [services, search, selectedDepartmentId]);

  const totalPages = Math.ceil(filteredServices.length / 12) || 1;

  const paginatedServices = useMemo(() => {
    const start = (page - 1) * 12;
    return filteredServices.slice(start, start + 12);
  }, [filteredServices, page]);

  const serviceRows: ServiceRow[] = paginatedServices.map((service, index) => ({
    id: service.id,
    srNo: (page - 1) * 12 + index + 1,
    name: service.name,
    localName: service.localName,
    govtServiceCode: service.govtServiceCode,
    serviceCode: service.serviceCode,
    serviceUrl: service.serviceUrl,
    sla: service.sla,
    fees: service.fees,
    feesRequired: service.feesRequired,
    certificateType: service.certificateType ?? (service.isCertificateRequired ? 1 : 0),
    isCertificateRequired: service.isCertificateRequired,
    isSmsEnabled: service.isSmsEnabled,
    displayOrder: service.displayOrder,
    isActive: service.isActive,
    departmentName: departmentMap.get(service.departmentId) ?? tRts("masters.unknownDepartment"),
  }));

  const serviceColumns: Column<ServiceRow>[] = [
    {
      key: "srNo",
      label: tRts("masters.srNo"),
      width: "64px",
      align: "center",
      headerClassName: "border-r border-blue-300/60 text-white",
      cellClassName: "font-bold text-slate-500 border-r border-slate-100",
      render: (value) => numberFormatter.format(Number(value)),
    },
    {
      key: "departmentName",
      label: tRts("masters.department"),
      headerClassName: "border-r border-blue-300/60 text-white",
      cellClassName: "font-medium border-r border-slate-100",
    },
    {
      key: "name",
      label: tRts("masters.serviceName"),
      headerClassName: "border-r border-blue-300/60 text-white",
      cellClassName: "font-semibold text-slate-800 border-r border-slate-100",
      render: (_value, row) => (
        <div className="space-y-0.5">
          <div className="font-semibold text-slate-950">
            {locale === "mr" ? (row.localName ? `${row.localName} (${row.name})` : row.name) : row.name}
          </div>
          <div className="flex flex-wrap items-center gap-1.5 text-[11px] font-medium text-slate-400">
            {row.serviceCode && (
              <span className="rounded bg-slate-100 px-1 py-0.5 font-mono text-[10px] text-slate-600">
                {String(row.serviceCode)}
              </span>
            )}
            {row.govtServiceCode && (
              <span className="rounded bg-blue-50 px-1 py-0.5 font-mono text-[10px] text-blue-700">
                Govt: {String(row.govtServiceCode)}
              </span>
            )}
            {row.serviceUrl && (
              <span className="break-all text-[10px] text-slate-400">{String(row.serviceUrl)}</span>
            )}
          </div>
        </div>
      ),
    },
    {
      key: "localName",
      label: tRts("masters.localName"),
      headerClassName: "border-r border-blue-300/60 text-white",
      cellClassName: "border-r border-slate-100 text-slate-700",
      render: (value) => String(value || "-"),
    },
    {
      key: "certificateType",
      label: tRts("masters.certificateMode"),
      width: "160px",
      align: "center",
      headerClassName: "border-r border-blue-300/60 text-white",
      cellClassName: "border-r border-slate-100 text-center",
      render: (value) => {
        const type = Number(value ?? 0);
        if (type === 2) {
          return (
            <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-300 bg-amber-50 px-2.5 py-0.5 text-[11px] font-semibold text-amber-800 shadow-sm">
              <span className="h-1.5 w-1.5 rounded-full bg-amber-500 animate-pulse" />
              {tRts("masters.manualDepartmentCertificate")}
            </span>
          );
        }
        if (type === 1) {
          return (
            <span className="inline-flex items-center gap-1.5 rounded-full border border-blue-300 bg-blue-50 px-2.5 py-0.5 text-[11px] font-semibold text-blue-800 shadow-sm">
              <span className="h-1.5 w-1.5 rounded-full bg-blue-600" />
              {tRts("masters.digitalDscCertificate")}
            </span>
          );
        }
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-slate-100 px-2.5 py-0.5 text-[11px] font-medium text-slate-500">
            <span className="h-1.5 w-1.5 rounded-full bg-slate-400" />
            {tRts("masters.noCertificate")}
          </span>
        );
      },
    },
    {
      key: "sla",
      label: tRts("masters.slaDays"),
      width: "96px",
      align: "center",
      headerClassName: "border-r border-blue-300/60 text-white",
      cellClassName: "border-r border-slate-100",
      render: (value) => {
        const raw = String(value ?? "").trim();
        const displaySla = raw
          ? /\bdays?\b/i.test(raw)
            ? raw
            : `${raw} ${tRts("masters.days")}`
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
      headerClassName: "border-r border-blue-300/60 text-white",
      cellClassName: "border-r border-slate-100 font-mono text-xs text-slate-700",
      render: (_value, row) =>
        row.feesRequired ? `₹${row.fees ?? 0}` : tRts("masters.free"),
    },
    {
      key: "displayOrder",
      label: tRts("masters.displayOrder"),
      align: "center",
      headerClassName: "border-r border-blue-300/60 text-white",
      cellClassName: "border-r border-slate-100 font-mono text-xs text-slate-600",
      render: (value) => numberFormatter.format(Number(value || 0)),
    },
    {
      key: "isActive",
      label: tRts("masters.status"),
      width: "110px",
      align: "center",
      headerClassName: "border-r border-blue-300/60 text-white",
      cellClassName: "border-r border-slate-100",
      render: (value) => (
        <StatusBadge
          value={Boolean(value)}
          activeLabel={tRts("masters.active")}
          inactiveLabel={tRts("masters.inactive")}
          className="px-2 py-0.5 text-[10px]"
        />
      ),
    },
  ];

  const tableHeaderClass = RTS_DASHBOARD_TABLE_HEAD_CLASS;
  const tableClass = `${RTS_DASHBOARD_TABLE_CLASS} border-collapse text-left text-sm`;

  const actionButtons = (onEdit: () => void, onDelete: () => void) => (
    <div className="flex justify-center gap-1.5" onClick={(e) => e.stopPropagation()}>
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
            <div>
              <h1 className="flex items-center gap-2 text-xl font-bold tracking-tight text-slate-800">
                {tRts("masters.registeredServicesMaster")}
              </h1>
              <p className="text-xs text-slate-500">
                {tRts("masters.serviceMasterSubtitle")}
              </p>
            </div>
          </div>

          <AddButton
            type="button"
            onClick={openAddService}
            label={tRts("masters.addService")}
          />
        </Card>

        <Card className="border border-slate-200 bg-white p-3 shadow-sm">
          <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6">
            <div className="space-y-1 sm:col-span-2">
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

            <div className="space-y-1 sm:col-span-2">
              <Label className="text-[10px] font-bold uppercase text-[#3d3d3d]">
                {tRts("masters.department")}
              </Label>
              <Select
                value={selectedDepartmentId ?? ""}
                selectSize="sm"
                placeholder={tRts("masters.allDepartments")}
                options={[
                  {
                    label: tRts("masters.allDepartments"),
                    value: "",
                  },
                  ...departments.map((department) => ({
                    label: locale === "mr" ? department.nameLocal || department.name : department.name,
                    value: department.id,
                  })),
                ]}
                onChange={(_, value) => handleDepartmentFilter(value || null)}
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
            handleRowSelect(selectedServiceId === row.id ? null : row.id)
          }
          rowClassName={(row) =>
            selectedServiceId === row.id ? "bg-blue-50/70" : "hover:bg-blue-50"
          }
          renderActions={(row) =>
            actionButtons(
              () => {
                const service = services.find((item) => item.id === row.id);
                if (service) openEditService(service);
              },
              () => handleDeleteService(row.id, row.name)
            )
          }
        />
      </div>

      <Drawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        width="md"
        title={
          <div className="flex items-center gap-2">
            <Folder className="h-5 w-5 text-[#4b70a6]" />
            <span className="text-sm font-extrabold text-slate-800">
              {drawerMode === "add"
                ? tRts("masters.registerNewService")
                : tRts("masters.editServiceProfile")}
            </span>
          </div>
        }
      >
        <form onSubmit={handleSubmit} className="space-y-4 p-5 text-[13px]">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {/* Department */}
            <div className="space-y-1 sm:col-span-2">
              <Label className="text-[10px] font-bold uppercase text-slate-500">
                {tRts("masters.department")} <span className="text-red-500">*</span>
              </Label>
              <Select
                required
                value={departmentId}
                placeholder={tRts("masters.selectDepartmentPlaceholder")}
                options={departments.map((department) => ({
                  label:
                    locale === "mr"
                      ? department.nameLocal
                        ? `${department.nameLocal} (${department.name})`
                        : department.name
                      : department.name,
                  value: department.id,
                }))}
                onChange={(_, value) => setDepartmentId(value)}
              />
            </div>

            {/* Service Name (English) */}
            <div className="space-y-1">
              <Label className="text-[10px] font-bold uppercase text-slate-500">
                {tRts("masters.serviceName")} (English) <span className="text-red-500">*</span>
              </Label>
              <Input
                type="text"
                required
                value={serviceName}
                placeholder={tRts("masters.serviceNamePlaceholder")}
                onChange={(e) => setServiceName(e.target.value)}
                fullWidth
              />
            </div>

            {/* Service Name (Local) */}
            <div className="space-y-1">
              <Label className="text-[10px] font-bold uppercase text-slate-500">
                {tRts("masters.localName")}
              </Label>
              <Input
                type="text"
                value={localName}
                placeholder={tRts("masters.localNamePlaceholder")}
                onChange={(e) => setLocalName(e.target.value)}
                fullWidth
              />
            </div>

            {/* Service Code & Govt Code */}
            <div className="space-y-1">
              <Label className="text-[10px] font-bold uppercase text-slate-500">
                {tRts("masters.serviceCode")}
              </Label>
              <Input
                type="text"
                value={serviceCode}
                placeholder={tRts("masters.serviceCodePlaceholder")}
                onChange={(e) => setServiceCode(e.target.value)}
                fullWidth
              />
            </div>

            <div className="space-y-1">
              <Label className="text-[10px] font-bold uppercase text-slate-500">
                {tRts("masters.govtServiceCode")}
              </Label>
              <Input
                type="number"
                value={govtServiceCode}
                placeholder={tRts("masters.govtServiceCodePlaceholder")}
                onChange={(e) => setGovtServiceCode(e.target.value)}
                fullWidth
              />
            </div>

            {/* SLA & Fees */}
            <div className="space-y-1">
              <Label className="text-[10px] font-bold uppercase text-slate-500">
                {tRts("masters.slaDays")}
              </Label>
              <Input
                type="text"
                value={sla}
                placeholder={tRts("masters.slaPlaceholder")}
                onChange={(e) => setSla(e.target.value)}
                fullWidth
              />
            </div>

            <div className="space-y-1">
              <Label className="text-[10px] font-bold uppercase text-slate-500">
                {tRts("masters.fees")} (₹)
              </Label>
              <Input
                type="number"
                value={fees}
                placeholder={tRts("masters.feesPlaceholder")}
                onChange={(e) => setFees(e.target.value)}
                fullWidth
              />
            </div>

            {/* Certificate Mode */}
            <div className="space-y-1.5 sm:col-span-2">
              <Label className="text-[10px] font-bold uppercase text-slate-500">
                {tRts("masters.certificateMode")}
              </Label>
              <Select
                required
                value={String(certificateType)}
                options={[
                  {
                    label: tRts("masters.noCertificate"),
                    value: "0",
                  },
                  {
                    label: tRts("masters.digitalDscCertificate"),
                    value: "1",
                  },
                  {
                    label: tRts("masters.manualDepartmentCertificate"),
                    value: "2",
                  },
                ]}
                onChange={(_, value) => setCertificateType(Number(value || 0))}
              />
              <p className="text-[11px] text-slate-500">
                {tRts("masters.certificateModeHelp")}
              </p>
            </div>

            {/* Display Order & Service URL */}
            <div className="space-y-1">
              <Label className="text-[10px] font-bold uppercase text-slate-500">
                {tRts("masters.displayOrder")}
              </Label>
              <Input
                type="number"
                value={displayOrder}
                placeholder={tRts("masters.displayOrderPlaceholder")}
                onChange={(e) => setDisplayOrder(Number(e.target.value) || 1)}
                fullWidth
              />
            </div>

            <div className="space-y-1">
              <Label className="text-[10px] font-bold uppercase text-slate-500">
                {tRts("masters.serviceUrl")}
              </Label>
              <Input
                type="text"
                value={serviceUrl}
                placeholder={tRts("masters.serviceUrlPlaceholder")}
                onChange={(e) => setServiceUrl(e.target.value)}
                fullWidth
              />
            </div>

            {/* Service Icon & Description */}
            <div className="space-y-1 sm:col-span-2">
              <Label className="text-[10px] font-bold uppercase text-slate-500">
                {tRts("masters.serviceIcon")}
              </Label>
              <Input
                type="text"
                value={serviceIcon}
                placeholder={tRts("masters.serviceIconPlaceholder")}
                onChange={(e) => setServiceIcon(e.target.value)}
                fullWidth
              />
            </div>

            <div className="space-y-1 sm:col-span-2">
              <Label className="text-[10px] font-bold uppercase text-slate-500">
                {tRts("masters.description")}
              </Label>
              <textarea
                rows={2}
                value={description}
                placeholder={tRts("masters.descriptionPlaceholder")}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full rounded-md border border-slate-200 bg-white p-2.5 text-xs text-slate-800 placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>

            {/* Toggles: Fees Required, SMS Enabled, Is Active */}
            <div className="rounded-lg border border-slate-200 bg-slate-50/50 p-3 sm:col-span-2 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-xs font-semibold text-slate-700">
                    {tRts("masters.feesRequired")}
                  </div>
                  <div className="text-[11px] text-slate-500">
                    {tRts("masters.feesRequiredHelp")}
                  </div>
                </div>
                <ToggleSwitch
                  checked={feesRequired}
                  onChange={setFeesRequired}
                  activeLabel={tRts("masters.active")}
                  inactiveLabel={tRts("masters.inactive")}
                />
              </div>

              <div className="flex items-center justify-between border-t border-slate-200/60 pt-3">
                <div>
                  <div className="text-xs font-semibold text-slate-700">
                    {tRts("masters.isSmsEnabled")}
                  </div>
                  <div className="text-[11px] text-slate-500">
                    {tRts("masters.isSmsEnabledHelp")}
                  </div>
                </div>
                <ToggleSwitch
                  checked={isSmsEnabled}
                  onChange={setIsSmsEnabled}
                  activeLabel={tRts("masters.active")}
                  inactiveLabel={tRts("masters.inactive")}
                />
              </div>

              <div className="flex items-center justify-between border-t border-slate-200/60 pt-3">
                <div>
                  <div className="text-xs font-semibold text-slate-700">
                    {tRts("masters.status")}
                  </div>
                  <div className="text-[11px] text-slate-500">
                    {isActive ? tRts("masters.active") : tRts("masters.inactive")}
                  </div>
                </div>
                <ToggleSwitch
                  checked={isActive}
                  onChange={setIsActive}
                  activeLabel={tRts("masters.active")}
                  inactiveLabel={tRts("masters.inactive")}
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-2 border-t border-slate-100 pt-4">
            <Button
              type="button"
              variant="secondary"
              onClick={() => setDrawerOpen(false)}
            >
              {tRts("masters.cancel")}
            </Button>

            <Button type="submit" isLoading={isPending}>
              {drawerMode === "add" ? tRts("masters.save") : tRts("masters.saveChanges")}
            </Button>
          </div>
        </form>
      </Drawer>
    </>
  );
}
