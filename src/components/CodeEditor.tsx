"use client";

import { useRef, useCallback } from "react";
import Editor, { OnMount } from "@monaco-editor/react";
import type { editor } from "monaco-editor";
import { cn } from "@/lib/utils";

interface CodeEditorProps {
    value: string;
    onChange: (value: string) => void;
    language?: string;
    height?: string;
    readOnly?: boolean;
    className?: string;
}

const LANGUAGE_OPTIONS = [
    { value: "javascript", label: "JavaScript" },
    { value: "typescript", label: "TypeScript" },
    { value: "python", label: "Python" },
    { value: "java", label: "Java" },
    { value: "cpp", label: "C++" },
    { value: "go", label: "Go" },
];

export function CodeEditor({
    value,
    onChange,
    language = "javascript",
    height = "400px",
    readOnly = false,
    className,
}: CodeEditorProps) {
    const editorRef = useRef<editor.IStandaloneCodeEditor | null>(null);

    const handleEditorMount: OnMount = useCallback((editor) => {
        editorRef.current = editor;
        editor.focus();
    }, []);

    const handleEditorChange = useCallback(
        (value: string | undefined) => {
            onChange(value || "");
        },
        [onChange]
    );

    return (
        <div className={cn("rounded-xl overflow-hidden border border-white/10", className)}>
            {/* Editor Header */}
            <div className="flex items-center justify-between px-4 py-2 bg-[#1e1e1e] border-b border-white/10">
                <div className="flex items-center gap-2">
                    <div className="flex gap-1.5">
                        <div className="h-3 w-3 rounded-full bg-red-500" />
                        <div className="h-3 w-3 rounded-full bg-yellow-500" />
                        <div className="h-3 w-3 rounded-full bg-green-500" />
                    </div>
                    <span className="ml-2 text-xs text-gray-500">Code Editor</span>
                </div>
                <select
                    value={language}
                    onChange={(e) => {
                        // Language change would need to be lifted to parent
                    }}
                    className="px-2 py-1 text-xs rounded bg-white/5 border border-white/10 text-gray-400 focus:outline-none focus:ring-1 focus:ring-violet-500"
                    disabled
                >
                    {LANGUAGE_OPTIONS.map((lang) => (
                        <option key={lang.value} value={lang.value}>
                            {lang.label}
                        </option>
                    ))}
                </select>
            </div>

            {/* Monaco Editor */}
            <Editor
                height={height}
                language={language}
                value={value}
                theme="vs-dark"
                onChange={handleEditorChange}
                onMount={handleEditorMount}
                options={{
                    readOnly,
                    minimap: { enabled: false },
                    fontSize: 14,
                    fontFamily: "'Fira Code', 'Consolas', monospace",
                    fontLigatures: true,
                    lineNumbers: "on",
                    roundedSelection: true,
                    scrollBeyondLastLine: false,
                    automaticLayout: true,
                    tabSize: 2,
                    wordWrap: "on",
                    padding: { top: 16 },
                    cursorBlinking: "smooth",
                    cursorSmoothCaretAnimation: "on",
                    smoothScrolling: true,
                }}
                loading={
                    <div className="flex items-center justify-center h-full bg-[#1e1e1e]">
                        <div className="flex flex-col items-center gap-2">
                            <div className="h-8 w-8 border-2 border-violet-500 border-t-transparent rounded-full animate-spin" />
                            <span className="text-sm text-gray-500">Loading editor...</span>
                        </div>
                    </div>
                }
            />
        </div>
    );
}
