import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { MobileBottomNav } from "@/components/layout/MobileBottomNav";
import { getSettingsDB } from "@/lib/db";

export default async function StorefrontLayout({ children }: { children: React.ReactNode }) {
    const settings = await getSettingsDB();

    return (
        <div className="flex flex-col min-h-screen">
            <Navbar storeName={settings.storeName} />
            <main className="flex-grow pb-16 lg:pb-0">
                {children}
            </main>
            <Footer />
            <MobileBottomNav />
        </div>
    );
}
