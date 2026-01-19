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

    // Fetch chart data (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6); // Include today + 6 previous days
    sevenDaysAgo.setHours(0, 0, 0, 0);

    const { data: chartRawData } = await supabase
        .from("thumbnail_generations")
        .select("created_at")
        .eq("user_id", user!.id)
        .gte("created_at", sevenDaysAgo.toISOString())
        .order("created_at", { ascending: true });


    const chartDataMap = new Map<string, number>();
    const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

    // Initialize last 7 days with 0
    const chartData = [];
    for (let i = 0; i < 7; i++) {
        const d = new Date();
        d.setDate(d.getDate() - (6 - i));
        const dayName = days[d.getDay()];
        const dateKey = d.toISOString().split('T')[0];
        chartDataMap.set(dateKey, 0);
    }
    chartRawData?.forEach(item => {
        const dateKey = new Date(item.created_at).toISOString().split('T')[0];
        if (chartDataMap.has(dateKey)) {
            chartDataMap.set(dateKey, (chartDataMap.get(dateKey) || 0) + 1);
        }
    });

    // Convert to array format expected by Recharts
    const finalChartData = [];
    for (let i = 0; i < 7; i++) {
        const d = new Date();
        d.setDate(d.getDate() - (6 - i));
        const dateKey = d.toISOString().split('T')[0];
        finalChartData.push({
            name: days[d.getDay()], // "Mon", "Tue"...
            fullDate: dateKey,
            value: chartDataMap.get(dateKey) || 0
        });
    }

    return (
        <DashboardHome
            user={user!}
            subscription={subscription}
            recentGenerations={recentGenerations || []}
            totalGenerations={totalGenerations || 0}
            usage={usage}
            chartData={finalChartData}
        />
    );
}
