import { render, screen, fireEvent } from '@testing-library/react';

// Mock next-intl hooks
vi.mock('next-intl', () => ({
  useTranslations: () => ((key: string) => {
    if (key === 'goHome') return 'Go Home';
    if (key === 'tryAgain') return 'Try Again';
    if (key === 'title') return 'Error Title';
    if (key === 'description') return 'Error Description';
    if (key === 'errorId') return 'Error ID: {id}';
    return key;
  }),
  useLocale: () => 'en',
}));

import ErrorPage from '../../../components/common/ErrorPage';

describe('ErrorPage', () => {
  const error = new Error('Test error message');
  const reset = vi.fn();

  it('renders translated title and description', () => {
    render(
      <ErrorPage error={error} reset={reset} translationNamespace="common.error" />
    );
    // These keys should be present in the translation mock or config
    expect(screen.getByText(/title/i)).toBeInTheDocument();
    expect(screen.getByText(/description/i)).toBeInTheDocument();
  });

  it('calls reset when Try Again is clicked', () => {
    render(
      <ErrorPage error={error} reset={reset} translationNamespace="common.error" />
    );
    const tryAgainButton = screen.getByRole('button', { name: /try again/i });
    fireEvent.click(tryAgainButton);
    expect(reset).toHaveBeenCalled();
  });
});
