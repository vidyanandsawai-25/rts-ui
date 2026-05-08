import { Banner } from "@/components/layout/home/Banner";
import ServiceCards from "@/components/modules/home/ServiceCards";
import { Footer } from "@/components/layout/home/Footer";
import { Navbar } from "@/components/layout/home/Navbar";
import { listServices, getUserProfileSSR } from "./action";
import { cookies } from 'next/headers';
import { decodeCookieValue } from '@/lib/utils/cookie';

export default async function Home({ params }: { params: Promise<{ locale: string }> }) {
    const { locale } = await params;
    const [{ services, error }, userProfile] = await Promise.all([
        listServices(locale),
        getUserProfileSSR()
    ]);
    const cookieStore = await cookies();
    const userName = cookieStore.get('user_name')?.value;

    // Get ULB names from cookies with decoding support
    const ulbName = decodeCookieValue(cookieStore.get('ulb_name')?.value);
    const ulbNameLocal = decodeCookieValue(cookieStore.get('ulb_name_local')?.value);

    // Decide which name to show based on locale
    const displayUlbName = (locale === 'en' || !ulbNameLocal) ? ulbName : ulbNameLocal;

    return (
        <div className="flex flex-col min-h-screen bg-gradient-to-br from-slate-50 via-cyan-50 to-blue-50">
            <Banner ulbName={displayUlbName} />
            <Navbar username={userName} ulbName={displayUlbName} userProfile={userProfile} />
            <ServiceCards services={services} error={error} />
            <Footer ulbName={displayUlbName} />
        </div>
    );
}
