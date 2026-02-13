
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function GET(
    req: Request,
    props: { params: Promise<{ slug: string }> }
) {
    const params = await props.params;
    const { slug } = params;
    try {
        const session = await auth();

        if (!session || !session.user) {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        const lesson = await prisma.lesson.findUnique({
            where: {
                slug: slug,
            },
            include: {
                userProgress: {
                    where: {
                        userId: session.user.id,
                    },
                },
            },
        });

        if (!lesson) {
            return new NextResponse("Not Found", { status: 404 });
        }

        return NextResponse.json(lesson);
    } catch (error) {
        console.error("[LESSON_GET]", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}
