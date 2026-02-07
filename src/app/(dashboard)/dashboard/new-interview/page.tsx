"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, FileText, Play, Loader2, Lock, Crown, Sparkles, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { TRACK_OPTIONS, DIFFICULTY_OPTIONS, type Track, type Difficulty } from "@/types";

// Upgrade Modal Component
function UpgradeModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
    const router = useRouter();

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/70 backdrop-blur-sm"
                onClick={onClose}
            />

            {/* Modal */}
            <div className="relative bg-gray-900 border border-gray-700 rounded-2xl p-8 max-w-md w-full shadow-2xl animate-in zoom-in-95">
                {/* Close button */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
                >
                    <X className="h-5 w-5" />
                </button>

                {/* Icon */}
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center mx-auto mb-6">
                    <Crown className="h-8 w-8 text-white" />
                </div>

                {/* Content */}
                <h2 className="text-2xl font-bold text-white text-center mb-2">
                    Upgrade to Pro
                </h2>
                <p className="text-gray-400 text-center mb-6">
                    Unlock all difficulty levels, unlimited interviews, and advanced analytics.
                </p>

                {/* Features */}
                <div className="space-y-3 mb-6">
                    {[
                        "All difficulty levels (Beginner, Intermediate, Advanced)",
                        "Unlimited mock interviews",
                        "AI-powered detailed reports",
                        "Progress tracking & analytics",
                    ].map((feature, idx) => (
                        <div key={idx} className="flex items-center gap-3 text-sm">
                            <Sparkles className="h-4 w-4 text-violet-400 flex-shrink-0" />
                            <span className="text-gray-300">{feature}</span>
                        </div>
                    ))}
                </div>

                {/* Price */}
                <div className="text-center mb-6">
                    <span className="text-3xl font-bold text-white">₹200</span>
                    <span className="text-gray-400">/month</span>
                </div>

                {/* CTA */}
                <button
                    onClick={() => router.push("/checkout?plan=pro")}
                    className="w-full py-3 rounded-xl bg-gradient-to-r from-violet-500 to-indigo-600 text-white font-semibold shadow-lg shadow-violet-500/25 hover:shadow-violet-500/40 transition-all"
                >
                    Upgrade Now
                </button>

                <button
                    onClick={onClose}
                    className="w-full py-3 mt-3 text-gray-400 hover:text-white transition-colors"
                >
                    Maybe Later
                </button>
            </div>
        </div>
    );
}

// Limit Reached Modal
function LimitReachedModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
    const router = useRouter();

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div
                className="absolute inset-0 bg-black/70 backdrop-blur-sm"
                onClick={onClose}
            />

            <div className="relative bg-gray-900 border border-gray-700 rounded-2xl p-8 max-w-md w-full shadow-2xl animate-in zoom-in-95">
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
                >
                    <X className="h-5 w-5" />
                </button>

                <div className="w-16 h-16 rounded-full bg-red-500/20 flex items-center justify-center mx-auto mb-6">
                    <Lock className="h-8 w-8 text-red-400" />
                </div>

                <h2 className="text-2xl font-bold text-white text-center mb-2">
                    Monthly Limit Reached
                </h2>
                <p className="text-gray-400 text-center mb-6">
                    You&apos;ve used all 3 free interviews this month. Upgrade to Pro for unlimited access!
                </p>

                <button
                    onClick={() => router.push("/checkout?plan=pro")}
                    className="w-full py-3 rounded-xl bg-gradient-to-r from-violet-500 to-indigo-600 text-white font-semibold shadow-lg shadow-violet-500/25 hover:shadow-violet-500/40 transition-all"
                >
                    Upgrade to Pro - ₹200/month
                </button>

                <button
                    onClick={onClose}
                    className="w-full py-3 mt-3 text-gray-400 hover:text-white transition-colors"
                >
                    Close
                </button>
            </div>
        </div>
    );
}

function NewInterviewContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const preselectedTrack = searchParams.get("track") as Track | null;

    const [selectedTrack, setSelectedTrack] = useState<Track | null>(preselectedTrack);
    const [selectedDifficulty, setSelectedDifficulty] = useState<Difficulty | null>(null);
    const [selectedMode, setSelectedMode] = useState<"TEXT" | "VOICE">("TEXT");
    const [isStarting, setIsStarting] = useState(false);

    // Plan state
    const [userPlan, setUserPlan] = useState<"FREE" | "PRO">("FREE");
    const [mocksThisMonth, setMocksThisMonth] = useState(0);
    const [isLoading, setIsLoading] = useState(true);

    // Modal state
    const [showUpgradeModal, setShowUpgradeModal] = useState(false);
    const [showLimitModal, setShowLimitModal] = useState(false);

    const isProUser = userPlan === "PRO";
    const interviewsRemaining = Math.max(0, 3 - mocksThisMonth);
    const hasReachedLimit = !isProUser && interviewsRemaining <= 0;

    // Fetch user plan on mount
    useEffect(() => {
        const fetchUserPlan = async () => {
            try {
                const response = await fetch("/api/dashboard");
                if (response.ok) {
                    const data = await response.json();
                    setUserPlan(data.user?.plan || "FREE");
                    setMocksThisMonth(data.user?.mocksThisMonth || 0);
                }
            } catch (err) {
                console.log("Could not fetch user plan");
            } finally {
                setIsLoading(false);
            }
        };

        fetchUserPlan();
    }, []);

    const canStart = selectedTrack && selectedDifficulty && !hasReachedLimit;

    const handleDifficultyClick = (difficulty: Difficulty) => {
        if (!isProUser && difficulty !== "BEGINNER") {
            setShowUpgradeModal(true);
            return;
        }
        setSelectedDifficulty(difficulty);
    };

    const handleStart = async () => {
        if (hasReachedLimit) {
            setShowLimitModal(true);
            return;
        }

        if (!canStart) return;

        setIsStarting(true);
        try {
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
                const errorData = await response.json().catch(() => ({}));

                // Check for limit reached error from API
                if (response.status === 403 && errorData.error?.includes("limit")) {
                    setShowLimitModal(true);
                    setIsStarting(false);
                    return;
                }

                throw new Error(errorData.error || `Failed to start interview (${response.status})`);
            }

            const { sessionId } = await response.json();
            router.push(`/interview/${sessionId}`);
        } catch (error) {
            console.error("Error starting interview:", error);
            setIsStarting(false);
        }
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <Loader2 className="h-8 w-8 animate-spin text-violet-500" />
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto animate-in">
            {/* Modals */}
            <UpgradeModal isOpen={showUpgradeModal} onClose={() => setShowUpgradeModal(false)} />
            <LimitReachedModal isOpen={showLimitModal} onClose={() => setShowLimitModal(false)} />

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

            {/* Remaining Interviews Banner (Free users only) */}
            {!isProUser && (
                <div className={cn(
                    "mb-6 p-4 rounded-xl border flex items-center justify-between",
                    hasReachedLimit
                        ? "bg-red-500/10 border-red-500/30"
                        : "bg-violet-500/10 border-violet-500/30"
                )}>
                    <div className="flex items-center gap-3">
                        {hasReachedLimit ? (
                            <Lock className="h-5 w-5 text-red-400" />
                        ) : (
                            <Sparkles className="h-5 w-5 text-violet-400" />
                        )}
                        <span className={hasReachedLimit ? "text-red-300" : "text-violet-300"}>
                            {hasReachedLimit
                                ? "You've used all 3 free interviews this month"
                                : `${interviewsRemaining} of 3 free interviews remaining this month`}
                        </span>
                    </div>
                    <button
                        onClick={() => router.push("/checkout?plan=pro")}
                        className="px-4 py-1.5 rounded-lg bg-violet-500 text-white text-sm font-medium hover:bg-violet-600 transition-colors"
                    >
                        Upgrade
                    </button>
                </div>
            )}

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
                                disabled={hasReachedLimit}
                                className={cn(
                                    "flex items-center gap-3 p-4 rounded-xl border transition-all text-left",
                                    hasReachedLimit && "opacity-50 cursor-not-allowed",
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
                        {DIFFICULTY_OPTIONS.map((diff) => {
                            const isLocked = !isProUser && diff.value !== "BEGINNER";
                            const isSelected = selectedDifficulty === diff.value;

                            return (
                                <button
                                    key={diff.value}
                                    onClick={() => handleDifficultyClick(diff.value)}
                                    disabled={hasReachedLimit}
                                    className={cn(
                                        "relative p-6 rounded-xl border transition-all text-left",
                                        hasReachedLimit && "opacity-50 cursor-not-allowed",
                                        isLocked && !hasReachedLimit && "cursor-pointer",
                                        isSelected && !isLocked
                                            ? "bg-violet-500/20 border-violet-500/50"
                                            : isLocked
                                                ? "bg-white/5 border-white/10"
                                                : "bg-white/5 border-white/10 hover:border-white/30"
                                    )}
                                >
                                    {/* Pro Badge for locked items */}
                                    {isLocked && (
                                        <div className="absolute top-3 right-3 flex items-center gap-1 px-2 py-1 rounded-full bg-gradient-to-r from-violet-500 to-indigo-600 text-white text-xs font-medium">
                                            <Crown className="h-3 w-3" />
                                            PRO
                                        </div>
                                    )}

                                    <div className="flex items-center gap-2 mb-3">
                                        {isLocked && <Lock className="h-4 w-4 text-gray-500" />}
                                        <div
                                            className={cn(
                                                "inline-flex px-3 py-1 rounded-full text-xs font-medium",
                                                diff.value === "BEGINNER"
                                                    ? "bg-green-500/20 text-green-400"
                                                    : diff.value === "INTERMEDIATE"
                                                        ? "bg-yellow-500/20 text-yellow-400"
                                                        : "bg-red-500/20 text-red-400",
                                                isLocked && "opacity-60"
                                            )}
                                        >
                                            {diff.label}
                                        </div>
                                    </div>
                                    <p className={cn(
                                        "text-sm",
                                        isLocked ? "text-gray-500" : "text-gray-400"
                                    )}>
                                        {isLocked ? "Requires Pro plan" : diff.description}
                                    </p>
                                </button>
                            );
                        })}
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
                            disabled={hasReachedLimit}
                            className={cn(
                                "flex items-center gap-4 p-6 rounded-xl border transition-all text-left",
                                hasReachedLimit && "opacity-50 cursor-not-allowed",
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
                <div className={cn(
                    "p-6 rounded-xl bg-white/5 border border-white/10 border-dashed",
                    hasReachedLimit && "opacity-50"
                )}>
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
                        <button
                            disabled={hasReachedLimit}
                            className="px-4 py-2 rounded-lg bg-white/10 text-white text-sm hover:bg-white/20 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
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
                            canStart && !isStarting
                                ? "bg-gradient-to-r from-violet-500 to-indigo-600 text-white shadow-lg shadow-violet-500/25 hover:shadow-violet-500/40"
                                : "bg-white/10 text-gray-500 cursor-not-allowed"
                        )}
                    >
                        {isStarting ? (
                            <>
                                <div className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                Starting...
                            </>
                        ) : hasReachedLimit ? (
                            <>
                                <Lock className="h-5 w-5" />
                                Limit Reached
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

function NewInterviewLoading() {
    return (
        <div className="min-h-screen flex items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-violet-500" />
        </div>
    );
}

export default function NewInterviewPage() {
    return (
        <Suspense fallback={<NewInterviewLoading />}>
            <NewInterviewContent />
        </Suspense>
    );
}
