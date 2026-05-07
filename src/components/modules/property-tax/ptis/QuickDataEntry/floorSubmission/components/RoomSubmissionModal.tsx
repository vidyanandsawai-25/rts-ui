'use client';

import React from 'react';
import { Button } from '@/components/common';

interface RoomSubmissionModalProps {
  show: boolean;
  onClose: () => void;
  t: {
    (key: string, values?: Record<string, string | number>): string;
    rich: (key: string, values?: Record<string, string | number | Date | ((chunks: React.ReactNode) => React.ReactNode)>) => React.ReactNode;
  };
}

const RoomSubmissionModal: React.FC<RoomSubmissionModalProps> = ({ show, onClose, t }) => {
  if (!show) return null;

  return (
    <div 
      className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50 flex items-center justify-center"
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-lg shadow-xl p-6 max-w-lg mx-4"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start gap-3 mb-4">
          <div className="flex-shrink-0 w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center">
            <svg className="w-6 h-6 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900 mb-1">
              {t('floor.roomSubmission.comingSoonTitle')}
            </h3>
            <p className="text-sm text-gray-600">
              {t('floor.roomSubmission.comingSoonDescription')}
            </p>
          </div>
        </div>
        
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
          <p className="text-sm font-medium text-blue-900 mb-2">{t('floor.roomSubmission.whatYouCanDo')}</p>
          <ul className="text-sm text-blue-800 space-y-1">
            <li className="flex items-start">
              <span className="mr-2">•</span>
              <span>
                {t.rich('floor.roomSubmission.step1', {
                  strong: (chunks: React.ReactNode) => <strong>{chunks}</strong>
                })}
              </span>
            </li>
            <li className="flex items-start">
              <span className="mr-2">•</span>
              <span>
                {t.rich('floor.roomSubmission.step2', {
                  strong: (chunks: React.ReactNode) => <strong>{chunks}</strong>
                })}
              </span>
            </li>
            <li className="flex items-start">
              <span className="mr-2">•</span>
              <span>{t('floor.roomSubmission.step3')}</span>
            </li>
          </ul>
        </div>

        <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 mb-4">
          <p className="text-xs font-medium text-gray-700 mb-1">{t('floor.roomSubmission.plannedFeatures')}</p>
          <ul className="text-xs text-gray-600 space-y-0.5">
            <li>{t('floor.roomSubmission.feature1')}</li>
            <li>{t('floor.roomSubmission.feature2')}</li>
            <li>{t('floor.roomSubmission.feature3')}</li>
          </ul>
        </div>

        <Button
          onClick={onClose}
          className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors font-medium"
        >
          {t('floor.roomSubmission.continueButton')}
        </Button>
      </div>
    </div>
  );
};

export default RoomSubmissionModal;
