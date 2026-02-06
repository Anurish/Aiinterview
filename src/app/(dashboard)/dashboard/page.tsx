"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import {
    Plus,
    Clock,
    TrendingUp,
    Target,
    Sparkles,
    ArrowRight,
    MessageSquare,
    Loader2,
    CheckCircle,
    AlertCircle,
    X,
} from "lucide-react";
import { StatsCard } from "@/components/ProgressChart";

interface DashboardData {
    user: {
        name: string;
        plan: string;
        credits: number;
    };
    stats: {
        totalInterviews: number;
        averageScore: number;
        practiceTime: number;
        improvement: number;
    };
    recentSessions: Array<{
        id: string;
        track: string;
        difficulty: string;
        score: number;
        date: string;
    }>;
    trackCounts: Record<string, number>;
}

function DashboardContent() {
    const searchParams = useSearchParams();
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [data, setData] = useState<DashboardData | null>(null);
    const [showNotification, setShowNotification] = useState(!!searchParams.get("success"));
    const [notificationType, setNotificationType] = useState<"success" | "error">(
        searchParams.get("success") ? "success" : "error"
    );

    useEffect(() => {
        const fetchDashboard = async () => {
            try {
                const response = await fetch("/api/dashboard");
                if (!response.ok) {
                    throw new Error("Failed to fetch dashboard data");
                }
                const dashboardData = await response.json();
                setData(dashboardData);
            } catch (err) {
                setError(err instanceof Error ? err.message : "An error occurred");
            } finally {
                setIsLoading(false);
            }
        };

        fetchDashboard();
    }, []);

    // Auto-hide notification after 5 seconds
    useEffect(() => {
        if (showNotification) {
            const timer = setTimeout(() => setShowNotification(false), 5000);
            return () => clearTimeout(timer);
        }
    }, [showNotification]);

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <Loader2 className="h-10 w-10 animate-spin text-violet-500" />
                    <p className="text-gray-400">Loading your dashboard...</p>
                </div>
            </div>
        );
    }

    if (error || !data) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <p className="text-red-400 mb-4">{error || "Failed to load dashboard"}</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-in">
            {/* Success/Error Notification */}
            {showNotification && (
                <div
                    className={`fixed top-4 right-4 p-4 rounded-lg shadow-lg flex items-center gap-3 animate-in slide-in-from-right ${notificationType === "success"
                            ? "bg-green-500/20 border border-green-500/30 text-green-300"
                            : "bg-red-500/20 border border-red-500/30 text-red-300"
                        }`}
                >
                    {notificationType === "success" ? (
                        <CheckCircle className="h-5 w-5 flex-shrink-0" />
                    ) : (
                        <AlertCircle className="h-5 w-5 flex-shrink-0" />
                    )}
                    <div className="flex-1">
                        <p className="font-medium">
                            {notificationType === "success"
                                ? "Purchase successful! Your plan has been updated."
                                : "Purchase canceled"}
                        </p>
                    </div>
                    <button
                        onClick={() => setShowNotification(false)}
                        className="p-1 hover:bg-white/10 rounded transition-colors"
                    >
                        <X className="h-4 w-4" />
                    </button>
                </div>
            )}

            {/* Welcome Header */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-white">
                        Welcome back, {data.user.name}! 👋
                    </h1>
                    <p className="mt-1 text-gray-400">
                        Ready to ace your next interview? Let&apos;s practice.
                    </p>
                </div>
                <Link
                    href="/dashboard/new-interview"
                    className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-violet-500 to-indigo-600 text-white font-medium shadow-lg shadow-violet-500/25 hover:shadow-violet-500/40 transition-shadow"
                >
                    <Plus className="h-5 w-5" />
                    New Interview
                </Link>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatsCard
                    title="Total Interviews"
                    value={String(data.stats.totalInterviews)}
                    change={data.stats.totalInterviews > 0 ? 20 : 0}
                    icon={<MessageSquare className="h-6 w-6 text-violet-400" />}
                />
                <StatsCard
                    title="Average Score"
                    value={`${data.stats.averageScore}%`}
                    change={data.stats.improvement > 0 ? Math.abs(Math.round(data.stats.improvement)) : 0}
                    icon={<Target className="h-6 w-6 text-violet-400" />}
                />
                <StatsCard
                    title="Practice Time"
                    value={`${data.stats.practiceTime}h`}
                    change={data.stats.practiceTime > 0 ? 15 : 0}
                    icon={<Clock className="h-6 w-6 text-violet-400" />}
                />
                <StatsCard
                    title="Improvement"
                    value={`${data.stats.improvement > 0 ? '+' : ''}${Math.round(data.stats.improvement)}%`}
                    change={Math.abs(data.stats.improvement)}
                    icon={<TrendingUp className="h-6 w-6 text-violet-400" />}
                />
            </div>

            {/* Quick Actions */}
            <div className="grid md:grid-cols-3 gap-4">
                {[
                    {
                        title: "Frontend Interview",
                        description: "React, Vue, Angular, CSS",
                        icon: "🎨",
                        href: "/dashboard/new-interview?track=FRONTEND",
                    },
                    {
                        title: "DSA Practice",
                        description: "Algorithms & Data Structures",
                        icon: "🧮",
                        href: "/dashboard/new-interview?track=DSA",
                    },
                    {
                        title: "System Design",
                        description: "Architecture & Scalability",
                        icon: "🏗️",
                        href: "/dashboard/new-interview?track=GENERAL_SWE",
                    },
                ].map((action) => (
                    <Link
                        key={action.title}
                        href={action.href}
                        className="group p-6 rounded-xl bg-white/5 border border-white/10 hover:border-violet-500/50 transition-all"
                    >
                        <div className="flex items-center gap-4">
                            <span className="text-4xl">{action.icon}</span>
                            <div className="flex-1">
                                <h3 className="font-semibold text-white group-hover:text-violet-400 transition-colors">
                                    {action.title}
                                </h3>
                                <p className="text-sm text-gray-500">{action.description}</p>
                            </div>
                            <ArrowRight className="h-5 w-5 text-gray-500 group-hover:text-violet-400 transition-colors" />
                        </div>
                    </Link>
                ))}
            </div>

            {/* Analytics Banner */}
            <Link
                href="/dashboard/analytics"
                className="group p-6 rounded-xl bg-gradient-to-r from-cyan-500/10 to-blue-500/10 border border-cyan-500/30 hover:border-cyan-500/60 transition-all"
            >
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <TrendingUp className="h-8 w-8 text-cyan-400" />
                        <div>
                            <h3 className="font-semibold text-white group-hover:text-cyan-400 transition-colors">
                                View Your Analytics
                            </h3>
                            <p className="text-sm text-gray-400">
                                Track your progress, performance trends, and improvement areas
                            </p>
                        </div>
                    </div>
                    <ArrowRight className="h-5 w-5 text-cyan-400 group-hover:translate-x-1 transition-transform" />
                </div>
            </Link>

            {/* Recent Sessions */}
            <div className="p-6 rounded-xl bg-white/5 border border-white/10">
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-semibold text-white">Recent Sessions</h2>
                    <Link
                        href="/dashboard/history"
                        className="text-sm text-violet-400 hover:text-violet-300 transition-colors"
                    >
                        View All
                    </Link>
                </div>

                <div className="space-y-4">
                    {data.recentSessions && data.recentSessions.length > 0 ? (
                        data.recentSessions.map((session) => (
                            <div
                                key={session.id}
                                className="flex items-center justify-between p-4 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
                            >
                                <div className="flex items-center gap-4">
                                    <div
                                        className={`h-12 w-12 rounded-xl flex items-center justify-center font-bold ${session.score >= 80
                                            ? "bg-green-500/20 text-green-400"
                                            : session.score >= 60
                                                ? "bg-yellow-500/20 text-yellow-400"
                                                : "bg-red-500/20 text-red-400"
                                            }`}
                                    >
                                        {session.score}
                                    </div>
                                    <div>
                                        <p className="font-medium text-white capitalize">{session.track}</p>
                                        <p className="text-sm text-gray-500">
                                            {session.difficulty} • {new Date(session.date).toLocaleDateString()}
                                        </p>
                                    </div>
                                </div>
                                <Link
                                    href={`/dashboard/reports/${session.id}`}
                                    className="px-4 py-2 rounded-lg text-sm text-violet-400 hover:bg-violet-500/20 transition-colors"
                                >
                                    View Report
                                </Link>
                            </div>
                        ))
                    ) : (
                        <div className="text-center py-8 text-gray-400">
                            <p>No interviews yet. Start your first interview to see results here.</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Pro Upgrade Banner */}
            <div className="relative p-8 rounded-2xl bg-gradient-to-br from-violet-500/20 via-indigo-500/20 to-purple-500/20 border border-violet-500/30 overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-violet-500/10 rounded-full blur-3xl" />
                <div className="relative flex flex-col md:flex-row items-center justify-between gap-6">
                    <div className="flex items-center gap-4">
                        <div className="p-3 rounded-xl bg-violet-500/20">
                            <Sparkles className="h-8 w-8 text-violet-400" />
                        </div>
                        <div>
                            <h3 className="text-xl font-semibold text-white">
                                Upgrade to Pro
                            </h3>
                            <p className="text-gray-400">
                                Unlock unlimited interviews, voice mode, and AI reports
                            </p>
                        </div>
                    </div>
                    <Link
                        href="/pricing"
                        className="px-6 py-3 rounded-xl bg-gradient-to-r from-violet-500 to-indigo-600 text-white font-medium hover:opacity-90 transition-opacity"
                    >
                        View Plans
                    </Link>
                </div>
            </div>
        </div>
    );
}

function DashboardLoading() {
    return (
        <div className="min-h-screen flex items-center justify-center">
            <div className="flex flex-col items-center gap-4">
                <Loader2 className="h-10 w-10 animate-spin text-violet-500" />
                <p className="text-gray-400">Loading your dashboard...</p>
            </div>
        </div>
    );
}

export default function DashboardPage() {
    return (
        <Suspense fallback={<DashboardLoading />}>
            <DashboardContent />
        </Suspense>
    );
}

