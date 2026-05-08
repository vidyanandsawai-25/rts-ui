"use client";

import { useEffect, useState, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { MasterTable, Column } from "@/components/common/MasterTable";
import { Badge } from "@/components/common/Badge";
import { getTaxDetailsCVAction, getTaxDetailsRVAction } from "../taxDetails.action";
import type { TaxRow } from "@/types/taxDetails.types";

export type TaxDetailsType = "CV" | "RV" | "dual";

// Extended row type for dual-method view
interface DualTaxRow extends TaxRow {
  method: "RV" | "CV";
  baseTaxType: string;
}

interface TaxDetailsTableProps {
  /** 
   * Tax type: "CV" for Capital Value, "RV" for Rateable Value, "dual" for both.
   * If not provided, it will be auto-detected from URL's subTab parameter.
   * subTab=rateable -> RV, subTab=capital -> CV, subTab=dual-method -> dual
   */
  taxType?: TaxDetailsType;
}

const TaxDetailsTable = ({ taxType: propTaxType }: TaxDetailsTableProps) => {
  const t = useTranslations("taxDetails");
  const searchParams = useSearchParams();
  const propertyId = searchParams.get("propertyId");
  const subTab = searchParams.get("subTab");
  
  // Determine taxType from prop or URL subTab parameter
  const taxType: TaxDetailsType = propTaxType ?? (
    subTab === "capital" ? "CV" : 
    subTab === "dual-method" ? "dual" : "RV"
  );

  const [loading, setLoading] = useState(false);
  const [taxData, setTaxData] = useState<TaxRow[]>([]);
  const [totalRV, setTotalRV] = useState(0);
  const [totalTaxAmount, setTotalTaxAmount] = useState(0);
  
  // Dual view state
  const [rvData, setRvData] = useState<TaxRow[]>([]);
  const [cvData, setCvData] = useState<TaxRow[]>([]);
  const [rvTotals, setRvTotals] = useState({ totalRV: 0, totalTax: 0 });
  const [cvTotals, setCvTotals] = useState({ totalCV: 0, totalTax: 0 });

  useEffect(() => {
    const fetchTaxDetails = async () => {
      if (!propertyId) return;

      setLoading(true);
      try {
        if (taxType === "dual") {
          // Fetch both RV and CV data in parallel
          const [rvResult, cvResult] = await Promise.all([
            getTaxDetailsRVAction(propertyId),
            getTaxDetailsCVAction(propertyId)
          ]);
          
          setRvData(rvResult.taxRows);
          setRvTotals({ totalRV: rvResult.totalRV, totalTax: rvResult.totalTax });
          
          setCvData(cvResult.taxRows);
          setCvTotals({ totalCV: cvResult.totalRV, totalTax: cvResult.totalTax });
        } else {
          // Single view - existing logic
          const fetchFn = taxType === "RV" ? getTaxDetailsRVAction : getTaxDetailsCVAction;
          const { taxRows, totalRV: rv, totalTax } = await fetchFn(propertyId);
          setTaxData(taxRows);
          setTotalRV(rv);
          setTotalTaxAmount(totalTax);
        }
      } catch (error) {
        console.error("Error fetching tax details:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchTaxDetails();
  }, [propertyId, taxType]);

  // Combine RV and CV data for dual-method view - interleaved by tax type
  const dualData: DualTaxRow[] = useMemo(() => {
    if (taxType !== "dual") return [];
    
    const combined: DualTaxRow[] = [];
    const taxTypes = ["Amenities Tax", "Commercial Tax", "Residential Tax", "Total Tax"];
    
    taxTypes.forEach((baseTaxType) => {
      const rvRow = rvData.find(r => r.taxType === baseTaxType);
      const cvRow = cvData.find(r => r.taxType === baseTaxType);
      
      if (rvRow) {
        combined.push({
          ...rvRow,
          taxType: `${baseTaxType}`,
          baseTaxType,
          method: "RV"
        });
      }
      if (cvRow) {
        combined.push({
          ...cvRow,
          taxType: `${baseTaxType}`,
          baseTaxType,
          method: "CV"
        });
      }
    });
    
    return combined;
  }, [taxType, rvData, cvData]);

  const formatCurrency = (value: number) => {
    return value > 0 ? value.toLocaleString('en-US') : "";
  };

  // Base columns for single view (RV or CV)
  const columns: Column<TaxRow>[] = [
    {
      key: "taxType",
      label: "Taxes",
      width: "4.5%",
      cellClassName: "font-semibold bg-blue-50",
    },
    {
      key: "generalTax",
      label: "General Tax",
      width: "4.5%",
      render: (value) => (
        <div className="text-center">{formatCurrency(value as number)}</div>
      ),
    },
    {
      key: "stateEducationTax",
      label: "State Education Tax",
      width: "4.5%",
      render: (value) => (
        <div className="text-center">{formatCurrency(value as number)}</div>
      ),
    },
    {
      key: "stateEmploymentTax",
      label: "State Employment Tax",
      width: "4.5%",
      render: (value) => (
        <div className="text-center">{formatCurrency(value as number)}</div>
      ),
    },
    {
      key: "treeCess",
      label: "Tree Cess",
      width: "4.5%",
      render: (value) => (
        <div className="text-center">{formatCurrency(value as number)}</div>
      ),
    },
    {
      key: "specialWaterCess",
      label: "Special Water Cess",
      width: "4.5%",
      render: (value) => (
        <div className="text-center">{formatCurrency(value as number)}</div>
      ),
    },
    {
      key: "roadCess",
      label: "Road Cess",
      width: "4.5%",
      render: (value) => (
        <div className="text-center">{formatCurrency(value as number)}</div>
      ),
    },
    {
      key: "fireCess",
      label: "Fire Cess",
      width: "4.5%",
      render: (value) => (
        <div className="text-center">{formatCurrency(value as number)}</div>
      ),
    },
    {
      key: "lightCess",
      label: "Light Cess",
      width: "4.5%",
      render: (value) => (
        <div className="text-center">{formatCurrency(value as number)}</div>
      ),
    },
    {
      key: "waterBenefitCess",
      label: "Water Benefit Cess",
      width: "4.5%",
      render: (value) => (
        <div className="text-center">{formatCurrency(value as number)}</div>
      ),
    },
    {
      key: "sewageDisposalCess",
      label: "Sewage Disposal Cess",
      width: "4.5%",
      render: (value) => (
        <div className="text-center">{formatCurrency(value as number)}</div>
      ),
    },
    {
      key: "specialEducationTax",
      label: "Special Education Tax",
      width: "4.5%",
      render: (value) => (
        <div className="text-center">{formatCurrency(value as number)}</div>
      ),
    },
    {
      key: "sanitationCess",
      label: "Sanitation Cess",
      width: "4.5%",
      render: (value) => (
        <div className="text-center">{formatCurrency(value as number)}</div>
      ),
    },
    {
      key: "drainCess",
      label: "Drain Cess",
      width: "4.5%",
      render: (value) => (
        <div className="text-center">{formatCurrency(value as number)}</div>
      ),
    },
    {
      key: "waterBill",
      label: "Water Bill",
      width: "4.5%",
      render: (value) => (
        <div className="text-center">{formatCurrency(value as number)}</div>
      ),
    },
    {
      key: "bigBuilding",
      label: "Big Building",
      width: "4.5%",
      render: (value) => (
        <div className="text-center">{formatCurrency(value as number)}</div>
      ),
    },
    {
      key: "illegalConstructionPenalty",
      label: "Illegal Construction Penalty",
      width: "4.5%",
      render: (value) => (
        <div className="text-center">{formatCurrency(value as number)}</div>
      ),
    },
    {
      key: "userCharges",
      label: "User Charges",
      width: "4.5%",
      render: (value) => (
        <div className="text-center">{formatCurrency(value as number)}</div>
      ),
    },
    {
      key: "serviceTax",
      label: "Service Tax",
      width: "4.5%",
      render: (value) => (
        <div className="text-center">{formatCurrency(value as number)}</div>
      ),
    },
    {
      key: "oldPenaltyULB",
      label: "Old Penalty of ULB",
      width: "4.5%",
      render: (value) => (
        <div className="text-center">{formatCurrency(value as number)}</div>
      ),
    },
    {
      key: "runTimePenalty",
      label: "Run Time Penalty",
      width: "4.5%",
      render: (value) => (
        <div className="text-center">{formatCurrency(value as number)}</div>
      ),
    },
    {
      key: "totalTax",
      label: "Total Tax",
      width: "4.5%",
      cellClassName: "font-semibold bg-green-50",
      render: (value) => (
        <div className="text-center font-semibold">{formatCurrency(value as number)}</div>
      ),
    },
  ];

  // Columns for dual-method view - adds Method column first
  const dualColumns: Column<DualTaxRow>[] = [
    {
      key: "taxType",
      label: "Taxes",
      width: "8%",
      render: (_, row) => (
        <div className="flex items-center gap-2">
          <span className="font-semibold">{row.taxType}</span>
        </div>
      ),
      cellClassName: "font-semibold",
    },
    {
      key: "method",
      label: "Method",
      width: "4%",
      render: (_, row) => {
        const isRV = row.method === "RV";
        return (
          <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${
            isRV 
              ? "bg-blue-100 text-blue-700 border border-blue-300" 
              : "bg-emerald-100 text-emerald-700 border border-emerald-300"
          }`}>
            {row.method}
          </span>
        );
      },
    },
    {
      key: "generalTax",
      label: "General Tax",
      width: "4%",
      render: (value) => (
        <div className="text-center">{formatCurrency(value as number)}</div>
      ),
    },
    {
      key: "stateEducationTax",
      label: "State Education Tax",
      width: "4%",
      render: (value) => (
        <div className="text-center">{formatCurrency(value as number)}</div>
      ),
    },
    {
      key: "stateEmploymentTax",
      label: "State Employment Tax",
      width: "4%",
      render: (value) => (
        <div className="text-center">{formatCurrency(value as number)}</div>
      ),
    },
    {
      key: "treeCess",
      label: "Tree Cess",
      width: "4%",
      render: (value) => (
        <div className="text-center">{formatCurrency(value as number)}</div>
      ),
    },
    {
      key: "specialWaterCess",
      label: "Special Water Cess",
      width: "4%",
      render: (value) => (
        <div className="text-center">{formatCurrency(value as number)}</div>
      ),
    },
    {
      key: "roadCess",
      label: "Road Cess",
      width: "4%",
      render: (value) => (
        <div className="text-center">{formatCurrency(value as number)}</div>
      ),
    },
    {
      key: "fireCess",
      label: "Fire Cess",
      width: "4%",
      render: (value) => (
        <div className="text-center">{formatCurrency(value as number)}</div>
      ),
    },
    {
      key: "lightCess",
      label: "Light Cess",
      width: "4%",
      render: (value) => (
        <div className="text-center">{formatCurrency(value as number)}</div>
      ),
    },
    {
      key: "waterBenefitCess",
      label: "Water Benefit Cess",
      width: "4%",
      render: (value) => (
        <div className="text-center">{formatCurrency(value as number)}</div>
      ),
    },
    {
      key: "sewageDisposalCess",
      label: "Sewage Disposal Cess",
      width: "4%",
      render: (value) => (
        <div className="text-center">{formatCurrency(value as number)}</div>
      ),
    },
    {
      key: "specialEducationTax",
      label: "Special Education Tax",
      width: "4%",
      render: (value) => (
        <div className="text-center">{formatCurrency(value as number)}</div>
      ),
    },
    {
      key: "sanitationCess",
      label: "Sanitation Cess",
      width: "4%",
      render: (value) => (
        <div className="text-center">{formatCurrency(value as number)}</div>
      ),
    },
    {
      key: "drainCess",
      label: "Drain Cess",
      width: "4%",
      render: (value) => (
        <div className="text-center">{formatCurrency(value as number)}</div>
      ),
    },
    {
      key: "waterBill",
      label: "Water Bill",
      width: "4%",
      render: (value) => (
        <div className="text-center">{formatCurrency(value as number)}</div>
      ),
    },
    {
      key: "bigBuilding",
      label: "Big Building",
      width: "4%",
      render: (value) => (
        <div className="text-center">{formatCurrency(value as number)}</div>
      ),
    },
    {
      key: "illegalConstructionPenalty",
      label: "Illegal Con. Penalty",
      width: "4%",
      render: (value) => (
        <div className="text-center">{formatCurrency(value as number)}</div>
      ),
    },
    {
      key: "userCharges",
      label: "User Charges",
      width: "4%",
      render: (value) => (
        <div className="text-center">{formatCurrency(value as number)}</div>
      ),
    },
    {
      key: "serviceTax",
      label: "Service Tax",
      width: "4%",
      render: (value) => (
        <div className="text-center">{formatCurrency(value as number)}</div>
      ),
    },
    {
      key: "oldPenaltyULB",
      label: "Old Penalty ULB",
      width: "4%",
      render: (value) => (
        <div className="text-center">{formatCurrency(value as number)}</div>
      ),
    },
    {
      key: "runTimePenalty",
      label: "Run Time Penalty",
      width: "4%",
      render: (value) => (
        <div className="text-center">{formatCurrency(value as number)}</div>
      ),
    },
    {
      key: "totalTax",
      label: "Total Tax",
      width: "4%",
      render: (value, row) => {
        const isRV = row.method === "RV";
        return (
          <div className={`text-center font-bold ${isRV ? "text-blue-700" : "text-emerald-700"}`}>
            {formatCurrency(value as number)}
          </div>
        );
      },
    },
  ];

  // Dual-method view - single table with RV and CV rows interleaved
  if (taxType === "dual") {
    return (
      <div className="mt-0">
        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
          {/* Header */}
          <div className="px-4 py-2 bg-gradient-to-r from-purple-50 to-indigo-50 border-b border-purple-200 flex justify-between items-center">
            <div className="flex items-center gap-3">
              <h3 className="text-base font-bold text-purple-900">{t("taxDetailsDualMethod")}</h3>
              {/* Legend */}
              <div className="flex items-center gap-2 ml-4">
                <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-blue-100 text-blue-700 border border-blue-300">
                  RV
                </span>
                <span className="text-xs text-gray-500">{t("rateableValue")}</span>
                <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-700 border border-emerald-300 ml-2">
                  CV
                </span>
                <span className="text-xs text-gray-500">{t("capitalValue")}</span>
              </div>
            </div>
            <div className="flex gap-3">
              <Badge size="lg" className="bg-blue-600 text-white px-3 py-1 rounded-md text-xs font-semibold shadow-sm">
                {`Total RV: ${rvTotals.totalRV.toLocaleString('en-US')}`}
              </Badge>
              <Badge size="lg" className="bg-blue-600 text-white px-3 py-1 rounded-md text-xs font-semibold shadow-sm">
                {`RV Tax: ${rvTotals.totalTax.toLocaleString('en-US')}`}
              </Badge>
              <Badge size="lg" className="bg-emerald-600 text-white px-3 py-1 rounded-md text-xs font-semibold shadow-sm">
                {`Total CV: ${cvTotals.totalCV.toLocaleString('en-US')}`}
              </Badge>
              <Badge size="lg" className="bg-emerald-600 text-white px-3 py-1 rounded-md text-xs font-semibold shadow-sm">
                {`CV Tax: ${cvTotals.totalTax.toLocaleString('en-US')}`}
              </Badge>
            </div>
          </div>

          <MasterTable
            columns={dualColumns}
            data={dualData}
            loading={loading}
            paginationConfig={{ enabled: false }}
            containerClassName="border-0 shadow-none"
            tableClassName="text-xs"
            theadClassName="bg-purple-100 truncate"
            rowClassName={(row) => {
              const isRV = row.method === "RV";
              const isTotal = row.baseTaxType === "Total Tax";
              
              if (isTotal) {
                return isRV 
                  ? "bg-blue-50 font-semibold border-t-2 border-purple-300" 
                  : "bg-emerald-50 font-semibold border-b-2 border-purple-300";
              }
              
              return isRV 
                ? "bg-blue-50/30 border-l-4 border-l-blue-400" 
                : "bg-emerald-50/30 border-l-4 border-l-emerald-400 border-b border-b-gray-200";
            }}
          />
        </div>
      </div>
    );
  }

  // Single view (RV or CV) - original layout
  return (
    <div className="mt-0">
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
        <div className="px-4 py-1 bg-gradient-to-r from-blue-50 to-blue-100 border-b border-blue-200 flex justify-between items-center">
          <h3 className="text-base font-bold text-blue-900">
            {taxType === "RV" ? "Tax Details (Rateable Value)" : "Tax Details (Capital Value)"}
          </h3>
          <div className="flex gap-4">
            <Badge size="lg" className="bg-teal-500 text-white px-4 py-1.5 rounded-md text-sm font-semibold shadow-sm flex items-center gap-3">
              {`Total ${taxType} : ${totalRV.toLocaleString('en-US')}`}
            </Badge>
            <Badge size="lg" className="bg-teal-500 text-white px-4 py-1.5 rounded-md text-sm font-semibold shadow-sm flex items-center gap-3">
              {`Total Tax : ${totalTaxAmount.toLocaleString('en-US')}`}
            </Badge>
          </div>
        </div>

        <MasterTable
          columns={columns}
          data={taxData}
          loading={loading}
          paginationConfig={{ enabled: false }}
          containerClassName="border-0 shadow-none"
          tableClassName="text-xs"
          theadClassName="bg-blue-100 truncate"
          rowClassName={(row) => 
            row.taxType === "Total Tax" 
              ? "bg-blue-50 font-semibold border-t-1 border-blue-300" 
              : ""
          }
        />
      </div>
    </div>
  );
};

export default TaxDetailsTable;
