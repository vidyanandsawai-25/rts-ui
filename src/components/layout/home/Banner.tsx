import { useTranslations } from "next-intl";


interface BannerProps {
    ulbName?: string;
}

export const Banner = ({ ulbName }: BannerProps) => {
    const t = useTranslations('common');
    const displayUlbName = ulbName || t('app.defaultUlbName');

    return (
        <header className="w-full" role="banner">
            {/* Banner image */}
            <div className="relative w-full bg-gradient-to-r from-blue-900 via-blue-800 to-teal-800 h-[120px] sm:h-[165px] md:h-[200px] lg:h-[220px]">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white/10 to-transparent" aria-hidden="true"></div>

                {/* Banner heading */}
                <div className="relative z-10 flex items-center justify-center h-full">
                    <h1 className="text-white text-lg sm:text-2xl md:text-3xl lg:text-4xl font-bold text-center drop-shadow-md">
                        {displayUlbName}
                    </h1>
                </div>
            </div>
        </header>
    );
};
