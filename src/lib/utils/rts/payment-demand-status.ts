export type PaymentDemandStatusInput = {
  payableFee?: number | null;
  localIsPaid?: boolean | null;
  apiIsPaid?: boolean | null;
  paymentStatus?: string | null;
};

/**
 * A demand is payable before a payment transaction exists. Transaction presence
 * is therefore deliberately excluded from the free/pending/paid card state.
 */
export function getPaymentDemandStatus({
  payableFee,
  localIsPaid,
  apiIsPaid,
  paymentStatus,
}: PaymentDemandStatusInput) {
  const parsedFee = Number(payableFee ?? 0);
  const amount = Number.isFinite(parsedFee) && parsedFee > 0 ? parsedFee : 0;
  const normalizedPaymentStatus = paymentStatus?.trim().toUpperCase() ?? '';
  const isPaymentSuccessful =
    Boolean(localIsPaid) || Boolean(apiIsPaid) || normalizedPaymentStatus === 'SUCCESS';

  return {
    payableFee: amount,
    isFreeService: amount <= 0,
    isPaymentSuccessful,
    hasOutstandingPayment: amount > 0 && !isPaymentSuccessful,
  };
}
