import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { DashboardSidebar } from "@/components/dashboard/sidebar";

export default async function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        redirect("/login");
    }

    return (
        <div className="min-h-screen bg-darker">
            {/* Sidebar */}
            <DashboardSidebar />

            {/* Main Content */}
            <main className="lg:ml-64 min-h-screen">
                {/* Mobile header spacer */}
                <div className="lg:hidden h-16" />

                {/* Page Content */}
                <div className="p-4 md:p-6 lg:p-8">
                    {children}
                </div>
            </main>
        </div>
    );
}
