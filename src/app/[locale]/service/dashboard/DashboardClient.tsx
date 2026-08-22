"use client";

import { useSearchParams } from "next/navigation";
import DepartmentCarouselClient from "@/components/modules/rts/citizen/DepartmentCarsoulClient";
import type { RtsMisDashboardUserApplicationItem } from "@/types/rts/rtsmisdashboard.types";
import type { DepartmentDTO } from "@/types/rts-citizen.types";
import type { CitizenDashboardRouteState } from './actions';

type DashboardClientProps = {
  departments: DepartmentDTO[];
  userApplications: RtsMisDashboardUserApplicationItem[];
  upicId?: string;
  routeState: CitizenDashboardRouteState;
};

export default function DashboardClient({ departments, userApplications, upicId, routeState }: DashboardClientProps) {
  const searchParams = useSearchParams();
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
          userApplications={userApplications}
          upicId={upicId}
          routeState={routeState}
        />
      </div>
    </main>
  );
}
