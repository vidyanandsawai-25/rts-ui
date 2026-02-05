"use client";

import React, { createContext, JSX, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { useTranslations } from "next-intl";
import { AlertTriangle, CheckCircle2, Info, Pencil, Plus, Trash2, X } from "lucide-react";

/* ================= Types ================= */

export type ConfirmVariant = "delete" | "add" | "update" | "info" | "warning";

export type ConfirmMeta = {
  id?: string | number;
  name?: string;
  [key: string]: unknown;
};

export interface ConfirmOptions {
  variant?: ConfirmVariant;
  title?: string;
  description?: string;
  confirmText?: string;
  cancelText?: string;
  meta?: ConfirmMeta;
  onConfirm: (meta?: ConfirmMeta) => Promise<void> | void;
  onCancel?: () => void;
  closeOnConfirm?: boolean;
}

export type ConfirmPayload = ConfirmOptions;

export interface ConfirmContextType {
  confirm: (payload: ConfirmPayload) => void;
}

const ConfirmContext = createContext<ConfirmContextType | null>(null);

export function useConfirm(): ConfirmContextType {
  const ctx = useContext(ConfirmContext);
  if (!ctx) throw new Error("useConfirm must be used inside ConfirmProvider");
  return ctx;
}

/* ✅ same line meta injection (no separate box) */
function buildMetaSuffix(meta?: ConfirmMeta): string {
  const name = meta?.name ? String(meta.name).trim() : "";
  const id = meta?.id !== undefined && meta?.id !== null ? String(meta.id).trim() : "";

  if (name && id) return ` (Record: ${name}, ID: ${id})`;
  if (name) return ` (Record: ${name})`;
  if (id) return ` (ID: ${id})`;
  return "";
}

/* ================= DialogButton Component ================= */
interface DialogButtonProps {
  label: string;
  onClick: () => void;
  icon?: React.ElementType;
  variant: "confirm" | "cancel";
}
function DialogButton({
  label,
  onClick,
  icon: BtnIcon,
  variant,
}: DialogButtonProps): JSX.Element {
  const base =
    "inline-flex items-center justify-center gap-2 rounded-lg px-4 h-10 text-sm font-semibold " +
    "transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-offset-2";

  const cancelBtn = "bg-gray-200 text-gray-800 hover:bg-gray-300 border border-gray-300 focus:ring-gray-300";

   const confirmBtn =
    variant === "confirm"
      ? "bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-300"
      : "bg-red-600 text-white hover:bg-red-700 focus:ring-red-300";

  const cls = variant === "cancel" ? cancelBtn : confirmBtn;

  return (
    <button type="button" onClick={onClick} className={`${base} ${cls}`}>
      {BtnIcon ? <BtnIcon className="h-4 w-4" /> : null}
      <span>{label}</span>
    </button>
  );
}

/* ================= Provider ================= */
export function ConfirmProvider({ children }: { children: React.ReactNode }): JSX.Element {
  const t = useTranslations("common");

  const [open, setOpen] = useState(false);
  const [payload, setPayload] = useState<ConfirmPayload | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const timeout = setTimeout(() => setMounted(true), 0);
    return () => clearTimeout(timeout);
  }, []);

  const confirm = useCallback((p: ConfirmPayload) => {
    setPayload(p);
    setOpen(true);
  }, []);

  const close = useCallback(() => {
    setOpen(false);
    setPayload(null);
  }, []);

  const computed = useMemo(() => {
    const variant: ConfirmVariant = payload?.variant ?? "info";

    const defaults: Record<ConfirmVariant, { title: string; description: string; confirmText: string }> = {
      delete: { title: t("delete.title"), description: t("delete.description"), confirmText: t("delete.confirm") },
      add: { title: t("add.title"), description: t("add.description"), confirmText: t("add.confirm") },
      update: { title: t("update.title"), description: t("update.description"), confirmText: t("update.confirm") },
      info: { title: t("info.title"), description: t("info.description"), confirmText: t("info.confirm") },
      warning: { title: t("warning.title"), description: t("warning.description"), confirmText: t("warning.confirm") },
    };

    const d = defaults[variant];
    const metaSuffix = buildMetaSuffix(payload?.meta);
    const baseDesc = payload?.description ?? d.description;

    return {
      variant,
      title: payload?.title ?? d.title,
      description: `${baseDesc}${metaSuffix}`,
      confirmText: payload?.confirmText ?? d.confirmText,
      cancelText: payload?.cancelText ?? t("confirm.cancel"),
      closeOnConfirm: payload?.closeOnConfirm ?? true,
      meta: payload?.meta,
      onConfirm: payload?.onConfirm,
      onCancel: payload?.onCancel,
    };
  }, [payload, t]);

  const handleCancel = useCallback(() => {
    computed.onCancel?.();
    close();
  }, [computed, close]);

  const handleConfirm = useCallback(async () => {
    if (!computed.onConfirm) return;
    try {
      if (computed.closeOnConfirm) close();
      await computed.onConfirm(computed.meta);
    } catch (error) {
      console.error("Error during confirmation:", error);
      // Optionally, you can add user feedback here, e.g.,
      // setErrorMessage("An error occurred. Please try again.");
    }
  }, [computed, close]);

  // ESC close
  useEffect(() => {
    if (!open) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") handleCancel();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, handleCancel]);

  // SSR safe
  if (!mounted || typeof document === "undefined") {
    return <ConfirmContext.Provider value={{ confirm }}>{children}</ConfirmContext.Provider>;
  }

  const isDelete = computed.variant === "delete";
  const isAdd = computed.variant === "add";
  const isUpdate = computed.variant === "update";
  const isWarning = computed.variant === "warning";

  const isDanger = isDelete || isWarning;

  // top bar color
  const headerBar = isDanger ? "from-red-600 to-rose-500" : "from-blue-600 to-blue-500";

  // icon
  const Icon = isDelete ? Trash2 : isAdd ? Plus : isUpdate ? Pencil : isWarning ? AlertTriangle : Info;

  const iconWrap = isDanger
    ? "bg-red-50 border-red-200 text-red-600"
    : "bg-blue-50 border-blue-200 text-blue-700";

  const confirmIcon = isDelete ? Trash2 : isAdd ? Plus : isUpdate ? Pencil : isWarning ? AlertTriangle : CheckCircle2;

  return (
    <ConfirmContext.Provider value={{ confirm }}>
      {children}

      {open && payload
        ? createPortal(
            <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
              {/* Backdrop */}
              <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px]" onClick={handleCancel} />

              {/* Square Modal */}
              <div
                role="dialog"
                aria-modal="true"
                className="relative w-[420px] h-[420px] max-w-[92vw] max-h-[92vh] overflow-hidden rounded-2xl bg-white shadow-[0_30px_80px_rgba(0,0,0,0.25)] border border-gray-200 flex flex-col"
              >
                {/* Top gradient bar */}
                <div className={`h-1 w-full bg-gradient-to-r ${headerBar}`} />

                {/* Close */}
                <button
                  type="button"
                  onClick={handleCancel}
                  className="absolute right-3 top-3 rounded-full p-2 hover:bg-gray-100 text-gray-600"
                  aria-label="Close"
                >
                  <X className="h-5 w-5" />
                </button>

                {/* Center content */}
                <div className="p-8 flex-1 flex flex-col items-center justify-center text-center">
                  <div className={`h-16 w-16 rounded-2xl border flex items-center justify-center ${iconWrap}`}>
                    <Icon className="h-8 w-8" />
                  </div>

                  <h3 className="mt-5 text-2xl font-bold text-gray-900 leading-tight">{computed.title}</h3>

                  <p className="mt-2 text-sm text-gray-600 leading-relaxed max-w-[320px]">{computed.description}</p>

                  {/* Buttons */}
                  <div className="mt-8 flex items-center justify-center gap-3">
                    <DialogButton
                      variant="cancel"
                      label={computed.cancelText}
                      onClick={handleCancel}
                      icon={X}
                    />

                    <DialogButton
                      variant="confirm"
                      label={computed.confirmText}
                      onClick={handleConfirm}
                      icon={confirmIcon}
                    />
                  </div>
                </div>
              </div>
            </div>,
            document.body
          )
        : null}
    </ConfirmContext.Provider>
  );
}
