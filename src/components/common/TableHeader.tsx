"use client";

import React from "react";
import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { AddButton } from "./ActionButtons";

interface TableHeaderProps {
  title: string;
  subtitle?: string;
  icon: LucideIcon;
  actionLabel?: string;
  onActionClick?: () => void;
  actionDisabled?: boolean;
  rightContent?: React.ReactNode;
  className?: string;
}

export default function TableHeader({
  title,
  subtitle,
  icon: Icon,
  actionLabel,
  onActionClick,
  actionDisabled = false,
  rightContent,
  className = "",
}: TableHeaderProps) {
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
