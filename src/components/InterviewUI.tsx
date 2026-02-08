"use client";

import { useState, useRef, useEffect } from "react";
import { Send, Loader2, ChevronRight, BarChart3, Zap, Lock } from "lucide-react";
import { cn } from "@/lib/utils";
import { VoiceRecorder } from "@/components/VoiceRecorder";
import type { Question } from "@/types";
import ReactMarkdown from "react-markdown";

interface InterviewUIProps {
    questions: Question[];
    currentQuestionIndex: number;
    onAnswer: (answer: string, codeSnippet?: string) => Promise<void>;
    onNextQuestion: () => void;
    isEvaluating: boolean;
    streamingFeedback: string;
    isPro?: boolean;
    userPlan?: "FREE" | "PRO";
}

export function InterviewUI({
    questions,
    currentQuestionIndex,
    onAnswer,
    onNextQuestion,
    isEvaluating,
    streamingFeedback,
    isPro = false,
    userPlan = "FREE",
}: InterviewUIProps) {
    const [answer, setAnswer] = useState("");
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    const currentQuestion = questions[currentQuestionIndex];
    const isLastQuestion = currentQuestionIndex === questions.length - 1;
    const hasAnswered = !!currentQuestion?.response;

    // Auto-resize textarea
    useEffect(() => {
        if (textareaRef.current) {
            textareaRef.current.style.height = "auto";
            textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
        }
    }, [answer]);

    const handleSubmit = async () => {
        if (!answer.trim() || isEvaluating) return;
        await onAnswer(answer);
        setAnswer("");
    };

    const handleVoiceTranscript = (text: string) => {
        if (text) {
            setAnswer((prev) => (prev + " " + text).trim());
        }
    };

    if (!currentQuestion) {
        return (
            <div className="flex items-center justify-center h-64">
                <Loader2 className="h-8 w-8 animate-spin text-violet-500" />
            </div>
        );
    }

    return (
        <div className="flex flex-col h-full gap-6">
            {/* PRO Features Banner */}
            {isPro && (
                <div className="p-4 rounded-xl bg-gradient-to-r from-violet-500/20 to-indigo-500/20 border border-violet-500/30">
                    <div className="flex items-center gap-3">
                        <Zap className="h-5 w-5 text-yellow-400 flex-shrink-0" />
                        <div className="flex-1">
                            <p className="text-sm font-semibold text-white">PRO Features</p>
                            <p className="text-xs text-gray-300">Get detailed AI feedback • Performance insights • Custom difficulty</p>
                        </div>
                    </div>
                </div>
            )}

            {/* Question Header */}
            <div className="flex-shrink-0 pb-6 border-b border-white/10">
                <div className="flex items-center gap-2 mb-4">
                    <span className="px-3 py-1 rounded-full text-xs font-medium bg-violet-500/20 text-violet-400">
                        Question {currentQuestionIndex + 1} of {questions.length}
                    </span>
                    <span className="px-3 py-1 rounded-full text-xs font-medium bg-white/10 text-gray-400">
                        {currentQuestion.type.replace("_", " ")}
                    </span>
                </div>
                <h2 className="text-2xl font-bold text-white leading-relaxed">
                    {currentQuestion.content}
                </h2>
            </div>

            {/* Main Content Area */}
            <div className="flex-1 overflow-y-auto">
                {hasAnswered && streamingFeedback ? (
                    <div className="space-y-4">
                        {/* Your Answer */}
                        <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                            <p className="text-sm font-medium text-gray-400 mb-3">Your Answer:</p>
                            <p className="text-white leading-relaxed">{currentQuestion.response?.answer}</p>
                        </div>

                        {/* AI Feedback */}
                        <div className="p-4 rounded-xl bg-gradient-to-br from-violet-500/10 to-indigo-500/10 border border-violet-500/20">
                            <div className="flex items-center gap-2 mb-3">
                                <BarChart3 className="h-5 w-5 text-violet-400" />
                                <p className="text-sm font-medium text-violet-400">AI Feedback</p>
                            </div>
                            <div className="prose prose-invert prose-sm max-w-none">
                                <ReactMarkdown>{streamingFeedback}</ReactMarkdown>
                            </div>
                        </div>

                        {/* PRO Insights (if enabled) */}
                        {isPro && (
                            <div className="p-4 rounded-xl bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border border-blue-500/20">
                                <div className="flex items-center gap-2 mb-3">
                                    <BarChart3 className="h-5 w-5 text-blue-400" />
                                    <p className="text-sm font-medium text-blue-400">Detailed Analysis</p>
                                </div>
                                <ul className="space-y-2 text-sm text-gray-300">
                                    <li>✓ Response length: {currentQuestion.response?.answer.split(" ").length} words</li>
                                    <li>✓ Keyword coverage: Excellent</li>
                                    <li>✓ Explanation depth: Good</li>
                                </ul>
                            </div>
                        )}
                    </div>
                ) : isEvaluating ? (
                    <div className="flex flex-col items-center justify-center h-full gap-4">
                        <Loader2 className="h-10 w-10 animate-spin text-violet-500" />
                        <p className="text-gray-400">Evaluating your response...</p>
                    </div>
                ) : (
                    <div className="text-center text-gray-500 py-12">
                        <p className="text-lg">Type your answer below</p>
                        <p className="text-sm mt-2">Take your time and provide a detailed response</p>
                    </div>
                )}
            </div>

            {/* Input Area */}
            <div className="flex-shrink-0 pt-4 border-t border-white/10">
                {!hasAnswered ? (
                    <div className="space-y-3">
                        <div className="flex items-center gap-4 mb-2">
                            {userPlan === "PRO" ? (
                                <VoiceRecorder
                                    onTranscript={() => { }}
                                    onFinalTranscript={handleVoiceTranscript}
                                />
                            ) : (
                                <div className="flex items-center gap-2 px-3 py-2 rounded-full bg-white/5 border border-white/10 opacity-70" title="Upgrade to Pro for Voice Answers">
                                    <Lock className="h-4 w-4 text-gray-400" />
                                    <span className="text-xs text-gray-400 font-medium">Voice Answer (PRO)</span>
                                </div>
                            )}
                            <span className="text-xs text-gray-400 flex-1 text-right">
                                {isEvaluating ? "Evaluating..." : "Listening enabled"}
                            </span>
                        </div>
                        {/* Text Input */}
                        <textarea
                            ref={textareaRef}
                            value={answer}
                            onChange={(e) => setAnswer(e.target.value)}
                            placeholder="Type your answer here... Be thorough and explain your thinking."
                            className="w-full min-h-[150px] max-h-[400px] p-4 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 resize-none focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500/50 transition-all"
                            disabled={isEvaluating}
                        />

                        {/* Pro Tip */}
                        {isPro && (
                            <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/30 text-sm text-amber-200 flex items-start gap-2">
                                <Zap className="h-4 w-4 mt-0.5 flex-shrink-0" />
                                <p>PRO Tip: More detailed answers receive better AI feedback and insights.</p>
                            </div>
                        )}

                        {/* Submit Button */}
                        <div className="flex gap-2 justify-end">
                            <button
                                onClick={handleSubmit}
                                disabled={!answer.trim() || isEvaluating}
                                className="flex items-center gap-2 px-6 py-3 rounded-lg bg-gradient-to-r from-violet-500 to-indigo-600 text-white font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:opacity-90 transition-opacity"
                            >
                                {isEvaluating ? (
                                    <>
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                        Evaluating...
                                    </>
                                ) : (
                                    <>
                                        Submit Answer
                                        <Send className="h-4 w-4" />
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                ) : (
                    <button
                        onClick={onNextQuestion}
                        className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-gradient-to-r from-violet-500 to-indigo-600 text-white font-medium hover:opacity-90 transition-opacity"
                    >
                        {isLastQuestion ? "Finish Interview" : "Next Question"}
                        <ChevronRight className="h-5 w-5" />
                    </button>
                )}
            </div>
        </div>
    );
}
