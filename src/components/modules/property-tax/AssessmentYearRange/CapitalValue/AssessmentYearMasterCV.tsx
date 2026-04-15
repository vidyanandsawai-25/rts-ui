"use client";

import { useMemo } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { Calendar } from "lucide-react";
import { MasterTable } from "@/components/common/MasterTable";
import TableHeader from "@/components/common/TableHeader";
import { Tabs } from "@/components/common/Tabs";
import { useConfirm } from "@/components/common";

import type {
  AssessmentYearCV,
  AssessmentYearMasterCVProps,
} from "@/types/assessmentYearMaster.types";

import {
  AddButton,
  DeleteButton,
  EditButton,
} from "@/components/common";

import { deleteAssessmentYearActionCV } from "@/app/[locale]/property-tax/assessment-year-range/capitalvalue/action";

import { toast } from "sonner";
import { useLocale, useTranslations } from "next-intl";

/* ✅ Import Columns */
import { getAssessmentYearCVColumns } from "./AssessmentYearMasterCVColumns";

export default function AssessmentYearMasterCV({
  paginatedData,
}: AssessmentYearMasterCVProps) {

  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const locale = useLocale();
  const t = useTranslations("AssessmentYearMasterCV");

  const { confirm } = useConfirm();

  const base =
    `/${locale}/property-tax/assessment-year-range/capitalvalue`;

  /* ================= DATA ================= */

  const data = useMemo(
    () => paginatedData.items || [],
    [paginatedData]
  );

  /* ================= URL PARAMS ================= */

  const page =
    Number(searchParams.get("page")) || 1;

  const pageSize =
    Number(searchParams.get("size")) || 10;

  /* ================= PAGE CHANGE ================= */

  const handlePageChange = (
    newPage: number
  ) => {

    const params =
      new URLSearchParams(
        searchParams.toString()
      );

    params.set("page", newPage.toString());

    router.push(
      `${pathname}?${params.toString()}`
    );
  };

  /* ================= PAGE SIZE CHANGE ================= */

  const handlePageSizeChange = (
    newSize: number
  ) => {

    const params =
      new URLSearchParams(
        searchParams.toString()
      );

    params.set("size", newSize.toString());
    params.set("page", "1");

    router.push(
      `${pathname}?${params.toString()}`
    );
  };

  /* ================= DELETE ================= */

  const handleDelete = (
    row: AssessmentYearCV
  ) => {

    confirm({
      variant: "delete",

      title: t("deleteTitle"),

      description: t(
        "deleteDescription",
        {
          range:
            `${row.fromYear} - ${row.toYear}`,
        }
      ),

      meta: {
        name:
          `${row.fromYear} - ${row.toYear}`,
      },

      onConfirm: async () => {

        const yearIdentifier = row.yearId ?? row.yearRangeCVId;

        if (!Number.isInteger(yearIdentifier) || yearIdentifier <= 0) {

          toast.error(
            t("deleteError")
          );

          return;
        }

        const res =
          await deleteAssessmentYearActionCV(
            yearIdentifier
          );

        /* Handle failure */

        if (!res.success) {

          const range =
            `${row.fromYear} - ${row.toYear}`;

          const resObj =
            res as {
              code?: string;
              error?: string;
            };

          const isLinkedError =
            typeof resObj.code === "string" &&
            resObj.code.toUpperCase() === "LINKED_RECORD";

          const fallbackMessage =
            t("deleteError");

          const errorMessage =
            isLinkedError
              ? t("linkedError", { range })
              : (
                  typeof resObj.error === "string" &&
                  resObj.error.trim().length > 0
                )
              ? resObj.error
              : fallbackMessage;

          toast.error(errorMessage);

          return;
        }

        /* Success */

        toast.success(
          t("deleteSuccess", {
            range:
              `${row.fromYear} - ${row.toYear}`,
          })
        );

        router.refresh();
      },
    });
  };

  /* ================= COLUMNS ================= */

  const columns = useMemo(
    () => getAssessmentYearCVColumns(t),
    [t]
  );

  /* ================= UI ================= */

  return (

    <div className="space-y-6 p-0">

      <TableHeader
        title={t("title")}
        subtitle={t("subtitle")}
        icon={Calendar}

        rightContent={

          <Tabs
            value="capital"
            variant="pills"

            onChange={(val) => {

              if (val === "rateable") {

                router.push(
                  `/${locale}/property-tax/assessment-year-range/rateablevalue`
                );

              }

            }}
          >

            <Tabs.TabList>

              <Tabs.Tab value="rateable">
                {t("rateableValue")}
              </Tabs.Tab>

              <Tabs.Tab value="capital">
                {t("capitalValue")}
              </Tabs.Tab>

            </Tabs.TabList>

          </Tabs>

        }
      />

      <div className="flex flex-col gap-3">

        <div className="
          bg-white
          border border-slate-200
          rounded-xl
          overflow-hidden
          shadow-sm
        ">

          <MasterTable

            data={data}

            columns={columns}

            pageNumber={page}

            pageSize={pageSize}

            totalCount={
              paginatedData.totalCount || 0
            }

            totalPages={
              Math.ceil(
                (paginatedData.totalCount || 0) /
                pageSize
              )
            }

            onPageChange={handlePageChange}

            paginationConfig={{
              enabled: true,
              showPageSizeSelector: true,
            }}

            onPageSizeChange={
              handlePageSizeChange
            }

            emptyText={t("emptyText")}

            /* ================= ACTION BUTTONS ================= */

            renderActions={(row) => {

              const pt =
                row as AssessmentYearCV;

              const editId = pt.yearId ?? pt.yearRangeCVId;

              return (

                <div className="
                  flex
                  items-center
                  justify-center
                  gap-2
                ">

                  <EditButton
                    onClick={() =>
                      router.push(
                        `${base}/edit/${editId}`
                      )
                    }
                  />

                  <DeleteButton
                    onClick={() =>
                      handleDelete(pt)
                    }
                  />

                </div>

              );
            }}

            /* ================= HEADER ================= */

            headerTitle=" "

            headerExtra={

              <div className="
                flex
                justify-end
                items-center
                w-full
              ">

                <AddButton
                  label={t("addNewRange")}

                  onClick={() =>
                    router.push(
                      `${base}/add`
                    )
                  }
                />

              </div>

            }

            containerClassName="
              border-0
              rounded-none
              shadow-none
              bg-transparent
            "

          />

        </div>

      </div>

    </div>

  );
}