"use client";

import DepartmentCarouselClient from "@/components/modules/rts/citizen/DepartmentCarsoulClient";
import type { CmsMisDashboardUserApplicationItem } from "@/types/rts/rtsmisdashboard.types";
import type { DepartmentDTO } from "@/types/rts-citizen.types";

type DashboardClientProps = {
  departments: DepartmentDTO[];
  userApplications: CmsMisDashboardUserApplicationItem[];
};

export default function DashboardClient({ departments, userApplications }: DashboardClientProps) {
  return (
    <main className="bg-white">
      <div className="w-full px-2 py-2 sm:px-2 sm:py-2">
        <DepartmentCarouselClient departments={departments} userApplications={userApplications} />
      </div>
    </main>
  );
}
