'use client';

import { ErrorPage } from '@/components/common';
import { AlertTriangle, Wifi, RefreshCw } from 'lucide-react';
import { Card, CardContent } from '@/components/common/Card';
import { PageContainer } from '@/components/common/PageContainer';
import { Button } from '@/components/common/ActionButton';
import { useTranslations } from 'next-intl';

interface AppartmentQCErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function AppartmentQCError({ error, reset }: AppartmentQCErrorProps) {
  const t = useTranslations('ptis.error');
  const tNetwork = useTranslations('ptis.error.networkError');

  // Check if this is a network-related error
  const isNetworkError = 
    error.message.includes('Network Error') ||
    error.message.includes('fetch failed') ||
    error.message.includes('Failed to fetch') ||
    error.message.includes('Unable to connect') ||
    error.message.includes('Connection refused');

  // If it's a network error, show a custom network error page
  if (isNetworkError) {
    return (
      <PageContainer>
        <div className="flex items-center justify-center min-h-[60vh]">
          <Card className="w-full max-w-2xl">
            <CardContent className="p-8">
              <div className="flex flex-col items-center text-center space-y-4">
                {/* Network Error Icon */}
                <div className="rounded-full bg-orange-100 p-3">
                  <Wifi className="h-8 w-8 text-orange-600" />
                </div>

                {/* Error Title */}
                <h2 className="text-2xl font-semibold text-gray-900">
                  {tNetwork('title')}
                </h2>

                {/* Error Description */}
                <p className="text-gray-600">
                  {tNetwork('description')}
                </p>

                {/* Troubleshooting Steps */}
                <div className="w-full mt-6 p-6 bg-blue-50 rounded-lg text-left border border-blue-200">
                  <div className="flex items-start gap-3 mb-3">
                    <AlertTriangle className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900 mb-3">{tNetwork('troubleshooting')}</h3>
                      <ul className="space-y-2 text-sm text-gray-700">
                        <li className="flex items-start gap-2">
                          <span className="font-medium min-w-[20px]">1.</span>
                          <span>{tNetwork('step1')}</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="font-medium min-w-[20px]">2.</span>
                          <span>{tNetwork('step2')}</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="font-medium min-w-[20px]">3.</span>
                          <span>{tNetwork('step3')}</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="font-medium min-w-[20px]">4.</span>
                          <span>{tNetwork('step4')}</span>
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>

                {/* Error Details (development only) */}
                {process.env.NODE_ENV === 'development' && (
                  <div className="w-full mt-4 p-4 bg-gray-100 rounded-md text-left">
                    <p className="text-xs font-semibold text-gray-600 mb-2">{tNetwork('errorDetails')}</p>
                    <p className="text-sm font-mono text-gray-800 break-words">
                      {error.message}
                    </p>
                    {error.digest && (
                      <p className="text-xs text-gray-600 mt-2">
                        {tNetwork('errorId')} {error.digest}
                      </p>
                    )}
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex gap-3 mt-6">
                  <Button
                    variant="secondary"
                    onClick={() => window.location.href = '/'}
                  >
                    {t('goHome')}
                  </Button>
                  <Button onClick={reset} className="flex items-center gap-2">
                    <RefreshCw className="h-4 w-4" />
                    {t('tryAgain')}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </PageContainer>
    );
  }

  // For other errors, use the default error page
  return <ErrorPage error={error} reset={reset} translationNamespace="ptis.error" />;
}
