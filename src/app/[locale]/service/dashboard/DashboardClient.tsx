"use client";

import DepartmentCarouselClient from "@/components/modules/DepartmentCarsoulClient";
import type { DepartmentDTO } from "@/types/rts-citizen.types";

type DashboardClientProps = {
  departments: DepartmentDTO[];
};

export default function DashboardClient({ departments }: DashboardClientProps) {
  return (
    <main className="bg-white">
      <div className="w-full px-2 py-2 sm:px-2 sm:py-2">
        <DepartmentCarouselClient departments={departments} />
      </div>
    </main>
  );
}
