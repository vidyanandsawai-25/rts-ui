import { useTranslations } from "next-intl";
import { Scale } from "lucide-react";
import { Drawer, MasterTable, Button } from "@/components/common";
import type { Column } from "@/components/common/MasterTable";
import { NewProperty, OldPropertyCandidate } from "@/types/property-mapping";
import { formatArea } from "./mappingUtils";

interface CompareRow {
  label: string;
  baseVal: string;
  candVal: string;
  isMatch: boolean;
  [key: string]: unknown;
}

interface DiffModalProps {
  candidate: OldPropertyCandidate | null;
  currentNewProperty: NewProperty | undefined;
  onClose: () => void;
  money: (val: number) => string;
  rvLabel?: string;
}

export function DiffModal({
  candidate,
  currentNewProperty,
  onClose,
  money,
  rvLabel,
}: DiffModalProps) {
  const t = useTranslations("propertyMapping");
  if (!candidate || !currentNewProperty) return null;

  const areaUnit = t("diffModal.areaUnit");
  const naValue = t("diffModal.naValue");

  const compareFields: (CompareRow & { variancePct?: number })[] = [
    {
      label: t("diffModal.fields.ownerName"),
      baseVal: currentNewProperty.owner,
      candVal: candidate.owner,
      isMatch: (() => {
        const o1 = currentNewProperty.owner.toLowerCase().trim();
        const o2 = candidate.owner.toLowerCase().trim();
        if (!o1 || !o2) return false;
        const clean1 = o1.replace(/[^a-z0-9\u0900-\u097F]/g, "");
        const clean2 = o2.replace(/[^a-z0-9\u0900-\u097F]/g, "");
        return clean1.includes(clean2) || clean2.includes(clean1);
      })()
    },
    {
      label: t("diffModal.fields.builtUpArea"),
      baseVal: `${formatArea(currentNewProperty.builtUpArea)} ${areaUnit}`,
      candVal: `${formatArea(candidate.area)} ${areaUnit}`,
      variancePct: (() => {
        const maxVal = Math.max(currentNewProperty.builtUpArea, candidate.area);
        if (maxVal === 0) return 0;
        const diff = Math.abs(currentNewProperty.builtUpArea - candidate.area);
        return parseFloat(((diff / maxVal) * 100).toFixed(1));
      })(),
      isMatch: (() => {
        if (currentNewProperty.builtUpArea === candidate.area) return true;
        const diff = Math.abs(currentNewProperty.builtUpArea - candidate.area);
        const maxVal = Math.max(currentNewProperty.builtUpArea, candidate.area);
        if (maxVal === 0) return true;
        const pct = (diff / maxVal) * 100;
        return pct <= 10; // Strict 10% ratio tolerance limit
      })()
    },
    {
      label: t("diffModal.fields.carpetArea"),
      baseVal: `${formatArea(currentNewProperty.carpetArea || 0)} ${areaUnit}`,
      candVal: `${formatArea(candidate.carpetArea || 0)} ${areaUnit}`,
      variancePct: (() => {
        const newCarpet = currentNewProperty.carpetArea || 0;
        const oldCarpet = candidate.carpetArea || 0;
        const maxVal = Math.max(newCarpet, oldCarpet);
        if (maxVal === 0) return 0;
        const diff = Math.abs(newCarpet - oldCarpet);
        return parseFloat(((diff / maxVal) * 100).toFixed(1));
      })(),
      isMatch: (() => {
        const newCarpet = currentNewProperty.carpetArea || 0;
        const oldCarpet = candidate.carpetArea || 0;
        if (newCarpet === 0 && oldCarpet === 0) return true;
        const maxVal = Math.max(newCarpet, oldCarpet);
        if (maxVal === 0) return true;
        const diff = Math.abs(newCarpet - oldCarpet);
        const pct = (diff / maxVal) * 100;
        return pct <= 10; // Strict 10% ratio tolerance limit
      })()
    },
    {
      label: t("diffModal.fields.floors"),
      baseVal: currentNewProperty.floors,
      candVal: candidate.floors,
      isMatch: (() => {
        const f1 = currentNewProperty.floors.toLowerCase().trim();
        const f2 = candidate.floors.toLowerCase().trim();
        if (!f1 || !f2) return false;
        if (f1 === f2) return true;
        const isGround1 = f1.includes("ground") || f1.includes("तळमजला") || f1.includes("g");
        const isGround2 = f2.includes("ground") || f2.includes("तळमजला") || f2.includes("g");
        return isGround1 && isGround2;
      })()
    },
    {
      label: rvLabel || t("diffModal.fields.rateableValue"),
      baseVal: currentNewProperty.rv ? money(currentNewProperty.rv) : "",
      candVal: candidate.rv ? money(candidate.rv) : "",
      variancePct: (() => {
        const baseRv = currentNewProperty.rv || 0;
        const candRv = candidate.rv || 0;
        const maxVal = Math.max(baseRv, candRv);
        if (maxVal === 0) return 0;
        const diff = Math.abs(baseRv - candRv);
        return parseFloat(((diff / maxVal) * 100).toFixed(1));
      })(),
      isMatch: (() => {
        const baseRv = currentNewProperty.rv || 0;
        const candRv = candidate.rv || 0;
        if (baseRv === 0 && candRv === 0) return true;
        const maxVal = Math.max(baseRv, candRv);
        if (maxVal === 0) return true;
        const diff = Math.abs(baseRv - candRv);
        const pct = (diff / maxVal) * 100;
        return pct <= 10; // Strict 10% ratio tolerance limit
      })()
    },
    {
      label: t("diffModal.fields.annualTax"),
      baseVal: money(currentNewProperty.tax),
      candVal: money(candidate.tax),
      variancePct: (() => {
        const maxVal = Math.max(currentNewProperty.tax, candidate.tax);
        if (maxVal === 0) return 0;
        const diff = Math.abs(currentNewProperty.tax - candidate.tax);
        return parseFloat(((diff / maxVal) * 100).toFixed(1));
      })(),
      isMatch: (() => {
        if (candidate.tax === 0 && currentNewProperty.tax === 0) return true;
        const maxVal = Math.max(currentNewProperty.tax, candidate.tax);
        if (maxVal === 0) return true;
        const diff = Math.abs(currentNewProperty.tax - candidate.tax);
        const pct = (diff / maxVal) * 100;
        return pct <= 10; // Strict 10% ratio tolerance limit
      })()
    },
    {
      label: t("diffModal.fields.ctsSurvey"),
      baseVal: currentNewProperty.cts,
      candVal: candidate.cts || "",
      isMatch: (() => {
        const c1 = (currentNewProperty.cts || "").toLowerCase().replace(/[^0-9a-z]/g, "");
        const c2 = (candidate.cts || "").toLowerCase().replace(/[^0-9a-z]/g, "");
        return c1 !== "" && c2 !== "" && (c1 === c2 || c1.includes(c2) || c2.includes(c1));
      })()
    },
    {
      label: t("diffModal.fields.useCategory"),
      baseVal: currentNewProperty.use || "",
      candVal: candidate.use || "",
      isMatch: (() => {
        const raw1 = (currentNewProperty.use || "").toLowerCase().trim();
        const raw2 = (candidate.use || "").toLowerCase().trim();
        if (!raw1 || !raw2) return false;
        if (raw1.includes(raw2) || raw2.includes(raw1)) return true;

        // Cross-lingual Marathi ↔ English mapping
        const isRes1 = raw1.includes("res") || raw1.includes("निवासी") || raw1.includes("रिवासी");
        const isRes2 = raw2.includes("res") || raw2.includes("निवासी") || raw2.includes("रिवासी");
        if (isRes1 && isRes2) return true;

        const isComm1 = raw1.includes("comm") || raw1.includes("व्यावसायिक") || raw1.includes("वाणिज्यिक");
        const isComm2 = raw2.includes("comm") || raw2.includes("व्यावसायिक") || raw2.includes("वाणिज्यिक");
        if (isComm1 && isComm2) return true;

        return false;
      })()
    },
    {
      label: t("diffModal.fields.zoneWard"),
      baseVal: [currentNewProperty.zone, currentNewProperty.ward].filter(Boolean).join(" / "),
      candVal: [candidate.zone, candidate.ward].filter(Boolean).join(" / "),
      isMatch: (() => {
        const z1 = (currentNewProperty.zone || "").toLowerCase().replace(/\D/g, "");
        const z2 = (candidate.zone || "").toLowerCase().replace(/\D/g, "");
        const w1 = (currentNewProperty.ward || "").toLowerCase().replace(/\D/g, "");
        const w2 = (candidate.ward || "").toLowerCase().replace(/\D/g, "");
        const zoneMatch = z1 !== "" && z2 !== "" && (z1 === z2 || z1.includes(z2) || z2.includes(z1));
        const wardMatch = w1 !== "" && w2 !== "" && (w1 === w2 || w1.includes(w2) || w2.includes(w1));
        return zoneMatch || wardMatch;
      })()
    },
    {
      label: t("diffModal.fields.plotNumber"),
      baseVal: currentNewProperty.plotNo || "",
      candVal: candidate.plotNo || "",
      isMatch: (() => {
        const p1 = (currentNewProperty.plotNo || "").toLowerCase().replace(/[^a-z0-9]/g, "");
        const p2 = (candidate.plotNo || "").toLowerCase().replace(/[^a-z0-9]/g, "");
        return p1 !== "" && p2 !== "" && p1 === p2;
      })()
    },
    {
      label: t("diffModal.fields.constructionYear"),
      baseVal: currentNewProperty.constructionYear || "",
      candVal: candidate.constructionYear || "",
      isMatch: (() => {
        const y1 = (currentNewProperty.constructionYear || "").toLowerCase().replace(/\D/g, "");
        const y2 = (candidate.constructionYear || "").toLowerCase().replace(/\D/g, "");
        return y1 !== "" && y2 !== "" && y1 === y2;
      })()
    },
    {
      label: t("diffModal.fields.mobileNumber"),
      baseVal: String(currentNewProperty.mobile || ""),
      candVal: candidate.mobile ? String(candidate.mobile) : naValue,
      isMatch: (() => {
        const m1 = String(currentNewProperty.mobile || "").replace(/\D/g, "");
        const m2 = candidate.mobile ? String(candidate.mobile).replace(/\D/g, "") : "";
        return m1 !== "" && m2 !== "" && m1 === m2;
      })()
    },
    {
      label: t("diffModal.fields.address"),
      baseVal: currentNewProperty.address,
      candVal: candidate.address,
      isMatch: (() => {
        const a1 = currentNewProperty.address.toLowerCase();
        const a2 = candidate.address.toLowerCase();
        if (!a1 || !a2) return false;
        if (a1.includes(a2) || a2.includes(a1)) return true;
        // Tokenized word overlap check
        const tokens1 = a1.split(/[\s,.-]+/).filter(t => t.length > 3);
        const tokens2 = a2.split(/[\s,.-]+/).filter(t => t.length > 3);
        return tokens1.some(t => tokens2.includes(t));
      })()
    }
  ];

  const columns: Column<CompareRow & { variancePct?: number }>[] = [
    {
      key: "label",
      label: t("diffModal.columns.parameters"),
      width: "160px",
      cellClassName: "py-2 px-3 font-extrabold text-xs text-slate-800",
      headerClassName: "whitespace-nowrap",
      render: (val) => String(val),
    },
    {
      key: "baseVal",
      label: t("diffModal.columns.newPropertyRecord"),
      align: "center",
      cellClassName: "py-2 px-3 font-extrabold text-xs text-slate-900",
      headerClassName: "whitespace-nowrap",
      render: (val) => String(val),
    },
    {
      key: "candVal",
      label: t("diffModal.columns.oldPropertyRecord"),
      align: "center",
      cellClassName: "py-2 px-3 font-extrabold text-xs text-slate-900",
      headerClassName: "whitespace-nowrap",
      render: (val) => String(val),
    },
    {
      key: "isMatch",
      label: t("diffModal.columns.status"),
      align: "center",
      width: "140px",
      headerClassName: "whitespace-nowrap",
      render: (_, row) => {
        const cleanBase = String(row.baseVal || "").trim().toLowerCase();
        const cleanCand = String(row.candVal || "").trim().toLowerCase();

        const isEmptyValue = (val: string) => {
          return val === "" || val === "-" || val === naValue.toLowerCase() || val === "0 sq. ft." || val === "₹0";
        };

        const isEmpty = isEmptyValue(cleanBase) && isEmptyValue(cleanCand);

        if (isEmpty) {
          return (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-slate-100 text-slate-500 border border-slate-200">
              {t("diffModal.matchStatus.noData")}
            </span>
          );
        }

        return row.isMatch ? (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-50 text-emerald-700 border border-emerald-200">
            {t("diffModal.matchStatus.matched")}
          </span>
        ) : (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-rose-50 text-rose-700 border border-rose-200">
            {t("diffModal.matchStatus.unmatch")}
          </span>
        );
      }
    }
  ];

  return (
    <Drawer
      open={!!candidate}
      onClose={onClose}
      width="lg"
      bodyClassName="min-h-0"
      title={
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-emerald-500 text-white rounded-lg shadow-xs">
            <Scale size={16} />
          </div>
          <div>
            <h3 className="text-sm font-extrabold text-slate-800">{t("diffModal.title")}</h3>
            <p className="text-[10px] text-slate-500 font-semibold mt-0.5">
              {t("diffModal.subtitle")}
            </p>
          </div>
        </div>
      }
      footer={
        <Button
          variant="primary"
          size="sm"
          onClick={onClose}
          className="rounded-xl font-extrabold shadow-sm transition-all duration-150 hover:scale-105 animate-fade-in"
        >
          {t("diffModal.closeButton")}
        </Button>
      }
    >
      <div className="p-5">
        <MasterTable
          columns={columns}
          data={compareFields}
          getRowKey={(row) => row.label}
          paginationConfig={{ enabled: false }}
          rowClassName={(row) => {
            return row.isMatch
              ? "bg-emerald-50/10 hover:bg-emerald-50/20 transition-all duration-150 border-b border-slate-100"
              : "bg-rose-50/20 hover:bg-rose-50/40 transition-all duration-150 border-b border-slate-100";
          }}
          tableClassName="w-full"
        />
      </div>
    </Drawer>
  );
}
