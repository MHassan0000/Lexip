import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export default async function AuthLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    // If user is already logged in, redirect to dashboard
    if (user) {
        redirect("/dashboard");
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-linear-to-b from-darker via-dark to-darker">
            {children}
        </div>
    );
}
