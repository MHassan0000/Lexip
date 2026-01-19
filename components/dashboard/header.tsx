"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
    Search,
    Bell,
    User,
    LogOut,
    Menu,
    Settings
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/hooks/use-auth";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";

interface DashboardHeaderProps {
    onMenuClick: () => void;
}

export function DashboardHeader({ onMenuClick }: DashboardHeaderProps) {
    const { user, signOut } = useAuth();
    const router = useRouter();
    const [isSignOutOpen, setIsSignOutOpen] = useState(false);

    const handleSignOut = async () => {
        await signOut();
        setIsSignOutOpen(false);
        router.push("/");
    };

    const userImage = user?.user_metadata?.avatar_url || user?.user_metadata?.picture;

    return (
        <header className="h-16 lg:h-20 border-b border-border bg-dark/80 backdrop-blur-md sticky top-0 z-30 px-4 lg:px-8 flex items-center justify-between gap-4">
            {/* Left: Mobile Menu & Search */}
            <div className="flex items-center gap-4 flex-1">
                <Button
                    variant="ghost"
                    size="icon"
                    className="lg:hidden text-text-secondary hover:text-white"
                    onClick={onMenuClick}
                >
                    <Menu className="w-6 h-6" />
                </Button>

                <div className="relative hidden md:block max-w-md w-full">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-tertiary" />
                    <Input
                        placeholder="Search for..."
                        className="pl-10 bg-darker border-border-bright focus:border-primary/50 transition-colors"
                    />
                </div>
            </div>

            {/* Right: Actions & Profile */}
            <div className="flex items-center gap-2 sm:gap-4">
                {/* Notifications */}
                <Button variant="ghost" size="icon" className="relative text-text-secondary hover:text-white hover:bg-surface-elevated transition-transform hover:scale-105 active:scale-95">
                    <Bell className="w-5 h-5" />
                    <span className="absolute top-2 right-2 w-2 h-2 bg-primary rounded-full animate-pulse" />
                </Button>

                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="relative p-0 h-10 w-10 rounded-xl overflow-hidden ring-2 ring-transparent hover:ring-primary/50 transition-all hover:scale-105 active:scale-95">
                            {userImage ? (
                                <Image
                                    src={userImage}
                                    alt="User"
                                    fill
                                    className="object-cover"
                                />
                            ) : (
                                <div className="w-full h-full bg-linear-to-br from-primary to-accent flex items-center justify-center text-white font-bold">
                                    {user?.email?.charAt(0).toUpperCase() || "U"}
                                </div>
                            )}
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-56 bg-surface-elevated border-border text-text-primary">
                        <DropdownMenuLabel>
                            <p className="font-medium text-white truncate">{user?.user_metadata?.full_name || user?.email?.split('@')[0]}</p>
                            <p className="text-xs text-text-tertiary font-normal truncate">{user?.email}</p>
                        </DropdownMenuLabel>
                        <DropdownMenuSeparator className="bg-border" />
                        <DropdownMenuItem className="focus:bg-primary/20 focus:text-primary cursor-pointer group">
                            <Link href="/settings" className="flex items-center w-full">
                                <Settings className="w-4 h-4 mr-2 group-hover:rotate-90 transition-transform" />
                                Settings
                            </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem
                            className="focus:bg-red-500/10 focus:text-red-400 text-red-400 cursor-pointer"
                            onSelect={(e) => {
                                e.preventDefault();
                                setIsSignOutOpen(true);
                            }}
                        >
                            <LogOut className="w-4 h-4 mr-2" />
                            Sign Out
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>

                {/* Sign Out Confirmation Dialog */}
                <Dialog open={isSignOutOpen} onOpenChange={setIsSignOutOpen}>
                    <DialogContent className="bg-surface border-border sm:max-w-md">
                        <DialogHeader>
                            <DialogTitle className="text-white">Sign Out</DialogTitle>
                            <DialogDescription className="text-text-secondary">
                                Are you sure you want to sign out of your account?
                            </DialogDescription>
                        </DialogHeader>
                        <DialogFooter className="flex gap-2 sm:gap-0 mt-4">
                            <Button
                                variant="ghost"
                                onClick={() => setIsSignOutOpen(false)}
                                className="text-text-secondary hover:text-white"
                            >
                                Cancel
                            </Button>
                            <Button
                                variant="destructive"
                                onClick={handleSignOut}
                                className="bg-red-500 hover:bg-red-600 text-white"
                            >
                                Sign Out
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>
        </header>
    );
}
