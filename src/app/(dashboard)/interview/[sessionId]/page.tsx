"use client";

import { useState, useEffect, useCallback, use } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Clock, Loader2 } from "lucide-react";
import { InterviewUI } from "@/components/InterviewUI";
import { CodeEditor } from "@/components/CodeEditor";
import { cn, getTrackLabel, getDifficultyColor } from "@/lib/utils";
import type { Question, InterviewSession } from "@/types";

interface InterviewPageProps {
    params: Promise<{ sessionId: string }>;
}

export default function InterviewPage({ params }: InterviewPageProps) {
    const router = useRouter();
    const { sessionId } = use(params);

    const [session, setSession] = useState<InterviewSession | null>(null);
    const [questions, setQuestions] = useState<Question[]>([]);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [isLoading, setIsLoading] = useState(true);
    const [isEvaluating, setIsEvaluating] = useState(false);
    const [streamingFeedback, setStreamingFeedback] = useState("");
    const [codeSnippet, setCodeSnippet] = useState("");
    const [elapsedTime, setElapsedTime] = useState(0);
    const [userPlan, setUserPlan] = useState<"FREE" | "PRO">("FREE");

    // Fetch session data
    useEffect(() => {
        const fetchSession = async () => {
            try {
                const response = await fetch(`/api/interview/${sessionId}`);
                if (!response.ok) {
                    const errorData = await response.json().catch(() => ({}));
                    throw new Error(errorData.error || `Failed to fetch session (${response.status})`);
                }

                const data = await response.json();
                setSession(data.session);
                setQuestions(data.questions);
                setIsLoading(false);
            } catch (error) {
                console.error("Error fetching session:", error);
                router.push("/dashboard");
            }
        };

        const fetchUserPlan = async () => {
            try {
                const response = await fetch("/api/dashboard");
                if (response.ok) {
                    const data = await response.json();
                    setUserPlan(data.user.plan || "FREE");
                }
            } catch (error) {
                console.log("Could not fetch user plan:", error);
            }
        };

        fetchSession();
        fetchUserPlan();
    }, [sessionId, router]);

    // Timer
    useEffect(() => {
        const timer = setInterval(() => {
            setElapsedTime((prev) => prev + 1);
        }, 1000);
        return () => clearInterval(timer);
    }, []);

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
    };

    const handleAnswer = useCallback(async (answer: string) => {
        if (!session || !questions[currentQuestionIndex]) return;

        setIsEvaluating(true);
        setStreamingFeedback("");

        try {
            const response = await fetch("/api/interview/evaluate", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    sessionId,
                    questionId: questions[currentQuestionIndex].id,
                    answer,
                    codeSnippet: questions[currentQuestionIndex].type === "CODING" ? codeSnippet : undefined,
                }),
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.error || `Failed to evaluate (${response.status})`);
            }

            if (!response.body) {
                throw new Error("No response body from evaluation");
            }

            // Handle streaming response
            const reader = response.body.getReader();
            const decoder = new TextDecoder();

            while (true) {
                const { done, value } = await reader.read();
                if (done) break;

                const chunk = decoder.decode(value);
                setStreamingFeedback((prev) => prev + chunk);
            }

            // Update question with response
            setQuestions((prev) =>
                prev.map((q, i) =>
                    i === currentQuestionIndex
                        ? { ...q, response: { id: "", questionId: q.id, answer } }
                        : q
                )
            );
        } catch (error) {
            console.error("Error evaluating answer:", error);
        } finally {
            setIsEvaluating(false);
        }
    }, [session, questions, currentQuestionIndex, sessionId, codeSnippet]);

    const handleNextQuestion = useCallback(async () => {
        if (currentQuestionIndex < questions.length - 1) {
            setCurrentQuestionIndex((prev) => prev + 1);
            setStreamingFeedback("");
            setCodeSnippet("");
        } else {
            // Complete interview
            try {
                await fetch("/api/interview/complete", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ sessionId }),
                });
            } catch (error) {
                console.error("Failed to mark interview as complete:", error);
            }

            router.push(`/reports/${sessionId}`);
        }
    }, [currentQuestionIndex, questions.length, router, sessionId]);

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-black">
                <div className="flex flex-col items-center gap-4">
                    <Loader2 className="h-10 w-10 animate-spin text-violet-500" />
                    <p className="text-gray-400">Loading interview...</p>
                </div>
            </div>
        );
    }

    const currentQuestion = questions[currentQuestionIndex];
    const isCodingQuestion = currentQuestion?.type === "CODING";

    return (
        <div className="min-h-screen bg-black">
            {/* Header */}
            <header className="sticky top-0 z-50 border-b border-white/10 bg-black/80 backdrop-blur-xl">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16">
                        <div className="flex items-center gap-4">
                            <Link
                                href="/dashboard"
                                className="p-2 rounded-lg text-gray-400 hover:text-white hover:bg-white/10 transition-colors"
                            >
                                <ArrowLeft className="h-5 w-5" />
                            </Link>
                            <div>
                                <h1 className="font-semibold text-white">
                                    {session && getTrackLabel(session.track)} Interview
                                </h1>
                                <div className="flex items-center gap-2 text-sm">
                                    {session && (
                                        <span className={cn("px-2 py-0.5 rounded-full text-xs", getDifficultyColor(session.difficulty))}>
                                            {session.difficulty}
                                        </span>
                                    )}
                                    <span className="text-gray-500">
                                        Question {currentQuestionIndex + 1} of {questions.length}
                                    </span>
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center gap-4">
                            <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/5">
                                <Clock className="h-4 w-4 text-gray-400" />
                                <span className="font-mono text-white">{formatTime(elapsedTime)}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Progress Bar */}
                <div className="h-1 bg-white/10">
                    <div
                        className="h-full bg-gradient-to-r from-violet-500 to-indigo-600 transition-all duration-300"
                        style={{ width: `${((currentQuestionIndex + 1) / questions.length) * 100}%` }}
                    />
                </div>
            </header>

            {/* Main Content */}
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className={cn("grid gap-8", isCodingQuestion ? "lg:grid-cols-2" : "max-w-3xl mx-auto")}>
                    {/* Interview UI */}
                    <div className="min-h-[500px]">
                        <InterviewUI
                            questions={questions}
                            currentQuestionIndex={currentQuestionIndex}
                            onAnswer={handleAnswer}
                            onNextQuestion={handleNextQuestion}
                            isEvaluating={isEvaluating}
                            streamingFeedback={streamingFeedback}
                            isPro={userPlan === "PRO"}
                        />
                    </div>

                    {/* Code Editor (for coding questions) */}
                    {isCodingQuestion && (
                        <div>
                            <h3 className="text-lg font-semibold text-white mb-4">Code Editor</h3>
                            <CodeEditor
                                value={codeSnippet}
                                onChange={setCodeSnippet}
                                language="javascript"
                                height="500px"
                            />
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}
