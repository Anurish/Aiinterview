import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { LessonWorkspace } from "@/components/LessonWorkspace";

interface PageProps {
    params: Promise<{
        language: string;
        slug: string;
    }>;
}

export default async function LessonPage(props: PageProps) {
    const params = await props.params;
    const { language, slug } = params;
    const session = await auth();

    if (!session || !session.user) {
        redirect("/sign-in");
    }

    // Check PRO access
    if (session.user.plan !== "PRO") {
        // Validation logic here
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
        redirect(`/learn/${language}`);
    }

    // Verify language match
    if (lesson.language && lesson.language !== language.toLowerCase()) {
        redirect(`/learn/${lesson.language}/${slug}`);
    }

    // Check if locked?
    if (lesson.order > 1 && session.user.plan !== "PRO") {
        // Check if previous completed
        // For now redirects
        // redirect("/learn?error=upgrade-required");
    }

    // Get next lesson slug in SAME language
    const nextLesson = await prisma.lesson.findFirst({
        where: {
            language: language.toLowerCase(),
            order: {
                gt: lesson.order,
            },
        },
        orderBy: {
            order: "asc",
        },
        select: {
            slug: true,
        },
    });

    const progress = lesson.userProgress[0] || null;

    return (
        <LessonWorkspace
            lesson={lesson}
            progress={progress}
            nextLessonSlug={nextLesson?.slug}
            language={language}
        />
    );
}
