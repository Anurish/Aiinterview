import { auth } from "@/lib/auth";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { ProgressChart } from "@/components/ProgressChart";
import { formatDate } from "@/lib/utils";
import {
    User,
    Mail,
    Calendar,
    CreditCard,
    FileText,
    TrendingUp,
    MessageSquare,
    Sparkles,
    Check,
} from "lucide-react";
import { PLANS } from "@/lib/stripe";

export default async function ProfilePage() {
    const session = await auth();
    if (!session?.user?.id) return notFound();

    const dbUser = await prisma.user.findUnique({
        where: { id: session.user.id },
        include: {
            subscription: true,
            interviewSessions: {
                include: {
                    questions: {
                        include: {
                            response: true,
                        },
                    },
                },
                orderBy: {
                    startedAt: "desc",
                },
                take: 10,
            },
        },
    });

    if (!dbUser) return notFound();

    // Calculate stats
    type SessionWithQuestions = {
        status: string;
        startedAt: Date;
        questions: Array<{ response: { overallScore: number | null } | null }>;
    };

    const totalInterviews = dbUser.interviewSessions.length;
    const completedInterviews = dbUser.interviewSessions.filter(
        (s: SessionWithQuestions) => s.status === "COMPLETED"
    ).length;
    const avgScore =
        dbUser.interviewSessions.reduce((acc: number, s: SessionWithQuestions) => {
            const scores = s.questions
                .map((q: { response: { overallScore: number | null } | null }) => q.response?.overallScore)
                .filter(Boolean) as number[];
            const sessAvg =
                scores.length > 0
                    ? scores.reduce((a: number, b: number) => a + b, 0) / scores.length
                    : 0;
            return acc + sessAvg;
        }, 0) / Math.max(completedInterviews, 1);

    // Prepare chart data
    const chartData = dbUser.interviewSessions
        .slice(0, 10)
        .reverse()
        .map((s: SessionWithQuestions) => {
            const scores = s.questions
                .map((q: { response: { overallScore: number | null } | null }) => q.response?.overallScore)
                .filter(Boolean) as number[];
            const avg =
                scores.length > 0 ? scores.reduce((a: number, b: number) => a + b, 0) / scores.length : 0;
            return {
                date: formatDate(s.startedAt),
                overallScore: avg,
            };
        });

    return (
        <div className="max-w-4xl mx-auto space-y-8 animate-in">
            {/* Profile Header */}
            <div className="flex flex-col md:flex-row items-start gap-6 p-6 rounded-2xl bg-gradient-to-br from-violet-500/10 via-indigo-500/10 to-purple-500/10 border border-violet-500/20">
                <div className="h-24 w-24 rounded-2xl bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center text-4xl font-bold text-white">
                    {dbUser.name?.[0]?.toUpperCase() || session.user?.name?.[0]?.toUpperCase() || "U"}
                </div>

                <div className="flex-1">
                    <h1 className="text-2xl font-bold text-white">
                        {dbUser.name || session.user?.name || "User"}
                    </h1>
                    <p className="text-gray-400">{dbUser.email}</p>

                    <div className="flex flex-wrap items-center gap-4 mt-4">
                        <div className="flex items-center gap-2 text-sm text-gray-400">
                            <Calendar className="h-4 w-4" />
                            Joined {formatDate(dbUser.createdAt)}
                        </div>
                        <div
                            className={`flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium ${dbUser.plan === "PRO"
                                ? "bg-violet-500/20 text-violet-400"
                                : "bg-gray-500/20 text-gray-400"
                                }`}
                        >
                            {dbUser.plan === "PRO" && <Sparkles className="h-4 w-4" />}
                            {dbUser.plan} Plan
                        </div>
                    </div>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                    {
                        label: "Total Interviews",
                        value: totalInterviews,
                        icon: MessageSquare,
                    },
                    {
                        label: "Completed",
                        value: completedInterviews,
                        icon: FileText,
                    },
                    {
                        label: "Average Score",
                        value: `${Math.round(avgScore)}%`,
                        icon: TrendingUp,
                    },
                    {
                        label: "Credits",
                        value: dbUser.credits,
                        icon: CreditCard,
                    },
                ].map((stat) => (
                    <div
                        key={stat.label}
                        className="p-4 rounded-xl bg-white/5 border border-white/10"
                    >
                        <div className="flex items-center gap-2 text-gray-400 mb-2">
                            <stat.icon className="h-4 w-4" />
                            <span className="text-sm">{stat.label}</span>
                        </div>
                        <p className="text-2xl font-bold text-white">{stat.value}</p>
                    </div>
                ))}
            </div>

            {/* Progress Chart */}
            {chartData.length > 0 && (
                <div className="p-6 rounded-xl bg-white/5 border border-white/10">
                    <h2 className="text-lg font-semibold text-white mb-4">
                        Performance Trend
                    </h2>
                    <ProgressChart data={chartData} type="area" />
                </div>
            )}

            {/* Subscription Info */}
            <div className="p-6 rounded-xl bg-white/5 border border-white/10">
                <h2 className="text-lg font-semibold text-white mb-4">Subscription</h2>

                {dbUser.plan === "PRO" ? (
                    <div className="space-y-4">
                        <div className="flex items-center justify-between mb-4">
                            <div>
                                <p className="text-white font-medium flex items-center gap-2">
                                    <Sparkles className="h-5 w-5 text-violet-400" />
                                    Pro Plan
                                </p>
                                {dbUser.subscription && (
                                    <p className="text-sm text-gray-400 mt-1">
                                        Renews on {formatDate(dbUser.subscription.currentPeriodEnd)}
                                    </p>
                                )}
                            </div>
                            <span className="px-3 py-1 rounded-full bg-green-500/20 text-green-400 text-sm">
                                Active
                            </span>
                        </div>

                        {/* Pro Features */}
                        <div className="bg-violet-500/10 border border-violet-500/30 rounded-lg p-4 space-y-2">
                            <p className="text-sm font-medium text-violet-300 mb-3">
                                Pro Features Unlocked:
                            </p>
                            {PLANS.PRO.features.map((feature, idx) => (
                                <div key={idx} className="flex items-start gap-3">
                                    <Check className="h-4 w-4 text-green-400 flex-shrink-0 mt-0.5" />
                                    <span className="text-sm text-gray-300">{feature}</span>
                                </div>
                            ))}
                        </div>

                        {dbUser.subscription && (
                            <button className="w-full py-2 rounded-lg bg-white/10 text-white hover:bg-white/20 transition-colors">
                                Manage Subscription
                            </button>
                        )}
                    </div>
                ) : (
                    <div className="text-center py-6">
                        <div className="mb-4 p-4 rounded-lg bg-gray-700/30">
                            <p className="text-gray-300 mb-3">Currently on Free Plan</p>
                            <p className="text-sm text-gray-400 mb-4">
                                {PLANS.FREE.features[0]}
                            </p>
                        </div>
                        <p className="text-gray-400 mb-4">
                            Upgrade to Pro for unlimited interviews and advanced features
                        </p>
                        <a
                            href="/pricing"
                            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-violet-500 to-indigo-600 text-white font-medium hover:opacity-90 transition-opacity"
                        >
                            <Sparkles className="h-5 w-5" />
                            Upgrade to Pro
                        </a>
                    </div>
                )}
            </div>

            {/* Account Settings */}
            <div className="p-6 rounded-xl bg-white/5 border border-white/10">
                <h2 className="text-lg font-semibold text-white mb-4">Account</h2>

                <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 rounded-lg bg-white/5">
                        <div className="flex items-center gap-3">
                            <User className="h-5 w-5 text-gray-400" />
                            <div>
                                <p className="text-white">Name</p>
                                <p className="text-sm text-gray-400">
                                    {dbUser.name || "Not set"}
                                </p>
                            </div>
                        </div>
                        <button className="text-violet-400 text-sm hover:text-violet-300">
                            Edit
                        </button>
                    </div>

                    <div className="flex items-center justify-between p-4 rounded-lg bg-white/5">
                        <div className="flex items-center gap-3">
                            <Mail className="h-5 w-5 text-gray-400" />
                            <div>
                                <p className="text-white">Email</p>
                                <p className="text-sm text-gray-400">{dbUser.email}</p>
                            </div>
                        </div>
                    </div>

                    {dbUser.resumeUrl && (
                        <div className="flex items-center justify-between p-4 rounded-lg bg-white/5">
                            <div className="flex items-center gap-3">
                                <FileText className="h-5 w-5 text-gray-400" />
                                <div>
                                    <p className="text-white">Resume</p>
                                    <p className="text-sm text-gray-400">Uploaded</p>
                                </div>
                            </div>
                            <button className="text-violet-400 text-sm hover:text-violet-300">
                                Update
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
