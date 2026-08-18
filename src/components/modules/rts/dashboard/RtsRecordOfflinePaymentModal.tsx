'use client';

import React, { useState } from 'react';
import { IndianRupee, Receipt, AlertCircle, CreditCard } from 'lucide-react';
import { Modal, Button, Input, TextArea, Label } from '@/components/common';
import { recordOfflinePaymentAction } from '@/app/[locale]/service/payment/actions';
import type { PaymentReceiptResult } from '@/lib/api/rts/rtspayment.service';

interface RtsRecordOfflinePaymentModalProps {
  open: boolean;
  onClose: () => void;
  applicationId: number;
  applicationNo: string;
  serviceName?: string;
  serviceFees?: number | null;
  applicantName?: string;
  onSuccess: (receipt: PaymentReceiptResult) => void;
}

const PAYMENT_MODES = [
  { value: 'Cash', label: 'रोख (Cash)' },
  { value: 'Cheque', label: 'धनादेश (Cheque)' },
  { value: 'DD', label: 'डिमांड ड्राफ्ट (Demand Draft)' },
  { value: 'POS', label: 'POS कार्ड स्वाइप (Card / POS)' },
  { value: 'Challan', label: 'बँक चलन (Bank Challan)' },
  { value: 'Other', label: 'इतर (Other Offline Mode)' },
];

export const RtsRecordOfflinePaymentModal: React.FC<RtsRecordOfflinePaymentModalProps> = ({
  open,
  onClose,
  applicationId,
  applicationNo,
  serviceName,
  serviceFees,
  applicantName,
  onSuccess,
}) => {
  const defaultAmount = typeof serviceFees === 'number' && serviceFees > 0 ? serviceFees : 50;
  const [paymentMode, setPaymentMode] = useState<string>('Cash');
  const [amount, setAmount] = useState<number>(defaultAmount);
  const [instrumentNo, setInstrumentNo] = useState<string>('');
  const [instrumentDate, setInstrumentDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [bankName, setBankName] = useState<string>('');
  const [remarks, setRemarks] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!open) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (amount <= 0) {
      setErrorMessage('कृपया वैध शुल्क रक्कम टाका.');
      return;
    }

    if (paymentMode !== 'Cash' && !instrumentNo.trim()) {
      setErrorMessage(`${paymentMode} साठी क्रमांक (Cheque / DD / Slip No) आवश्यक आहे.`);
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await recordOfflinePaymentAction({
        applicationId,
        paymentMode,
        amount,
        instrumentNo: instrumentNo.trim() || undefined,
        instrumentDate: paymentMode !== 'Cash' ? instrumentDate : undefined,
        bankName: bankName.trim() || undefined,
        remarks: remarks.trim() || undefined,
      });

      if (res.success && res.data) {
        onSuccess(res.data);
      } else {
        setErrorMessage(res.error || 'ऑफलाइन शुल्क नोंदणी अयशस्वी झाली.');
      }
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : 'ऑफलाइन शुल्क नोंदणी अयशस्वी झाली.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      maxWidth="md"
      title={
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-emerald-700 text-white flex items-center justify-center shrink-0 shadow-sm">
            <IndianRupee className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-bold text-slate-900 text-base">Record Counter Payment / ऑफलाइन शुल्क नोंदणी</h3>
            <p className="text-xs text-slate-500 font-medium">नागरी सुविधा केंद्र (CFC) / काऊंटर शुल्क स्वीकृती</p>
          </div>
        </div>
      }
      footer={
        <div className="flex items-center justify-between w-full">
          <Button
            type="button"
            variant="secondary"
            onClick={onClose}
            disabled={isSubmitting}
          >
            रद्द करा (Cancel)
          </Button>
          <Button
            type="button"
            variant="primary"
            onClick={handleSubmit}
            disabled={isSubmitting}
            icon={Receipt}
            className="bg-emerald-700 hover:bg-emerald-800 text-white font-bold"
          >
            {isSubmitting ? 'नोंद होत आहे...' : 'शुल्क स्वीकारा व पावती द्या'}
          </Button>
        </div>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4 py-1">
        {/* Application Info Card */}
        <div className="rounded-xl border border-blue-100 bg-gradient-to-br from-blue-50/80 to-slate-50 p-3.5 text-xs text-slate-700">
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
            <div>
              <span className="text-slate-500 font-medium block">अर्ज क्रमांक (App No)</span>
              <span className="font-extrabold text-blue-900">{applicationNo}</span>
            </div>
            {serviceName && (
              <div>
                <span className="text-slate-500 font-medium block">सेवा (Service)</span>
                <span className="font-bold text-slate-800 truncate block" title={serviceName}>{serviceName}</span>
              </div>
            )}
            {applicantName && (
              <div>
                <span className="text-slate-500 font-medium block">अर्जदार (Applicant)</span>
                <span className="font-bold text-slate-800">{applicantName}</span>
              </div>
            )}
          </div>
        </div>

        {errorMessage && (
          <div className="rounded-lg border border-rose-200 bg-rose-50 p-3 text-xs font-semibold text-rose-700 flex items-center gap-2">
            <AlertCircle className="h-4 w-4 shrink-0 text-rose-600" />
            <span>{errorMessage}</span>
          </div>
        )}

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {/* Payment Mode */}
          <div>
            <Label className="mb-1 block text-xs font-bold text-slate-700">
              पेमेंट प्रकार (Payment Mode) <span className="text-rose-500">*</span>
            </Label>
            <select
              value={paymentMode}
              onChange={(e) => setPaymentMode(e.target.value)}
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-medium text-slate-800 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              {PAYMENT_MODES.map((mode) => (
                <option key={mode.value} value={mode.value}>
                  {mode.label}
                </option>
              ))}
            </select>
          </div>

          {/* Amount */}
          <div>
            <Label className="mb-1 block text-xs font-bold text-slate-700">
              शुल्क रक्कम (Amount ₹) <span className="text-rose-500">*</span>
            </Label>
            <Input
              type="number"
              min={1}
              step={1}
              value={amount.toString()}
              onChange={(e) => setAmount(Number(e.target.value))}
              placeholder="रक्कम टाका"
              className="text-xs font-bold text-emerald-800"
            />
          </div>
        </div>

        {/* Conditional Instrument Fields */}
        {paymentMode !== 'Cash' && (
          <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-3.5 space-y-3">
            <h4 className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
              <CreditCard className="w-3.5 h-3.5 text-blue-600" />
              <span>{paymentMode} तपशील (Instrument Details)</span>
            </h4>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              <div>
                <Label className="mb-1 block text-[11px] font-semibold text-slate-600">
                  {paymentMode === 'Cheque' ? 'धनादेश क्र. (Cheque No.)' : paymentMode === 'DD' ? 'डीडी क्र. (DD No.)' : 'चलन / ट्रान्झॅक्शन क्र.'} <span className="text-rose-500">*</span>
                </Label>
                <Input
                  value={instrumentNo}
                  onChange={(e) => setInstrumentNo(e.target.value)}
                  placeholder="उदा. 482910"
                  className="text-xs"
                />
              </div>

              <div>
                <Label className="mb-1 block text-[11px] font-semibold text-slate-600">
                  दिनांक (Date)
                </Label>
                <Input
                  type="date"
                  value={instrumentDate}
                  onChange={(e) => setInstrumentDate(e.target.value)}
                  className="text-xs"
                />
              </div>

              <div>
                <Label className="mb-1 block text-[11px] font-semibold text-slate-600">
                  बँकेचे नाव (Bank Name)
                </Label>
                <Input
                  value={bankName}
                  onChange={(e) => setBankName(e.target.value)}
                  placeholder="उदा. SBI, Bank of Maharashtra"
                  className="text-xs"
                />
              </div>
            </div>
          </div>
        )}

        {/* Remarks */}
        <div>
          <Label className="mb-1 block text-xs font-bold text-slate-700">
            काऊंटर शेरा / टीप (Counter Officer Remark)
          </Label>
          <TextArea
            rows={2}
            value={remarks}
            onChange={(e) => setRemarks(e.target.value)}
            placeholder="उदा. काऊंटर क्र. २ वर रोख जमा केले..."
            className="text-xs"
          />
        </div>
      </form>
    </Modal>
  );
};
