"use client";


import type { RvCvCellProps } from "@/types/property-search.types";
import { formatNumberOnly } from "./result-styles";

export function RvCvCell({ rv }: RvCvCellProps) {
  return (
    <span className="font-medium text-gray-800 tabular-nums whitespace-nowrap">
      {formatNumberOnly(rv)}
    </span>
  );
}

