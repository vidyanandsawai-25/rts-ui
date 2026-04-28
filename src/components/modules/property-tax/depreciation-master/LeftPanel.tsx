"use client";

import { AddButton, DeleteButton, Input } from "@/components/common";
import type { RangeRow } from "@/types/depreciation.types";

type LeftPanelProps = {
  minValue: string;
  maxValue: string;
  minError: string | null;
  maxError: string | null;
  ranges: RangeRow[];
  selectedRangeId: string | null;
  saving: boolean;
  onMinChange: (value: string) => void;
  onMaxChange: (value: string) => void;
  onAddRange: () => void;
  onSelectRange: (id: string) => void;
  onDeleteRange: () => void;
  t: (key: string) => string;
};

export function LeftPanel({
  minValue,
  maxValue,
  minError,
  maxError,
  ranges,
  selectedRangeId,
  saving,
  onMinChange,
  onMaxChange,
  onAddRange,
  onSelectRange,
  onDeleteRange,
  t,
}: LeftPanelProps) {
  return (
    <div className="col-span-12 lg:col-span-2">
      <div className="bg-white rounded-2xl border shadow-sm h-155 flex flex-col p-2 space-y-6">
        <div className="grid grid-cols-2 gap-1.5">
          <Input
            label={t("min")}
            required
            type="text"
            placeholder={t("minPlaceholder")}
            value={minValue}
            onChange={(e) => onMinChange(e.target.value)}
            error={minError || undefined}
            inputMode="numeric"
            className="text-xs"
          />
          <Input
            label={t("max")}
            required
            type="text"
            placeholder={t("maxPlaceholder")}
            value={maxValue}
            onChange={(e) => onMaxChange(e.target.value)}
            error={maxError || undefined}
            inputMode="numeric"
            className="text-xs"
          />
        </div>

        <AddButton 
          onClick={onAddRange} 
          disabled={saving} 
          className="w-full text-xs py-1.5"
          label={t("addRange")}
        />

        <div className="flex-1 overflow-y-auto space-y-1.5 border-t pt-3">
          {ranges.length === 0 ? (
            <div className="text-center text-gray-400 py-6 text-xs">
              {t("noRanges") || "No ranges available"}
            </div>
          ) : (
            ranges.map((r) => (
              <button
                key={r.id}
                onClick={() => onSelectRange(r.id)}
                className={`w-full p-2 text-center rounded-lg border transition-all text-xs ${
                  selectedRangeId === r.id
                    ? "bg-blue-600 text-white border-blue-600 shadow-md"
                    : "bg-gray-50 text-gray-700 border-gray-100 hover:bg-gray-100"
                }`}
              >
                <div className="font-semibold">{r.min} - {r.max}</div>
              </button>
            ))
          )}
        </div>

        <DeleteButton
          onClick={onDeleteRange}
          disabled={saving || !selectedRangeId}
          className="w-full text-xs py-1.5"
          aria-label={t("deleteRange")}
        />
      </div>
    </div>
  );
}
