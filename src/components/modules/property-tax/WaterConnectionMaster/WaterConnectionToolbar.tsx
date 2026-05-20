"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";

import { AddButton, Tabs } from "@/components/common";
import { SearchInput } from "@/components/common/SearchInput";
import { sanitizeInput } from "@/lib/utils/security";

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

  useEffect(() => {
    setSearch(currentSearchTerm);
  }, [currentSearchTerm]);

  const isFirstRender = useRef(true);

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    if (search === currentSearchTerm) return;

    const timer = setTimeout(() => {
      const params = new URLSearchParams(searchParams);
      params.set("page", "1");
      if (search.trim()) {
        params.set("q", search.trim());
      } else {
        params.delete("q");
      }
      router.push(`${pathname}?${params.toString()}`);
    }, 500);

    return () => clearTimeout(timer);
  }, [search, currentSearchTerm, pathname, router, searchParams]);

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
        onChange={(value) => setSearch(sanitizeInput(value))}
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
