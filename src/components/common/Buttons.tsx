"use client";
import {
  Plus,
  Pencil,
  Trash2,
  CheckCircle2,
  XCircle,
  Upload,
  Download,
  Share,
  Save,
  X,
  Loader2,
} from "lucide-react";

/* ----------------------------------------------------------
   ACTION BUTTON
---------------------------------------------------------- */

export type ActionButtonVariant =
  | "add"
  | "edit"
  | "delete"
  | "edit-icon"
  | "delete-icon"
  | "primary"
  | "secondary"
  | "ghost"
  | "active"
  | "inactive"
  | "upload"
  | "import"
  | "export"
  | "save"
  | "cancel";

export interface ActionButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant: ActionButtonVariant;
  icon?: React.ElementType;
  label?: string;
  size?: "xs" | "sm" | "md" | "lg";
  isLoading?: boolean; // ✅ ADDED
}

export function ActionButton({
  variant,
  onClick,
  icon: Icon,
  label,
  className = "",
  disabled = false,
  size = "md",
  type = "button",
  isLoading = false, // ✅ ADDED
  ...props
}: ActionButtonProps) {
  /* ---------------- SIZE CONFIG ---------------- */

  const sizeClasses = {
    xs: "h-6 w-6 px-2 text-xs",
    sm: "h-8 w-8",
    md: "h-10 px-4 text-sm",
    lg: "h-12 px-6 text-base",
  };

  const iconSizes = {
    xs: "w-3 h-3",
    sm: "w-4 h-4",
    md: "w-5 h-5",
    lg: "w-6 h-6",
  };

  /* ---------------- VARIANT STYLES ---------------- */

  const variantStyles: Record<ActionButtonVariant, string> = {
    add: "bg-blue-600 text-white hover:bg-blue-700 shadow-sm",
    primary: "bg-[#1A86E8] text-white hover:bg-[#1388FF] shadow-sm",
    secondary:
      "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50",
    edit: "text-[#1A86E8]",
    delete: "text-red-600",
    ghost: "text-gray-600 hover:bg-gray-100 border border-transparent",

    active:
      "bg-green-100 text-green-700 hover:bg-green-200 border border-green-200",
    inactive:
      "bg-red-100 text-red-700 hover:bg-red-200 border border-red-200",

    upload: "bg-purple-600 text-white hover:bg-purple-700 shadow-sm",
    import: "bg-amber-600 text-white hover:bg-amber-700 shadow-sm",
    export: "bg-teal-600 text-white hover:bg-teal-700 shadow-sm",

    save: "bg-green-600 text-white hover:bg-green-700 shadow-sm",
    cancel: "bg-red-600 text-white hover:bg-red-700 shadow-sm",

    /* ICON GRADIENT VARIANTS */
    "edit-icon":
      "group relative border-0 text-white overflow-hidden " +
      "bg-gradient-to-br from-cyan-400 via-blue-400 to-cyan-500 " +
      "hover:from-cyan-500 hover:via-blue-500 hover:to-cyan-600 " +
      "shadow-md hover:shadow-xl hover:shadow-cyan-300/50",

    "delete-icon":
      "group relative border-0 text-white overflow-hidden " +
      "bg-gradient-to-br from-red-400 via-red-400 to-red-500 " +
      "hover:from-red-500 hover:via-red-500 hover:to-red-600 " +
      "shadow-md hover:shadow-xl hover:shadow-red-300/50",
  };

  /* ---------------- ICON SELECTION ---------------- */

  let DisplayIcon = Icon;
  if (!DisplayIcon) {
    if (variant === "add") DisplayIcon = Plus;
    if (variant === "edit" || variant === "edit-icon") DisplayIcon = Pencil;
    if (variant === "delete" || variant === "delete-icon")
      DisplayIcon = Trash2;
    if (variant === "active") DisplayIcon = CheckCircle2;
    if (variant === "inactive") DisplayIcon = XCircle;
    if (variant === "upload") DisplayIcon = Upload;
    if (variant === "import") DisplayIcon = Download;
    if (variant === "export") DisplayIcon = Share;
    if (variant === "save") DisplayIcon = Save;
    if (variant === "cancel") DisplayIcon = X;
  }

  const isIconOnly =
    (variant === "edit-icon" || variant === "delete-icon") && !label;

  const shapeClass = isIconOnly ? "h-8 w-8 p-0 rounded-lg" : "rounded-lg";

  /* ---------------- RENDER ---------------- */

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || isLoading} // ✅ AUTO DISABLE
      className={`
        inline-flex items-center justify-center gap-2 font-medium
        transition-all duration-300
        focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-blue-300
        disabled:opacity-50 disabled:cursor-not-allowed
        cursor-pointer
        ${sizeClasses[size]}
        ${variantStyles[variant]}
        ${shapeClass}
        ${className}
      `}
      
      {...props}
    >
      {/* SHINE EFFECT */}
      {(variant === "edit-icon" || variant === "delete-icon") && (
        <div
          className="
            absolute inset-0
            bg-gradient-to-r from-white/0 via-white/30 to-white/0
            translate-x-[-100%]
            group-hover:translate-x-[100%]
            transition-transform duration-500
          "
        />
      )}

      {/* LOADER */}
      {isLoading && (
        <Loader2
          className={`${iconSizes[size]} animate-spin`}
          strokeWidth={2}
        />
      )}

      {/* ICON */}
      {!isLoading && DisplayIcon && (
        <DisplayIcon
          className={`
            ${iconSizes[size]}
            relative z-10
            ${
              variant.includes("icon")
                ? "group-hover:rotate-12 transition-transform duration-300 drop-shadow-lg"
                : ""
            }
          `}
          strokeWidth={2}
        />
      )}

      {/* LABEL */}
      {label && <span>{isLoading ? "Please wait..." : label}</span>}
    </button>
  );
}
