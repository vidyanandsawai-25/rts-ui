"use client";

import { useMemo } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { Calendar } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { MasterTable, Column } from "@/components/common/MasterTable";
import { StatusBadge } from "@/components/common/StatusBadge";
import TableHeader from "@/components/common/TableHeader";
import { Tabs } from "@/components/common/Tabs";
import type { AssessmentYearPagedResponseRV, AssessmentYearRV } from "@/types/assessmentYearMaster.types";
import { deleteAssessmentYearAction } from "@/app/[locale]/property-tax/assessment-year-range/rateablevalue/action";
import { AddButton, DeleteButton, EditButton, useConfirm } from "@/components/common";

interface AssessmentYearMasterProps {
  paginatedData: AssessmentYearPagedResponseRV;
}

export default function AssessmentYearMaster({ paginatedData }: AssessmentYearMasterProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { confirm } = useConfirm();
  const locale = useLocale();
  const base = `/${locale}/property-tax/assessment-year-range/rateablevalue`;
  const t = useTranslations("AssessmentYearMasterRV");


  const data = useMemo(() => paginatedData.items || [], [paginatedData]);

  // URL Params
  const page = Number(searchParams.get("page")) || 1;
  const pageSize = Number(searchParams.get("size")) || 10;


  const handlePageChange = (newPage: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", newPage.toString());
    router.push(`${pathname}?${params.toString()}`);
  };

  const handlePageSizeChange = (newSize: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("size", newSize.toString());
    params.set("page", "1");
    router.push(`${pathname}?${params.toString()}`);
  };

  
  const handleDelete = (row: AssessmentYearRV) => {
  confirm({
    variant: "delete",
    title: t("deleteTitle"),
    description: t("deleteDescription", { range: `${row.fromYear} - ${row.toYear}` }),
    meta: {
      name: `${row.fromYear} - ${row.toYear}`,
    },
    onConfirm: async () => {
      if (typeof row.yearId !== "number") {
        toast.error(t("deleteError"));
        return;
      }

      const res = await deleteAssessmentYearAction(row.yearId);

      if (!res.success) {
        // Show linked-record message only when explicitly indicated by the server
        const errorMessage =
          (res as { code?: string }).code === "LINKED_RECORD"
            ? t("linkedError", { range: `${row.fromYear} - ${row.toYear}` })
            : res.error || t("deleteError");
        toast.error(errorMessage);
        return;
      }

      toast.success(
        t("deleteSuccess", {
          range: `${row.fromYear} - ${row.toYear}`,
        })
      );

      router.refresh();
    },
  });
}

  const columns: Column<AssessmentYearRV>[] = [
    {
      key: "fromYear",
      label: t("fromYear"),
      width: "30%",
    },
    {
      key: "toYear",
      label: t("toYear"),
      width: "30%",
    },
    {
      key: "isActive",
      label: t("activeStatus"),
      width: "20%",
      render: (value: unknown) => {
        const isActive = Boolean(value);
        return (
          <div className="flex justify-start">
            <StatusBadge value={isActive} />
          </div>
        );
      },
    }
  ];

  return (
    <div className="space-y-6 p-0">
      <TableHeader
        title={t("title")}
        subtitle={t("subtitle")}
        icon={Calendar}
        actionLabel=""
        rightContent={
          <Tabs
            value="rateable"
            variant="pills"
            onChange={(val) => {
              if (val === "capital") {
                router.push(`/${locale}/property-tax/assessment-year-range/capitalvalue`);
              }
            }}
          >
            <Tabs.TabList>
              <Tabs.Tab value="rateable">{t("rateableValue")}</Tabs.Tab>
              <Tabs.Tab value="capital">{t("capitalValue")}</Tabs.Tab>
            </Tabs.TabList>
          </Tabs>
        }
      />

      <div className="flex flex-col gap-3">
        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
          <MasterTable
            data={data}
            columns={columns}
            pageNumber={page}
            pageSize={pageSize}
            totalCount={paginatedData.totalCount || 0}
            totalPages={Math.ceil((paginatedData.totalCount || 0) / pageSize)}
            onPageChange={handlePageChange}
            loading={false}
            paginationConfig={{ enabled: true, showPageSizeSelector: true }}
            onPageSizeChange={handlePageSizeChange}
            emptyText={t("emptyText")}
            renderActions={(row) => {
              const pt = row as unknown as AssessmentYearRV;
              return (
                <div className="flex items-center justify-center gap-2">
                  <EditButton onClick={() => router.push(`${base}/edit/${pt.yearId}`)} />
                  <DeleteButton onClick={() => handleDelete(pt)} />
                </div>
              )
            }}
            headerExtra={
              <div className="flex flex-col md:flex-row justify-end items-center gap-3 w-full">
                <div className="flex justify-end">
                  </div>
                  <AddButton
                    label={t("addNewRange")}
                    onClick={() => router.push(`${base}/add`)}
                  />
                </div>
            }
            containerClassName="border-0 rounded-none shadow-none bg-transparent"
          />
        </div>
      </div>
    </div>
  );
}
