"use client";

import { useEffect, useRef, useState } from "react";
import { Building2, ChevronDown, Info } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { getSocietyWingDetailsAction } from "@/app/[locale]/property-tax/zone-master/actions";
import { SocietyWingDetailItem } from "@/types/zone-master/properties/society-wing-details.types";

interface WingsDropdownSectionProps {
  propertyId: string;
}

export function WingsDropdownSection({ propertyId }: WingsDropdownSectionProps) {
  const [wings, setWings] = useState<SocietyWingDetailItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!propertyId) {
      setWings([]);
      setSelectedId(null);
      setError(null);
      return;
    }

    let cancelled = false;
    setLoading(true);
    setSelectedId(null);
    setOpen(false);
    setError(null);

    getSocietyWingDetailsAction(Number(propertyId))
      .then((result) => {
        if (cancelled) return;
        if (result.success && result.data) {
          setWings(result.data);
        } else {
          setWings([]);
          if (result.error) setError(result.error);
        }
      })
      .catch((err: unknown) => {
        if (!cancelled) {
          setWings([]);
          setError(err instanceof Error ? err.message : "Failed to load wings");
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [propertyId]);

  const selected = wings.find((w) => w.societyDetailId === selectedId);

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <Building2 className="w-4 h-4 text-blue-600" />
        <h4 className="text-sm font-semibold text-gray-700">Wings</h4>
      </div>

      <div className="p-3 rounded-lg border border-blue-100">
        <div className="flex items-center gap-2 mb-3">
          <Info className="w-4 h-4 text-blue-600" />
          <span className="text-sm font-semibold text-gray-700">
            Wings associated with this property
          </span>
        </div>

        {loading ? (
          <div className="h-10 rounded-md bg-gray-100 animate-pulse" />
        ) : error ? (
          <p className="text-sm text-red-500">{error}</p>
        ) : wings.length === 0 ? (
          <p className="text-sm text-gray-500">No wings available for this property.</p>
        ) : (
          <div ref={containerRef} className="relative w-full">
            <button
              type="button"
              className={cn(
                "flex items-center justify-between w-full h-10 px-4",
                "border border-gray-300 rounded-md bg-white text-sm",
                "focus:outline-none focus:ring-2 focus:ring-blue-300 transition-all"
              )}
              onClick={() => setOpen((prev) => !prev)}
              onBlur={(e) => {
                if (!containerRef.current?.contains(e.relatedTarget as Node)) {
                  setOpen(false);
                }
              }}
            >
              <span
                className={cn(
                  "truncate text-left flex-1 text-sm",
                  !selected ? "text-gray-400" : "text-gray-800"
                )}
              >
                {selected
                  ? `${selected.wingNo} - ${selected.wingName}`
                  : "Select a wing"}
              </span>
              <ChevronDown className="ml-2 w-4 h-4 text-gray-400 shrink-0" />
            </button>

            {open && (
              <ul
                className="absolute z-50 w-full bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto top-full mt-1"
                onMouseDown={(e) => e.preventDefault()}
              >
                {wings.map((wing) => (
                  <li
                    key={wing.societyDetailId}
                    className={cn(
                      "flex items-center justify-between px-4 py-2 cursor-pointer transition-colors hover:bg-blue-50",
                      selectedId === wing.societyDetailId &&
                        "bg-blue-50 text-blue-700 font-semibold"
                    )}
                    onClick={() => {
                      setSelectedId(wing.societyDetailId);
                      setOpen(false);
                    }}
                  >
                    <span className="text-sm text-gray-800 font-medium">
                      {wing.wingNo} - {wing.wingName}
                    </span>
                    <span className="ml-4 shrink-0 text-xs font-semibold text-green-700 bg-green-50 border border-green-100 px-2.5 py-0.5 rounded-full">
                      {wing.propertyCount}{" "}
                      {wing.propertyCount === 1 ? "Property" : "Properties"}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
