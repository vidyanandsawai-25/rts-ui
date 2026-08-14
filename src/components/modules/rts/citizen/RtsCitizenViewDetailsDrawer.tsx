"use client";

import type { ReactNode } from "react";
import { FileText } from "lucide-react";

import { Drawer } from "@/components/common/Drawer";
import type { Language } from "@/types/language.type";
import type { RtsMisDashboardUserApplicationItem } from "@/types/rts/rtsmisdashboard.types";

type RtsCitizenViewDetailsDrawerProps = {
  application: RtsMisDashboardUserApplicationItem | null;
  language: Language;
  onClose: () => void;
  children: ReactNode;
};

export default function RtsCitizenViewDetailsDrawer({
  application,
  language,
  onClose,
  children,
}: RtsCitizenViewDetailsDrawerProps) {
  if (!application) return null;

  return (
    <Drawer
      open
      onClose={onClose}
      width="md"
      title={
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-blue-100 bg-blue-50 text-blue-600">
            <FileText size={16} />
          </div>
          <div className="space-y-0.5">
            <span className="rounded bg-slate-200/60 px-2 py-0.5 font-mono text-[9px] font-bold text-slate-400">
              {application.applicationNo}
            </span>
            <h2 className="text-sm font-black leading-snug text-slate-800">
              {language === "mr" && application.serviceNameLocal
                ? application.serviceNameLocal
                : application.serviceName}
            </h2>
          </div>
        </div>
      }
      footer={
        <button
          type="button"
          onClick={onClose}
          className="cursor-pointer rounded-xl border border-slate-200 bg-slate-200 px-4.5 py-2 text-xs font-black text-slate-800 transition-colors hover:bg-slate-300"
        >
          {language === "mr" ? "बंद करा" : language === "hi" ? "बंद करें" : "Close"}
        </button>
      }
    >
      {children}
    </Drawer>
  );
}
