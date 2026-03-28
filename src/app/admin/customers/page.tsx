import { AdminHeader } from "../components/AdminLayout";
import { 
    UserPlus, 
    Mail
} from "lucide-react";
import { CustomerTableClient } from "./CustomerTableClient";

export const dynamic = 'force-dynamic';

export default async function CustomersPage() {
    // Mock customers data
    const customers = [
        { id: "C-101", name: "Amira Youssef", email: "amira@example.com", phone: "+20 102 345 6789", address: "123 Nile St, Cairo", spent: 45800, orders: 12, joined: "Jan 15, 2024" },
        { id: "C-102", name: "Karim Hassan", email: "karim@example.com", phone: "+20 111 222 3333", address: "45 Giza Rd, Giza", spent: 12400, orders: 3, joined: "Feb 02, 2024" },
        { id: "C-103", name: "Laila Ibrahim", email: "laila@example.com", phone: "+20 120 555 1212", address: "78 Maadi Ave, Cairo", spent: 8900, orders: 2, joined: "Feb 28, 2024" },
        { id: "C-104", name: "Omar Farouk", email: "omar@example.com", phone: "+20 155 888 9999", address: "12 Heliopolis, Cairo", spent: 21500, orders: 7, joined: "Dec 30, 2023" },
        { id: "C-105", name: "Noura Ali", email: "noura@example.com", phone: "+20 100 000 1111", address: "90 Zamalek, Cairo", spent: 3400, orders: 1, joined: "Mar 10, 2024" },
        { id: "C-106", name: "Zaid Mansour", email: "zaid@example.com", phone: "+20 114 777 8888", address: "34 Dokki St, Cairo", spent: 56200, orders: 18, joined: "Nov 12, 2023" },
    ];

    return (
        <div className="flex-1 flex flex-col min-h-screen bg-gray-50/50 dark:bg-zinc-950/50">
            <AdminHeader title="Customer Directory" />

            <main className="flex-1 p-4 md:p-8 space-y-6 md:space-y-8">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-light tracking-tight">Active Shoppers</h1>
                        <p className="text-xs text-gray-500 mt-1">Manage {customers.length} registered customers</p>
                    </div>
                    <button className="flex items-center justify-center gap-2 w-full md:w-auto px-6 py-3 bg-neutral-900 dark:bg-neutral-100 text-neutral-50 dark:text-neutral-900 border border-transparent dark:border-neutral-200 text-xs font-bold uppercase tracking-widest rounded hover:opacity-80 transition-all shadow-lg">
                        <UserPlus className="w-4 h-4" /> Register New Customer
                    </button>
                </div>

                <CustomerTableClient initialCustomers={customers} />

                {/* Help Card */}
                <div className="bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/50 p-4 sm:p-6 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4 sm:gap-6">
                    <div className="flex items-center gap-4 sm:gap-6">
                        <div className="w-10 h-10 sm:w-12 sm:h-12 bg-white dark:bg-emerald-900 rounded-full flex items-center justify-center text-emerald-600 shadow-sm shrink-0">
                            <Mail className="w-5 h-5 sm:w-6 sm:h-6" />
                        </div>
                        <div>
                            <h3 className="font-medium text-emerald-900 dark:text-emerald-400">Marketing Outreach</h3>
                            <p className="text-xs sm:text-sm text-emerald-600/70 dark:text-emerald-600 mt-1">Send personalized offers to your most loyal customers based on their purchase history.</p>
                        </div>
                    </div>
                    <button className="w-full md:w-auto px-6 py-3 md:py-2 bg-emerald-600 text-white text-xs font-bold uppercase tracking-widest rounded-lg hover:bg-emerald-700 transition-colors text-center">
                        Launch Campaign
                    </button>
                </div>
            </main>
        </div>
    );
}
