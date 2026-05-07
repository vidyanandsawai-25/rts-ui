'use client';

import { useLocale, useTranslations } from "next-intl";
import Link from "next/link";
import { useHeaderState } from '@/hooks/useHeaderState';

import { Settings, User } from "lucide-react";

import { UserProfilePopup } from "./UserProfilePopup";
import { Button } from "@/components/common/ActionButton";

interface NavbarProps {
    username?: string;
    ulbName?: string;
}

export const Navbar = ({ username, ulbName }: NavbarProps) => {
    const t = useTranslations('common');
    const displayUlbName = ulbName || t('app.defaultUlbName');
    const locale = useLocale();
    const {
        handleLogout,
        showProfileDropdown,
        setShowProfileDropdown,
        isLoggingOut
    } = useHeaderState();

    return (
        <div className="w-full">
            {/* Navigation Bar */}
            <nav className="bg-[#004c8c] text-white flex justify-end items-center px-6 py-1 shadow-md overflow-x-auto">
                <div className="flex items-center gap-6">
                    <Link
                        href={`/${locale}/configuration-settings`}
                        className="flex items-center gap-2 hover:text-blue-200 transition-colors"
                    >
                        <Settings className="w-4 h-4" />
                        <span className="text-sm font-medium">{t('navigation.settings')}</span>
                    </Link>

                    {/* User info */}
                    <div className="relative">
                        <button
                            onClick={() => setShowProfileDropdown(!showProfileDropdown)}
                            className="flex items-center gap-3 text-left focus:outline-none group border-l border-blue-400 pl-6"
                        >
                            <div className="w-9 h-9 bg-blue-500/20 rounded-full flex items-center justify-center border border-blue-400/30 group-hover:bg-blue-500/30 transition-colors">
                                <User className="w-5 h-5 text-blue-100" />
                            </div>
                            <div className="hidden sm:flex items-baseline gap-1">
                                <span className="text-xs text-blue-200">{t('app.welcome')}</span>
                                <span className="text-sm font-semibold text-white">{username || t('app.defaultUser')}</span>
                            </div>
                        </button>

                        <UserProfilePopup
                            isOpen={showProfileDropdown}
                            onClose={() => setShowProfileDropdown(false)}
                            username={username}
                            ulbName={ulbName}
                        />
                    </div>

                    {/* Logout button */}
                    <Button
                        onClick={handleLogout}
                        variant="danger"
                        size="xs"
                        disabled={isLoggingOut}
                        className="rounded-full px-4 shadow-md hover:shadow-lg hover:scale-105"
                    >
                        {isLoggingOut ? '...' : t('actions.logout')}
                    </Button>
                </div>
            </nav>

            {/* Animated Welcome Message */}
            <div className="bg-[#d1ecf1] text-[#004c8c] font-bold py-1 text-sm sm:text-base text-center overflow-hidden">
                <div className="inline-block animate-marquee whitespace-nowrap px-4">
                    {t('app.welcomeTo', { name: displayUlbName })} &ndash; {t('app.smartGovernance')}
                </div>
            </div>

            <style jsx>{`
                @keyframes marquee {
                    0% { transform: translateX(100%); }
                    100% { transform: translateX(-100%); }
                }
                .animate-marquee {
                    animation: marquee 20s linear infinite;
                    min-width: 100%;
                }
            `}</style>
        </div>
    );
};
