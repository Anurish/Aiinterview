
"use client";

import { useState, useRef, useEffect } from "react";
import { Play, CheckCircle, RotateCcw, ChevronRight, XCircle, Layout, MessageSquare } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { CodeEditor } from "@/components/CodeEditor";
import { ConsoleOutput } from "@/components/ConsoleOutput";
import { InterviewChat } from "@/components/InterviewChat";
import { useAiInterviewer } from "@/hooks/useAiInterviewer";
import { executeCode } from "@/lib/code-execution";
import type { LogEntry } from "@/lib/code-execution";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface TestCase {
    type: "regex" | "execution";
    value: string;
    message: string;
}

interface Lesson {
    id: string;
    title: string;
    slug: string;
    description: string;
    content: string;
    initialCode: string | null;
    solutionCode: string | null;
    testCases: string | null; // JSON string
}

interface UserProgress {
    completed: boolean;
    userCode?: string | null;
}

interface LessonWorkspaceProps {
    lesson: Lesson;
    progress: UserProgress | null;
    nextLessonSlug?: string;
    language?: string;
}

export function LessonWorkspace({ lesson, progress, nextLessonSlug, language = "javascript" }: LessonWorkspaceProps) {
    const [code, setCode] = useState(progress?.userCode || lesson.initialCode || "");
    const [output, setOutput] = useState<LogEntry[]>([]);
    const [executionError, setExecutionError] = useState<string | undefined>();
    const [executionTime, setExecutionTime] = useState<number | undefined>();
    const [isRunning, setIsRunning] = useState(false);
    const [testResults, setTestResults] = useState<{ passed: boolean; message: string }[] | null>(null);
    const [isCompleted, setIsCompleted] = useState(progress?.completed || false);
    const [aiFeedback, setAiFeedback] = useState<string | null>(null);
    const [isGeneratingFeedback, setIsGeneratingFeedback] = useState(false);
    const router = useRouter();

    // AI Interviewer Hook
    const { state: interviewState, handleUserMessage, handleCodeExecution: reportToAi } = useAiInterviewer({
        title: lesson.title,
        description: lesson.description,
        content: lesson.content
    });

    const handleRun = async () => {
        setIsRunning(true);
        setTestResults(null);
        setOutput([]);
        setExecutionError(undefined);
        setExecutionTime(undefined);
        setAiFeedback(null);

        // 1. Execute Code
        console.log("[DEBUG] Executing code:", code, "Language:", language);
        const result = await executeCode(code, language);
        console.log("[DEBUG] Execution result:", result);

        setExecutionTime(result.executionTime);
        setOutput(result.output);

        if (result.error) {
            setExecutionError(result.error);
            setIsRunning(false);
            // Report error to AI
            reportToAi(false, result.output.map(e => e.content), result.error);
            return;
        }

        // 2. Run Tests
        const tests: TestCase[] = JSON.parse(lesson.testCases || "[]");
        const results = tests.map((test) => {
            if (test.type === "regex") {
                const regex = new RegExp(test.value, "m");
                const pass = regex.test(code);
                return { passed: pass, message: test.message };
            }
            return { passed: true, message: "Unknown test type" };
        });

        setTestResults(results);

        const allPassed = results.every((r) => r.passed);
        if (allPassed && !isCompleted) {
            setIsCompleted(true);
            // Save progress
            await fetch("/api/learn/progress", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    lessonId: lesson.id,
                    completed: true,
                    userCode: code,
                }),
            });
            // Removed router.refresh() - it was clearing the output state

            // Report success to AI
            reportToAi(true, result.output.map(e => e.content));
        } else if (!allPassed) {
            // Generate AI Feedback
            setIsGeneratingFeedback(true);
            try {
                const res = await fetch("/api/learn/feedback", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        lessonTitle: lesson.title,
                        description: lesson.description, // Simplified, maybe exclude full content
                        userCode: code,
                        testResults: results.filter(r => !r.passed),
                        output: result.output.map(e => e.content)
                    }),
                });
                const data = await res.json();
                if (data.feedback) {
                    setAiFeedback(data.feedback);
                }
            } catch (e) {
                console.error("Failed to get AI feedback", e);
            } finally {
                setIsGeneratingFeedback(false);
            }

            // Save progress (code only)
            await fetch("/api/learn/progress", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    lessonId: lesson.id,
                    completed: isCompleted,
                    userCode: code,
                }),
            });

            // Report partial success/failure to AI
            reportToAi(false, result.output.map(e => e.content));
        } else {
            // Save progress (code only)
            await fetch("/api/learn/progress", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    lessonId: lesson.id,
                    completed: isCompleted, // Keep existing completion status
                    userCode: code,
                }),
            });

            // Report partial success to AI (if code ran but tests failed)
            reportToAi(false, result.output.map(e => e.content));
        }

        setIsRunning(false);
    };

    const handleReset = () => {
        if (confirm("Reset code to initial state?")) {
            setCode(lesson.initialCode || "");
            setOutput([]);
            setExecutionError(undefined);
            setExecutionTime(undefined);
            setTestResults(null);
            setAiFeedback(null);
        }
    };

    const handleClearConsole = () => {
        setOutput([]);
        setExecutionError(undefined);
        setExecutionTime(undefined);
        setTestResults(null);
    };

    return (
        <div className="flex h-[calc(100vh-80px)] overflow-hidden">
            {/* Left Panel: Chat / Interviewer */}
            <div className="w-[400px] min-w-[350px] flex flex-col bg-[#0f0f10] border-r border-white/10 z-20 shadow-2xl">
                <InterviewChat
                    title={lesson.title}
                    messages={interviewState.messages}
                    isAiTyping={interviewState.isAiTyping}
                    onSendMessage={handleUserMessage}
                    phase={interviewState.phase}
                    hasNextLesson={!!nextLessonSlug}
                    onNextPhase={() => {
                        if (nextLessonSlug) {
                            router.push(`/learn/${language}/${nextLessonSlug}`);
                        } else {
                            router.push('/dashboard');
                        }
                    }}
                />
            </div>

            {/* Right Panel: Code Workspace */}
            <div className="flex-1 flex flex-col bg-[#1e1e1e]">
                {/* Toolbar */}
                <div className="h-12 border-b border-white/10 flex items-center justify-between px-4 bg-[#27272a]">
                    <div className="flex items-center gap-2">
                        <h2 className="text-sm font-medium text-gray-300">script.js</h2>
                    </div>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={handleReset}
                            className="p-2 rounded-md hover:bg-white/10 text-gray-400 transition-colors"
                            title="Reset Code"
                        >
                            <RotateCcw className="w-4 h-4" />
                        </button>
                        <button
                            onClick={handleRun}
                            disabled={isRunning}
                            className={`flex items-center gap-2 px-4 py-1.5 rounded-md text-sm font-medium transition-all ${isCompleted
                                ? "bg-green-600 text-white hover:bg-green-500"
                                : "bg-blue-600 text-white hover:bg-blue-500"
                                } disabled:opacity-50`}
                        >
                            {isRunning ? (
                                "Running..."
                            ) : (
                                <>
                                    <Play className="w-4 h-4 fill-current" />
                                    Run Code
                                </>
                            )}
                        </button>
                    </div>
                </div>

                {/* Editor & Console Split */}
                <div className="flex-1 flex flex-col">
                    <div className="flex-1 relative">
                        <CodeEditor
                            value={code}
                            onChange={setCode}
                            language={language}
                            height="100%"
                            className="border-0 rounded-none h-full"
                        />
                        {/* AI Feedback Popup */}
                        {aiFeedback && (
                            <div className="absolute bottom-4 right-4 bg-gray-800 border border-yellow-500/50 text-gray-200 p-4 rounded-lg shadow-xl max-w-md animate-in slide-in-from-bottom-2 z-10">
                                <div className="flex items-start justify-between gap-2 mb-1">
                                    <h4 className="text-sm font-bold text-yellow-500 flex items-center gap-1">
                                        AI Tutor Hint
                                    </h4>
                                    <button onClick={() => setAiFeedback(null)} className="text-gray-500 hover:text-white">
                                        <XCircle className="w-4 h-4" />
                                    </button>
                                </div>
                                <p className="text-sm leading-relaxed">{aiFeedback}</p>
                            </div>
                        )}
                        {isGeneratingFeedback && (
                            <div className="absolute bottom-4 right-4 bg-gray-800 text-gray-400 px-3 py-1.5 rounded-full text-xs animate-pulse z-10 border border-white/10">
                                AI is analyzing your code...
                            </div>
                        )}
                    </div>

                    {/* Console / Output Panel */}
                    <ConsoleOutput
                        output={output}
                        error={executionError}
                        executionTime={executionTime}
                        isRunning={isRunning}
                        testResults={testResults}
                        isCompleted={isCompleted}
                        nextLessonSlug={nextLessonSlug}
                        onClear={handleClearConsole}
                    />
                </div>
            </div>
        </div>
    );
}
