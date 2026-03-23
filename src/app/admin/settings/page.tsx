import { getSiteSettings } from "../actions";
import SettingsForm from "./SettingsForm";
import { Settings, ShieldCheck } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
    const settings = await getSiteSettings();

    return (
        <div className="p-4 sm:p-8 md:p-12 mb-20 animate-in fade-in duration-1000">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
                <div>
                    <h1 className="text-4xl md:text-5xl font-light tracking-tight mb-3">Settings</h1>
                    <div className="flex items-center gap-3">
                        <div className="p-1 px-3 bg-black dark:bg-white text-white dark:text-black rounded-full flex items-center gap-2">
                            <ShieldCheck className="w-3.5 h-3.5" />
                            <span className="text-[10px] font-bold uppercase tracking-widest leading-none">Global Configurations</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Form Section */}
            <div className="max-w-4xl">
                <SettingsForm initialSettings={settings} />
            </div>
        </div>
    );
}
