"use client";

import { Navbar } from "@/components/marketing/navbar";
import { Hero } from "@/components/sections/hero";
import { Features } from "@/components/sections/features";
import { AppExplanation } from "@/components/sections/app-explanation";

import { Advantages } from "@/components/sections/advantages";
import { Footer } from "@/components/sections/footer";

export default function HomePage() {
    return (
        <div className="relative min-h-screen bg-darker selection:bg-primary/30 selection:text-white">
            {/* Navbar */}
            <Navbar />

            <main>
                {/* Hero Section */}
                <Hero />

                {/* App Explanation Section (Startup Readiness) */}
                <AppExplanation />

                {/* Features Section */}
                <Features />

                {/* Advantages Section */}
                <Advantages />
            </main>

            {/* Footer Section */}
            <Footer />
        </div>
    );
}
