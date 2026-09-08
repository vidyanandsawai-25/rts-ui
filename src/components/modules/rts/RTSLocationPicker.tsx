"use client";

import { importLibrary, setOptions } from "@googlemaps/js-api-loader";
import { Crosshair, Loader2, MapPin, Search, Trash2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { useCallback, useEffect, useRef, useState } from "react";
import { Button } from "@/components/common/Button";
import { Input } from "@/components/common/Input";
import { Modal } from "@/components/common/Modal";
import {
  parseMapLocationValue,
  serializeMapLocationValue,
  type MapLocationValue,
} from "@/lib/utils/rts/map-location-value";

type LocationPickerProps = {
  value?: unknown;
  onChange?: (value: string) => void;
  onClear?: () => void;
  onError?: (message: string) => void;
  persistKey?: string;
  placeholder?: string;
  lang?: "en" | "hi" | "mr";
  autoOpen?: boolean;
};

const AKOLA_CENTER = { lat: 20.7002, lng: 77.0082 };
let mapsLoadPromise: Promise<void> | null = null;

function loadGoogleMaps(apiKey: string) {
  if (!mapsLoadPromise) {
    setOptions({
      key: apiKey,
      v: "weekly",
      region: "IN",
      authReferrerPolicy: "origin",
    });
    mapsLoadPromise = Promise.all([
      importLibrary("maps"),
      importLibrary("marker"),
      importLibrary("geocoding"),
    ]).then(() => undefined);
  }

  return mapsLoadPromise;
}

export default function LocationPicker({
  value,
  onChange,
  onClear,
  onError,
  persistKey = "rts_selected_location",
  placeholder,
  lang = "en",
  autoOpen = false,
}: LocationPickerProps) {
  const t = useTranslations("rts.serviceForm.map");
  const mapElementRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<google.maps.Map | null>(null);
  const markerRef = useRef<google.maps.Marker | null>(null);
  const geocoderRef = useRef<google.maps.Geocoder | null>(null);
  const savedLocation = parseMapLocationValue(value);
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY?.trim() ?? "";
  const [isOpen, setIsOpen] = useState(autoOpen);
  const [query, setQuery] = useState(savedLocation?.address ?? "");
  const [candidate, setCandidate] = useState<MapLocationValue | null>(savedLocation);
  const [isLoadingMap, setIsLoadingMap] = useState(autoOpen && Boolean(apiKey));
  const [isMapReady, setIsMapReady] = useState(false);
  const [isResolving, setIsResolving] = useState(false);
  const [error, setError] = useState(() =>
    autoOpen && !apiKey ? t("errors.configuration") : ""
  );

  const reportError = useCallback((message: string) => {
    setError(message);
    onError?.(message);
  }, [onError]);

  const positionMarker = useCallback((latitude: number, longitude: number) => {
    const position = { lat: latitude, lng: longitude };
    markerRef.current?.setPosition(position);
    markerRef.current?.setMap(mapRef.current);
    mapRef.current?.panTo(position);
    mapRef.current?.setZoom(17);
  }, []);

  const resolveCoordinates = useCallback(async (latitude: number, longitude: number) => {
    if (!geocoderRef.current) {
      setIsResolving(false);
      reportError(t("errors.load"));
      return;
    }

    setIsResolving(true);
    setError("");
    setCandidate(null);
    positionMarker(latitude, longitude);

    try {
      const response = await geocoderRef.current.geocode({
        location: { lat: latitude, lng: longitude },
        language: lang,
        region: "IN",
      });
      const address = response.results[0]?.formatted_address?.trim();
      if (!address) throw new Error("No address returned");

      setCandidate({ latitude, longitude, address });
      setQuery(address);
    } catch {
      reportError(t("errors.geocode"));
    } finally {
      setIsResolving(false);
    }
  }, [lang, positionMarker, reportError, t]);

  useEffect(() => {
    if (!isOpen) return;

    const existing = parseMapLocationValue(value);
    if (!apiKey) return;

    let disposed = false;
    let mapClickListener: google.maps.MapsEventListener | null = null;
    let markerDragListener: google.maps.MapsEventListener | null = null;

    void loadGoogleMaps(apiKey)
      .then(() => {
        if (disposed || !mapElementRef.current) return;

        const center = existing
          ? { lat: existing.latitude, lng: existing.longitude }
          : AKOLA_CENTER;
        const map = new google.maps.Map(mapElementRef.current, {
          center,
          zoom: existing ? 17 : 13,
          clickableIcons: false,
          fullscreenControl: true,
          mapTypeControl: true,
          streetViewControl: false,
        });
        const marker = new google.maps.Marker({
          map: existing ? map : null,
          position: center,
          draggable: true,
          title: t("markerTitle"),
        });

        mapRef.current = map;
        markerRef.current = marker;
        geocoderRef.current = new google.maps.Geocoder();
        setIsMapReady(true);

        mapClickListener = map.addListener("click", (event: google.maps.MapMouseEvent) => {
          const latitude = event.latLng?.lat();
          const longitude = event.latLng?.lng();
          if (latitude === undefined || longitude === undefined) return;
          void resolveCoordinates(latitude, longitude);
        });
        markerDragListener = marker.addListener("dragend", (event: google.maps.MapMouseEvent) => {
          const latitude = event.latLng?.lat();
          const longitude = event.latLng?.lng();
          if (latitude === undefined || longitude === undefined) return;
          void resolveCoordinates(latitude, longitude);
        });
      })
      .catch(() => reportError(t("errors.load")))
      .finally(() => {
        if (!disposed) setIsLoadingMap(false);
      });

    return () => {
      disposed = true;
      mapClickListener?.remove();
      markerDragListener?.remove();
      if (markerRef.current) google.maps.event.clearInstanceListeners(markerRef.current);
      if (mapRef.current) google.maps.event.clearInstanceListeners(mapRef.current);
      markerRef.current?.setMap(null);
      markerRef.current = null;
      mapRef.current = null;
      geocoderRef.current = null;
    };
  }, [apiKey, isOpen, reportError, resolveCoordinates, t, value]);

  const handleSearch = async () => {
    const address = query.trim();
    if (!address || !geocoderRef.current) return;

    setIsResolving(true);
    setError("");
    setCandidate(null);

    try {
      const response = await geocoderRef.current.geocode({
        address,
        componentRestrictions: { country: "IN" },
        language: lang,
        region: "IN",
      });
      const result = response.results[0];
      if (!result) throw new Error("No location returned");

      const latitude = result.geometry.location.lat();
      const longitude = result.geometry.location.lng();
      const resolvedAddress = result.formatted_address?.trim();
      if (!resolvedAddress) throw new Error("No address returned");

      positionMarker(latitude, longitude);
      setCandidate({ latitude, longitude, address: resolvedAddress });
      setQuery(resolvedAddress);
    } catch {
      reportError(t("errors.search"));
    } finally {
      setIsResolving(false);
    }
  };

  const handleCurrentLocation = () => {
    if (!navigator.geolocation) {
      reportError(t("errors.geolocationUnavailable"));
      return;
    }

    setIsResolving(true);
    setError("");
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => void resolveCoordinates(coords.latitude, coords.longitude),
      () => {
        setIsResolving(false);
        reportError(t("errors.geolocationDenied"));
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 30000 }
    );
  };

  const handleConfirm = () => {
    if (!candidate) return;
    const serialized = serializeMapLocationValue(candidate);
    onChange?.(serialized);
    try {
      window.localStorage.setItem(persistKey, serialized);
    } catch {
      // Form state remains the source of truth when storage is unavailable.
    }
    setIsOpen(false);
  };

  const handleOpen = () => {
    const existing = parseMapLocationValue(value);
    setCandidate(existing);
    setQuery(existing?.address ?? "");
    setError(apiKey ? "" : t("errors.configuration"));
    setIsLoadingMap(Boolean(apiKey));
    setIsMapReady(false);
    setIsOpen(true);
  };

  const handleClear = () => {
    onChange?.("");
    onClear?.();
    try {
      window.localStorage.removeItem(persistKey);
    } catch {
      // Clearing form state is sufficient when storage is unavailable.
    }
  };

  return (
    <>
      <div className={`flex min-h-[78px] items-center gap-3 rounded-lg border px-3 py-2 transition-colors ${savedLocation ? "border-teal-300 bg-teal-50/40" : "border-slate-300 bg-slate-50/60 hover:border-blue-400"}`}>
        <div className="flex size-10 shrink-0 items-center justify-center rounded-lg border border-blue-100 bg-blue-50 text-blue-600">
          <MapPin className="size-5" aria-hidden="true" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold text-slate-800">
            {savedLocation?.address ?? t("notSelected")}
          </p>
          <p className="mt-0.5 text-xs text-slate-500">
            {savedLocation
              ? t("coordinates", {
                  latitude: savedLocation.latitude.toFixed(6),
                  longitude: savedLocation.longitude.toFixed(6),
                })
              : t("helper")}
          </p>
        </div>
        {savedLocation ? (
          <Button type="button" variant="ghost" size="icon" onClick={handleClear} aria-label={t("clear")}>
            <Trash2 className="size-4" />
          </Button>
        ) : null}
        <Button type="button" onClick={handleOpen}>
          <MapPin className="size-4" />
          {savedLocation ? t("change") : t("open")}
        </Button>
      </div>

      <Modal
        open={isOpen}
        onClose={() => setIsOpen(false)}
        title={t("title")}
        subtitle={t("subtitle")}
        maxWidth="xl"
        bodyClassName="flex min-h-[520px] flex-col gap-4 overflow-hidden p-4"
        footer={
          <>
            <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>
              {t("cancel")}
            </Button>
            <Button type="button" onClick={handleConfirm} disabled={!candidate || isResolving || isLoadingMap || Boolean(error)}>
              {t("confirm")}
            </Button>
          </>
        }
      >
        <form
          className="flex shrink-0 flex-col gap-2 sm:flex-row sm:flex-wrap"
          onSubmit={(event) => {
            event.preventDefault();
            void handleSearch();
          }}
        >
          <div className="w-full sm:w-[397px] sm:max-w-full">
            <Input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder={placeholder || t("searchPlaceholder")}
              aria-label={t("searchPlaceholder")}
              fullWidth
            />
          </div>
          <Button type="submit" variant="outline" disabled={!isMapReady || isLoadingMap || isResolving || !query.trim()}>
            {isResolving ? <Loader2 className="size-4 animate-spin" /> : <Search className="size-4" />}
            {t("search")}
          </Button>
          <Button type="button" variant="outline" onClick={handleCurrentLocation} disabled={!isMapReady || isLoadingMap || isResolving}>
            <Crosshair className="size-4" />
            {t("currentLocation")}
          </Button>
        </form>

        {error ? (
          <div role="alert" className="shrink-0 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
            {error}
          </div>
        ) : null}

        <div className="relative min-h-[330px] flex-1 overflow-hidden rounded-xl border border-slate-200 bg-slate-100">
          <div ref={mapElementRef} className="absolute inset-0" aria-label={t("mapLabel")} />
          {isLoadingMap ? (
            <div className="absolute inset-0 z-10 flex items-center justify-center gap-2 bg-white/90 text-sm font-medium text-slate-600">
              <Loader2 className="size-5 animate-spin text-blue-600" />
              {t("loading")}
            </div>
          ) : null}
        </div>

        <div className="grid shrink-0 gap-2 rounded-lg border border-slate-200 bg-white p-3 sm:grid-cols-[1fr_auto] sm:items-center">
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-slate-800">
              {candidate?.address ?? t("clickInstruction")}
            </p>
            {candidate ? (
              <p className="mt-1 text-xs text-slate-500">
                {t("coordinates", {
                  latitude: candidate.latitude.toFixed(6),
                  longitude: candidate.longitude.toFixed(6),
                })}
              </p>
            ) : null}
          </div>
          {isResolving ? <Loader2 className="size-5 animate-spin text-blue-600" /> : null}
        </div>
      </Modal>
    </>
  );
}
