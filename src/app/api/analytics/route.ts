import { NextRequest, NextResponse } from "next/server";
import { auth, currentUser } from "@clerk/nextjs/server";
import prisma from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
    try {
        const { userId } = await auth();
        if (!userId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        // Get user from database
        let user = await prisma.user.findUnique({
            where: { clerkId: userId },
        });

        // If user doesn't exist, create them (fallback for webhook delay)
        if (!user) {
            const clerkUser = await currentUser();
            user = await prisma.user.create({
                data: {
                    clerkId: userId,
                    email: clerkUser?.emailAddresses[0]?.emailAddress || "",
                    name: clerkUser?.firstName || clerkUser?.username || "User",
                },
            });
        }

        // Get all interview sessions for this user
        const sessions = await prisma.interviewSession.findMany({
            where: { userId: user.id },
            include: {
                questions: {
                    include: {
                        response: true,
                    },
                },
                report: true,
            },
            orderBy: { startedAt: "desc" },
        });

        // Type definition for session
        type SessionType = {
            id: string;
            track: string;
            difficulty: string;
            startedAt: Date;
            questions: Array<{ response: { overallScore: number | null } | null }>;
            report: { overallScore: number } | null;
        };

        // Calculate overall statistics
        const totalInterviews = sessions.length;

        // Collect all response scores
        const allScores = sessions.flatMap((session: SessionType) =>
            session.questions
                .map((q: { response: { overallScore: number | null } | null }) => q.response?.overallScore)
                .filter((score: number | null | undefined): score is number => score !== null && score !== undefined)
        );

        const averageScore = allScores.length > 0
            ? Math.round(allScores.reduce((a: number, b: number) => a + b, 0) / allScores.length)
            : 0;

        const bestScore = allScores.length > 0 ? Math.max(...allScores) : 0;

        // Track distribution
        const trackCounts: Record<string, number> = {};
        sessions.forEach((session: SessionType) => {
            trackCounts[session.track] = (trackCounts[session.track] || 0) + 1;
        });

        const trackData = Object.entries(trackCounts)
            .map(([track, count], idx) => {
                const colors = ["#8b5cf6", "#06b6d4", "#ec4899", "#f59e0b", "#6366f1"];
                return {
                    name: track,
                    value: count,
                    color: colors[idx % colors.length],
                };
            })
            .sort((a, b) => b.value - a.value);

        // Difficulty distribution with scores
        const difficultyStats: Record<string, { interviews: number; scores: number[] }> = {
            BEGINNER: { interviews: 0, scores: [] },
            INTERMEDIATE: { interviews: 0, scores: [] },
            ADVANCED: { interviews: 0, scores: [] },
        };

        sessions.forEach((session: SessionType) => {
            const difficulty = session.difficulty as string;
            difficultyStats[difficulty].interviews += 1;
            const sessionScores = session.questions
                .map((q: { response: { overallScore: number | null } | null }) => q.response?.overallScore)
                .filter((s: number | null | undefined): s is number => s !== null && s !== undefined);
            difficultyStats[difficulty].scores.push(...sessionScores);
        });

        const difficultyData = Object.entries(difficultyStats)
            .map(([name, data]) => ({
                name,
                interviews: data.interviews,
                avgScore:
                    data.scores.length > 0
                        ? Math.round(data.scores.reduce((a: number, b: number) => a + b, 0) / data.scores.length)
                        : 0,
            }))
            .filter((d) => d.interviews > 0);

        // Monthly performance trend (last 6 months)
        const now = new Date();
        const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 5, 1);

        const monthlyData: Record<string, { scores: number[]; count: number }> = {};

        sessions.forEach((session: SessionType) => {
            if (session.startedAt >= sixMonthsAgo) {
                const month = session.startedAt.toLocaleString("default", {
                    month: "short",
                });
                if (!monthlyData[month]) {
                    monthlyData[month] = { scores: [], count: 0 };
                }
                monthlyData[month].count += 1;
                const sessionScores = session.questions
                    .map((q: { response: { overallScore: number | null } | null }) => q.response?.overallScore)
                    .filter((s: number | null | undefined): s is number => s !== null && s !== undefined);
                monthlyData[month].scores.push(...sessionScores);
            }
        });

        const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun"];
        const performanceData = months.map((month) => ({
            month,
            score: monthlyData[month]
                ? Math.round(
                    monthlyData[month].scores.reduce((a: number, b: number) => a + b, 0) /
                    monthlyData[month].scores.length
                )
                : 0,
            interviews: monthlyData[month]?.count || 0,
        }));

        // Recent interviews
        const recentInterviews = sessions.slice(0, 10).map((session: SessionType) => {
            const avgScore = session.questions
                .map((q: { response: { overallScore: number | null } | null }) => q.response?.overallScore)
                .filter((s: number | null | undefined): s is number => s !== null && s !== undefined);
            const score =
                avgScore.length > 0
                    ? Math.round(avgScore.reduce((a: number, b: number) => a + b, 0) / avgScore.length)
                    : 0;

            return {
                id: session.id,
                track: session.track,
                difficulty: session.difficulty,
                score,
                date: session.startedAt,
                questionsCount: session.questions.length,
            };
        });

        // Calculate streak (consecutive days of practice)
        let streak = 0;
        const sessionDates = new Set(
            sessions.map((s: SessionType) => s.startedAt.toISOString().split("T")[0])
        );
        const today = new Date();
        for (let i = 0; i < 365; i++) {
            const date = new Date(today);
            date.setDate(date.getDate() - i);
            const dateStr = date.toISOString().split("T")[0];
            if (sessionDates.has(dateStr)) {
                streak++;
            } else if (i > 0) {
                break;
            }
        }

        return NextResponse.json({
            stats: {
                totalInterviews,
                averageScore,
                bestScore,
                streak,
            },
            performanceData,
            trackData,
            difficultyData,
            recentInterviews,
        });
    } catch (error) {
        console.error("Analytics error:", error);
        return NextResponse.json(
            { error: "Failed to fetch analytics" },
            { status: 500 }
        );
    }
}
