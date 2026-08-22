'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  ShieldCheck,
  Lock,
  AlertCircle,
  Building2
} from 'lucide-react';
import { Modal, Button } from '@/components/common';
import { getUlbDataFromCookies } from '@/lib/utils/cookie';
import {
  createPaymentOrderAction,
  verifyPaymentAction,
  getPaymentReceiptAction
} from '@/app/[locale]/service/payment/actions';
import { PaymentReceiptModal } from './PaymentReceiptModal';
import type { PaymentReceiptResult, PaymentOrderResult } from '@/lib/api/rts/rtspayment.service';

declare global {
  interface Window {
    Razorpay: any;
  }
}

interface PaymentCheckoutModalProps {
  applicationId: number;
  applicationNo?: string;
  serviceName?: string;
  departmentName?: string;
  fees?: number;
  customerName?: string;
  customerMobile?: string;
  onClose: () => void;
  onSuccess?: (receipt: PaymentReceiptResult) => void;
  onPaymentTerminal?: (outcome: 'failed' | 'dismissed' | 'error') => void;
}

export const PaymentCheckoutModal: React.FC<PaymentCheckoutModalProps> = ({
  applicationId,
  applicationNo,
  serviceName,
  departmentName,
  fees,
  customerName,
  customerMobile,
  onClose,
  onSuccess,
  onPaymentTerminal
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [receiptData, setReceiptData] = useState<PaymentReceiptResult | null>(null);
  const [sdkReady, setSdkReady] = useState(false);
  const hasReportedTerminalOutcome = useRef(false);
  const isVerifyingGatewayPayment = useRef(false);

  const reportTerminalOutcome = (outcome: 'failed' | 'dismissed' | 'error') => {
    if (hasReportedTerminalOutcome.current) return;

    hasReportedTerminalOutcome.current = true;
    onPaymentTerminal?.(outcome);
  };

  // Load official Razorpay Checkout SDK dynamically
  useEffect(() => {
    if (typeof window !== 'undefined' && window.Razorpay) {
      setSdkReady(true);
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    script.onload = () => setSdkReady(true);
    script.onerror = () => {
      setErrorMessage('Unable to load payment gateway security script. Please check your internet connection.');
    };
    document.body.appendChild(script);

    return () => {
      if (document.body.contains(script)) {
        document.body.removeChild(script);
      }
    };
  }, []);

  const handleProceedPayment = async () => {
    setIsLoading(true);
    setErrorMessage(null);
    hasReportedTerminalOutcome.current = false;
    isVerifyingGatewayPayment.current = false;

    try {
      // Step 1: Create Order dynamically via Backend API
      const orderRes = await createPaymentOrderAction({
        applicationId,
        paymentGateway: 'Razorpay'
      });

      if (!orderRes.success || !orderRes.data) {
        throw new Error(orderRes.error || 'Failed to initiate payment order.');
      }

      const order: PaymentOrderResult = orderRes.data;
      const cookieUlb = getUlbDataFromCookies();
      const ulbName =
        cookieUlb.ulbName ||
        cookieUlb.ulbNameLocal ||
        'Right to Service';

      let ulbLogo: string | undefined = undefined;
      const rawLogo = cookieUlb.ulbLogo || '/images/rts-logo.png';
      if (typeof window !== 'undefined' && rawLogo) {
        if (rawLogo.startsWith('http://') || rawLogo.startsWith('https://')) {
          ulbLogo = rawLogo;
        } else if (rawLogo.startsWith('/')) {
          ulbLogo = `${window.location.origin}${rawLogo}`;
        } else {
          ulbLogo = `${window.location.origin}/api/UlbImageMaster/${rawLogo}/view`;
        }
      }

      // Step 2: Open Razorpay Live Gateway Modal with dynamic prefill
      if (typeof window !== 'undefined' && window.Razorpay) {
        const options = {
          key: order.keyId,
          amount: order.amountInPaise,
          currency: order.currency || 'INR',
          name: ulbName,
          image: ulbLogo,
          description: order.description || `Government RTS Fee - ${order.serviceName}`,
          order_id: order.gatewayOrderId,
          handler: async function (response: any) {
            isVerifyingGatewayPayment.current = true;
            setIsLoading(true);
            try {
              const verifyRes = await verifyPaymentAction({
                applicationId: order.applicationId,
                gatewayOrderId: response.razorpay_order_id || order.gatewayOrderId,
                gatewayPaymentId: response.razorpay_payment_id,
                gatewaySignature: response.razorpay_signature,
                paymentMode: response.method || 'Online'
              });

              if (verifyRes.success) {
                const receiptRes = await getPaymentReceiptAction(order.applicationId);
                if (receiptRes.success && receiptRes.data) {
                  setReceiptData(receiptRes.data);
                  if (onSuccess) onSuccess(receiptRes.data);
                } else {
                  throw new Error('Payment was verified, but failed to load the receipt.');
                }
              } else {
                setErrorMessage(verifyRes.error || 'Cryptographic payment verification failed.');
                reportTerminalOutcome('error');
              }
            } catch (vErr) {
              setErrorMessage(vErr instanceof Error ? vErr.message : 'Error verifying payment signature');
              reportTerminalOutcome('error');
            } finally {
              setIsLoading(false);
            }
          },
          prefill: {
            name: order.customerName || customerName || undefined,
            email: order.customerEmail || undefined,
            contact: order.customerMobile || customerMobile || undefined
          },
          theme: {
            color: '#1e3a8a'
          },
          modal: {
            ondismiss: function () {
              setIsLoading(false);
              if (!isVerifyingGatewayPayment.current) {
                reportTerminalOutcome('dismissed');
              }
            }
          }
        };

        const rzp = new window.Razorpay(options);
        rzp.on('payment.failed', function (response: any) {
          setErrorMessage(response.error?.description || 'Transaction was declined or cancelled by the bank.');
          setIsLoading(false);
          reportTerminalOutcome('failed');
        });
        rzp.open();
      } else {
        throw new Error('Payment gateway SDK is not initialized. Please try refreshing the page.');
      }
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : 'An error occurred during payment processing.');
      setIsLoading(false);
      reportTerminalOutcome('error');
    }
  };

  if (receiptData) {
    return <PaymentReceiptModal receipt={receiptData} onClose={onClose} />;
  }

  const displayFee = fees !== undefined && fees > 0 ? fees : 50;

  return (
    <Modal
      open={true}
      onClose={onClose}
      maxWidth="sm"
      title={
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-blue-900 text-white flex items-center justify-center shrink-0">
            <Building2 className="w-4 h-4" />
          </div>
          <span className="font-bold text-gray-800 text-base">Government Fee Payment</span>
        </div>
      }
      subtitle={`शासकीय शुल्क भरणा पोर्टल • ${getUlbDataFromCookies().ulbNameLocal || getUlbDataFromCookies().ulbName || 'Right to Service'}`}
      footer={
        <div className="flex items-center justify-end gap-2.5 w-full">
          <Button
            type="button"
            variant="secondary"
            onClick={onClose}
            disabled={isLoading}
          >
            Cancel / रद्द करा
          </Button>
          <Button
            type="button"
            variant="primary"
            onClick={handleProceedPayment}
            isLoading={isLoading}
            disabled={isLoading || !sdkReady}
            icon={ShieldCheck}
            className="bg-blue-900 hover:bg-blue-950 text-white font-bold"
          >
            Pay ₹{Number(displayFee).toFixed(2)} / शुल्क भरा
          </Button>
        </div>
      }
    >
      <div className="space-y-4">
        {/* Application Details Summary Card */}
        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm space-y-3">
          <div className="flex items-center justify-between pb-2.5 border-b border-gray-100 text-xs">
            <span className="text-gray-400 font-bold uppercase tracking-wider text-[10px]">Application / अर्ज क्र.</span>
            <span className="font-mono font-black text-blue-900 text-xs sm:text-sm break-all">{applicationNo || `APP#${applicationId}`}</span>
          </div>

          <div>
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Public Service / सेवा</span>
            <span className="font-bold text-gray-900 text-xs sm:text-sm block leading-snug break-words">{serviceName || 'RTS Public Service'}</span>
            <span className="text-[11px] text-gray-500 font-medium block break-words mt-0.5">{departmentName || getUlbDataFromCookies().ulbName || 'Municipal Corporation'}</span>
          </div>

          {(customerName || customerMobile) && (
            <div className="pt-2.5 border-t border-gray-100 grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              {customerName && (
                <div>
                  <span className="text-[10px] text-gray-400 block font-medium">Applicant / अर्जदार:</span>
                  <span className="font-bold text-gray-800 break-words block">{customerName}</span>
                </div>
              )}
              {customerMobile && (
                <div>
                  <span className="text-[10px] text-gray-400 block font-medium">Mobile / मोबाईल:</span>
                  <span className="font-mono font-semibold text-gray-800 block">{customerMobile}</span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Fee Itemization Card */}
        <div className="p-4 rounded-xl bg-blue-50/70 border border-blue-100/90 space-y-2 text-xs">
          <div className="flex justify-between text-gray-600">
            <span>Government Service Fee / शासकीय शुल्क:</span>
            <span className="font-semibold text-gray-900 font-mono">₹{Number(displayFee).toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-gray-600">
            <span>Portal Convenience Fee / पोर्टल शुल्क:</span>
            <span className="font-medium text-emerald-600 font-mono">₹0.00 (मोफत)</span>
          </div>
          <div className="flex justify-between items-center pt-2 border-t border-blue-200/80 text-xs sm:text-sm font-bold text-gray-900">
            <span>Total Payable Amount / एकूण देय रक्कम:</span>
            <span className="text-base sm:text-lg text-blue-900 font-black font-mono">₹{Number(displayFee).toFixed(2)}</span>
          </div>
        </div>

        {/* Error Notice */}
        {errorMessage && (
          <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl flex items-start gap-2 text-xs text-rose-700 break-words">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-600" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Security Guarantee */}
        <div className="flex items-center justify-center gap-1.5 text-[10px] text-gray-400 font-medium text-center pt-1">
          <Lock className="w-3 h-3 text-blue-700 shrink-0" />
          <span>UPI • Cards • NetBanking • 256-bit Bank Grade Security</span>
        </div>
      </div>
    </Modal>
  );
};
