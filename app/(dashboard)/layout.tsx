import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export default async function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    // If no user, redirect to login
    if (!user) {
        redirect("/login");
    }

    return (
        <div className="min-h-screen bg-darker">
            {/* Dashboard sidebar/nav will go here */}
            {children}
        </div>
    );
}
