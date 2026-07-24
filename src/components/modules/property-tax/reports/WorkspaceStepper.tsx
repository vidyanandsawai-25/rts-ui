'use client';

import { Check } from 'lucide-react';
import { Card } from '@/components/common';
import type { ReportWorkspaceCopy } from '@/types/report.types';
import type { Step } from './ReportWorkspaceConfig';

interface StepperProps {
  currentStep: Step;
  copy: ReportWorkspaceCopy;
}

export function Stepper({ currentStep, copy }: StepperProps) {
  const steps = [
    { label: copy.steps.selectCategory },
    { label: copy.steps.selectReport },
    { label: copy.steps.setParameters },
    { label: copy.steps.generateReport },
  ];
  return (
    <Card padding="none" className="rounded-xl px-4 py-2.5 shadow-sm border border-gray-100">
      <div className="flex items-center w-full">
        {steps.map((step, idx) => {
          const stepNum = (idx + 1) as Step;
          const isDone = stepNum < currentStep;
          const isActive = stepNum === currentStep;
          return (
            <div key={stepNum} className="flex items-center flex-1 last:flex-none">
              <div className="flex items-center gap-1.5 min-w-0">
                <div className={`flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold border-2 transition-all duration-300
                  ${isDone ? 'bg-green-500 border-green-500 text-white' : ''}
                  ${isActive ? 'bg-[#004c8c] border-[#004c8c] text-white shadow-md shadow-blue-100' : ''}
                  ${!isDone && !isActive ? 'bg-white border-gray-300 text-gray-400' : ''}
                `}>
                  {isDone ? <Check className="w-3 h-3" /> : stepNum}
                </div>
                <div className="min-w-0">
                  <p className={`text-[11px] font-semibold leading-tight truncate ${isActive ? 'text-[#004c8c]' : isDone ? 'text-green-600' : 'text-gray-400'}`}>
                    {step.label}
                  </p>
                </div>
              </div>
              {idx < steps.length - 1 && (
                <div className="flex-1 mx-3">
                  <div className={`h-0.5 rounded-full transition-all duration-500 ${isDone ? 'bg-green-400' : 'bg-gray-200'}`} />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </Card>
  );
}
