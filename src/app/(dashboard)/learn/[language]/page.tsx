import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { ArrowLeft, ArrowRight, CheckCircle, Lock, BookOpen, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { auth } from "@/lib/auth";
import { generateCurriculum } from "@/lib/curriculum-generator";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function LanguageLessonsPage({ params }: { params: Promise<{ language: string }> }) {
    const { language } = await params;
    const session = await auth();

    if (!session) redirect("/sign-in");

    // Validate language
    const validLanguages = ["javascript", "python", "java", "cpp", "go"];
    if (!validLanguages.includes(language.toLowerCase())) {
        return (
            <div className="p-8 text-center">
                <h1 className="text-2xl font-bold text-red-400">Invalid Language</h1>
                <Link href="/learn" className="text-violet-400 mt-4 block">Return to Languages</Link>
            </div>
        );
    }

    let lessons = await prisma.lesson.findMany({
        where: { language: language.toLowerCase() },
        orderBy: { order: "asc" },
        include: {
            userProgress: {
                where: { userId: session.user.id },
            }
        }
    });

    // Auto-generate if empty (except maybe JS if we seeded it nicely)
    if (lessons.length < 5) { // Lower threshold for now
        // This might timeout on Vercel/Serverless but works locally
        try {
            await generateCurriculum(language);
            // Re-fetch
            lessons = await prisma.lesson.findMany({
                where: { language: language.toLowerCase() },
                orderBy: { order: "asc" },
                include: {
                    userProgress: {
                        where: { userId: session.user.id },
                    }
                }
            });
        } catch (error) {
            console.error("Failed to generate curriculum:", error);
        }
    }

    return (
        <div className="p-8 max-w-5xl mx-auto space-y-8">
            <div className="flex items-center gap-4 mb-8">
                <Link href="/learn" className="p-2 rounded-lg hover:bg-white/10 transition-colors">
                    <ArrowLeft size={24} className="text-gray-400" />
                </Link>
                <div>
                    <h1 className="text-3xl font-bold text-white capitalize">{language} Curriculum</h1>
                    <p className="text-gray-400">Master {language} through AI-guided practice.</p>
                </div>
            </div>

            <div className="grid gap-4">
                {lessons.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-12 text-gray-500">
                        <Loader2 className="animate-spin h-8 w-8 mb-4 text-violet-500" />
                        <p>Generating your AI curriculum... refresh in a moment.</p>
                    </div>
                ) : (
                    lessons.map((lesson, index) => {
                        const progress = lesson.userProgress[0];
                        const isCompleted = progress?.completed;
                        const isLocked = index > 0 && !lessons[index - 1].userProgress[0]?.completed && session.user.plan !== 'PRO';

                        return (
                            <Link
                                key={lesson.id}
                                href={isLocked ? "#" : `/learn/${language}/${lesson.slug}`}
                                className={cn(
                                    "group flex items-center gap-4 p-5 rounded-xl border border-white/5 bg-[#18181b] transition-all",
                                    isLocked ? "opacity-60 cursor-not-allowed" : "hover:bg-[#1f1f22] hover:border-violet-500/20 hover:shadow-lg hover:shadow-violet-500/5"
                                )}
                            >
                                <div className={cn(
                                    "w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg transition-colors",
                                    isCompleted ? "bg-green-500/20 text-green-400" :
                                        isLocked ? "bg-white/5 text-gray-500" : "bg-violet-500/10 text-violet-400 border border-violet-500/20"
                                )}>
                                    {isCompleted ? <CheckCircle size={20} /> : index + 1}
                                </div>

                                <div className="flex-1">
                                    <h3 className="font-semibold text-lg text-white mb-1 group-hover:text-violet-300 transition-colors">
                                        {lesson.title}
                                    </h3>
                                    <p className="text-sm text-gray-400 line-clamp-1">{lesson.description}</p>
                                </div>

                                {isLocked ? (
                                    <Lock size={20} className="text-gray-600" />
                                ) : (
                                    <div className="p-2 rounded-full bg-white/5 group-hover:bg-white/10 transition-colors">
                                        <ArrowRight size={20} className="text-gray-400 group-hover:text-white" />
                                    </div>
                                )}
                            </Link>
                        )
                    })
                )}
            </div>
        </div>
    );
}
