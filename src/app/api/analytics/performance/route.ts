import { prisma } from "@/lib/prisma";
import { auth, currentUser } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

export async function GET() {
    try {
        const { userId } = await auth();
        if (!userId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

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

        // Get all interview sessions with responses and reports
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

        // Calculate metrics
        const totalInterviews = sessions.length;
        const completedInterviews = sessions.filter((s) => s.status === "COMPLETED").length;

        // Calculate average scores by difficulty
        const scoresByDifficulty: Record<string, { total: number; count: number; avg: number }> = {};
        const scoresByTrack: Record<string, { total: number; count: number; avg: number }> = {};

        sessions.forEach((session) => {
            if (session.report) {
                const difficulty = session.difficulty;
                const track = session.track;

                if (!scoresByDifficulty[difficulty]) {
                    scoresByDifficulty[difficulty] = { total: 0, count: 0, avg: 0 };
                }
                scoresByDifficulty[difficulty].total += session.report.overallScore;
                scoresByDifficulty[difficulty].count += 1;

                if (!scoresByTrack[track]) {
                    scoresByTrack[track] = { total: 0, count: 0, avg: 0 };
                }
                scoresByTrack[track].total += session.report.overallScore;
                scoresByTrack[track].count += 1;
            }
        });

        // Calculate averages
        Object.keys(scoresByDifficulty).forEach((key) => {
            scoresByDifficulty[key].avg = scoresByDifficulty[key].total / scoresByDifficulty[key].count;
        });
        Object.keys(scoresByTrack).forEach((key) => {
            scoresByTrack[key].avg = scoresByTrack[key].total / scoresByTrack[key].count;
        });

        // Calculate overall average
        const overallScore =
            sessions.length > 0
                ? sessions.reduce((sum, s) => sum + (s.report?.overallScore || 0), 0) / completedInterviews
                : 0;

        // Get recent performance trend (last 10 interviews)
        const recentInterviews = sessions.slice(0, 10).reverse();
        const performanceTrend = recentInterviews.map((session) => ({
            date: session.startedAt.toISOString().split("T")[0],
            score: session.report?.overallScore || 0,
            difficulty: session.difficulty,
            track: session.track,
        }));

        // Get weak areas (topics mentioned in weaknesses)
        const weakAreas: Record<string, number> = {};
        sessions.forEach((session) => {
            if (session.report?.weaknesses) {
                try {
                    const weaknesses = JSON.parse(session.report.weaknesses);
                    if (Array.isArray(weaknesses)) {
                        weaknesses.forEach((w: string) => {
                            weakAreas[w] = (weakAreas[w] || 0) + 1;
                        });
                    }
                } catch (e) {}
            }
        });

        // Get strengths
        const strengths: Record<string, number> = {};
        sessions.forEach((session) => {
            if (session.report?.strengths) {
                try {
                    const str = JSON.parse(session.report.strengths);
                    if (Array.isArray(str)) {
                        str.forEach((s: string) => {
                            strengths[s] = (strengths[s] || 0) + 1;
                        });
                    }
                } catch (e) {}
            }
        });

        // Calculate improvement (compare first vs last interview)
        let improvement = 0;
        if (completedInterviews >= 2) {
            const firstScore = sessions[sessions.length - 1].report?.overallScore || 0;
            const lastScore = sessions[0].report?.overallScore || 0;
            improvement = lastScore - firstScore;
        }

        return NextResponse.json({
            totalInterviews,
            completedInterviews,
            overallScore: Math.round(overallScore),
            improvement: Math.round(improvement * 10) / 10,
            scoresByDifficulty: Object.entries(scoresByDifficulty).map(([difficulty, data]) => ({
                difficulty,
                score: Math.round(data.avg),
                count: data.count,
            })),
            scoresByTrack: Object.entries(scoresByTrack).map(([track, data]) => ({
                track,
                score: Math.round(data.avg),
                count: data.count,
            })),
            performanceTrend,
            weakAreas: Object.entries(weakAreas)
                .sort((a, b) => b[1] - a[1])
                .slice(0, 5)
                .map(([area, count]) => ({ area, count })),
            strengths: Object.entries(strengths)
                .sort((a, b) => b[1] - a[1])
                .slice(0, 5)
                .map(([strength, count]) => ({ strength, count })),
            recentSessions: sessions.slice(0, 5).map((session) => ({
                id: session.id,
                track: session.track,
                difficulty: session.difficulty,
                score: session.report?.overallScore || 0,
                completedAt: session.completedAt,
                questionsCount: session.questions.length,
            })),
        });
    } catch (error) {
        console.error("Performance analytics error:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
