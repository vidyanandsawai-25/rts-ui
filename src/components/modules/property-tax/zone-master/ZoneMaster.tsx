"use client";

import { PageContainer } from "@/components/common/PageContainer";
import ZoneWardContent from "./ZoneContent";
import {
  ZonePaginationData,
  WardPaginationData,
  DashboardStats,
  SSRData,
  EditData,
  SelectionState,
} from "@/types/zoneMasterContent.types";

export interface ZoneMasterProps {
  zonePagination: ZonePaginationData;
  wardPagination: WardPaginationData;
  dashboardStats: DashboardStats;
  selection: SelectionState;
  editData?: EditData;
  ssrData?: SSRData;
}

export default function ZoneMaster({
  zonePagination,
  wardPagination,
  dashboardStats,
  selection,
  editData,
  ssrData,
}: ZoneMasterProps) {
  return (
    <PageContainer>
      <ZoneWardContent
        zonePagination={zonePagination}
        wardPagination={wardPagination}
        dashboardStats={dashboardStats}
        selection={selection}
        editData={editData}
        ssrData={ssrData}
      />
    </PageContainer>
  );
}
