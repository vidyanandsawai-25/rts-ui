"use client";

import type { RvCvCellProps } from "@/types/property-search.types";
import { formatInr } from "./result-styles";

export function RvCvCell({ rv, cv }: RvCvCellProps) {
  return (
    <div className="inline-flex flex-col gap-0.5">
      <div className="flex items-baseline gap-2">
        <span className="w-5 shrink-0 font-medium text-gray-500">RV</span>
        <span className="font-medium text-gray-800 tabular-nums whitespace-nowrap">
          {formatInr(rv)}
        </span>
      </div>
      <div className="flex items-baseline gap-2">
        <span className="w-5 shrink-0 font-medium text-gray-500">CV</span>
        <span className="text-gray-600 tabular-nums whitespace-nowrap">
          {cv != null ? formatInr(cv) : "-"}
        </span>
      </div>
    </div>
  );
}
