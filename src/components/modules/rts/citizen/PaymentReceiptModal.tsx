'use client';

import React from 'react';
import { Printer, Building2 } from 'lucide-react';
import { Modal, Button } from '@/components/common';
import type { PaymentReceiptResult } from '@/lib/api/rts/rtspayment.service';
import { RTSPaymentReceipt, printReceiptElement } from './RTSPaymentReceipt';

interface PaymentReceiptModalProps {
  receipt: PaymentReceiptResult;
  onClose: () => void;
}

export const PaymentReceiptModal: React.FC<PaymentReceiptModalProps> = ({ receipt, onClose }) => {
  const handlePrint = () => {
    printReceiptElement(receipt);
  };

  return (
    <Modal
      open={true}
      onClose={onClose}
      maxWidth="xl"
      title={
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-[#143D7D] text-white flex items-center justify-center shrink-0 shadow-sm">
            <Building2 className="w-4 h-4" />
          </div>
          <span className="font-bold text-gray-800 text-base">Official Payment Receipt / शासकीय ई-पावती</span>
        </div>
      }
      subtitle={`Receipt No: ${receipt.receiptNo || 'N/A'} • Application No: ${receipt.applicationNo || 'N/A'}`}
      footer={
        <div className="flex items-center justify-between w-full">
          <Button
            type="button"
            variant="secondary"
            onClick={onClose}
          >
            Close / बंद करा
          </Button>
          <Button
            type="button"
            variant="primary"
            onClick={handlePrint}
            icon={Printer}
            className="bg-[#143D7D] hover:bg-[#0f2e5e] text-white font-bold cursor-pointer"
          >
            Print Receipt / पावती प्रिंट करा
          </Button>
        </div>
      }
    >
      <div className="w-full">
        <RTSPaymentReceipt receipt={receipt} showActions={false} onPrint={handlePrint} />
      </div>
    </Modal>
  );
};
