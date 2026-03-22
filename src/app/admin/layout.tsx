import { AdminSideNav } from "@/app/admin/components/AdminLayout";

export default function Layout({ children }: { children: React.ReactNode }) {
    return (
        <div className="min-h-screen bg-gray-50 dark:bg-zinc-950 flex">
            {/* Sidebar remains fixed */}
            <AdminSideNav />
            
            {/* Main content area shifts right to account for sidebar only on desktop */}
            <div className="flex-1 flex-col min-h-screen flex lg:ml-64 min-w-0 overflow-x-hidden">
                {children}
            </div>
        </div>
    );
}
