import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import prisma from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ sessionId: string }> }
) {
    try {
        const { userId } = await auth();
        if (!userId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { sessionId } = await params;

        const session = await prisma.interviewSession.findUnique({
            where: { id: sessionId },
            include: {
                user: true,
                questions: {
                    include: {
                        response: true,
                    },
                    orderBy: {
                        order: "asc",
                    },
                },
            },
        });

        if (!session || session.user.clerkId !== userId) {
            return NextResponse.json({ error: "Session not found" }, { status: 404 });
        }

        return NextResponse.json({
            session: {
                id: session.id,
                track: session.track,
                difficulty: session.difficulty,
                mode: session.mode,
                status: session.status,
                startedAt: session.startedAt,
            },
            questions: session.questions,
        });
    } catch (error) {
        console.error("Error fetching session:", error);
        return NextResponse.json(
            { error: "Failed to fetch session" },
            { status: 500 }
        );
    }
}
