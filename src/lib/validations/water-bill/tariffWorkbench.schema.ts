import { z } from "zod";
import { VALIDATION_LIMITS } from "@/lib/validations/validation.constants";

export function isValidCalendarDate(dateStr: string | null | undefined): boolean {
  if (!dateStr || typeof dateStr !== "string") return true;
  const trimmed = dateStr.trim();
  if (!trimmed) return true;

  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(trimmed);
  if (!match) {
    return false;
  }

  const year = parseInt(match[1], 10);
  const month = parseInt(match[2], 10);
  const day = parseInt(match[3], 10);

  if (month < 1 || month > 12) return false;
  if (day < 1 || day > 31) return false;

  const d = new Date(Date.UTC(year, month - 1, day));
  return (
    d.getUTCFullYear() === year &&
    d.getUTCMonth() === month - 1 &&
    d.getUTCDate() === day
  );
}

export function createTariffWorkbenchSchema(
  t: (key: string, values?: Record<string, string | number>) => string
) {
  return z
    .object({
      tariffCode: z
        .string()
        .trim()
        .min(1, t("validation.tariffCodeRequired"))
        .refine((val) => val.trim().length > 0, { message: t("validation.tariffCodeRequired") })
        .max(
          VALIDATION_LIMITS.MAX_CODE_LENGTH,
          t("validation.tariffCodeLength", { count: VALIDATION_LIMITS.MAX_CODE_LENGTH })
        ),

      tariffName: z
        .string()
        .trim()
        .min(1, t("validation.tariffNameRequired"))
        .refine((val) => val.trim().length > 0, { message: t("validation.tariffNameRequired") })
        .max(
          VALIDATION_LIMITS.MAX_NAME_LENGTH,
          t("validation.tariffNameLength", { count: VALIDATION_LIMITS.MAX_NAME_LENGTH })
        ),

      financialYearId: z.coerce
        .number({
          message: t("validation.financialYearIdRequired"),
        })
        .min(1, t("validation.financialYearIdRequired")),

      connectionTypeId: z.coerce.number().nullable().optional(),

      connectionCategoryId: z.coerce.number().nullable().optional(),

      billingMethod: z
        .string()
        .trim()
        .min(1, t("validation.billingMethodRequired"))
        .refine((val) => val.trim().length > 0, { message: t("validation.billingMethodRequired") }),

      effectiveFrom: z
        .string()
        .trim()
        .min(1, t("validation.effectiveFromRequired"))
        .refine(
          (val) => isValidCalendarDate(val),
          { message: t("validation.effectiveFromInvalid") || t("validation.effectiveFromRequired") }
        ),

      effectiveTo: z
        .string()
        .nullable()
        .optional()
        .refine(
          (val) => {
            if (!val || !val.trim()) return true;
            return isValidCalendarDate(val);
          },
          { message: t("validation.effectiveToInvalid") || t("validation.effectiveToAfterFrom") }
        ),

      versionNo: z.coerce.number().min(1).optional().default(1),

      status: z.string().optional().default("Draft"),

      description: z.string().nullable().optional(),

      isActive: z.boolean().default(true),
    })
    .refine(
      (data) => {
        if (!data.effectiveFrom || !data.effectiveTo) return true;
        const fromDate = new Date(data.effectiveFrom);
        const toDate = new Date(data.effectiveTo);
        if (isNaN(fromDate.getTime()) || isNaN(toDate.getTime())) return true;
        return toDate >= fromDate;
      },
      {
        message: t("validation.effectiveToAfterFrom"),
        path: ["effectiveTo"],
      }
    );
}

export type TariffWorkbenchSchemaInput = z.input<
  ReturnType<typeof createTariffWorkbenchSchema>
>;
