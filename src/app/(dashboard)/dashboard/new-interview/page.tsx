"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Sparkles, FileText, Play } from "lucide-react";
import { cn } from "@/lib/utils";
import { TRACK_OPTIONS, DIFFICULTY_OPTIONS, type Track, type Difficulty } from "@/types";

export default function NewInterviewPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const preselectedTrack = searchParams.get("track") as Track | null;

    const [selectedTrack, setSelectedTrack] = useState<Track | null>(preselectedTrack);
    const [selectedDifficulty, setSelectedDifficulty] = useState<Difficulty | null>(null);
    const [selectedMode, setSelectedMode] = useState<"TEXT" | "VOICE">("TEXT");
    const [isStarting, setIsStarting] = useState(false);

    const canStart = selectedTrack && selectedDifficulty;

    const handleStart = async () => {
        if (!canStart) return;

        setIsStarting(true);
        console.log("🚀 Starting interview...", { selectedTrack, selectedDifficulty, selectedMode });
        try {
            console.log("📡 Fetching /api/interview/start...");
            const response = await fetch("/api/interview/start", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    track: selectedTrack,
                    difficulty: selectedDifficulty,
                    mode: selectedMode,
                }),
            });

            if (!response.ok) {
                let errorData: any = {};
                try {
                    errorData = await response.json();
                } catch {
                    const text = await response.text();
                    console.error("Non-JSON Response:", text);
                    errorData = { error: text || "Unknown error" };
                }

                console.error("API Error Response:", {
                    status: response.status,
                    statusText: response.statusText,
                    url: response.url,
                    body: errorData,
                });
                throw new Error(errorData.error || `Failed to start interview (${response.status})`);
            }

            const { sessionId } = await response.json();
            router.push(`/interview/${sessionId}`);
        } catch (error) {
            console.error("Error starting interview:", error);
            setIsStarting(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto animate-in">
            {/* Header */}
            <div className="flex items-center gap-4 mb-8">
                <Link
                    href="/dashboard"
                    className="p-2 rounded-lg text-gray-400 hover:text-white hover:bg-white/10 transition-colors"
                >
                    <ArrowLeft className="h-5 w-5" />
                </Link>
                <div>
                    <h1 className="text-2xl font-bold text-white">New Interview</h1>
                    <p className="text-gray-400">Configure your mock interview session</p>
                </div>
            </div>

            <div className="space-y-8">
                {/* Track Selection */}
                <div>
                    <h2 className="text-lg font-semibold text-white mb-4">
                        1. Select Your Track
                    </h2>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        {TRACK_OPTIONS.map((track) => (
                            <button
                                key={track.value}
                                onClick={() => setSelectedTrack(track.value)}
                                className={cn(
                                    "flex items-center gap-3 p-4 rounded-xl border transition-all text-left",
                                    selectedTrack === track.value
                                        ? "bg-violet-500/20 border-violet-500/50 text-white"
                                        : "bg-white/5 border-white/10 text-gray-400 hover:border-white/30"
                                )}
                            >
                                <span className="text-2xl">{track.icon}</span>
                                <span className="font-medium">{track.label}</span>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Difficulty Selection */}
                <div>
                    <h2 className="text-lg font-semibold text-white mb-4">
                        2. Choose Difficulty
                    </h2>
                    <div className="grid md:grid-cols-3 gap-4">
                        {DIFFICULTY_OPTIONS.map((diff) => (
                            <button
                                key={diff.value}
                                onClick={() => setSelectedDifficulty(diff.value)}
                                className={cn(
                                    "p-6 rounded-xl border transition-all text-left",
                                    selectedDifficulty === diff.value
                                        ? "bg-violet-500/20 border-violet-500/50"
                                        : "bg-white/5 border-white/10 hover:border-white/30"
                                )}
                            >
                                <div
                                    className={cn(
                                        "inline-flex px-3 py-1 rounded-full text-xs font-medium mb-3",
                                        diff.value === "BEGINNER"
                                            ? "bg-green-500/20 text-green-400"
                                            : diff.value === "INTERMEDIATE"
                                                ? "bg-yellow-500/20 text-yellow-400"
                                                : "bg-red-500/20 text-red-400"
                                    )}
                                >
                                    {diff.label}
                                </div>
                                <p className="text-sm text-gray-400">{diff.description}</p>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Mode Selection */}
                <div>
                    <h2 className="text-lg font-semibold text-white mb-4">
                        3. Interview Mode
                    </h2>
                    <div className="grid md:grid-cols-1 gap-4">
                        <button
                            onClick={() => setSelectedMode("TEXT")}
                            className={cn(
                                "flex items-center gap-4 p-6 rounded-xl border transition-all text-left",
                                selectedMode === "TEXT"
                                    ? "bg-violet-500/20 border-violet-500/50"
                                    : "bg-white/5 border-white/10 hover:border-white/30"
                            )}
                        >
                            <div className="p-3 rounded-xl bg-white/10">
                                <FileText className="h-6 w-6 text-white" />
                            </div>
                            <div>
                                <p className="font-semibold text-white">Text Mode</p>
                                <p className="text-sm text-gray-400">Type your answers</p>
                            </div>
                        </button>
                    </div>
                </div>

                {/* Resume Upload (Optional) */}
                <div className="p-6 rounded-xl bg-white/5 border border-white/10 border-dashed">
                    <div className="flex items-center gap-4">
                        <div className="p-3 rounded-xl bg-white/10">
                            <FileText className="h-6 w-6 text-gray-400" />
                        </div>
                        <div className="flex-1">
                            <p className="font-medium text-white">Upload Resume (Optional)</p>
                            <p className="text-sm text-gray-400">
                                Get tailored questions based on your experience
                            </p>
                        </div>
                        <button className="px-4 py-2 rounded-lg bg-white/10 text-white text-sm hover:bg-white/20 transition-colors">
                            Upload PDF
                        </button>
                    </div>
                </div>

                {/* Start Button */}
                <div className="flex justify-end gap-4 pt-4">
                    <Link
                        href="/dashboard"
                        className="px-6 py-3 rounded-xl text-gray-400 hover:text-white transition-colors"
                    >
                        Cancel
                    </Link>
                    <button
                        onClick={handleStart}
                        disabled={!canStart || isStarting}
                        className={cn(
                            "flex items-center gap-2 px-8 py-3 rounded-xl font-medium transition-all",
                            canStart
                                ? "bg-gradient-to-r from-violet-500 to-indigo-600 text-white shadow-lg shadow-violet-500/25 hover:shadow-violet-500/40"
                                : "bg-white/10 text-gray-500 cursor-not-allowed"
                        )}
                    >
                        {isStarting ? (
                            <>
                                <div className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                Starting...
                            </>
                        ) : (
                            <>
                                <Play className="h-5 w-5" />
                                Start Interview
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}
