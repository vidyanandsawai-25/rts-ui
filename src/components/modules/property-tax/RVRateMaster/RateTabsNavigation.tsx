"use client";

import { usePathname, useRouter } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import { Tabs } from "@/components/common";
import TableHeader from "@/components/common/TableHeader";
import { Calculator} from "lucide-react";

export function RateTabsNavigation() {
  const pathname = usePathname();
  const router = useRouter();
  const locale = useLocale();
  const t = useTranslations("ptis_RVRateMaster");

  // Determine active tab from pathname
  // Only show Rateable Value tab until Capital Value is implemented
  const tabConfig = [
    {
      value: "rvratemaster",
      label: t("header.rateableTab"),
      icon: Calculator,
      headerTitle: t("header.rateableTitle"),
      headerSubtitle: t("header.rateableDescription"),
    },
    // The Capital Value tab is intentionally hidden for now.
    // Uncomment and enable this tab when the /cvratemaster route and feature are implemented in a future PR.
    // {
    //   value: "cvratemaster",
    //   label: t("header.capitalTab"),
    //   icon: Landmark,
    //   headerTitle: t("header.capitalTitle"),
    //   headerSubtitle: t("header.capitalDescription"),
    // },
  ];

  const activeValue = tabConfig.find(tab => pathname.endsWith(tab.value))?.value || "rvratemaster";
  const activeTab = tabConfig.find(tab => tab.value === activeValue) || tabConfig[0];

  return (
    <div className="mb-2">
      <TableHeader
        title={activeTab.headerTitle}
        icon={activeTab.icon}
        subtitle={activeTab.headerSubtitle}
        rightContent={
          <Tabs
            value={activeValue}
            items={tabConfig.map(({ value, label, icon }) => ({ value, label, icon, content: null }))}
            variant="pills"
            onChange={(v: string | number) => {
              const tab = tabConfig.find(item => item.value === v);
              if (tab) router.push(`/${locale}/property-tax/rate-master/${tab.value}`);
            }}
          />
        }
      />
    </div>
  );
}
