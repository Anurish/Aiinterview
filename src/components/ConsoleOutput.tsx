"use client";

import React, { useState, useEffect, useRef } from "react";
import { CheckCircle, XCircle, ChevronRight, Terminal, Trash2, ChevronDown, ChevronUp } from "lucide-react";
import type { LogEntry } from "@/lib/code-execution";
import Link from "next/link";

interface TestResult {
    passed: boolean;
    message: string;
}

interface ConsoleOutputProps {
    output: LogEntry[];
    error?: string;
    executionTime?: number;
    isRunning: boolean;
    testResults: TestResult[] | null;
    isCompleted: boolean;
    nextLessonSlug?: string;
    onClear: () => void;
}

const LOG_STYLES: Record<LogEntry["type"], { color: string; icon: string; bg: string; border: string }> = {
    log: {
        color: "text-emerald-400",
        icon: "›",
        bg: "bg-emerald-500/5",
        border: "border-emerald-500/10",
    },
    error: {
        color: "text-red-400",
        icon: "✕",
        bg: "bg-red-500/8",
        border: "border-red-500/15",
    },
    warn: {
        color: "text-amber-400",
        icon: "⚠",
        bg: "bg-amber-500/5",
        border: "border-amber-500/10",
    },
    info: {
        color: "text-sky-400",
        icon: "ℹ",
        bg: "bg-sky-500/5",
        border: "border-sky-500/10",
    },
    result: {
        color: "text-violet-400",
        icon: "←",
        bg: "bg-violet-500/5",
        border: "border-violet-500/10",
    },
};

function formatTimestamp(ms: number): string {
    if (ms < 1) return "<1ms";
    if (ms < 1000) return `${Math.round(ms)}ms`;
    return `${(ms / 1000).toFixed(2)}s`;
}

function highlightValue(content: string): React.ReactNode {
    // Simple syntax highlighting for console output values
    const parts: React.ReactNode[] = [];
    let remaining = content;
    let key = 0;

    // Try to parse as JSON for object highlighting
    try {
        const parsed = JSON.parse(remaining);
        if (typeof parsed === "object" && parsed !== null) {
            return (
                <span className="text-gray-300">
                    <pre className="inline whitespace-pre-wrap font-mono text-xs leading-relaxed">
                        {colorizeJSON(remaining)}
                    </pre>
                </span>
            );
        }
    } catch {
        // Not JSON, do inline highlighting
    }

    // Highlight patterns inline
    const regex = /("(?:[^"\\]|\\.)*")|(\b\d+\.?\d*\b)|(true|false|null|undefined|NaN|Infinity)/g;
    let lastIndex = 0;
    let match;

    while ((match = regex.exec(remaining)) !== null) {
        // Text before the match
        if (match.index > lastIndex) {
            parts.push(<span key={key++} className="text-gray-300">{remaining.slice(lastIndex, match.index)}</span>);
        }

        if (match[1]) {
            // String
            parts.push(<span key={key++} className="text-emerald-300">{match[1]}</span>);
        } else if (match[2]) {
            // Number
            parts.push(<span key={key++} className="text-cyan-300">{match[2]}</span>);
        } else if (match[3]) {
            // Boolean/null/undefined
            parts.push(<span key={key++} className="text-amber-300">{match[3]}</span>);
        }

        lastIndex = match.index + match[0].length;
    }

    // Remaining text
    if (lastIndex < remaining.length) {
        parts.push(<span key={key++} className="text-gray-300">{remaining.slice(lastIndex)}</span>);
    }

    if (parts.length === 0) {
        return <span className="text-gray-300">{content}</span>;
    }

    return <>{parts}</>;
}

function colorizeJSON(json: string): React.ReactNode {
    const parts: React.ReactNode[] = [];
    const regex = /("(?:[^"\\]|\\.)*")\s*:/g;
    let lastIndex = 0;
    let key = 0;
    let match;

    while ((match = regex.exec(json)) !== null) {
        if (match.index > lastIndex) {
            parts.push(
                <span key={key++} className="text-gray-400">
                    {json.slice(lastIndex, match.index)}
                </span>
            );
        }
        parts.push(<span key={key++} className="text-violet-300">{match[1]}</span>);
        parts.push(<span key={key++} className="text-gray-500">:</span>);
        lastIndex = match.index + match[0].length;
    }

    if (lastIndex < json.length) {
        // Highlight values in remaining
        const rest = json.slice(lastIndex);
        parts.push(<span key={key++}>{highlightValue(rest)}</span>);
    }

    return <>{parts}</>;
}

export function ConsoleOutput({
    output,
    error,
    executionTime,
    isRunning,
    testResults,
    isCompleted,
    nextLessonSlug,
    onClear,
}: ConsoleOutputProps) {
    const scrollRef = useRef<HTMLDivElement>(null);
    const [isExpanded, setIsExpanded] = useState(true);

    // Auto-scroll to bottom when new output appears
    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [output, testResults, error]);

    const hasContent = output.length > 0 || testResults !== null || error;

    return (
        <div className={`flex flex-col border-t border-white/10 transition-all duration-300 ${isExpanded ? "h-1/3 min-h-[180px]" : "h-[42px]"}`}>
            {/* Terminal Header */}
            <div className="console-header flex items-center justify-between px-4 py-2 border-b border-white/[0.06] shrink-0">
                <div className="flex items-center gap-3">
                    <div className="flex gap-1.5">
                        <div className="h-2.5 w-2.5 rounded-full bg-[#ff5f57] shadow-[0_0_6px_rgba(255,95,87,0.4)]" />
                        <div className="h-2.5 w-2.5 rounded-full bg-[#febc2e] shadow-[0_0_6px_rgba(254,188,46,0.4)]" />
                        <div className="h-2.5 w-2.5 rounded-full bg-[#28c840] shadow-[0_0_6px_rgba(40,200,64,0.4)]" />
                    </div>
                    <div className="flex items-center gap-2">
                        <Terminal className="w-3.5 h-3.5 text-gray-500" />
                        <span className="text-xs font-medium text-gray-400 tracking-wide uppercase">Console</span>
                    </div>
                    {executionTime !== undefined && hasContent && (
                        <span className="console-time-badge text-[10px] font-mono px-2 py-0.5 rounded-full">
                            ⚡ {formatTimestamp(executionTime)}
                        </span>
                    )}
                    {isCompleted && (
                        <span className="text-[10px] text-emerald-400 flex items-center gap-1 font-medium">
                            <CheckCircle className="w-3 h-3" /> Completed
                        </span>
                    )}
                </div>
                <div className="flex items-center gap-1">
                    {hasContent && (
                        <button
                            onClick={onClear}
                            className="p-1.5 rounded-md hover:bg-white/5 text-gray-500 hover:text-gray-300 transition-colors"
                            title="Clear Console"
                        >
                            <Trash2 className="w-3.5 h-3.5" />
                        </button>
                    )}
                    <button
                        onClick={() => setIsExpanded(!isExpanded)}
                        className="p-1.5 rounded-md hover:bg-white/5 text-gray-500 hover:text-gray-300 transition-colors"
                        title={isExpanded ? "Collapse" : "Expand"}
                    >
                        {isExpanded ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronUp className="w-3.5 h-3.5" />}
                    </button>
                </div>
            </div>

            {/* Console Body */}
            {isExpanded && (
                <div ref={scrollRef} className="console-body flex-1 overflow-y-auto p-3 font-mono text-[13px] leading-relaxed">
                    {/* Scanline effect overlay */}
                    <div className="console-scanline" />

                    {/* Empty State */}
                    {!hasContent && !isRunning && (
                        <div className="flex items-center gap-2 text-gray-600 select-none">
                            <span className="text-emerald-500/50 font-bold">❯</span>
                            <span className="italic">Run your code to see output here…</span>
                            <span className="console-cursor" />
                        </div>
                    )}

                    {/* Running State */}
                    {isRunning && output.length === 0 && (
                        <div className="flex items-center gap-2 text-gray-500">
                            <div className="console-spinner" />
                            <span className="animate-pulse">Executing…</span>
                        </div>
                    )}

                    {/* Log Entries */}
                    {output.map((entry, i) => {
                        const style = LOG_STYLES[entry.type];
                        return (
                            <div
                                key={i}
                                className={`console-line ${style.bg} ${style.border} border-l-2 rounded-r-md px-3 py-1.5 mb-1.5 flex items-start gap-2`}
                                style={{ animationDelay: `${i * 50}ms` }}
                            >
                                <span className={`${style.color} font-bold shrink-0 text-sm leading-5 w-4 text-center`}>
                                    {style.icon}
                                </span>
                                <div className="flex-1 min-w-0 overflow-x-auto">
                                    {highlightValue(entry.content)}
                                </div>
                                <span className="text-[10px] text-gray-600 shrink-0 font-mono tabular-nums leading-5">
                                    {formatTimestamp(entry.timestamp)}
                                </span>
                            </div>
                        );
                    })}

                    {/* Error Display */}
                    {error && (
                        <div className="console-line bg-red-500/8 border-l-2 border-red-500/30 rounded-r-md px-3 py-2 mb-1.5 flex items-start gap-2"
                            style={{ animationDelay: `${output.length * 50}ms` }}>
                            <span className="text-red-400 font-bold shrink-0 text-sm leading-5">✕</span>
                            <div className="flex-1">
                                <span className="text-red-300 text-xs font-semibold uppercase tracking-wider block mb-0.5">Error</span>
                                <span className="text-red-200">{error}</span>
                            </div>
                        </div>
                    )}

                    {/* Test Results */}
                    {testResults && (
                        <div className="mt-3 pt-3 border-t border-white/[0.06]">
                            <div className="flex items-center gap-2 mb-2">
                                <span className="text-[10px] font-semibold text-gray-500 uppercase tracking-widest">Test Results</span>
                                <div className="flex-1 h-px bg-white/[0.04]" />
                                <span className={`text-[10px] font-mono ${testResults.every(r => r.passed) ? 'text-emerald-400' : 'text-red-400'}`}>
                                    {testResults.filter(r => r.passed).length}/{testResults.length} passed
                                </span>
                            </div>
                            <div className="space-y-1.5">
                                {testResults.map((result, i) => (
                                    <div
                                        key={i}
                                        className={`console-line flex items-center gap-2 text-sm px-3 py-1.5 rounded-md ${result.passed
                                            ? 'bg-emerald-500/5 text-emerald-400 border border-emerald-500/10'
                                            : 'bg-red-500/5 text-red-400 border border-red-500/10'
                                            }`}
                                        style={{ animationDelay: `${(output.length + i + 1) * 50}ms` }}
                                    >
                                        {result.passed ? (
                                            <CheckCircle className="w-3.5 h-3.5 shrink-0" />
                                        ) : (
                                            <XCircle className="w-3.5 h-3.5 shrink-0" />
                                        )}
                                        <span className="text-xs">{result.message}</span>
                                    </div>
                                ))}
                            </div>

                            {/* Next Lesson Button */}
                            {isCompleted && nextLessonSlug && (
                                <div className="mt-3">
                                    <Link
                                        href={`/learn/${nextLessonSlug}`}
                                        className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-emerald-600 to-emerald-500 text-white text-sm font-medium hover:from-emerald-500 hover:to-emerald-400 transition-all w-full justify-center shadow-lg shadow-emerald-500/20"
                                    >
                                        Next Lesson <ChevronRight className="w-4 h-4" />
                                    </Link>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Blinking cursor at the end when idle */}
                    {hasContent && !isRunning && (
                        <div className="flex items-center gap-2 mt-2 text-gray-600 select-none">
                            <span className="text-emerald-500/40 font-bold">❯</span>
                            <span className="console-cursor" />
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
