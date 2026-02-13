"use client";

export interface LogEntry {
    type: "log" | "error" | "warn" | "info" | "result";
    content: string;
    timestamp: number; // ms since execution started
}

import { simulateExecution } from "@/lib/ai-execution";



export interface ExecutionResult {
    output: LogEntry[];
    error?: string;
    success: boolean;
    executionTime: number; // total ms
}

export const executeCode = async (code: string, language: string = "javascript"): Promise<ExecutionResult> => {
    // If not javascript/typescript, use AI simulation
    if (language !== "javascript" && language !== "typescript") {
        return await simulateExecution(code, language);
    }

    const logs: LogEntry[] = [];
    const startTime = performance.now();

    const formatArg = (arg: any): string => {
        if (typeof arg === 'object') {
            try {
                return JSON.stringify(arg, null, 2);
            } catch {
                return String(arg);
            }
        }
        return String(arg);
    };

    // Create a custom console object to capture output
    const customConsole = {
        log: (...args: any[]) => {
            logs.push({
                type: "log",
                content: args.map(formatArg).join(" "),
                timestamp: performance.now() - startTime,
            });
        },
        error: (...args: any[]) => {
            logs.push({
                type: "error",
                content: args.map(formatArg).join(" "),
                timestamp: performance.now() - startTime,
            });
        },
        warn: (...args: any[]) => {
            logs.push({
                type: "warn",
                content: args.map(formatArg).join(" "),
                timestamp: performance.now() - startTime,
            });
        },
        info: (...args: any[]) => {
            logs.push({
                type: "info",
                content: args.map(formatArg).join(" "),
                timestamp: performance.now() - startTime,
            });
        },
    };

    try {
        // Create an async function that takes console as a parameter
        const AsyncFunction = Object.getPrototypeOf(async function () { }).constructor;
        const fn = new AsyncFunction('console', code);

        // Execute with our custom console
        await fn(customConsole);

        const executionTime = performance.now() - startTime;

        return {
            output: logs,
            success: true,
            executionTime,
        };
    } catch (err: any) {
        const executionTime = performance.now() - startTime;

        return {
            output: logs,
            error: err.message || String(err),
            success: false,
            executionTime,
        };
    }
};
