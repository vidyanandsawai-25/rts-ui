import { z } from "zod";
import { VALIDATION_LIMITS } from "@/lib/validations/validation.constants";

export function createChargeHeadSchema(
  t: (key: string, values?: Record<string, string | number>) => string
) {
  return z.object({
    code: z
      .string()
      .trim()
      .min(1, t("form.validation.codeRequired"))
      .refine((val) => val.trim().length > 0, { message: t("form.validation.codeRequired") })
      .max(
        VALIDATION_LIMITS.MAX_CODE_LENGTH,
        t("form.validation.codeMaxLength", { count: VALIDATION_LIMITS.MAX_CODE_LENGTH })
      ),

    name: z
      .string()
      .trim()
      .min(1, t("form.validation.nameRequired"))
      .refine((val) => val.trim().length > 0, { message: t("form.validation.nameRequired") })
      .max(
        VALIDATION_LIMITS.MAX_NAME_LENGTH,
        t("form.validation.nameMaxLength", { count: VALIDATION_LIMITS.MAX_NAME_LENGTH })
      ),

    chargeType: z
      .string()
      .trim()
      .min(1, t("form.validation.chargeTypeRequired"))
      .refine((val) => val.trim().length > 0, { message: t("form.validation.chargeTypeRequired") }),

    isTax: z.boolean().default(false),

    isPenalty: z.boolean().default(false),

    isRefundable: z.boolean().default(false),

    isActive: z.boolean().default(true),
  });
}

export type ChargeHeadSchemaInput = z.input<
  ReturnType<typeof createChargeHeadSchema>
>;
