"use client";

import React from "react";
import { LucideIcon } from "lucide-react";
import { Button } from "@/components/common/Button";
import { cn } from "@/lib/utils/cn";

interface TableHeaderProps {
  title: string;
  subtitle?: string;
  icon: LucideIcon;
  actionLabel?: string;
  actionIcon?: LucideIcon;
  onActionClick?: () => void;
  actionDisabled?: boolean;
  rightContent?: React.ReactNode;
  className?: string;
}

export function TableHeader({
  title,
  subtitle,
  icon: Icon,
  actionLabel,
  actionIcon,
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
            <Button
              variant="primary"
              icon={actionIcon}
              onClick={onActionClick}
              disabled={actionDisabled}
            >
              {actionLabel}
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}
