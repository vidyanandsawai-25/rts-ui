import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import type { ReactNode } from 'react';
import { Navbar } from '@/components/layout/home/Navbar';

// Mock next-intl
vi.mock('next-intl', () => ({
  useTranslations: () => (key: string) => {
    const translations: Record<string, string> = {
      'app.defaultUlbName': 'Default Municipality',
      'app.welcome': 'Welcome,',
      'app.defaultUser': 'User',
      'app.welcomeTo': 'Welcome to Default Municipality',
      'app.smartGovernance': 'Smart Governance Portal',
      'navigation.settings': 'Settings',
      'actions.logout': 'Logout',
    };
    return translations[key] || key;
  },
  useLocale: () => 'en',
}));

// Mock next/link
vi.mock('next/link', () => ({
  default: ({ children, href }: { children: ReactNode; href: string }) => (
    <a href={href}>{children}</a>
  ),
}));

// Mock useHeaderState hook
const mockHandleLogout = vi.fn();
const mockSetShowProfileDropdown = vi.fn();
vi.mock('@/hooks/useHeaderState', () => ({
  useHeaderState: () => ({
    handleLogout: mockHandleLogout,
    showProfileDropdown: false,
    setShowProfileDropdown: mockSetShowProfileDropdown,
    isLoggingOut: false,
  }),
}));

// Mock UserProfilePopup
vi.mock('@/components/layout/home/UserProfilePopup', () => ({
  UserProfilePopup: ({ isOpen }: { isOpen: boolean }) => 
    isOpen ? <div data-testid="user-profile-popup">Profile Popup</div> : null,
}));

describe('Navbar Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders navigation bar', () => {
    render(<Navbar />);
    const nav = screen.getByRole('navigation');
    expect(nav).toBeInTheDocument();
  });

  it('displays settings link', () => {
    render(<Navbar />);
    expect(screen.getByText('Settings')).toBeInTheDocument();
  });

  it('settings link points to correct URL', () => {
    render(<Navbar />);
    const settingsLink = screen.getByText('Settings').closest('a');
    expect(settingsLink).toHaveAttribute('href', '/en/configuration-settings/office-master');
  });

  it('displays provided username', () => {
    render(<Navbar username="John Doe" />);
    expect(screen.getByText('John Doe')).toBeInTheDocument();
  });

  it('displays default user when username not provided', () => {
    render(<Navbar />);
    expect(screen.getByText('User')).toBeInTheDocument();
  });

  it('displays welcome text', () => {
    render(<Navbar username="Test User" />);
    expect(screen.getByText('Welcome,')).toBeInTheDocument();
  });

  it('renders logout button', () => {
    render(<Navbar />);
    expect(screen.getByText('Logout')).toBeInTheDocument();
  });

  it('calls handleLogout when logout button is clicked', () => {
    render(<Navbar />);
    const logoutButton = screen.getByText('Logout');
    fireEvent.click(logoutButton);
    expect(mockHandleLogout).toHaveBeenCalledTimes(1);
  });

  it('toggles profile dropdown when user button is clicked', () => {
    render(<Navbar username="Test" />);
    const userButton = screen.getByRole('button', { name: /Welcome/ });
    fireEvent.click(userButton);
    expect(mockSetShowProfileDropdown).toHaveBeenCalledWith(true);
  });

  it('applies correct styling to navbar', () => {
    render(<Navbar />);
    const nav = screen.getByRole('navigation');
    expect(nav).toHaveClass('bg-[#004c8c]', 'text-white');
  });

  it('displays animated welcome message', () => {
    render(<Navbar ulbName="Test City" />);
    expect(screen.getByText(/Welcome to/)).toBeInTheDocument();
    expect(screen.getByText(/Smart Governance Portal/)).toBeInTheDocument();
  });
});
