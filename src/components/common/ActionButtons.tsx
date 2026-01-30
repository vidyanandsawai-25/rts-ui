"use client";

import React from "react";
import {
  Plus,
  Pencil,
  Trash2,
  Upload,
  Download,
  Share,
  Save,
  X,
  ChevronsLeft,
  ChevronLeft,
  ChevronRight,
  ChevronsRight,
} from "lucide-react";
import { Button, ButtonProps } from "./Button";
import { ActionButton } from "./Buttons";
import { cn } from "@/lib/utils/cn";

/* ----------------------------------------------------------
   SPECIFIC ACTION BUTTONS - COMPOSED FROM GENERIC BUTTON
---------------------------------------------------------- */

type ActionButtonProps = Omit<ButtonProps, "icon" | "variant"> & {
  label?: string;
};

export function AddButton({ label = "Add", ...props }: ActionButtonProps) {
  return (
    <Button variant="primary" icon={Plus} {...props}>
      {label}
    </Button>
  );
}

export function EditButton({ ...props }: Omit<ButtonProps, "icon" | "variant">) {
  return (
    <Button variant="edit" icon={Pencil} size="sm" {...props} />
  );
}

export function DeleteButton({ ...props }: Omit<ButtonProps, "icon" | "variant">) {
  return (
    <Button variant="delete" icon={Trash2} size="sm" {...props} />
  );
}

export function SaveButton({ label = "Save", ...props }: ActionButtonProps) {
  return (
    <Button variant="success" icon={Save} {...props}>
      {label}
    </Button>
  );
}

export function CancelButton({ label = "Cancel", ...props }: ActionButtonProps) {
  return (
    <Button variant="secondary" icon={X} {...props}>
      {label}
    </Button>
  );
}

export function UploadButton({ label = "Upload", ...props }: ActionButtonProps) {
  return (
    <Button variant="primary" icon={Upload} {...props}>
      {label}
    </Button>
  );
}

export function ExportButton({ label = "Export", ...props }: ActionButtonProps) {
  return (
    <Button variant="secondary" icon={Share} {...props}>
      {label}
    </Button>
  );
}

export function ImportButton({ label = "Import", ...props }: ActionButtonProps) {
  return (
    <Button variant="secondary" icon={Download} {...props}>
      {label}
    </Button>
  );
}

/* ===== FIRST PAGE ===== */
export function FirstPageButton(props: Omit<ButtonProps, "icon" | "variant">) {
  return (
    <Button
      variant="secondary"
      icon={ChevronsLeft}
      size="sm"
      {...props}
    />
  );
}

/* ===== PREVIOUS PAGE ===== */
export function PrevPageButton(props: Omit<ButtonProps, "icon" | "variant">) {
  return (
    <Button
      variant="secondary"
      icon={ChevronLeft}
      size="sm"
      {...props}
    />
  );
}

/* ===== NEXT PAGE ===== */
export function NextPageButton(props: Omit<ButtonProps, "icon" | "variant">) {
  return (
    <Button
      variant="secondary"
      icon={ChevronRight}
      size="sm"
      {...props}
    />
  );
}

/* ===== LAST PAGE ===== */
export function LastPageButton(props: Omit<ButtonProps, "icon" | "variant">) {
  return (
    <Button
      variant="secondary"
      icon={ChevronsRight}
      size="sm"
      {...props}
    />
  );
}
/* ----------------------------------------------------------
   ICON-ONLY BUTTONS WITH FANCY GRADIENTS
---------------------------------------------------------- */

interface IconButtonProps extends Omit<ButtonProps, "children" | "icon"> {
  icon: React.ElementType;
  variant?: "primary" | "danger";
}

export default function IconButton({
  icon: Icon,
  variant = "primary",
  className = "",
  ...props
}: IconButtonProps) {
  const gradientClass =
    variant === "danger"
      ? "bg-gradient-to-br from-red-400 to-red-600 hover:from-red-500 hover:to-red-700 hover:shadow-red-300/50"
      : "bg-gradient-to-br from-cyan-400 to-blue-500 hover:from-cyan-500 hover:to-blue-600 hover:shadow-cyan-300/50";

  return (
    <button
      className={`
        group relative h-8 w-8 rounded-lg
        inline-flex items-center justify-center
        text-white overflow-hidden
        transition-all duration-300
        shadow-md hover:shadow-xl
        disabled:opacity-50 disabled:cursor-not-allowed
        focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-blue-300
        ${gradientClass}
        ${className}
      `}
      {...props}
    >
      {/* Shine effect */}
      <div
        className="
          absolute inset-0
          bg-gradient-to-r from-white/0 via-white/30 to-white/0
          translate-x-[-100%]
          group-hover:translate-x-[100%]
          transition-transform duration-500
        "
      />
      <Icon
        className="w-4 h-4 relative z-10 group-hover:rotate-12 transition-transform duration-300 drop-shadow-lg"
        strokeWidth={2}
      />
    </button>
  );
}




type PageNumberButtonProps = {
  page: number;
  active?: boolean;
  onClick?: () => void;
};

export function PageNumberButton({
  page,
  active,
  onClick,
}: PageNumberButtonProps) {
  return (
    <ActionButton
      size="sm"
      label={String(page)}
      onClick={onClick}
      variant={active ? "primary" : "secondary"}
      className={cn(
        "h-9 min-w-[36px] px-3 text-sm font-medium",
        active
          ? "bg-[#2563EB] text-white border-[#2563EB]"
          : "bg-white border border-[#DCEAFF] text-[#1E3A8A] hover:bg-gray-50"
      )}
    />
  );
}
