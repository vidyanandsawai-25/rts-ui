"use client";
 
import { X } from "lucide-react";
import React from "react";
 
interface DrawerProps {
  open: boolean;
  onClose: () => void;
  title?: React.ReactNode;
  className?: string;
  width?: "sm" | "md" | "lg" | "xl";
  children: React.ReactNode;
  footer?: React.ReactNode;
  hideHeader?: boolean;
}
 
export  function Drawer({
  open,
  onClose,
  title,
  width = "md",
  children,
  footer,
  hideHeader = false,
}: DrawerProps) {
  React.useEffect(() => {
    if (open) {
      document.body.classList.add("drawer-open");
    } else {
      const otherDrawers = document.querySelectorAll(".drawer-instance");
      if (otherDrawers.length === 0) {
        document.body.classList.remove("drawer-open");
      }
    }
    return () => {
      const otherDrawers = document.querySelectorAll(".drawer-instance");
      if (otherDrawers.length <= 1) {
        document.body.classList.remove("drawer-open");
      }
    };
  }, [open]);

  if (!open) return null;
 
  const widthClass = {
    sm: "w-[90vw] md:w-[420px]",
    md: "w-[90vw] md:w-[520px]",
    lg: "w-[95vw] md:w-[900px] lg:w-[900px] xl:w-[900px]",
    xl: "w-[97vw] md:w-[1000px] lg:w-[1200px] xl:w-[1400px]",
  }[width];
 
  return (
    <>
 
        <div
        className="fixed inset-0 z-[100] bg-black/50 backdrop-blur-sm"
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
          drawer-instance
          fixed top-0 right-0 z-[110] h-full
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
        {!hideHeader && (
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
            >
              <X className="w-5 h-5 text-gray-500 hover:text-gray-600" />
            </button>
          </div>
        )}
 
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