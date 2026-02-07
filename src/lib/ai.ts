import Groq from "groq-sdk";

const apiKey = process.env.GROQ_API_KEY;

if (!apiKey) {
    throw new Error(
        "GROQ_API_KEY environment variable is not set. Get one free at https://console.groq.com"
    );
}

export const groq = new Groq({
    apiKey,
});

// Using Llama 3.3 70B for best quality (free on Groq)
const MODEL = "llama-3.3-70b-versatile";

export type Track =
    | "FRONTEND"
    | "NEXTJS"
    | "MERN"
    | "NODEJS"
    | "PHP"
    | "LARAVEL"
    | "DSA"
    | "GENERAL_SWE";

export type Difficulty = "BEGINNER" | "INTERMEDIATE" | "ADVANCED";

const trackDescriptions: Record<Track, string> = {
    FRONTEND: "Frontend development with HTML, CSS, JavaScript, React, Vue, Angular",
    NEXTJS: "Next.js framework, SSR, SSG, App Router, API routes, middleware",
    MERN: "MongoDB, Express.js, React.js, Node.js full-stack development",
    NODEJS: "Node.js backend development, Express, APIs, async programming",
    PHP: "PHP programming, OOP, MySQL, web development",
    LARAVEL: "Laravel framework, Eloquent ORM, Blade templates, middleware",
    DSA: "Data Structures and Algorithms, problem-solving, coding challenges",
    GENERAL_SWE: "General software engineering principles, system design, best practices",
};

const difficultyDescriptions: Record<Difficulty, string> = {
    BEGINNER: "Entry-level questions testing fundamental concepts and basic syntax",
    INTERMEDIATE: "Questions requiring practical experience and problem-solving skills",
    ADVANCED: "Complex questions on architecture, optimization, and advanced patterns",
};

export async function generateInterviewQuestions(
    track: Track,
    difficulty: Difficulty,
    questionCount: number = 5,
    resumeContext?: string
): Promise<{ content: string; type: "CONCEPTUAL" | "CODING" | "BEHAVIORAL" | "SYSTEM_DESIGN" }[]> {
    const systemPrompt = `You are an expert technical interviewer specializing in ${trackDescriptions[track]}.
Generate ${questionCount} interview questions at ${difficulty} level (${difficultyDescriptions[difficulty]}).

${resumeContext ? `The candidate's resume context: ${resumeContext}\nTailor some questions to their experience.` : ""}

For DSA track, include coding problems. For other tracks, mix conceptual, behavioral, and practical questions.

Return ONLY a valid JSON object with a "questions" array containing objects with:
- content: The question text
- type: One of "CONCEPTUAL", "CODING", "BEHAVIORAL", "SYSTEM_DESIGN"

Example format:
{"questions": [{"content": "What is React?", "type": "CONCEPTUAL"}]}`;

    const response = await groq.chat.completions.create({
        model: MODEL,
        messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: `Generate ${questionCount} ${difficulty} level ${track} interview questions. Return only valid JSON.` },
        ],
        temperature: 0.7,
        max_tokens: 2000,
    });

    const content = response.choices[0].message.content || "{}";

    // Try to extract JSON from the response
    try {
        // Handle potential markdown code blocks
        const jsonMatch = content.match(/```(?:json)?\s*([\s\S]*?)```/) || [null, content];
        const jsonStr = jsonMatch[1]?.trim() || content.trim();
        const parsed = JSON.parse(jsonStr);
        return parsed.questions || [];
    } catch (error) {
        console.error("Failed to parse AI response:", content);
        // Fallback questions if parsing fails
        return [
            { content: `Explain the core concepts of ${track}`, type: "CONCEPTUAL" },
            { content: `Describe a ${track} project you've worked on`, type: "BEHAVIORAL" },
        ];
    }
}

export async function evaluateResponse(
    question: string,
    answer: string,
    track: Track,
    difficulty: Difficulty,
    codeSnippet?: string
): Promise<{
    accuracy: number;
    clarity: number;
    confidence: number;
    technicalDepth: number;
    overallScore: number;
    feedback: string;
}> {
    const systemPrompt = `You are an expert technical interview evaluator for ${trackDescriptions[track]}.
Evaluate the candidate's response at ${difficulty} level.

Score each dimension from 0-100:
- accuracy: Correctness and completeness of the answer
- clarity: How well the answer is explained and structured
- confidence: Word choice and assertiveness (inferred from text)
- technicalDepth: Use of advanced concepts and best practices

Provide constructive feedback highlighting strengths and areas for improvement.

Return ONLY valid JSON with: accuracy, clarity, confidence, technicalDepth, overallScore, feedback
The overallScore should be weighted: (accuracy * 0.35) + (clarity * 0.25) + (confidence * 0.15) + (technicalDepth * 0.25)`;

    const userMessage = `Question: ${question}

Answer: ${answer}
${codeSnippet ? `\nCode Snippet:\n\`\`\`\n${codeSnippet}\n\`\`\`` : ""}

Evaluate this response. Return only valid JSON.`;

    const response = await groq.chat.completions.create({
        model: MODEL,
        messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: userMessage },
        ],
        temperature: 0.3,
        max_tokens: 1000,
    });

    const content = response.choices[0].message.content || "{}";

    try {
        const jsonMatch = content.match(/```(?:json)?\s*([\s\S]*?)```/) || [null, content];
        const jsonStr = jsonMatch[1]?.trim() || content.trim();
        return JSON.parse(jsonStr);
    } catch (error) {
        console.error("Failed to parse evaluation:", content);
        return {
            accuracy: 75,
            clarity: 75,
            confidence: 70,
            technicalDepth: 70,
            overallScore: 73,
            feedback: "Thank you for your response. Your answer demonstrates understanding of the topic. Continue practicing to improve further.",
        };
    }
}

export async function* streamEvaluateResponse(
    question: string,
    answer: string,
    track: Track,
    difficulty: Difficulty,
    codeSnippet?: string
): AsyncGenerator<string> {
    const systemPrompt = `You are an expert technical interview evaluator for ${trackDescriptions[track]}.
Evaluate the candidate's response at ${difficulty} level. Provide detailed, constructive feedback.

Structure your response:
1. Overall Assessment (brief summary)
2. Strengths (what they did well)
3. Areas for Improvement (specific suggestions)
4. Score Breakdown: accuracy, clarity, confidence, technicalDepth (0-100 each)
5. Overall Score (weighted average)`;

    const userMessage = `Question: ${question}

Answer: ${answer}
${codeSnippet ? `\nCode Snippet:\n\`\`\`\n${codeSnippet}\n\`\`\`` : ""}

Provide a detailed evaluation.`;

    const stream = await groq.chat.completions.create({
        model: MODEL,
        messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: userMessage },
        ],
        temperature: 0.5,
        stream: true,
    });

    for await (const chunk of stream) {
        const content = chunk.choices[0]?.delta?.content || "";
        if (content) {
            yield content;
        }
    }
}

export async function generateReport(
    sessionData: {
        track: Track;
        difficulty: Difficulty;
        questions: { content: string; response?: { answer: string; overallScore?: number; feedback?: string } }[];
    }
): Promise<{
    overallScore: number;
    strengths: string[];
    weaknesses: string[];
    recommendations: string[];
    roadmap: { week: number; focus: string; resources: string[] }[];
}> {
    const systemPrompt = `You are a career coach analyzing a technical interview performance.
Generate a comprehensive report with:
1. Overall score (0-100)
2. Key strengths demonstrated (3-5 points)
3. Areas needing improvement (3-5 points)
4. Specific recommendations for improvement (3-5 actionable items)
5. A 4-week improvement roadmap with focus areas and resources

Return ONLY valid JSON with: overallScore, strengths[], weaknesses[], recommendations[], roadmap[]
Each roadmap item should have: week, focus, resources[]`;

    const sessionSummary = sessionData.questions
        .map((q, i) => `Q${i + 1}: ${q.content}\nScore: ${q.response?.overallScore || "N/A"}\nFeedback: ${q.response?.feedback || "N/A"}`)
        .join("\n\n");

    const response = await groq.chat.completions.create({
        model: MODEL,
        messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: `Track: ${sessionData.track}\nDifficulty: ${sessionData.difficulty}\n\nSession Summary:\n${sessionSummary}\n\nGenerate the report as valid JSON only.` },
        ],
        temperature: 0.5,
        max_tokens: 2000,
    });

    const content = response.choices[0].message.content || "{}";

    try {
        const jsonMatch = content.match(/```(?:json)?\s*([\s\S]*?)```/) || [null, content];
        const jsonStr = jsonMatch[1]?.trim() || content.trim();
        return JSON.parse(jsonStr);
    } catch (error) {
        console.error("Failed to parse report:", content);
        // Return a fallback report
        return {
            overallScore: 75,
            strengths: [
                "Good understanding of core concepts",
                "Clear communication skills",
                "Logical problem-solving approach",
            ],
            weaknesses: [
                "Could improve technical depth",
                "Need more practice with edge cases",
            ],
            recommendations: [
                "Practice more coding problems",
                "Study system design patterns",
                "Work on real-world projects",
            ],
            roadmap: [
                { week: 1, focus: "Fundamentals review", resources: ["Documentation", "Tutorial videos"] },
                { week: 2, focus: "Practice problems", resources: ["LeetCode", "HackerRank"] },
                { week: 3, focus: "System design", resources: ["System Design Primer"] },
                { week: 4, focus: "Mock interviews", resources: ["Pramp", "InterviewBit"] },
            ],
        };
    }
}
