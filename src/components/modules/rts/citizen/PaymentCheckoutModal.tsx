'use client';

import React, { useState, useEffect } from 'react';
import {
  X,
  ShieldCheck,
  Lock,
  Loader2,
  AlertCircle,
  Building2,
  ArrowRight
} from 'lucide-react';
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
  onSuccess
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [receiptData, setReceiptData] = useState<PaymentReceiptResult | null>(null);
  const [sdkReady, setSdkReady] = useState(false);

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

    try {
      // Step 1: Create Order dynamically via Backend API (Backend automatically resolves dynamic applicant name, mobile, email, fees)
      const orderRes = await createPaymentOrderAction({
        applicationId,
        paymentGateway: 'Razorpay'
      });

      if (!orderRes.success || !orderRes.data) {
        throw new Error(orderRes.error || 'Failed to initiate payment order.');
      }

      const order: PaymentOrderResult = orderRes.data;

      // Step 2: Open Razorpay Live Gateway Modal with fully dynamic prefill
      if (typeof window !== 'undefined' && window.Razorpay) {
        const options = {
          key: order.keyId,
          amount: order.amountInPaise,
          currency: order.currency || 'INR',
          name: 'Akola Municipal Corporation',
          description: order.description || `Government RTS Fee - ${order.serviceName}`,
          order_id: order.gatewayOrderId,
          handler: async function (response: any) {
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
              }
            } catch (vErr) {
              setErrorMessage(vErr instanceof Error ? vErr.message : 'Error verifying payment signature');
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
            }
          }
        };

        const rzp = new window.Razorpay(options);
        rzp.on('payment.failed', function (response: any) {
          setErrorMessage(response.error?.description || 'Transaction was declined or cancelled by the bank.');
          setIsLoading(false);
        });
        rzp.open();
      } else {
        throw new Error('Payment gateway SDK is not initialized. Please try refreshing the page.');
      }
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : 'An error occurred during payment processing.');
      setIsLoading(false);
    }
  };

  if (receiptData) {
    return <PaymentReceiptModal receipt={receiptData} onClose={onClose} />;
  }

  const displayFee = fees !== undefined && fees > 0 ? fees : 50;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-md animate-in fade-in duration-200 overflow-y-auto">
      <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-200/80 my-6">

        {/* Executive Header Banner */}
        <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-blue-950 px-6 py-5 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center text-white shrink-0">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-base leading-tight">Government Fee Payment</h3>
              <p className="text-blue-200 text-xs font-medium">अकोला महानगरपालिका • RTS Portal</p>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={isLoading}
            className="p-2 rounded-full text-white/70 hover:text-white hover:bg-white/10 transition-colors disabled:opacity-50 cursor-pointer"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-6 space-y-4">

          {/* Application Details Summary */}
          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-3">
            <div className="flex items-center justify-between pb-2.5 border-b border-slate-200 text-xs">
              <span className="text-slate-400 font-bold uppercase tracking-wider text-[10px]">Application / अर्ज क्र.</span>
              <span className="font-mono font-black text-blue-900 text-sm">{applicationNo || `APP#${applicationId}`}</span>
            </div>

            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Public Service / सेवा</span>
              <span className="font-bold text-slate-900 text-sm block leading-snug">{serviceName || 'RTS Public Service'}</span>
              <span className="text-xs text-slate-500 font-medium">{departmentName || 'Akola Municipal Corporation'}</span>
            </div>

            {(customerName || customerMobile) && (
              <div className="pt-2.5 border-t border-slate-200 grid grid-cols-2 gap-2 text-xs">
                {customerName && (
                  <div>
                    <span className="text-[10px] text-slate-400 block font-medium">Applicant / अर्जदार:</span>
                    <span className="font-bold text-slate-800 truncate block">{customerName}</span>
                  </div>
                )}
                {customerMobile && (
                  <div>
                    <span className="text-[10px] text-slate-400 block font-medium">Mobile / मोबाईल:</span>
                    <span className="font-mono font-semibold text-slate-800 block">{customerMobile}</span>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Fee Itemization */}
          <div className="p-4 rounded-2xl bg-blue-50/50 border border-blue-100 space-y-2 text-xs">
            <div className="flex justify-between text-slate-600">
              <span>Government Fee / शासकीय शुल्क:</span>
              <span className="font-semibold text-slate-900 font-mono">₹{Number(displayFee).toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-slate-600">
              <span>Gateway Charges / पोर्टल शुल्क:</span>
              <span className="font-medium text-emerald-600 font-mono">₹0.00 (मोफत)</span>
            </div>
            <div className="flex justify-between items-center pt-2.5 border-t border-blue-200/80 text-sm font-bold text-slate-900">
              <span>Total Payable / एकूण रक्कम:</span>
              <span className="text-xl text-blue-900 font-black font-mono">₹{Number(displayFee).toFixed(2)}</span>
            </div>
          </div>

          {/* Error Notice */}
          {errorMessage && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl flex items-start gap-2.5 text-xs text-rose-700">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-600" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Action Button */}
          <button
            type="button"
            onClick={handleProceedPayment}
            disabled={isLoading || !sdkReady}
            className="w-full py-4 px-5 bg-gradient-to-r from-blue-700 via-indigo-700 to-blue-800 hover:from-blue-800 hover:to-indigo-800 text-white font-bold text-sm rounded-2xl shadow-xl shadow-blue-900/20 transition-all flex items-center justify-center gap-2.5 disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>Connecting to Secure Gateway...</span>
              </>
            ) : (
              <>
                <ShieldCheck className="w-5 h-5" />
                <span>Pay ₹{Number(displayFee).toFixed(2)} Securely / शुल्क भरा</span>
                <ArrowRight className="w-4 h-4 ml-1" />
              </>
            )}
          </button>

          {/* Security Guarantee */}
          <div className="flex items-center justify-center gap-2 text-[10px] text-slate-400 font-medium">
            <Lock className="w-3.5 h-3.5 text-blue-600" />
            <span>UPI • Cards • NetBanking • 256-bit Bank Encryption</span>
          </div>

        </div>

      </div>
    </div>
  );
};
