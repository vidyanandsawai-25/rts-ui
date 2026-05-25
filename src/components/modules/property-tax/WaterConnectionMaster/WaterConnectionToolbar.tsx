"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";

import { AddButton, Tabs } from "@/components/common";
import { SearchInput } from "@/components/common/SearchInput";


type TabKey = "tap-status" | "tap-type" | "tap-size";

export function WaterConnectionToolbar() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const locale = useLocale();
  const t = useTranslations("waterConnectionMaster");

  const base = `/${locale}/property-tax/water-connection-master`;

  const activeTab: TabKey = pathname.includes("/tap-type")
    ? "tap-type"
    : pathname.includes("/tap-size")
      ? "tap-size"
      : "tap-status";

  const currentSearchTerm = searchParams.get("q") ?? "";
  const [search, setSearch] = useState<string>(currentSearchTerm);


  // Keep refs updated after render so the timer callback always has latest values
  const pathnameRef = useRef(pathname);
  const searchParamsRef = useRef(searchParams);
  const currentSearchTermRef = useRef(currentSearchTerm);

  useEffect(() => {
    pathnameRef.current = pathname;
    searchParamsRef.current = searchParams;
    currentSearchTermRef.current = currentSearchTerm;
  }, [pathname, searchParams, currentSearchTerm]);

  // Sync the input when the URL q param changes externally
  // (tab switch, browser back/forward, direct URL change)
  useEffect(() => {
    setSearch(currentSearchTerm);
  }, [currentSearchTerm]);

  // Debounce: ONLY fires when the user actually types (search state changes)
  // Refs are used for everything else so those changes don't reset the timer
  useEffect(() => {
    if (search === currentSearchTermRef.current) return;

    const timer = setTimeout(() => {
      const params = new URLSearchParams(searchParamsRef.current.toString());
      params.set("page", "1");
      if (search.trim()) {
        params.set("q", search.trim());
      } else {
        params.delete("q");
      }
      router.push(`${pathnameRef.current}?${params.toString()}`);
    }, 400);

    return () => clearTimeout(timer);
  }, [search, router]);

  const addLabel =
    activeTab === "tap-type"
      ? t("tapType.addTitle")
      : activeTab === "tap-size"
        ? t("tapSize.addTitle")
        : t("tapStatus.addTitle");

  const searchPlaceholder =
    activeTab === "tap-type"
      ? t("tapType.searchPlaceholder")
      : activeTab === "tap-size"
        ? t("tapSize.searchPlaceholder")
        : t("tapStatus.searchPlaceholder");

  return (
    <div className="flex items-center gap-3">
      <Tabs
        className="flex items-center gap-2 mt-0 flex-row"
        value={activeTab}
        variant="pills"
        items={[
          { value: "tap-status", label: t("tabs.tapStatus"), content: null },
          { value: "tap-type", label: t("tabs.tapType"), content: null },
          { value: "tap-size", label: t("tabs.tapSize"), content: null },
        ]}
        onChange={(v) => router.push(`${base}/${v}`)}
      />

      <SearchInput
        value={search}
        onChange={(value) => {
          // Remove all special characters except alphanumerics and spaces
          const sanitized = value.replace(/[^a-zA-Z0-9 ]/g, "");
          setSearch(sanitized);
        }}
        placeholder={searchPlaceholder}
        className="mb-0 w-105 text-gray-900"
      />

      <AddButton
        label={addLabel}
        onClick={() => router.push(`${base}/${activeTab}/add`)}
      />
    </div>
  );
}
