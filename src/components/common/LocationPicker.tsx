"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/common/Button";
import { Input } from "@/components/common/Input";

type GeocodeResult = { label: string; lat: number; lng: number };

export type PickedLocation = {
  lat: number;
  lng: number;
  label?: string;
};

type LocationPickerProps = {
  value?: PickedLocation | null;
  onChange?: (v: PickedLocation | null) => void;
  onPick?: (picked: PickedLocation) => void;
  onClear?: () => void;
  onError?: (message: string) => void;
  persistKey?: string;
  placeholder?: string;
  lang?: "en" | "hi" | "mr";
  autoOpen?: boolean;
};

const localizedText = {
  en: { pickLocation: "Pick Location", openMap: "Open Picker", clear: "Clear", close: "Close", searching: "Searching...", suggestions: "Suggestions" },
  hi: { pickLocation: "????? ?????", openMap: "???? ?????", clear: "???? ????", close: "??? ????", searching: "??? ??? ???...", suggestions: "?????" },
  mr: { pickLocation: "????? ?????", openMap: "???? ????", clear: "??? ???", close: "??? ???", searching: "???? ????...", suggestions: "?????" },
};

const getLocalSuggestions = (query: string): GeocodeResult[] => {
  const q = query.trim();
  if (!q) return [];
  return [
    { label: `${q} - Local result 1`, lat: 20.5, lng: 77.0 },
    { label: `${q} - Local result 2`, lat: 21.1, lng: 77.9 },
  ];
};

export default function LocationPicker({
  value,
  onChange,
  onPick,
  onClear,
  onError,
  persistKey = "rts_selected_location",
  placeholder = "Search location",
  lang = "en",
  autoOpen = false,
}: LocationPickerProps) {
  const strings = localizedText[lang] ?? localizedText.en;
  const [isOpen, setIsOpen] = useState(autoOpen);
  const [query, setQuery] = useState(value?.label || "");
  const [results, setResults] = useState<GeocodeResult[]>([]);
  const [picked, setPicked] = useState<PickedLocation | null>(value ?? null);

  useEffect(() => {
    if (value === undefined) return;
    setPicked(value);
    setQuery(value?.label || "");
  }, [value]);

  useEffect(() => {
    if (!isOpen) return;
    const t = window.setTimeout(() => {
      const next = getLocalSuggestions(query);
      setResults(next);
      if (!next.length && query.trim()) onError?.("Location search failed");
    }, 150);
    return () => window.clearTimeout(t);
  }, [isOpen, onError, query]);

  const save = (next: PickedLocation | null) => {
    setPicked(next);
    try {
      if (next) window.localStorage.setItem(persistKey, JSON.stringify(next));
      else window.localStorage.removeItem(persistKey);
    } catch {}
    onChange?.(next);
    if (next) onPick?.(next);
    else onClear?.();
  };

  const openPicker = () => setIsOpen(true);
  const closePicker = () => {
    setIsOpen(false);
    setResults([]);
  };

  if (!isOpen) {
    return (
      <div className="w-full space-y-3">
        <div className="rounded-xl border p-4 space-y-2">
          <Button type="button" onClick={openPicker}>{picked ? `${strings.pickLocation}: ${picked.label ?? `${picked.lat}, ${picked.lng}`}` : strings.openMap}</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full space-y-3 rounded-xl border p-4 bg-white">
      <div className="flex items-center justify-between gap-2">
        <div className="text-sm font-semibold text-slate-700">{strings.pickLocation}</div>
        <Button type="button" variant="outline" onClick={closePicker}>{strings.close}</Button>
      </div>
      <div className="space-y-2">
        <Input value={query} onChange={(e: any) => setQuery(e.target.value)} placeholder={placeholder} />
        <div className="text-xs text-muted-foreground">{query ? strings.searching : ""}</div>
        {results.length > 0 ? (
          <div className="rounded-xl border bg-white shadow">
            <div className="px-3 py-2 text-xs font-semibold text-slate-500 uppercase tracking-wider">{strings.suggestions}</div>
            <div className="max-h-60 overflow-y-auto">
              {results.map((r, idx) => (
                <button
                  key={`${r.lat}-${r.lng}-${idx}`}
                  type="button"
                  className="w-full border-t border-slate-100 px-3 py-2 text-left text-sm text-slate-700 hover:bg-slate-50"
                  onClick={() => {
                    const next = { lat: r.lat, lng: r.lng, label: r.label };
                    save(next);
                    setQuery(r.label);
                    setResults([]);
                  }}
                >
                  {r.label}
                </button>
              ))}
            </div>
          </div>
        ) : null}
        {picked ? (
          <div className="flex items-center justify-between rounded-lg bg-slate-50 px-3 py-2 text-sm text-slate-700">
            <span>{picked.label ?? `${picked.lat}, ${picked.lng}`}</span>
            <Button type="button" variant="outline" onClick={() => save(null)}>{strings.clear}</Button>
          </div>
        ) : null}
      </div>
    </div>
  );
}
