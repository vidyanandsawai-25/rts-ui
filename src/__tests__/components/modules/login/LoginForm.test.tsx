import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextIntlClientProvider } from 'next-intl';
import * as React from 'react';

import { LoginForm } from '@/components/modules/login/LoginForm';
import type { LoginFormCopy } from '@/types/login.types';
import enCommon from '@/i18n/locales/en/common.json';

const enCopy: LoginFormCopy = {
  loginTitle: String(enCommon.login.title),
  username: String(enCommon.login.username),
  usernamePlaceholder: String(enCommon.login.usernamePlaceholder),
  password: String(enCommon.login.password),
  passwordPlaceholder: String(enCommon.login.passwordPlaceholder),
  signIn: String(enCommon.login.signIn),
  showPassword: String(enCommon.login.showPassword),
  hidePassword: String(enCommon.login.hidePassword),
};

const { mockLoginAction } = vi.hoisted(() => ({
  mockLoginAction: vi.fn(),
}));

vi.mock('@/app/[locale]/login/actions', () => ({
  loginCredentialsFormAction: mockLoginAction,
}));

vi.mock('next/image', () => ({
  default: (props: React.ComponentProps<'img'> & Record<string, unknown>) => {
    const { unoptimized: _u, priority: _p, placeholder: _ph, blurDataURL: _b, fill: _f, loader: _l, ...rest } =
      props;
      // eslint-disable-next-line @next/next/no-img-element
    return <img {...rest} alt={props.alt ?? ''} />;
  },
}));

function renderWithIntl(ui: React.ReactElement) {
  return render(
    <NextIntlClientProvider locale="en" messages={{ common: enCommon as Record<string, unknown> }}>
      {ui}
    </NextIntlClientProvider>
  );
}

describe('LoginForm', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockLoginAction.mockResolvedValue(null);
  });

  it('renders without council headings when ulbData is omitted', () => {
    renderWithIntl(<LoginForm locale="en" copy={enCopy} />);
    expect(screen.queryByRole('heading', { level: 1 })).not.toBeInTheDocument();
    expect(screen.queryByRole('heading', { level: 2 })).not.toBeInTheDocument();
    expect(screen.getByText(String(enCommon.login.title))).toBeInTheDocument();
  });

  it('renders council name and local name from ulbData', () => {
    renderWithIntl(
      <LoginForm
        locale="en"
        copy={enCopy}
        ulbData={{
          id: 1,
          ulbCode: 'TMC',
          ulbName: 'Test Municipal Council',
          ulbNameLocal: 'परिक्षा',
          ulbTypeId: 1,
          isActive: true,
        }}
      />
    );
    expect(
      screen.getByRole('heading', { level: 1, name: 'Test Municipal Council' })
    ).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 2, name: 'परिक्षा' })).toBeInTheDocument();
  });

  it('renders logo image when ulbLogo is provided', () => {
    renderWithIntl(
      <LoginForm
        locale="en"
        copy={enCopy}
        ulbData={{
          id: 1,
          ulbCode: 'TMC',
          ulbName: 'Council With Logo',
          ulbTypeId: 1,
          isActive: true,
          ulbLogo: 'https://example.org/logo.png',
        }}
      />
    );
    const img = screen.getByRole('img', { name: /Council With Logo Logo/i });
    expect(img).toHaveAttribute('src', 'https://example.org/logo.png');
  });

  it('shows SSR errorMessage when provided', () => {
    renderWithIntl(<LoginForm locale="en" copy={enCopy} errorMessage="Session expired" />);
    expect(screen.getByText('Session expired')).toBeInTheDocument();
  });

  it('shows infoMessage when provided', () => {
    renderWithIntl(
      <LoginForm locale="en" copy={enCopy} infoMessage="Please check your email." />
    );
    expect(screen.getByText('Please check your email.')).toBeInTheDocument();
  });

  it('includes hidden locale field', () => {
    renderWithIntl(<LoginForm locale="mr" copy={enCopy} />);
    const localeInput = document.querySelector('input[name="locale"]') as HTMLInputElement;
    expect(localeInput).toBeTruthy();
    expect(localeInput.value).toBe('mr');
  });

  it('prefills username from props until action returns credential error', async () => {
    mockLoginAction.mockResolvedValue({
      message: 'INVALID_CREDENTIALS',
      resetKey: 'rk-1',
    });

    const user = userEvent.setup();
    renderWithIntl(<LoginForm locale="en" copy={enCopy} username="preuser" />);

    const usernameInput = screen.getByPlaceholderText(String(enCommon.login.usernamePlaceholder));
    expect(usernameInput).toHaveValue('preuser');

    await user.type(
      screen.getByPlaceholderText(String(enCommon.login.passwordPlaceholder)),
      'secret'
    );
    await user.click(screen.getByRole('button', { name: String(enCommon.login.signIn) }));

    await waitFor(() => {
      expect(
        screen.getByText(String(enCommon.login.errors.invalidCredentials))
      ).toBeInTheDocument();
    });

    expect(mockLoginAction).toHaveBeenCalled();
    const formData = mockLoginAction.mock.calls[0]?.[1] as FormData | undefined;
    expect(formData).toBeInstanceOf(FormData);
    expect((formData?.get('username') as string) || '').toBe('preuser');
    expect((formData?.get('password') as string) || '').toBe('secret');
    expect(formData?.get('locale')).toBe('en');
  });

  it('toggles password visibility when password is non-empty', async () => {
    const user = userEvent.setup();
    renderWithIntl(<LoginForm locale="en" copy={enCopy} />);

    const passwordInput = screen.getByPlaceholderText(String(enCommon.login.passwordPlaceholder));
    expect(
      screen.queryByRole('button', { name: String(enCommon.login.showPassword) })
    ).not.toBeInTheDocument();

    await user.type(passwordInput, 'x');
    const toggle = screen.getByRole('button', { name: String(enCommon.login.showPassword) });
    expect(passwordInput).toHaveAttribute('type', 'password');

    await user.click(toggle);
    expect(passwordInput).toHaveAttribute('type', 'text');
    expect(
      screen.getByRole('button', { name: String(enCommon.login.hidePassword) })
    ).toBeInTheDocument();
  });

  it('maps INVALID_CREDENTIALS from action state to translated message', async () => {
    mockLoginAction.mockResolvedValue({
      message: 'INVALID_CREDENTIALS',
      resetKey: 'rk-2',
    });

    const user = userEvent.setup();
    renderWithIntl(<LoginForm locale="en" copy={enCopy} />);

    await user.type(
      screen.getByPlaceholderText(String(enCommon.login.usernamePlaceholder)),
      'u12'
    );
    await user.type(screen.getByPlaceholderText(String(enCommon.login.passwordPlaceholder)), 'p1');
    await user.click(screen.getByRole('button', { name: String(enCommon.login.signIn) }));

    await waitFor(() => {
      expect(
        screen.getByText(String(enCommon.login.errors.invalidCredentials))
      ).toBeInTheDocument();
    });
  });

  it('maps CREDENTIALS_REQUIRED from action state to translated message', async () => {
    mockLoginAction.mockResolvedValue({
      message: 'CREDENTIALS_REQUIRED',
      resetKey: 'rk-3',
    });

    const user = userEvent.setup();
    renderWithIntl(<LoginForm locale="en" copy={enCopy} />);

    await user.type(
      screen.getByPlaceholderText(String(enCommon.login.usernamePlaceholder)),
      'abc'
    );
    await user.type(screen.getByPlaceholderText(String(enCommon.login.passwordPlaceholder)), 'x');
    await user.click(screen.getByRole('button', { name: String(enCommon.login.signIn) }));

    await waitFor(() => {
      expect(
        screen.getByText(String(enCommon.login.errors.credentialsRequired))
      ).toBeInTheDocument();
    });
  });

  it('maps SERVICE_UNAVAILABLE from action state to translated message', async () => {
    mockLoginAction.mockResolvedValue({
      message: 'SERVICE_UNAVAILABLE',
      resetKey: 'rk-4',
    });

    const user = userEvent.setup();
    renderWithIntl(<LoginForm locale="en" copy={enCopy} />);

    await user.type(
      screen.getByPlaceholderText(String(enCommon.login.usernamePlaceholder)),
      'abc'
    );
    await user.type(screen.getByPlaceholderText(String(enCommon.login.passwordPlaceholder)), 'x');
    await user.click(screen.getByRole('button', { name: String(enCommon.login.signIn) }));

    await waitFor(() => {
      expect(
        screen.getByText(String(enCommon.login.errors.serviceUnavailable))
      ).toBeInTheDocument();
    });
  });

  it('does not submit when username is shorter than minimum length (client validation)', async () => {
    const user = userEvent.setup();
    renderWithIntl(<LoginForm locale="en" copy={enCopy} />);

    await user.type(
      screen.getByPlaceholderText(String(enCommon.login.usernamePlaceholder)),
      'ab'
    );
    await user.type(screen.getByPlaceholderText(String(enCommon.login.passwordPlaceholder)), 'secret');
    await user.click(screen.getByRole('button', { name: String(enCommon.login.signIn) }));

    await waitFor(() => {
      expect(screen.getByText(String(enCommon.login.errors.USERNAME_TOO_SHORT))).toBeInTheDocument();
    });
    expect(mockLoginAction).not.toHaveBeenCalled();
  });

  it('strips disallowed characters from username input (sanitization)', async () => {
    const user = userEvent.setup();
    renderWithIntl(<LoginForm locale="en" copy={enCopy} />);

    const usernameInput = screen.getByPlaceholderText(
      String(enCommon.login.usernamePlaceholder)
    ) as HTMLInputElement;
    await user.type(usernameInput, 'a#b$c');

    expect(usernameInput).toHaveValue('abc');
  });

  it('clears password field after a failed sign-in (remount on new resetKey)', async () => {
    mockLoginAction.mockResolvedValue({
      message: 'INVALID_CREDENTIALS',
      resetKey: 'rk-pw',
    });

    const user = userEvent.setup();
    renderWithIntl(<LoginForm locale="en" copy={enCopy} username="uzer" />);

    const passwordInput = screen.getByPlaceholderText(
      String(enCommon.login.passwordPlaceholder)
    ) as HTMLInputElement;
    await user.type(passwordInput, 'hunter2');
    await user.click(screen.getByRole('button', { name: String(enCommon.login.signIn) }));

    await waitFor(() => {
      expect(
        screen.getByText(String(enCommon.login.errors.invalidCredentials))
      ).toBeInTheDocument();
    });
    expect(
      screen.getByPlaceholderText(String(enCommon.login.passwordPlaceholder)) as HTMLInputElement
    ).toHaveValue('');
  });
});
