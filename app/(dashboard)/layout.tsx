export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="min-h-screen bg-[#0a0a0f]">
            {/* Dashboard sidebar/nav will go here */}
            {children}
        </div>
    );
}
