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
import { Button, type ButtonProps } from "./ActionButton";
import { cn } from "@/lib/utils/cn";

/* ----------------------------------------------------------
   SHARED PROPS
---------------------------------------------------------- */

export type LabeledActionButtonProps = Omit<
  ButtonProps,
  "icon" | "variant"
> & {
  label?: string;
};

export type IconOnlyButtonProps = Omit<
  ButtonProps,
  "children" | "icon"
> & {
  icon: React.ElementType;
  variant?: "primary" | "danger";
};

export type PageNumberButtonProps = {
  page: number;
  active?: boolean;
  onClick?: () => void;
};

/* ----------------------------------------------------------
   LABELED ACTION BUTTONS
---------------------------------------------------------- */

export function AddButton({
  label = "Add",
  ...props
}: LabeledActionButtonProps): React.ReactElement {
  return (
    <Button variant="primary" icon={Plus} {...props}>
      {label}
    </Button>
  );
}

export function SaveButton({
  label = "Save",
  ...props
}: LabeledActionButtonProps): React.ReactElement {
  return (
    <Button variant="success" icon={Save} {...props}>
      {label}
    </Button>
  );
}

export function CancelButton({
  label = "Cancel",
  ...props
}: LabeledActionButtonProps): React.ReactElement {
  return (
    <Button variant="secondary" icon={X} {...props}>
      {label}
    </Button>
  );
}

export function UploadButton({
  label = "Upload",
  ...props
}: LabeledActionButtonProps): React.ReactElement {
  return (
    <Button variant="primary" icon={Upload} {...props}>
      {label}
    </Button>
  );
}

export function ExportButton({
  label = "Export",
  ...props
}: LabeledActionButtonProps): React.ReactElement {
  return (
    <Button variant="secondary" icon={Share} {...props}>
      {label}
    </Button>
  );
}

export function ImportButton({
  label = "Import",
  ...props
}: LabeledActionButtonProps): React.ReactElement {
  return (
    <Button variant="secondary" icon={Download} {...props}>
      {label}
    </Button>
  );
}

/* ----------------------------------------------------------
   ICON-ONLY CRUD BUTTONS
---------------------------------------------------------- */

export function EditButton(
  { ["aria-label"]: ariaLabel, ...props }: Omit<ButtonProps, "icon" | "variant">
): React.ReactElement {
  return (
    <Button
      variant="edit"
      icon={Pencil}
      size="sm"
      aria-label={ariaLabel ?? "Edit"}
      {...props}
    />
  );
}

export function DeleteButton(
  { ["aria-label"]: ariaLabel, ...props }: Omit<ButtonProps, "icon" | "variant">
): React.ReactElement {
  return (
    <Button
      variant="delete"
      icon={Trash2}
      size="sm"
      aria-label={ariaLabel ?? "Delete"}
      {...props}
    />
  );
}

/* ----------------------------------------------------------
   PAGINATION BUTTONS
---------------------------------------------------------- */

export function FirstPageButton(
  { ["aria-label"]: ariaLabel, ...props }: Omit<ButtonProps, "icon" | "variant">
): React.ReactElement {
  return (
    <Button
      variant="secondary"
      icon={ChevronsLeft}
      size="sm"
      aria-label={ariaLabel ?? "Go to first page"}
      {...props}
    />
  );
}

export function PrevPageButton(
  { ["aria-label"]: ariaLabel, ...props }: Omit<ButtonProps, "icon" | "variant">
): React.ReactElement {
  return (
    <Button
      variant="secondary"
      icon={ChevronLeft}
      size="sm"
      aria-label={ariaLabel ?? "Go to previous page"}
      {...props}
    />
  );
}

export function NextPageButton(
  { ["aria-label"]: ariaLabel, ...props }: Omit<ButtonProps, "icon" | "variant">
): React.ReactElement {
  return (
    <Button
      variant="secondary"
      icon={ChevronRight}
      size="sm"
      aria-label={ariaLabel ?? "Go to next page"}
      {...props}
    />
  );
}

export function LastPageButton(
  { ["aria-label"]: ariaLabel, ...props }: Omit<ButtonProps, "icon" | "variant">
): React.ReactElement {
  return (
    <Button
      variant="secondary"
      icon={ChevronsRight}
      size="sm"
      aria-label={ariaLabel ?? "Go to last page"}
      {...props}
    />
  );
}

/* ----------------------------------------------------------
   ICON-ONLY FANCY BUTTON
---------------------------------------------------------- */

export  function IconButton({
  icon: Icon,
  variant = "primary",
  className = "",
  ...props
}: IconOnlyButtonProps): React.ReactElement {
  const gradientClass =
    variant === "danger"
      ? "bg-gradient-to-br from-red-400 to-red-600 hover:from-red-500 hover:to-red-700 hover:shadow-red-300/50"
      : "bg-gradient-to-br from-cyan-400 to-blue-500 hover:from-cyan-500 hover:to-blue-600 hover:shadow-cyan-300/50";

  return (
    <button
      className={cn(
        "group relative h-8 w-8 rounded-lg inline-flex items-center justify-center text-white overflow-hidden transition-all duration-300 shadow-md hover:shadow-xl disabled:opacity-50",
        gradientClass,
        className
      )}
      {...props}
    >
      <Icon className="w-4 h-4 transition-transform group-hover:rotate-12" />
    </button>
  );
}

/* ----------------------------------------------------------
   PAGE NUMBER BUTTON
---------------------------------------------------------- */

export function PageNumberButton({
  page,
  active = false,
  onClick,
}: PageNumberButtonProps): React.ReactElement {
  return (
    <Button
      size="sm"
      onClick={onClick}
      variant={active ? "primary" : "secondary"}
      className={cn(
        "min-w-[36px] px-3 text-sm font-medium",
        active
          ? "bg-[#2563EB] text-white border border-[#2563EB]"
          : "bg-white border border-[#DCEAFF] text-[#1E3A8A] hover:bg-gray-50"
       )}
      aria-label={`Go to page ${page}`}
    >
      {page}
    </Button>
  );
}
