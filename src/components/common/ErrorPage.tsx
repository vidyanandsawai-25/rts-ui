'use client';

import { useEffect, useMemo } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { AlertCircle } from 'lucide-react';
import { logger } from '@/lib/utils/logger';
import { Button } from './ActionButton';
import { Card, CardContent } from './Card';
import { PageContainer } from './PageContainer';

export interface ErrorPageProps {
  error: Error & { digest?: string };
  reset: () => void;
  /** Translation namespace for error messages. Defaults to 'common.error' */
  translationNamespace?: string;
  /** Custom home URL. Defaults to locale root */
  homeUrl?: string;
}

/**
 * Extracts a user-friendly error message from an API error.
 * Handles RFC 9110 problem details format and other common API error formats.
 */
function parseUserFriendlyError(errorMessage: string): { userMessage: string; technicalDetails?: string } {
  // Try to extract JSON from the error message
  const jsonMatch = errorMessage.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    // No JSON found, return the message as-is (but clean up common prefixes)
    const cleanMessage = errorMessage.replace(/^[^:]+:\s*/, '').replace(/\s*\(\d+\)$/, '');
    return { userMessage: cleanMessage || errorMessage };
  }

  try {
    const parsed = JSON.parse(jsonMatch[0]) as {
      title?: string;
      message?: string;
      errors?: Record<string, string[]>;
      detail?: string;
    };

    // Build user-friendly message from parsed API response
    const messages: string[] = [];

    // Use title or message as primary message
    if (parsed.title && parsed.title !== 'One or more validation errors occurred.') {
      messages.push(parsed.title);
    } else if (parsed.message) {
      messages.push(parsed.message);
    } else if (parsed.detail) {
      messages.push(parsed.detail);
    }

    // Extract validation errors in a readable format
    if (parsed.errors && typeof parsed.errors === 'object') {
      const errorMessages = Object.entries(parsed.errors)
        .flatMap(([field, fieldErrors]) => {
          if (Array.isArray(fieldErrors)) {
            return fieldErrors.map(e => `${field}: ${e}`);
          }
          return [];
        });
      messages.push(...errorMessages);
    }

    const userMessage = messages.length > 0 
      ? messages.join('. ') 
      : 'An unexpected error occurred. Please try again.';

    return {
      userMessage,
      technicalDetails: errorMessage,
    };
  } catch {
    // JSON parse failed, extract text before the JSON
    const prefix = errorMessage.substring(0, errorMessage.indexOf('{')).trim().replace(/:$/, '');
    return { 
      userMessage: prefix || 'An unexpected error occurred. Please try again.',
      technicalDetails: errorMessage,
    };
  }
}

/**
 * Reusable error page component for Next.js error boundaries.
 * 
 * @example
 * // In error.tsx file:
 * export default function Error({ error, reset }: ErrorProps) {
 *   return <ErrorPage error={error} reset={reset} />;
 * }
 * 
 * @example
 * // With custom translation namespace:
 * <ErrorPage 
 *   error={error} 
 *   reset={reset} 
 *   translationNamespace="construction.constructionType.error" 
 * />
 */
export function ErrorPage({ 
  error, 
  reset, 
  translationNamespace = 'common.error',
  homeUrl,
}: ErrorPageProps) {
  const t = useTranslations(translationNamespace);
  const locale = useLocale();
  const defaultHomeUrl = `/${locale}`;

  // Parse error message for user-friendly display
  const { userMessage, technicalDetails } = useMemo(
    () => parseUserFriendlyError(error.message),
    [error.message]
  );

  useEffect(() => {
    // Log the error to an error reporting service
    logger.error('Page error occurred', {
      error,
      digest: error.digest,
      namespace: translationNamespace,
    });
  }, [error, translationNamespace]);

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

              {/* User-friendly error message */}
              <div className="w-full mt-4 p-4 bg-gray-100 rounded-md text-left">
                <p className="text-sm text-gray-800 break-words">
                  {userMessage}
                </p>
                {error.digest && (
                  <p className="text-xs text-gray-500 mt-2">
                    {t('errorId', { id: error.digest })}
                  </p>
                )}
              </div>

              {/* Technical details (development only) */}
              {process.env.NODE_ENV === 'development' && technicalDetails && (
                <details className="w-full mt-2 text-left">
                  <summary className="text-xs text-gray-500 cursor-pointer hover:text-gray-700">
                    Technical Details
                  </summary>
                  <div className="mt-2 p-3 bg-gray-200 rounded text-xs font-mono text-gray-700 break-all overflow-auto max-h-40">
                    {technicalDetails}
                  </div>
                </details>
              )}

              {/* Action Buttons */}
              <div className="flex gap-3 mt-6">
                <Button
                  variant="secondary"
                  onClick={() => window.location.href = homeUrl || defaultHomeUrl}
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

export default ErrorPage;
