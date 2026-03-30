'use client';

import { useEffect } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { AlertCircle } from 'lucide-react';
import { Button, Card, CardContent, PageContainer } from '@/components/common';

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function Error({ error, reset }: ErrorProps) {
  const t = useTranslations('construction.constructionType.error');
  const locale = useLocale();

  useEffect(() => {
    // Log the error to an error reporting service
    console.error('Construction type page error:', error);
  }, [error]);

  return (
    <PageContainer>
      <div className="flex items-center justify-center min-h-[60vh]">
        <Card className="w-full max-w-lg">
          <CardContent className="p-8">
            <div className="flex flex-col items-center text-center space-y-4">
              {/* Error Icon */}
              <div className="rounded-full bg-red-100 p-3">
                <AlertCircle className="h-8 w-8 text-red-600" />
              </div>

              {/* Error Title */}
              <h2 className="text-2xl font-semibold text-gray-900">
                {t('title')}
              </h2>

              {/* Error Description */}
              <p className="text-gray-600">
                {t('description')}
              </p>

              {/* Error Details (development only) */}
              {process.env.NODE_ENV === 'development' && (
                <div className="w-full mt-4 p-4 bg-gray-100 rounded-md text-left">
                  <p className="text-sm font-mono text-gray-800 break-words">
                    {error.message}
                  </p>
                  {error.digest && (
                    <p className="text-xs text-gray-600 mt-2">
                      {t('errorId', { id: error.digest })}
                    </p>
                  )}
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex gap-3 mt-6">
                <Button
                  variant="secondary"
                  onClick={() => window.location.href = `/${locale}`}
                >
                  {t('goHome')}
                </Button>
                <Button onClick={reset}>
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
