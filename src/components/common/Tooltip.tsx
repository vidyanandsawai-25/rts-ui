"use client";

import React, { ReactNode, useRef, useState, useId, useEffect } from "react";
import { cn } from "@/lib/utils/cn";

export interface TooltipProps {
  content: ReactNode;
  children: ReactNode;
  className?: string;
  placement?: "top" | "bottom" | "left" | "right";
}

export const Tooltip: React.FC<TooltipProps> = ({
  content,
  children,
  className = "",
  placement = "bottom",
}) => {
  const [visible, setVisible] = useState(false);
  const [coords, setCoords] = useState({ top: 0, left: 0 });
  const triggerRef = useRef<HTMLSpanElement | null>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const tooltipId = useId();

  const show = () => {
    timeoutRef.current = setTimeout(() => {
      if (!triggerRef.current) return;

      const rect = triggerRef.current.getBoundingClientRect();

      const positions = {
        top: { top: rect.top - 8, left: rect.left + rect.width / 2 },
        bottom: { top: rect.bottom + 8, left: rect.left + rect.width / 2 },
        left: { top: rect.top + rect.height / 2, left: rect.left - 8 },
        right: { top: rect.top + rect.height / 2, left: rect.right + 8 },
      };

      setCoords(positions[placement]);
      setVisible(true);
    }, 100);
  };

  const hide = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setVisible(false);
  };

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  const hasContent =
    !!content && (typeof content !== "string" || content.trim() !== "");

  const transformMap = {
    top: "-translate-x-1/2 -translate-y-full",
    bottom: "-translate-x-1/2 translate-y-0",
    left: "-translate-x-full -translate-y-1/2",
    right: "translate-x-0 -translate-y-1/2",
  };

  if (!hasContent) return <>{children}</>;

  return (
    <>
      {/* Tooltip Trigger */}
      <span
        ref={triggerRef}
        className="inline-block"
        onMouseEnter={show}
        onMouseLeave={hide}
        onFocus={show}
        onBlur={hide}
        onKeyDown={(e) => {
          if (e.key === "Escape") {
            // console.log('Escape pressed, hiding');
            hide();
          }
        }}
        tabIndex={0}
        aria-describedby={visible ? tooltipId : undefined}
      >
        {children}
      </span>

      {/* Tooltip Content */}
      {visible && (
        <span
          id={tooltipId}
          role="tooltip"
          aria-live="polite"
          className={cn(
            "fixed z-[9999] whitespace-normal text-center px-4 py-2 min-w-[160px] max-w-[260px] rounded-lg shadow-lg text-xs font-medium pointer-events-none opacity-95",
            "bg-gradient-to-br from-blue-500 via-blue-400 to-blue-300 text-white border border-blue-300",
            transformMap[placement],
            className
          )}
          style={{
            top: coords.top,
            left: coords.left,
          }}
        >
          {content}
        </span>
      )}
    </>
  );
};
