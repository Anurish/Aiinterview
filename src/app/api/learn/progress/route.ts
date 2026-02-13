
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function POST(req: Request) {
    try {
        const session = await auth();
        const { lessonId, completed, userCode } = await req.json();

        if (!session || !session.user) {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        const progress = await prisma.userProgress.upsert({
            where: {
                userId_lessonId: {
                    userId: session.user.id,
                    lessonId: lessonId,
                },
            },
            update: {
                completed: completed,
                userCode: userCode,
            },
            create: {
                userId: session.user.id,
                lessonId: lessonId,
                completed: completed || false,
                userCode: userCode,
            },
        });

        return NextResponse.json(progress);
    } catch (error) {
        console.error("[PROGRESS_POST]", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}
