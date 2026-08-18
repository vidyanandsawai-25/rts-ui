'use client';

import React from 'react';
import { Printer, Building2 } from 'lucide-react';
import { Modal, Button } from '@/components/common';
import type { PaymentReceiptResult } from '@/lib/api/rts/rtspayment.service';
import { RTSPaymentReceipt } from './RTSPaymentReceipt';

interface PaymentReceiptModalProps {
  receipt: PaymentReceiptResult;
  onClose: () => void;
}

export const PaymentReceiptModal: React.FC<PaymentReceiptModalProps> = ({ receipt, onClose }) => {
  const handlePrint = () => {
    window.print();
  };

  return (
    <Modal
      open={true}
      onClose={onClose}
      maxWidth="lg"
      title={
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-blue-900 text-white flex items-center justify-center shrink-0">
            <Building2 className="w-4 h-4" />
          </div>
          <span className="font-bold text-gray-800 text-base">Official Payment Receipt / शासकीय ई-पावती</span>
        </div>
      }
      subtitle={`Receipt No: ${receipt.receiptNo} • Application No: ${receipt.applicationNo}`}
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
            className="bg-blue-900 hover:bg-blue-950 text-white font-bold"
          >
            Print Receipt / पावती प्रिंट करा
          </Button>
        </div>
      }
    >
      <div className="w-full">
        <RTSPaymentReceipt receipt={receipt} showActions={false} />
      </div>
    </Modal>
  );
};
