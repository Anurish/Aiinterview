"use client";

import { useState, useRef, useEffect } from "react";
import { Send, User, Bot, Sparkles, AlertCircle, CheckCircle, ArrowRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import ReactMarkdown from "react-markdown";
import type { ChatMessage, InterviewState } from "@/types/interview";

interface InterviewChatProps {
    title: string;
    messages: ChatMessage[];
    isAiTyping: boolean;
    onSendMessage: (message: string) => void;
    onNextPhase: () => void;
    phase: InterviewState['phase'];
    hasNextLesson?: boolean;
}

export function InterviewChat({
    title,
    messages,
    isAiTyping,
    onSendMessage,
    onNextPhase,
    phase,
    hasNextLesson = true
}: InterviewChatProps) {
    const [input, setInput] = useState("");
    const scrollRef = useRef<HTMLDivElement>(null);

    // Auto-scroll to bottom
    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages, isAiTyping]);

    const handleSend = () => {
        if (!input.trim()) return;
        onSendMessage(input);
        setInput("");
    };

    return (
        <div className="flex flex-col h-full bg-[#0f0f10] border-r border-white/10 relative overflow-hidden">
            {/* Header */}
            <div className="p-4 border-b border-white/10 bg-[#18181b]/50 backdrop-blur-sm z-10 flex items-center justify-between">
                <div>
                    <h2 className="text-sm font-semibold text-white flex items-center gap-2">
                        <Bot className="w-4 h-4 text-violet-500" />
                        AI Interviewer
                    </h2>
                    <p className="text-xs text-gray-400 mt-0.5 max-w-[200px] truncate">{title}</p>
                </div>
                <div className="flex items-center gap-1.5">
                    <div className={`w-2 h-2 rounded-full ${phase === 'success' ? 'bg-green-500 animate-pulse' : 'bg-emerald-500 animate-pulse'}`} />
                    <span className="text-[10px] uppercase font-mono text-gray-500">Live</span>
                </div>
            </div>

            {/* Chat Body */}
            <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4 scroll-smooth">
                {/* Intro message placeholder if empty */}
                {messages.length === 0 && !isAiTyping && (
                    <div className="flex flex-col items-center justify-center h-full text-center p-6 opacity-50">
                        <div className="w-16 h-16 rounded-full bg-violet-500/10 flex items-center justify-center mb-4">
                            <Sparkles className="w-8 h-8 text-violet-500" />
                        </div>
                        <p className="text-sm text-gray-400">CONNECTING TO INTERVIEWER...</p>
                    </div>
                )}

                <AnimatePresence initial={false}>
                    {messages.map((msg) => (
                        <motion.div
                            key={msg.id}
                            initial={{ opacity: 0, y: 10, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            className={cn(
                                "flex gap-3 max-w-[90%]",
                                msg.role === 'candidate' ? "ml-auto flex-row-reverse" : "mr-auto"
                            )}
                        >
                            {/* Avatar */}
                            <div className={cn(
                                "w-8 h-8 rounded-full flex items-center justify-center shrink-0 border",
                                msg.role === 'interviewer'
                                    ? "bg-violet-500/10 border-violet-500/20 text-violet-400"
                                    : "bg-blue-500/10 border-blue-500/20 text-blue-400"
                            )}>
                                {msg.role === 'interviewer' ? <Bot size={16} /> : <User size={16} />}
                            </div>

                            {/* Message Bubble */}
                            <div className={cn(
                                "rounded-2xl px-4 py-2.5 text-sm leading-relaxed shadow-sm relative group",
                                msg.role === 'interviewer'
                                    ? "bg-[#1e1e1e] border border-white/5 text-gray-200 rounded-tl-none"
                                    : "bg-blue-600 text-white rounded-tr-none"
                            )}>
                                {msg.type === 'error' && (
                                    <div className="flex items-center gap-2 mb-1 text-red-400 font-medium text-xs uppercase tracking-wide">
                                        <AlertCircle size={12} /> Optimization Needed
                                    </div>
                                )}
                                {msg.type === 'success' && (
                                    <div className="flex items-center gap-2 mb-1 text-green-400 font-medium text-xs uppercase tracking-wide">
                                        <CheckCircle size={12} /> Solution Accepted
                                    </div>
                                )}

                                {msg.role === 'interviewer' ? (
                                    <div className="prose prose-invert prose-sm max-w-none prose-p:leading-relaxed prose-pre:bg-black/30 prose-pre:border prose-pre:border-white/10">
                                        <ReactMarkdown>{msg.content}</ReactMarkdown>
                                    </div>
                                ) : (
                                    <div className="whitespace-pre-wrap">{msg.content}</div>
                                )}

                                <span className="text-[10px] opacity-40 mt-1 block text-right">
                                    {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </span>
                            </div>
                        </motion.div>
                    ))}
                </AnimatePresence>

                {/* Typing Indicator */}
                {isAiTyping && (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex gap-3 mr-auto"
                    >
                        <div className="w-8 h-8 rounded-full bg-violet-500/10 border border-violet-500/20 flex items-center justify-center text-violet-400">
                            <Bot size={16} />
                        </div>
                        <div className="bg-[#1e1e1e] border border-white/5 rounded-2xl rounded-tl-none px-4 py-3 flex items-center gap-1.5 h-[42px]">
                            <div className="w-1.5 h-1.5 rounded-full bg-gray-500 animate-bounce" style={{ animationDelay: '0ms' }} />
                            <div className="w-1.5 h-1.5 rounded-full bg-gray-500 animate-bounce" style={{ animationDelay: '150ms' }} />
                            <div className="w-1.5 h-1.5 rounded-full bg-gray-500 animate-bounce" style={{ animationDelay: '300ms' }} />
                        </div>
                    </motion.div>
                )}
            </div>

            {/* Input Area */}
            <div className="p-4 bg-[#0f0f10] border-t border-white/10">
                {phase === 'success' ? (
                    <button
                        onClick={onNextPhase}
                        className={cn(
                            "w-full py-3 rounded-lg text-white font-medium flex items-center justify-center gap-2 transition-all shadow-lg",
                            hasNextLesson
                                ? "bg-green-600 hover:bg-green-500 shadow-green-900/20"
                                : "bg-blue-600 hover:bg-blue-500 shadow-blue-900/20"
                        )}
                    >
                        {hasNextLesson ? "Next Lesson" : "Course Completed"}
                        {hasNextLesson ? <ArrowRight size={16} /> : <CheckCircle size={16} />}
                    </button>
                ) : (
                    <div className="relative">
                        <input
                            type="text"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                            placeholder="Type a message to your interviewer..."
                            className="w-full bg-[#18181b] border border-white/10 rounded-xl pl-4 pr-12 py-3 text-sm focus:outline-none focus:ring-1 focus:ring-violet-500/50 focus:border-violet-500/50 transition-all text-gray-200 placeholder:text-gray-600"
                        />
                        <button
                            onClick={handleSend}
                            disabled={!input.trim()}
                            className="absolute right-2 top-1.5 p-1.5 rounded-lg bg-violet-600 text-white disabled:opacity-50 disabled:bg-gray-700 hover:bg-violet-500 transition-colors"
                        >
                            <Send size={16} />
                        </button>
                    </div>
                )}
                {phase !== 'success' && (
                    <div className="mt-3 flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
                        {["I'm ready!", "Can I get a hint?", "Explain execution flow"].map(hint => (
                            <button
                                key={hint}
                                onClick={() => { onSendMessage(hint); }}
                                className="px-3 py-1.5 rounded-full bg-white/5 hover:bg-white/10 border border-white/5 text-xs text-gray-400 hover:text-white transition-colors whitespace-nowrap"
                            >
                                {hint}
                            </button>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
