"use client";

import {
  MapPin, User, Route, Hash, MessageSquare, Home, Building2,
  ParkingCircle, Calendar, LayoutGrid, Map, FileText, Building,
  Camera, Settings,
} from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { BulkUpdateMaster } from "@/types/common-details-update/common-details-update.types";
import { SearchInput } from "@/components/common";
import { useLocale } from "next-intl";

const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  location_on: MapPin,
  person: User,
  road: Route,
  tag: Hash,
  comment: MessageSquare,
  home: Home,
  apartment: Building2,
  local_parking: ParkingCircle,
  calendar_today: Calendar,
  category: LayoutGrid,
  map: Map,
  description: FileText,
  business: Building,
  photo_camera: Camera,
};

interface CommonDetailsUpdateMenuProps {
  menuItems: BulkUpdateMaster[];
  selectedCode: string;
  menuSearch: string;
  setMenuSearch: (v: string) => void;
  onSelect: (code: string) => void;
  t: (key: string) => string;
}

export const CommonDetailsUpdateMenu = ({
  menuItems,
  selectedCode,
  menuSearch,
  setMenuSearch,
  onSelect,
  t,
}: CommonDetailsUpdateMenuProps) => {
  const locale = useLocale();

  return (
    <div className="h-full flex flex-col border border-blue-200 rounded-xl shadow-sm bg-white overflow-hidden">
      <div className="px-4 py-3 border-b bg-[#F8FAFF] rounded-t-xl shrink-0">
        <p className="text-sm font-semibold text-[#1E3A8A]">
          {t("menu.title")}
        </p>
      </div>

      <div className="px-3 py-2 border-b shrink-0">
        <div className="relative">
          <SearchInput
            placeholder={t("menu.searchPlaceholder")}
            value={menuSearch}
            onChange={setMenuSearch}
            className="h-9 w-full"
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        {menuItems.map((item) => {
          const Icon = ICON_MAP[item.iconName] ?? Settings;
          const isActive = item.updateCode === selectedCode;
          const displayLabel = locale === "mr" ? item.updateNameMarathi : item.updateName;

          return (
            <button
              key={item.updateCode}
              onClick={() => onSelect(item.updateCode)}
              type="button"
              className={cn(
                "w-full flex items-center gap-3 px-4 py-2.5 text-left transition-colors text-sm",
                isActive
                  ? "bg-[#1E3A8A] text-white"
                  : "text-gray-700 hover:bg-blue-50"
              )}
            >
              <div
                className={cn(
                  "w-7 h-7 rounded-full flex items-center justify-center shrink-0",
                  isActive ? "bg-white/20" : "bg-blue-50"
                )}
              >
                <Icon
                  className={cn(
                    "w-4 h-4",
                    isActive ? "text-white" : "text-blue-600"
                  )}
                />
              </div>
              <span className="leading-tight text-[13px] font-medium">
                {displayLabel}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
