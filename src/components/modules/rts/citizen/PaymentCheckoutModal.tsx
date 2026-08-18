'use client';

import React, { useState, useEffect } from 'react';
import {
  X,
  CreditCard,
  ShieldCheck,
  Lock,
  Loader2,
  AlertCircle,
  Phone,
  Mail,
  User
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
  customerEmail?: string;
  onClose: () => void;
  onSuccess?: (receipt: PaymentReceiptResult) => void;
}

export const PaymentCheckoutModal: React.FC<PaymentCheckoutModalProps> = ({
  applicationId,
  applicationNo,
  serviceName,
  departmentName,
  fees,
  customerName: initialName = '',
  customerMobile: initialMobile = '',
  customerEmail: initialEmail = '',
  onClose,
  onSuccess
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [receiptData, setReceiptData] = useState<PaymentReceiptResult | null>(null);
  const [sdkReady, setSdkReady] = useState(false);

  // Applicant Contact state with automatic dummy email fallback
  const fallbackEmail = initialEmail.trim() || (initialMobile.trim() ? `${initialMobile.trim()}@citizen.akolamc.org` : `citizen_${applicationNo || applicationId}@citizen.akolamc.org`);
  const [applicantName, setApplicantName] = useState(initialName);
  const [applicantMobile, setApplicantMobile] = useState(initialMobile);
  const [applicantEmail, setApplicantEmail] = useState(fallbackEmail);

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
      const finalEmail = applicantEmail.trim() || fallbackEmail;
      const finalMobile = applicantMobile.trim() || initialMobile || '9876543210';
      const finalName = applicantName.trim() || initialName || 'Citizen Applicant';

      // Step 1: Create Order dynamically via Backend API
      const orderRes = await createPaymentOrderAction({
        applicationId,
        paymentGateway: 'Razorpay',
        customerName: finalName,
        mobileNo: finalMobile,
        email: finalEmail
      });

      if (!orderRes.success || !orderRes.data) {
        throw new Error(orderRes.error || 'Failed to initiate payment order.');
      }

      const order: PaymentOrderResult = orderRes.data;

      // Step 2: Open Razorpay Live/Test Modal dynamically using server response
      if (typeof window !== 'undefined' && window.Razorpay) {
        const options = {
          key: order.keyId,
          amount: order.amountInPaise,
          currency: order.currency || 'INR',
          name: order.departmentName || 'Akola Municipal Corporation',
          description: order.description || `Government Fee for ${order.serviceName}`,
          order_id: order.gatewayOrderId,
          handler: async function (response: any) {
            setIsLoading(true);
            try {
              const verifyRes = await verifyPaymentAction({
                applicationId: order.applicationId,
                gatewayOrderId: response.razorpay_order_id || order.gatewayOrderId,
                gatewayPaymentId: response.razorpay_payment_id,
                gatewaySignature: response.razorpay_signature,
                paymentMode: response.method || 'Razorpay Online'
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
            name: finalName,
            email: finalEmail,
            contact: finalMobile
          },
          theme: {
            color: '#0d9488'
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/65 backdrop-blur-sm animate-in fade-in duration-200 overflow-y-auto">
      <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl overflow-hidden border border-slate-100 my-6">

        {/* Header */}
        <div className="bg-gradient-to-r from-teal-600 via-emerald-600 to-teal-700 px-6 py-4 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 bg-white/20 rounded-lg backdrop-blur-sm">
              <CreditCard className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-bold text-lg leading-tight">Government Fee Payment</h3>
              <p className="text-teal-100 text-xs font-medium">शासकीय शुल्क भरणा पोर्टल</p>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={isLoading}
            className="p-1.5 rounded-full text-white/80 hover:text-white hover:bg-white/20 transition-colors disabled:opacity-50 cursor-pointer"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-6 space-y-4">

          {/* Application Summary Box */}
          <div className="bg-gradient-to-br from-slate-50 to-teal-50/30 p-3.5 rounded-xl border border-slate-200/90">
            <div className="flex items-center justify-between text-xs text-slate-500 font-medium mb-1">
              <span>Application No. / अर्ज क्र.</span>
              <span className="font-bold text-slate-800 text-sm font-mono">{applicationNo || `APP#${applicationId}`}</span>
            </div>
            <div className="text-sm font-bold text-slate-800 line-clamp-1">{serviceName || 'RTS Public Service'}</div>
            <div className="text-xs text-slate-500">{departmentName || 'Right to Service Portal'}</div>
          </div>

          {/* Citizen Contact Confirmation Section */}
          <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-2.5">
            <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block">
              Applicant Contact Details / अर्जदाराचा संपर्क
            </span>

            <div className="space-y-2 text-xs">
              <div>
                <label className="text-[10px] font-semibold text-slate-500 block mb-0.5">Applicant Name / नाव:</label>
                <div className="relative">
                  <User className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-slate-400" />
                  <input
                    type="text"
                    value={applicantName}
                    onChange={(e) => setApplicantName(e.target.value)}
                    placeholder="Applicant Full Name"
                    className="w-full pl-8 pr-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-medium focus:ring-2 focus:ring-teal-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] font-semibold text-slate-500 block mb-0.5">Mobile No / मोबाईल:</label>
                  <div className="relative">
                    <Phone className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-slate-400" />
                    <input
                      type="tel"
                      value={applicantMobile}
                      onChange={(e) => setApplicantMobile(e.target.value)}
                      placeholder="9876543210"
                      className="w-full pl-8 pr-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-mono font-medium focus:ring-2 focus:ring-teal-500 focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[10px] font-semibold text-slate-500 block mb-0.5">Email / ईमेल:</label>
                  <div className="relative">
                    <Mail className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-slate-400" />
                    <input
                      type="email"
                      value={applicantEmail}
                      onChange={(e) => setApplicantEmail(e.target.value)}
                      placeholder="name@example.com"
                      className="w-full pl-8 pr-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-mono font-medium focus:ring-2 focus:ring-teal-500 focus:outline-none truncate"
                    />
                  </div>
                </div>
              </div>
            </div>
            <p className="text-[10px] text-slate-400">
              * ओटीपी आणि पावती पाठवण्यासाठी हे तपशील वापरले जातील.
            </p>
          </div>

          {/* Gateway Information Badge */}
          <div className="p-2.5 rounded-xl border border-teal-200 bg-teal-50/50 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-1 rounded-lg bg-teal-600 text-white">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <div>
                <span className="font-bold text-xs text-slate-800 block">Secure Payment Gateway</span>
                <span className="text-[10px] text-slate-500">UPI, QR Code, Credit/Debit Cards, NetBanking</span>
              </div>
            </div>
            <span className="text-[9px] font-bold uppercase tracking-wider text-teal-800 bg-teal-200/70 px-2 py-0.5 rounded-full">
              RBI Approved
            </span>
          </div>

          {/* Fee Calculation Breakdown */}
          <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-100 space-y-1.5 text-xs">
            <div className="flex justify-between text-slate-600">
              <span>Government Service Fee / शासकीय शुल्क:</span>
              <span className="font-semibold text-slate-800">₹{Number(displayFee).toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-slate-600">
              <span>Portal Convenience Fee / पोर्टल शुल्क:</span>
              <span className="font-semibold text-emerald-600">₹0.00 (मोफत)</span>
            </div>
            <div className="flex justify-between items-center pt-2 border-t border-slate-200 text-sm font-bold text-slate-900">
              <span>Total Payable Amount / एकूण देय रक्कम:</span>
              <span className="text-lg text-teal-700 font-extrabold">₹{Number(displayFee).toFixed(2)}</span>
            </div>
          </div>

          {/* Error Notice */}
          {errorMessage && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl flex items-start gap-2.5 text-xs text-rose-700">
              <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5 text-rose-600" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Action Button */}
          <button
            type="button"
            onClick={handleProceedPayment}
            disabled={isLoading || !sdkReady}
            className="w-full py-3.5 px-4 bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 text-white font-bold text-sm rounded-xl shadow-lg shadow-teal-600/25 transition-all flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Processing with Payment Gateway... / प्रतीक्षा करा</span>
              </>
            ) : (
              <>
                <ShieldCheck className="w-4 h-4" />
                <span>Pay ₹{Number(displayFee).toFixed(2)} Securely / शुल्क भरा</span>
              </>
            )}
          </button>

          {/* Security Badge */}
          <div className="flex items-center justify-center gap-2 text-[10px] text-slate-400 font-medium pt-0.5">
            <Lock className="w-3 h-3 text-teal-600" />
            <span>256-bit SSL Cryptographic Security • PCI-DSS Certified</span>
          </div>

        </div>

      </div>
    </div>
  );
};
