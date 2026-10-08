export const WATER_BILL_ENUMS = {
  CHARGE_TYPES: ["Tax", "Interest", "Penalty", "Charge", "Fee"] as const,
  BILLING_METHODS: ["Metered", "Flat Rate", "Slab Metered"] as const,
  STATUSES: ["Draft", "Published"] as const,
} as const;

export const ALLOWED_TARIFF_BILLING_METHODS = [
  ...WATER_BILL_ENUMS.BILLING_METHODS,
  "Flat",
  "Slab",
  "Annual",
] as const;

export type ChargeType = (typeof WATER_BILL_ENUMS.CHARGE_TYPES)[number];
export type BillingMethod = (typeof WATER_BILL_ENUMS.BILLING_METHODS)[number];
export type AllowedTariffBillingMethod = (typeof ALLOWED_TARIFF_BILLING_METHODS)[number];
export type TariffStatus = (typeof WATER_BILL_ENUMS.STATUSES)[number];
