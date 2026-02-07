import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { streamEvaluateResponse, type Track, type Difficulty } from "@/lib/ai";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { sessionId, questionId, answer, codeSnippet } = await request.json();

        // Get session and question
        const interviewSession = await prisma.interviewSession.findUnique({
            where: { id: sessionId },
            include: {
                user: true,
                questions: {
                    where: { id: questionId },
                },
            },
        });

        if (!interviewSession || interviewSession.user.id !== session.user.id) {
            return NextResponse.json({ error: "Session not found" }, { status: 404 });
        }

        const question = interviewSession.questions[0];
        if (!question) {
            return NextResponse.json({ error: "Question not found" }, { status: 404 });
        }

        // Create readable stream for response
        const encoder = new TextEncoder();
        const stream = new ReadableStream({
            async start(controller) {
                try {
                    let fullFeedback = "";

                    // Stream evaluation from AI
                    for await (const chunk of streamEvaluateResponse(
                        question.content,
                        answer,
                        interviewSession.track as Track,
                        interviewSession.difficulty as Difficulty,
                        codeSnippet
                    )) {
                        fullFeedback += chunk;
                        controller.enqueue(encoder.encode(chunk));
                    }

                    // Parse scores from feedback - improved regex patterns
                    // Match patterns like "Accuracy: 68/100" or "accuracy: 68" or "Accuracy: 68"
                    const accuracyMatch = fullFeedback.match(/accuracy[:\s]+(\d+)/i);
                    const clarityMatch = fullFeedback.match(/clarity[:\s]+(\d+)/i);
                    const confidenceMatch = fullFeedback.match(/confidence[:\s]+(\d+)/i);
                    const technicalMatch = fullFeedback.match(/technical[\s_-]?depth[:\s]+(\d+)/i);
                    const overallMatch = fullFeedback.match(/overall[\s_-]?score[:\s]+(\d+)/i);

                    const accuracy = accuracyMatch ? parseFloat(accuracyMatch[1]) : 70;
                    const clarity = clarityMatch ? parseFloat(clarityMatch[1]) : 70;
                    const confidence = confidenceMatch ? parseFloat(confidenceMatch[1]) : 70;
                    const technicalDepth = technicalMatch ? parseFloat(technicalMatch[1]) : 70;

                    // Calculate overallScore using weighted average if not parsed correctly
                    let overallScore = overallMatch ? parseFloat(overallMatch[1]) : null;
                    if (!overallScore || overallScore < 10) {
                        // Fallback: calculate weighted average
                        overallScore = Math.round(
                            (accuracy * 0.35) + (clarity * 0.25) + (confidence * 0.15) + (technicalDepth * 0.25)
                        );
                    }

                    await prisma.response.create({
                        data: {
                            questionId: question.id,
                            answer,
                            codeSnippet,
                            accuracy,
                            clarity,
                            confidence,
                            technicalDepth,
                            overallScore,
                            feedback: fullFeedback,
                        },
                    });

                    controller.close();
                } catch (error) {
                    console.error("Streaming error:", error);
                    controller.error(error);
                }
            },
        });

        return new Response(stream, {
            headers: {
                "Content-Type": "text/plain; charset=utf-8",
                "Cache-Control": "no-cache",
                "Transfer-Encoding": "chunked",
            },
        });
    } catch (error) {
        console.error("Error evaluating response:", error);
        return NextResponse.json(
            { error: "Failed to evaluate response" },
            { status: 500 }
        );
    }
}
