import { createClient } from "@/lib/supabase/server";
import { HistoryView } from "@/components/dashboard/history-view";

interface HistoryPageProps {
    searchParams: Promise<{ page?: string }>;
}

export default async function HistoryPage({ searchParams }: HistoryPageProps) {
    const params = await searchParams;
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    const page = parseInt(params.page || "1");
    const pageSize = 12;
    const offset = (page - 1) * pageSize;

    // Fetch generations with pagination
    const { data: generations, count } = await supabase
        .from("thumbnail_generations")
        .select("*", { count: "exact" })
        .eq("user_id", user!.id)
        .order("created_at", { ascending: false })
        .range(offset, offset + pageSize - 1);

    const totalPages = Math.ceil((count || 0) / pageSize);

    return (
        <HistoryView
            generations={generations || []}
            currentPage={page}
            totalPages={totalPages}
            totalItems={count || 0}
        />
    );
}
