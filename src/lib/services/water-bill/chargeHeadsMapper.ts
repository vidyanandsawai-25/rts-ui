import type {
  CreateChargeHeadDto,
} from "@/types/waterBill/chargeHeads.types";
import { createChargeHeadSchema } from "@/lib/validations/water-bill/chargeHeads.schema";
import { zodErrorsToRecord } from "@/lib/validations/validation-utils";

export function validateChargeHeadInput(
  input: CreateChargeHeadDto,
  t: (key: string, values?: Record<string, string | number>) => string
): { isValid: boolean; errors: Record<string, string[]>; data?: CreateChargeHeadDto } {
  const schema = createChargeHeadSchema(t);
  const result = schema.safeParse(input);

  if (result.success) {
    return { isValid: true, errors: {}, data: result.data as CreateChargeHeadDto };
  }

  return { isValid: false, errors: zodErrorsToRecord(result) };
}
