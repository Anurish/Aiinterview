"use server";

import { groq } from "@/lib/ai";
import type { LogEntry, ExecutionResult } from "@/lib/code-execution";

const MODEL = "llama-3.3-70b-versatile";

export async function simulateExecution(code: string, language: string): Promise<ExecutionResult> {
    const startTime = performance.now();

    // Safety check: Don't simulate empty code
    if (!code.trim()) {
        return {
            output: [],
            success: false,
            error: "No code to execute",
            executionTime: 0
        };
    }

    const systemPrompt = `You are a Code Execution Simulator.
You will be properly provided code written in ${language}.
Your goal is to PREDICT exactly what the output (stdout) and errors (stderr) would be if this code was run in a standard environment.

Rules:
1. Simulate standard library behavior realistically.
2. If there is a syntax error, report the error message as it would appear in a compiler/interpreter.
3. If there is an infinite loop, stop after a reasonable simulated iteration and warn.
4. Input() functions should be assumed to receive empty input or fail unless mocked, but for this simulation, assume no input provided.

Return ONLY a JSON object with:
- output: Array of strings (stdout lines)
- error: String (stderr content or null if success)
- success: Boolean (true if ran without error, false if runtime/syntax error)

Example Output:
{
  "output": ["Hello World", "Count is 5"],
  "error": null,
  "success": true
}
`;

    try {
        const response = await groq.chat.completions.create({
            model: MODEL,
            messages: [
                { role: "system", content: systemPrompt },
                { role: "user", content: `Code to execute:\n\`\`\`${language}\n${code}\n\`\`\`` }
            ],
            temperature: 0.1, // Deterministic
            response_format: { type: "json_object" }
        });

        const content = response.choices[0].message.content || "{}";
        const result = JSON.parse(content);

        const executionTime = performance.now() - startTime;

        // Convert string output to LogEntry[]
        const logs: LogEntry[] = result.output.map((line: string) => ({
            type: "log",
            content: line,
            timestamp: executionTime // Simulated timestamp
        })).concat(
            result.error ? [{
                type: "error",
                content: result.error,
                timestamp: executionTime
            }] : []
        );

        return {
            output: logs,
            error: result.error || undefined,
            success: result.success,
            executionTime
        };

    } catch (e: any) {
        console.error("AI Simulation failed", e);
        return {
            output: [],
            error: "Failed to simulate execution: " + e.message,
            success: false,
            executionTime: performance.now() - startTime
        };
    }
}
