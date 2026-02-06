"use client";

import { useEffect, useState } from "react";
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { Loader2, TrendingUp, Target, Award, Calendar, AlertCircle, Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface PerformanceData {
    totalInterviews: number;
    completedInterviews: number;
    overallScore: number;
    improvement: number;
    scoresByDifficulty: Array<{ difficulty: string; score: number; count: number }>;
    scoresByTrack: Array<{ track: string; score: number; count: number }>;
    performanceTrend: Array<{ date: string; score: number; difficulty: string; track: string }>;
    weakAreas: Array<{ area: string; count: number }>;
    strengths: Array<{ strength: string; count: number }>;
    recentSessions: Array<{ id: string; track: string; difficulty: string; score: number; completedAt?: string; questionsCount: number }>;
}

const COLORS = ["#8b5cf6", "#6366f1", "#06b6d4", "#10b981", "#f59e0b", "#ef4444"];

export default function PerformanceDashboard() {
    const [data, setData] = useState<PerformanceData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchPerformanceData = async () => {
            try {
                const response = await fetch("/api/analytics/performance");
                if (!response.ok) {
                    throw new Error("Failed to fetch performance data");
                }
                const performanceData = await response.json();
                setData(performanceData);
            } catch (err) {
                setError(err instanceof Error ? err.message : "An error occurred");
                console.error("Error fetching performance data:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchPerformanceData();
    }, []);

    if (loading) {
        return (
            <div className="flex items-center justify-center h-96">
                <Loader2 className="h-8 w-8 animate-spin text-violet-500" />
            </div>
        );
    }

    if (error || !data) {
        return (
            <div className="p-6 rounded-xl bg-red-500/10 border border-red-500/30">
                <div className="flex items-center gap-3">
                    <AlertCircle className="h-5 w-5 text-red-400" />
                    <p className="text-red-400">{error || "Failed to load performance data"}</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold text-white mb-2">Performance Dashboard</h1>
                <p className="text-gray-400">Track your interview performance and improvement over time</p>
            </div>

            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {/* Overall Score */}
                <div className="p-6 rounded-xl bg-gradient-to-br from-violet-500/20 to-indigo-500/20 border border-violet-500/30">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-400 mb-1">Overall Score</p>
                            <p className="text-4xl font-bold text-white">{data.overallScore}</p>
                            <p className="text-xs text-gray-400 mt-2">out of 100</p>
                        </div>
                        <Award className="h-12 w-12 text-violet-400 opacity-50" />
                    </div>
                </div>

                {/* Interviews Completed */}
                <div className="p-6 rounded-xl bg-gradient-to-br from-blue-500/20 to-cyan-500/20 border border-blue-500/30">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-400 mb-1">Interviews</p>
                            <p className="text-4xl font-bold text-white">{data.completedInterviews}</p>
                            <p className="text-xs text-gray-400 mt-2">completed</p>
                        </div>
                        <Calendar className="h-12 w-12 text-blue-400 opacity-50" />
                    </div>
                </div>

                {/* Improvement */}
                <div className={cn("p-6 rounded-xl border", data.improvement >= 0 ? "bg-gradient-to-br from-green-500/20 to-emerald-500/20 border-green-500/30" : "bg-gradient-to-br from-orange-500/20 to-amber-500/20 border-orange-500/30")}>
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-400 mb-1">Improvement</p>
                            <p className={cn("text-4xl font-bold", data.improvement >= 0 ? "text-green-400" : "text-orange-400")}>
                                {data.improvement > 0 ? "+" : ""}{data.improvement}
                            </p>
                            <p className="text-xs text-gray-400 mt-2">since start</p>
                        </div>
                        <TrendingUp className={cn("h-12 w-12 opacity-50", data.improvement >= 0 ? "text-green-400" : "text-orange-400")} />
                    </div>
                </div>

                {/* Total Interviews */}
                <div className="p-6 rounded-xl bg-gradient-to-br from-amber-500/20 to-orange-500/20 border border-amber-500/30">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-400 mb-1">Total Attempts</p>
                            <p className="text-4xl font-bold text-white">{data.totalInterviews}</p>
                            <p className="text-xs text-gray-400 mt-2">mock interviews</p>
                        </div>
                        <Target className="h-12 w-12 text-amber-400 opacity-50" />
                    </div>
                </div>
            </div>

            {/* Charts Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Performance Trend */}
                <div className="p-6 rounded-xl bg-white/5 border border-white/10">
                    <h2 className="text-lg font-semibold text-white mb-4">Performance Trend</h2>
                    {data.performanceTrend.length > 0 ? (
                        <ResponsiveContainer width="100%" height={300}>
                            <LineChart data={data.performanceTrend}>
                                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                                <XAxis dataKey="date" stroke="rgba(255,255,255,0.5)" style={{ fontSize: "12px" }} />
                                <YAxis stroke="rgba(255,255,255,0.5)" style={{ fontSize: "12px" }} domain={[0, 100]} />
                                <Tooltip contentStyle={{ backgroundColor: "#1e293b", border: "1px solid rgba(255,255,255,0.2)", borderRadius: "8px", color: "#fff" }} />
                                <Legend wrapperStyle={{ color: "rgba(255,255,255,0.7)" }} />
                                <Line type="monotone" dataKey="score" stroke="#8b5cf6" strokeWidth={2} dot={{ fill: "#8b5cf6" }} name="Score" />
                            </LineChart>
                        </ResponsiveContainer>
                    ) : (
                        <p className="text-center text-gray-400 py-8">No performance data yet</p>
                    )}
                </div>

                {/* Score by Difficulty */}
                <div className="p-6 rounded-xl bg-white/5 border border-white/10">
                    <h2 className="text-lg font-semibold text-white mb-4">Performance by Difficulty</h2>
                    {data.scoresByDifficulty.length > 0 ? (
                        <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={data.scoresByDifficulty}>
                                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                                <XAxis dataKey="difficulty" stroke="rgba(255,255,255,0.5)" style={{ fontSize: "12px" }} />
                                <YAxis stroke="rgba(255,255,255,0.5)" style={{ fontSize: "12px" }} domain={[0, 100]} />
                                <Tooltip contentStyle={{ backgroundColor: "#1e293b", border: "1px solid rgba(255,255,255,0.2)", borderRadius: "8px", color: "#fff" }} />
                                <Bar dataKey="score" fill="#8b5cf6" radius={[8, 8, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    ) : (
                        <p className="text-center text-gray-400 py-8">No data available</p>
                    )}
                </div>

                {/* Score by Track */}
                <div className="p-6 rounded-xl bg-white/5 border border-white/10">
                    <h2 className="text-lg font-semibold text-white mb-4">Performance by Track</h2>
                    {data.scoresByTrack.length > 0 ? (
                        <ResponsiveContainer width="100%" height={300}>
                            <PieChart>
                                <Pie 
                                    data={data.scoresByTrack} 
                                    cx="50%" 
                                    cy="50%" 
                                    labelLine={false} 
                                    label={(entry: any) => `${entry.track}: ${entry.score}`} 
                                    outerRadius={80} 
                                    fill="#8b5cf6" 
                                    dataKey="score"
                                >
                                    {data.scoresByTrack.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip contentStyle={{ backgroundColor: "#1e293b", border: "1px solid rgba(255,255,255,0.2)", borderRadius: "8px", color: "#fff" }} />
                            </PieChart>
                        </ResponsiveContainer>
                    ) : (
                        <p className="text-center text-gray-400 py-8">No data available</p>
                    )}
                </div>

                {/* Strengths & Weaknesses */}
                <div className="p-6 rounded-xl bg-white/5 border border-white/10">
                    <h2 className="text-lg font-semibold text-white mb-4">Key Areas</h2>
                    <div className="grid grid-cols-2 gap-4">
                        {/* Strengths */}
                        <div>
                            <h3 className="text-sm font-medium text-green-400 mb-3 flex items-center gap-2">
                                <Check className="h-4 w-4" />
                                Strengths
                            </h3>
                            <div className="space-y-2">
                                {data.strengths.length > 0 ? (
                                    data.strengths.map((strength, idx) => (
                                        <div key={idx} className="p-2 rounded-lg bg-green-500/10 border border-green-500/20">
                                            <p className="text-sm text-green-300">{strength.strength}</p>
                                            <p className="text-xs text-gray-400">×{strength.count}</p>
                                        </div>
                                    ))
                                ) : (
                                    <p className="text-sm text-gray-400">No data yet</p>
                                )}
                            </div>
                        </div>

                        {/* Weak Areas */}
                        <div>
                            <h3 className="text-sm font-medium text-amber-400 mb-3 flex items-center gap-2">
                                <AlertCircle className="h-4 w-4" />
                                To Improve
                            </h3>
                            <div className="space-y-2">
                                {data.weakAreas.length > 0 ? (
                                    data.weakAreas.map((area, idx) => (
                                        <div key={idx} className="p-2 rounded-lg bg-amber-500/10 border border-amber-500/20">
                                            <p className="text-sm text-amber-300">{area.area}</p>
                                            <p className="text-xs text-gray-400">×{area.count}</p>
                                        </div>
                                    ))
                                ) : (
                                    <p className="text-sm text-gray-400">No data yet</p>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Recent Sessions */}
            <div className="p-6 rounded-xl bg-white/5 border border-white/10">
                <h2 className="text-lg font-semibold text-white mb-4">Recent Interviews</h2>
                {data.recentSessions.length > 0 ? (
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b border-white/10">
                                    <th className="text-left py-3 px-4 text-gray-400 font-medium">Track</th>
                                    <th className="text-left py-3 px-4 text-gray-400 font-medium">Difficulty</th>
                                    <th className="text-left py-3 px-4 text-gray-400 font-medium">Score</th>
                                    <th className="text-left py-3 px-4 text-gray-400 font-medium">Questions</th>
                                    <th className="text-left py-3 px-4 text-gray-400 font-medium">Date</th>
                                </tr>
                            </thead>
                            <tbody>
                                {data.recentSessions.map((session) => (
                                    <tr key={session.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                                        <td className="py-3 px-4 text-white capitalize">{session.track}</td>
                                        <td className="py-3 px-4">
                                            <span className={cn("px-2 py-1 rounded text-xs font-medium", session.difficulty === "BEGINNER" ? "bg-green-500/20 text-green-300" : session.difficulty === "INTERMEDIATE" ? "bg-yellow-500/20 text-yellow-300" : "bg-red-500/20 text-red-300")}>
                                                {session.difficulty}
                                            </span>
                                        </td>
                                        <td className="py-3 px-4 text-white font-semibold">{session.score}</td>
                                        <td className="py-3 px-4 text-gray-400">{session.questionsCount}</td>
                                        <td className="py-3 px-4 text-gray-400">{session.completedAt ? new Date(session.completedAt).toLocaleDateString() : "N/A"}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <p className="text-center text-gray-400 py-8">No interviews completed yet. Start your first interview to see performance metrics.</p>
                )}
            </div>
        </div>
    );
}
