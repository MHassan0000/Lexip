import { createClient } from "@/lib/supabase/server";
import { SettingsView } from "@/components/dashboard/settings-view";

export default async function SettingsPage() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    // Fetch user data
    const [
        { data: profile },
        { data: subscription },
        { count: totalGenerations },
    ] = await Promise.all([
        supabase
            .from("profiles")
            .select("*")
            .eq("id", user!.id)
            .single(),
        supabase
            .from("subscriptions")
            .select("*")
            .eq("user_id", user!.id)
            .single(),
        supabase
            .from("thumbnail_generations")
            .select("*", { count: "exact", head: true })
            .eq("user_id", user!.id),
    ]);

    // Get usage stats
    const { data: usage } = await supabase.rpc(
        "get_or_create_daily_usage",
        { p_user_id: user!.id }
    );

    return (
        <SettingsView
            user={user!}
            profile={profile}
            subscription={subscription}
            totalGenerations={totalGenerations || 0}
            usage={usage}
        />
    );
}
