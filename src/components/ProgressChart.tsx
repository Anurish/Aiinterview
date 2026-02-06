"use client";

import {
    LineChart,
    Line,
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    RadarChart,
    PolarGrid,
    PolarAngleAxis,
    PolarRadiusAxis,
    Radar,
} from "recharts";
import { cn } from "@/lib/utils";

interface ProgressData {
    date: string;
    overallScore: number;
    accuracy?: number;
    clarity?: number;
    confidence?: number;
    technicalDepth?: number;
}

interface ProgressChartProps {
    data: ProgressData[];
    type?: "line" | "area" | "radar";
    className?: string;
}

export function ProgressChart({ data, type = "area", className }: ProgressChartProps) {
    // Format radar chart data
    const radarData = data.length > 0
        ? [
            { subject: "Accuracy", value: data[data.length - 1]?.accuracy || 0 },
            { subject: "Clarity", value: data[data.length - 1]?.clarity || 0 },
            { subject: "Confidence", value: data[data.length - 1]?.confidence || 0 },
            { subject: "Tech Depth", value: data[data.length - 1]?.technicalDepth || 0 },
        ]
        : [];

    const CustomTooltip = ({ active, payload, label }: { active?: boolean; payload?: { value: number }[]; label?: string }) => {
        if (active && payload && payload.length) {
            return (
                <div className="px-3 py-2 rounded-lg bg-gray-900 border border-white/20 shadow-xl">
                    <p className="text-xs text-gray-400">{label}</p>
                    <p className="text-lg font-bold text-white">{Math.round(payload[0].value)}</p>
                </div>
            );
        }
        return null;
    };

    if (type === "radar") {
        return (
            <div className={cn("h-80", className)}>
                <ResponsiveContainer width="100%" height="100%">
                    <RadarChart cx="50%" cy="50%" outerRadius="80%" data={radarData}>
                        <PolarGrid stroke="#ffffff20" />
                        <PolarAngleAxis
                            dataKey="subject"
                            tick={{ fill: "#9ca3af", fontSize: 12 }}
                        />
                        <PolarRadiusAxis
                            angle={30}
                            domain={[0, 100]}
                            tick={{ fill: "#9ca3af", fontSize: 10 }}
                        />
                        <Radar
                            name="Score"
                            dataKey="value"
                            stroke="#8b5cf6"
                            fill="#8b5cf6"
                            fillOpacity={0.3}
                        />
                    </RadarChart>
                </ResponsiveContainer>
            </div>
        );
    }

    if (type === "line") {
        return (
            <div className={cn("h-80", className)}>
                <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" />
                        <XAxis
                            dataKey="date"
                            stroke="#9ca3af"
                            fontSize={12}
                            tickLine={false}
                        />
                        <YAxis
                            domain={[0, 100]}
                            stroke="#9ca3af"
                            fontSize={12}
                            tickLine={false}
                        />
                        <Tooltip content={<CustomTooltip />} />
                        <Line
                            type="monotone"
                            dataKey="overallScore"
                            stroke="#8b5cf6"
                            strokeWidth={3}
                            dot={{ fill: "#8b5cf6", strokeWidth: 0 }}
                            activeDot={{ r: 8, fill: "#8b5cf6", stroke: "#fff", strokeWidth: 2 }}
                        />
                    </LineChart>
                </ResponsiveContainer>
            </div>
        );
    }

    // Default: area chart
    return (
        <div className={cn("h-80", className)}>
            <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                    <defs>
                        <linearGradient id="scoreGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3} />
                            <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                        </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" />
                    <XAxis
                        dataKey="date"
                        stroke="#9ca3af"
                        fontSize={12}
                        tickLine={false}
                    />
                    <YAxis
                        domain={[0, 100]}
                        stroke="#9ca3af"
                        fontSize={12}
                        tickLine={false}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Area
                        type="monotone"
                        dataKey="overallScore"
                        stroke="#8b5cf6"
                        strokeWidth={2}
                        fill="url(#scoreGradient)"
                    />
                </AreaChart>
            </ResponsiveContainer>
        </div>
    );
}

// Stats Cards Component
interface StatsCardProps {
    title: string;
    value: string | number;
    change?: number;
    icon: React.ReactNode;
    className?: string;
}

export function StatsCard({ title, value, change, icon, className }: StatsCardProps) {
    return (
        <div
            className={cn(
                "p-6 rounded-xl bg-white/5 border border-white/10 hover:border-white/20 transition-colors",
                className
            )}
        >
            <div className="flex items-start justify-between">
                <div>
                    <p className="text-sm text-gray-400">{title}</p>
                    <p className="mt-2 text-3xl font-bold text-white">{value}</p>
                    {change !== undefined && (
                        <p
                            className={cn(
                                "mt-1 text-sm",
                                change >= 0 ? "text-green-500" : "text-red-500"
                            )}
                        >
                            {change >= 0 ? "+" : ""}
                            {change}% from last month
                        </p>
                    )}
                </div>
                <div className="p-3 rounded-xl bg-gradient-to-br from-violet-500/20 to-indigo-500/20">
                    {icon}
                </div>
            </div>
        </div>
    );
}
