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
            },
            orderBy: { startedAt: "desc" },
        });

        // Calculate statistics
        const totalInterviews = sessions.length;

        // Get all scores
        const allScores = sessions.flatMap((session) =>
            session.questions
                .map((q) => q.response?.overallScore)
                .filter((score: any) => score !== null && score !== undefined) as number[]
        );

        const averageScore = allScores.length > 0
            ? Math.round(allScores.reduce((a, b) => a + b, 0) / allScores.length)
            : 0;

        // Calculate total practice time (estimate: 15 minutes per interview)
        const practiceTimeMinutes = totalInterviews * 15;
        const practiceHours = (practiceTimeMinutes / 60).toFixed(1);

        // Calculate improvement (compare last month vs previous month)
        const now = new Date();
        const oneMonthAgo = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
        const twoMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 2, now.getDate());

        const thisMonthScores = sessions
            .filter((s) => s.startedAt >= oneMonthAgo)
            .flatMap((s) =>
                s.questions
                    .map((q) => q.response?.overallScore)
                    .filter((s: any) => s !== null && s !== undefined) as number[]
            );

        const lastMonthScores = sessions
            .filter((s) => s.startedAt >= twoMonthsAgo && s.startedAt < oneMonthAgo)
            .flatMap((s) =>
                s.questions
                    .map((q) => q.response?.overallScore)
                    .filter((s: any) => s !== null && s !== undefined) as number[]
            );

        const thisMonthAvg = thisMonthScores.length > 0
            ? Math.round(thisMonthScores.reduce((a, b) => a + b, 0) / thisMonthScores.length)
            : 0;

        const lastMonthAvg = lastMonthScores.length > 0
            ? Math.round(lastMonthScores.reduce((a, b) => a + b, 0) / lastMonthScores.length)
            : 0;

        const improvement = lastMonthAvg > 0 ? thisMonthAvg - lastMonthAvg : 0;

        // Get recent sessions
        const recentSessions = sessions.slice(0, 5).map((session) => {
            const scores = session.questions
                .map((q) => q.response?.overallScore)
                .filter((s: any) => s !== null && s !== undefined) as number[];
            const score = scores.length > 0
                ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length)
                : 0;

            return {
                id: session.id,
                track: session.track,
                difficulty: session.difficulty,
                score,
                date: session.startedAt,
            };
        });

        // Get track breakdown for quick actions
        const trackCounts: Record<string, number> = {};
        sessions.forEach((session) => {
            trackCounts[session.track] = (trackCounts[session.track] || 0) + 1;
        });

        return NextResponse.json({
            user: {
                name: user.name || "Developer",
                plan: user.plan,
                credits: user.credits,
            },
            stats: {
                totalInterviews,
                averageScore,
                practiceTime: parseFloat(practiceHours),
                improvement,
            },
            recentSessions,
            trackCounts,
        });
    } catch (error) {
        console.error("Dashboard error:", error);
        return NextResponse.json(
            { error: "Failed to fetch dashboard data" },
            { status: 500 }
        );
    }
}
