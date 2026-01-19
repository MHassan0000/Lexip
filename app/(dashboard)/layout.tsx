"use client";

import { useAuth } from "@/hooks/use-auth"; // Using client-side auth for consistent state
import { redirect } from "next/navigation"; // Not used directly in render but good to keep if needed
import { DashboardSidebar } from "@/components/dashboard/sidebar";
import { DashboardHeader } from "@/components/dashboard/header";
import { useState, useEffect } from "react";
import { Menu } from "lucide-react";

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    // Note: In a real app we might want server-side protection too, 
    // but for layout structure we'll focus on the UI composition.
    const [isMobileOpen, setIsMobileOpen] = useState(false);

    return (
        <div className="min-h-screen bg-darker font-sans text-text-primary">
            {/* Sidebar (Desktop) */}
            <DashboardSidebar />

            {/* Mobile Sidebar (Drawer) */}
            <div className={`fixed inset-0 z-50 lg:hidden pointer-events-none transition-all duration-300 ${isMobileOpen ? 'pointer-events-auto' : ''}`}>
                <div
                    className={`absolute inset-0 bg-black/60 transition-opacity duration-300 ${isMobileOpen ? 'opacity-100' : 'opacity-0'}`}
                    onClick={() => setIsMobileOpen(false)}
                />
                <div className={`absolute top-0 left-0 w-72 h-full transition-transform duration-300 transform ${isMobileOpen ? 'translate-x-0' : '-translate-x-full'}`}>
                    <DashboardSidebar className="flex w-72 h-full static border-r-0" />
                </div>
            </div>

            {/* Main Content Area */}
            <main className="lg:ml-72 min-h-screen flex flex-col transition-all duration-300">
                <DashboardHeader onMenuClick={() => setIsMobileOpen(true)} />

                <div className="flex-1 p-4 md:p-6 lg:p-8 overflow-x-hidden">
                    <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        {children}
                    </div>
                </div>
            </main>
        </div>
    );
}
