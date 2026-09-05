"use client";

import { useMemo, useState, useTransition } from "react";
import { useLocale, useTranslations } from "next-intl";
import { UserCheck } from "lucide-react";
import {
  AddButton,
  Button,
  Card,
  Drawer,
  EditButton,
  Input,
  Label,
  MasterTable,
  SearchInput,
  Select,
  StatusBadge,
} from "@/components/common";
import type { Column } from "@/components/common/MasterTable";
import { toast } from "sonner";
import {
  RTS_DASHBOARD_TABLE_CLASS,
  RTS_DASHBOARD_TABLE_CONTAINER_CLASS,
  RTS_DASHBOARD_TABLE_HEAD_CLASS,
} from "@/lib/utils/rts/dashboard-table-styles";
import type {
  OfficerAllocationConfig,
  OfficerServiceOption,
  OfficerZoneOption,
} from "@/app/[locale]/rts/configuration-settings/rts-officers/actions";

interface RtsServiceOfficerConfigProps {
  initialAllocations: OfficerAllocationConfig[];
  services: OfficerServiceOption[];
  zones?: OfficerZoneOption[];
  saveAllocation: (data: {
    serviceId: string;
    zoneId: number;
    zoneName: string;
    zoneNameLocal?: string;
    officerName: string;
    officerNameLocal?: string;
    designation: string;
    designationLocal?: string;
    mobileNo: string;
    email?: string;
    officeAddress?: string;
    officeAddressLocal?: string;
    officerRole?: string;
    isActive?: boolean;
  }) => Promise<{ success: boolean; allocation?: OfficerAllocationConfig; error?: string }>;
  updateAllocation: (
    id: string,
    data: {
      zoneId: number;
      zoneName: string;
      zoneNameLocal?: string;
      officerName: string;
      officerNameLocal?: string;
      designation: string;
      designationLocal?: string;
      mobileNo: string;
      email?: string;
      officeAddress?: string;
      officeAddressLocal?: string;
      officerRole?: string;
      isActive: boolean;
    }
  ) => Promise<{ success: boolean; allocation?: OfficerAllocationConfig; error?: string }>;
}

const ZONE_PALETTES = [
  "border-sky-300 bg-sky-50 text-sky-800",
  "border-indigo-300 bg-indigo-50 text-indigo-800",
  "border-purple-300 bg-purple-50 text-purple-800",
  "border-teal-300 bg-teal-50 text-teal-800",
  "border-amber-300 bg-amber-50 text-amber-800",
  "border-emerald-300 bg-emerald-50 text-emerald-800",
  "border-rose-300 bg-rose-50 text-rose-800",
  "border-cyan-300 bg-cyan-50 text-cyan-800",
  "border-violet-300 bg-violet-50 text-violet-800",
];

type AllocationRow = Record<string, unknown> & OfficerAllocationConfig & {
  srNo: number;
};

export default function RtsServiceOfficerConfig({
  initialAllocations,
  services,
  zones,
  saveAllocation,
  updateAllocation,
}: RtsServiceOfficerConfigProps) {
  const t = useTranslations("common");
  const locale = useLocale();
  const numberFormatter = new Intl.NumberFormat(locale === "mr" ? "mr-IN" : "en-IN");

  const [allocations, setAllocations] = useState<OfficerAllocationConfig[]>(
    Array.isArray(initialAllocations) ? initialAllocations : []
  );
  const [isPending, startTransition] = useTransition();

  // Dynamically resolve available zones from server props or live allocations
  const dynamicZones = useMemo(() => {
    if (zones && zones.length > 0) return zones;
    const map = new Map<number, OfficerZoneOption>();
    allocations.forEach((a) => {
      if (a.zoneId && !map.has(a.zoneId)) {
        map.set(a.zoneId, {
          id: a.zoneId,
          name: a.zoneName || `Zone ${a.zoneId}`,
          nameLocal: a.zoneNameLocal || null,
        });
      }
    });
    return Array.from(map.values()).sort((a, b) => a.id - b.id);
  }, [zones, allocations]);

  // Filters
  const [search, setSearch] = useState("");
  const [selectedServiceId, setSelectedServiceId] = useState<string | null>(null);
  const [selectedZoneId, setSelectedZoneId] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [selectedRowId, setSelectedRowId] = useState<string | null>(null);

  // Drawer
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [drawerMode, setDrawerMode] = useState<"add" | "edit">("add");
  const [editingItem, setEditingItem] = useState<OfficerAllocationConfig | null>(null);

  // Form states
  const [formServiceId, setFormServiceId] = useState("");
  const [formZoneId, setFormZoneId] = useState("1");
  const [formOfficerName, setFormOfficerName] = useState("");
  const [formOfficerNameLocal, setFormOfficerNameLocal] = useState("");
  const [formDesignation, setFormDesignation] = useState("");
  const [formDesignationLocal, setFormDesignationLocal] = useState("");
  const [formMobileNo, setFormMobileNo] = useState("");
  const [formEmail, setFormEmail] = useState("");
  const [formOfficeAddress, setFormOfficeAddress] = useState("");
  const [formOfficeAddressLocal, setFormOfficeAddressLocal] = useState("");
  const [formIsActive, setFormIsActive] = useState(true);

  const openAdd = () => {
    setDrawerMode("add");
    setEditingItem(null);
    setFormServiceId(services[0]?.id ?? "");
    setFormZoneId(dynamicZones[0]?.id ? String(dynamicZones[0].id) : "1");
    setFormOfficerName("");
    setFormOfficerNameLocal("");
    setFormDesignation("");
    setFormDesignationLocal("");
    setFormMobileNo("");
    setFormEmail("");
    setFormOfficeAddress("");
    setFormOfficeAddressLocal("");
    setFormIsActive(true);
    setDrawerOpen(true);
  };

  const openEdit = (item: OfficerAllocationConfig) => {
    setDrawerMode("edit");
    setEditingItem(item);
    setFormServiceId(item.serviceId);
    setFormZoneId(String(item.zoneId));
    setFormOfficerName(item.officerName);
    setFormOfficerNameLocal(item.officerNameLocal ?? "");
    setFormDesignation(item.designation);
    setFormDesignationLocal(item.designationLocal ?? "");
    setFormMobileNo(item.mobileNo);
    setFormEmail(item.email ?? "");
    setFormOfficeAddress(item.officeAddress ?? "");
    setFormOfficeAddressLocal(item.officeAddressLocal ?? "");
    setFormIsActive(item.isActive);
    setDrawerOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formOfficerName.trim()) {
      toast.error(locale === "mr" ? "कृपया अधिकाऱ्याचे नाव प्रविष्ट करा" : "Officer name is required");
      return;
    }

    if (!formMobileNo.trim()) {
      toast.error(locale === "mr" ? "कृपया मोबाईल क्रमांक प्रविष्ट करा" : "Mobile number is required");
      return;
    }

    const zoneObj = dynamicZones.find((z) => z.id === Number(formZoneId)) ?? dynamicZones[0] ?? {
      id: Number(formZoneId) || 1,
      name: `Zone ${formZoneId}`,
      nameLocal: `प्रभाग ${formZoneId}`,
    };

    startTransition(async () => {
      try {
        if (drawerMode === "add") {
          const res = await saveAllocation({
            serviceId: formServiceId,
            zoneId: zoneObj.id,
            zoneName: zoneObj.name,
            zoneNameLocal: zoneObj.nameLocal ?? undefined,
            officerName: formOfficerName.trim(),
            officerNameLocal: formOfficerNameLocal.trim() || undefined,
            designation: formDesignation.trim() || "Designated Officer",
            designationLocal: formDesignationLocal.trim() || undefined,
            mobileNo: formMobileNo.trim(),
            email: formEmail.trim() || undefined,
            officeAddress: formOfficeAddress.trim() || undefined,
            officeAddressLocal: formOfficeAddressLocal.trim() || undefined,
            isActive: formIsActive,
          });

          if (res.success && res.allocation) {
            setAllocations((prev) => [res.allocation!, ...prev]);
            toast.success(
              locale === "mr" ? "अधिकारी वाटप यशस्वीरीत्या जोडले गेले" : "Officer allocation added successfully"
            );
            setDrawerOpen(false);
          } else {
            toast.error(res.error || (locale === "mr" ? "जोडण्यात त्रुटी आली" : "Failed to add allocation"));
          }
        } else {
          if (!editingItem) return;
          const res = await updateAllocation(editingItem.id, {
            zoneId: zoneObj.id,
            zoneName: zoneObj.name,
            zoneNameLocal: zoneObj.nameLocal ?? undefined,
            officerName: formOfficerName.trim(),
            officerNameLocal: formOfficerNameLocal.trim() || undefined,
            designation: formDesignation.trim() || "Designated Officer",
            designationLocal: formDesignationLocal.trim() || undefined,
            mobileNo: formMobileNo.trim(),
            email: formEmail.trim() || undefined,
            officeAddress: formOfficeAddress.trim() || undefined,
            officeAddressLocal: formOfficeAddressLocal.trim() || undefined,
            isActive: formIsActive,
          });

          if (res.success && res.allocation) {
            setAllocations((prev) =>
              prev.map((a) => (a.id === editingItem.id ? res.allocation! : a))
            );
            toast.success(
              locale === "mr" ? "अधिकारी वाटप अद्यतनित केले गेले" : "Officer allocation updated successfully"
            );
            setDrawerOpen(false);
          } else {
            toast.error(res.error || (locale === "mr" ? "अद्यतनित करण्यात त्रुटी आली" : "Failed to update allocation"));
          }
        }
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Unexpected error");
      }
    });
  };

  // Filtered
  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    return allocations.filter((item) => {
      const matchSearch =
        !q ||
        item.officerName.toLowerCase().includes(q) ||
        (item.officerNameLocal && item.officerNameLocal.toLowerCase().includes(q)) ||
        item.serviceName.toLowerCase().includes(q) ||
        (item.serviceNameLocal && item.serviceNameLocal.toLowerCase().includes(q)) ||
        item.mobileNo.includes(q) ||
        item.designation.toLowerCase().includes(q) ||
        (item.designationLocal && item.designationLocal.toLowerCase().includes(q));

      const matchService = !selectedServiceId || item.serviceId === selectedServiceId;
      const matchZone = !selectedZoneId || String(item.zoneId) === selectedZoneId;

      return matchSearch && matchService && matchZone;
    });
  }, [allocations, search, selectedServiceId, selectedZoneId]);

  const totalPages = Math.ceil(filtered.length / 12) || 1;
  const paginated = useMemo(() => {
    const start = (page - 1) * 12;
    return filtered.slice(start, start + 12);
  }, [filtered, page]);

  const rows: AllocationRow[] = paginated.map((item, index) => ({
    ...item,
    srNo: (page - 1) * 12 + index + 1,
  }));

  const columns: Column<AllocationRow>[] = [
    {
      key: "srNo",
      label: locale === "mr" ? "अ.क्र." : "Sr No",
      width: "60px",
      align: "center",
      headerClassName: "border-r border-blue-300/60 text-white",
      cellClassName: "font-bold text-slate-500 border-r border-slate-100",
      render: (value) => numberFormatter.format(Number(value)),
    },
    {
      key: "serviceName",
      label: locale === "mr" ? "सेवा नाव" : "Service",
      headerClassName: "border-r border-blue-300/60 text-white",
      cellClassName: "font-semibold text-slate-900 border-r border-slate-100",
      render: (_value, row) => (
        <span className="text-xs font-semibold">
          {locale === "mr" ? row.serviceNameLocal || row.serviceName : row.serviceName}
        </span>
      ),
    },
    {
      key: "zoneName",
      label: locale === "mr" ? "प्रभाग समिती" : "Zone / Prabhag",
      width: "150px",
      align: "center",
      headerClassName: "border-r border-blue-300/60 text-white",
      cellClassName: "border-r border-slate-100",
      render: (_value, row) => {
        const zoneId = row.zoneId;
        const colorClass =
          ZONE_PALETTES[(zoneId - 1) % ZONE_PALETTES.length] || ZONE_PALETTES[0];

        return (
          <span
            className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-[11px] font-bold ${colorClass}`}
          >
            {locale === "mr" ? row.zoneNameLocal || `प्रभाग समिती ${zoneId}` : row.zoneName || `Prabhag ${zoneId}`}
          </span>
        );
      },
    },
    {
      key: "officerName",
      label: locale === "mr" ? "अधिकारी व पदनाम" : "Officer & Designation",
      headerClassName: "border-r border-blue-300/60 text-white",
      cellClassName: "border-r border-slate-100",
      render: (_value, row) => (
        <div className="space-y-0.5">
          <div className="font-bold text-slate-900 text-xs">
            {locale === "mr"
              ? row.officerNameLocal
                ? `${row.officerNameLocal} (${row.officerName})`
                : row.officerName
              : row.officerNameLocal
              ? `${row.officerName} (${row.officerNameLocal})`
              : row.officerName}
          </div>
          <div className="text-[11px] text-slate-500 font-medium">
            {locale === "mr" ? row.designationLocal || row.designation : row.designation}
          </div>
        </div>
      ),
    },
    {
      key: "mobileNo",
      label: locale === "mr" ? "संपर्क" : "Contact",
      width: "160px",
      headerClassName: "border-r border-blue-300/60 text-white",
      cellClassName: "border-r border-slate-100 font-mono text-xs text-slate-700",
      render: (_value, row) => (
        <div className="space-y-0.5">
          <div className="font-semibold text-slate-800">{row.mobileNo}</div>
          {row.email ? (
            <div className="text-[10px] text-slate-400 truncate max-w-[150px]">{row.email}</div>
          ) : null}
        </div>
      ),
    },
    {
      key: "officeAddress",
      label: locale === "mr" ? "कार्यालय पत्ता" : "Office Address",
      headerClassName: "border-r border-blue-300/60 text-white",
      cellClassName: "border-r border-slate-100 text-xs text-slate-600 truncate max-w-[200px]",
      render: (_value, row) =>
        locale === "mr"
          ? row.officeAddressLocal || row.officeAddress || "-"
          : row.officeAddress || row.officeAddressLocal || "-",
    },
    {
      key: "isActive",
      label: locale === "mr" ? "स्थिती" : "Status",
      width: "90px",
      align: "center",
      headerClassName: "border-r border-blue-300/60 text-white",
      cellClassName: "border-r border-slate-100",
      render: (value) => (
        <StatusBadge
          value={Boolean(value)}
          activeLabel={locale === "mr" ? "सक्रिय" : "Active"}
          inactiveLabel={locale === "mr" ? "अक्रिय" : "Inactive"}
          className="px-2 py-0.5 text-[10px]"
        />
      ),
    },
  ];

  return (
    <>
      <div className="space-y-4">
        <Card className="flex flex-col justify-between rounded-2xl gap-4 border border-slate-200 bg-white p-4 shadow-sm sm:flex-row sm:items-center">
          <div className="flex flex-row items-center gap-4">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-blue-100 bg-blue-50 text-blue-600">
              <UserCheck className="h-5 w-5" />
            </div>
            <div>
              <h1 className="flex items-center gap-2 text-xl font-bold tracking-tight text-slate-800">
                {locale === "mr" ? "सेवा अधिकारी वाटप व्यवस्थापन" : "RTS Service Officer Allocation"}
              </h1>
              <p className="text-xs text-slate-500">
                {locale === "mr"
                  ? "अकोला महानगरपालिका - प्रभाग समितीनिहाय नियुक्त लोकसेवा अधिकारी (RTS Officers)"
                  : "Akola Municipal Corporation - Zone-wise Designated RTS Officers"}
              </p>
            </div>
          </div>

          <AddButton
            type="button"
            onClick={openAdd}
            label={locale === "mr" ? "नवीन अधिकारी वाटप" : "Add Officer Allocation"}
          />
        </Card>

        <Card className="border border-slate-200 bg-white p-3 shadow-sm">
          <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 md:grid-cols-3">
            <div className="space-y-1">
              <Label className="text-[10px] font-bold uppercase text-[#3d3d3d]">
                {t("actions.search")}
              </Label>
              <SearchInput
                value={search}
                onChange={(val) => {
                  setSearch(val);
                  setPage(1);
                }}
                placeholder={
                  locale === "mr" ? "अधिकारी नाव, मोबाईल किंवा सेवा शोधा..." : "Search officer, mobile, service..."
                }
                className="w-full mb-0 [&_input]:py-1.5 [&_input]:text-xs"
              />
            </div>

            <div className="space-y-1">
              <Label className="text-[10px] font-bold uppercase text-[#3d3d3d]">
                {locale === "mr" ? "सेवा फिल्टर" : "Service"}
              </Label>
              <Select
                value={selectedServiceId ?? ""}
                selectSize="sm"
                placeholder={locale === "mr" ? "सर्व सेवा" : "All Services"}
                options={[
                  { label: locale === "mr" ? "सर्व सेवा" : "All Services", value: "" },
                  ...(services || []).map((s) => ({
                    label: locale === "mr" ? s.nameLocal || s.name : s.name,
                    value: s.id,
                  })),
                ]}
                onChange={(_, val) => {
                  setSelectedServiceId(val || null);
                  setPage(1);
                }}
              />
            </div>

            <div className="space-y-1">
              <Label className="text-[10px] font-bold uppercase text-[#3d3d3d]">
                {locale === "mr" ? "प्रभाग समिती फिल्टर" : "Zone / Prabhag"}
              </Label>
              <Select
                value={selectedZoneId ?? ""}
                selectSize="sm"
                placeholder={locale === "mr" ? "सर्व प्रभाग समित्या" : "All Prabhag Samitis"}
                options={[
                  { label: locale === "mr" ? "सर्व प्रभाग समित्या" : "All Prabhag Samitis", value: "" },
                  ...dynamicZones.map((z) => ({
                    label: locale === "mr" ? z.nameLocal || z.name : z.name,
                    value: String(z.id),
                  })),
                ]}
                onChange={(_, val) => {
                  setSelectedZoneId(val || null);
                  setPage(1);
                }}
              />
            </div>
          </div>
        </Card>

        <MasterTable
          columns={columns}
          data={rows}
          getRowKey={(row) => row.id}
          emptyText={locale === "mr" ? "कोणतेही अधिकारी वाटप आढळले नाही" : "No officer allocations found"}
          actionLabel={locale === "mr" ? "कृती" : "Actions"}
          pageNumber={page}
          pageSize={12}
          totalCount={filtered.length}
          totalPages={totalPages}
          onPageChange={setPage}
          paginationConfig={{
            enabled: totalPages > 1,
            showPageSizeSelector: false,
          }}
          maxBodyHeightClassName="min-h-[200px] max-h-auto"
          theadClassName={RTS_DASHBOARD_TABLE_HEAD_CLASS}
          tableClassName={`${RTS_DASHBOARD_TABLE_CLASS} border-collapse text-left text-sm`}
          containerClassName={RTS_DASHBOARD_TABLE_CONTAINER_CLASS}
          onRowClick={(row) =>
            setSelectedRowId(selectedRowId === row.id ? null : row.id)
          }
          rowClassName={(row) =>
            selectedRowId === row.id ? "bg-blue-50/70" : "hover:bg-blue-50"
          }
          renderActions={(row) => (
            <div className="flex justify-center gap-1.5" onClick={(e) => e.stopPropagation()}>
              <EditButton
                type="button"
                className="size-9 px-0"
                aria-label={t("buttons.edit")}
                title={t("buttons.edit")}
                onClick={() => {
                  const item = allocations.find((a) => a.id === row.id);
                  if (item) openEdit(item);
                }}
              />
            </div>
          )}
        />
      </div>

      <Drawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        width="md"
        title={
          <div className="flex items-center gap-2">
            <UserCheck className="h-5 w-5 text-blue-600" />
            <span className="text-sm font-extrabold text-slate-800">
              {drawerMode === "add"
                ? locale === "mr"
                  ? "नवीन सेवा अधिकारी वाटप नोंदणी"
                  : "New Officer Allocation"
                : locale === "mr"
                ? "सेवा अधिकारी वाटप संपादन"
                : "Edit Officer Allocation"}
            </span>
          </div>
        }
      >
        <form onSubmit={handleSubmit} className="space-y-4 p-5 text-[13px]">
          {drawerMode === "add" ? (
            <div className="space-y-1">
              <Label className="text-[10px] font-bold uppercase text-slate-500">
                {locale === "mr" ? "लोकसेवा निवडा" : "Select Service"}
              </Label>
              <Select
                required
                value={formServiceId}
                placeholder={locale === "mr" ? "सेवा निवडा" : "Select Service"}
                options={(services || []).map((s) => ({
                  label: locale === "mr" ? s.nameLocal || s.name : s.name,
                  value: s.id,
                }))}
                onChange={(_, val) => setFormServiceId(val)}
              />
            </div>
          ) : (
            <div className="rounded-lg border border-slate-200 bg-slate-50 p-2.5">
              <div className="text-[10px] uppercase font-bold text-slate-400">
                {locale === "mr" ? "संबंधित सेवा" : "Assigned Service"}
              </div>
              <div className="font-semibold text-slate-900 text-xs mt-0.5">
                {locale === "mr"
                  ? editingItem?.serviceNameLocal || editingItem?.serviceName
                  : editingItem?.serviceName}
              </div>
            </div>
          )}

          <div className="space-y-1">
            <Label className="text-[10px] font-bold uppercase text-slate-500">
              {locale === "mr" ? "प्रभाग समिती (Zone)" : "Prabhag Samiti (Zone)"}
            </Label>
            <Select
              required
              value={formZoneId}
              placeholder={locale === "mr" ? "प्रभाग समिती निवडा" : "Select Prabhag"}
              options={dynamicZones.map((z) => ({
                label: locale === "mr" ? (z.nameLocal ? `${z.nameLocal} (${z.name})` : z.name) : z.name,
                value: String(z.id),
              }))}
              onChange={(_, val) => setFormZoneId(val)}
            />
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div className="space-y-1">
              <Label className="text-[10px] font-bold uppercase text-slate-500">
                {locale === "mr" ? "अधिकाऱ्याचे नाव (English)" : "Officer Name (English)"}
              </Label>
              <Input
                type="text"
                required
                value={formOfficerName}
                placeholder="e.g. Sachin Deshmukh"
                onChange={(e) => setFormOfficerName(e.target.value)}
                fullWidth
              />
            </div>

            <div className="space-y-1">
              <Label className="text-[10px] font-bold uppercase text-slate-500">
                {locale === "mr" ? "अधिकाऱ्याचे नाव (मराठी)" : "Officer Name (Marathi)"}
              </Label>
              <Input
                type="text"
                value={formOfficerNameLocal}
                placeholder="उदा. सचिन देशमुख"
                onChange={(e) => setFormOfficerNameLocal(e.target.value)}
                fullWidth
              />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div className="space-y-1">
              <Label className="text-[10px] font-bold uppercase text-slate-500">
                {locale === "mr" ? "पदनाम (Designation)" : "Designation (English)"}
              </Label>
              <Input
                type="text"
                value={formDesignation}
                placeholder="e.g. Junior Engineer"
                onChange={(e) => setFormDesignation(e.target.value)}
                fullWidth
              />
            </div>

            <div className="space-y-1">
              <Label className="text-[10px] font-bold uppercase text-slate-500">
                {locale === "mr" ? "पदनाम (मराठी)" : "Designation (Marathi)"}
              </Label>
              <Input
                type="text"
                value={formDesignationLocal}
                placeholder="उदा. कनिष्ठ अभियंता"
                onChange={(e) => setFormDesignationLocal(e.target.value)}
                fullWidth
              />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div className="space-y-1">
              <Label className="text-[10px] font-bold uppercase text-slate-500">
                {locale === "mr" ? "मोबाईल क्रमांक" : "Mobile Number"}
              </Label>
              <Input
                type="text"
                required
                value={formMobileNo}
                placeholder="9822011001"
                onChange={(e) => setFormMobileNo(e.target.value)}
                fullWidth
              />
            </div>

            <div className="space-y-1">
              <Label className="text-[10px] font-bold uppercase text-slate-500">
                {locale === "mr" ? "ईमेल आयडी" : "Email Address"}
              </Label>
              <Input
                type="email"
                value={formEmail}
                placeholder="officer@akolamc.gov.in"
                onChange={(e) => setFormEmail(e.target.value)}
                fullWidth
              />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div className="space-y-1">
              <Label className="text-[10px] font-bold uppercase text-slate-500">
                {locale === "mr" ? "कार्यालय पत्ता (English)" : "Office Address (English)"}
              </Label>
              <Input
                type="text"
                value={formOfficeAddress}
                placeholder="e.g. Prabhag Samiti 1 Office, Akola"
                onChange={(e) => setFormOfficeAddress(e.target.value)}
                fullWidth
              />
            </div>

            <div className="space-y-1">
              <Label className="text-[10px] font-bold uppercase text-slate-500">
                {locale === "mr" ? "कार्यालय पत्ता (मराठी)" : "Office Address (Marathi)"}
              </Label>
              <Input
                type="text"
                value={formOfficeAddressLocal}
                placeholder="उदा. प्रभाग समिती १ कार्यालय, अकोला"
                onChange={(e) => setFormOfficeAddressLocal(e.target.value)}
                fullWidth
              />
            </div>
          </div>

          <div className="flex items-center gap-2 pt-1">
            <input
              type="checkbox"
              id="officerIsActive"
              checked={formIsActive}
              onChange={(e) => setFormIsActive(e.target.checked)}
              className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
            />
            <label htmlFor="officerIsActive" className="text-xs font-medium text-slate-700">
              {locale === "mr" ? "सक्रिय स्थिती (Active Allocation)" : "Active Status"}
            </label>
          </div>

          <div className="flex justify-end gap-2 border-t border-slate-100 pt-4">
            <Button type="button" variant="secondary" onClick={() => setDrawerOpen(false)}>
              {locale === "mr" ? "रद्द करा" : "Cancel"}
            </Button>

            <Button type="submit" isLoading={isPending}>
              {drawerMode === "add"
                ? locale === "mr"
                  ? "जतन करा"
                  : "Save"
                : locale === "mr"
                ? "अद्यतनित करा"
                : "Update"}
            </Button>
          </div>
        </form>
      </Drawer>
    </>
  );
}
