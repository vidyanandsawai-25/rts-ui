"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import { Layers } from "lucide-react";
import { useEffect, useRef, useState } from "react";

import { PageContainer } from "@/components/common/PageContainer";
import TableHeader from "@/components/common/TableHeader";
import { AddButton, Tabs } from "@/components/common";
import { SearchInput } from "@/components/common/SearchInput";
import { sanitizeInput } from "@/lib/utils/security";

type TabKey = "floor" | "subfloor";

export default function FloorMasterLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const locale = useLocale();

  const tFloor = useTranslations("floor.floor");
  const tSubFloor = useTranslations("floor.subfloor");

  const base = `/${locale}/property-tax/floormaster`;

  const activeTab: TabKey =
    pathname.includes("/subfloor") ? "subfloor" : "floor";

  const t = activeTab === "floor" ? tFloor : tSubFloor;

  // Search functionality
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
      params.set("page", "1"); // Reset to first page on search
      
      if (search.trim()) {
        params.set("q", search.trim());
      } else {
        params.delete("q");
      }

      router.push(`${pathname}?${params.toString()}`);
    }, 500);

    return () => clearTimeout(timer);
  }, [search, currentSearchTerm, pathname, router, searchParams]);

  return (
    <PageContainer>
      <div className="">
        <TableHeader
          title={t("title")}
          subtitle={t("subtitle")}
          icon={Layers}
          rightContent={
            <div className="flex items-center gap-3">
              <div className="flex w-full justify-end">
                <SearchInput
                  value={search}
                  onChange={(value) => {
                    // Sanitize search input to prevent special characters
                    const sanitized = sanitizeInput(value);
                    setSearch(sanitized);
                  }}
                  placeholder={t("form.searchPlaceholder")}
                  className="mb-0 w-80 text-gray-900"
                />
              </div>
              
              <Tabs
                className="flex items-center gap-3 mt-6 "
                value={activeTab}
                variant="pills"
                items={[
                  { value: "floor", label: tFloor("tabs.floor"), content: null },
                  { value: "subfloor", label: tFloor("tabs.subfloor"), content: null }
                ]}
                onChange={(v) => router.push(`${base}/${v}`)}
              />

              <AddButton
                className="w-full"
                label={t("form.addTitle")}
                onClick={() =>
                  router.push(`${base}/${activeTab}/add`)
                }
              />
            </div>
          }
        />

        <div className="p-6">
          {children}
        </div>
      </div>
    </PageContainer>
  );
}
