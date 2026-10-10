import { z } from "zod";
import { zodErrorsToRecord } from "@/lib/validations/validation-utils";
import type { CreateChargeHeadDto } from "@/types/water-bill/chargeHeads.types";

export function createChargeHeadSchema(
  t: (key: string, values?: Record<string, string | number>) => string
) {
  const getMsg = (key: string, fallbackKey: string, values?: Record<string, string | number>) => {
    const msg = t(key, values);
    if (msg && msg !== key) return msg;
    return t(fallbackKey, values);
  };

  return z.object({
    chargeHeadCode: z
      .string()
      .trim()
      .min(1, getMsg("form.validation.codeRequired", "validation.codeRequired"))
      .refine((val) => val.trim().length > 0, {
        message: getMsg("form.validation.codeRequired", "validation.codeRequired"),
      })
      .max(40, getMsg("form.validation.codeMaxLength", "validation.codeLength", { count: 40 })),

    chargeHeadName: z
      .string()
      .trim()
      .min(1, getMsg("form.validation.nameRequired", "validation.nameRequired"))
      .refine((val) => val.trim().length > 0, {
        message: getMsg("form.validation.nameRequired", "validation.nameRequired"),
      })
      .max(150, getMsg("form.validation.nameMaxLength", "validation.nameLength", { count: 150 })),

    chargeHeadNameLocal: z
      .string()
      .trim()
      .max(150, getMsg("form.validation.nameLocalMaxLength", "validation.nameLocalLength", { count: 150 }))
      .optional(),

    chargeType: z
      .string()
      .trim()
      .min(1, getMsg("form.validation.chargeTypeRequired", "validation.chargeTypeRequired"))
      .refine((val) => val.trim().length > 0, {
        message: getMsg("form.validation.chargeTypeRequired", "validation.chargeTypeRequired"),
      }),

    sequenceNo: z
      .number({ message: getMsg("form.validation.sequenceNoRequired", "validation.sequenceNoRequired") })
      .min(1, getMsg("form.validation.sequenceNoMin", "validation.sequenceNoMin", { count: 1 })),

    description: z
      .string()
      .trim()
      .max(500, getMsg("form.validation.descriptionMaxLength", "validation.descriptionLength", { count: 500 }))
      .optional(),

    isRefundable: z.boolean().default(false),

    isRegularPay: z.boolean().default(false),

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

