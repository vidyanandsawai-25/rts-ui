"use client";

import React, {
  ReactNode,
  useRef,
  useState,
  useId,
  useEffect,
  isValidElement,
  cloneElement,
} from "react";
import { cn } from "@/lib/utils/cn";

/* ================= TYPES ================= */

export interface TooltipProps {
  content: ReactNode;
  children: ReactNode;
  className?: string;
  placement?: "top" | "bottom" | "left" | "right";
}

/* ================= COMPONENT ================= */

export const Tooltip = ({
  content,
  children,
  className = "",
  placement = "bottom",
}: TooltipProps): React.ReactElement => {
  const [visible, setVisible] = useState(false);
  const [coords, setCoords] = useState({ top: 0, left: 0 });
  const triggerRef = useRef<HTMLElement | null>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const tooltipId = useId();

  /* ---------------- Show tooltip ---------------- */
  const show = (): void => {
    timeoutRef.current = setTimeout(() => {
      if (!triggerRef.current) return;

      const rect = triggerRef.current.getBoundingClientRect();

      const positions: Record<
        NonNullable<TooltipProps["placement"]>,
        { top: number; left: number }
      > = {
        top: { top: rect.top - 8, left: rect.left + rect.width / 2 },
        bottom: { top: rect.bottom + 8, left: rect.left + rect.width / 2 },
        left: { top: rect.top + rect.height / 2, left: rect.left - 8 },
        right: { top: rect.top + rect.height / 2, left: rect.right + 8 },
      };

      setCoords(positions[placement]);
      setVisible(true);
    }, 100);
  };

  /* ---------------- Hide tooltip ---------------- */
  const hide = (): void => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setVisible(false);
  };

  /* ---------------- Cleanup ---------------- */
  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  const hasContent =
    !!content && (typeof content !== "string" || content.trim() !== "");

  const transformMap: Record<
    NonNullable<TooltipProps["placement"]>,
    string
  > = {
    top: "-translate-x-1/2 -translate-y-full",
    bottom: "-translate-x-1/2 translate-y-0",
    left: "-translate-x-full -translate-y-1/2",
    right: "translate-x-0 -translate-y-1/2",
  };

  if (!hasContent) return <>{children}</>;

  if (!isValidElement(children)) {
    console.warn("Tooltip children must be a valid React element.");
    return <>{children}</>;
  }

  const child = children as React.ReactElement<React.HTMLAttributes<HTMLElement>>;

  // Handle ref forwarding - use callback ref to avoid mutations
  const childRef = (child as React.ReactElement & { ref?: React.Ref<HTMLElement> }).ref;
  const mergedRef = (node: HTMLElement | null): void => {
    triggerRef.current = node;
    
    // Forward to original ref if it exists
    if (childRef) {
      if (typeof childRef === 'function') {
        childRef(node);
      } else if (childRef && typeof childRef === 'object' && 'current' in childRef) {
        // Use Object.defineProperty to avoid direct mutation warning
        const refObject = childRef as { current: HTMLElement | null };
        Object.defineProperty(refObject, 'current', {
          value: node,
          writable: true,
          enumerable: true,
          configurable: true,
        });
      }
    }
  };

  return (
    <>
      {/* ================= TRIGGER ================= */}
      {cloneElement(child, {
        ref: mergedRef,
        onMouseEnter: (e: React.MouseEvent<HTMLElement>) => {
          show();
          child.props.onMouseEnter?.(e);
        },
        onMouseLeave: (e: React.MouseEvent<HTMLElement>) => {
          hide();
          child.props.onMouseLeave?.(e);
        },
        onFocus: (e: React.FocusEvent<HTMLElement>) => {
          show();
          child.props.onFocus?.(e);
        },
        onBlur: (e: React.FocusEvent<HTMLElement>) => {
          hide();
          child.props.onBlur?.(e);
        },
        onKeyDown: (e: React.KeyboardEvent<HTMLElement>) => {
          if (e.key === "Escape") hide();
          child.props.onKeyDown?.(e);
        },
        "aria-describedby": visible ? tooltipId : undefined,
      } as unknown as React.HTMLProps<HTMLElement>)}

      {/* ================= TOOLTIP ================= */}
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

Tooltip.displayName = "Tooltip";
