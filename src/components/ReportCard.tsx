"use client";

import { cn, getScoreColor } from "@/lib/utils";
import { getGrade, getPerformanceLevel } from "@/lib/grading";
import { Trophy, Target, TrendingUp, TrendingDown, CheckCircle, XCircle } from "lucide-react";

interface ReportCardProps {
    overallScore: number;
    accuracy: number;
    clarity: number;
    confidence: number;
    technicalDepth: number;
    strengths: string[];
    weaknesses: string[];
    recommendations: string[];
    className?: string;
}

export function ReportCard({
    overallScore,
    accuracy,
    clarity,
    confidence,
    technicalDepth,
    strengths,
    weaknesses,
    recommendations,
    className,
}: ReportCardProps) {
    const grade = getGrade(overallScore);
    const performanceLevel = getPerformanceLevel(overallScore);

    const scoreCategories = [
        { label: "Accuracy", value: accuracy, description: "Correctness of answers" },
        { label: "Clarity", value: clarity, description: "Explanation quality" },
        { label: "Confidence", value: confidence, description: "Communication style" },
        { label: "Technical Depth", value: technicalDepth, description: "Advanced concepts" },
    ];

    return (
        <div className={cn("space-y-6", className)}>
            {/* Overall Score Hero */}
            <div className="relative p-8 rounded-2xl bg-gradient-to-br from-violet-500/20 via-indigo-500/20 to-purple-500/20 border border-violet-500/30 overflow-hidden">
                {/* Background decoration */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-violet-500/10 rounded-full blur-3xl" />
                <div className="absolute bottom-0 left-0 w-48 h-48 bg-indigo-500/10 rounded-full blur-3xl" />

                <div className="relative flex flex-col md:flex-row items-center justify-between gap-6">
                    <div className="text-center md:text-left">
                        <div className="flex items-center gap-2 justify-center md:justify-start mb-2">
                            <Trophy className="h-5 w-5 text-yellow-500" />
                            <span className="text-sm font-medium text-gray-400">Interview Performance</span>
                        </div>
                        <div className="flex items-baseline gap-3">
                            <span className={cn("text-6xl font-bold", getScoreColor(overallScore))}>
                                {Math.round(overallScore)}
                            </span>
                            <span className="text-2xl text-gray-500">/100</span>
                        </div>
                        <p className="mt-2 text-lg text-gray-300">{performanceLevel}</p>
                    </div>

                    {/* Grade Circle */}
                    <div className="flex items-center justify-center h-32 w-32 rounded-full bg-gradient-to-br from-violet-500/30 to-indigo-500/30 border-4 border-violet-500/50">
                        <span className="text-5xl font-bold text-white">{grade}</span>
                    </div>
                </div>
            </div>

            {/* Score Categories */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {scoreCategories.map((category) => (
                    <div
                        key={category.label}
                        className="p-4 rounded-xl bg-white/5 border border-white/10 hover:border-white/20 transition-colors"
                    >
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-sm text-gray-400">{category.label}</span>
                            <span className={cn("text-lg font-bold", getScoreColor(category.value))}>
                                {Math.round(category.value)}
                            </span>
                        </div>
                        <div className="h-2 rounded-full bg-white/10 overflow-hidden">
                            <div
                                className={cn(
                                    "h-full rounded-full transition-all duration-500",
                                    category.value >= 80
                                        ? "bg-gradient-to-r from-green-500 to-emerald-500"
                                        : category.value >= 60
                                            ? "bg-gradient-to-r from-yellow-500 to-orange-500"
                                            : "bg-gradient-to-r from-red-500 to-rose-500"
                                )}
                                style={{ width: `${category.value}%` }}
                            />
                        </div>
                        <p className="mt-2 text-xs text-gray-500">{category.description}</p>
                    </div>
                ))}
            </div>

            {/* Strengths & Weaknesses */}
            <div className="grid md:grid-cols-2 gap-6">
                {/* Strengths */}
                <div className="p-6 rounded-xl bg-green-500/10 border border-green-500/30">
                    <div className="flex items-center gap-2 mb-4">
                        <TrendingUp className="h-5 w-5 text-green-500" />
                        <h3 className="text-lg font-semibold text-white">Strengths</h3>
                    </div>
                    <ul className="space-y-3">
                        {strengths.map((strength, index) => (
                            <li key={index} className="flex items-start gap-3">
                                <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                                <span className="text-sm text-gray-300">{strength}</span>
                            </li>
                        ))}
                    </ul>
                </div>

                {/* Weaknesses */}
                <div className="p-6 rounded-xl bg-red-500/10 border border-red-500/30">
                    <div className="flex items-center gap-2 mb-4">
                        <TrendingDown className="h-5 w-5 text-red-500" />
                        <h3 className="text-lg font-semibold text-white">Areas for Improvement</h3>
                    </div>
                    <ul className="space-y-3">
                        {weaknesses.map((weakness, index) => (
                            <li key={index} className="flex items-start gap-3">
                                <XCircle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
                                <span className="text-sm text-gray-300">{weakness}</span>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>

            {/* Recommendations */}
            <div className="p-6 rounded-xl bg-white/5 border border-white/10">
                <div className="flex items-center gap-2 mb-4">
                    <Target className="h-5 w-5 text-violet-500" />
                    <h3 className="text-lg font-semibold text-white">Recommendations</h3>
                </div>
                <ul className="space-y-3">
                    {recommendations.map((rec, index) => (
                        <li key={index} className="flex items-start gap-3">
                            <span className="flex items-center justify-center h-6 w-6 rounded-full bg-violet-500/20 text-violet-400 text-xs font-medium flex-shrink-0">
                                {index + 1}
                            </span>
                            <span className="text-sm text-gray-300">{rec}</span>
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
}
