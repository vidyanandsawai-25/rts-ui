"use client";

import React from "react";
import { useTranslations } from "next-intl";
import TableHeader from "@/components/common/TableHeader";
import { TaxZoneMasterToolbar } from "./TaxZoneMasterToolbar";
import { useTaxZoneMasterError } from "./TaxZoneMasterErrorContext";

interface TaxZoneMasterLayoutContentProps {
  children: React.ReactNode;
}

export function TaxZoneMasterLayoutContent({
  children,
}: TaxZoneMasterLayoutContentProps) {
  const t = useTranslations("taxZone");
  const { hasError } = useTaxZoneMasterError();

  return (
    <div className="space-y-6">
      {!hasError && (
        <TableHeader
          title={t("list.title")}
          subtitle="Manage tax zones and their ward-wise configuration"
          icon="mapPin"
          rightContent={<TaxZoneMasterToolbar />}
        />
      )}

      <div className={hasError ? "" : "mt-0"}>
        {children}
      </div>
    </div>
  );
}
