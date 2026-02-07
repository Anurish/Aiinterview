import { NextRequest, NextResponse } from "next/server";
import { auth, getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { generateInterviewQuestions, type Track, type Difficulty } from "@/lib/ai";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
    console.log("📨 API /api/interview/start HIT");
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        let body;
        try {
            body = await request.json();
        } catch {
            return NextResponse.json(
                { error: "Invalid request body. Expected JSON with track, difficulty, and mode." },
                { status: 400 }
            );
        }

        const { track, difficulty, mode } = body as {
            track: Track;
            difficulty: Difficulty;
            mode: "TEXT" | "VOICE";
        };

        // Validate input
        const validTracks: Track[] = ["FRONTEND", "NEXTJS", "MERN", "NODEJS", "PHP", "LARAVEL", "DSA", "GENERAL_SWE"];
        const validDifficulties: Difficulty[] = ["BEGINNER", "INTERMEDIATE", "ADVANCED"];
        const validModes = ["TEXT", "VOICE"];

        if (!validTracks.includes(track)) {
            return NextResponse.json(
                { error: `Invalid track. Must be one of: ${validTracks.join(", ")}` },
                { status: 400 }
            );
        }

        if (!validDifficulties.includes(difficulty)) {
            return NextResponse.json(
                { error: `Invalid difficulty. Must be one of: ${validDifficulties.join(", ")}` },
                { status: 400 }
            );
        }

        if (!validModes.includes(mode)) {
            return NextResponse.json(
                { error: `Invalid mode. Must be one of: ${validModes.join(", ")}` },
                { status: 400 }
            );
        }

        // Get user from database
        const user = await prisma.user.findUnique({ where: { id: session.user.id } });

        if (!user) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        // Check subscription/credits for non-free features
        const isFreePlan = user.plan === "FREE";

        if (isFreePlan) {
            // Check monthly mock limit
            const currentMonth = new Date();
            currentMonth.setDate(1);
            currentMonth.setHours(0, 0, 0, 0);

            if (user.lastMockReset < currentMonth) {
                // Reset monthly count
                await prisma.user.update({
                    where: { id: user.id },
                    data: { mocksThisMonth: 0, lastMockReset: currentMonth },
                });
                user.mocksThisMonth = 0;
            }

            if (user.mocksThisMonth >= 3) {
                return NextResponse.json(
                    { error: "Monthly limit reached. Upgrade to Pro for unlimited interviews." },
                    { status: 403 }
                );
            }

            // Free plan restrictions
            if (difficulty !== "BEGINNER") {
                return NextResponse.json(
                    { error: "Free plan only allows Beginner difficulty." },
                    { status: 403 }
                );
            }

            if (mode === "VOICE") {
                return NextResponse.json(
                    { error: "Voice mode requires Pro plan." },
                    { status: 403 }
                );
            }
        }

        // Generate questions
        console.log("Generating questions with OpenAI...");
        const questions = await generateInterviewQuestions(track, difficulty, 5);
        console.log("Questions generated successfully");

        // Create session
        console.log("Creating session in DB...");
        const interviewSession = await prisma.interviewSession.create({
            data: {
                userId: user.id,
                track,
                difficulty,
                mode,
                questions: {
                    create: questions.map((q, index) => ({
                        content: q.content,
                        type: q.type,
                        order: index,
                    })),
                },
            },
            include: {
                questions: true,
            },
        });
        console.log("Session created:", interviewSession.id);

        // Increment mock count for free users
        if (isFreePlan) {
            await prisma.user.update({
                where: { id: user.id },
                data: { mocksThisMonth: { increment: 1 } },
            });
        }

        return NextResponse.json({ sessionId: interviewSession.id });
    } catch (error: any) {
        console.error("Error starting interview:", error);
        return NextResponse.json(
            { error: error.message || "Failed to start interview", details: JSON.stringify(error) },
            { status: 500 }
        );
    }
}
