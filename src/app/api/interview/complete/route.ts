import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { sessionId } = await request.json();

        if (!sessionId) {
            return NextResponse.json({ error: "Session ID required" }, { status: 400 });
        }

        // Find the interview session
        const interviewSession = await prisma.interviewSession.findUnique({
            where: { id: sessionId },
            include: { user: true },
        });

        if (!interviewSession || interviewSession.user.id !== session.user.id) {
            return NextResponse.json({ error: "Session not found" }, { status: 404 });
        }

        // Update session status to COMPLETED
        await prisma.interviewSession.update({
            where: { id: sessionId },
            data: {
                status: "COMPLETED",
                completedAt: interviewSession.completedAt || new Date(),
            },
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Error marking session complete:", error);
        return NextResponse.json(
            { error: "Failed to mark session complete" },
            { status: 500 }
        );
    }
}
