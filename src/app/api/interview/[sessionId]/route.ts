import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ sessionId: string }> }
) {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { sessionId } = await params;

        const interviewSession = await prisma.interviewSession.findUnique({
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

        if (!interviewSession || interviewSession.user.id !== session.user.id) {
            return NextResponse.json({ error: "Session not found" }, { status: 404 });
        }

        return NextResponse.json({
            session: {
                id: interviewSession.id,
                track: interviewSession.track,
                difficulty: interviewSession.difficulty,
                mode: interviewSession.mode,
                status: interviewSession.status,
                startedAt: interviewSession.startedAt,
            },
            questions: interviewSession.questions,
        });
    } catch (error) {
        console.error("Error fetching session:", error);
        return NextResponse.json(
            { error: "Failed to fetch session" },
            { status: 500 }
        );
    }
}
