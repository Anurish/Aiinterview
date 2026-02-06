import Link from "next/link";
import { currentUser } from "@clerk/nextjs/server";
import prisma from "@/lib/prisma";
import { formatDate, getTrackLabel, getDifficultyColor, getScoreColor } from "@/lib/utils";
import { Calendar, ChevronRight, Filter } from "lucide-react";

export default async function HistoryPage() {
    const user = await currentUser();
    if (!user) return null;

    const dbUser = await prisma.user.findUnique({
        where: { clerkId: user.id },
        include: {
            sessions: {
                include: {
                    questions: {
                        include: {
                            response: true,
                        },
                    },
                    report: true,
                },
                orderBy: {
                    startedAt: "desc",
                },
            },
        },
    });

    const sessions = dbUser?.sessions || [];

    return (
        <div className="space-y-8 animate-in">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-white">Interview History</h1>
                    <p className="mt-1 text-gray-400">
                        View all your past interview sessions and reports
                    </p>
                </div>
                <button className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-white/10 text-white hover:bg-white/20 transition-colors">
                    <Filter className="h-4 w-4" />
                    Filter
                </button>
            </div>

            {/* Sessions List */}
            {sessions.length === 0 ? (
                <div className="text-center py-16">
                    <Calendar className="h-16 w-16 text-gray-600 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-white mb-2">
                        No interviews yet
                    </h3>
                    <p className="text-gray-400 mb-6">
                        Start your first mock interview to see your history here
                    </p>
                    <Link
                        href="/dashboard/new-interview"
                        className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-violet-500 to-indigo-600 text-white font-medium"
                    >
                        Start Interview
                    </Link>
                </div>
            ) : (
                <div className="space-y-4">
                    {sessions.map((session) => {
                        const avgScore = session.questions.reduce((acc, q) => {
                            return acc + (q.response?.overallScore || 0);
                        }, 0) / session.questions.filter(q => q.response?.overallScore).length || 0;

                        return (
                            <Link
                                key={session.id}
                                href={`/reports/${session.id}`}
                                className="block p-6 rounded-xl bg-white/5 border border-white/10 hover:border-violet-500/50 transition-all group"
                            >
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-4">
                                        {/* Score Badge */}
                                        <div
                                            className={`h-14 w-14 rounded-xl flex items-center justify-center font-bold text-lg ${avgScore >= 80
                                                    ? "bg-green-500/20 text-green-400"
                                                    : avgScore >= 60
                                                        ? "bg-yellow-500/20 text-yellow-400"
                                                        : "bg-red-500/20 text-red-400"
                                                }`}
                                        >
                                            {Math.round(avgScore) || "-"}
                                        </div>

                                        {/* Session Info */}
                                        <div>
                                            <h3 className="font-semibold text-white group-hover:text-violet-400 transition-colors">
                                                {getTrackLabel(session.track)}
                                            </h3>
                                            <div className="flex items-center gap-3 mt-1">
                                                <span
                                                    className={`px-2 py-0.5 rounded-full text-xs ${getDifficultyColor(
                                                        session.difficulty
                                                    )}`}
                                                >
                                                    {session.difficulty}
                                                </span>
                                                <span className="text-sm text-gray-500">
                                                    {session.questions.length} questions
                                                </span>
                                                <span className="text-sm text-gray-500">
                                                    {formatDate(session.startedAt)}
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Status & Arrow */}
                                    <div className="flex items-center gap-4">
                                        <span
                                            className={`px-3 py-1 rounded-full text-xs font-medium ${session.status === "COMPLETED"
                                                    ? "bg-green-500/20 text-green-400"
                                                    : session.status === "IN_PROGRESS"
                                                        ? "bg-yellow-500/20 text-yellow-400"
                                                        : "bg-gray-500/20 text-gray-400"
                                                }`}
                                        >
                                            {session.status.replace("_", " ")}
                                        </span>
                                        <ChevronRight className="h-5 w-5 text-gray-500 group-hover:text-violet-400 transition-colors" />
                                    </div>
                                </div>
                            </Link>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
