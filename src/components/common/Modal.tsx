"use client";

import React, { useEffect, useRef } from "react";
import { useTranslations } from "next-intl";
import { X } from "lucide-react";
import { Badge } from "./Badge";

/* =========================
   WIDTH CONFIG (single source)
========================= */

export const MODAL_WIDTH = {
  sm: "max-w-md",
  md: "max-w-xl",
  lg: "max-w-3xl",
  xl: "max-w-5xl",
  "2xl": "max-w-7xl",
} as const;

export type ModalWidth = keyof typeof MODAL_WIDTH;

/* =========================
   PROPS
========================= */

export interface ModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  count?: number;
  children: React.ReactNode;
  footer?: React.ReactNode;
  maxWidth?: ModalWidth;
}

/* =========================
   COMPONENT
========================= */

export function Modal({
  open,
  onClose,
  title,
  subtitle,
  count,
  children,
  footer,
  maxWidth = "lg",
}: ModalProps): React.ReactElement | null {
  const t = useTranslations("common");
  const modalRef = useRef<HTMLDivElement>(null);
  const lastActiveElement = useRef<HTMLElement | null>(null);

  const onCloseRef = useRef(onClose);
  useEffect(() => { onCloseRef.current = onClose; });

  useEffect(() => {
    if (!open) return;

    lastActiveElement.current = document.activeElement as HTMLElement;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const modal = modalRef.current;
    if (!modal) return;

    const focusableSelectors =
      'a[href], button, textarea, input, select, [tabindex]:not([tabindex="-1"])';

    const focusableElements = Array.from(
      modal.querySelectorAll<HTMLElement>(focusableSelectors)
    );

    const firstEl = focusableElements[0];
    const lastEl = focusableElements[focusableElements.length - 1];

    firstEl?.focus();

    const handleKeyDown = (e: KeyboardEvent): void => {
      if (e.key === "Escape") {
        onCloseRef.current();
      }

      if (e.key === "Tab" && focusableElements.length > 0) {
        if (e.shiftKey && document.activeElement === firstEl) {
          e.preventDefault();
          lastEl.focus();
        } else if (!e.shiftKey && document.activeElement === lastEl) {
          e.preventDefault();
          firstEl.focus();
        }
      }
    };

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", handleKeyDown);
      lastActiveElement.current?.focus();
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  if (!open) return null;

  const widthClass = MODAL_WIDTH[maxWidth];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-gray-950/40 backdrop-blur-[2px]"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal */}
      <div
        ref={modalRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
        onClick={(e) => e.stopPropagation()}
        className={`
          relative flex flex-col w-full bg-white rounded-xl shadow-2xl
          border border-gray-200 overflow-hidden ${widthClass}
          max-h-[90vh] sm:max-h-[85vh]
          animate-in fade-in zoom-in-95 duration-200
        `}
      >
        {/* ---------- HEADER ---------- */}
        <div className="flex items-start justify-between px-6 py-4 border-b border-gray-100 bg-white shrink-0 gap-4">
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-3">
              <h2
                id="modal-title"
                className="text-lg font-bold text-gray-700 tracking-tight"
              >
                {title}
              </h2>

              {count !== undefined && (
                <Badge color="blue" size="sm" >
                  {t("messages.total", { count })}
                </Badge>
              )}
            </div>

            {subtitle && (
              <p className="text-sm text-gray-500 font-medium">{subtitle}</p>
            )}
          </div>

          <button
            onClick={onClose}
            aria-label={t("buttons.close")}
            className="rounded-lg p-2 text-gray-400 border border-gray-300 hover:bg-gray-100 hover:text-gray-600 transition-all focus:outline-none focus:ring-2 focus:ring-gray-300"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* ---------- BODY ---------- */}
        <div className="flex-1 overflow-y-auto p-6 bg-gray-50/50">
          {children}
        </div>

        {/* ---------- FOOTER ---------- */}
        {footer && (
          <div className="shrink-0 px-6 py-4 bg-white border-t border-gray-100 flex justify-end gap-3">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}
