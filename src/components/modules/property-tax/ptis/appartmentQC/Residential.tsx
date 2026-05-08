"use client";

import { useEffect, useState, useCallback, useTransition, useMemo } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import CommonPropertyTable from "./CommonPropertyTable";
import TaxDetailsTable from "./TaxDetailsTable";
import { toast } from "sonner";
import { ApartmentQCDetail } from "@/types/apartmentQC.types";

interface ResidentialProps {
  initialData: ApartmentQCDetail[];

  initialTotalCount: number;
  initialPageNumber: number;
  initialPageSize: number;
  initialTotalPages: number;
  initialSearchTerm: string;
  error?: string;
}

const Residential = ({
  initialData,
  initialTotalCount,
  initialPageNumber,
  initialPageSize,
  initialTotalPages,
  initialSearchTerm,
  error,
}: ResidentialProps) => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const [isPending, startTransition] = useTransition();
  const activeTab = searchParams.get("subTab") || "rateable";

  const [data, setData] = useState<ApartmentQCDetail[]>(initialData);
  const [totalCount, setTotalCount] = useState(initialTotalCount);
  const [pageNumber, setPageNumber] = useState(initialPageNumber);
  const [pageSize, setPageSize] = useState(initialPageSize);
  const [totalPages, setTotalPages] = useState(initialTotalPages);

  const [searchQuery, setSearchQuery] = useState(initialSearchTerm);
  const [isAutoScrolling, setIsAutoScrolling] = useState(false);

  useEffect(() => {
    setData(initialData);
    setTotalCount(initialTotalCount);
    setPageNumber(initialPageNumber);
    setPageSize(initialPageSize);
    setTotalPages(initialTotalPages);
    setSearchQuery(initialSearchTerm);
    if (error) {
      toast.error(error);
    }
  }, [initialData, initialTotalCount, initialPageNumber, initialPageSize, initialTotalPages, initialSearchTerm, error]);


  const toggleAutoScroll = () => {
    setIsAutoScrolling((prev) => !prev);
  };

  const handleRowClick = useCallback(
    (row: ApartmentQCDetail) => {
      // Navigate to edit page with property ID
      const propertyId = row.propertyId;
      router.push(`/property-tax/appartmentQC/residential/edit/${propertyId}`);
    },
    [router]
  );

  const updateQueryParams = useCallback(
    (newParams: Record<string, string | number | undefined>) => {
      const params = new URLSearchParams(searchParams.toString());
      Object.entries(newParams).forEach(([key, value]) => {
        if (value === undefined || value === "") {
          params.delete(key);
        } else {
          params.set(key, String(value));
        }
      });
      startTransition(() => {
        router.push(`${pathname}?${params.toString()}`);
      });
    },
    [pathname, router, searchParams]
  );

  const handlePageChange = (p: number) => {
    updateQueryParams({ pageNumber: p });
  };

  const handlePageSizeChange = (s: number) => {
    updateQueryParams({ pageSize: s, pageNumber: 1 });
  };

  // ✅ Columns based on the activeTab (subTab)
  const columns = useMemo(() => {
    if (activeTab === "dual-method") {
      return [
        { key: "propertyNo", label: "Partition No." },
        { key: "oldPropertyNo", label: "Old Property No." },
        { key: "wingName", label: "Wing Name" },
        { key: "flatOrShopNo", label: "Flat No." },
        { key: "ownerName", label: "Owner Name" },
        { key: "occupierName", label: "Occupier Name" },
        { key: "rentMonthly", label: "Rent" },
        { key: "renterName", label: "Renter Name" },
        { key: "description", label: "Description" },
        { key: "type", label: "Type" },
        { key: "floor", label: "Floor" },
        { key: "assessmentYear", label: "Assessment Year" },
        { key: "constructionYear", label: "Survey Construction Year" },
        { key: "constructionType", label: "Construction Type" },
        { key: "bhk", label: "BHK" },
        { key: "toiletCount", label: "Toilet Count" },
        { key: "carpetASqFt", label: "Carpet Area (sqFt)" },
        { key: "carpetASqMtr", label: "Carpet Area (sqMtr)" },
        { key: "builtupASqFt", label: "Builtup Area (sqFt)" },
        { key: "builtupASqMtr", label: "Builtup Area (sqMtr)" },
        { key: "oldConstArea", label: "Old Construction Area" },
        { key: "oldRV", label: "Old RV" },
        { key: "oldTotalTax", label: "Old Tax" },
        { key: "rateableValue", label: "New RV" },
        { key: "newTaxTotalRV", label: "New Tax(RV)" },
        { key: "capitalValue", label: "Capital value" },
        { key: "newTaxTotalCV", label: "Total Tax(CV)" },
        { key: "mobileNo", label: "Mobile No" },
        { key: "emailId", label: "Email ID" },
        { key: "ocDate", label: "OC Date" },
      ];
    } else if (activeTab === "capital") {
      return [
        { key: "propertyNo", label: "Property No" },
        { key: "oldPropertyNo", label: "Old Property No." },
        { key: "wingName", label: "Wing Name" },
        { key: "flatOrShopNo", label: "Flat No." },
        { key: "ownerName", label: "Owner Name" },
        { key: "occupierName", label: "Occupier Name" },
        { key: "rentMonthly", label: "Rent" },
        { key: "renterName", label: "Renter Name" },
        { key: "description", label: "Description" },
        { key: "type", label: "Type" },
        { key: "floor", label: "Floor" },
        { key: "assessmentYear", label: "Asst Year" },
        { key: "constructionYear", label: "Con Year" },
        { key: "constructionType", label: "Con Type" },
        { key: "bhk", label: "BHK" },
        { key: "toiletCount", label: "Toilet Count" },
        { key: "carpetASqFt", label: "Carpet A (sqFt)" },
        { key: "carpetASqMtr", label: "Carpet A (sqMtr)" },
        { key: "builtupASqFt", label: "Buildup A (sqFt)" },
        { key: "builtupASqMtr", label: "Buildup A (sqMtr)" },
        { key: "oldConstArea", label: "Old Construction Area" },
        { key: "oldRV", label: "Old RV (CV)" },
        { key: "capitalValue", label: "New CV" },
        { key: "oldTotalTax", label: "Old Tax" },
        { key: "newTaxTotalCV", label: "New Tax" },
        { key: "mobileNo", label: "Mobile No" },
        { key: "emailId", label: "Email ID" },
        { key: "ocDate", label: "OC Date" },
      ];
    } else {
      // Default: rateable
      return [
        { key: "propertyNo", label: "Property No" },
        { key: "oldPropertyNo", label: "Old Property No." },
        { key: "wingName", label: "Wing Name" },
        { key: "flatOrShopNo", label: "Flat No." },
        { key: "ownerName", label: "Owner Name" },
        { key: "occupierName", label: "Occupier Name" },
        { key: "rentMonthly", label: "Rent" },
        { key: "renterName", label: "Renter Name" },
        { key: "description", label: "Description" },
        { key: "type", label: "Type" },
        { key: "floor", label: "Floor" },
        { key: "assessmentYear", label: "Asst Year" },
        { key: "constructionYear", label: "Con Year" },
        { key: "constructionType", label: "Con Type" },
        { key: "bhk", label: "BHK" },
        { key: "toiletCount", label: "Toilet Count" },
        { key: "carpetASqFt", label: "Carpet A (sqFt)" },
        { key: "carpetASqMtr", label: "Carpet A (sqMtr)" },
        { key: "builtupASqFt", label: "Buildup A (sqFt)" },
        { key: "builtupASqMtr", label: "Buildup A (sqMtr)" },
        { key: "oldConstArea", label: "Old Construction Area" },
        { key: "oldRV", label: "Old RV" },
        { key: "rateableValue", label: "New RV" },
        { key: "oldTotalTax", label: "Old Tax" },
        { key: "newTaxTotal", label: "New Tax" },
        { key: "mobileNo", label: "Mobile No" },
        { key: "emailId", label: "Email ID" },
        { key: "ocDate", label: "OC Date" },
      ];
    }
  }, [activeTab]);

  return (
    <div className="p-4">
      <CommonPropertyTable
        columns={columns}
        data={data}
        title="Residential Property List"
        activeTab={activeTab}
        searchQuery={searchQuery}
        onSearchChange={(q) => {
          setSearchQuery(q);
          updateQueryParams({ searchTerm: q, pageNumber: 1 });
        }}
        onRowClick={handleRowClick}
        loading={isPending}
        isAutoScrolling={isAutoScrolling}
        onToggleAutoScroll={toggleAutoScroll}
        pageNumber={pageNumber}
        pageSize={pageSize}
        totalCount={totalCount}
        totalPages={totalPages}
        onPageChange={handlePageChange}
        onPageSizeChange={handlePageSizeChange}
      />


      {/* Tax Details Table - Always visible */}
      <TaxDetailsTable />
    </div>
  );
};

export default Residential;
