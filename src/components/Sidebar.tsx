"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
    LayoutDashboard,
    Code,
    MessageSquare,
    History,
    BarChart3,
    User,
    CreditCard,
    Settings,
    HelpCircle,
    Sparkles,
    Check,
} from "lucide-react";

const sidebarLinks = [
    {
        label: "Main",
        links: [
            { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
            { href: "/learn", label: "Learn Code", icon: Code },
            { href: "/dashboard/new-interview", label: "New Interview", icon: MessageSquare },
            { href: "/dashboard/performance", label: "Performance", icon: BarChart3 },
            { href: "/history", label: "History", icon: History },
        ],
    },
    {
        label: "Account",
        links: [
            { href: "/profile", label: "Profile", icon: User },
            { href: "/pricing", label: "Billing", icon: CreditCard },
            { href: "/settings", label: "Settings", icon: Settings },
        ],
    },
];

export function Sidebar() {
    const pathname = usePathname();
    const [userPlan, setUserPlan] = useState<string>("FREE");
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchUserPlan = async () => {
            try {
                const response = await fetch("/api/dashboard", {
                    cache: "no-store",
                });
                if (response.ok) {
                    const data = await response.json();
                    setUserPlan(data.user.plan || "FREE");
                }
            } catch (err) {
                console.log("Could not fetch user plan");
            } finally {
                setIsLoading(false);
            }
        };

        fetchUserPlan();

        // Refresh plan on page visibility change (when user comes back to the tab)
        const handleVisibilityChange = () => {
            if (!document.hidden) {
                fetchUserPlan();
            }
        };

        document.addEventListener("visibilitychange", handleVisibilityChange);
        return () => document.removeEventListener("visibilitychange", handleVisibilityChange);
    }, []);

    return (
        <aside className="fixed left-0 top-16 z-40 h-[calc(100vh-4rem)] w-64 border-r border-white/10 bg-black/50 backdrop-blur-xl hidden lg:block">
            <div className="flex flex-col h-full">
                {/* Navigation Links */}
                <div className="flex-1 overflow-y-auto py-6 px-4">
                    {sidebarLinks.map((section) => (
                        <div key={section.label} className="mb-6">
                            <p className="px-3 mb-2 text-xs font-semibold uppercase tracking-wider text-gray-500">
                                {section.label}
                            </p>
                            <nav className="space-y-1">
                                {section.links.map((link) => {
                                    const Icon = link.icon;
                                    const isActive = pathname === link.href;

                                    return (
                                        <Link
                                            key={link.href}
                                            href={link.href}
                                            className={cn(
                                                "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all",
                                                isActive
                                                    ? "bg-gradient-to-r from-violet-500/20 to-indigo-500/20 text-white border border-violet-500/30"
                                                    : "text-gray-400 hover:text-white hover:bg-white/5"
                                            )}
                                        >
                                            <Icon
                                                className={cn(
                                                    "h-5 w-5",
                                                    isActive ? "text-violet-400" : ""
                                                )}
                                            />
                                            {link.label}
                                            {link.label === "New Interview" && (
                                                <span className="ml-auto flex h-5 w-5 items-center justify-center rounded-full bg-gradient-to-r from-violet-500 to-indigo-600">
                                                    <Sparkles className="h-3 w-3 text-white" />
                                                </span>
                                            )}
                                        </Link>
                                    );
                                })}
                            </nav>
                        </div>
                    ))}
                </div>

                {/* Help Section */}
                <div className="p-4 border-t border-white/10">
                    <Link
                        href="/help"
                        className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-gray-400 hover:text-white hover:bg-white/5 transition-all"
                    >
                        <HelpCircle className="h-5 w-5" />
                        Help & Support
                    </Link>

                    {/* Pro Upgrade Card */}
                    {userPlan === "PRO" ? (
                        <div className="mt-4 p-4 rounded-xl bg-gradient-to-br from-green-500/10 to-emerald-500/10 border border-green-500/20">
                            <div className="flex items-center gap-2 mb-2">
                                <Check className="h-4 w-4 text-green-400" />
                                <span className="text-sm font-semibold text-white">Pro Active</span>
                            </div>
                            <p className="text-xs text-gray-400">
                                You have access to all Pro features.
                            </p>
                        </div>
                    ) : (
                        <div className="mt-4 p-4 rounded-xl bg-gradient-to-br from-violet-500/10 to-indigo-500/10 border border-violet-500/20">
                            <div className="flex items-center gap-2 mb-2">
                                <Sparkles className="h-4 w-4 text-violet-400" />
                                <span className="text-sm font-semibold text-white">Upgrade to Pro</span>
                            </div>
                            <p className="text-xs text-gray-400 mb-3">
                                Unlock unlimited interviews, voice mode, and AI reports.
                            </p>
                            <Link
                                href="/pricing"
                                className="block w-full text-center py-2 rounded-lg bg-gradient-to-r from-violet-500 to-indigo-600 text-sm font-medium text-white hover:opacity-90 transition-opacity"
                            >
                                Upgrade Now
                            </Link>
                        </div>
                    )}
                </div>
            </div>
        </aside>
    );
}
