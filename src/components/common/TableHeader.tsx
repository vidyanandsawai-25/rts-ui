"use client";

import React from "react";
import { LucideIcon, Layers, FileText, Users, Settings, Home, Database } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { AddButton } from "./ActionButtons";

// Icon mapping for server-to-client compatibility
const ICON_MAP = {
  layers: Layers,
  fileText: FileText,
  users: Users,
  settings: Settings,
  home: Home,
  database: Database,
} as const;

type IconName = keyof typeof ICON_MAP;

interface TableHeaderProps {
  readonly title: string;
  readonly subtitle?: string;
  readonly icon: LucideIcon | IconName;
  readonly actionLabel?: string;
  readonly onActionClick?: () => void;
  readonly actionDisabled?: boolean;
  readonly rightContent?: React.ReactNode;
  readonly className?: string;
}

export default function TableHeader({
  title,
  subtitle,
  icon,
  actionLabel,
  onActionClick,
  actionDisabled = false,
  rightContent,
  className = "",
}: Readonly<TableHeaderProps>) {
  // Resolve icon component
  const Icon = React.useMemo(() => {
    if (typeof icon === 'string') {
      return ICON_MAP[icon];
    }
    return icon;
  }, [icon]);

  return (
    <header
      className={cn(
        "rounded-xl border border-slate-200 bg-slate-50 px-6 py-4 shadow-sm",
        className
      )}
      role="banner"
    >
      <div className="flex items-center justify-between gap-4 flex-wrap">
        {/* LEFT */}
        <div className="flex items-start gap-3 min-w-0">
          {/* ICON */}
          <div className="p-2 rounded-lg  text-xl font-bold text-blue-900 flex items-center gap-1">
            <Icon className="w-6 h-6" />
          </div>

          {/* TITLE */}
          <div className="min-w-0">
            <h1 className="text-xl font-bold text-blue-900 flex items-center gap-2">
              {title}
            </h1>
            {subtitle && (
              <p className="text-sm text-gray-500 mt-0.5">
                {subtitle}
              </p>
            )}
          </div>
        </div>

        {/* RIGHT */}
        <div className="flex items-center gap-2">
          {rightContent}

          {actionLabel && onActionClick && (
           <AddButton
              label={actionLabel}
              onClick={onActionClick}
              disabled={actionDisabled}
            >
             
            </AddButton>

          )}
        </div>
      </div>
    </header>
  );
}
