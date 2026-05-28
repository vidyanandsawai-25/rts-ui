"use client";

import React from "react";
import Link from "next/link";
import { Copy, ExternalLink } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/common";
import type { UpicLinkCellProps } from "@/types/property-search.types";
import { formatDisplayText } from "./result-styles";

/**
 * UPIC ID cell — clicking the link navigates to the PTIS screen using the
 * backend propertyId (avoids ward/propertyNo validation issues in PTIS).
 */
export function UpicLinkCell({
  upicId,
  propertyId,
  locale,
  copyLabel,
}: UpicLinkCellProps) {
  const displayText = formatDisplayText(upicId);
  const canOpenPtis = propertyId > 0;
  const href = `/${locale}/property-tax/ptis?propertyId=${propertyId}`;

  const handleCopy = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!upicId.trim()) return;
    try {
      await navigator.clipboard.writeText(upicId);
      toast.success(`${copyLabel} copied`);
    } catch {
      toast.error("Copy failed");
    }
  };

  return (
    <div className="group flex flex-wrap items-start gap-1.5">
      {canOpenPtis ? (
        <Link
          href={href}
          prefetch={false}
          className="text-blue-600 font-medium hover:underline inline-flex items-center gap-1 break-words whitespace-normal"
          title="Open in PTIS"
        >
          {displayText}
          <ExternalLink className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
        </Link>
      ) : (
        <span className="font-medium text-gray-800 break-words whitespace-normal">
          {displayText}
        </span>
      )}
      {upicId.trim() && (
        <Button
          type="button"
          variant="ghost"
          size="xs"
          icon={Copy}
          onClick={handleCopy}
          className="!p-0 opacity-0 group-hover:opacity-100 transition-opacity"
          aria-label={`Copy ${copyLabel}`}
          title={`Copy ${copyLabel}`}
        />
      )}
    </div>
  );
}
