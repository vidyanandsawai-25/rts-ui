import { useTranslations } from "next-intl";

interface FooterProps {
    ulbName?: string;
}

export const Footer = ({ ulbName }: FooterProps) => {
    const t = useTranslations('common');
    const displayUlbName = ulbName || t('app.defaultUlbName');
    const currentYear = new Date().getFullYear();

    return (
        <footer className="bg-[#004c8c] text-white text-center py-3 text-xs sm:text-sm mt-auto">
            &copy; {currentYear} {displayUlbName}. {t('footer.allRightsReserved', { default: 'All rights reserved' })}
        </footer>
    );
};
