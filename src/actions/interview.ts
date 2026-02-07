"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { generateInterviewQuestions, evaluateResponse, generateReport, type Track, type Difficulty } from "@/lib/ai";

export async function startInterview(
    track: Track,
    difficulty: Difficulty,
    mode: "TEXT" | "VOICE"
) {
    const session = await auth();
    if (!session?.user?.id) throw new Error("Unauthorized");

    const user = await prisma.user.findUnique({ where: { id: session.user.id } });

    if (!user) throw new Error("User not found");

    // Generate questions
    const questions = await generateInterviewQuestions(track, difficulty, 5);

    // Create session
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
    });

    revalidatePath("/dashboard");
    revalidatePath("/history");

    return interviewSession.id;
}

export async function submitAnswer(
    sessionId: string,
    questionId: string,
    answer: string,
    codeSnippet?: string
) {
    const authSession = await auth();
    if (!authSession?.user?.id) throw new Error("Unauthorized");

    const interviewSession = await prisma.interviewSession.findUnique({
        where: { id: sessionId },
        include: {
            user: true,
            questions: { where: { id: questionId } },
        },
    });

    if (!interviewSession || interviewSession.user.id !== authSession.user.id) {
        throw new Error("Session not found");
    }

    const question = interviewSession.questions[0];
    if (!question) throw new Error("Question not found");

    // Evaluate answer
    const evaluation = await evaluateResponse(
        question.content,
        answer,
        interviewSession.track as Track,
        interviewSession.difficulty as Difficulty,
        codeSnippet
    );

    // Save response
    const response = await prisma.response.create({
        data: {
            questionId: question.id,
            answer,
            codeSnippet,
            accuracy: evaluation.accuracy,
            clarity: evaluation.clarity,
            confidence: evaluation.confidence,
            technicalDepth: evaluation.technicalDepth,
            overallScore: evaluation.overallScore,
            feedback: evaluation.feedback,
        },
    });

    revalidatePath(`/interview/${sessionId}`);

    return response;
}

export async function completeInterview(sessionId: string) {
    const authSession = await auth();
    if (!authSession?.user?.id) throw new Error("Unauthorized");

    const interviewSession = await prisma.interviewSession.findUnique({
        where: { id: sessionId },
        include: {
            user: true,
            questions: {
                include: { response: true },
            },
        },
    });

    if (!interviewSession || interviewSession.user.id !== authSession.user.id) {
        throw new Error("Session not found");
    }

    // Generate report
    const reportData = await generateReport({
        track: interviewSession.track as Track,
        difficulty: interviewSession.difficulty as Difficulty,
        questions: interviewSession.questions.map((q: { content: string; response: { answer: string; overallScore: number | null; feedback: string | null } | null }) => ({
            content: q.content,
            response: q.response
                ? {
                    answer: q.response.answer,
                    overallScore: q.response.overallScore || undefined,
                    feedback: q.response.feedback || undefined,
                }
                : undefined,
        })),
    });

    // Create report
    await prisma.report.create({
        data: {
            sessionId: interviewSession.id,
            overallScore: reportData.overallScore,
            strengths: JSON.stringify(reportData.strengths),
            weaknesses: JSON.stringify(reportData.weaknesses),
            recommendations: JSON.stringify(reportData.recommendations),
            roadmap: JSON.stringify(reportData.roadmap),
        },
    });

    // Update session status
    await prisma.interviewSession.update({
        where: { id: sessionId },
        data: {
            status: "COMPLETED",
            completedAt: new Date(),
        },
    });

    revalidatePath("/history");
    revalidatePath(`/reports/${sessionId}`);

    return sessionId;
}

export async function getUserStats() {
    const session = await auth();
    if (!session?.user?.id) return null;

    const user = await prisma.user.findUnique({
        where: { id: session.user.id },
        include: {
            interviewSessions: {
                include: {
                    questions: {
                        include: { response: true },
                    },
                },
            },
        },
    });

    if (!user) return null;

    const totalInterviews = user.interviewSessions.length;
    const completedInterviews = user.interviewSessions.filter(
        (s: { status: string }) => s.status === "COMPLETED"
    ).length;

    const allScores = user.interviewSessions.flatMap((s: { questions: Array<{ response: { overallScore: number | null } | null }> }) =>
        s.questions
            .map((q: { response: { overallScore: number | null } | null }) => q.response?.overallScore)
            .filter((score: number | null | undefined): score is number => score !== null && score !== undefined)
    );

    const avgScore =
        allScores.length > 0
            ? allScores.reduce((a: number, b: number) => a + b, 0) / allScores.length
            : 0;

    return {
        totalInterviews,
        completedInterviews,
        avgScore,
        plan: user.plan,
        credits: user.credits,
    };
}
