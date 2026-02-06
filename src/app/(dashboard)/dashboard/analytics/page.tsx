"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowLeft, TrendingUp, Calendar, Award, Target, Loader2 } from "lucide-react";
import {
    LineChart,
    Line,
    BarChart,
    Bar,
    PieChart,
    Pie,
    Cell,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
} from "recharts";

interface AnalyticsData {
    stats: {
        totalInterviews: number;
        averageScore: number;
        bestScore: number;
        streak: number;
    };
    performanceData: Array<{ month: string; score: number; interviews: number }>;
    trackData: Array<{ name: string; value: number; color: string }>;
    difficultyData: Array<{ name: string; interviews: number; avgScore: number }>;
    recentInterviews: Array<{
        id: string;
        track: string;
        difficulty: string;
        score: number;
        date: string;
        questionsCount: number;
    }>;
}

export default function AnalyticsPage() {
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [data, setData] = useState<AnalyticsData | null>(null);

    useEffect(() => {
        const fetchAnalytics = async () => {
            try {
                const response = await fetch("/api/analytics");
                if (!response.ok) {
                    throw new Error("Failed to fetch analytics");
                }
                const analyticsData = await response.json();
                setData(analyticsData);
            } catch (err) {
                setError(err instanceof Error ? err.message : "An error occurred");
            } finally {
                setIsLoading(false);
            }
        };

        fetchAnalytics();
    }, []);

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-black">
                <div className="flex flex-col items-center gap-4">
                    <Loader2 className="h-10 w-10 animate-spin text-violet-500" />
                    <p className="text-gray-400">Loading your analytics...</p>
                </div>
            </div>
        );
    }

    if (error || !data) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-black">
                <div className="text-center">
                    <p className="text-red-400 mb-4">{error || "Failed to load analytics"}</p>
                    <Link
                        href="/dashboard"
                        className="text-violet-400 hover:text-violet-300 transition-colors"
                    >
                        Back to Dashboard
                    </Link>
                </div>
            </div>
        );
    }

    const stats = [
        { label: "Total Interviews", value: String(data.stats.totalInterviews), icon: Target, color: "bg-violet-500/10" },
        { label: "Average Score", value: `${data.stats.averageScore}%`, icon: Award, color: "bg-cyan-500/10" },
        { label: "Current Streak", value: `${data.stats.streak} days`, icon: TrendingUp, color: "bg-pink-500/10" },
        { label: "Best Score", value: `${data.stats.bestScore}%`, icon: Calendar, color: "bg-amber-500/10" },
    ];

    return (
        <div className="min-h-screen bg-black">
            {/* Header */}
            <div className="border-b border-white/10 bg-white/5 backdrop-blur-sm sticky top-0 z-40">
                <div className="max-w-7xl mx-auto px-6 py-6">
                    <div className="flex items-center gap-4 mb-4">
                        <Link
                            href="/dashboard"
                            className="p-2 rounded-lg text-gray-400 hover:text-white hover:bg-white/10 transition-colors"
                        >
                            <ArrowLeft className="h-5 w-5" />
                        </Link>
                        <div>
                            <h1 className="text-3xl font-bold text-white">Analytics</h1>
                            <p className="text-gray-400">Your interview performance insights</p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-6 py-12">
                {/* Statistics Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
                    {stats.map((stat) => {
                        const Icon = stat.icon;
                        return (
                            <div
                                key={stat.label}
                                className={`rounded-lg border border-white/10 bg-white/5 backdrop-blur-sm p-6 ${stat.color}`}
                            >
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-gray-400 text-sm mb-1">{stat.label}</p>
                                        <p className="text-3xl font-bold text-white">{stat.value}</p>
                                    </div>
                                    <Icon className="h-8 w-8 text-gray-500" />
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Charts Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-12">
                    {/* Performance Trend */}
                    <div className="rounded-lg border border-white/10 bg-white/5 backdrop-blur-sm p-6">
                        <h2 className="text-xl font-semibold text-white mb-6">Performance Trend</h2>
                        {data.performanceData.some(d => d.interviews > 0) ? (
                            <ResponsiveContainer width="100%" height={300}>
                                <LineChart data={data.performanceData}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#ffffff1a" />
                                    <XAxis stroke="#9ca3af" />
                                    <YAxis stroke="#9ca3af" />
                                    <Tooltip
                                        contentStyle={{
                                            backgroundColor: "#1f2937",
                                            border: "1px solid #374151",
                                            borderRadius: "0.5rem",
                                        }}
                                        labelStyle={{ color: "#fff" }}
                                    />
                                    <Legend />
                                    <Line
                                        type="monotone"
                                        dataKey="score"
                                        stroke="#8b5cf6"
                                        strokeWidth={2}
                                        dot={{ fill: "#8b5cf6" }}
                                        name="Avg Score"
                                    />
                                </LineChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="h-[300px] flex items-center justify-center text-gray-400">
                                No interview data yet
                            </div>
                        )}
                    </div>

                    {/* Track Distribution */}
                    <div className="rounded-lg border border-white/10 bg-white/5 backdrop-blur-sm p-6">
                        <h2 className="text-xl font-semibold text-white mb-6">Track Distribution</h2>
                        {data.trackData.length > 0 ? (
                            <ResponsiveContainer width="100%" height={300}>
                                <PieChart>
                                    <Pie
                                        data={data.trackData}
                                        cx="50%"
                                        cy="50%"
                                        labelLine={false}
                                        label={({ name, value }) => `${name} ${value}`}
                                        outerRadius={100}
                                        fill="#8b5cf6"
                                        dataKey="value"
                                    >
                                        {data.trackData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.color} />
                                        ))}
                                    </Pie>
                                    <Tooltip
                                        contentStyle={{
                                            backgroundColor: "#1f2937",
                                            border: "1px solid #374151",
                                            borderRadius: "0.5rem",
                                        }}
                                        labelStyle={{ color: "#fff" }}
                                    />
                                </PieChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="h-[300px] flex items-center justify-center text-gray-400">
                                No interview data yet
                            </div>
                        )}
                    </div>

                    {/* Difficulty Performance */}
                    <div className="rounded-lg border border-white/10 bg-white/5 backdrop-blur-sm p-6 lg:col-span-2">
                        <h2 className="text-xl font-semibold text-white mb-6">Performance by Difficulty</h2>
                        {data.difficultyData.length > 0 ? (
                            <ResponsiveContainer width="100%" height={300}>
                                <BarChart data={data.difficultyData}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#ffffff1a" />
                                    <XAxis stroke="#9ca3af" />
                                    <YAxis stroke="#9ca3af" />
                                    <Tooltip
                                        contentStyle={{
                                            backgroundColor: "#1f2937",
                                            border: "1px solid #374151",
                                            borderRadius: "0.5rem",
                                        }}
                                        labelStyle={{ color: "#fff" }}
                                    />
                                    <Legend />
                                    <Bar dataKey="interviews" fill="#8b5cf6" name="Interviews" />
                                    <Bar dataKey="avgScore" fill="#06b6d4" name="Avg Score" />
                                </BarChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="h-[300px] flex items-center justify-center text-gray-400">
                                No interview data yet
                            </div>
                        )}
                    </div>
                </div>

                {/* Recent Activity */}
                <div className="rounded-lg border border-white/10 bg-white/5 backdrop-blur-sm p-6">
                    <h2 className="text-xl font-semibold text-white mb-6">Recent Interviews</h2>
                    {data.recentInterviews.length > 0 ? (
                        <div className="space-y-4">
                            {data.recentInterviews.map((interview) => {
                                const date = new Date(interview.date);
                                const now = new Date();
                                const diffTime = Math.abs(now.getTime() - date.getTime());
                                const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                                let timeAgo = `${diffDays} days ago`;
                                if (diffDays === 1) timeAgo = "1 day ago";
                                else if (diffDays === 0) timeAgo = "Today";
                                else if (diffDays < 7) timeAgo = `${diffDays} days ago`;
                                else if (diffDays < 30) timeAgo = `${Math.floor(diffDays / 7)} weeks ago`;
                                else timeAgo = `${Math.floor(diffDays / 30)} months ago`;

                                return (
                                    <Link
                                        key={interview.id}
                                        href={`/reports/${interview.id}`}
                                        className="flex items-center justify-between p-4 rounded-lg bg-white/5 border border-white/10 hover:border-white/20 hover:bg-white/10 transition-colors"
                                    >
                                        <div>
                                            <p className="text-white font-medium">{interview.track}</p>
                                            <p className="text-sm text-gray-400">
                                                {interview.difficulty} • {timeAgo}
                                            </p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-2xl font-bold text-violet-400">{interview.score}</p>
                                            <p className="text-xs text-gray-500">{interview.questionsCount} questions</p>
                                        </div>
                                    </Link>
                                );
                            })}
                        </div>
                    ) : (
                        <div className="p-6 text-center text-gray-400">
                            <p>No interviews yet. Start your first mock interview!</p>
                            <Link
                                href="/dashboard/new-interview"
                                className="mt-4 inline-block px-4 py-2 rounded-lg bg-violet-500/20 text-violet-400 hover:bg-violet-500/30 transition-colors"
                            >
                                Start Interview
                            </Link>
                        </div>
                    )}
                </div>

                {/* Insights */}
                <div className="mt-12 rounded-lg border border-white/10 bg-gradient-to-r from-violet-500/10 to-cyan-500/10 backdrop-blur-sm p-8">
                    <h2 className="text-2xl font-semibold text-white mb-4">Your Insights</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div>
                            <h3 className="text-white font-medium mb-2">🎯 Strengths</h3>
                            <p className="text-gray-400 text-sm">
                                {data.trackData.length > 0
                                    ? `Your strongest area is ${data.trackData[0].name} with ${data.trackData[0].value} interview${data.trackData[0].value !== 1 ? 's' : ''}. Keep building on this!`
                                    : "Start practicing to see your strengths!"}
                            </p>
                        </div>
                        <div>
                            <h3 className="text-white font-medium mb-2">📈 Growth</h3>
                            <p className="text-gray-400 text-sm">
                                {data.stats.totalInterviews > 0
                                    ? `You've completed ${data.stats.totalInterviews} interview${data.stats.totalInterviews !== 1 ? 's' : ''} with an average score of ${data.stats.averageScore}%.`
                                    : "Complete your first interview to track progress!"}
                            </p>
                        </div>
                        <div>
                            <h3 className="text-white font-medium mb-2">🚀 Next Steps</h3>
                            <p className="text-gray-400 text-sm">
                                {data.difficultyData.length > 0
                                    ? `Focus on ${data.difficultyData[data.difficultyData.length - 1].name.toLowerCase()} level problems to round out your skillset. Schedule 2-3 sessions weekly.`
                                    : "Schedule regular practice sessions for consistent improvement!"}
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
