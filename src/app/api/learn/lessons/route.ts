
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function GET() {
    try {
        const session = await auth();

        if (!session || !session.user) {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        const lessons = await prisma.lesson.findMany({
            orderBy: {
                order: "asc",
            },
            include: {
                userProgress: {
                    where: {
                        userId: session.user.id,
                    },
                    select: {
                        completed: true,
                    }
                }
            }
        });

        return NextResponse.json(lessons);
    } catch (error) {
        console.error("[LESSONS_GET]", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}
