"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import DepartmentCarouselClient from "@/components/modules/rts/citizen/DepartmentCarsoulClient";
import type { DepartmentDTO } from "@/types/rts-citizen.types";
import {
  getCitizenDashboardApplicationsAction,
  type CitizenDashboardApplicationsResponse,
} from './actions';

type DashboardClientProps = {
  departments: DepartmentDTO[];
  requestedPageNumber?: number;
  cuid?: string;
  routeInput: {
    details?: string;
    payment?: string;
    receipt?: string;
  };
};

export default function DashboardClient({
  departments,
  requestedPageNumber,
  cuid,
  routeInput,
}: DashboardClientProps) {
  const searchParams = useSearchParams();
  const [requestVersion, setRequestVersion] = useState(0);
  const [applications, setApplications] = useState<CitizenDashboardApplicationsResponse | null>(null);
  const [isApplicationsLoading, setIsApplicationsLoading] = useState(true);

  useEffect(() => {
    let isCurrent = true;
    setIsApplicationsLoading(true);

    void getCitizenDashboardApplicationsAction(requestedPageNumber, cuid, routeInput)
      .then((result) => {
        if (!isCurrent) return;
        setApplications(result);
        setIsApplicationsLoading(false);
      })
      .catch(() => {
        if (!isCurrent) return;
        setApplications(null);
        setIsApplicationsLoading(false);
      });

    return () => {
      isCurrent = false;
    };
  }, [cuid, requestedPageNumber, requestVersion, routeInput]);

  const retryApplications = () => {
    setRequestVersion((version) => version + 1);
  };
  const redirectError = searchParams.get("serviceRedirectError");
  const redirectErrorMessage =
    redirectError === "missing-upic"
      ? "An active property UPIC is required to continue with the selected service."
      : redirectError === "tracking-failed"
        ? "We could not start the selected service. Please try again."
      : redirectError
        ? "The selected service is unavailable. Please try again later."
        : null;

  return (
    <main className="bg-white">
      <div className="w-full px-2 py-2 sm:px-2 sm:py-2">
        {redirectErrorMessage && (
          <div role="alert" className="mb-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm font-semibold text-red-700">
            {redirectErrorMessage}
          </div>
        )}
        <DepartmentCarouselClient
          departments={departments}
          userApplications={applications?.userApplications ?? []}
          upicId={applications?.upicId}
          pagination={applications?.pagination ?? {
            pageNumber: Number.isInteger(requestedPageNumber) && requestedPageNumber! > 0 ? requestedPageNumber! : 1,
            pageSize: 50,
            hasPreviousPage: false,
            hasNextPage: false,
          }}
          routeState={applications?.routeState ?? {
            detailApplication: null,
            detail: null,
            paymentStatus: null,
            paymentApplication: null,
            receipt: null,
          }}
          applicationsLoadState={isApplicationsLoading ? 'loading' : applications?.error ? 'error' : 'ready'}
          applicationsLoadError={applications?.error}
          onRetryApplications={retryApplications}
        />
      </div>
    </main>
  );
}
