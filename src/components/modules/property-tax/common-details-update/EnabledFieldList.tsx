/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { PanelLeftOpen, PanelLeftClose, ChevronRight, MapPin, User, Building2, Calendar, Hash, Edit3, Phone, Mail } from "lucide-react";
import { cn } from "@/lib/utils/cn";

export const getMenuIcon = (name: string, code: string) => {
  const n = (name || "").toLowerCase();
  const c = (code || "").toLowerCase();

  if (n.includes('address') || c.includes('address')) return <MapPin className="w-5 h-5" />;
  if (n.includes('owner') || c.includes('owner') || n.includes('user')) return <User className="w-5 h-5" />;
  if (n.includes('society') || c.includes('society') || n.includes('building')) return <Building2 className="w-5 h-5" />;
  if (n.includes('year') || c.includes('year') || n.includes('date')) return <Calendar className="w-5 h-5" />;
  if (n.includes('pin') || c.includes('pin') || n.includes('zip')) return <Hash className="w-5 h-5" />;
  if (n.includes('phone') || n.includes('mobile')) return <Phone className="w-5 h-5" />;
  if (n.includes('email') || n.includes('mail')) return <Mail className="w-5 h-5" />;

  return <Edit3 className="w-5 h-5" />;
};

interface EnabledFieldListProps {
  t: (key: string) => string;
  isFieldListCollapsed: boolean;
  setIsFieldListCollapsed: (collapsed: boolean) => void;
  filteredMenuItems: any[];
  selectedCode: string | null;
  handleMenuSelect: (code: string) => void;
  locale: string;
}

export const EnabledFieldList = ({
  t,
  isFieldListCollapsed,
  setIsFieldListCollapsed,
  filteredMenuItems,
  selectedCode,
  handleMenuSelect,
  locale
}: EnabledFieldListProps) => {
  return (
    <div
      className={cn(
        "flex flex-col min-h-0 border border-blue-200 rounded-xl bg-white overflow-hidden transition-all duration-300",
        isFieldListCollapsed ? "w-16 items-center bg-[#F8FAFF]" : "w-full lg:w-4/12"
      )}
    >
      {isFieldListCollapsed ? (
        <div className="flex flex-col items-center py-3 w-full h-full">
          <button
            onClick={() => setIsFieldListCollapsed(false)}
            className="p-1.5 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors shrink-0 mb-4"
            title="Expand"
          >
            <PanelLeftOpen className="w-5 h-5" />
          </button>
          <div className="flex-1 w-full overflow-y-auto pr-1 flex flex-col items-center gap-3">
            {filteredMenuItems.map((item) => {
              const isSelected = item.updateCode === selectedCode;
              const displayLabel = locale === "mr" ? item.updateNameMarathi : item.updateName;

              return (
                <button
                  key={item.updateCode}
                  type="button"
                  onClick={() => {
                    handleMenuSelect(item.updateCode);
                    setIsFieldListCollapsed(false);
                  }}
                  className={cn(
                    "flex items-center justify-center w-9 h-9 rounded-full transition-all",
                    isSelected
                      ? "bg-blue-100 text-blue-700 ring-2 ring-blue-200 shadow-sm"
                      : "text-gray-500 hover:bg-blue-50 hover:text-blue-600"
                  )}
                  title={displayLabel}
                >
                  {getMenuIcon(item.updateName, item.updateCode)}
                </button>
              );
            })}
          </div>
        </div>
      ) : (
        <>
          <div className="flex items-center justify-between px-4 py-3 border-b bg-[#F8FAFF] shrink-0">
            <div>
              <h3 className="text-sm font-semibold text-[#1E3A8A]">
                {t("fieldList.title")}
              </h3>
              <p className="text-xs text-gray-500 mt-0.5">
                {t("fieldList.subtitle")}
              </p>
            </div>
            <button
              onClick={() => setIsFieldListCollapsed(true)}
              className="p-1.5 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors shrink-0 ml-2"
              title="Collapse"
            >
              <PanelLeftClose className="w-5 h-5" />
            </button>
          </div>

          <div className="p-4 flex-1 overflow-hidden flex flex-col">
            <div className="flex items-center justify-between mb-3 shrink-0">
              <p className="text-sm font-medium text-gray-700">
                {t("fieldList.enabledFieldList")}
              </p>
              <span className="text-sm text-gray-500">
                {filteredMenuItems.length} {t("fieldList.available")}
              </span>
            </div>

            <div className="space-y-2 flex-1 overflow-y-auto pr-1">
              {filteredMenuItems.map((item) => {
                const isSelected = item.updateCode === selectedCode;
                const displayLabel = locale === "mr" ? item.updateNameMarathi : item.updateName;

                return (
                  <button
                    key={item.updateCode}
                    type="button"
                    onClick={() => handleMenuSelect(item.updateCode)}
                    className={cn(
                      "group w-full flex items-center justify-between px-4 py-3 rounded-xl border transition-all text-left",
                      isSelected
                        ? "bg-blue-50/80 border-blue-300 ring-1 ring-blue-200 shadow-sm"
                        : "bg-white border-gray-200 hover:border-blue-200 hover:bg-blue-50/30 hover:shadow-sm"
                    )}
                  >
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <div className={cn(
                        "flex items-center justify-center w-9 h-9 rounded-full shrink-0 transition-colors",
                        isSelected ? "bg-blue-100 text-blue-700" : "bg-gray-100 text-gray-500 group-hover:bg-blue-50 group-hover:text-blue-600"
                      )}>
                        {getMenuIcon(item.updateName, item.updateCode)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className={cn(
                          "text-sm font-medium",
                          isSelected ? "text-[#1E3A8A]" : "text-gray-700"
                        )}>
                          {displayLabel}
                        </p>
                        {item.description && (
                          <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">
                            {item.description}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 ml-2 shrink-0">
                      <ChevronRight className={cn(
                        "w-5 h-5 transition-colors",
                        isSelected ? "text-[#1E3A8A]" : "text-gray-300"
                      )} />
                    </div>
                  </button>
                );
              })}

              {filteredMenuItems.length === 0 && (
                <div className="flex flex-col items-center justify-center py-10 text-center">
                  <p className="text-sm text-gray-500">
                    {t("form.noFields")}
                  </p>
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
};
