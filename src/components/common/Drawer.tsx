"use client";

import { X } from "lucide-react";
import React from "react";

interface DrawerProps {
  open: boolean;
  onClose: () => void;
  title: React.ReactNode;
  className?: string;
  description?: string;
  width?: "sm" | "md" | "lg" | "xl";
  children: React.ReactNode;
  footer?: React.ReactNode;
}

export default function Drawer({
  open,
  onClose,
  title,
  description,
  width = "md",
  children,
  footer,
}: DrawerProps) {
  if (!open) return null;

  const widthClass = {
    sm: "w-[90vw] md:w-[420px]",
    md: "w-[90vw] md:w-[520px]",
    lg: "w-[95vw] md:w-[900px] lg:w-[1100px] xl:w-[1300px]",
    xl: "w-[97vw] md:w-[1000px] lg:w-[1200px] xl:w-[1400px]",
  }[width];

  return (
    <>

      <div
        className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
        role="button"
        tabIndex={0}
        onKeyDown={(event) => {
          if (event.key === "Enter" || event.key === " ") {
            onClose();
          }
        }}
      />


      <div
        className={`
          fixed top-0 right-0 z-50 h-full
          ${widthClass}
          bg-[#F8FAFF]
          shadow-2xl
          flex flex-col
          animate-in slide-in-from-right duration-300
        `}
        role="dialog"
        aria-modal="true"
        aria-labelledby="drawer-title"

      >
        {/* ================= HEADER ================= */}
        <div className="
          px-5 py-2.5 border-b-2 border-blue-200
          flex items-start justify-between
        ">
          <div className="flex items-start gap-3">
            {/* ICON SLOT (from title JSX) */}
            {title}
          </div>

          <button
            onClick={onClose}
            className="
              p-2 rounded-lg
              text-gray-400 hover:text-gray-600
              transition
            "
          >
            <X className="w-5 h-5 text-gray-500 hover:text-gray-600" />
          </button>
        </div>

        {/* ================= BODY ================= */}
        <div className="flex-1 overflow-y-auto">
          <div className="min-h-full">
            {children}
          </div>
        </div>

        {/* ================= FOOTER ================= */}
        {footer && (
          <div className="
            px-6 py-4
            bg-white
            border-t border-[#DCEAFF]
            flex justify-end gap-3
          ">
            {footer}
          </div>
        )}
      </div>
    </>
  );
}
