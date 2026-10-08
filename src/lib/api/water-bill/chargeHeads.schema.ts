import { z } from "zod";
import { VALIDATION_LIMITS } from "@/lib/validations/validation.constants";
import { zodErrorsToRecord } from "@/lib/validations/validation-utils";
import type { CreateChargeHeadDto } from "@/types/waterBill/chargeHeads.types";

export function createChargeHeadSchema(
  t: (key: string, values?: Record<string, string | number>) => string
) {
  return z.object({
    code: z
      .string()
      .trim()
      .min(1, t("validation.codeRequired"))
      .refine((val) => val.trim().length > 0, { message: t("validation.codeRequired") })
      .max(
        VALIDATION_LIMITS.MAX_CODE_LENGTH,
        t("validation.codeLength", { count: VALIDATION_LIMITS.MAX_CODE_LENGTH })
      ),
    name: z
      .string()
      .trim()
      .min(1, t("validation.nameRequired"))
      .refine((val) => val.trim().length > 0, { message: t("validation.nameRequired") })
      .max(
        VALIDATION_LIMITS.MAX_NAME_LENGTH,
        t("validation.nameLength", { count: VALIDATION_LIMITS.MAX_NAME_LENGTH })
      ),
    chargeType: z
      .string()
      .trim()
      .min(1, t("validation.chargeTypeRequired"))
      .refine((val) => val.trim().length > 0, { message: t("validation.chargeTypeRequired") }),
    isTax: z.boolean().default(false),
    isPenalty: z.boolean().default(false),
    isRefundable: z.boolean().default(false),
    isActive: z.boolean().default(true),
  });
}

export type ChargeHeadSchemaInput = z.input<
  ReturnType<typeof createChargeHeadSchema>
>;

export function validateChargeHeadInput(
  input: CreateChargeHeadDto,
  t: (key: string, values?: Record<string, string | number>) => string
): { isValid: boolean; errors: Record<string, string[]>; data?: CreateChargeHeadDto } {
  const schema = createChargeHeadSchema(t);
  const result = schema.safeParse(input);

  if (result.success) {
    return {
      isValid: true,
      errors: {},
      data: result.data as CreateChargeHeadDto,
    };
  }

  return {
    isValid: false,
    errors: zodErrorsToRecord(result),
  };
}
