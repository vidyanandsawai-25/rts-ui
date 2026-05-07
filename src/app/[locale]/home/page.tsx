import { Banner } from "@/components/layout/home/Banner";
import ServiceCards from "@/components/modules/home/ServiceCards";
import { Footer } from "@/components/layout/home/Footer";
import { Navbar } from "@/components/layout/home/Navbar";
import { listServices } from "./action";
import { cookies } from 'next/headers';

export default async function Home({ params }: { params: Promise<{ locale: string }> }) {
    const { locale } = await params;
    const services = await listServices(locale);
    const cookieStore = await cookies();
    const userName = cookieStore.get('user_name')?.value;

    // Get ULB names from cookies with decoding support
    const rawUlbName = cookieStore.get('ulb_name')?.value;
    const rawUlbNameLocal = cookieStore.get('ulb_name_local')?.value;
    
    // Import or define decoding logic (centralized in utils)
    const ulbName = rawUlbName ? decodeURIComponent(rawUlbName.replace(/\+/g, ' ')) : undefined;
    const ulbNameLocal = rawUlbNameLocal ? decodeURIComponent(rawUlbNameLocal.replace(/\+/g, ' ')) : undefined;

    // Decide which name to show based on locale
    const displayUlbName = (locale === 'en' || !ulbNameLocal) ? ulbName : ulbNameLocal;

    return (
        <div className="flex flex-col min-h-screen bg-gradient-to-br from-slate-50 via-cyan-50 to-blue-50">
            <Banner ulbName={displayUlbName} />
            <Navbar username={userName} ulbName={displayUlbName} />
            <ServiceCards services={services} />
            <Footer ulbName={displayUlbName} />
        </div>
    );
}
