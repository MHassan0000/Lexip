import { createClient } from "@/lib/supabase/server";
import { DashboardHome } from "@/components/dashboard/home";

export default async function DashboardPage() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    // Fetch user data
    const [
        { data: subscription },
        { data: recentGenerations },
        { count: totalGenerations },
    ] = await Promise.all([
        supabase
            .from("subscriptions")
            .select("*")
            .eq("user_id", user!.id)
            .single(),
        supabase
            .from("thumbnail_generations")
            .select("*")
            .eq("user_id", user!.id)
            .eq("status", "completed")
            .order("created_at", { ascending: false })
            .limit(6),
        supabase
            .from("thumbnail_generations")
            .select("*", { count: "exact", head: true })
            .eq("user_id", user!.id),
    ]);

    // Get today's usage
    const { data: usage } = await supabase.rpc(
        "get_or_create_daily_usage",
        { p_user_id: user!.id }
    );

    return (
        <DashboardHome
            user={user!}
            subscription={subscription}
            recentGenerations={recentGenerations || []}
            totalGenerations={totalGenerations || 0}
            usage={usage}
        />
    );
}
