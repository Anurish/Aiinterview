import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import PerformanceClient from "./PerformanceClient";
import { Sparkles, Lock, TrendingUp, AlertCircle } from "lucide-react";
import Link from "next/link";
import { PLANS } from "@/lib/stripe";

export const metadata = {
    title: "Performance Dashboard | InterviewAI",
    description: "Track your interview performance and improvement over time",
};

export default async function PerformancePage() {
    const session = await auth();

    if (!session?.user) {
        redirect("/sign-in");
    }

    const user = await prisma.user.findUnique({
        where: { id: session.user.id },
        select: { plan: true },
    });

    if (user?.plan !== "PRO") {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="max-w-md w-full p-8 rounded-2xl bg-white/5 border border-white/10 text-center relative overflow-hidden group">
                    {/* Background glow */}
                    <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-violet-500/10 to-indigo-500/10 opacity-50 group-hover:opacity-100 transition-opacity" />

                    <div className="relative z-10 flex flex-col items-center">
                        <div className="h-16 w-16 rounded-full bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center mb-6 shadow-[0_0_20px_rgba(139,92,246,0.5)]">
                            <Lock className="h-8 w-8 text-white" />
                        </div>

                        <h2 className="text-2xl font-bold text-white mb-3">
                            Unlock Performance Analytics
                        </h2>

                        <p className="text-gray-400 mb-8">
                            Detailed performance tracking, improvement trends, and AI-driven insights are available exclusively on the <span className="text-violet-400 font-bold">Pro Plan</span>.
                        </p>

                        <div className="w-full space-y-4 mb-8">
                            {[
                                "Track your progress over time",
                                "Identify weak areas & strengths",
                                "Compare scores by difficulty",
                                "Detailed topic breakdowns"
                            ].map((feature, i) => (
                                <div key={i} className="flex items-center gap-3 text-sm text-gray-300">
                                    <div className="h-5 w-5 rounded-full bg-green-500/20 flex items-center justify-center flex-shrink-0">
                                        <TrendingUp className="h-3 w-3 text-green-400" />
                                    </div>
                                    {feature}
                                </div>
                            ))}
                        </div>

                        <Link
                            href="/pricing"
                            className="w-full py-3 rounded-xl bg-gradient-to-r from-violet-500 to-indigo-600 text-white font-bold hover:opacity-90 transition-all shadow-lg hover:shadow-violet-500/25 flex items-center justify-center gap-2"
                        >
                            <Sparkles className="h-5 w-5" />
                            Upgrade to Pro
                        </Link>

                        <p className="text-xs text-gray-500 mt-4">
                            Starting at ${PLANS.PRO.priceUSD}/month. Cancel anytime.
                        </p>
                    </div>
                </div>
            </div>
        );
    }

    return <PerformanceClient />;
}
