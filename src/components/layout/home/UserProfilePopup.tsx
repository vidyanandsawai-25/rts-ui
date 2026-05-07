import React from 'react';
import { User, Shield, Building, Globe, Hash, Clock, Mail } from 'lucide-react';
import { cn } from '@/lib/utils/cn';
import { Badge } from '@/components/common/Badge';
import { Label } from '@/components/common/label';
import { useTranslations } from 'next-intl';

interface UserProfilePopupProps {
    isOpen: boolean;
    onClose: () => void;
}

export const UserProfilePopup: React.FC<UserProfilePopupProps> = ({ isOpen }) => {
    const t = useTranslations('common');
    if (!isOpen) return null;

    return (
        <div className={cn(
            "absolute top-12 right-0 w-80 bg-white rounded-lg shadow-xl border border-gray-200 z-50",
            "profile-dropdown-container animate-in fade-in zoom-in-95 duration-200"
        )}>
            {/* Header */}
            <div className="p-4 border-b border-gray-100 flex items-center gap-4 bg-gray-50/50 rounded-t-lg">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center text-blue-600">
                    <User className="w-6 h-6" />
                </div>
                <div>
                    <h3 className="text-sm font-bold text-gray-900">{t('userMenu.mockName')}</h3>
                    <p className="text-xs text-gray-500">{t('userMenu.mockEmail')}</p>
                </div>
            </div>

            {/* Body */}
            <div className="p-4 space-y-4">
                <div className="flex items-start gap-3">
                    <Hash className="w-4 h-4 text-gray-400 mt-0.5" />
                    <div className="flex-1">
                        <Label className="text-[10px] text-gray-500 uppercase font-bold mb-0.5">{t('userMenu.userId')}</Label>
                        <p className="text-sm font-medium text-gray-900">{t('userMenu.mockUserId')}</p>
                    </div>
                </div>

                <div className="flex items-start gap-3">
                    <Shield className="w-4 h-4 text-gray-400 mt-0.5" />
                    <div className="flex-1">
                        <Label className="text-[10px] text-gray-500 uppercase font-bold mb-1">{t('userMenu.role')}</Label>
                        <Badge variant="default" size="sm" className="bg-blue-50 text-blue-700 border-blue-100">
                            {t('userMenu.mockRole')}
                        </Badge>
                    </div>
                </div>

                <div className="flex items-start gap-3">
                    <Building className="w-4 h-4 text-gray-400 mt-0.5" />
                    <div className="flex-1">
                        <Label className="text-[10px] text-gray-500 uppercase font-bold mb-0.5">{t('userMenu.department')}</Label>
                        <p className="text-sm font-medium text-gray-900">{t('userMenu.mockDepartment')}</p>
                    </div>
                </div>

                <div className="border-t border-gray-100 my-2"></div>

                <div className="flex items-start gap-3">
                    <Globe className="w-4 h-4 text-gray-400 mt-0.5" />
                    <div>
                        <p className="text-[10px] text-gray-500 uppercase font-semibold">{t('userMenu.publicIp')}</p>
                        <p className="text-sm font-medium text-gray-900 font-mono">{t('userMenu.mockIp')}</p>
                    </div>
                </div>

                <div className="flex items-start gap-3">
                    <Hash className="w-4 h-4 text-gray-400 mt-0.5" />
                    <div>
                        <p className="text-[10px] text-gray-500 uppercase font-semibold">{t('userMenu.sessionId')}</p>
                        <p className="text-sm font-medium text-gray-900 font-mono truncate w-48">{t('userMenu.mockSessionId')}</p>
                    </div>
                </div>

                <div className="flex items-start gap-3">
                    <Clock className="w-4 h-4 text-gray-400 mt-0.5" />
                    <div>
                        <p className="text-[10px] text-gray-500 uppercase font-semibold">{t('userMenu.loginTime')}</p>
                        <p className="text-sm font-medium text-gray-900">{t('userMenu.mockLoginTime')}</p>
                    </div>
                </div>
            </div>

            {/* Footer */}
            <div className="p-3 bg-blue-50/50 rounded-b-lg border-t border-blue-100">
                <div className="flex gap-2 text-xs text-gray-500">
                    <Mail className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                    <p>{t('app.securityPurpose')}</p>
                </div>
            </div>
        </div>
    );
};

