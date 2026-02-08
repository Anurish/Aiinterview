import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        // Get user from database
        const user = await prisma.user.findUnique({
            where: { id: session.user.id },
        });

        if (!user) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
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
            },
            orderBy: { startedAt: "desc" },
        });

        // Type definition for session
        type SessionType = {
            id: string;
            status: string;
            track: string;
            difficulty: string;
            startedAt: Date;
            questions: Array<{ response: { overallScore: number | null } | null }>;
        };

        // Calculate stats
        const completedSessions = sessions.filter((s: SessionType) => s.status === "COMPLETED") as SessionType[];
        const totalInterviews = completedSessions.length;

        // Calculate average score
        const scoredSessions = completedSessions.filter(
            (s: SessionType) => s.questions.some((q) => q.response?.overallScore != null)
        );

        let averageScore = 0;
        if (scoredSessions.length > 0) {
            const totalScore = scoredSessions.reduce((acc: number, s: SessionType) => {
                const sessionScores = s.questions
                    .filter((q) => q.response?.overallScore != null)
                    .map((q) => q.response!.overallScore!);
                const sessionAvg = sessionScores.length > 0
                    ? sessionScores.reduce((a, b) => a + b, 0) / sessionScores.length
                    : 0;
                return acc + sessionAvg;
            }, 0);
            averageScore = Math.round(totalScore / scoredSessions.length);
        }

        // Calculate practice time (rough estimate: 5 mins per question)
        const totalQuestions = sessions.reduce((acc: number, s: SessionType) => acc + s.questions.length, 0);
        const practiceTime = Math.round((totalQuestions * 5) / 60);

        // Calculate improvement (compare first half vs second half of sessions)
        let improvement = 0;
        if (scoredSessions.length >= 4) {
            const half = Math.floor(scoredSessions.length / 2);
            const firstHalf = scoredSessions.slice(-half); // older sessions
            const secondHalf = scoredSessions.slice(0, half); // newer sessions

            const getAvgScore = (sessions: SessionType[]) => {
                const scores = sessions.flatMap((s: SessionType) =>
                    s.questions
                        .filter((q) => q.response?.overallScore != null)
                        .map((q) => q.response!.overallScore!)
                );
                return scores.length > 0 ? scores.reduce((a, b) => a + b, 0) / scores.length : 0;
            };

            const firstHalfAvg = getAvgScore(firstHalf as SessionType[]);
            const secondHalfAvg = getAvgScore(secondHalf as SessionType[]);
            improvement = firstHalfAvg > 0 ? ((secondHalfAvg - firstHalfAvg) / firstHalfAvg) * 100 : 0;
        }

        // Get recent sessions (top 5)
        const recentSessions = completedSessions.slice(0, 5).map((s: SessionType) => {
            const scores = s.questions
                .filter((q) => q.response?.overallScore != null)
                .map((q) => q.response!.overallScore!);
            const score = scores.length > 0
                ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length)
                : 0;

            return {
                id: s.id,
                track: s.track.toLowerCase(),
                difficulty: s.difficulty.toLowerCase(),
                score,
                date: s.startedAt.toISOString(),
            };
        });

        // Track distribution
        const trackCounts = completedSessions.reduce((acc: Record<string, number>, s: SessionType) => {
            acc[s.track] = (acc[s.track] || 0) + 1;
            return acc;
        }, {});

        return NextResponse.json({
            user: {
                name: user.name || "User",
                plan: user.plan,
                credits: user.credits,
                mocksThisMonth: user.mocksThisMonth,
            },
            stats: {
                totalInterviews,
                averageScore,
                practiceTime,
                improvement: Math.round(improvement),
            },
            recentSessions,
            trackCounts,
        });
    } catch (error: any) {
        console.error("Dashboard error:", error);
        return NextResponse.json(
            { error: error.message || "Failed to fetch dashboard data" },
            { status: 500 }
        );
    }
}
